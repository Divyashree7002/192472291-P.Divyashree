"""
SmartSpace AI - Furniture Catalog & Pricing Database (Phase 6)
Contains realistic Indian-market INR pricing, metric dimensions, material specs,
and multi-style compatibility tags.
"""

from typing import List, Dict, Any, Optional


class FurnitureCatalogItem:
    """Represents a curated furniture catalog entry."""

    def __init__(
        self,
        id: str,
        name: str,
        category: str,
        price_inr: int,
        length_m: float,
        width_m: float,
        height_m: float,
        styles: List[str],
        room_types: List[str],
        materials: List[str],
        colors: List[str],
        is_essential: bool = True,
        recommended_position: str = "against_wall",
        description: str = "",
    ):
        self.id = id
        self.name = name
        self.category = category  # 'seating', 'tables', 'beds', 'storage', 'lighting', 'decor'
        self.price_inr = int(price_inr)
        self.length_m = float(length_m)
        self.width_m = float(width_m)
        self.height_m = float(height_m)
        self.footprint_sqm = round(self.length_m * self.width_m, 2)
        self.styles = [s.lower() for s in styles]
        self.room_types = [r.lower() for r in room_types]
        self.materials = materials
        self.colors = colors
        self.is_essential = is_essential
        self.recommended_position = recommended_position
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price_inr,
            "currency": "INR",
            "dimensions": {
                "length": self.length_m,
                "width": self.width_m,
                "height": self.height_m,
                "footprint_sqm": self.footprint_sqm,
            },
            "styles": self.styles,
            "room_types": self.room_types,
            "materials": self.materials,
            "colors": self.colors,
            "is_essential": self.is_essential,
            "recommended_position": self.recommended_position,
            "description": self.description,
        }


