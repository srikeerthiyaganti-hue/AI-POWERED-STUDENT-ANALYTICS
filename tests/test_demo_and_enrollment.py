"""
CODEBUFFET — Demo Access & Faculty/TPO Enrollment Verification Tests
Validates:
1. Demo accounts authenticity and credential verification against backend PBKDF2 hash.
2. Faculty/Mentor enrollment endpoint (validation, persistence, audit logging, uniqueness).
3. Placement Officer enrollment endpoint (validation, persistence, audit logging, uniqueness).
4. Newly enrolled mentors appear in the mentor directory.
5. Newly enrolled placement officers appear in the placement officers directory.
6. Student enrollment remains functional without regressions.
"""

import os
import sys
import sqlite3
import pytest
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException
from backend.database import get_db_connection
from backend.auth import verify_password
from backend.routes.institution_routes import (
    FacultyEnrollRequest,
    PlacementOfficerEnrollRequest,
    StudentCreateRequest,
    enroll_faculty_mentor,
    enroll_placement_officer,
    get_placement_officers,
    get_mentors,
    create_student,
)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "codebuffet.db")


def test_configured_demo_accounts_valid():
    """Verify that all 4 demo accounts configured in the UI match genuine database records."""
    conn = get_db_connection()
    c = conn.cursor()

    demo_accounts = [
        {"email": "admin@codebuffet.edu", "role": "admin", "expected_name": "Dr. R. Kumar", "pwd": "CodeBuffet@2026!"},
        {"email": "rajesh.kumar@codebuffet.edu", "role": "mentor", "expected_name": "Prof. Rajesh Kumar", "pwd": "Mentor@2026!"},
        {"email": "vikram.tpo@codebuffet.edu", "role": "tpo", "expected_name": "Vikram Malhotra", "pwd": "TPO@2026!"},
        {"email": "stu-2024-042@codebuffet.edu", "role": "student", "expected_name": "Aarav Sharma", "pwd": "Student@2026!"},
    ]

    for acc in demo_accounts:
        c.execute("SELECT id, email, roll_no, password_hash, full_name, role, status FROM users WHERE LOWER(email) = ?", (acc["email"].lower(),))
        row = c.fetchone()
        assert row is not None, f"Demo account {acc['email']} not found in database!"
        assert row["role"] == acc["role"], f"Role mismatch for {acc['email']}: {row['role']} != {acc['role']}"
        assert row["status"] == "ACTIVE", f"Demo account {acc['email']} is not ACTIVE"
        assert verify_password(acc["pwd"], row["password_hash"]), f"Password verification failed for demo account {acc['email']}"

    conn.close()


def test_enroll_faculty_mentor_success():
    """Tests enrolling a new faculty mentor administratively."""
    staff_id = f"FAC-TEST-{int(datetime.now().timestamp() * 1000) % 1000000}"
    email = f"test.prof.{staff_id.lower()}@codebuffet.edu"

    req = FacultyEnrollRequest(
        staff_id=staff_id,
        first_name="Dr. Arvind",
        last_name="Nair",
        email=email,
        department="Computer Science & Engineering",
        designation="Associate Professor",
        phone_number="+91 98765 43210",
        status="ACTIVE"
    )

    admin_user = {"email": "admin@codebuffet.edu", "role": "admin"}
    try:
        res = enroll_faculty_mentor(req, current_user=admin_user)

        assert res["success"] is True
        assert staff_id in res["message"]
        assert res["mentor"]["staff_id"] == staff_id
        assert res["mentor"]["name"] == "Dr. Arvind Nair"
        assert res["mentor"]["role"] == "mentor"
        assert res["mentor"]["department"] == "Computer Science & Engineering"

        # Verify directly in SQLite
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE roll_no = ?", (staff_id,))
        row = c.fetchone()
        assert row is not None
        assert row["full_name"] == "Dr. Arvind Nair"
        assert row["role"] == "mentor"
        assert row["status"] == "ACTIVE"

        # Verify audit log was recorded
        c.execute("SELECT * FROM audit_logs WHERE action = 'FACULTY_ENROLLED' AND resource_id = ?", (str(row["id"]),))
        audit = c.fetchone()
        assert audit is not None, "Audit log was not created for faculty enrollment"

        # Verify newly enrolled mentor is returned in get_mentors
        mentors_list = get_mentors(current_user=admin_user)
        enrolled_mentor = next((m for m in mentors_list if m["name"] == "Dr. Arvind Nair"), None)
        assert enrolled_mentor is not None, "Enrolled mentor not returned in get_mentors directory"

        conn.close()
    finally:
        # Clean up test mentor record
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM users WHERE roll_no = ?", (staff_id,))
        c.execute("DELETE FROM audit_logs WHERE action = 'FACULTY_ENROLLED' AND details LIKE ?", (f"%{staff_id}%",))
        conn.commit()
        conn.close()


