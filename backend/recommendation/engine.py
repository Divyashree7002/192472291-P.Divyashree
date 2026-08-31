"""
SmartSpace AI - Interior Design Recommendation Engine Orchestrator (Phase 6)
Synthesizes candidate layouts, constraint evaluations, multi-criteria scores,
and Explainable AI rationales into structured design plans.
"""

from typing import List, Dict, Any, Optional
import uuid
import datetime
from .catalog import FurnitureCatalog, FurnitureCatalogItem
from .constraints import SpatialConstraintValidator, ConstraintValidationResult
from .scoring import MultiCriteriaScorer, RecommendationScores
from .optimizer import BudgetOptimizer
from .explainability import ExplainabilityGenerator, DesignExplainability


class RecommendationPlan:
    """Represents a complete, validated interior design proposal."""

    def __init__(
        self,
        id: str,
        title: str,
        design_style: str,
        room_type: str,
        match_score: int,
        scores: RecommendationScores,
        estimated_cost_inr: int,
        items: List[FurnitureCatalogItem],
        constraints: List[ConstraintValidationResult],
        explainability: DesignExplainability,
    ):
        self.id = id
        self.title = title
        self.design_style = design_style
        self.room_type = room_type
        self.match_score = match_score
        self.scores = scores
        self.estimated_cost_inr = estimated_cost_inr
        self.items = items
        self.constraints = constraints
        self.explainability = explainability
        self.created_at = datetime.datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "designStyle": self.design_style,
            "roomType": self.room_type,
            "matchScore": self.match_score,
            "scores": self.scores.to_dict(),
            "estimatedCost": self.estimated_cost_inr,
            "currency": "INR",
            "createdAt": self.created_at,
            "isPlaceholder": False,
            "constraints": [c.to_dict() for c in self.constraints],
            "items": [item.to_dict() for item in self.items],
            "explainability": self.explainability.to_dict(),
        }


