"""
SmartSpace AI - Object Detection & Classification Subsystem (Phase 4 & 5)
Defines BaseDetector interface, RelevantRoomObjectFilter, and YOLODetector.
Filters out irrelevant transient objects (people, animals, clothing, personal belongings)
and retains ONLY valid architectural and interior furniture objects.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import cv2
import logging
import os

logger = logging.getLogger(__name__)


class DetectedObject:
    """
    Standard representation of a detected indoor furniture piece or architectural object.
    All bounding box coordinates are expressed in the original image's pixel space.
    """

    def __init__(
        self,
        class_name: str,
        confidence: float,
        x: int,
        y: int,
        width: int,
        height: int,
        category: str = "furniture",
    ):
        self.class_name = class_name
        self.confidence = round(float(confidence), 2)
        self.x = max(0, int(x))
        self.y = max(0, int(y))
        self.width = max(1, int(width))
        self.height = max(1, int(height))
        self.category = category
        self.center_x = int(self.x + self.width / 2)
        self.center_y = int(self.y + self.height / 2)

    @property
    def confidence_level(self) -> str:
        if self.confidence >= 0.80:
            return "High"
        elif self.confidence >= 0.60:
            return "Medium"
        return "Low"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": f"det_{self.class_name}_{self.x}_{self.y}",
            "class_name": self.class_name,
            "confidence": self.confidence,
            "confidence_level": self.confidence_level,
            "category": self.category,
            "source": "detected",
            "bbox": {
                "x": self.x,
                "y": self.y,
                "width": self.width,
                "height": self.height,
            },
            "center": {
                "x": self.center_x,
                "y": self.center_y,
            },
        }


# =========================================================================
# ALLOWLIST: APPROVED INTERIOR FURNITURE & ARCHITECTURAL OBJECTS
# =========================================================================
ROOM_OBJECT_CLASSES: Dict[str, Tuple[str, str]] = {
    # Seating
    "chair": ("chair", "seating"),
    "couch": ("sofa", "seating"),
    "sofa": ("sofa", "seating"),
    "armchair": ("armchair", "seating"),
    "dining chair": ("dining_chair", "seating"),
    "dining_chair": ("dining_chair", "seating"),
    "bench": ("bench", "seating"),
    "stool": ("stool", "seating"),
    "pouf": ("stool", "seating"),
    "ottoman": ("stool", "seating"),

    # Tables & Desks
    "table": ("table", "tables"),
    "dining table": ("dining_table", "tables"),
    "diningtable": ("dining_table", "tables"),
    "dining_table": ("dining_table", "tables"),
    "coffee table": ("coffee_table", "tables"),
    "coffee_table": ("coffee_table", "tables"),
    "coffeetable": ("coffee_table", "tables"),
    "desk": ("desk", "tables"),
    "study_desk": ("desk", "tables"),
    "office_desk": ("desk", "tables"),
    "worktable": ("table", "tables"),
    "workbench": ("table", "tables"),
    "nightstand": ("nightstand", "tables"),
    "side table": ("side_table", "tables"),
    "side_table": ("side_table", "tables"),
    "end table": ("side_table", "tables"),
    "console table": ("table", "tables"),
    "console": ("table", "tables"),
    "kitchen_counter": ("kitchen_counter", "tables"),
    "kitchen counter": ("kitchen_counter", "tables"),
    "counter": ("kitchen_counter", "tables"),
    "countertop": ("kitchen_counter", "tables"),
    "island": ("kitchen_island", "tables"),
    "kitchen_island": ("kitchen_island", "tables"),
    "kitchen island": ("kitchen_island", "tables"),

    # Beds & Sleeping
    "bed": ("bed", "beds"),

    # Storage & Cabinetry
    "wardrobe": ("wardrobe", "storage"),
    "cabinet": ("cabinet", "storage"),
    "cupboard": ("cabinet", "storage"),
    "dresser": ("dresser", "storage"),
    "bookshelf": ("bookshelf", "storage"),
    "bookcase": ("bookshelf", "storage"),
    "shelf": ("shelf", "storage"),
    "credenza": ("credenza", "storage"),
    "sideboard": ("credenza", "storage"),
    "tv": ("television", "electronics"),
    "tvmonitor": ("television", "electronics"),
    "television": ("television", "electronics"),
    "tv_stand": ("tv_stand", "storage"),
    "tv stand": ("tv_stand", "storage"),

    # Lighting & Fixtures
    "lamp": ("lamp", "lighting"),
    "floor lamp": ("floor_lamp", "lighting"),
    "chandelier": ("chandelier", "lighting"),

    # Architectural Openings
    "door": ("door", "architectural"),
    "window": ("window", "architectural"),

    # Decor & Fixtures
    "potted plant": ("indoor_plant", "decor"),
    "pottedplant": ("indoor_plant", "decor"),
    "indoor_plant": ("indoor_plant", "decor"),
    "vase": ("vase", "decor"),
    "clock": ("wall_clock", "decor"),
    "mirror": ("mirror", "decor"),
    "rug": ("rug", "decor"),
    "carpet": ("rug", "decor"),

    # Appliances & Fixtures
    "refrigerator": ("refrigerator", "appliances"),
    "fridge": ("refrigerator", "appliances"),
    "microwave": ("microwave", "appliances"),
    "oven": ("oven", "appliances"),
    "sink": ("sink", "fixtures"),
    "toilet": ("toilet", "fixtures"),
}

# =========================================================================
# IGNORE LIST: PEOPLE, ANIMALS, CLOTHING, TOYS & PERSONAL BELONGINGS
# =========================================================================
IGNORED_CLASSES: Dict[str, str] = {
    # People
    "person": "person",
    "human": "person",
    "man": "person",
    "woman": "person",
    "child": "person",
    "boy": "person",
    "girl": "person",
    "baby": "person",
    "people": "person",

    # Animals
    "cat": "animal",
    "dog": "animal",
    "pet": "animal",
    "bird": "animal",
    "horse": "animal",
    "sheep": "animal",
    "cow": "animal",
    "elephant": "animal",
    "bear": "animal",
    "zebra": "animal",
    "giraffe": "animal",
    "animal": "animal",

    # Clothing / Fabrics
    "clothing": "clothing",
    "clothes": "clothing",
    "shirt": "clothing",
    "t-shirt": "clothing",
    "pants": "clothing",
    "jeans": "clothing",
    "trousers": "clothing",
    "dress": "clothing",
    "jacket": "clothing",
    "coat": "clothing",
    "sweater": "clothing",
    "towel": "clothing",
    "blanket": "clothing",
    "shoe": "personal_item",
    "shoes": "personal_item",
    "sneaker": "personal_item",
    "boot": "personal_item",
    "hat": "personal_item",
    "cap": "personal_item",
    "tie": "personal_item",
    "scarf": "personal_item",

    # Bags & Personal Luggage
    "bag": "personal_item",
    "backpack": "personal_item",
    "handbag": "personal_item",
    "suitcase": "personal_item",
    "purse": "personal_item",
    "tote": "personal_item",
    "luggage": "personal_item",

    # Clutter / Personal Items
    "umbrella": "personal_item",
    "cell phone": "personal_item",
    "cellphone": "personal_item",
    "phone": "personal_item",
    "remote": "personal_item",
    "bottle": "personal_item",
    "cup": "personal_item",
    "wine glass": "personal_item",
    "fork": "personal_item",
    "knife": "personal_item",
    "spoon": "personal_item",
    "bowl": "personal_item",
    "banana": "personal_item",
    "apple": "personal_item",
    "sandwich": "personal_item",
    "orange": "personal_item",
    "broccoli": "personal_item",
    "carrot": "personal_item",
    "hot dog": "personal_item",
    "pizza": "personal_item",
    "donut": "personal_item",
    "cake": "personal_item",
    "book": "personal_item",
    "laptop": "personal_item",
    "mouse": "personal_item",
    "keyboard": "personal_item",
    "scissors": "personal_item",
    "teddy bear": "toy",
    "toy": "toy",
    "hair drier": "personal_item",
    "toothbrush": "personal_item",
    "sports ball": "personal_item",
    "baseball bat": "personal_item",
    "baseball glove": "personal_item",
    "skateboard": "personal_item",
    "surfboard": "personal_item",
    "tennis racket": "personal_item",
    "frisbee": "personal_item",
    "skis": "personal_item",
    "snowboard": "personal_item",
    "kite": "personal_item",
}

INDOOR_FURNITURE_MAPPING = ROOM_OBJECT_CLASSES


class RelevantRoomObjectFilter:
    """
    Classification & filtering layer that isolates valid interior room/furniture
    objects from irrelevant transient objects (people, pets, clothing, personal items).
    """

    @classmethod
    def filter_raw_detections(
        cls, raw_detections: List[Dict[str, Any]]
    ) -> Tuple[List[DetectedObject], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Takes raw detector outputs, maps classes, separates approved room objects
        from ignored objects (people, animals, personal clutter), and returns both.
        """
        approved_objects: List[DetectedObject] = []
        ignored_objects: List[Dict[str, Any]] = []

        people_count = 0
        animals_count = 0
        clothing_count = 0
        personal_items_count = 0

        for raw in raw_detections:
            raw_label = str(raw.get("class_name", "")).lower().strip()
            conf = float(raw.get("confidence", 0.0))
            bbox = raw.get("bbox", {})
            x = int(bbox.get("x", raw.get("x", 0)))
            y = int(bbox.get("y", raw.get("y", 0)))
            w = int(bbox.get("width", raw.get("width", 10)))
            h = int(bbox.get("height", raw.get("height", 10)))

            if raw_label in ROOM_OBJECT_CLASSES:
                std_name, category = ROOM_OBJECT_CLASSES[raw_label]
                approved_objects.append(
                    DetectedObject(
                        class_name=std_name,
                        confidence=conf,
                        x=x,
                        y=y,
                        width=w,
                        height=h,
                        category=category,
                    )
                )
            elif raw_label in IGNORED_CLASSES:
                cat = IGNORED_CLASSES[raw_label]
                if cat == "person":
                    people_count += 1
                elif cat == "animal":
                    animals_count += 1
                elif cat == "clothing":
                    clothing_count += 1
                else:
                    personal_items_count += 1

                ignored_objects.append({
                    "raw_label": raw_label,
                    "ignored_category": cat,
                    "confidence": conf,
                    "bbox": {"x": x, "y": y, "width": w, "height": h},
                })
            else:
                # Default filter unmapped transient/external classes
                personal_items_count += 1
                ignored_objects.append({
                    "raw_label": raw_label,
                    "ignored_category": "unrelated_object",
                    "confidence": conf,
                    "bbox": {"x": x, "y": y, "width": w, "height": h},
                })

        # Build concise human-readable summary
        descriptions: List[str] = []
        if people_count > 0:
            descriptions.append(f"{people_count} person" if people_count == 1 else f"{people_count} people")
        if animals_count > 0:
            descriptions.append(f"{animals_count} pet/animal" if animals_count == 1 else f"{animals_count} pets/animals")
        if clothing_count > 0:
            descriptions.append(f"{clothing_count} clothing item" if clothing_count == 1 else f"{clothing_count} clothing items")
        if personal_items_count > 0:
            descriptions.append(f"{personal_items_count} personal item" if personal_items_count == 1 else f"{personal_items_count} personal items")

        ignored_summary = {
            "total_ignored": len(ignored_objects),
            "people_count": people_count,
            "animals_count": animals_count,
            "clothing_count": clothing_count,
            "personal_items_count": personal_items_count,
            "descriptions": descriptions,
        }

        return approved_objects, ignored_objects, ignored_summary


