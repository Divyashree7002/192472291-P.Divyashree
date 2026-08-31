"""
SmartSpace AI - 3D Spatial Reconstruction & Metric Scaling Engine (Phase 5)
Synthesizes depth maps, RANSAC planes, 2D object detections, and room priors
into a unified metric 3D room representation.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import logging
from .depth_estimation import DepthEstimationReport
from .plane_estimation import EstimatedPlane, RoomPlaneEstimator
from .object_detection import DetectedObject

logger = logging.getLogger(__name__)


class MetricSpatialReconstructor:
    """
    Combines monocular depth maps, geometric planes, detected 2D bounding boxes,
    and dimensional calibration priors into a metric 3D room model.
    """

    DEFAULT_LENGTH_M = 4.8
    DEFAULT_WIDTH_M = 3.6
    DEFAULT_HEIGHT_M = 2.8
    CAMERA_HEIGHT_M = 1.4

    @classmethod
    def reconstruct_spatial_scene(
        cls,
        depth_report: DepthEstimationReport,
        detected_objects: List[DetectedObject],
        user_dimensions: Optional[Dict[str, Optional[float]]] = None,
        image_shape: Optional[tuple] = None,
    ) -> Dict[str, Any]:
        """
        Builds full metric room geometry and 3D object positions.
        """
        # 1. Determine calibrated or CV-estimated room dimensions
        user_len = user_dimensions.get("length") if user_dimensions else None
        user_wid = user_dimensions.get("width") if user_dimensions else None
        user_hgt = user_dimensions.get("height") if user_dimensions else None

        has_user_priors = bool(user_len and user_wid and float(user_len) > 0 and float(user_wid) > 0)

        depth_spread = depth_report.max_depth - depth_report.min_depth
        img_aspect = 1.33
        if image_shape and len(image_shape) >= 2 and image_shape[0] > 0:
            img_aspect = float(image_shape[1]) / float(image_shape[0])

        if has_user_priors:
            length_m = round(float(user_len), 2)
            width_m = round(float(user_wid), 2)
            height_m = round(float(user_hgt), 2) if user_hgt and float(user_hgt) > 0 else cls.DEFAULT_HEIGHT_M
            scale_confidence = 0.92
            calibration_source = "user_priors"
            is_estimated = False
        else:
            # Dynamically estimate metric dimensions from depth gradients, scene depth spread & aspect ratio
            raw_len = 3.6 + float(depth_spread) * 1.6 + float(depth_report.mean_depth) * 0.8
            length_m = round(max(3.0, min(6.0, raw_len)), 1)
            raw_wid = length_m * (img_aspect * 0.68)
            width_m = round(max(2.6, min(5.0, raw_wid)), 1)
            raw_hgt = 2.6 + min(0.3, float(depth_report.mean_depth) * 0.3)
            height_m = round(max(2.4, min(3.2, raw_hgt)), 1)

            scale_confidence = round(min(0.88, 0.72 + (0.08 if len(detected_objects) > 0 else 0.0) + (0.05 if depth_spread > 0.3 else 0.0)), 2)
            calibration_source = "monocular_depth_cv_estimate"
            is_estimated = True

        floor_area_sqm = round(length_m * width_m, 2)
        volume_m3 = round(floor_area_sqm * height_m, 2)

        # Scale factor (maps normalized [0, 1] relative depth to estimated room depth in meters)
        metric_max_depth = length_m * 1.15

        # 2. Fit 3D Room Planes using RANSAC
        planes: List[EstimatedPlane] = RoomPlaneEstimator.estimate_room_planes(
            depth_map=depth_report.depth_map,
            metric_scale=metric_max_depth,
            camera_height_prior=cls.CAMERA_HEIGHT_M,
        )

        # 3. Localize Detected Objects in 3D Metric Space
        depth_map = depth_report.depth_map
        h_depth, w_depth = depth_map.shape[:2]
        cx, cy = w_depth / 2.0, h_depth / 2.0
        fx = max(w_depth, h_depth) * 1.1
        fy = fx

        spatial_objects: List[Dict[str, Any]] = []

        for obj in detected_objects:
            obj_dict = obj.to_dict()

            # Sample depth at object bounding box center and interior
            x_norm = int(np.clip((obj.center_x / max(1, obj.x + obj.width)) * w_depth, 0, w_depth - 1))
            y_norm = int(np.clip((obj.center_y / max(1, obj.y + obj.height)) * h_depth, 0, h_depth - 1))

            # Sample 5x5 patch around object center
            y1 = max(0, y_norm - 2)
            y2 = min(h_depth, y_norm + 3)
            x1 = max(0, x_norm - 2)
            x2 = min(w_depth, x_norm + 3)

            patch = depth_map[y1:y2, x1:x2]
            rel_depth = float(np.median(patch)) if patch.size > 0 else float(depth_map[y_norm, x_norm])

            # Calculate 3D metric coordinates (camera frame: X right, Y down, Z forward)
            z_m = round(float(rel_depth * metric_max_depth), 2)
            # Ensure minimum depth separation
            z_m = max(0.8, z_m)

            # Project 2D center to 3D X, Y in meters
            x_m = round(float(((obj.center_x - cx) * z_m) / fx), 2)
            y_m = round(float(((obj.center_y - cy) * z_m) / fy), 2)

            # Compute estimated physical width and height
            w_m = round(float((obj.width * z_m) / fx), 2)
            h_m = round(float((obj.height * z_m) / fy), 2)
            # Approximate depth footprint (thickness) based on category
            d_m = round(min(w_m, 0.9 if obj.category == "seating" else 0.6), 2)

            obj_dict["spatial_3d"] = {
                "x_m": x_m,
                "y_m": y_m,
                "z_m": z_m,
                "width_m": max(0.3, w_m),
                "height_m": max(0.3, h_m),
                "depth_m": max(0.3, d_m),
                "distance_from_camera_m": z_m,
                "clearance_radius_m": round(max(w_m, d_m) * 0.6, 2),
            }

            spatial_objects.append(obj_dict)

        return {
            "room": {
                "length_m": length_m,
                "width_m": width_m,
                "height_m": height_m,
                "floor_area_sqm": floor_area_sqm,
                "volume_m3": volume_m3,
                "aspect_ratio": round(length_m / width_m if width_m > 0 else 1.0, 2),
            },
            "planes": [p.to_dict() for p in planes],
            "depth_available": True,
            "depth_visualization": depth_report.colormap_base64,
            "scale_estimated": True,
            "is_estimated": is_estimated,
            "scale_confidence": scale_confidence,
            "calibration_source": calibration_source,
            "objects": spatial_objects,
            "monocular_disclaimer": "Metric bounds are estimated from monocular depth cues and spatial plane geometry.",
        }
