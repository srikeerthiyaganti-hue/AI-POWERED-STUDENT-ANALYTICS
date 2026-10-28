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
    assert "Invalid email/username or password" in response.json()["detail"]


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
    assert data["counts"]["verified_profiles"] >= 8
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
    # 1. Verified cohort filter retrieves the 3 verified mentees assigned to Rajesh Kumar
    res_ver = client.get("/api/institution/students?mentor=Rajesh%20Kumar&record_type=verified_profile", headers=_get_mentor_headers())
    assert res_ver.status_code == 200
    ver_data = res_ver.json()
    assert isinstance(ver_data, list)
    assert len(ver_data) == 3, f"Expected 3 verified mentees for Rajesh Kumar, got {len(ver_data)}"
    roll_numbers = [s["roll_no"] for s in ver_data]
    assert "STU-2024-042" in roll_numbers  # Aarav Sharma
    assert "STU-2024-001" in roll_numbers  # Rajesh Kumar
    assert "STU-2024-112" in roll_numbers  # Ananya Verma

    # 2. Full assigned mentee query retrieves all 20,447 assigned students with server-side pagination (50/page)
    res_page = client.get("/api/institution/students?mentor=Rajesh%20Kumar&page=1&page_size=50", headers=_get_mentor_headers())
    assert res_page.status_code == 200
    pdata = res_page.json()
    assert pdata["total"] == 20447, f"Expected 20447 total assigned mentees in DB, got {pdata['total']}"
    assert pdata["page"] == 1
    assert pdata["page_size"] == 50
    assert len(pdata["items"]) == 50
    # Verified profiles are prioritized at the top of the assigned roster
    first_rolls = [s["roll_no"] for s in pdata["items"][:3]]
    assert "STU-2024-042" in first_rolls or "STU-2024-001" in first_rolls or "STU-2024-112" in first_rolls

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




def test_cohort_50_identities_and_risk_precedence():
    # 1. Fetch initial 50 cohort
    res = client.get("/api/institution/students", headers=_get_admin_headers())
    assert res.status_code == 200
    students = res.json()
    assert len(students) == 50

    # 2. Verify unique names and unique IDs
    names = [s["name"] for s in students]
    ids = [s["id"] for s in students]
    assert len(set(names)) == 50, f"Expected 50 unique names, found {len(set(names))}"
    assert len(set(ids)) == 50, f"Expected 50 unique IDs, found {len(set(ids))}"
    # Verify no student names like 'Student 00001'
    assert not any("Student 000" in n for n in names)

    # 3. Verify valid numerical values for metrics
    for s in students:
        assert 0.0 <= s["cgpa"] <= 10.0
        assert 0.0 <= s["attendance"] <= 100.0
        assert 0.0 <= s["successScore"] <= 100.0
        assert s["assignedMentor"] in ["Prof. Rajesh Kumar", "Dr. Sunita Sharma", "Prof. K. Murthy"]

    # 4. Strict Academic Risk Precedence Rules
    for s in students:
        cgpa = s["cgpa"]
        att = s["attendance"]
        band = s["academicRisk"]
        if cgpa < 6.0 or att < 65.0:
            assert band == "HIGH", f"{s['id']} {s['name']}: CGPA={cgpa}, Att={att} should be HIGH, got {band}"
        elif cgpa < 7.5 or att < 75.0:
            assert band == "MEDIUM", f"{s['id']} {s['name']}: CGPA={cgpa}, Att={att} should be MEDIUM, got {band}"
        else:
            assert band == "LOW", f"{s['id']} {s['name']}: CGPA={cgpa}, Att={att} should be LOW, got {band}"

    # 5. Decoupled Placement Risk
    acad_bands = [s["academicRisk"] for s in students]
    plac_bands = [s["placementRisk"] for s in students]
    assert acad_bands != plac_bands, "Placement risk must be decoupled from academic risk"
    different_bands = sum(1 for a, p in zip(acad_bands, plac_bands) if a != p)
    assert different_bands > 0

    # 6. Database Total and Summary API agreement
    sum_res = client.get("/api/institution/summary", headers=_get_admin_headers())
    assert sum_res.status_code == 200
    sdata = sum_res.json()
    assert sdata["total_students"] == 50008
    assert sdata["displayed_students_count"] == 50


