# SmartSpace AI - AI Interior Design Recommendation Engine (Phase 6)

## 1. Overview & Architecture

Phase 6 of **SmartSpace AI** introduces the **AI-Powered Interior Design Recommendation Engine**. It translates 3D spatial dimensions, detected furniture bounding envelopes, architectural planes, design style preferences, and Indian Rupee (INR) budgets into personalized, spatially-validated interior design proposals.

---

## 2. Modular Engine Subsystems

The recommendation engine is structured as a modular Python package located in [`backend/recommendation/`](file:///c:/Users/USER/OneDrive/Desktop/SmartSpaceAI/backend/recommendation):

1. **Furniture Catalog (`catalog.py`)**:
   - Curated database of 40+ furniture and decor items across 6 room types and 8 design styles.
   - Realistic Indian-market pricing in INR (₹).
   - Detailed metric dimensions ($L \times W \times H$), materials, color palettes, and placement tags.

2. **Spatial & Budget Constraints (`constraints.py`)**:
   - Validates **Pathway Circulation Clearance** ($\ge 0.90\text{m}$ clear corridor).
   - Validates **Floor Occupancy Density** ($\le 40\%$ total floor coverage).
   - Validates **Natural Window Daylight Sightlines** (furniture profiles below window sill levels).
   - Validates **Budget Ceiling Compliance** (within INR target budget limit).

3. **Multi-Criteria Scoring Engine (`scoring.py`)**:
   - Computes transparent utility subscores from $0 - 100$:
     - **Spatial Compatibility** ($35\%$ weight)
     - **Style Compatibility** ($30\%$ weight)
     - **Budget Efficiency** ($20\%$ weight)
     - **Storage Utility** ($8\%$ weight)
     - **Daylight Preservation** ($7\%$ weight)

4. **Budget Optimizer (`optimizer.py`)**:
   - Prioritizes essential functional furniture (seating, beds, desks, dining tables).
   - Fills remaining budget with accent pieces and dimmable ambient lighting.
   - Replaces expensive pieces with lower-cost stylish alternatives when budget is exceeded.

5. **Explainable AI (XAI) Generator (`explainability.py`)**:
   - Produces human-readable architectural rationales for every proposal.
   - Explains circulation corridors, window orientations, material harmony, and budget utilization.

6. **Engine Orchestrator (`engine.py`)**:
   - Generates 3 distinct layout candidates:
     1. **Primary Spatial Flow Concept** (Balanced, optimal utility score).
     2. **Airy Open Circulation Layout** (Minimalist, maximal open floor area).
     3. **Premium Feature Suite** (Comfort-first, luxury tier).

---

## 3. Endpoints Reference

| Endpoint | Method | Input Payload | Output |
| :--- | :--- | :--- | :--- |
| `POST /api/recommendations` | `application/json` | `{ room_type, design_style, budget, length, width, height, existing_objects, planes }` | List of 3 ranked `RecommendationPlan` objects in INR. |
| `POST /api/design-plan` | `application/json` | `{ room_type, design_style, budget, length, width, height }` | Comprehensive single design plan summary with room metrics and itemized catalog. |
| `GET /api/health` | None | None | Backend service health, latency, and Phase 6 feature list. |

---

## 4. Rule-Based vs. Future ML Replacement Architecture

- **Current Implementation (Phase 6)**: Multi-criteria constraint optimization and rule-based heuristic scoring.
- **Future ML Extension**: The modular interface (`RecommendationEngine.generate_recommendations`) can be replaced with a neural collaborative filtering or spatial graph neural network (GNN) model without changing the API contract or frontend integration.
