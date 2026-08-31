"""
Tests for the complete RoomCVPipeline orchestrator.
"""

import unittest
import numpy as np
import cv2
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.pipeline import RoomCVPipeline


class TestPipeline(unittest.TestCase):
    def setUp(self):
        # Create a test room image
        self.sample_img = np.zeros((300, 400, 3), dtype=np.uint8)
        self.sample_img[:120, :] = [210, 200, 190]
        self.sample_img[120:, :] = [130, 100, 75]
        cv2.rectangle(self.sample_img, (80, 140), (220, 260), (50, 40, 30), -1)

        _, encoded = cv2.imencode(".jpg", self.sample_img)
        self.sample_bytes = encoded.tobytes()
        self.pipeline = RoomCVPipeline()

    def test_pipeline_end_to_end(self):
        result = self.pipeline.process_image(
            image_bytes=self.sample_bytes,
            filename="test_living_room.jpg",
            room_type="living_room",
            design_style="scandinavian",
            budget=450000,
            dimensions={"length": 5.0, "width": 4.0, "height": 2.8},
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["cv_status"], "completed")
        self.assertIn("image_quality", result)
        self.assertIn("objects", result)
        self.assertIn("room", result)
        self.assertEqual(result["budget"], 450000)
        self.assertEqual(result["currency"], "INR")
        self.assertIn("Phase 5", result["phase"])
        self.assertTrue(result["depth_available"])
        self.assertIn("planes", result)


if __name__ == "__main__":
    unittest.main()
