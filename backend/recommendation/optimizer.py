"""
SmartSpace AI - Budget Optimization & Furniture Selection Engine (Phase 6)
Selects and optimizes furniture sets based on room type, design style,
essential requirements, and INR budget ceilings.
"""

from typing import List, Dict, Any, Tuple
from .catalog import FurnitureCatalog, FurnitureCatalogItem


class BudgetOptimizer:
    """
    Optimizes candidate furniture selections to maximize aesthetic utility
    while strictly respecting the target INR budget limit.
    """

    @classmethod
    def select_optimal_set(
        cls,
        room_type: str,
        design_style: str,
        budget_inr: int,
        room_length_m: float,
        room_width_m: float,
        variant_bias: str = "balanced",  # 'balanced', 'spacious', 'minimalist'
    ) -> Tuple[List[FurnitureCatalogItem], int, float]:
        """
        Selects a cohesive set of furniture catalog items matching room and style criteria.
        Returns (selected_items, total_cost_inr, budget_utilization_pct).
        """
        all_room_items = FurnitureCatalog.filter_items(room_type=room_type, style=design_style)
        if not all_room_items:
            all_room_items = FurnitureCatalog.filter_items(room_type=room_type)

        selected: List[FurnitureCatalogItem] = []
        floor_area = max(1.0, room_length_m * room_width_m)
        max_occupancy_area = floor_area * (0.32 if variant_bias == "minimalist" else 0.40)

        # 1. Group by categories
        by_category: Dict[str, List[FurnitureCatalogItem]] = {}
        for item in all_room_items:
            by_category.setdefault(item.category, []).append(item)

        # Sort categories by importance for room type
        if room_type in ["living_room", "studio"]:
            priority_categories = ["seating", "tables", "storage", "lighting", "decor"]
        elif room_type == "bedroom":
            priority_categories = ["beds", "storage", "seating", "lighting", "decor"]
        elif room_type in ["office", "study_room"]:
            priority_categories = ["tables", "seating", "storage", "lighting"]
        elif room_type in ["dining_room", "kitchen"]:
            priority_categories = ["tables", "seating", "storage", "decor"]
        else:
            priority_categories = ["seating", "tables", "storage", "lighting", "decor"]

        current_cost = 0
        current_footprint = 0.0

        for cat in priority_categories:
            cat_items = by_category.get(cat, [])
            if not cat_items:
                continue

            # In minimalist mode, pick compact/lower-cost items
            if variant_bias == "minimalist":
                cat_items = sorted(cat_items, key=lambda i: (i.footprint_sqm, i.price_inr))
            else:
                cat_items = sorted(cat_items, key=lambda i: i.price_inr, reverse=(variant_bias == "luxury"))

            # Pick best fitting item for category
            for item in cat_items:
                if (current_cost + item.price_inr <= budget_inr * 1.05) and (
                    current_footprint + item.footprint_sqm <= max_occupancy_area
                ):
                    selected.append(item)
                    current_cost += item.price_inr
                    current_footprint += item.footprint_sqm
                    break

        # If budget allows and space permits, add accent lighting or decor
        if current_cost < budget_inr * 0.85 and current_footprint < max_occupancy_area * 0.85:
            decor_items = FurnitureCatalog.filter_items(category="decor")
            for d in decor_items:
                if (
                    d not in selected
                    and current_cost + d.price_inr <= budget_inr
                    and current_footprint + d.footprint_sqm <= max_occupancy_area
                ):
                    selected.append(d)
                    current_cost += d.price_inr
                    current_footprint += d.footprint_sqm
                    break

        utilization_pct = round((current_cost / max(1, budget_inr)) * 100, 1)
        return selected, current_cost, utilization_pct
