import os
import io
import base64
import numpy as np
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from main import app
from cv.pipeline import RoomCVPipeline

def create_synthetic_room_image(width=640, height=480, wall_color=(240, 235, 220), furniture_color=(100, 60, 40), add_person=False, seed=1):
    np.random.seed(seed)
    img = Image.new('RGB', (width, height), color=wall_color)
    draw = ImageDraw.Draw(img)
    
    # Draw floor
    floor_y = int(height * 0.6)
    draw.rectangle([0, floor_y, width, height], fill=(180, 140, 100))
    
    # Draw furniture (sofa / box)
    box_x1 = int(width * (0.2 + (seed % 3) * 0.1))
    box_y1 = int(height * 0.5)
    box_x2 = int(box_x1 + 150 + (seed * 20))
    box_y2 = int(height * 0.8)
    draw.rectangle([box_x1, box_y1, box_x2, box_y2], fill=furniture_color)
    
    if add_person:
        # Draw a person shape (head + body)
        px = int(width * 0.7)
        py = int(height * 0.4)
        draw.ellipse([px-15, py-15, px+15, py+15], fill=(220, 180, 150)) # head
        draw.rectangle([px-20, py+15, px+20, py+80], fill=(50, 50, 200)) # shirt/body
    
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def run_verifications():
    print("=== STARTING APPLICATION FLOW VERIFICATIONS ===")
    client = TestClient(app)
    
    # 1. Login & Session / Token Verification
    print("\n--- 1. Testing Login & Session Token ---")
    reg_res = client.post("/api/auth/register", json={
        "email": "testuser_verify@smartspace.ai",
        "password": "TestPassword123!",
        "name": "Verification User"
    })
    if reg_res.status_code in [200, 409]:
        print("Registration / Pre-existing User OK")
    
    login_res = client.post("/api/auth/login", json={
        "email": "testuser_verify@smartspace.ai",
        "password": "TestPassword123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    user_data = login_res.json()["user"]
    assert user_data["role"] == "USER"
    print("[OK] Login successful, JWT token issued, role is USER.")

    # Me Endpoint with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    print("[OK] Session restored via /api/auth/me endpoint.")

    # 2. RBAC Route Protection Verification
    print("\n--- 2. Testing RBAC Route Protection ---")
    admin_res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert admin_res.status_code == 403, f"Expected 403 Forbidden for normal user on /api/admin/users, got {admin_res.status_code}"
    print("[OK] Standard USER correctly denied access (HTTP 403) to Admin endpoint.")

    research_res = client.get("/api/research/benchmarks", headers={"Authorization": f"Bearer {token}"})
    assert research_res.status_code == 403, f"Expected 403 Forbidden for normal user on /api/research/benchmarks, got {research_res.status_code}"
    print("[OK] Standard USER correctly denied access (HTTP 403) to Research endpoint.")

    # Admin User Access Test
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@smartspace.ai",
        "password": "Admin@12345"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_users_res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_users_res.status_code == 200
    print("[OK] Authenticated ADMIN user successfully accesses Admin endpoint.")

    # 3. Image Analysis Differentiation & Object Filtering
    print("\n--- 3. Testing Image-Driven Analysis & People/Clutter Filtering ---")
    img1_bytes = create_synthetic_room_image(seed=1, add_person=False)
    img2_bytes = create_synthetic_room_image(seed=2, add_person=True)

    res1 = client.post("/api/analyze-room", files={"file": ("room1.jpg", img1_bytes, "image/jpeg")}, data={"room_type": "living_room"})
    assert res1.status_code == 200, f"Analysis 1 failed: {res1.text}"
    data1 = res1.json()

    res2 = client.post("/api/analyze-room", files={"file": ("room2.jpg", img2_bytes, "image/jpeg")}, data={"room_type": "bedroom"})
    assert res2.status_code == 200, f"Analysis 2 failed: {res2.text}"
    data2 = res2.json()

    # Verify image 1 vs image 2 differences
    print(f"Room 1 objects detected: {len(data1['objects'])}")
    print(f"Room 2 objects detected: {len(data2['objects'])}")
    print(f"Room 1 ignored objects summary: {data1.get('ignored_summary')}")
    print(f"Room 2 ignored objects summary: {data2.get('ignored_summary')}")

    assert data1["objects"] != data2["objects"] or data1["room"]["dimensions"] != data2["room"]["dimensions"], "Different room images produced identical results!"
    print("[OK] Confirmed: Different room images produce different room analysis models.")

    # Verify ignored entities (people/clothes/pets) are excluded from room furniture
    for obj in data2["objects"]:
        cname = obj.get("class_name", "").lower()
        assert cname not in ["person", "human", "dog", "cat", "clothes", "shirt"], f"Found ignored entity '{cname}' in room furniture!"
    print("[OK] Confirmed: People/pets/clothes are strictly excluded from room furniture models.")

    # 4. Recommendation Engine Room Type Sensitivity
    print("\n--- 4. Testing Recommendation Engine Room Type Sensitivity ---")
    rec_lr = client.post("/api/recommendations", json={"room_type": "living_room", "design_style": "modern", "budget": 500000})
    assert rec_lr.status_code == 200
    plans_lr = rec_lr.json()["plans"]

    rec_br = client.post("/api/recommendations", json={"room_type": "bedroom", "design_style": "modern", "budget": 500000})
    assert rec_br.status_code == 200
    plans_br = rec_br.json()["plans"]

    categories_lr = set(item["category"] for p in plans_lr for item in p["items"])
    categories_br = set(item["category"] for p in plans_br for item in p["items"])
    print(f"Living Room categories: {categories_lr}")
    print(f"Bedroom categories: {categories_br}")
    assert categories_lr != categories_br, "Recommendations did not adapt to room type!"
    print("[OK] Confirmed: Recommendations adapt dynamically to room type (e.g. beds in bedroom vs sofas in living room).")

    print("\n=== ALL FLOW VERIFICATIONS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_verifications()
