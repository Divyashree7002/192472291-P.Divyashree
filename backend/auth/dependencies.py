"""
SmartSpace AI - FastAPI Authentication & Role Authorization Dependencies
Enforces Bearer token validation and role-based permissions (USER, ADMIN, RESEARCH).
"""

from fastapi import Depends, HTTPException, status, Header
from typing import Optional, List, Callable

from .security import decode_access_token
from .storage import get_auth_repo, User


async def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """
    Extracts and validates the Bearer JWT token from the Authorization header.
    Returns the authenticated User or raises HTTP 401 Unauthorized.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Format must be 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    repo = get_auth_repo()
    user = repo.get_user_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Factory creating a FastAPI dependency that enforces role-based access.
    Returns HTTP 403 Forbidden if user lacks required permissions.
    """
    normalized_allowed = [r.strip().upper() for r in allowed_roles]

    async def _role_verifier(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "USER").strip().upper()
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{user_role}' is not authorized to access this resource. Required role: {', '.join(normalized_allowed)}."
            )
        return current_user

    return _role_verifier


require_admin = require_role(["ADMIN"])
require_research = require_role(["RESEARCH", "ADMIN"])
