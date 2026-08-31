"""
SmartSpace AI - Computer Vision Preprocessing Module (Phase 4)
Provides robust image decoding, validation, quality metrics, and spatial edge extraction.
"""

from typing import Tuple, Dict, Any, List, Optional
import numpy as np
import cv2
import io
from PIL import Image


class ImageQualityReport:
    """Encapsulates image quality metrics computed via OpenCV."""

    def __init__(
        self,
        width: int,
        height: int,
        aspect_ratio: float,
        brightness: float,
        contrast: float,
        sharpness: float,
        quality_rating: str,
        quality_issues: List[str],
    ):
        self.width = width
        self.height = height
        self.aspect_ratio = aspect_ratio
        self.brightness = round(brightness, 1)
        self.contrast = round(contrast, 1)
        self.sharpness = round(sharpness, 1)
        self.quality_rating = quality_rating
        self.quality_issues = quality_issues

    def to_dict(self) -> Dict[str, Any]:
        return {
            "width": self.width,
            "height": self.height,
            "aspect_ratio": round(self.aspect_ratio, 2),
            "brightness": self.brightness,
            "contrast": self.contrast,
            "sharpness": self.sharpness,
            "quality_rating": self.quality_rating,
            "quality_issues": self.quality_issues,
        }


class ImagePreprocessor:
    """
    Handles validation, decoding, resolution management, and quality assessment.
    """

    MIN_WIDTH = 64
    MIN_HEIGHT = 64
    DEFAULT_MAX_INFERENCE_DIM = 1280

    @classmethod
    def decode_and_validate(cls, image_bytes: bytes) -> np.ndarray:
        """
        Decodes raw bytes into a BGR OpenCV NumPy array and validates dimensions.
        Raises ValueError if image is invalid, corrupted, or too small.
        """
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Image data is empty (0 bytes received).")

        # Try OpenCV imdecode
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Fallback to PIL in case of exotic color formats / truncated streams
        if image is None:
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                pil_img = pil_img.convert("RGB")
                rgb_arr = np.array(pil_img)
                image = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
            except Exception as e:
                raise ValueError(f"Corrupted or unsupported image stream: {str(e)}")

        if image is None or image.size == 0:
            raise ValueError("Failed to decode image into valid pixel matrix.")

        h, w = image.shape[:2]
        if w < cls.MIN_WIDTH or h < cls.MIN_HEIGHT:
            raise ValueError(
                f"Image resolution ({w}x{h}) is too small. Minimum required: {cls.MIN_WIDTH}x{cls.MIN_HEIGHT}."
            )

        return image

    @classmethod
    def assess_quality(cls, image_bgr: np.ndarray) -> ImageQualityReport:
        """
        Computes brightness, contrast, and Laplacian sharpness variance.
        Classifies quality and lists potential spatial scanning warnings.
        """
        h, w = image_bgr.shape[:2]
        aspect_ratio = float(w) / float(h) if h > 0 else 1.0

        # Convert to Grayscale
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Brightness: Mean luminance
        brightness = float(np.mean(gray))

        # 2. Contrast: Standard deviation of pixel intensities
        contrast = float(np.std(gray))

        # 3. Sharpness / Blur: Variance of Laplacian
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness = float(laplacian.var())

        quality_issues = []
        if brightness < 45.0:
            quality_issues.append("Low lighting: Room appears underexposed; boundaries may be muted.")
        elif brightness > 215.0:
            quality_issues.append("High exposure: Highlights may wash out wall-ceiling junctions.")

        if contrast < 25.0:
            quality_issues.append("Low contrast: Muted tonal separation across room planes.")

        if sharpness < 50.0:
            quality_issues.append("Motion blur detected: Consider holding the camera steady.")

        # Overall rating
        if len(quality_issues) == 0 and sharpness >= 100.0:
            quality_rating = "good"
        elif len(quality_issues) <= 1:
            quality_rating = "fair"
        else:
            quality_rating = "poor"

        return ImageQualityReport(
            width=w,
            height=h,
            aspect_ratio=aspect_ratio,
            brightness=brightness,
            contrast=contrast,
            sharpness=sharpness,
            quality_rating=quality_rating,
            quality_issues=quality_issues,
        )

    @classmethod
    def resize_preserving_aspect(
        cls, image: np.ndarray, max_dim: int = DEFAULT_MAX_INFERENCE_DIM
    ) -> Tuple[np.ndarray, float]:
        """
        Resizes image so that max(width, height) <= max_dim while preserving aspect ratio.
        Returns the resized image and the scaling ratio (scale = resized / original).
        """
        h, w = image.shape[:2]
        max_current = max(h, w)

        if max_current <= max_dim:
            return image.copy(), 1.0

        scale = float(max_dim) / float(max_current)
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))

        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return resized, scale

    @classmethod
    def extract_edges(
        cls, image_gray: np.ndarray, low_thresh: int = 50, high_thresh: int = 150
    ) -> np.ndarray:
        """
        Applies bilateral filtering followed by Canny edge extraction.
        """
        blurred = cv2.bilateralFilter(image_gray, d=7, sigmaColor=50, sigmaSpace=50)
        edges = cv2.Canny(blurred, low_thresh, high_thresh)
        return edges
