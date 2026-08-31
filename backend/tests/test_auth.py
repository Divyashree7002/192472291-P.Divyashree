"""
SmartSpace AI - Authentication & Authorization Unit & Integration Tests
Tests secure password hashing, JWT creation/verification, public user registration,
role enforcement (USER, ADMIN, RESEARCH), and route protection.
"""

import pytest
from fastapi.testclient import TestClient
import uuid

from main import app
from auth.security import hash_password, verify_password, create_access_token, decode_access_token
from auth.storage import get_auth_repo

client = TestClient(app)


def test_password_hashing():
    pwd = "SecurePassword2026!"
    hashed = hash_password(pwd)
    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_lifecycle():
    payload = {"sub": "usr_test123", "email": "test@smartspace.ai", "role": "USER"}
    token = create_access_token(payload, expires_delta_seconds=3600)
    assert token is not None
    assert len(token.split('.')) == 3

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "usr_test123"
    assert decoded["email"] == "test@smartspace.ai"
    assert decoded["role"] == "USER"

    # Expired token test
    expired_token = create_access_token(payload, expires_delta_seconds=-10)
    assert decode_access_token(expired_token) is None


def test_public_registration_enforces_user_role():
    """SECURITY TEST: Public registration must ALWAYS produce role USER, even if client passes role='ADMIN'."""
    unique_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Designer",
            "email": unique_email,
            "password": "Password123!",
            "role": "ADMIN",  # Attacker attempts to request admin role
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["role"] == "USER"  # Must strictly be USER


def test_duplicate_registration_fails():
    unique_email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    res1 = client.post(
        "/api/auth/register",
        json={
            "name": "User One",
            "email": unique_email,
            "password": "Password123!"
        }
    )
    assert res1.status_code == 200

    # Attempt duplicate
    res2 = client.post(
        "/api/auth/register",
        json={
            "name": "User Two",
            "email": unique_email,
            "password": "Password123!"
        }
    )
    assert res2.status_code == 409


def test_login_and_get_me():
    # Login with seeded user account
    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@smartspace.ai",
            "password": "User@SmartSpace2026!",
            "remember_me": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    token = data["access_token"]
    assert token is not None

    # Call /api/auth/me with Bearer token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == "user@smartspace.ai"
    assert me_data["user"]["role"] == "USER"


def test_login_invalid_password():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@smartspace.ai",
            "password": "IncorrectPassword!"
        }
    )
    assert response.status_code == 401


def test_unauthenticated_request_rejected():
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_admin_login_and_role_verification():
    """Verifies that admin@smartspace.ai with password Admin@12345 authenticates and acquires ADMIN role."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@smartspace.ai",
            "password": "Admin@12345",
            "remember_me": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@smartspace.ai"
    assert data["user"]["role"] == "ADMIN"

    admin_token = data["access_token"]

    # Verify /api/auth/me
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == "admin@smartspace.ai"
    assert me_data["user"]["role"] == "ADMIN"

    # Verify admin-only API
    users_res = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert users_res.status_code == 200
    assert "users" in users_res.json()


def test_role_authorization_admin_portal():
    # 1. Login as standard USER
    user_login = client.post(
        "/api/auth/login",
        json={"email": "user@smartspace.ai", "password": "User@SmartSpace2026!"}
    ).json()
    user_token = user_login["access_token"]

    # 2. Login as ADMIN
    admin_login = client.post(
        "/api/auth/login",
        json={"email": "admin@smartspace.ai", "password": "Admin@12345"}
    ).json()
    admin_token = admin_login["access_token"]

    # 3. User attempts to access Admin API -> Expect 403 Forbidden
    user_admin_res = client.get(
        "/api/admin/system-status",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert user_admin_res.status_code == 403

    # 4. Admin accesses Admin API -> Expect 200 OK
    admin_res = client.get(
        "/api/admin/system-status",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_res.status_code == 200
    assert admin_res.json()["authorized_admin"] == "admin@smartspace.ai"


def test_role_authorization_research_portal():
    # 1. Login as standard USER
    user_login = client.post(
        "/api/auth/login",
        json={"email": "user@smartspace.ai", "password": "User@SmartSpace2026!"}
    ).json()
    user_token = user_login["access_token"]

    # 2. Login as RESEARCH
    research_login = client.post(
        "/api/auth/login",
        json={"email": "research@smartspace.ai", "password": "Research@SmartSpace2026!"}
    ).json()
    research_token = research_login["access_token"]

    # 3. User attempts to access Research API -> Expect 403 Forbidden
    user_res = client.get(
        "/api/research/benchmarks",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert user_res.status_code == 403

    # 4. Researcher accesses Research API -> Expect 200 OK
    research_res = client.get(
        "/api/research/benchmarks",
        headers={"Authorization": f"Bearer {research_token}"}
    )
    assert research_res.status_code == 200
    assert "benchmarks" in research_res.json()
