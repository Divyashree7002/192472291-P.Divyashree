# SmartSpace AI - Computer Vision Architecture & Model Documentation (Phase 4)

## 1. Overview & Objective

Phase 4 of the SmartSpace AI platform introduces **Real Computer Vision Room Understanding**. When a user captures a camera frame or uploads a room photo, the backend processes the image through an automated, multi-stage computer vision pipeline to extract:
- **Image Quality Metrics** (luminance, contrast, Laplacian sharpness variance, resolution).
- **Indoor Object & Furniture Detection** (bounding boxes, class labels, confidence scores, pixel centroid positions).
- **Room Scene Analysis** (floor, wall, ceiling presence heuristics, dominant structural boundary lines, dominant color palette).

---

## 2. Model Selection & Architecture

### Model Selected
- **YOLOv8 Nano (`yolov8n.pt`)** via the Ultralytics object detection framework.

### Why This Model Was Selected
1. **Lightweight CPU Inference**: YOLOv8n has ~3.2M parameters, running efficiently on commodity consumer CPU hardware (sub-200ms inference) without requiring dedicated GPU acceleration during initial scanning.
2. **Pretrained on COCO**: Out of the box, it detects common indoor furniture and architectural elements (chairs, couches/sofas, beds, dining tables, TVs, refrigerators, sinks, indoor plants, laptops, books, etc.).
3. **Pluggable BaseDetector Abstraction**: The pipeline exposes a `BaseDetector` interface. This allows swapping the underlying model in future phases (e.g., to YOLOv8x, Mask-RCNN, RT-DETR, or a custom-trained indoor dataset like ScanNet/SUN RGB-D) without altering the API surface.

---

## 3. Supported Classes & Category Mapping

The detector identifies and standardizes common indoor objects into interior design categories:

| Detected Class | Standardized Name | Category | Primary Relevance |
| :--- | :--- | :--- | :--- |
| `couch` / `sofa` | `sofa` | Seating | Focal seating arrangement, clearance calculation |
| `chair` | `chair` | Seating | Secondary seating & dining chair clustering |
| `bed` | `bed` | Beds | Primary bedroom footprint |
| `dining table` | `dining_table` | Tables | Circulation corridor anchor |
| `table` / `desk` | `table` / `desk` | Tables | Surface working space |
| `tv` / `television` | `television` | Electronics | Sightline & focal wall orientation |
| `potted plant` | `indoor_plant` | Decor | Natural aesthetic accents |
| `refrigerator` / `microwave` / `oven` | Kitchen appliances | Appliances | Functional work triangle |
| `sink` | `sink` | Fixtures | Plumbing perimeter alignment |
| `book` / `vase` / `clock` | Accessories | Decor | Shelf and tabletop styling |

---

## 4. End-to-End Computer Vision Pipeline

```
Raw Upload Stream (JPG / PNG / WebP)
  │
  ├── 1. Preprocessing & Validation
  │      ├── Format verification & dimension check (min 64x64)
  │      ├── OpenCV BGR matrix decoding (with PIL fallback)
  │      └── Image Quality Assessment (sharpness via Var(Laplacian), brightness, contrast)
  │
  ├── 2. Object Detection Engine
  │      ├── Aspect-ratio preserving inference pass
  │      ├── Bounding box mapping back to original pixel coordinates
  │      └── Confidence threshold filtering (default: 0.25; user-adjustable: 0.10 - 0.95)
  │
  ├── 3. Room Scene Analysis
  │      ├── Probabilistic Hough Line Transform (boundary & junction lines)
  │      ├── Lower/Mid/Upper plane presence heuristics (floor, wall, ceiling)
  │      ├── K-Means dominant color clustering (4-color room palette)
  │      └── Clutter level & floor coverage estimation
  │
  └── 4. Structured JSON Response Format
```

---

## 5. Confidence Thresholds & Filtering

- **Default Backend Threshold**: `0.25` (captures high and moderate confidence objects).
- **Interactive Frontend Slider**: Allows users to filter displayed bounding boxes dynamically between `0.10` and `0.95` without re-running the inference pipeline.
- **Recommended Setting**: `0.30 - 0.50` for balanced precision and recall in typical home lighting conditions.

---

## 6. Hardware & Performance Considerations

- **Current Execution**: Optimized for CPU execution (`device="cpu"`).
- **Inference Latency**: Typical execution time ranges between **80ms – 250ms** on modern multicore processors.
- **On-Demand Processing**: Inference runs strictly upon user request (&ldquo;Analyze Room&rdquo;), preventing battery drain and high CPU usage from continuous frame scanning.
- **Future GPU Acceleration**: Built with PyTorch/CUDA readiness (`device="cuda:0"` can be enabled when GPU compute is present).

---

## 7. Known Limitations & Scale Ambiguity Disclaimer

> [!IMPORTANT]
> **Monocular Scale Ambiguity**: A single 2D image contains inherent depth and scale ambiguity. While 2D pixel coordinates, bounding boxes, aspect ratios, and relative centroids are mathematically accurate in image space, **the system does NOT claim to compute real-world metric dimensions (e.g. millimeters/meters) from a single 2D RGB image alone.**
>
> Phase 5 will introduce metric scale calibration and monocular depth estimation models (such as Depth Anything / MiDaS) to reconstruct real-world spatial distances.