def _get_tpo_headers():
    res = client.post("/api/auth/login", json={
        "identifier": "vikram.tpo@codebuffet.edu",
        "password": "TPO@2026!",
        "role": "admin"
    })
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_student_history():
    res = client.get("/api/student/history", headers=_get_student_headers())
    assert res.status_code == 200
    data = res.json()
    assert data["student_roll_no"] == "STU-2024-042"
    assert data["records_count"] > 0
    assert "cgpa" in data["history"]
    assert "attendance" in data["history"]
    assert "success_score" in data["history"]


def test_student_tasks_lifecycle():
    # 1. Fetch student tasks
    res = client.get("/api/student/tasks", headers=_get_student_headers())
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) > 0
    task_id = tasks[0]["id"]

    # 2. Update status to COMPLETED
    res_update = client.post(
        f"/api/student/tasks/{task_id}/status",
        headers=_get_student_headers(),
        json={"status": "COMPLETED", "notes": "Completed DSA practice set"}
    )
    assert res_update.status_code == 200
    assert res_update.json()["new_status"] == "COMPLETED"

    # 3. Toggle back to OPEN
    res_toggle = client.post(f"/api/student/tasks/{task_id}/toggle", headers=_get_student_headers())
    assert res_toggle.status_code == 200
    assert res_toggle.json()["new_status"] == "OPEN"


