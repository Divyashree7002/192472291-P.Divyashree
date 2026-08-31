"""
Tests for OpenCV image preprocessing, validation, and quality assessment.
"""

import unittest
import numpy as np
import cv2
import sys
import os

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.preprocessing import ImagePreprocessor, ImageQualityReport


class TestCVPreprocessing(unittest.TestCase):
    def setUp(self):
        # Create a synthetic room test image (400x300 BGR)
        self.sample_img = np.zeros((300, 400, 3), dtype=np.uint8)
        # Add simulated walls, floor, and contrast
        self.sample_img[:180, :] = [220, 210, 200]  # Light warm wall
        self.sample_img[180:, :] = [140, 110, 80]   # Dark wood floor
        # Draw a simulated object rectangle
        cv2.rectangle(self.sample_img, (100, 120), (250, 240), (60, 50, 40), -1)

        # Encode to JPEG bytes
        _, encoded = cv2.imencode(".jpg", self.sample_img)
        self.sample_jpg_bytes = encoded.tobytes()

    def test_decode_and_validate_valid_image(self):
        decoded = ImagePreprocessor.decode_and_validate(self.sample_jpg_bytes)
        self.assertIsInstance(decoded, np.ndarray)
        self.assertEqual(decoded.shape[0], 300)
        self.assertEqual(decoded.shape[1], 400)

    def test_decode_and_validate_empty_bytes_raises(self):
        with self.assertRaises(ValueError):
            ImagePreprocessor.decode_and_validate(b"")

    def test_decode_and_validate_corrupt_bytes_raises(self):
        with self.assertRaises(ValueError):
            ImagePreprocessor.decode_and_validate(b"not-a-valid-image-stream-12345")

    def test_decode_and_validate_undersized_image_raises(self):
        tiny_img = np.zeros((32, 32, 3), dtype=np.uint8)
        _, enc = cv2.imencode(".jpg", tiny_img)
        with self.assertRaises(ValueError):
            ImagePreprocessor.decode_and_validate(enc.tobytes())

    def test_assess_quality_metrics(self):
        report = ImagePreprocessor.assess_quality(self.sample_img)
        self.assertIsInstance(report, ImageQualityReport)
        self.assertEqual(report.width, 400)
        self.assertEqual(report.height, 300)
        self.assertGreater(report.brightness, 0)
        self.assertGreater(report.contrast, 0)
        self.assertIn(report.quality_rating, ["good", "fair", "poor"])
        d = report.to_dict()
        self.assertIn("sharpness", d)
        self.assertIn("aspect_ratio", d)

    def test_resize_preserving_aspect(self):
        large_img = np.zeros((1600, 2400, 3), dtype=np.uint8)
        resized, scale = ImagePreprocessor.resize_preserving_aspect(large_img, max_dim=1200)
        self.assertEqual(resized.shape[1], 1200)
        self.assertEqual(resized.shape[0], 800)
        self.assertAlmostEqual(scale, 0.5, places=2)


if __name__ == "__main__":
    unittest.main()
