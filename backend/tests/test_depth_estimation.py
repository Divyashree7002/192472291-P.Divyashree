"""
Tests for Monocular Depth Estimation and colormap generation.
"""

import unittest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.depth_estimation import MonocularDepthEstimator, DepthEstimationReport


class TestDepthEstimation(unittest.TestCase):
    def setUp(self):
        self.estimator = MonocularDepthEstimator()
        self.sample_img = np.zeros((300, 400, 3), dtype=np.uint8)
        self.sample_img[:120, :] = [220, 210, 200]
        self.sample_img[120:, :] = [140, 110, 80]

    def test_depth_estimation_output_schema(self):
        report = self.estimator.estimate_depth(self.sample_img)
        self.assertIsInstance(report, DepthEstimationReport)
        self.assertEqual(report.depth_map.shape, (300, 400))
        self.assertTrue(report.colormap_base64.startswith("data:image/jpeg;base64,"))
        self.assertGreaterEqual(report.min_depth, 0.0)
        self.assertLessEqual(report.max_depth, 1.0)
        self.assertGreater(report.max_depth, report.min_depth)

        d = report.to_dict()
        self.assertTrue(d["depth_available"])
        self.assertEqual(d["resolution"]["width"], 400)
        self.assertEqual(d["resolution"]["height"], 300)


if __name__ == "__main__":
    unittest.main()