# Curated catalog entries with realistic Indian-market INR pricing
FURNITURE_CATALOG_DATA: List[FurnitureCatalogItem] = [
    # ── Living Room Seating ──────────────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="sofa-modern-3s",
        name="Aura 3-Seater Low-Profile Bouclé Sofa",
        category="seating",
        price_inr=68000,
        length_m=2.20,
        width_m=0.90,
        height_m=0.78,
        styles=["modern", "scandinavian", "japandi", "contemporary"],
        room_types=["living_room", "studio"],
        materials=["Textured Bouclé", "Kiln-Dried Hardwood", "High-Resilience Foam"],
        colors=["Cream Ivory", "Warm Sand", "Oatmeal"],
        is_essential=True,
        recommended_position="against_wall",
        description="Low-profile profile maximizes continuous vertical wall sightlines.",
    ),
    FurnitureCatalogItem(
        id="sofa-minimal-2s",
        name="Nordic Slimline 2-Seater Fabric Sofa",
        category="seating",
        price_inr=42000,
        length_m=1.75,
        width_m=0.85,
        height_m=0.80,
        styles=["minimalist", "scandinavian", "modern"],
        room_types=["living_room", "studio", "office"],
        materials=["Solid Ash Legs", "Organic Linen Fabric"],
        colors=["Forest Sage", "Muted Grey", "Warm Beige"],
        is_essential=True,
        recommended_position="against_wall",
        description="Compact footprint ideal for moderate floor spaces with generous circulation.",
    ),
    FurnitureCatalogItem(
        id="sofa-luxury-sectional",
        name="Verona L-Shaped Chaise Sectional",
        category="seating",
        price_inr=125000,
        length_m=2.85,
        width_m=1.65,
        height_m=0.82,
        styles=["luxury", "contemporary", "modern"],
        room_types=["living_room"],
        materials=["Top-Grain Italian Leather", "Brushed Brass Accents"],
        colors=["Cognac Tan", "Charcoal Slate", "Taupe"],
        is_essential=True,
        recommended_position="corner_anchor",
        description="Spacious modular sectional anchoring the primary family seating zone.",
    ),
    FurnitureCatalogItem(
        id="armchair-teak",
        name="Malabar Solid Teak Lounge Accent Chair",
        category="seating",
        price_inr=26000,
        length_m=0.75,
        width_m=0.80,
        height_m=0.76,
        styles=["traditional", "scandinavian", "japandi", "modern"],
        room_types=["living_room", "bedroom", "study_room", "office"],
        materials=["Natural Teakwood", "Hand-Woven Cane Webbing"],
        colors=["Natural Teak", "Warm Honey", "Matte Black"],
        is_essential=False,
        recommended_position="corner_anchor",
        description="Lightweight open-weave cane back maintains natural light transmission.",
    ),

    # ── Living Room Tables & Storage ────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="table-coffee-oak",
        name="Koto Organic Oval Oak Coffee Table",
        category="tables",
        price_inr=22000,
        length_m=1.20,
        width_m=0.60,
        height_m=0.42,
        styles=["scandinavian", "japandi", "minimalist", "modern"],
        room_types=["living_room", "studio"],
        materials=["Solid White Oak", "Matte Polyurethane Finish"],
        colors=["Natural Oak", "Bleached Ash"],
        is_essential=True,
        recommended_position="center_floor",
        description="Rounded organic edges prevent sharp corner hazards and ease pathway circulation.",
    ),
    FurnitureCatalogItem(
        id="table-coffee-industrial",
        name="Titan Raw Iron & Reclaimed Wood Coffee Table",
        category="tables",
        price_inr=18500,
        length_m=1.10,
        width_m=0.65,
        height_m=0.45,
        styles=["industrial", "contemporary", "modern"],
        room_types=["living_room"],
        materials=["Reclaimed Mango Wood", "Powder-Coated Steel Frame"],
        colors=["Smoked Walnut", "Industrial Black"],
        is_essential=True,
        recommended_position="center_floor",
        description="Robust industrial table with lower storage shelf.",
    ),
    FurnitureCatalogItem(
        id="storage-tv-credenza",
        name="Linear Fluted Floating Media Credenza",
        category="storage",
        price_inr=38000,
        length_m=1.80,
        width_m=0.40,
        height_m=0.45,
        styles=["modern", "minimalist", "contemporary", "japandi"],
        room_types=["living_room", "bedroom"],
        materials=["Fluted Teak Veneer", "Concealed Cable Management"],
        colors=["Warm Walnut", "Muted Ebony", "Natural Oak"],
        is_essential=True,
        recommended_position="against_wall",
        description="Wall-mounted elevation keeps floor plane 100% visible and easy to clean.",
    ),

    # ── Bedroom Essentials ──────────────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="bed-king-upholstered",
        name="Serenity King Size Upholstered Platform Bed",
        category="beds",
        price_inr=74000,
        length_m=2.10,
        width_m=1.90,
        height_m=1.05,
        styles=["modern", "contemporary", "scandinavian", "luxury"],
        room_types=["bedroom"],
        materials=["Woven Linen Headboard", "Solid Hardwood Slat Base"],
        colors=["Warm Oatmeal", "Charcoal Heather", "Sand Ivory"],
        is_essential=True,
        recommended_position="against_wall",
        description="Low acoustic headboard with integrated ergonomic lumbar incline.",
    ),
    FurnitureCatalogItem(
        id="bed-queen-minimal",
        name="Kyoto Solid Sheesham Queen Platform Bed",
        category="beds",
        price_inr=46000,
        length_m=2.05,
        width_m=1.60,
        height_m=0.88,
        styles=["minimalist", "japandi", "traditional", "modern"],
        room_types=["bedroom", "studio"],
        materials=["Indian Sheesham Timber", "Natural Oil Rubbed Finish"],
        colors=["Rich Walnut", "Natural Honey"],
        is_essential=True,
        recommended_position="against_wall",
        description="Floating cantilever base creates an illusion of expanded floor space.",
    ),
    FurnitureCatalogItem(
        id="nightstand-pair",
        name="Nami Floating Bedside Tables (Pair)",
        category="storage",
        price_inr=16000,
        length_m=0.45,
        width_m=0.35,
        height_m=0.25,
        styles=["modern", "minimalist", "scandinavian", "japandi"],
        room_types=["bedroom"],
        materials=["Solid Oak", "Soft-Close Drawer Hardware"],
        colors=["Natural Oak", "Matte Terracotta"],
        is_essential=False,
        recommended_position="against_wall",
        description="Wall-mounted compact side tables preserve bedside carpet clearance.",
    ),
    FurnitureCatalogItem(
        id="wardrobe-3door-sliding",
        name="Modular 3-Door Floor-to-Ceiling Wardrobe",
        category="storage",
        price_inr=85000,
        length_m=2.40,
        width_m=0.60,
        height_m=2.35,
        styles=["modern", "contemporary", "minimalist", "luxury"],
        room_types=["bedroom"],
        materials=["High-Gloss Laminate", "Aluminium Track Mechanism"],
        colors=["Matte Cashmere", "Warm White", "Smoked Grey"],
        is_essential=True,
        recommended_position="against_wall",
        description="Sliding doors require zero door-swing floor clearance buffer.",
    ),

    # ── Dining Room ────────────────────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="dining-table-6s",
        name="Heritage Solid Teak 6-Seater Dining Table",
        category="tables",
        price_inr=58000,
        length_m=1.80,
        width_m=0.95,
        height_m=0.76,
        styles=["traditional", "contemporary", "scandinavian", "modern"],
        room_types=["dining_room", "kitchen"],
        materials=["Seasoned Teakwood", "Chamfered Edge Profiles"],
        colors=["Natural Teak", "Deep Espresso"],
        is_essential=True,
        recommended_position="center_floor",
        description="Central dining anchor with 0.9m circulation envelope allowance.",
    ),
    FurnitureCatalogItem(
        id="dining-chairs-set4",
        name="Ergo Solid Wood Dining Chairs (Set of 4)",
        category="seating",
        price_inr=32000,
        length_m=0.50,
        width_m=0.52,
        height_m=0.82,
        styles=["modern", "scandinavian", "minimalist", "japandi"],
        room_types=["dining_room", "kitchen"],
        materials=["Molded Ash Wood", "Padded Linen Seat Cushion"],
        colors=["Warm Charcoal", "Natural Ash"],
        is_essential=True,
        recommended_position="center_floor",
        description="Tuck completely under tabletop to preserve clearance when not in use.",
    ),

    # ── Office & Study Room ────────────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="desk-executive-oak",
        name="Apex Ergonomic Solid Oak Workstation",
        category="tables",
        price_inr=34000,
        length_m=1.50,
        width_m=0.70,
        height_m=0.75,
        styles=["modern", "minimalist", "scandinavian", "contemporary"],
        room_types=["office", "study_room", "bedroom"],
        materials=["European Oak", "Cable Gutter Conduit", "Steel T-Frame"],
        colors=["Natural Oak", "Matte White", "Walnut"],
        is_essential=True,
        recommended_position="under_window",
        description="Optimized for dual-monitor setups with integrated cable conduit.",
    ),
    FurnitureCatalogItem(
        id="chair-ergonomic-mesh",
        name="Vertebra High-Back Ergonomic Task Chair",
        category="seating",
        price_inr=24000,
        length_m=0.65,
        width_m=0.65,
        height_m=1.15,
        styles=["modern", "contemporary", "industrial", "minimalist"],
        room_types=["office", "study_room"],
        materials=["Breathable Korean Mesh", "Class 4 Gas Lift", "Aluminium Base"],
        colors=["Carbon Black", "Graphite Grey"],
        is_essential=True,
        recommended_position="center_floor",
        description="Dynamic lumbar support with 4D adjustable armrests.",
    ),
    FurnitureCatalogItem(
        id="bookcase-modular-tall",
        name="Architectural Open Grid Bookshelf",
        category="storage",
        price_inr=29000,
        length_m=1.20,
        width_m=0.35,
        height_m=1.90,
        styles=["industrial", "modern", "minimalist", "scandinavian"],
        room_types=["office", "study_room", "living_room"],
        materials=["Matte Black Iron", "Sheesham Solid Wood Planks"],
        colors=["Smoked Walnut", "Industrial Iron"],
        is_essential=False,
        recommended_position="against_wall",
        description="Open shelving doubles as a light-transmitting spatial room divider.",
    ),

    # ── Accent Lighting & Decor ────────────────────────────────────────────────────
    FurnitureCatalogItem(
        id="lamp-floor-arc",
        name="Lumina Overarching Brass Floor Lamp",
        category="lighting",
        price_inr=14500,
        length_m=0.45,
        width_m=0.45,
        height_m=1.85,
        styles=["modern", "contemporary", "luxury", "scandinavian"],
        room_types=["living_room", "bedroom", "office"],
        materials=["Spun Brass", "White Marble Base", "Dimmable Warm LED"],
        colors=["Brushed Brass", "Warm Gold"],
        is_essential=False,
        recommended_position="corner_anchor",
        description="Directs glare-free ambient illumination over seating focal points.",
    ),
    FurnitureCatalogItem(
        id="rug-handtufted-wool",
        name="Kaveri Geometric Hand-Tufted Wool Rug (8x5 ft)",
        category="decor",
        price_inr=19500,
        length_m=2.40,
        width_m=1.50,
        height_m=0.02,
        styles=["modern", "scandinavian", "traditional", "japandi", "contemporary"],
        room_types=["living_room", "bedroom", "dining_room"],
        materials=["100% New Zealand Wool", "Cotton Backing"],
        colors=["Terracotta & Cream", "Sage Geometric", "Sand Heather"],
        is_essential=False,
        recommended_position="center_floor",
        description="Delineates functional conversation zone while providing acoustic dampening.",
    ),
]


