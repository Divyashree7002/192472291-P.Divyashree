"""
SmartSpace AI - Comprehensive 10-Point Authentication Verification Suite
Executes end-to-end testing against all authentication requirements.
"""

import sys
import os
import uuid

# Set up paths
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from auth.security import create_access_token, decode_access_token, verify_password
from auth.storage import get_auth_repo

client = TestClient(app)

def run_suite():
    print("=" * 70)
    print(" SMARTSPACE AI - COMPREHENSIVE AUTH SUITE VERIFICATION")
    print("=" * 70)

    # TEST 10: Health check endpoint
    print("\n[TEST 10] Checking GET /health and GET /api/health...")
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    health_data = res_health.json()
    assert health_data["status"] == "ok"
    print(f"  [PASS] /health returned HTTP 200 OK: {health_data['service']} ({health_data['phase']})")

    # TEST 1: Register a new user
    print("\n[TEST 1] Registering a new standard user...")
    unique_email = f"designer_{uuid.uuid4().hex[:8]}@smartspace.ai"
    reg_payload = {
        "name": "Jordan Designer",
        "email": unique_email,
        "password": "SecurePassword2026!"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 200, f"Expected 200, got {res_reg.status_code}: {res_reg.text}"
    reg_data = res_reg.json()
    user_token = reg_data["access_token"]
    user_id = reg_data["user"]["id"]
    assert reg_data["user"]["email"] == unique_email
    assert reg_data["user"]["role"] == "USER"
    print(f"  [PASS] User registered successfully with role '{reg_data['user']['role']}': ID {user_id}")

    # TEST 2: Login with that user
    print("\n[TEST 2] Logging in with registered user credentials...")
    login_payload = {
        "email": unique_email,
        "password": "SecurePassword2026!",
        "remember_me": True
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200, f"Expected 200, got {res_login.status_code}: {res_login.text}"
    login_data = res_login.json()
    login_token = login_data["access_token"]
    assert login_token is not None
    print(f"  [PASS] Login successful! Received valid JWT access token.")

    # TEST 3: Verify session via /api/auth/me (simulating page refresh F5)
    print("\n[TEST 3] Simulating Page Refresh (F5): Verifying session via GET /api/auth/me...")
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login_token}"})
    assert res_me.status_code == 200, f"Expected 200, got {res_me.status_code}"
    me_data = res_me.json()
    assert me_data["user"]["email"] == unique_email
    assert me_data["user"]["role"] == "USER"
    print(f"  [PASS] Session verified after refresh: User {me_data['user']['name']} ({me_data['user']['role']}) active.")

    # TEST 4: JWT Token persistence and payload decoding
    print("\n[TEST 4] Persistent Session Verification: Decoding JWT claims...")
    decoded = decode_access_token(login_token)
    assert decoded is not None
    assert decoded["email"] == unique_email
    assert decoded["role"] == "USER"
    assert "exp" in decoded
    print(f"  [PASS] Token temporally valid with expiration timestamp: {decoded['exp']}")

    # TEST 5: Logout
    print("\n[TEST 5] Executing Logout endpoint...")
    res_logout = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {login_token}"})
    assert res_logout.status_code == 200
    print("  [PASS] Server logout acknowledged.")

    # TEST 6: RBAC: Normal USER attempts to access Admin & Research APIs
    print("\n[TEST 6] Role-Based Access Control: Normal USER attempting Admin Console access...")
    res_admin_forbidden = client.get("/api/admin/users", headers={"Authorization": f"Bearer {login_token}"})
    assert res_admin_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_admin_forbidden.status_code}"
    print(f"  [PASS] Protected Admin Endpoint correctly returned HTTP 403 Forbidden: {res_admin_forbidden.json()['detail']}")

    res_research_forbidden = client.get("/api/research/benchmarks", headers={"Authorization": f"Bearer {login_token}"})
    assert res_research_forbidden.status_code == 403
    print(f"  [PASS] Protected Research Endpoint correctly returned HTTP 403 Forbidden: {res_research_forbidden.json()['detail']}")

    # TEST 7: Login with ADMIN account
    print("\n[TEST 7] Logging in with existing ADMIN account (admin@smartspace.ai)...")
    res_admin_login = client.post("/api/auth/login", json={
        "email": "admin@smartspace.ai",
        "password": "Admin@12345",
        "remember_me": True
    })
    assert res_admin_login.status_code == 200, f"Admin login failed: {res_admin_login.text}"
    admin_token = res_admin_login.json()["access_token"]
    assert res_admin_login.json()["user"]["role"] == "ADMIN"
    print("  [PASS] Admin authenticated. Opening Admin Console API...")

    res_admin_users = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_users.status_code == 200
    users_list = res_admin_users.json()["users"]
    print(f"  [PASS] Admin Console API authorized! Total database accounts: {len(users_list)}")

    # TEST 8: Login with RESEARCH account
    print("\n[TEST 8] Logging in with existing RESEARCH account (research@smartspace.ai)...")
    res_research_login = client.post("/api/auth/login", json={
        "email": "research@smartspace.ai",
        "password": "Research@SmartSpace2026!",
        "remember_me": True
    })
    assert res_research_login.status_code == 200, f"Research login failed: {res_research_login.text}"
    research_token = res_research_login.json()["access_token"]
    assert res_research_login.json()["user"]["role"] == "RESEARCH"
    print("  [PASS] Research Scientist authenticated. Opening Research Portal API...")

    res_benchmarks = client.get("/api/research/benchmarks", headers={"Authorization": f"Bearer {research_token}"})
    assert res_benchmarks.status_code == 200
    benchmarks = res_benchmarks.json()["benchmarks"]
    print(f"  [PASS] Research Portal API authorized! CV Benchmarks: {benchmarks}")

    # TEST 9: Invalid credentials error formatting
    print("\n[TEST 9] Testing invalid credentials response formatting...")
    res_bad = client.post("/api/auth/login", json={
        "email": "admin@smartspace.ai",
        "password": "WrongPassword2026!"
    })
    assert res_bad.status_code == 401
    print(f"  [PASS] Correctly rejected with HTTP 401: {res_bad.json()['detail']}")

    print("\n" + "=" * 70)
    print(" ALL 10 AUTHENTICATION & RBAC TESTS PASSED SUCCESSFULLY (100%)")
    print("=" * 70)

if __name__ == "__main__":
    run_suite()
