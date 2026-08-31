"""
Tests for AI Interior Design Recommendation Engine (Phase 6).
Covers catalog queries, constraint validation, budget optimization, scoring, and explainability.
"""

import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from recommendation.catalog import FurnitureCatalog, FurnitureCatalogItem
from recommendation.constraints import SpatialConstraintValidator
from recommendation.scoring import MultiCriteriaScorer
from recommendation.optimizer import BudgetOptimizer
from recommendation.explainability import ExplainabilityGenerator
from recommendation.engine import RecommendationEngine
from main import app


class TestRecommendationEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_catalog_filtering(self):
        # Filter living room modern items
        items = FurnitureCatalog.filter_items(room_type="living_room", style="modern")
        self.assertGreater(len(items), 0)
        for item in items:
            self.assertIsInstance(item, FurnitureCatalogItem)
            self.assertGreater(item.price_inr, 0)
            self.assertGreater(item.length_m, 0)
            self.assertGreater(item.width_m, 0)

    def test_spatial_constraint_validator(self):
        items = FurnitureCatalog.filter_items(room_type="living_room")[:3]
        results = SpatialConstraintValidator.validate_plan(
            items=items,
            room_length_m=5.0,
            room_width_m=4.0,
            ceiling_height_m=2.8,
            budget_limit_inr=500000,
        )
        self.assertGreaterEqual(len(results), 4)
        rule_names = [r.rule_name for r in results]
        self.assertIn("Pathway Circulation Clearance", rule_names)
        self.assertIn("Floor Area Occupancy & Density", rule_names)
        self.assertIn("Budget Ceiling Compliance", rule_names)

    def test_budget_optimizer_within_cap(self):
        items, total_cost, util = BudgetOptimizer.select_optimal_set(
            room_type="living_room",
            design_style="scandinavian",
            budget_inr=400000,
            room_length_m=5.0,
            room_width_m=4.0,
        )
        self.assertGreater(len(items), 0)
        self.assertLessEqual(total_cost, 420000)  # within 5% tolerance
        self.assertGreater(util, 10.0)

    def test_multi_criteria_scorer_range(self):
        items = FurnitureCatalog.filter_items(room_type="living_room")[:3]
        constraints = SpatialConstraintValidator.validate_plan(
            items=items,
            room_length_m=5.0,
            room_width_m=4.0,
            ceiling_height_m=2.8,
            budget_limit_inr=500000,
        )
        scores = MultiCriteriaScorer.calculate_scores(
            items=items,
            preferred_style="scandinavian",
            room_length_m=5.0,
            room_width_m=4.0,
            budget_limit_inr=500000,
            constraints=constraints,
        )
        self.assertGreaterEqual(scores.overall_score, 0)
        self.assertLessEqual(scores.overall_score, 100)
        self.assertGreaterEqual(scores.space_compatibility, 0)
        self.assertGreaterEqual(scores.style_compatibility, 0)

    def test_explainability_generator(self):
        items = FurnitureCatalog.filter_items(room_type="living_room")[:3]
        constraints = SpatialConstraintValidator.validate_plan(
            items=items,
            room_length_m=5.0,
            room_width_m=4.0,
            ceiling_height_m=2.8,
            budget_limit_inr=500000,
        )
        explain = ExplainabilityGenerator.generate_explanation(
            items=items,
            design_style="modern",
            room_type="living_room",
            room_length_m=5.0,
            room_width_m=4.0,
            ceiling_height_m=2.8,
            budget_limit_inr=500000,
            total_cost_inr=250000,
            constraints=constraints,
        )
        self.assertTrue(len(explain.primary_rationale) > 20)
        self.assertGreaterEqual(len(explain.spatial_reasoning), 2)
        self.assertIn("₹", explain.budget_optimization_note)

    def test_recommendation_engine_generates_3_plans(self):
        plans = RecommendationEngine.generate_recommendations(
            room_type="living_room",
            design_style="modern",
            budget_inr=500000,
            length_m=5.0,
            width_m=4.0,
            height_m=2.8,
        )
        self.assertEqual(len(plans), 3)
        p = plans[0]
        self.assertEqual(p["currency"], "INR")
        self.assertGreater(p["matchScore"], 50)
        self.assertGreater(len(p["items"]), 0)
        self.assertFalse(p["isPlaceholder"])

    def test_api_recommendations_endpoint(self):
        payload = {
            "room_type": "living_room",
            "design_style": "minimalist",
            "budget": 450000,
            "length": 4.8,
            "width": 3.6,
            "height": 2.8,
        }
        res = self.client.post("/api/recommendations", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["count"], 3)
        self.assertEqual(data["currency"], "INR")

    def test_api_design_plan_endpoint(self):
        payload = {
            "room_type": "bedroom",
            "design_style": "contemporary",
            "budget": 600000,
            "length": 4.5,
            "width": 4.0,
            "height": 2.9,
        }
        res = self.client.post("/api/design-plan", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("room_summary", data)
        self.assertIn("plan", data)


if __name__ == "__main__":
    unittest.main()