def test_student_ai_assistant():
    res = client.post(
        "/api/student/ai-assistant",
        headers=_get_student_headers(),
        json={
            "question": "How do I optimize my placement readiness score?",
            "what_if_context": {"simulated_coding": 9.0}
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "telemetry_grounding" in data


def test_mentor_student_history_and_copilot():
    # 1. Mentor views student history
    res_hist = client.get("/api/institution/students/STU-2024-042/history", headers=_get_mentor_headers())
    assert res_hist.status_code == 200
    assert res_hist.json()["has_history"] is True

    # 2. Mentor invokes AI Copilot
    res_copilot = client.post(
        "/api/institution/mentor/ai-copilot",
        headers=_get_mentor_headers(),
        json={"roll_no": "STU-2024-042"}
    )
    assert res_copilot.status_code == 200
    copilot = res_copilot.json()
    assert copilot["student_roll_no"] == "STU-2024-042"
    assert "executive_summary" in copilot
    assert "key_risk_drivers" in copilot
    assert "recommended_interventions" in copilot
    assert len(copilot["recommended_interventions"]) > 0

    # 3. Mentor approves recommended intervention
    rec = copilot["recommended_interventions"][0]
    res_approve = client.post(
        "/api/institution/interventions",
        headers=_get_mentor_headers(),
        json={
            "student_roll_no": "STU-2024-042",
            "student_name": copilot["student_name"],
            "department": copilot["department"],
            "title": rec["title"],
            "category": rec["category"],
            "assigned_mentor": "Prof. Rajesh Kumar",
            "due_date": "Nov 25, 2026",
            "priority": rec.get("priority", "HIGH")
        }
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["success"] is True


def test_placement_jobs_pipeline_and_match():
    # 1. Fetch placement job openings
    res_jobs = client.get("/api/placement/jobs", headers=_get_tpo_headers())
    assert res_jobs.status_code == 200
    jobs = res_jobs.json()
    assert len(jobs) >= 5

    # 2. Fetch recruitment pipeline
    res_pipe = client.get("/api/placement/pipeline", headers=_get_tpo_headers())
    assert res_pipe.status_code == 200
    pipe = res_pipe.json()
    assert len(pipe) > 0
    app_id = pipe[0]["id"]

    # 3. Advance pipeline stage
    res_stage = client.post(
        "/api/placement/pipeline/stage",
        headers=_get_tpo_headers(),
        json={"application_id": app_id, "stage": "INTERVIEW", "notes": "Cleared technical round"}
    )
    assert res_stage.status_code == 200
    assert res_stage.json()["new_stage"] == "INTERVIEW"

    # 4. Explainable candidate matching
    res_match = client.post(
        "/api/placement/match",
        headers=_get_tpo_headers(),
        json={"job_id": 1, "student_roll_no": "STU-2024-042"}
    )
    assert res_match.status_code == 200
    match_data = res_match.json()
    assert "match_score" in match_data
    assert "criteria_breakdown" in match_data
    assert "matched_skills" in match_data

    # 5. Placement funnel analytics
    res_ana = client.get("/api/placement/analytics", headers=_get_tpo_headers())
    assert res_ana.status_code == 200
    ana = res_ana.json()
    assert "funnel" in ana
    assert "company_outcomes" in ana




def test_registration_roles_and_approval():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE roll_no IN (SELECT roll_no FROM users WHERE email LIKE '%@test.edu')")
    cur.execute("DELETE FROM users WHERE email LIKE '%@test.edu'")
    conn.commit()
    conn.close()

    # 1. Student registration: immediate active status
    res_stu = client.post("/api/auth/register", json={
        "first_name": "Kavita",
        "last_name": "Iyer",
        "phone_number": "9876543210",
        "email": "kavita.iyer@test.edu",
        "password": "Password@2026!",
        "confirm_password": "Password@2026!",
        "role": "Student",
        "branch": "CSE",
        "semester": 5
    })
    assert res_stu.status_code == 201, f"Registration failed: {res_stu.text}"
    sdata = res_stu.json()
    assert sdata["status"] == "ACTIVE"
    assert sdata["role"] == "student"

    # Login succeeds immediately for active student
    res_login = client.post("/api/auth/login", json={
        "identifier": "kavita.iyer@test.edu",
        "password": "Password@2026!"
    })
    assert res_login.status_code == 200

    # 2. Privileged role registration without institutional invitation code -> PENDING_APPROVAL
    res_fac = client.post("/api/auth/register", json={
        "first_name": "Anil",
        "last_name": "Deshmukh",
        "phone_number": "+919876543211",
        "email": "anil.deshmukh@test.edu",
        "password": "Faculty@2026!",
        "confirm_password": "Faculty@2026!",
        "role": "Faculty"
    })
    assert res_fac.status_code == 201
    fdata = res_fac.json()
    assert fdata["status"] == "PENDING_APPROVAL"

    # Unapproved account login is blocked with HTTP 403
    res_block = client.post("/api/auth/login", json={
        "identifier": "anil.deshmukh@test.edu",
        "password": "Faculty@2026!"
    })
    assert res_block.status_code == 403
    assert "pending" in res_block.json()["detail"].lower()

    # 3. Privileged role registration WITH valid invitation passkey -> ACTIVE
    res_tpo = client.post("/api/auth/register", json={
        "first_name": "Meera",
        "last_name": "Nambiar",
        "phone_number": "9876543212",
        "email": "meera.nambiar@test.edu",
        "password": "TpoOfficer@2026!",
        "confirm_password": "TpoOfficer@2026!",
        "role": "Placement Officer",
        "invitation_code": "CODEBUFFET-TPO-2026"
    })
    assert res_tpo.status_code == 201
    assert res_tpo.json()["status"] == "ACTIVE"

    # 4. Duplicate email rejected
    res_dup = client.post("/api/auth/register", json={
        "first_name": "Kavita",
        "last_name": "Iyer",
        "phone_number": "9876543210",
        "email": "kavita.iyer@test.edu",
        "password": "Password@2026!",
        "confirm_password": "Password@2026!",
        "role": "Student"
    })
    assert res_dup.status_code == 400

    # 5. Weak password rejected
    res_weak = client.post("/api/auth/register", json={
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "9876543213",
        "email": "test.weak@test.edu",
        "password": "weak",
        "confirm_password": "weak",
        "role": "Student"
    })
    assert res_weak.status_code == 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE roll_no IN (SELECT roll_no FROM users WHERE email LIKE '%@test.edu')")
    cur.execute("DELETE FROM users WHERE email LIKE '%@test.edu'")
    conn.commit()
    conn.close()



def test_institutional_approval_workflow_comprehensive_12_cases():
    """
    Comprehensive test suite verifying the complete institutional account
    approval and login workflow across all 12 required test dimensions:
    1. Student registration auto-active + immediate login.
    2. Faculty registration without approval remains pending.
    3. Institution Officer registration without approval remains pending.
    4. Placement Officer registration without approval remains pending.
    5. Restricted-role registration with valid invitation becomes ACTIVE.
    6. Unauthorized approval attempts rejected (student, mentor, tpo -> 403).
    7. Authorized admin approval changes status to ACTIVE followed by successful login.
    8. Rejected accounts remaining unable to sign in to protected dashboards.
    9. Pending accounts denied protected API access.
    10. Invalid credentials return generic error (email enumeration defense).
    11. Correct role mapping for Faculty/Mentor, Institution Officer, Placement Officer, and Student.
    12. Existing demo login continuing to work for all roles.
    """
    import uuid
    from backend.auth import create_access_token

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE roll_no IN (SELECT roll_no FROM users WHERE email LIKE '%@workflow-test.edu')")
    cur.execute("DELETE FROM users WHERE email LIKE '%@workflow-test.edu'")
    conn.commit()
    conn.close()

    suffix = uuid.uuid4().hex[:6]

    # --- CASE 1: Student registration auto-active + immediate login ---
    stu_email = f"student_{suffix}@workflow-test.edu"
    res_stu = client.post("/api/auth/register", json={
        "first_name": "Deepak",
        "last_name": "Verma",
        "phone_number": "9876540001",
        "email": stu_email,
        "password": "Student@2026!",
        "confirm_password": "Student@2026!",
        "role": "Student",
        "branch": "CSE",
        "semester": 6
    })
    assert res_stu.status_code == 201, f"Student registration failed: {res_stu.text}"
    stu_data = res_stu.json()
    assert stu_data["status"] == "ACTIVE"
    assert stu_data["role"] == "student"

    res_stu_login = client.post("/api/auth/login", json={
        "identifier": stu_email,
        "password": "Student@2026!"
    })
    assert res_stu_login.status_code == 200, "Student immediate login failed"
    stu_token = res_stu_login.json()["access_token"]
    assert "access_token" in res_stu_login.json()

    # --- CASE 2: Faculty registration without approval remains pending ---
    fac_email = f"faculty_{suffix}@workflow-test.edu"
    res_fac = client.post("/api/auth/register", json={
        "first_name": "Dr. Anita",
        "last_name": "Desai",
        "phone_number": "9876540002",
        "email": fac_email,
        "password": "Faculty@2026!",
        "confirm_password": "Faculty@2026!",
        "role": "Faculty",
        "department": "Computer Science & Engineering"
    })
    assert res_fac.status_code == 201
    fac_data = res_fac.json()
    assert fac_data["status"] == "PENDING_APPROVAL"
    assert fac_data["role"] == "mentor"
    fac_user_id = fac_data["user_id"]

    res_fac_login = client.post("/api/auth/login", json={
        "identifier": fac_email,
        "password": "Faculty@2026!"
    })
    assert res_fac_login.status_code == 403
    assert "Account pending administrative verification" in res_fac_login.json()["detail"]
    assert "Your institutional account requires approval" in res_fac_login.json()["detail"]

    # --- CASE 3: Institution Officer registration without approval remains pending ---
    inst_email = f"officer_{suffix}@workflow-test.edu"
    res_inst = client.post("/api/auth/register", json={
        "first_name": "Suresh",
        "last_name": "Nair",
        "phone_number": "9876540003",
        "email": inst_email,
        "password": "Officer@2026!",
        "confirm_password": "Officer@2026!",
        "role": "Institution Officer",
        "department": "Institutional Administration"
    })
    assert res_inst.status_code == 201
    inst_data = res_inst.json()
    assert inst_data["status"] == "PENDING_APPROVAL"
    assert inst_data["role"] == "admin"
    inst_user_id = inst_data["user_id"]

    res_inst_login = client.post("/api/auth/login", json={
        "identifier": inst_email,
        "password": "Officer@2026!"
    })
    assert res_inst_login.status_code == 403
    assert "Account pending administrative verification" in res_inst_login.json()["detail"]

    # --- CASE 4: Placement Officer registration without approval remains pending ---
    tpo_email = f"tpo_{suffix}@workflow-test.edu"
    res_tpo = client.post("/api/auth/register", json={
        "first_name": "Pooja",
        "last_name": "Iyer",
        "phone_number": "9876540004",
        "email": tpo_email,
        "password": "Placement@2026!",
        "confirm_password": "Placement@2026!",
        "role": "Placement Officer",
        "department": "Career & Placement Cell"
    })
    assert res_tpo.status_code == 201
    tpo_data = res_tpo.json()
    assert tpo_data["status"] == "PENDING_APPROVAL"
    assert tpo_data["role"] == "tpo"
    tpo_user_id = tpo_data["user_id"]

    res_tpo_login = client.post("/api/auth/login", json={
        "identifier": tpo_email,
        "password": "Placement@2026!"
    })
    assert res_tpo_login.status_code == 403
    assert "Account pending administrative verification" in res_tpo_login.json()["detail"]

    # --- CASE 5: Privileged role registration with valid invitation becomes ACTIVE ---
    tpo_invite_email = f"tpo_invited_{suffix}@workflow-test.edu"
    res_tpo_inv = client.post("/api/auth/register", json={
        "first_name": "Karthik",
        "last_name": "Raman",
        "phone_number": "9876540005",
        "email": tpo_invite_email,
        "password": "Placement@2026!",
        "confirm_password": "Placement@2026!",
        "role": "Placement Officer",
        "invitation_code": "CODEBUFFET-TPO-2026"
    })
    assert res_tpo_inv.status_code == 201
    assert res_tpo_inv.json()["status"] == "ACTIVE"

    res_tpo_inv_login = client.post("/api/auth/login", json={
        "identifier": tpo_invite_email,
        "password": "Placement@2026!"
    })
    assert res_tpo_inv_login.status_code == 200

    # --- CASE 6: Unauthorized approval attempts rejected ---
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    res_unauth_get = client.get("/api/institution/approvals/pending", headers=stu_headers)
    assert res_unauth_get.status_code == 403, "Student must receive 403 on approvals"

    res_unauth_post = client.post(f"/api/institution/approvals/{fac_user_id}/action", json={"action": "APPROVE"}, headers=stu_headers)
    assert res_unauth_post.status_code == 403, "Student must receive 403 on approval action"

    mentor_headers = _get_mentor_headers()
    res_mentor_post = client.post(f"/api/institution/approvals/{fac_user_id}/action", json={"action": "APPROVE"}, headers=mentor_headers)
    assert res_mentor_post.status_code == 403, "Mentor must receive 403 on approval action"

    tpo_headers = _get_tpo_headers()
    res_tpo_post = client.post(f"/api/institution/approvals/{fac_user_id}/action", json={"action": "APPROVE"}, headers=tpo_headers)
    assert res_tpo_post.status_code == 403, "TPO must receive 403 on approval action"

    res_anon_get = client.get("/api/institution/approvals/pending")
    assert res_anon_get.status_code == 401, "Anonymous must receive 401 on approvals"

    # --- CASE 7: Authorized admin approval changes status to ACTIVE followed by successful login ---
    admin_headers = _get_admin_headers()
    res_pending_list = client.get("/api/institution/approvals/pending", headers=admin_headers)
    assert res_pending_list.status_code == 200
    pending_items = res_pending_list.json()["approvals"]
    assert any(a["id"] == fac_user_id for a in pending_items), "Pending faculty should be in pending approvals list"

    res_approve = client.post(f"/api/institution/approvals/{fac_user_id}/action", json={
        "action": "APPROVE",
        "notes": "Verified faculty qualifications"
    }, headers=admin_headers)
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "ACTIVE"

    # Faculty can now log in successfully
    res_fac_post_approval = client.post("/api/auth/login", json={
        "identifier": fac_email,
        "password": "Faculty@2026!"
    })
    assert res_fac_post_approval.status_code == 200
    assert res_fac_post_approval.json()["user"]["role"] == "mentor"
    assert res_fac_post_approval.json()["user"]["status"] == "ACTIVE"

    # --- CASE 8: Rejected accounts remaining unable to sign in ---
    res_reject = client.post(f"/api/institution/approvals/{inst_user_id}/action", json={
        "action": "REJECT",
        "notes": "Unverified institutional affiliation"
    }, headers=admin_headers)
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "REJECTED"

    res_rej_login = client.post("/api/auth/login", json={
        "identifier": inst_email,
        "password": "Officer@2026!"
    })
    assert res_rej_login.status_code == 403
    assert "rejected or deactivated" in res_rej_login.json()["detail"].lower()

    # --- CASE 9: Pending accounts denied protected API access ---
    pending_token = create_access_token({"sub": str(tpo_user_id), "email": tpo_email, "role": "tpo"})
    res_protected = client.get("/api/institution/summary", headers={"Authorization": f"Bearer {pending_token}"})
    assert res_protected.status_code == 403
    assert "pending administrative verification" in res_protected.json()["detail"].lower()

    # --- CASE 10: Invalid credentials return generic error (email enumeration defense) ---
    res_bad_pw = client.post("/api/auth/login", json={
        "identifier": "admin@codebuffet.edu",
        "password": "TotallyWrongPassword!"
    })
    assert res_bad_pw.status_code == 401
    assert res_bad_pw.json()["detail"] == "Invalid email/username or password"

    res_bad_email = client.post("/api/auth/login", json={
        "identifier": "nonexistent.user.random999@codebuffet.edu",
        "password": "AnyPassword123!"
    })
    assert res_bad_email.status_code == 401
    assert res_bad_email.json()["detail"] == "Invalid email/username or password"

    # --- CASE 11: Correct role mapping ---
    assert fac_data["role"] == "mentor"
    assert fac_data["role_label"] == "Faculty Mentor"
    assert inst_data["role"] == "admin"
    assert inst_data["role_label"] == "Institution Officer"
    assert tpo_data["role"] == "tpo"
    assert tpo_data["role_label"] == "Placement Officer"
    assert stu_data["role"] == "student"
    assert stu_data["role_label"] == "Student"

    # --- CASE 12: Existing demo login continuing to work ---
    d_admin = client.post("/api/auth/login", json={"identifier": "admin@codebuffet.edu", "password": "CodeBuffet@2026!"})
    assert d_admin.status_code == 200 and d_admin.json()["user"]["role"] == "admin"
    d_stu = client.post("/api/auth/login", json={"identifier": "STU-2024-042", "password": "Student@2026!"})
    assert d_stu.status_code == 200 and d_stu.json()["user"]["role"] == "student"
    d_men = client.post("/api/auth/login", json={"identifier": "rajesh.kumar@codebuffet.edu", "password": "Mentor@2026!"})
    assert d_men.status_code == 200 and d_men.json()["user"]["role"] == "mentor"
    d_tpo = client.post("/api/auth/login", json={"identifier": "vikram.tpo@codebuffet.edu", "password": "TPO@2026!"})
    assert d_tpo.status_code == 200 and d_tpo.json()["user"]["role"] == "tpo"

    # Approver self-protection: administrator cannot approve/reject self
    res_self = client.post("/api/institution/approvals/1/action", json={"action": "APPROVE"}, headers=admin_headers)
    assert res_self.status_code == 400
    assert "own account" in res_self.json()["detail"].lower()

    # Cleanup workflow test data
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE roll_no IN (SELECT roll_no FROM users WHERE email LIKE '%@workflow-test.edu')")
    cur.execute("DELETE FROM users WHERE email LIKE '%@workflow-test.edu'")
    conn.commit()
    conn.close()


def test_student_profile_update_branch_and_semester():
    # Update branch & semester for Aarav Sharma (STU-2024-042)
    headers = _get_student_headers()

    # 1. Successful update to Data Science, Semester 7
    res_up = client.put("/api/student/profile", json={
        "branch": "Data Science",
        "semester": 7
    }, headers=headers)
    assert res_up.status_code == 200
    p = res_up.json()["profile"]
    assert p["branch"] == "Data Science"
    assert p["semester"] == 7
    assert p["year"] == "4th Year"

    # Verify on dashboard
    res_dash = client.get("/api/student/dashboard", headers=headers)
    assert res_dash.status_code == 200
    ddata = res_dash.json()
    assert ddata["department"] == "Data Science"
    assert ddata["semester"] == 7
    assert ddata["year"] == "4th Year"

    # Revert back to CSE, Semester 6
    client.put("/api/student/profile", json={
        "branch": "CSE",
        "semester": 6
    }, headers=headers)

    # 2. Invalid branch rejected
    res_inv_b = client.put("/api/student/profile", json={
        "branch": "Aerospace Engineering"
    }, headers=headers)
    assert res_inv_b.status_code == 400

    # 3. Invalid semester rejected (must be 1-8)
    res_inv_s = client.put("/api/student/profile", json={
        "semester": 9
    }, headers=headers)
    assert res_inv_s.status_code == 400

def test_audit_logs_recorded():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) AS cnt FROM audit_logs")
    cnt = c.fetchone()["cnt"]
    conn.close()
    assert cnt > 0, "Audit logs should record operations"


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
    test_cohort_50_identities_and_risk_precedence()
    test_student_history()
    test_student_tasks_lifecycle()
    test_student_ai_assistant()
    test_mentor_student_history_and_copilot()
    test_placement_jobs_pipeline_and_match()
    test_audit_logs_recorded()
    test_registration_roles_and_approval()
    test_student_profile_update_branch_and_semester()
    test_institutional_approval_workflow_comprehensive_12_cases()
    print("ALL 38 BACKEND UNIT TESTS PASSED SUCCESSFULLY!")