class RecommendationEngine:
    """
    Main recommendation engine generating personalized, spatially-validated interior design proposals.
    """

    @classmethod
    def generate_recommendations(
        cls,
        room_type: str = "living_room",
        design_style: str = "modern",
        budget_inr: int = 500000,
        length_m: float = 4.8,
        width_m: float = 3.6,
        height_m: float = 2.8,
        existing_objects: Optional[List[Dict[str, Any]]] = None,
        planes: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generates 3 multi-criteria layout variations matching the spatial and budget constraints.
        """
        style_clean = design_style.lower()
        room_clean = room_type.lower()
        budget_val = max(50000, int(budget_inr))
        len_val = max(2.0, float(length_m))
        wid_val = max(2.0, float(width_m))
        hgt_val = max(2.0, float(height_m))

        plans: List[RecommendationPlan] = []

        # Variant 1: Primary Spatial Flow Concept (Balanced, optimal score)
        items_1, cost_1, util_1 = BudgetOptimizer.select_optimal_set(
            room_type=room_clean,
            design_style=style_clean,
            budget_inr=budget_val,
            room_length_m=len_val,
            room_width_m=wid_val,
            variant_bias="balanced",
        )
        constraints_1 = SpatialConstraintValidator.validate_plan(
            items=items_1,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            existing_objects=existing_objects,
        )
        scores_1 = MultiCriteriaScorer.calculate_scores(
            items=items_1,
            preferred_style=style_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            budget_limit_inr=budget_val,
            constraints=constraints_1,
        )
        explain_1 = ExplainabilityGenerator.generate_explanation(
            items=items_1,
            design_style=style_clean,
            room_type=room_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            total_cost_inr=cost_1,
            constraints=constraints_1,
        )
        plans.append(
            RecommendationPlan(
                id=f"plan-{uuid.uuid4().hex[:8]}",
                title=f"Warm {style_clean.replace('_', ' ').title()} Spatial Flow Concept",
                design_style=style_clean,
                room_type=room_clean,
                match_score=scores_1.overall_score,
                scores=scores_1,
                estimated_cost_inr=cost_1,
                items=items_1,
                constraints=constraints_1,
                explainability=explain_1,
            )
        )

        # Variant 2: Minimalist High-Circulation Concept (Spacious)
        items_2, cost_2, util_2 = BudgetOptimizer.select_optimal_set(
            room_type=room_clean,
            design_style=style_clean,
            budget_inr=int(budget_val * 0.85),
            room_length_m=len_val,
            room_width_m=wid_val,
            variant_bias="minimalist",
        )
        constraints_2 = SpatialConstraintValidator.validate_plan(
            items=items_2,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            existing_objects=existing_objects,
        )
        scores_2 = MultiCriteriaScorer.calculate_scores(
            items=items_2,
            preferred_style=style_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            budget_limit_inr=budget_val,
            constraints=constraints_2,
        )
        explain_2 = ExplainabilityGenerator.generate_explanation(
            items=items_2,
            design_style=style_clean,
            room_type=room_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            total_cost_inr=cost_2,
            constraints=constraints_2,
        )
        plans.append(
            RecommendationPlan(
                id=f"plan-{uuid.uuid4().hex[:8]}",
                title=f"Airy {style_clean.replace('_', ' ').title()} Open Circulation Layout",
                design_style=style_clean,
                room_type=room_clean,
                match_score=scores_2.overall_score,
                scores=scores_2,
                estimated_cost_inr=cost_2,
                items=items_2,
                constraints=constraints_2,
                explainability=explain_2,
            )
        )

        # Variant 3: Architectural Comfort-First Layout
        items_3, cost_3, util_3 = BudgetOptimizer.select_optimal_set(
            room_type=room_clean,
            design_style=style_clean,
            budget_inr=budget_val,
            room_length_m=len_val,
            room_width_m=wid_val,
            variant_bias="luxury",
        )
        constraints_3 = SpatialConstraintValidator.validate_plan(
            items=items_3,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            existing_objects=existing_objects,
        )
        scores_3 = MultiCriteriaScorer.calculate_scores(
            items=items_3,
            preferred_style=style_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            budget_limit_inr=budget_val,
            constraints=constraints_3,
        )
        explain_3 = ExplainabilityGenerator.generate_explanation(
            items=items_3,
            design_style=style_clean,
            room_type=room_clean,
            room_length_m=len_val,
            room_width_m=wid_val,
            ceiling_height_m=hgt_val,
            budget_limit_inr=budget_val,
            total_cost_inr=cost_3,
            constraints=constraints_3,
        )
        plans.append(
            RecommendationPlan(
                id=f"plan-{uuid.uuid4().hex[:8]}",
                title=f"Premium {style_clean.replace('_', ' ').title()} Feature Suite",
                design_style=style_clean,
                room_type=room_clean,
                match_score=scores_3.overall_score,
                scores=scores_3,
                estimated_cost_inr=cost_3,
                items=items_3,
                constraints=constraints_3,
                explainability=explain_3,
            )
        )

        # Sort by overall match score descending
        plans.sort(key=lambda p: p.match_score, reverse=True)
        return [p.to_dict() for p in plans]

    @classmethod
    def generate_single_design_plan(
        cls,
        room_type: str = "living_room",
        design_style: str = "modern",
        budget_inr: int = 500000,
        length_m: float = 4.8,
        width_m: float = 3.6,
        height_m: float = 2.8,
        existing_objects: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Generates a single comprehensive design plan summary."""
        plans = cls.generate_recommendations(
            room_type=room_type,
            design_style=design_style,
            budget_inr=budget_inr,
            length_m=length_m,
            width_m=width_m,
            height_m=height_m,
            existing_objects=existing_objects,
        )
        primary_plan = plans[0] if plans else {}
        floor_area = round(length_m * width_m, 2)
        volume = round(floor_area * height_m, 2)

        return {
            "success": True,
            "room_summary": {
                "room_type": room_type,
                "design_style": design_style,
                "length_m": length_m,
                "width_m": width_m,
                "height_m": height_m,
                "floor_area_sqm": floor_area,
                "volume_m3": volume,
                "budget_inr": budget_inr,
                "currency": "INR",
            },
            "plan": primary_plan,
            "alternative_plans_count": len(plans),
            "generated_at": datetime.datetime.utcnow().isoformat(),
        }

    @classmethod
    def generate_renovation_estimate(
        cls,
        length_m: float = 4.8,
        width_m: float = 3.6,
        height_m: float = 2.8,
    ) -> Dict[str, Any]:
        """Calculates estimated renovation quantities and costs in INR."""
        len_val = max(2.0, float(length_m))
        wid_val = max(2.0, float(width_m))
        hgt_val = max(2.0, float(height_m))

        floor_area_sqm = round(len_val * wid_val, 2)
        wall_area_sqm = round(max(10.0, 2 * (len_val + wid_val) * hgt_val - 4.0), 2)
        ceiling_area_sqm = floor_area_sqm

        paint_liters = round(wall_area_sqm / 10.0, 1)
        flooring_sqm = round(floor_area_sqm * 1.10, 2)  # 10% allowance
        baseboard_meters = round(max(4.0, 2 * (len_val + wid_val) - 1.2), 1)

        items = [
            {"category": "Wall Painting", "description": "Premium Interior Emulsion", "quantity": f"{paint_liters} Liters", "estimated_cost_inr": int(paint_liters * 650)},
            {"category": "Flooring", "description": "Engineered Wood / Porcelain Tile", "quantity": f"{flooring_sqm} sq.m", "estimated_cost_inr": int(flooring_sqm * 1800)},
            {"category": "Ceiling", "description": "False Ceiling / Warm Finish", "quantity": f"{ceiling_area_sqm} sq.m", "estimated_cost_inr": int(ceiling_area_sqm * 450)},
            {"category": "Lighting", "description": "Recessed LEDs & Accent Fixtures", "quantity": "4 Fixtures", "estimated_cost_inr": 18500},
            {"category": "Doors & Windows", "description": "Refinement / Frame Trim", "quantity": "1 Door, 1 Window", "estimated_cost_inr": 22000},
            {"category": "Furniture & Storage", "description": "Core Staged Pieces", "quantity": "4 Items", "estimated_cost_inr": 145000},
            {"category": "Decor", "description": "Curtains, Rugs & Accents", "quantity": "Set", "estimated_cost_inr": 16500},
        ]

        total_est = sum(item["estimated_cost_inr"] for item in items)

        return {
            "success": True,
            "disclaimer": "All measurements and costs are image-derived estimates. Verify on site before purchasing materials.",
            "metrics": {
                "floor_area_sqm": floor_area_sqm,
                "wall_area_sqm": wall_area_sqm,
                "ceiling_area_sqm": ceiling_area_sqm,
                "paint_required_liters": paint_liters,
                "flooring_required_sqm": flooring_sqm,
                "baseboard_length_m": baseboard_meters,
            },
            "items": items,
            "total_estimated_cost_inr": total_est,
            "currency": "INR",
        }
