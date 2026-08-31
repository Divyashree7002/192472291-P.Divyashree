# SmartSpace AI - Architecture & System Specifications

**Full Title**: An Intelligent Live Camera-Based Platform for Context-Aware 3D Elevation Visualization and Personalized Interior Design Recommendations

---

## 1. System Overview

SmartSpace AI is an academic Computer Vision (CV) and Machine Learning (ML) research platform designed to capture real-world indoor room environments via live video feeds, infer dense 3D spatial geometry, estimate physical boundaries, and produce constraint-satisfying, personalized interior layout recommendations with explainable AI reasoning.

---

## 2. Directory Structure

```
SmartSpaceAI/
├── frontend/                     # React + Vite + Tailwind CSS User Interface
│   ├── src/
│   │   ├── components/           # UI and domain-specific components
│   │   ├── context/              # Global state providers
│   │   ├── hooks/                # Custom React hooks (camera, persistence)
│   │   ├── pages/                # Application routes / views
│   │   ├── services/             # API services for future FastAPI endpoints
│   │   ├── types/                # Domain models & TypeScript interfaces
│   │   └── utils/                # Geometry, unit conversion & formatting
├── backend/                      # [Future Module] FastAPI REST & WebSocket Server
│   ├── app/
│   │   ├── api/                  # Route handlers (/api/v1/analyze, /api/v1/recommend)
│   │   ├── core/                 # Config & security
│   │   └── schemas/              # Pydantic data validation schemas
├── cv/                           # [Future Module] Computer Vision Pipeline
│   ├── depth_estimation/         # Monocular / RGB-D depth inferencing
│   ├── plane_detection/          # Wall, floor, ceiling plane RANSAC / segmentation
│   ├── object_detection/         # 3D bounding box detection for existing furniture
│   └── camera_calibration/       # Intrinsic/extrinsic calibration utilities
├── ml/                           # [Future Module] Machine Learning & Recommendation
│   ├── constraint_engine/        # Spatial clearance & collision solver (Z3 / constraint satisfaction)
│   ├── recommendation/           # Multi-criteria ranking (collaborative & content-based)
│   ├── explainability/           # SHAP / Rule-based transparent decision breakdown
│   └── cost_optimizer/           # Budget allocation and Pareto-optimal trade-offs
├── models/                       # [Future Module] Pretrained model checkpoints
├── data/                         # [Future Module] Room dataset & 3D furniture catalog
└── docs/                         # Specifications & research documentation
```

---

## 3. Communication Contract (Frontend <-> Backend)

### Real-Time Video Stream & Frame Ingestion
- **Protocol**: HTTP/2 Multipart POST / WebSocket binary stream
- **Endpoint**: `/api/v1/cv/stream-analyze`
- **Payload**: High-resolution video frame (JPEG/PNG buffer) + Camera Metadata (FOV, Aspect Ratio, Room Type Prior)

### Spatial Geometry Schema
- Boundary planes (Floor, Walls, Ceiling)
- Free spatial volume & clearance corridors
- Bounding boxes for persistent structural elements (Doors, Windows, Radiators)

### Recommendation Ingestion
- **Endpoint**: `/api/v1/ml/recommend`
- **Input**: Spatial Geometry + User Preference Vector (Style, Budget, Lifestyle Constraints)
- **Output**: Ranked layout candidates, item catalog mappings, and explainability reasoning breakdown.