class FurnitureCatalog:
    """Catalog query and filtering utility."""

    @classmethod
    def get_all(cls) -> List[FurnitureCatalogItem]:
        return FURNITURE_CATALOG_DATA

    @classmethod
    def filter_items(
        cls,
        room_type: Optional[str] = None,
        style: Optional[str] = None,
        max_price: Optional[int] = None,
        category: Optional[str] = None,
    ) -> List[FurnitureCatalogItem]:
        """Filters catalog items matching room, design style, and budget limits."""
        results = FURNITURE_CATALOG_DATA

        if room_type:
            rt_clean = room_type.lower()
            results = [item for item in results if rt_clean in item.room_types or "living_room" in item.room_types]

        if style:
            st_clean = style.lower()
            results = [item for item in results if st_clean in item.styles or "modern" in item.styles]

        if category:
            cat_clean = category.lower()
            results = [item for item in results if item.category == cat_clean]

        if max_price:
            results = [item for item in results if item.price_inr <= max_price]

        return results

    @classmethod
    def get_by_id(cls, item_id: str) -> Optional[FurnitureCatalogItem]:
        for item in FURNITURE_CATALOG_DATA:
            if item.id == item_id:
                return item
        return None

    @classmethod
    def find_alternatives(
        cls, item: FurnitureCatalogItem, max_budget: Optional[int] = None
    ) -> List[FurnitureCatalogItem]:
        """Finds lower-cost or stylistic alternatives for a given furniture item."""
        candidates = [
            cand
            for cand in FURNITURE_CATALOG_DATA
            if cand.category == item.category and cand.id != item.id
        ]
        if max_budget:
            candidates = [c for c in candidates if c.price_inr <= max_budget]
        # Sort by price ascending
        candidates.sort(key=lambda c: c.price_inr)
        return candidates[:3]
