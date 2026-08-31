"""
Tests for FastAPI Phase 5 endpoints (/api/health, /api/analyze-room, /api/estimate-depth, /api/reconstruct-room).
"""

import unittest
import numpy as np
import cv2
import io
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app


class TestPhase5API(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Generate valid test jpeg
        img = np.zeros((200, 300, 3), dtype=np.uint8)
        img[:100, :] = [230, 220, 210]
        img[100:, :] = [130, 100, 70]
        _, enc = cv2.imencode(".jpg", img)
        self.valid_jpg_bytes = enc.tobytes()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("phase", data)
        self.assertIn("features", data)

    def test_estimate_depth_endpoint_valid(self):
        files = {"file": ("room_test.jpg", self.valid_jpg_bytes, "image/jpeg")}
        res = self.client.post("/api/estimate-depth", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["depth_available"])
        self.assertTrue(data["depth_visualization"].startswith("data:image/jpeg;base64,"))

    def test_reconstruct_room_endpoint_valid(self):
        files = {"file": ("room_test.jpg", self.valid_jpg_bytes, "image/jpeg")}
        data_form = {"length": 5.2, "width": 3.8, "height": 2.9}
        res = self.client.post("/api/reconstruct-room", files=files, data=data_form)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["depth_available"])
        self.assertTrue(data["scale_estimated"])
        self.assertEqual(data["room"]["length_m"], 5.2)

    def test_analyze_room_endpoint_phase5(self):
        files = {"file": ("room_test.jpg", self.valid_jpg_bytes, "image/jpeg")}
        data_form = {
            "room_type": "living_room",
            "design_style": "contemporary",
            "budget": "600000",
            "length": "5.0",
            "width": "4.0",
            "height": "2.8",
        }
        res = self.client.post("/api/analyze-room", files=files, data=data_form)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertTrue(data["depth_available"])
        self.assertIn("planes", data)
        self.assertIn("depth_visualization", data)
        self.assertIn("objects", data)

    def test_endpoints_reject_empty_file(self):
        files = {"file": ("empty.jpg", b"", "image/jpeg")}
        res = self.client.post("/api/estimate-depth", files=files)
        self.assertEqual(res.status_code, 400)

    def test_endpoints_reject_invalid_extension(self):
        files = {"file": ("notes.txt", b"Hello text", "text/plain")}
        res = self.client.post("/api/estimate-depth", files=files)
        self.assertEqual(res.status_code, 415)


if __name__ == "__main__":
    unittest.main()