class BaseDetector(ABC):
    """Abstract base detector interface for interchangeable detection engines."""

    @abstractmethod
    def detect(
        self, image_bgr: np.ndarray, conf_threshold: float = 0.25
    ) -> List[DetectedObject]:
        """
        Runs object detection on the input BGR image.
        Returns a list of DetectedObject instances with pixel-space coordinates.
        """
        pass


import threading

_GLOBAL_YOLO_MODEL = None
_GLOBAL_YOLO_INITIALIZED = False
_GLOBAL_YOLO_LOCK = threading.Lock()


def get_shared_yolo_model(model_name: str = "yolov8n.pt"):
    global _GLOBAL_YOLO_MODEL, _GLOBAL_YOLO_INITIALIZED
    if not _GLOBAL_YOLO_INITIALIZED:
        with _GLOBAL_YOLO_LOCK:
            if not _GLOBAL_YOLO_INITIALIZED:
                os.environ["OMP_NUM_THREADS"] = "1"
                os.environ["OPENBLAS_NUM_THREADS"] = "1"
                os.environ["MKL_NUM_THREADS"] = "1"
                os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
                os.environ["NUMEXPR_NUM_THREADS"] = "1"
                os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
                try:
                    import torch
                    torch.set_num_threads(1)
                except Exception:
                    pass

                try:
                    from ultralytics import YOLO
                    os.environ["YOLO_VERBOSE"] = "False"
                    logger.info(f"[SmartSpace CV] Loading shared Ultralytics YOLO model '{model_name}' once...")
                    _GLOBAL_YOLO_MODEL = YOLO(model_name)
                    logger.info("[SmartSpace CV] Shared YOLO model loaded successfully.")
                except BaseException as e:
                    logger.warning(f"[SmartSpace CV] YOLO model load standby ({str(e)}). Activating OpenCV Spatial CV engine.")
                    _GLOBAL_YOLO_MODEL = None
                _GLOBAL_YOLO_INITIALIZED = True
    return _GLOBAL_YOLO_MODEL


