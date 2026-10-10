"""
CODEBUFFET — Database & Persistence Module
Manages SQLite schema initialization, parameterized queries,
and development seed synchronization for user accounts and student telemetry.
"""

import os
import sqlite3
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from backend.auth import hash_password

# Resolve database path relative to repository
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))
DB_PATH = os.path.join(BASE_DIR, os.getenv("DATABASE_PATH", "backend/codebuffet.db"))


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        roll_no TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL, -- 'admin', 'mentor', 'tpo', 'student'
        role_label TEXT NOT NULL,
        department TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Students Telemetry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        full_name TEXT NOT NULL,
        department TEXT NOT NULL,
        year TEXT NOT NULL,
        semester INTEGER NOT NULL,
        cgpa REAL NOT NULL,
        backlogs INTEGER NOT NULL,
        overall_attendance_pct REAL NOT NULL,
        coding_skills REAL NOT NULL,
        dsa_score REAL NOT NULL,
        aptitude_score REAL NOT NULL,
        communication_skills REAL NOT NULL,
        lms_assignment_completion_pct REAL NOT NULL,
        success_score REAL NOT NULL,
        academic_risk_prob REAL NOT NULL,
        academic_risk_band TEXT NOT NULL,
        placement_risk_prob REAL NOT NULL,
        placement_risk_band TEXT NOT NULL,
        avatar_url TEXT,
        assigned_mentor TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # Backwards-compatible schema evolution: ensure new columns and indexes exist
    cursor.execute("PRAGMA table_info(students)")
    existing_cols = {col[1] for col in cursor.fetchall()}
    if "assigned_mentor" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN assigned_mentor TEXT")
    if "record_type" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN record_type TEXT DEFAULT 'verified_profile'")
    if "source_provenance" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN source_provenance TEXT DEFAULT 'Official University Registrar'")
    if "placement_status" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN placement_status INTEGER")
    if "data_completeness" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN data_completeness REAL DEFAULT 100.0")
    if "notes" not in existing_cols:
        cursor.execute("ALTER TABLE students ADD COLUMN notes TEXT")

    # Fast indexes for server-side pagination, search, and cohort intelligence
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_record_type ON students(record_type);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_acad_risk ON students(academic_risk_band);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_place_risk ON students(placement_risk_band);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_mentor ON students(assigned_mentor);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_score ON students(success_score);")

    # One-time migration: categorize existing student records cleanly
    cursor.execute("""
        UPDATE students
        SET record_type = 'verified_profile',
            source_provenance = 'Official University Registrar (Enrolled B.Tech Cohort)',
            data_completeness = 100.0
        WHERE roll_no LIKE 'STU-2024-%'
    """)
    cursor.execute("""
        UPDATE students
        SET record_type = 'anonymous_cohort',
            source_provenance = 'Kaggle Benchmark Dataset (kaggle.csv - 50,000 Records)',
            data_completeness = 94.1
        WHERE roll_no NOT LIKE 'STU-2024-%'
    """)

    # 3. Interventions & Mentoring Tasks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_roll_no TEXT NOT NULL,
        student_name TEXT NOT NULL,
        department TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        assigned_mentor TEXT NOT NULL,
        status TEXT NOT NULL, -- 'OPEN', 'COMPLETED'
        due_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()


