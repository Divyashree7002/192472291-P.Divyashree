"""
Tests for RANSAC 3D plane fitting and room plane estimation.
"""

import unittest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.plane_estimation import RANSACPlaneFitter, RoomPlaneEstimator, EstimatedPlane


class TestPlaneEstimation(unittest.TestCase):
    def test_ransac_synthetic_plane(self):
        # Create synthetic points on plane z = 2.0 (i.e. 0x + 0y + 1z - 2 = 0) with small noise
        x = np.random.uniform(-1, 1, 100)
        y = np.random.uniform(-1, 1, 100)
        z = np.full(100, 2.0) + np.random.normal(0, 0.01, 100)
        pts = np.column_stack([x, y, z])

        normal, d, inliers = RANSACPlaneFitter.fit_plane_ransac(pts, max_iterations=50, distance_threshold=0.05)
        self.assertIsNotNone(normal)
        self.assertGreater(inliers, 80)
        # Normal should align along Z axis
        self.assertGreater(abs(normal[2]), 0.9)

    def test_room_planes_estimation(self):
        # Synthetic depth map
        depth_map = np.linspace(0.1, 0.9, 12000).reshape((100, 120))
        planes = RoomPlaneEstimator.estimate_room_planes(depth_map, metric_scale=5.0)
        self.assertIsInstance(planes, list)
        if len(planes) > 0:
            plane = planes[0]
            self.assertIsInstance(plane, EstimatedPlane)
            d = plane.to_dict()
            self.assertIn("plane_type", d)
            self.assertIn("normal", d)
            self.assertIn("equation", d)


if __name__ == "__main__":
    unittest.main()
