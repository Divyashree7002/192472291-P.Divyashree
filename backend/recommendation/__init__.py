"""
SmartSpace AI - AI Interior Design Recommendation Package (Phase 6)
"""

from .catalog import FurnitureCatalog, FurnitureCatalogItem, FURNITURE_CATALOG_DATA
from .constraints import SpatialConstraintValidator, ConstraintValidationResult
from .scoring import MultiCriteriaScorer, RecommendationScores
from .optimizer import BudgetOptimizer
from .explainability import ExplainabilityGenerator, DesignExplainability
from .engine import RecommendationEngine, RecommendationPlan

__all__ = [
    "FurnitureCatalog",
    "FurnitureCatalogItem",
    "FURNITURE_CATALOG_DATA",
    "SpatialConstraintValidator",
    "ConstraintValidationResult",
    "MultiCriteriaScorer",
    "RecommendationScores",
    "BudgetOptimizer",
    "ExplainabilityGenerator",
    "DesignExplainability",
    "RecommendationEngine",
    "RecommendationPlan",
]