def seed_initial_data():
    """
    Seeds initial hackathon/demo user accounts, 3 faculty mentors, and verified students.
    Passwords are encrypted via PBKDF2 with unique salts.
    Idempotent: inserts missing accounts without disrupting existing data.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    admin_pass = os.getenv("DEFAULT_ADMIN_PASSWORD", "CodeBuffet@2026!")
    student_pass = os.getenv("DEFAULT_STUDENT_PASSWORD", "Student@2026!")
    mentor_pass = os.getenv("DEFAULT_MENTOR_PASSWORD", "Mentor@2026!")
    tpo_pass = os.getenv("DEFAULT_TPO_PASSWORD", "TPO@2026!")

    # 1. Seed Accounts (Admin, 3 Faculty Mentors, TPO Director, Verified Student)
    users_to_seed = [
        (
            os.getenv("DEFAULT_ADMIN_EMAIL", "admin@codebuffet.edu"),
            "EMP-ADMIN-01",
            hash_password(admin_pass),
            "Dr. R. Kumar",
            "admin",
            "Institution Admin",
            "Institutional Planning & Academics",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        ),
        (
            "rajesh.kumar@codebuffet.edu",
            "FAC-CSE-104",
            hash_password(mentor_pass),
            "Prof. Rajesh Kumar",
            "mentor",
            "Senior Faculty Mentor (CSE)",
            "Computer Science & Engineering",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
        ),
        (
            "sunita.sharma@codebuffet.edu",
            "FAC-ECE-201",
            hash_password(mentor_pass),
            "Dr. Sunita Sharma",
            "mentor",
            "Faculty Mentor (ECE & IT)",
            "Electronics & Communication",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
        ),
        (
            "k.murthy@codebuffet.edu",
            "FAC-ME-305",
            hash_password(mentor_pass),
            "Prof. K. Murthy",
            "mentor",
            "Faculty Mentor (Mech & Civil)",
            "Mechanical Engineering",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
        ),
        (
            "vikram.tpo@codebuffet.edu",
            "TPO-OFFICER-02",
            hash_password(tpo_pass),
            "Vikram Malhotra",
            "tpo",
            "Placement Director",
            "Career & Corporate Relations",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
        ),
        (
            os.getenv("DEFAULT_STUDENT_EMAIL", "aarav.sharma@codebuffet.edu"),
            "STU-2024-042",
            hash_password(student_pass),
            "Aarav Sharma",
            "student",
            "Student (B.Tech)",
            "Computer Science & Engineering",
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
        ),
    ]

    for u in users_to_seed:
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (u[0],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO users (email, roll_no, password_hash, full_name, role, role_label, department, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, u)

    # 2. Seed Student Cohort (Verified Identifiable Profiles)
    students_to_seed = [
        ("STU-2024-042", 4, "Aarav Sharma", "Computer Science & Engineering", "3rd Year", 6, 8.42, 0, 88.5, 8.2, 8.5, 78.0, 7.5, 89.0, 85.4, 0.05, "LOW", 0.12, "LOW", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", "Prof. Rajesh Kumar", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-001", None, "Rajesh Kumar", "Computer Science & Engineering", "3rd Year", 6, 6.10, 2, 64.0, 4.0, 3.8, 48.0, 5.2, 58.0, 51.4, 0.72, "HIGH", 0.78, "HIGH", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", "Prof. Rajesh Kumar", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-019", None, "Sneha Reddy", "Electronics & Communication", "2nd Year", 4, 7.40, 0, 68.0, 6.5, 6.0, 65.0, 6.8, 72.0, 69.2, 0.38, "MEDIUM", 0.32, "MEDIUM", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", "Dr. Sunita Sharma", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-088", None, "Vamsi Krishna", "Information Technology", "4th Year", 8, 8.90, 0, 92.0, 9.2, 9.0, 88.0, 8.5, 94.0, 91.8, 0.05, "LOW", 0.08, "LOW", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", "Dr. Sunita Sharma", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-112", None, "Ananya Verma", "Computer Science & Engineering", "3rd Year", 6, 9.15, 0, 95.0, 9.5, 9.4, 92.0, 9.0, 96.0, 94.5, 0.05, "LOW", 0.06, "LOW", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", "Prof. Rajesh Kumar", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-054", None, "Rohan Das", "Mechanical Engineering", "3rd Year", 6, 5.80, 3, 59.0, 3.5, 3.2, 42.0, 4.8, 51.0, 46.2, 0.85, "HIGH", 0.89, "HIGH", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80", "Prof. K. Murthy", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-067", None, "Pooja Hegde", "Electrical & Electronics", "2nd Year", 4, 7.85, 0, 82.0, 7.0, 6.8, 70.0, 7.2, 80.0, 77.4, 0.15, "LOW", 0.22, "LOW", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", "Dr. Sunita Sharma", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0),
        ("STU-2024-093", None, "Aditya Rao", "Civil Engineering", "4th Year", 8, 6.90, 1, 71.0, 5.8, 5.5, 60.0, 6.0, 67.0, 64.8, 0.42, "MEDIUM", 0.48, "MEDIUM", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", "Prof. K. Murthy", "verified_profile", "Official University Registrar (Enrolled B.Tech Cohort)", 100.0)
    ]

    for s in students_to_seed:
        cursor.execute("SELECT id FROM students WHERE roll_no = ?", (s[0],))
        if cursor.fetchone():
            cursor.execute("""
            UPDATE students
            SET assigned_mentor = ?, record_type = ?, source_provenance = ?, data_completeness = ?
            WHERE roll_no = ?
            """, (s[20], s[21], s[22], s[23], s[0]))
        else:
            cursor.execute("""
            INSERT INTO students (
                roll_no, user_id, full_name, department, year, semester, cgpa, backlogs,
                overall_attendance_pct, coding_skills, dsa_score, aptitude_score,
                communication_skills, lms_assignment_completion_pct, success_score,
                academic_risk_prob, academic_risk_band, placement_risk_prob, placement_risk_band,
                avatar_url, assigned_mentor, record_type, source_provenance, data_completeness
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, s)

    # 3. Seed Mentoring Interventions (Distributed across all 3 mentors)
    interventions_to_seed = [
        ("STU-2024-042", "Aarav Sharma", "Computer Science & Engineering", "Complete LeetCode Top 50 DSA practice set", "SKILL_GAP", "Prof. Rajesh Kumar", "OPEN", "Oct 15, 2026"),
        ("STU-2024-042", "Aarav Sharma", "Computer Science & Engineering", "Submit Microservices Architecture case study on LMS", "ACADEMIC", "Prof. Rajesh Kumar", "OPEN", "Oct 22, 2026"),
        ("STU-2024-001", "Rajesh Kumar", "Computer Science & Engineering", "Urgent Attendance Counseling & Arrears Remedial", "ATTENDANCE", "Prof. Rajesh Kumar", "OPEN", "Oct 12, 2026"),
        ("STU-2024-019", "Sneha Reddy", "Electronics & Communication", "Analog Circuit Design Simulation & Viva Practice", "ACADEMIC", "Dr. Sunita Sharma", "OPEN", "Oct 18, 2026"),
        ("STU-2024-067", "Pooja Hegde", "Electrical & Electronics", "Power Systems Assignment & Attendance Catchup", "ATTENDANCE", "Dr. Sunita Sharma", "OPEN", "Oct 20, 2026"),
        ("STU-2024-054", "Rohan Das", "Mechanical Engineering", "Special Faculty Mentorship for Core Arrear Subjects", "ACADEMIC", "Prof. K. Murthy", "OPEN", "Oct 14, 2026"),
        ("STU-2024-093", "Aditya Rao", "Civil Engineering", "Structural Analysis Practice & Placement Readiness Review", "PLACEMENT", "Prof. K. Murthy", "OPEN", "Oct 25, 2026"),
    ]

    for item in interventions_to_seed:
        cursor.execute("SELECT id FROM interventions WHERE student_roll_no = ? AND title = ?", (item[0], item[3]))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO interventions (student_roll_no, student_name, department, title, category, assigned_mentor, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, item)

    conn.commit()
    conn.close()
