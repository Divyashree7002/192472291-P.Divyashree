"""
Tests for 3D spatial reconstruction and metric scaling.
"""

import unittest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from cv.depth_estimation import DepthEstimationReport
from cv.object_detection import DetectedObject
from cv.spatial_reconstruction import MetricSpatialReconstructor


class TestSpatialReconstruction(unittest.TestCase):
    def setUp(self):
        depth_map = np.linspace(0.2, 0.8, 12000).reshape((100, 120))
        self.depth_report = DepthEstimationReport(
            depth_map=depth_map,
            colormap_base64="data:image/jpeg;base64,mock",
            min_depth=0.2,
            max_depth=0.8,
            mean_depth=0.5,
            depth_variance=0.04,
        )
        self.detected_objects = [
            DetectedObject("sofa", 0.92, 20, 40, 60, 40, "seating")
        ]

    def test_reconstruct_with_user_priors(self):
        res = MetricSpatialReconstructor.reconstruct_spatial_scene(
            depth_report=self.depth_report,
            detected_objects=self.detected_objects,
            user_dimensions={"length": 6.0, "width": 4.5, "height": 3.0},
        )

        self.assertTrue(res["depth_available"])
        self.assertTrue(res["scale_estimated"])
        self.assertEqual(res["calibration_source"], "user_priors")
        self.assertEqual(res["room"]["length_m"], 6.0)
        self.assertEqual(res["room"]["width_m"], 4.5)
        self.assertEqual(res["room"]["height_m"], 3.0)
        self.assertEqual(res["room"]["floor_area_sqm"], 27.0)

        # Verify 3D spatial fields attached to objects
        obj = res["objects"][0]
        self.assertIn("spatial_3d", obj)
        s3d = obj["spatial_3d"]
        self.assertGreater(s3d["z_m"], 0)
        self.assertGreater(s3d["width_m"], 0)


if __name__ == "__main__":
    unittest.main()
