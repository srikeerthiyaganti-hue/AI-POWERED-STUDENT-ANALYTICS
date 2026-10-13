import sys
import os
import sqlite3
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db_connection

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
        "identifier": "stu-2024-042@codebuffet.edu",
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
    assert data["user"]["roll_no"] == "STU-2024-042"


def test_auth_login_mentor():
    response = client.post("/api/auth/login", json={
        "identifier": "rajesh.kumar@codebuffet.edu",
        "password": "Mentor@2026!",
        "role": "admin"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "mentor"
    assert data["user"]["name"] == "Prof. Rajesh Kumar"


def test_auth_login_tpo():
    response = client.post("/api/auth/login", json={
        "identifier": "vikram.tpo@codebuffet.edu",
        "password": "TPO@2026!",
        "role": "admin"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "tpo"
    assert data["user"]["name"] == "Vikram Malhotra"


def test_superseded_credentials_rejected():
    # Admin old password rejected
    res_admin = client.post("/api/auth/login", json={
        "identifier": "admin@codebuffet.edu",
        "password": "AdminDemo#2026"
    })
    assert res_admin.status_code == 401

    # Student old password rejected
    res_student = client.post("/api/auth/login", json={
        "identifier": "STU-2024-042",
        "password": "StudentDemo#2026"
    })
    assert res_student.status_code == 401

    # Mentor old password rejected
    res_mentor = client.post("/api/auth/login", json={
        "identifier": "rajesh.kumar@codebuffet.edu",
        "password": "MentorDemo#2026"
    })
    assert res_mentor.status_code == 401

    # TPO old password rejected
    res_tpo = client.post("/api/auth/login", json={
        "identifier": "vikram.tpo@codebuffet.edu",
        "password": "PlacementDemo#2026"
    })
    assert res_tpo.status_code == 401


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
        "identifier": "stu-2024-042@codebuffet.edu",
        "password": "Student@2026!",
        "role": "admin"
    })
    assert response.status_code == 403


def _get_admin_headers():
    res = client.post("/api/auth/login", json={
        "identifier": "admin@codebuffet.edu",
        "password": "CodeBuffet@2026!",
        "role": "admin"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _get_student_headers():
    res = client.post("/api/auth/login", json={
        "identifier": "stu-2024-042@codebuffet.edu",
        "password": "Student@2026!",
        "role": "student"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _get_mentor_headers():
    res = client.post("/api/auth/login", json={
        "identifier": "rajesh.kumar@codebuffet.edu",
        "password": "Mentor@2026!",
        "role": "admin"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _get_tpo_headers():
    res = client.post("/api/auth/login", json={
        "identifier": "vikram.tpo@codebuffet.edu",
        "password": "TPO@2026!",
        "role": "admin"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_institution_summary():
    response = client.get("/api/institution/summary", headers=_get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert "total_students" in data
    assert "verified_students_count" in data
    assert "cohort_records_count" in data
    assert data["cohort_records_count"] == 50000
    assert data["verified_students_count"] >= 8
    assert "avg_success_score" in data
    assert "at_risk_pct" in data


def test_cohort_analytics():
    response = client.get("/api/institution/analytics/cohort", headers=_get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 50000
    assert "overall_placement_rate" in data
    assert "branches" in data
    assert len(data["branches"]) > 0
    assert "cgpa_distribution" in data
    assert len(data["cgpa_distribution"]) == 5


def test_institution_departments():
    response = client.get("/api/institution/departments", headers=_get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5


def test_institution_students_filter():
    response = client.get("/api/institution/students?search=rajesh", headers=_get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "Rajesh" in data[0]["name"]
    assert "topRiskFactor" in data[0]
    assert "scoreBand" in data[0]

    # Department filter with abbreviation
    cse_res = client.get("/api/institution/students?department=CSE", headers=_get_admin_headers())
    assert cse_res.status_code == 200
    assert len(cse_res.json()) > 0


def test_student_dashboard():
    response = client.get("/api/student/dashboard?roll_no=STU-2024-042", headers=_get_student_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Aarav Sharma"
    assert data["success_score"] >= 80.0
    assert "placement_readiness_pct" in data
    assert "components" in data
    assert data["components"]["placement"] == data["placement_readiness_pct"]
    assert "engagement" in data["components"]
    assert len(data["mentoring_tasks"]) >= 2


def test_student_dashboard_not_found():
    response = client.get("/api/student/dashboard?roll_no=NON-EXISTENT-ROLL", headers=_get_admin_headers())
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_student_simulate():
    response = client.post("/api/student/simulate", json={
        "attendance": 95.0,
        "coding_skills": 9.0,
        "lms_velocity": 92.0,
        "cgpa": 8.8,
        "backlogs": 0
    }, headers=_get_student_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["projected_score"] > 80.0


def test_auth_logout():
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_unauthenticated_institution_access_fails():
    # Calling institution endpoint without Authorization token must return 401
    response = client.get("/api/institution/summary")
    assert response.status_code == 401


def test_student_institution_access_forbidden():
    # Calling institution endpoint with a student token must return 403 Forbidden
    response = client.get("/api/institution/summary", headers=_get_student_headers())
    assert response.status_code == 403


def test_student_idor_prevention():
    # Student attempting to access another student's record must be rejected with 403
    response = client.get("/api/student/dashboard?roll_no=STU-2024-001", headers=_get_student_headers())
    assert response.status_code == 403


def test_mentor_and_tpo_role_access():
    # Faculty Mentor and TPO should have authorized access to institution analytics
    mentor_resp = client.get("/api/institution/summary", headers=_get_mentor_headers())
    assert mentor_resp.status_code == 200

    tpo_resp = client.get("/api/institution/summary", headers=_get_tpo_headers())
    assert tpo_resp.status_code == 200


def test_create_student_and_assign_mentor():
    test_roll = "STU-TEST-999"
    # Ensure cleanup if exists from previous run
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM students WHERE roll_no = ?", (test_roll,))
    conn.commit()
    conn.close()

    # 1. Administratively enroll new student
    create_res = client.post("/api/institution/students", json={
        "roll_no": test_roll,
        "full_name": "Test Enrolled Student",
        "department": "Computer Science & Engineering",
        "cgpa": 8.1,
        "backlogs": 0,
        "overall_attendance_pct": 91.0,
        "assigned_mentor": "Prof. Vihaan Singh"
    }, headers=_get_admin_headers())
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["success"] is True
    assert data["student"]["roll_no"] == test_roll
    assert data["student"]["assignedMentor"] == "Prof. Vihaan Singh"

    # 2. Verify student appears in administrator's student list
    list_res = client.get(f"/api/institution/students?search={test_roll}", headers=_get_admin_headers())
    assert list_res.status_code == 200
    students_list = list_res.json()
    assert len(students_list) > 0
    assert students_list[0]["id"] == test_roll
    assert students_list[0]["assignedMentor"] == "Prof. Vihaan Singh"

    # 3. Test reassigning mentor persistently
    reassign_res = client.post("/api/institution/students/assign-mentor", json={
        "roll_no": test_roll,
        "mentor_name": "Dr. R. Kumar"
    }, headers=_get_admin_headers())
    assert reassign_res.status_code == 200
    assert reassign_res.json()["success"] is True

    # 4. Verify updated mentor in list
    verify_res = client.get(f"/api/institution/students?search={test_roll}", headers=_get_admin_headers())
    assert verify_res.status_code == 200
    assert verify_res.json()[0]["assignedMentor"] == "Dr. R. Kumar"

    # Cleanup test record
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM students WHERE roll_no = ?", (test_roll,))
    c.execute("DELETE FROM interventions WHERE student_roll_no = ?", (test_roll,))
    conn.commit()
    conn.close()


def test_institution_students_pagination():
    # Test server-side pagination with record_type filter
    res = client.get("/api/institution/students?page=1&page_size=5&record_type=verified_profile", headers=_get_admin_headers())
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "counts" in data
    assert len(data["items"]) <= 5
    assert data["counts"]["verified_profiles"] == 8
    assert data["items"][0]["recordType"] == "verified_profile"
    assert "dataCompleteness" in data["items"][0]
    assert data["items"][0]["dataCompleteness"] == 100.0


def test_institution_mentors_endpoint():
    res = client.get("/api/institution/mentors", headers=_get_admin_headers())
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    mentor_names = [m["name"] for m in data]
    assert any("Rajesh" in name or "Vihaan" in name for name in mentor_names)
    assert "Dr. Sunita Sharma" in mentor_names
    assert "Prof. K. Murthy" in mentor_names
    # Verify assigned students count is reported
    mentor_obj = next(m for m in data if "Rajesh" in m["name"] or "Vihaan" in m["name"])
    assert mentor_obj["assigned_students_count"] >= 3


def test_simulate_cohort_endpoint():
    res = client.post("/api/institution/simulate-cohort", json={
        "attendance_boost": 10.0,
        "dsa_coding_boost": 1.5,
        "lms_velocity_boost": 15.0,
        "mentor_capacity": 40
    }, headers=_get_admin_headers())
    assert res.status_code == 200
    data = res.json()
    assert "students_rescued_count" in data
    assert "projected_avg_score" in data
    assert "roi_summary" in data
    assert data["score_improvement"] >= 0.0


def test_model_status_endpoint():
    res = client.get("/api/institution/model-status", headers=_get_admin_headers())
    assert res.status_code == 200
    data = res.json()
    assert "placement_model" in data
    assert "academic_model" in data
    assert "success_score_engine" in data
    assert data["placement_model"]["decision_threshold"] == 0.35
    assert "sha256" in data["placement_model"]
    assert "transparency_audit" in data


def test_students_export_csv():
    # 1. Export with Bearer header
    res = client.get("/api/institution/students/export?record_type=verified_profile", headers=_get_admin_headers())
    assert res.status_code == 200
    assert "text/csv" in res.headers.get("content-type", "")
    content = res.text
    assert "Roll Number" in content
    assert "Record Type" in content
    assert "Source Provenance" in content
    assert "STU-2024-042" in content or "STU-2026-018" in content

    # 2. Export with query param token
    admin_token = _get_admin_headers()["Authorization"].split(" ")[1]
    res_token = client.get(f"/api/institution/students/export?token={admin_token}")
    assert res_token.status_code == 200
    assert len(res_token.text.strip().splitlines()) == 51  # 1 header + 50 student records

    # 3. Unauthenticated export must be rejected with 401
    res_unauth = client.get("/api/institution/students/export")
    assert res_unauth.status_code == 401

    # 4. Student token export must be rejected with 403 Forbidden
    res_forbidden = client.get("/api/institution/students/export", headers=_get_student_headers())
    assert res_forbidden.status_code == 403


def test_dashboard_50_students_restriction():
    # 1. Unfiltered student request returns exactly 50 selected records
    res = client.get("/api/institution/students", headers=_get_admin_headers())
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 50, f"Dashboard expected exactly 50 students, got {len(data)}"

    # Verify cohort composition: exactly 8 verified profiles and 42 benchmark cohort records
    verified = [s for s in data if s["recordType"] == "verified_profile"]
    benchmark = [s for s in data if s["recordType"] == "anonymous_cohort"]
    assert len(verified) == 8, f"Expected 8 verified profiles in 50 cohort, got {len(verified)}"
    assert len(benchmark) == 42, f"Expected 42 benchmark records in 50 cohort, got {len(benchmark)}"
    assert all(s["dataCompleteness"] == 100.0 for s in verified)
    assert all(s["dataCompleteness"] == 94.1 for s in benchmark)

    # 2. Paginated request returns at most 50 items and total <= 50
    res_p = client.get("/api/institution/students?page=1&page_size=100", headers=_get_admin_headers())
    assert res_p.status_code == 200
    pdata = res_p.json()
    assert len(pdata["items"]) == 50
    assert pdata["total"] == 50

    # 3. SQLite database preservation: verify that all 50,008 student records remain safely in DB
    conn = sqlite3.connect("backend/codebuffet.db")
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM students")
    db_count = c.fetchone()[0]
    conn.close()
    assert db_count == 50008, f"Expected 50008 records in database, found {db_count}"

    # 4. Summary reconciliation reports both 50 displayed and 50008 total
    sum_res = client.get("/api/institution/summary", headers=_get_admin_headers())
    assert sum_res.status_code == 200
    sdata = sum_res.json()
    assert sdata["total_students"] == 50008
    assert sdata["displayed_students_count"] == 50


def test_mentor_dashboard_mentees_and_interventions():
    # 1. Mentor query retrieves genuine assigned CSE mentees without exposing unrelated cohort benchmark rows
    res = client.get("/api/institution/students?mentor=Rajesh%20Kumar", headers=_get_mentor_headers())
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 3, f"Expected 3 genuine assigned mentees for Rajesh Kumar, got {len(data)}"
    roll_numbers = [s["roll_no"] for s in data]
    assert "STU-2024-042" in roll_numbers  # Aarav Sharma
    assert "STU-2024-001" in roll_numbers  # Rajesh Kumar
    assert "STU-2024-112" in roll_numbers  # Ananya Verma

    # 2. Querying with honorific title also succeeds
    res_title = client.get("/api/institution/students?mentor=Prof.%20Rajesh%20Kumar", headers=_get_mentor_headers())
    assert res_title.status_code == 200
    assert len(res_title.json()) == 3

    # Backwards compatibility query with Vihaan Singh alias
    res_alias = client.get("/api/institution/students?mentor=Vihaan%20Singh", headers=_get_mentor_headers())
    assert res_alias.status_code == 200
    assert len(res_alias.json()) == 3

    # 3. Interventions endpoint returns the mentor's genuine active interventions
    interv_res = client.get("/api/institution/interventions?mentor=Rajesh%20Kumar", headers=_get_mentor_headers())
    assert interv_res.status_code == 200
    intervs = interv_res.json()
    assert len(intervs) >= 2
    student_rolls = [i["student_roll_no"] for i in intervs]
    assert "STU-2024-042" in student_rolls
    assert "STU-2024-001" in student_rolls


def test_seed_initial_data_idempotent():
    """
    Regression Test: seed_initial_data() must be strictly idempotent.
    Executing startup seeding multiple times must NOT:
    1. Raise IntegrityError on UNIQUE constraints (users.roll_no or users.email).
    2. Create duplicate users or duplicate student records.
    3. Overwrite existing accounts, passwords, roles, or student data.
    4. Confuse distinct identities (student STU-2024-042, student Rajesh Kumar,
       faculty mentor Prof. Rajesh Kumar, and TPO Vikram Malhotra).
    """
    from backend.database import seed_initial_data

    # Snapshot state before seeding
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, email, roll_no, password_hash, full_name, role FROM users ORDER BY id ASC")
    users_before = [dict(r) for r in c.fetchall()]
    c.execute("SELECT COUNT(*) FROM students")
    student_count_before = c.fetchone()[0]
    conn.close()

    # Call seed_initial_data() first time
    seed_initial_data()

    # Call seed_initial_data() second time
    seed_initial_data()

    # Verify state after multiple seed executions
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, email, roll_no, password_hash, full_name, role FROM users ORDER BY id ASC")
    users_after = [dict(r) for r in c.fetchall()]
    c.execute("SELECT COUNT(*) FROM students")
    student_count_after = c.fetchone()[0]

    # Verify identities remain distinct and isolated
    c.execute("SELECT roll_no, full_name, role FROM users WHERE role = 'student'")
    student_user = c.fetchone()
    assert student_user["roll_no"] == "STU-2024-042"
    assert student_user["role"] == "student"

    c.execute("SELECT roll_no, full_name, assigned_mentor FROM students WHERE roll_no = 'STU-2024-001'")
    rajesh_student = c.fetchone()
    assert rajesh_student["full_name"] == "Rajesh Kumar"
    assert rajesh_student["assigned_mentor"] == "Prof. Rajesh Kumar"

    c.execute("SELECT email, roll_no, full_name, role FROM users WHERE role = 'mentor' AND roll_no = 'FAC-CSE-104'")
    mentor_user = c.fetchone()
    assert mentor_user["email"] == "rajesh.kumar@codebuffet.edu"
    assert mentor_user["full_name"] == "Prof. Rajesh Kumar"

    c.execute("SELECT email, roll_no, full_name, role FROM users WHERE role = 'tpo'")
    tpo_user = c.fetchone()
    assert tpo_user["email"] == "vikram.tpo@codebuffet.edu"
    assert tpo_user["full_name"] == "Vikram Malhotra"

    conn.close()

    # Assert no duplicate users created and passwords/roles intact
    assert len(users_after) == len(users_before), f"Expected {len(users_before)} users, found {len(users_after)}"
    assert users_after == users_before, "Existing user accounts, passwords, or roles were altered during re-seed"

    # Assert student database records preserved intact
    assert student_count_after == student_count_before == 50008, f"Expected 50008 student records, found {student_count_after}"


if __name__ == "__main__":
    test_health()
    test_auth_login_admin()
    test_auth_login_student()
    test_auth_login_by_roll_no()
    test_auth_login_mentor()
    test_auth_login_tpo()
    test_superseded_credentials_rejected()
    test_auth_login_invalid_password()
    test_auth_role_restriction()
    test_institution_summary()
    test_cohort_analytics()
    test_institution_departments()
    test_institution_students_filter()
    test_student_dashboard()
    test_student_dashboard_not_found()
    test_student_simulate()
    test_auth_logout()
    test_unauthenticated_institution_access_fails()
    test_student_institution_access_forbidden()
    test_student_idor_prevention()
    test_mentor_and_tpo_role_access()
    test_create_student_and_assign_mentor()
    test_institution_students_pagination()
    test_institution_mentors_endpoint()
    test_simulate_cohort_endpoint()
    test_model_status_endpoint()
    test_students_export_csv()
    test_dashboard_50_students_restriction()
    test_mentor_dashboard_mentees_and_interventions()
    test_seed_initial_data_idempotent()
    print("ALL TESTS PASSED SUCCESSFULLY!")

