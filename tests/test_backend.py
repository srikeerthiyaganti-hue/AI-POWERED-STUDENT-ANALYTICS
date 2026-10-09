import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CODEBUFFET" in data["platform"]


def test_auth_login_admin():
    response = client.post("/api/auth/login", json={
        "identifier": "admin@codebuffet.edu",
        "password": "CodeBuffet@2026!",
        "role": "admin"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["name"] == "Dr. R. Kumar"


def test_auth_login_student():
    response = client.post("/api/auth/login", json={
        "identifier": "aarav.sharma@codebuffet.edu",
        "password": "Student@2026!",
        "role": "student"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"
    assert data["user"]["name"] == "Aarav Sharma"


def test_auth_login_by_roll_no():
    response = client.post("/api/auth/login", json={
        "identifier": "STU-2024-042",
        "password": "Student@2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "aarav.sharma@codebuffet.edu"


def test_auth_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "identifier": "admin@codebuffet.edu",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_auth_role_restriction():
    # Student trying to sign into admin portal with student credentials
    response = client.post("/api/auth/login", json={
        "identifier": "aarav.sharma@codebuffet.edu",
        "password": "Student@2026!",
        "role": "admin"
    })
    assert response.status_code == 403


def test_institution_summary():
    response = client.get("/api/institution/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_students"] == 12480
    assert "avg_success_score" in data
    assert "at_risk_pct" in data


def test_institution_departments():
    response = client.get("/api/institution/departments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5


def test_institution_students_filter():
    response = client.get("/api/institution/students?search=rajesh")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "Rajesh" in data[0]["name"]


def test_student_dashboard():
    response = client.get("/api/student/dashboard?roll_no=STU-2024-042")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Aarav Sharma"
    assert data["success_score"] >= 80.0
    assert "components" in data
    assert len(data["mentoring_tasks"]) >= 2


def test_student_simulate():
    response = client.post("/api/student/simulate", json={
        "attendance": 95.0,
        "coding_skills": 9.0,
        "lms_velocity": 92.0,
        "cgpa": 8.8,
        "backlogs": 0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["projected_score"] > 80.0


def test_auth_logout():
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True


if __name__ == "__main__":
    test_health()
    test_auth_login_admin()
    test_auth_login_student()
    test_auth_login_by_roll_no()
    test_auth_login_invalid_password()
    test_auth_role_restriction()
    test_institution_summary()
    test_institution_departments()
    test_institution_students_filter()
    test_student_dashboard()
    test_student_simulate()
    test_auth_logout()
    print("ALL 12 BACKEND TESTS PASSED SUCCESSFULLY!")