def test_enroll_faculty_mentor_duplicate_checks():
    """Tests duplicate rejection for Staff ID and Email."""
    existing_staff_id = "FAC-CSE-104" # Prof. Rajesh Kumar
    existing_email = "rajesh.kumar@codebuffet.edu"

    admin_user = {"email": "admin@codebuffet.edu", "role": "admin"}

    # Duplicate staff_id
    req1 = FacultyEnrollRequest(
        staff_id=existing_staff_id,
        first_name="Dr. New",
        last_name="Faculty",
        email="unique.email12345@codebuffet.edu",
        department="Information Technology"
    )
    with pytest.raises(HTTPException) as exc1:
        enroll_faculty_mentor(req1, current_user=admin_user)
    assert exc1.value.status_code == 400
    assert "already exists" in exc1.value.detail

    # Duplicate email
    req2 = FacultyEnrollRequest(
        staff_id="FAC-UNIQUE-9999",
        first_name="Dr. New",
        last_name="Faculty",
        email=existing_email,
        department="Information Technology"
    )
    with pytest.raises(HTTPException) as exc2:
        enroll_faculty_mentor(req2, current_user=admin_user)
    assert exc2.value.status_code == 400
    assert "already exists" in exc2.value.detail


def test_enroll_placement_officer_success():
    """Tests enrolling a new placement officer administratively."""
    staff_id = f"TPO-TEST-{int(datetime.now().timestamp() * 1000) % 1000000}"
    email = f"officer.{staff_id.lower()}@codebuffet.edu"

    req = PlacementOfficerEnrollRequest(
        staff_id=staff_id,
        first_name="Snehal",
        last_name="Kulkarni",
        email=email,
        department="Career & Corporate Relations",
        designation="Placement Officer",
        phone_number="+91 98765 12345",
        status="ACTIVE"
    )

    admin_user = {"email": "admin@codebuffet.edu", "role": "admin"}
    try:
        res = enroll_placement_officer(req, current_user=admin_user)

        assert res["success"] is True
        assert staff_id in res["message"]
        assert res["officer"]["staff_id"] == staff_id
        assert res["officer"]["name"] == "Snehal Kulkarni"
        assert res["officer"]["role"] == "tpo"

        # Verify directly in SQLite
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE roll_no = ?", (staff_id,))
        row = c.fetchone()
        assert row is not None
        assert row["full_name"] == "Snehal Kulkarni"
        assert row["role"] == "tpo"
        assert row["status"] == "ACTIVE"

        # Verify audit log was recorded
        c.execute("SELECT * FROM audit_logs WHERE action = 'PLACEMENT_OFFICER_ENROLLED' AND resource_id = ?", (str(row["id"]),))
        audit = c.fetchone()
        assert audit is not None, "Audit log was not created for placement officer enrollment"

        # Verify in get_placement_officers directory
        tpo_list = get_placement_officers(current_user=admin_user)
        enrolled_tpo = next((t for t in tpo_list if t["name"] == "Snehal Kulkarni"), None)
        assert enrolled_tpo is not None, "Enrolled officer not returned in get_placement_officers directory"

        conn.close()
    finally:
        # Clean up test officer record
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM users WHERE roll_no = ?", (staff_id,))
        c.execute("DELETE FROM audit_logs WHERE action = 'PLACEMENT_OFFICER_ENROLLED' AND details LIKE ?", (f"%{staff_id}%",))
        conn.commit()
        conn.close()


def test_student_enrollment_intact():
    """Confirms that the existing Enroll Student functionality remains fully functional."""
    roll = f"STU-TEST-{int(datetime.now().timestamp() * 1000) % 1000000}"

    req = StudentCreateRequest(
        roll_no=roll,
        full_name="Tanvi Deshmukh",
        department="Computer Science & Engineering",
        cgpa=8.2,
        backlogs=0,
        overall_attendance_pct=88.0,
        coding_skills=8.0,
        dsa_score=7.5,
        aptitude_score=80.0,
        communication_skills=8.0,
        lms_assignment_completion_pct=85.0,
        assigned_mentor="Prof. Rajesh Kumar"
    )

    admin_user = {"email": "admin@codebuffet.edu", "role": "admin"}
    try:
        res = create_student(req, current_user=admin_user)

        assert res["success"] is True
        assert res["student"]["roll_no"] == roll
        assert res["student"]["name"] == "Tanvi Deshmukh"

        # Verify in database
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM students WHERE roll_no = ?", (roll,))
        row = c.fetchone()
        assert row is not None
        assert row["full_name"] == "Tanvi Deshmukh"
        assert row["record_type"] == "verified_profile"
        conn.close()
    finally:
        # Clean up test student record
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM students WHERE roll_no = ?", (roll,))
        c.execute("DELETE FROM audit_logs WHERE action = 'STUDENT_ENROLLED' AND resource_id = ?", (roll,))
        conn.commit()
        conn.close()


if __name__ == "__main__":
    print("Testing demo accounts...", flush=True)
    test_configured_demo_accounts_valid()
    print("Testing faculty enrollment...", flush=True)
    test_enroll_faculty_mentor_success()
    print("Testing duplicate checks...", flush=True)
    test_enroll_faculty_mentor_duplicate_checks()
    print("Testing placement officer enrollment...", flush=True)
    test_enroll_placement_officer_success()
    print("Testing student enrollment...", flush=True)
    test_student_enrollment_intact()
    print("ALL 5 TESTS PASSED SUCCESSFULLY!", flush=True)
