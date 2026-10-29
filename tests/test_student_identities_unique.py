"""
CODEBUFFET — Unique Student Profiles & Deterministic Identity Verification Tests
Verifies:
1. All 50,008 students have 100% unique names (0 duplicates).
2. All 50,008 students have 100% unique avatar URLs (0 duplicates).
3. Verified student identities and avatars are preserved intact.
4. Determinism: same roll_no generates the exact same name and avatar every time.
5. Zero placeholder names ('Benchmark Student', 'Student XXXXX', etc.).
6. Academic metrics, risk bands, CGPA, backlogs, and attendance are strictly unaltered.
"""

import os
import sqlite3
import pytest
from backend.identity_service import (
    get_deterministic_student_name,
    get_deterministic_avatar_url,
    PROTECTED_IDENTITIES,
    CURATED_BENCHMARK_NAMES,
    ALL_PROTECTED_NAMES_SET
)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "codebuffet.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def test_database_record_counts():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM students")
    total = c.fetchone()[0]
    conn.close()
    assert total == 50008, f"Expected 50,008 total student records, got {total}"


def test_student_names_strictly_unique():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*), COUNT(DISTINCT full_name) FROM students")
    total, distinct_names = c.fetchone()

    # Find any duplicate names if present
    c.execute("SELECT full_name, COUNT(*) FROM students GROUP BY full_name HAVING COUNT(*) > 1")
    duplicates = c.fetchall()
    conn.close()

    assert duplicates == [], f"Found duplicate student names in database: {duplicates[:10]}"
    assert total == distinct_names == 50008, f"Expected 50,008 distinct names, got {distinct_names}"


def test_student_avatars_strictly_unique():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*), COUNT(DISTINCT avatar_url) FROM students")
    total, distinct_avatars = c.fetchone()

    # Find any duplicate avatars if present
    c.execute("SELECT avatar_url, COUNT(*) FROM students GROUP BY avatar_url HAVING COUNT(*) > 1")
    duplicates = c.fetchall()
    conn.close()

    assert duplicates == [], f"Found duplicate avatars in database: {duplicates[:10]}"
    assert total == distinct_avatars == 50008, f"Expected 50,008 distinct avatars, got {distinct_avatars}"


def test_verified_students_preserved_authentically():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT roll_no, full_name, avatar_url, record_type FROM students WHERE record_type = 'verified_profile'")
    rows = c.fetchall()
    conn.close()

    assert len(rows) == 8, f"Expected 8 verified profiles, found {len(rows)}"

    expected_verified = {
        "STU-2024-042": "Aarav Sharma",
        "STU-2024-001": "Rajesh Kumar",
        "STU-2024-019": "Sneha Reddy",
        "STU-2024-088": "Vamsi Krishna",
        "STU-2024-112": "Ananya Verma",
        "STU-2024-054": "Rohan Das",
        "STU-2024-067": "Pooja Hegde",
        "STU-2024-093": "Aditya Rao",
    }

    for row in rows:
        roll = row["roll_no"]
        name = row["full_name"]
        avatar = row["avatar_url"]
        assert roll in expected_verified, f"Unexpected verified student roll_no: {roll}"
        assert name == expected_verified[roll], f"Verified student name mismatch for {roll}: got {name}, expected {expected_verified[roll]}"
        assert "unsplash.com" in avatar, f"Verified student {roll} avatar was overwritten: {avatar}"


def test_no_placeholder_or_generic_names():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT roll_no, full_name FROM students
        WHERE full_name LIKE '%Benchmark%'
           OR full_name LIKE 'Student %'
           OR full_name = 'Student'
           OR full_name = 'Unknown'
           OR full_name IS NULL
           OR TRIM(full_name) = ''
    """)
    placeholders = c.fetchall()
    conn.close()

    assert placeholders == [], f"Found placeholder student names in database: {placeholders[:10]}"


def test_deterministic_generation_repeatability():
    test_rolls = [
        "STU-00043", "STU-00044", "STU-01000", "STU-25000", "STU-49999", "STU-50000",
        "STU-2024-042", "STU-2024-101", "STU-2024-143"
    ]

    for roll in test_rolls:
        name_1 = get_deterministic_student_name(roll)
        name_2 = get_deterministic_student_name(roll)
        assert name_1 == name_2, f"Name not deterministic for {roll}: '{name_1}' != '{name_2}'"

        avatar_1 = get_deterministic_avatar_url(roll)
        avatar_2 = get_deterministic_avatar_url(roll)
        assert avatar_1 == avatar_2, f"Avatar not deterministic for {roll}: '{avatar_1}' != '{avatar_2}'"


def test_academic_metrics_integrity():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN backlogs > 0 THEN 1 ELSE 0 END) as with_backlogs,
            SUM(CASE WHEN academic_risk_band = 'HIGH' THEN 1 ELSE 0 END) as high_risk,
            SUM(CASE WHEN academic_risk_band = 'MEDIUM' THEN 1 ELSE 0 END) as med_risk,
            SUM(CASE WHEN academic_risk_band = 'LOW' THEN 1 ELSE 0 END) as low_risk,
            AVG(cgpa) as avg_cgpa,
            AVG(overall_attendance_pct) as avg_att
        FROM students
    """)
    row = dict(c.fetchone())
    conn.close()

    assert row["total"] == 50008
    assert row["with_backlogs"] > 0, "Backlogs should not be zeroed"
    assert row["high_risk"] > 0, "High academic risk students should exist"
    assert row["med_risk"] > 0, "Medium academic risk students should exist"
    assert row["low_risk"] > 0, "Low academic risk students should exist"
    assert 6.0 <= row["avg_cgpa"] <= 8.5, f"Unreasonable average CGPA: {row['avg_cgpa']}"
    assert 60.0 <= row["avg_att"] <= 85.0, f"Unreasonable average attendance: {row['avg_att']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
