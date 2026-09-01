"""
SmartSpace AI - FastAPI Backend Service (Phase 6)
Provides health checks, Computer Vision analysis, Depth Estimation, 3D Spatial Reconstruction,
and AI-Powered Interior Design Recommendations.
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import logging

from cv.pipeline import RoomCVPipeline
from recommendation.engine import RecommendationEngine
from auth import auth_router, admin_router, research_router, get_auth_repo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartspace.api")

# Initialize database and default accounts
get_auth_repo()

app = FastAPI(
    title="SmartSpace AI Backend",
    description="FastAPI Backend with Real CV, 3D Spatial Reconstruction, and AI Recommendation Engine",
    version="0.6.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Include Authentication & Protected Portals Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(research_router)

# CORS Middleware Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "https://smartspace-frontend.onrender.com",
    "http://smartspace-frontend.onrender.com",
]

# Read dynamic FRONTEND_URL and custom ALLOWED_ORIGINS from environment
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url:
    for url in frontend_url.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(cleaned)

custom_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
if custom_origins:
    for url in custom_origins.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|[a-zA-Z0-9-]+\.onrender\.com|[a-zA-Z0-9-]+\.vercel\.app|[a-zA-Z0-9-]+\.netlify\.app)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit

_cv_pipeline: Optional[RoomCVPipeline] = None


def get_cv_pipeline() -> RoomCVPipeline:
    global _cv_pipeline
    if _cv_pipeline is None:
        logger.info("Initializing RoomCVPipeline (Phase 6)...")
        _cv_pipeline = RoomCVPipeline()
    return _cv_pipeline


async def _validate_and_read_image(file: UploadFile) -> bytes:
    """Helper to validate file presence, format, and size."""
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided."
        )

    _, ext = os.path.splitext(file.filename.lower())
    content_type = (file.content_type or "").lower()

    if ext not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{content_type or ext}'. Allowed formats: JPG, JPEG, PNG, WebP."
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file stream: {str(e)}"
        )

    file_size = len(content)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES / (1024*1024):.0f} MB."
        )

    return content


# Pydantic Schemas for Recommendations
class RecommendationRequest(BaseModel):
    room_type: str = Field(default="living_room", description="Target room archetype")
    design_style: str = Field(default="modern", description="Preferred interior design style")
    budget: int = Field(default=500000, description="Budget ceiling in INR (₹)")
    length: Optional[float] = Field(default=4.8, description="Room length in meters")
    width: Optional[float] = Field(default=3.6, description="Room width in meters")
    height: Optional[float] = Field(default=2.8, description="Room height in meters")
    existing_objects: Optional[List[Dict[str, Any]]] = Field(default=None, description="Objects detected via CV")
    planes: Optional[List[Dict[str, Any]]] = Field(default=None, description="Planes fitted via RANSAC")


@app.get("/", summary="Root Index Endpoint")
async def root():
    """Root metadata endpoint for health confirmation."""
    return {
        "status": "online",
        "service": "SmartSpace AI Backend API",
        "version": "0.6.0",
        "documentation": "/docs",
        "health": "/health",
    }


@app.get("/api/health", summary="Health Check Endpoint")
@app.get("/health", include_in_schema=False)
async def health_check():
    """Returns backend health status and Phase 6 capabilities."""
    return {
        "status": "ok",
        "service": "SmartSpace AI Backend",
        "phase": "Phase 6 - AI Recommendation Engine",
        "features": [
            "computer_vision",
            "depth_estimation",
            "ransac_plane_fitting",
            "spatial_reconstruction",
            "ai_recommendation_engine",
            "budget_optimization_inr",
        ],
    }


@app.post("/api/analyze-room", summary="End-to-End Room Analysis with CV & Spatial Reconstruction")
async def analyze_room(
    file: UploadFile = File(...),
    room_type: str = Form("living_room"),
    design_style: str = Form("modern"),
    budget: int = Form(500000),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    confidence_threshold: float = Form(0.25),
):
    """
    Accepts an uploaded room image and optional metric priors.
    Executes full pipeline: quality assessment, YOLO detection, depth estimation,
    RANSAC plane fitting, and 3D metric spatial reconstruction.
    """
    content = await _validate_and_read_image(file)

    try:
        pipeline = get_cv_pipeline()
        dimensions = {
            "length": length,
            "width": width,
            "height": height,
        }
        result = pipeline.process_image(
            image_bytes=content,
            filename=file.filename,
            content_type=file.content_type or "image/jpeg",
            room_type=room_type,
            design_style=design_style,
            budget=budget,
            dimensions=dimensions,
            conf_threshold=confidence_threshold,
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image processing error: {str(val_err)}"
        )
    except Exception as exc:
        logger.error(f"Analysis error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Spatial analysis pipeline failed: {str(exc)}"
        )


@app.post("/api/estimate-depth", summary="Dedicated Monocular Depth Estimation")
async def estimate_depth(
    file: UploadFile = File(...),
):
    """
    Computes normalized relative depth map and colormap visualization for an image.
    """
    content = await _validate_and_read_image(file)

    try:
        pipeline = get_cv_pipeline()
        result = pipeline.estimate_depth_only(content)
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Depth estimation error: {str(val_err)}"
        )
    except Exception as exc:
        logger.error(f"Depth error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Depth estimation failed: {str(exc)}"
        )


@app.post("/api/reconstruct-room", summary="Dedicated 3D Spatial Reconstruction")
async def reconstruct_room(
    file: UploadFile = File(...),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    confidence_threshold: float = Form(0.25),
):
    """
    Performs 3D spatial room reconstruction, plane segmentation, and metric object localization.
    """
    content = await _validate_and_read_image(file)

    try:
        pipeline = get_cv_pipeline()
        dimensions = {"length": length, "width": width, "height": height}
        result = pipeline.reconstruct_room_only(
            image_bytes=content,
            dimensions=dimensions,
            conf_threshold=confidence_threshold,
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reconstruction error: {str(val_err)}"
        )
    except Exception as exc:
        logger.error(f"Reconstruction error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Spatial reconstruction failed: {str(exc)}"
        )


@app.post("/api/recommendations", summary="Generate Multi-Criteria Interior Design Recommendations")
async def get_recommendations(
    request: RecommendationRequest = Body(...),
):
    """
    Synthesizes multi-criteria layout variations based on spatial parameters,
    design style, and target budget in INR.
    """
    try:
        plans = RecommendationEngine.generate_recommendations(
            room_type=request.room_type,
            design_style=request.design_style,
            budget_inr=request.budget,
            length_m=request.length or 4.8,
            width_m=request.width or 3.6,
            height_m=request.height or 2.8,
            existing_objects=request.existing_objects,
            planes=request.planes,
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "plans": plans,
                "count": len(plans),
                "currency": "INR",
                "room_type": request.room_type,
                "design_style": request.design_style,
                "budget_inr": request.budget,
            },
        )
    except Exception as exc:
        logger.error(f"Recommendation generation error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation engine failed: {str(exc)}"
        )


@app.post("/api/design-plan", summary="Generate Comprehensive Design Plan")
async def generate_design_plan(
    request: RecommendationRequest = Body(...),
):
    """
    Generates a single cohesive design plan report with itemized catalog,
    budget utilization, and spatial metrics.
    """
    try:
        result = RecommendationEngine.generate_single_design_plan(
            room_type=request.room_type,
            design_style=request.design_style,
            budget_inr=request.budget,
            length_m=request.length or 4.8,
            width_m=request.width or 3.6,
            height_m=request.height or 2.8,
            existing_objects=request.existing_objects,
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    except Exception as exc:
        logger.error(f"Design plan error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Design plan generation failed: {str(exc)}"
        )


@app.post("/api/renovation-plan", summary="Generate Renovation Quantity & Cost Estimate")
async def generate_renovation_plan(
    request: RecommendationRequest = Body(...),
):
    """
    Computes estimated material quantities (paint volume, flooring sq.m, ceiling)
    and itemized renovation budget in INR.
    """
    try:
        result = RecommendationEngine.generate_renovation_estimate(
            length_m=request.length or 4.8,
            width_m=request.width or 3.6,
            height_m=request.height or 2.8,
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    except Exception as exc:
        logger.error(f"Renovation estimation error: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Renovation estimation engine failed: {str(exc)}"
        )



if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8001"))
    logger.info(f"Starting SmartSpace AI Backend on {host}:{port}...")
    uvicorn.run("main:app", host=host, port=port, reload=False)
