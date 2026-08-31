"""
SmartSpace AI - FastAPI Authentication & Authorization Router
Provides /api/auth endpoints and role-protected demonstration APIs.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
import re

from .storage import get_auth_repo, User
from .security import verify_password, create_access_token
from .dependencies import get_current_user, require_admin, require_research

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
admin_router = APIRouter(prefix="/api/admin", tags=["Administration"])
research_router = APIRouter(prefix="/api/research", tags=["Research"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: str = Field(..., min_length=5, max_length=150, description="User email address")
    password: str = Field(..., min_length=6, max_length=128, description="User password (min 6 characters)")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User registered email")
    password: str = Field(..., description="User password")
    remember_me: Optional[bool] = Field(default=False, description="Extend session duration")


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    expires_in_seconds: int


class UserProfileResponse(BaseModel):
    user: Dict[str, Any]


@router.post("/register", summary="Public User Registration (Role: USER)", response_model=AuthResponse)
async def register_user(payload: RegisterRequest = Body(...)):
    """
    Public registration endpoint.
    SECURITY GUARANTEE: Public registration ALWAYS creates a standard USER account.
    Any role specified by client is ignored.
    """
    email = payload.email.strip().lower()
    name = payload.name.strip()
    password = payload.password

    if not EMAIL_REGEX.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    repo = get_auth_repo()
    existing = repo.get_user_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please log in."
        )

    try:
        # Strictly enforce role "USER" for public registrations
        user = repo.create_user(
            name=name,
            email=email,
            plain_password=password,
            role="USER"
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(ve))

    # Generate JWT token
    expires_delta = 86400 * 7  # 7 days
    token = create_access_token(
        payload={
            "sub": user.id,
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        expires_delta_seconds=expires_delta
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
        "expires_in_seconds": expires_delta,
    }


@router.post("/login", summary="User Login & Token Generation", response_model=AuthResponse)
async def login_user(payload: LoginRequest = Body(...)):
    """
    Authenticates user with email and password.
    Returns signed Bearer JWT token and authenticated user profile.
    """
    email = payload.email.strip().lower()
    password = payload.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    repo = get_auth_repo()
    user = repo.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator."
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    repo.update_last_login(user.id)

    # 30 days if remember_me else 7 days
    expires_delta = 86400 * 30 if payload.remember_me else 86400 * 7

    token = create_access_token(
        payload={
            "sub": user.id,
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        expires_delta_seconds=expires_delta
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
        "expires_in_seconds": expires_delta,
    }


@router.get("/me", summary="Get Current Authenticated User Profile", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile parsed from validated Bearer token.
    """
    return {
        "user": current_user.to_dict()
    }


@router.post("/logout", summary="User Logout")
async def logout_user():
    """
    Stateless client-side logout acknowledgement.
    """
    return {
        "status": "ok",
        "message": "Successfully logged out."
    }


# ==========================================
# Role-Protected Server Endpoints
# ==========================================

@admin_router.get("/users", summary="Admin: List All Registered Users")
async def admin_list_users(current_admin: User = Depends(require_admin)):
    """
    ADMIN ONLY: Returns list of all registered users in the database.
    """
    repo = get_auth_repo()
    users = repo.list_users()
    return {
        "total_users": len(users),
        "users": [u.to_dict() for u in users],
        "queried_by": current_admin.email
    }


@admin_router.get("/system-status", summary="Admin: Infrastructure Telemetry")
async def admin_system_status(current_admin: User = Depends(require_admin)):
    """
    ADMIN ONLY: Returns administrative system telemetry.
    """
    return {
        "status": "online",
        "gateway": "FastAPI Gateway v0.6.0",
        "authorized_admin": current_admin.email,
        "security": {
            "jwt_algorithm": "HS256",
            "password_hasher": "PBKDF2-HMAC-SHA256 (100k iters)",
            "role_enforcement": "Active"
        }
    }


@research_router.get("/benchmarks", summary="Research: Computer Vision Benchmarks")
async def research_benchmarks(current_researcher: User = Depends(require_research)):
    """
    RESEARCH ONLY: Returns model benchmarks and latency telemetry.
    """
    return {
        "benchmarks": {
            "yolo_inference_ms": 42.5,
            "depth_estimation_ms": 38.2,
            "ransac_fitting_ms": 19.8,
            "recommendation_solver_ms": 12.1
        },
        "authorized_researcher": current_researcher.email,
        "role": current_researcher.role
    }
