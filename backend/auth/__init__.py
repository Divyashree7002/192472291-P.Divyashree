"""
SmartSpace AI Authentication Package
"""

from .security import hash_password, verify_password, create_access_token, decode_access_token
from .storage import User, AuthRepository, get_auth_repo
from .dependencies import get_current_user, require_role, require_admin, require_research
from .router import router as auth_router, admin_router, research_router

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "User",
    "AuthRepository",
    "get_auth_repo",
    "get_current_user",
    "require_role",
    "require_admin",
    "require_research",
    "auth_router",
    "admin_router",
    "research_router",
]
