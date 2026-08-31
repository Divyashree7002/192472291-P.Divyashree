# SmartSpace AI - FastAPI Backend Service (Phase 3)

This directory contains the Python FastAPI backend service for the SmartSpace AI platform.

---

## Features (Phase 3)

- **FastAPI Core**: High-performance asynchronous REST API.
- **CORS Enabled**: Configured for React/Vite development server on `http://localhost:3000` and `http://127.0.0.1:3000`.
- **Health Check Endpoint**: `GET /api/health` providing service availability and latency checks.
- **Room Image Ingestion**: `POST /api/analyze-room` receiving `multipart/form-data` image uploads with format validation (JPG, JPEG, PNG, WebP) and size limits.

---

## Installation & Running on Windows

### 1. Prerequisites
- Python 3.10+ (Verified on Python 3.11)
- `pip` package manager

### 2. Create and Activate Virtual Environment (Recommended)

From the project root or `backend/` directory:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Run the Backend Server

```powershell
uvicorn main:app --reload --port 8000
```

The API service will start on:
- **Base URL**: `http://127.0.0.1:8000`
- **Health Check**: `http://127.0.0.1:8000/api/health`
- **Interactive OpenAPI Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## API Endpoints

### `GET /api/health`
Returns backend service availability status.

**Sample Response:**
```json
{
  "status": "ok",
  "service": "SmartSpace AI Backend"
}
```

### `POST /api/analyze-room`
Accepts a room image file via `multipart/form-data`.

**Form Parameter:**
- `file`: UploadFile (Allowed: `.jpg`, `.jpeg`, `.png`, `.webp`, Max: 15MB)

**Sample Response:**
```json
{
  "success": true,
  "filename": "room_capture_1720000000000.jpg",
  "content_type": "image/jpeg",
  "message": "Room image received successfully",
  "cv_status": "pending"
}
```
