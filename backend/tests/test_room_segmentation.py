"""
Tests for room scene analysis, boundary lines, and color palette extraction.
"""

import unittest
import numpy as np
import cv2
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.room_segmentation import RoomSceneAnalyzer, RoomStructureReport
from cv.object_detection import DetectedObject


class TestRoomSegmentation(unittest.TestCase):
    def setUp(self):
        # Create a synthetic room test image (400x300 BGR)
        self.sample_img = np.zeros((300, 400, 3), dtype=np.uint8)
        self.sample_img[:100, :] = [240, 240, 240]  # Ceiling
        self.sample_img[100:200, :] = [200, 190, 180]  # Wall
        self.sample_img[200:, :] = [120, 90, 70]   # Floor
        # Draw some strong lines
        cv2.line(self.sample_img, (0, 200), (400, 200), (20, 20, 20), 2)
        cv2.line(self.sample_img, (0, 100), (400, 100), (20, 20, 20), 2)

        self.mock_objects = [
            DetectedObject("sofa", 0.9, 50, 180, 200, 90, "seating"),
            DetectedObject("television", 0.85, 120, 80, 100, 60, "electronics"),
        ]

    def test_room_scene_analysis(self):
        report = RoomSceneAnalyzer.analyze_room_scene(self.sample_img, self.mock_objects)
        self.assertIsInstance(report, RoomStructureReport)
        self.assertTrue(report.floor_detected)
        self.assertTrue(report.wall_detected)
        self.assertEqual(len(report.dominant_colors), 4)
        self.assertEqual(report.scene_type, "living_room")
        self.assertIn(report.estimated_clutter_level, ["low", "moderate", "high"])

        d = report.to_dict()
        self.assertTrue(d["is_estimate"])
        self.assertIn("dominant_colors", d)


if __name__ == "__main__":
    unittest.main()
