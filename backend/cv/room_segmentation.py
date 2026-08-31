"""
SmartSpace AI - Room Scene Analysis & Plane Segmentation (Phase 4)
Uses computer vision techniques to estimate floor, wall, ceiling presence, dominant boundary lines, and palette.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import cv2
from .object_detection import DetectedObject


class RoomStructureReport:
    """Encapsulates spatial scene analysis and boundary estimation."""

    def __init__(
        self,
        floor_detected: bool,
        wall_detected: bool,
        ceiling_detected: bool,
        dominant_colors: List[str],
        scene_type: str,
        estimated_clutter_level: str,
        boundary_lines_count: int,
        floor_area_ratio: float,
        detected_furniture_count: int,
        dominant_wall_color: str = "#F4EFEA",
        dominant_floor_color: str = "#C8B6A6",
    ):
        self.floor_detected = floor_detected
        self.wall_detected = wall_detected
        self.ceiling_detected = ceiling_detected
        self.dominant_colors = dominant_colors
        self.scene_type = scene_type
        self.estimated_clutter_level = estimated_clutter_level
        self.boundary_lines_count = boundary_lines_count
        self.floor_area_ratio = round(floor_area_ratio, 2)
        self.detected_furniture_count = detected_furniture_count
        self.dominant_wall_color = dominant_wall_color
        self.dominant_floor_color = dominant_floor_color

    def to_dict(self) -> Dict[str, Any]:
        return {
            "floor_detected": self.floor_detected,
            "wall_detected": self.wall_detected,
            "ceiling_detected": self.ceiling_detected,
            "dominant_colors": self.dominant_colors,
            "dominant_wall_color": self.dominant_wall_color,
            "dominant_floor_color": self.dominant_floor_color,
            "scene_type": self.scene_type,
            "estimated_clutter_level": self.estimated_clutter_level,
            "boundary_lines_count": self.boundary_lines_count,
            "estimated_floor_coverage": f"{int(self.floor_area_ratio * 100)}%",
            "detected_furniture_count": self.detected_furniture_count,
            "is_estimate": True,
            "note": "Plane segmentations and dominant surface tones are computer vision extractions from the scanned frame.",
        }


class RoomSceneAnalyzer:
    """
    Performs spatial heuristics, Hough boundary extraction, and color clustering on room frames.
    """

    @classmethod
    def analyze_room_scene(
        cls, image_bgr: np.ndarray, detected_objects: List[DetectedObject]
    ) -> RoomStructureReport:
        h, w = image_bgr.shape[:2]
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Structural edge & line segment analysis (Hough Transform)
        edges = cv2.Canny(gray, 40, 120)
        lines = cv2.HoughLinesP(
            edges,
            rho=1,
            theta=np.pi / 180,
            threshold=50,
            minLineLength=int(min(h, w) * 0.15),
            maxLineGap=20,
        )

        boundary_lines_count = len(lines) if lines is not None else 0

        # 2. Floor, Wall, Ceiling Presence Heuristics
        lower_region = gray[int(h * 0.65) :, :]
        mid_region = gray[int(h * 0.25) : int(h * 0.70) :, :]
        upper_region = gray[: int(h * 0.25), :]

        floor_detected = bool(lower_region.size > 0 and np.std(lower_region) > 5)
        wall_detected = bool(mid_region.size > 0 and np.std(mid_region) > 8)
        ceiling_detected = bool(upper_region.size > 0 and np.mean(upper_region) > 30)

        # 3. Extract dominant colors across the scene, wall region, and floor region
        dominant_colors = cls._extract_dominant_palette(image_bgr, num_colors=4)

        # Specific wall surface palette (mid region)
        wall_sub = image_bgr[int(h * 0.25) : int(h * 0.65), :]
        wall_colors = cls._extract_dominant_palette(wall_sub, num_colors=1) if wall_sub.size > 0 else ["#F4EFEA"]
        dominant_wall_color = wall_colors[0] if wall_colors else "#F4EFEA"

        # Specific floor surface palette (lower region)
        floor_sub = image_bgr[int(h * 0.70) :, :]
        floor_colors = cls._extract_dominant_palette(floor_sub, num_colors=1) if floor_sub.size > 0 else ["#C8B6A6"]
        dominant_floor_color = floor_colors[0] if floor_colors else "#C8B6A6"

        # 4. Scene classification based on detected furniture composition
        scene_type = cls._classify_scene(detected_objects)

        # 5. Clutter Level Estimation based on edge density and object bounding boxes
        edge_density = float(np.count_nonzero(edges)) / float(h * w) if (h * w) > 0 else 0
        obj_count = len(detected_objects)

        if obj_count >= 5 or edge_density > 0.08:
            clutter_level = "high"
        elif obj_count >= 2 or edge_density > 0.04:
            clutter_level = "moderate"
        else:
            clutter_level = "low"

        # 6. Approximate floor area coverage by bounding boxes
        total_bbox_area = sum(obj.width * obj.height for obj in detected_objects)
        floor_area_ratio = min(1.0, float(total_bbox_area) / float(h * w * 0.6)) if (h * w) > 0 else 0.0

        return RoomStructureReport(
            floor_detected=floor_detected,
            wall_detected=wall_detected,
            ceiling_detected=ceiling_detected,
            dominant_colors=dominant_colors,
            scene_type=scene_type,
            estimated_clutter_level=clutter_level,
            boundary_lines_count=boundary_lines_count,
            floor_area_ratio=floor_area_ratio,
            detected_furniture_count=obj_count,
            dominant_wall_color=dominant_wall_color,
            dominant_floor_color=dominant_floor_color,
        )

    @classmethod
    def _extract_dominant_palette(
        cls, image_bgr: np.ndarray, num_colors: int = 4
    ) -> List[str]:
        """
        Uses OpenCV K-Means clustering to extract dominant RGB palette in HEX format.
        """
        try:
            # Resize thumbnail to 80x80 for fast clustering
            thumb = cv2.resize(image_bgr, (80, 80), interpolation=cv2.INTER_AREA)
            rgb_thumb = cv2.cvtColor(thumb, cv2.COLOR_BGR2RGB)
            pixels = np.float32(rgb_thumb.reshape(-1, 3))

            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
            flags = cv2.KMEANS_RANDOM_CENTERS

            _, _, centers = cv2.kmeans(
                pixels, num_colors, None, criteria, 5, flags
            )

            hex_colors = []
            for center in centers:
                r, g, b = [max(0, min(255, int(c))) for c in center]
                hex_colors.append(f"#{r:02X}{g:02X}{b:02X}")

            return hex_colors
        except Exception:
            return ["#F4EFEA", "#D39E82", "#3D3730", "#8A9A86"]

    @classmethod
    def _classify_scene(cls, detected_objects: List[DetectedObject]) -> str:
        """Classifies the room scene archetype based on detected indoor objects."""
        classes = {obj.class_name.lower() for obj in detected_objects}

        if "bed" in classes:
            return "bedroom"
        if "dining_table" in classes or "oven" in classes or "refrigerator" in classes:
            return "dining_or_kitchen"
        if "desk" in classes or "laptop" in classes:
            return "home_office_study"
        if "sofa" in classes or "television" in classes or "chair" in classes:
            return "living_room"

        return "interior_living_space"
