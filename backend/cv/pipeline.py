"""
SmartSpace AI - Computer Vision & Spatial Reconstruction Pipeline Orchestrator (Phase 5)
Integrates image validation, quality metrics, YOLO/OpenCV object detection,
monocular depth estimation, RANSAC plane fitting, and 3D spatial reconstruction.
"""

from typing import Dict, Any, Optional
import time
import logging
from .preprocessing import ImagePreprocessor
from .object_detection import BaseDetector, YOLODetector
from .room_segmentation import RoomSceneAnalyzer
from .depth_estimation import BaseDepthEstimator, MonocularDepthEstimator
from .spatial_reconstruction import MetricSpatialReconstructor

logger = logging.getLogger(__name__)


class RoomCVPipeline:
    """
    Unified Computer Vision and Spatial Reconstruction Pipeline.
    """

    def __init__(
        self,
        detector: Optional[BaseDetector] = None,
        depth_estimator: Optional[BaseDepthEstimator] = None,
    ):
        self.preprocessor = ImagePreprocessor()
        self.detector = detector if detector is not None else YOLODetector()
        self.analyzer = RoomSceneAnalyzer()
        self.depth_estimator = (
            depth_estimator if depth_estimator is not None else MonocularDepthEstimator()
        )

    def process_image(
        self,
        image_bytes: bytes,
        filename: str = "room_capture.jpg",
        content_type: str = "image/jpeg",
        room_type: str = "living_room",
        design_style: str = "modern",
        budget: int = 500000,
        dimensions: Optional[Dict[str, Optional[float]]] = None,
        conf_threshold: float = 0.25,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end Computer Vision & Spatial Reconstruction pipeline.
        """
        start_time = time.time()

        # Step 1: Decode & validate image
        image_bgr = self.preprocessor.decode_and_validate(image_bytes)

        # Step 2: Assess image quality metrics
        quality_report = self.preprocessor.assess_quality(image_bgr)

        # Step 3: Run object detection
        detected_objects = self.detector.detect(
            image_bgr, conf_threshold=conf_threshold
        )

        # Step 4: Run room scene analysis & structural heuristics
        room_report = self.analyzer.analyze_room_scene(image_bgr, detected_objects)

        # Step 5: Run Monocular Depth Estimation
        depth_report = self.depth_estimator.estimate_depth(image_bgr)

        # Step 6: 3D Plane Fitting (RANSAC) & Spatial Metric Reconstruction
        spatial_data = MetricSpatialReconstructor.reconstruct_spatial_scene(
            depth_report=depth_report,
            detected_objects=detected_objects,
            user_dimensions=dimensions,
            image_shape=image_bgr.shape,
        )

        ignored_objects = getattr(self.detector, "last_ignored_objects", [])
        ignored_summary = getattr(self.detector, "last_ignored_summary", {
            "total_ignored": len(ignored_objects),
            "people_count": 0,
            "animals_count": 0,
            "clothing_count": 0,
            "personal_items_count": 0,
            "descriptions": [],
        })

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Step 7: Generate AI Room Insights based on spatial geometry
        doors_count = len([o for o in spatial_data["objects"] if o.get("class_name") in ("door",)])
        windows_count = len([o for o in spatial_data["objects"] if o.get("class_name") in ("window",)])
        seating_count = len([o for o in spatial_data["objects"] if o.get("category") == "seating"])

        insights = []
        if windows_count > 0:
            insights.append("The room receives natural light from the detected window(s).")
        if seating_count > 0 and doors_count > 0:
            insights.append("Your seating is positioned relatively close to the entrance doorway pathway.")
        elif seating_count > 0:
            insights.append("Seating arrangement occupies the central floor area.")
        
        insights.append("There is potential wall storage space available along the un-blocked perimeter.")
        if spatial_data["room"]["floor_area_sqm"] < 14:
            insights.append("The current arrangement leaves tight walking clearance; compact multi-functional furniture is recommended.")
        else:
            insights.append("Ample floor area is available for open circulation pathways.")

        # Merge results into cohesive JSON structure
        return {
            "success": True,
            "filename": filename,
            "content_type": content_type,
            "message": "Spatial reconstruction & Computer Vision completed successfully",
            "cv_status": "completed",
            "inference_time_ms": elapsed_ms,
            "image_quality": quality_report.to_dict(),
            "objects": spatial_data["objects"],
            "ignored_objects": ignored_objects,
            "ignored_summary": ignored_summary,
            "furniture_detected_count": len(spatial_data["objects"]),
            "doors_count": doors_count,
            "windows_count": windows_count,
            "ai_room_insights": insights,
            "room_structure": room_report.to_dict(),
            "room": {
                **room_report.to_dict(),
                **spatial_data["room"],
            },
            "planes": spatial_data["planes"],
            "depth_available": spatial_data["depth_available"],
            "depth_visualization": spatial_data["depth_visualization"],
            "scale_estimated": spatial_data["scale_estimated"],
            "scale_confidence": spatial_data["scale_confidence"],
            "calibration_source": spatial_data["calibration_source"],
            "room_type": room_type,
            "design_style": design_style,
            "budget": budget,
            "currency": "INR",
            "dimensions": dimensions or {},
            "phase": "Phase 5 - Metric Depth & Spatial Reconstruction",
        }

    def estimate_depth_only(self, image_bytes: bytes) -> Dict[str, Any]:
        """Runs dedicated depth estimation on uploaded image."""
        image_bgr = self.preprocessor.decode_and_validate(image_bytes)
        depth_report = self.depth_estimator.estimate_depth(image_bgr)
        return depth_report.to_dict()

    def reconstruct_room_only(
        self,
        image_bytes: bytes,
        dimensions: Optional[Dict[str, Optional[float]]] = None,
        conf_threshold: float = 0.25,
    ) -> Dict[str, Any]:
        """Runs dedicated 3D spatial reconstruction with plane fitting."""
        image_bgr = self.preprocessor.decode_and_validate(image_bytes)
        detected_objects = self.detector.detect(image_bgr, conf_threshold=conf_threshold)
        depth_report = self.depth_estimator.estimate_depth(image_bgr)
        return MetricSpatialReconstructor.reconstruct_spatial_scene(
            depth_report=depth_report,
            detected_objects=detected_objects,
            user_dimensions=dimensions,
            image_shape=image_bgr.shape,
        )
