"""
Tests for BaseDetector and YOLODetector object detection schemas and data models.
"""

import unittest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.object_detection import (
    BaseDetector,
    YOLODetector,
    DetectedObject,
    RelevantRoomObjectFilter,
    ROOM_OBJECT_CLASSES,
    IGNORED_CLASSES,
)


class MockDetector(BaseDetector):
    """Mock detector to verify BaseDetector contract."""

    def detect(self, image_bgr: np.ndarray, conf_threshold: float = 0.25):
        h, w = image_bgr.shape[:2]
        return [
            DetectedObject(
                class_name="sofa",
                confidence=0.88,
                x=50,
                y=100,
                width=200,
                height=120,
                category="seating",
            ),
            DetectedObject(
                class_name="table",
                confidence=0.75,
                x=280,
                y=150,
                width=100,
                height=80,
                category="tables",
            ),
        ]


class TestObjectDetection(unittest.TestCase):
    def test_detected_object_model(self):
        obj = DetectedObject(
            class_name="chair",
            confidence=0.924,
            x=10,
            y=20,
            width=50,
            height=60,
            category="seating",
        )
        self.assertEqual(obj.class_name, "chair")
        self.assertEqual(obj.confidence, 0.92)
        self.assertEqual(obj.center_x, 35)
        self.assertEqual(obj.center_y, 50)

        d = obj.to_dict()
        self.assertEqual(d["bbox"]["x"], 10)
        self.assertEqual(d["bbox"]["width"], 50)
        self.assertEqual(d["center"]["x"], 35)

    def test_base_detector_contract(self):
        detector = MockDetector()
        img = np.zeros((300, 400, 3), dtype=np.uint8)
        results = detector.detect(img)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].class_name, "sofa")
        self.assertEqual(results[1].class_name, "table")

    def test_yolo_detector_instantiation(self):
        detector = YOLODetector()
        self.assertIsInstance(detector, BaseDetector)
        # Verify prediction runs without crash on synthetic array
        img = np.zeros((300, 400, 3), dtype=np.uint8)
        results = detector.detect(img)
        self.assertIsInstance(results, list)

    def test_filter_person_and_animals(self):
        """Validates that people and pets are filtered out while furniture is retained."""
        raw_detections = [
            {"class_name": "person", "confidence": 0.95, "x": 10, "y": 10, "width": 40, "height": 100},
            {"class_name": "dog", "confidence": 0.89, "x": 60, "y": 120, "width": 30, "height": 30},
            {"class_name": "sofa", "confidence": 0.92, "x": 100, "y": 100, "width": 180, "height": 80},
            {"class_name": "dining_table", "confidence": 0.85, "x": 300, "y": 120, "width": 120, "height": 70},
        ]
        approved, ignored, summary = RelevantRoomObjectFilter.filter_raw_detections(raw_detections)
        approved_names = [o.class_name for o in approved]

        self.assertIn("sofa", approved_names)
        self.assertIn("dining_table", approved_names)
        self.assertNotIn("person", approved_names)
        self.assertNotIn("dog", approved_names)
        self.assertEqual(len(approved), 2)
        self.assertEqual(summary["people_count"], 1)
        self.assertEqual(summary["animals_count"], 1)

    def test_filter_clothing_and_clutter(self):
        """Validates that clothing and personal belongings are ignored, while bed is retained."""
        raw_detections = [
            {"class_name": "bed", "confidence": 0.94, "x": 50, "y": 50, "width": 200, "height": 160},
            {"class_name": "shirt", "confidence": 0.82, "x": 80, "y": 70, "width": 30, "height": 30},
            {"class_name": "backpack", "confidence": 0.77, "x": 260, "y": 180, "width": 25, "height": 35},
        ]
        approved, ignored, summary = RelevantRoomObjectFilter.filter_raw_detections(raw_detections)
        self.assertEqual(len(approved), 1)
        self.assertEqual(approved[0].class_name, "bed")
        self.assertEqual(summary["clothing_count"], 1)
        self.assertEqual(summary["personal_items_count"], 1)

    def test_filter_only_people_returns_empty_furniture(self):
        """When an image contains only people, zero furniture objects should be created."""
        raw_detections = [
            {"class_name": "person", "confidence": 0.98, "x": 50, "y": 20, "width": 60, "height": 180},
            {"class_name": "human", "confidence": 0.91, "x": 140, "y": 30, "width": 55, "height": 170},
        ]
        approved, ignored, summary = RelevantRoomObjectFilter.filter_raw_detections(raw_detections)
        self.assertEqual(len(approved), 0)
        self.assertEqual(summary["people_count"], 2)


if __name__ == "__main__":
    unittest.main()
