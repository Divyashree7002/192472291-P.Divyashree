"""
SmartSpace AI - Multi-Criteria Recommendation Scoring Engine (Phase 6)
Computes transparent sub-scores for space compatibility, style alignment,
budget efficiency, storage utility, and daylight preservation.
"""

from typing import List, Dict, Any, Optional
from .catalog import FurnitureCatalogItem
from .constraints import ConstraintValidationResult


class RecommendationScores:
    """Encapsulates multi-factor recommendation scoring components."""

    def __init__(
        self,
        space_compatibility: int,
        style_compatibility: int,
        storage_score: int,
        lighting_score: int,
        overall_score: int,
    ):
        self.space_compatibility = int(space_compatibility)
        self.style_compatibility = int(style_compatibility)
        self.storage_score = int(storage_score)
        self.lighting_score = int(lighting_score)
        self.overall_score = int(overall_score)

    def to_dict(self) -> Dict[str, int]:
        return {
            "spaceCompatibility": self.space_compatibility,
            "styleCompatibility": self.style_compatibility,
            "storageScore": self.storage_score,
            "lightingScore": self.lighting_score,
            "overallScore": self.overall_score,
        }


class MultiCriteriaScorer:
    """
    Computes transparent multi-objective utility scores for candidate furniture layouts.
    """

    @classmethod
    def calculate_scores(
        cls,
        items: List[FurnitureCatalogItem],
        preferred_style: str,
        room_length_m: float,
        room_width_m: float,
        budget_limit_inr: int,
        constraints: List[ConstraintValidationResult],
    ) -> RecommendationScores:
        style_clean = preferred_style.lower()

        # 1. Style Compatibility Score (0 - 100)
        style_matches = 0
        total_items = len(items)
        if total_items > 0:
            for item in items:
                if style_clean in item.styles:
                    style_matches += 1
                elif "modern" in item.styles or "contemporary" in item.styles:
                    style_matches += 0.8
                else:
                    style_matches += 0.5
            style_compatibility = min(98, max(60, int((style_matches / total_items) * 100)))
        else:
            style_compatibility = 85

        # 2. Space Compatibility Score (0 - 100)
        failed_count = sum(1 for c in constraints if c.status == "failed")
        warning_count = sum(1 for c in constraints if c.status == "warning")

        if failed_count > 0:
            space_compatibility = max(40, 70 - failed_count * 15)
        elif warning_count > 0:
            space_compatibility = max(75, 90 - warning_count * 6)
        else:
            space_compatibility = min(98, 92 + min(6, int(min(room_length_m, room_width_m) * 2)))

        # 3. Budget Efficiency Score (0 - 100)
        total_cost = sum(item.price_inr for item in items)
        if total_cost <= budget_limit_inr:
            utilization = total_cost / max(1, budget_limit_inr)
            if 0.80 <= utilization <= 0.98:
                budget_score = 96
            elif utilization > 0.98:
                budget_score = 90
            else:
                budget_score = int(75 + utilization * 20)
        else:
            overage_ratio = (total_cost - budget_limit_inr) / max(1, budget_limit_inr)
            budget_score = max(50, int(85 - overage_ratio * 100))

        # 4. Storage and Lighting Subscores
        has_storage = any(item.category == "storage" for item in items)
        storage_score = 92 if has_storage else 80

        has_lighting = any(item.category == "lighting" for item in items)
        lighting_score = 95 if has_lighting else 88

        # 5. Overall Weighted Score (0 - 100)
        overall = int(
            space_compatibility * 0.35
            + style_compatibility * 0.30
            + budget_score * 0.20
            + storage_score * 0.08
            + lighting_score * 0.07
        )

        return RecommendationScores(
            space_compatibility=space_compatibility,
            style_compatibility=style_compatibility,
            storage_score=storage_score,
            lighting_score=lighting_score,
            overall_score=min(99, max(50, overall)),
        )