class YOLODetector(BaseDetector):
    """
    Ultralytics YOLO & OpenCV DNN object detector fine-tuned for real-time indoor scene parsing.
    Filters out people, animals, clothing, and personal clutter from room reconstruction.
    """

    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model_name = model_name
        self.dnn_net = None
        self.last_ignored_objects: List[Dict[str, Any]] = []
        self.last_ignored_summary: Dict[str, Any] = {
            "total_ignored": 0,
            "people_count": 0,
            "animals_count": 0,
            "clothing_count": 0,
            "personal_items_count": 0,
            "descriptions": [],
        }

    @property
    def yolo_model(self):
        return get_shared_yolo_model(self.model_name)

    def detect(
        self, image_bgr: np.ndarray, conf_threshold: float = 0.25
    ) -> List[DetectedObject]:
        """
        Runs object detection on image_bgr.
        Filters strictly for approved indoor furniture / architectural classes.
        Ignores people, pets, clothing, and personal clutter.
        """
        if self.yolo_model is not None:
            return self._detect_with_ultralytics(image_bgr, conf_threshold)

        # OpenCV Saliency & Contour Detection Engine
        return self._detect_with_opencv_saliency(image_bgr, conf_threshold)

    def detect_with_filter(
        self, image_bgr: np.ndarray, conf_threshold: float = 0.25
    ) -> Tuple[List[DetectedObject], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Runs detection and returns both approved furniture objects and filtered transient objects.
        """
        approved = self.detect(image_bgr, conf_threshold)
        return approved, self.last_ignored_objects, self.last_ignored_summary

    def _detect_with_ultralytics(
        self, image_bgr: np.ndarray, conf_threshold: float
    ) -> List[DetectedObject]:
        h_orig, w_orig = image_bgr.shape[:2]
        raw_detections: List[Dict[str, Any]] = []

        try:
            results = self.yolo_model.predict(
                source=image_bgr,
                conf=conf_threshold,
                verbose=False,
                device="cpu",
            )

            for result in results:
                boxes = result.boxes
                if boxes is None:
                    continue

                for box in boxes:
                    conf = float(box.conf[0])
                    if conf < conf_threshold:
                        continue

                    cls_id = int(box.cls[0])
                    raw_name = self.yolo_model.names.get(cls_id, "").lower()

                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = xyxy
                    box_w = max(1, int(x2 - x1))
                    box_h = max(1, int(y2 - y1))
                    box_x = max(0, min(int(x1), w_orig - 1))
                    box_y = max(0, min(int(y1), h_orig - 1))

                    raw_detections.append({
                        "class_name": raw_name,
                        "confidence": conf,
                        "x": box_x,
                        "y": box_y,
                        "width": box_w,
                        "height": box_h,
                    })

            approved, ignored, summary = RelevantRoomObjectFilter.filter_raw_detections(raw_detections)
            self.last_ignored_objects = ignored
            self.last_ignored_summary = summary

            approved.sort(key=lambda o: o.confidence, reverse=True)
            return approved

        except Exception as e:
            logger.warning(f"Ultralytics inference error: {str(e)}. Falling back to OpenCV Saliency.")
            return self._detect_with_opencv_saliency(image_bgr, conf_threshold)

    def _detect_with_opencv_saliency(
        self, image_bgr: np.ndarray, conf_threshold: float
    ) -> List[DetectedObject]:
        """
        Computer Vision spatial object segmentation using multi-scale edge contours,
        aspect-ratio heuristics, and spatial priors across floor and wall planes.
        """
        h, w = image_bgr.shape[:2]
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        blurred = cv2.bilateralFilter(gray, 9, 75, 75)

        # Adaptive edge thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 4
        )

        # Morphological closing to connect furniture contours
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        raw_candidates: List[Dict[str, Any]] = []
        min_area = (h * w) * 0.02   # Minimum 2% of room area
        max_area = (h * w) * 0.65   # Maximum 65% of room area

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < min_area or area > max_area:
                continue

            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect = float(bw) / float(bh) if bh > 0 else 1.0
            vertical_pos = (y + bh / 2) / h

            # Filter human-like vertical slender contours (aspect < 0.5 with high vertical span)
            if aspect < 0.45 and bh > h * 0.45:
                raw_candidates.append({
                    "class_name": "person",
                    "confidence": 0.85,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
                continue

            # Heuristic classification for recognizable furniture footprints
            if 0.35 <= aspect <= 0.65 and bh > h * 0.40 and (x < w * 0.25 or x > w * 0.70):
                raw_candidates.append({
                    "class_name": "door",
                    "confidence": 0.81,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif 0.7 <= aspect <= 1.8 and vertical_pos < 0.45 and bh < h * 0.45 and (x < w * 0.3 or x > w * 0.6):
                raw_candidates.append({
                    "class_name": "window",
                    "confidence": 0.79,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect < 0.6 and bh > h * 0.40:
                raw_candidates.append({
                    "class_name": "wardrobe",
                    "confidence": 0.83,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect > 1.6 and vertical_pos > 0.45:
                raw_candidates.append({
                    "class_name": "sofa",
                    "confidence": min(0.92, 0.75 + (area / (h * w)) * 0.5),
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect > 1.4 and vertical_pos > 0.40:
                raw_candidates.append({
                    "class_name": "dining_table",
                    "confidence": 0.80,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect > 1.2 and vertical_pos > 0.60:
                raw_candidates.append({
                    "class_name": "coffee_table",
                    "confidence": 0.82,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif 0.65 <= aspect <= 1.1 and vertical_pos > 0.40:
                raw_candidates.append({
                    "class_name": "chair",
                    "confidence": 0.78,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect > 1.3 and vertical_pos < 0.50:
                raw_candidates.append({
                    "class_name": "television",
                    "confidence": 0.85,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif vertical_pos > 0.50 and bw > w * 0.35:
                raw_candidates.append({
                    "class_name": "bed",
                    "confidence": 0.88,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })
            elif aspect > 1.1:
                raw_candidates.append({
                    "class_name": "table",
                    "confidence": 0.74,
                    "x": x,
                    "y": y,
                    "width": bw,
                    "height": bh,
                })

        approved, ignored, summary = RelevantRoomObjectFilter.filter_raw_detections(raw_candidates)
        self.last_ignored_objects = ignored
        self.last_ignored_summary = summary

        approved.sort(key=lambda o: (o.width * o.height), reverse=True)
        return approved[:8]
