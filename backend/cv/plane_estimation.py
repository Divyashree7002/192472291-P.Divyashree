"""
SmartSpace AI - Room Plane Estimation & RANSAC Geometry Subsystem (Phase 5)
Projects monocular depth into 3D camera coordinate space and fits structural
room planes (Floor, Ceiling, Walls) using RANSAC.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import logging

logger = logging.getLogger(__name__)


class EstimatedPlane:
    """Represents a fitted structural 3D plane in the room."""

    def __init__(
        self,
        plane_type: str,
        normal: Tuple[float, float, float],
        d_offset: float,
        confidence: float,
        inliers_count: int,
        estimated_distance_m: float,
        orientation_label: str,
    ):
        self.plane_type = plane_type  # 'floor', 'ceiling', 'wall_front', 'wall_left', 'wall_right'
        self.normal = (round(float(normal[0]), 3), round(float(normal[1]), 3), round(float(normal[2]), 3))
        self.d_offset = round(float(d_offset), 3)
        self.confidence = round(float(confidence), 2)
        self.inliers_count = int(inliers_count)
        self.estimated_distance_m = round(float(estimated_distance_m), 2)
        self.orientation_label = orientation_label

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plane_type": self.plane_type,
            "orientation_label": self.orientation_label,
            "normal": {
                "x": self.normal[0],
                "y": self.normal[1],
                "z": self.normal[2],
            },
            "d_offset": self.d_offset,
            "confidence": self.confidence,
            "inliers_count": self.inliers_count,
            "estimated_distance_m": self.estimated_distance_m,
            "equation": f"{self.normal[0]}x + {self.normal[1]}y + {self.normal[2]}z + {self.d_offset} = 0",
        }


class RANSACPlaneFitter:
    """
    Fits 3D planes to a sampled point cloud using RANSAC.
    """

    @classmethod
    def fit_plane_ransac(
        cls,
        points: np.ndarray,
        max_iterations: int = 100,
        distance_threshold: float = 0.05,
    ) -> Tuple[Optional[np.ndarray], float, int]:
        """
        Runs RANSAC on (N, 3) points to find the dominant plane ax + by + cz + d = 0.
        Returns (normal, d_offset, inlier_count).
        """
        num_points = len(points)
        if num_points < 3:
            return None, 0.0, 0

        best_normal = None
        best_d = 0.0
        best_inliers_count = 0

        for _ in range(max_iterations):
            sample_idx = np.random.choice(num_points, 3, replace=False)
            p1, p2, p3 = points[sample_idx]

            v1 = p2 - p1
            v2 = p3 - p1
            normal = np.cross(v1, v2)
            norm_val = np.linalg.norm(normal)

            if norm_val < 1e-6:
                continue

            normal = normal / norm_val
            d = -float(np.dot(normal, p1))

            # Compute perpendicular distances of all points to plane
            distances = np.abs(np.dot(points, normal) + d)
            inliers = int(np.count_nonzero(distances < distance_threshold))

            if inliers > best_inliers_count:
                best_inliers_count = inliers
                best_normal = normal
                best_d = float(d)

        return best_normal, float(best_d), int(best_inliers_count)


class RoomPlaneEstimator:
    """
    Orchestrates 3D point cloud projection and structural room plane segmentation.
    """

    @classmethod
    def estimate_room_planes(
        cls,
        depth_map: np.ndarray,
        metric_scale: float = 5.0,
        camera_height_prior: float = 1.4,
    ) -> List[EstimatedPlane]:
        """
        Projects depth map into 3D points and fits Floor, Ceiling, and Wall planes.
        """
        h, w = depth_map.shape[:2]
        cx, cy = w / 2.0, h / 2.0
        fx = max(w, h) * 1.1
        fy = fx

        # Downsample for fast, robust geometric fitting
        step = max(1, int(min(h, w) / 80))
        y_grid, x_grid = np.mgrid[0:h:step, 0:w:step]
        sampled_depth = depth_map[0:h:step, 0:w:step] * metric_scale

        z_pts = sampled_depth.flatten()
        x_pts = ((x_grid.flatten() - cx) * z_pts) / fx
        y_pts = ((y_grid.flatten() - cy) * z_pts) / fy

        point_cloud = np.column_stack([x_pts, y_pts, z_pts])

        # Filter invalid or zero depth points
        valid_mask = z_pts > 0.1
        point_cloud = point_cloud[valid_mask]
        num_pts = len(point_cloud)

        if num_pts < 50:
            return []

        planes: List[EstimatedPlane] = []

        # 1. Estimate Floor Plane (Bottom 40% of points, vertical position y > 0)
        floor_mask = point_cloud[:, 1] > np.percentile(point_cloud[:, 1], 60)
        floor_pts = point_cloud[floor_mask]
        if len(floor_pts) >= 10:
            norm, d, inliers = RANSACPlaneFitter.fit_plane_ransac(floor_pts, 80, 0.08)
            if norm is not None:
                if norm[1] < 0:
                    norm = -norm
                    d = -d
                conf = min(0.95, 0.70 + (inliers / max(1, len(floor_pts))) * 0.25)
                planes.append(
                    EstimatedPlane(
                        plane_type="floor",
                        normal=(float(norm[0]), float(norm[1]), float(norm[2])),
                        d_offset=float(d),
                        confidence=float(conf),
                        inliers_count=int(inliers),
                        estimated_distance_m=float(abs(d)),
                        orientation_label="Horizontal Ground Surface (Floor)",
                    )
                )

        # 2. Estimate Ceiling Plane (Top 30% of points, vertical position y < 0)
        ceiling_mask = point_cloud[:, 1] < np.percentile(point_cloud[:, 1], 30)
        ceiling_pts = point_cloud[ceiling_mask]
        if len(ceiling_pts) >= 10:
            norm, d, inliers = RANSACPlaneFitter.fit_plane_ransac(ceiling_pts, 80, 0.08)
            if norm is not None:
                if norm[1] > 0:
                    norm = -norm
                    d = -d
                conf = min(0.92, 0.65 + (inliers / max(1, len(ceiling_pts))) * 0.25)
                planes.append(
                    EstimatedPlane(
                        plane_type="ceiling",
                        normal=(float(norm[0]), float(norm[1]), float(norm[2])),
                        d_offset=float(d),
                        confidence=float(conf),
                        inliers_count=int(inliers),
                        estimated_distance_m=float(abs(d)),
                        orientation_label="Overhead Plane (Ceiling)",
                    )
                )

        # 3. Estimate Back / Front Wall (Deepest points in Z)
        wall_mask = point_cloud[:, 2] > np.percentile(point_cloud[:, 2], 65)
        wall_pts = point_cloud[wall_mask]
        if len(wall_pts) >= 10:
            norm, d, inliers = RANSACPlaneFitter.fit_plane_ransac(wall_pts, 80, 0.10)
            if norm is not None:
                if norm[2] > 0:
                    norm = -norm
                    d = -d
                conf = min(0.94, 0.68 + (inliers / max(1, len(wall_pts))) * 0.25)
                planes.append(
                    EstimatedPlane(
                        plane_type="wall_front",
                        normal=(float(norm[0]), float(norm[1]), float(norm[2])),
                        d_offset=float(d),
                        confidence=float(conf),
                        inliers_count=int(inliers),
                        estimated_distance_m=float(abs(d)),
                        orientation_label="Primary Facing Wall (North / Back)",
                    )
                )

        # 4. Estimate Left Wall (X < 0)
        left_mask = point_cloud[:, 0] < np.percentile(point_cloud[:, 0], 25)
        left_pts = point_cloud[left_mask]
        if len(left_pts) >= 10:
            norm, d, inliers = RANSACPlaneFitter.fit_plane_ransac(left_pts, 60, 0.10)
            if norm is not None:
                if norm[0] < 0:
                    norm = -norm
                    d = -d
                planes.append(
                    EstimatedPlane(
                        plane_type="wall_left",
                        normal=(float(norm[0]), float(norm[1]), float(norm[2])),
                        d_offset=float(d),
                        confidence=0.82,
                        inliers_count=int(inliers),
                        estimated_distance_m=float(abs(d)),
                        orientation_label="Lateral Left Boundary (West Wall)",
                    )
                )

        # 5. Estimate Right Wall (X > 0)
        right_mask = point_cloud[:, 0] > np.percentile(point_cloud[:, 0], 75)
        right_pts = point_cloud[right_mask]
        if len(right_pts) >= 10:
            norm, d, inliers = RANSACPlaneFitter.fit_plane_ransac(right_pts, 60, 0.10)
            if norm is not None:
                if norm[0] > 0:
                    norm = -norm
                    d = -d
                planes.append(
                    EstimatedPlane(
                        plane_type="wall_right",
                        normal=(float(norm[0]), float(norm[1]), float(norm[2])),
                        d_offset=float(d),
                        confidence=0.82,
                        inliers_count=int(inliers),
                        estimated_distance_m=float(abs(d)),
                        orientation_label="Lateral Right Boundary (East Wall)",
                    )
                )

        return planes
