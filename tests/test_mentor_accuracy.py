"""
CODEBUFFET — Faculty Mentor Data Accuracy & ML Risk Tests
Validates mentor aggregates, risk segmentation, priority sorting,
filters, pagination, and deterministic ML risk engine rules.
"""

import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_service import predict_student_risks, calculate_student_success_score
from backend.database import get_db_connection


def test_ml_risk_calculation_rules():
    """
    Tests deterministic ML academic risk rules:
    - High CGPA, high attendance, zero backlogs -> LOW
    - Low attendance (<65), zero backlogs -> HIGH
    - Multiple backlogs (>=2), high CGPA -> HIGH
    - Low CGPA (<6.0), several backlogs -> HIGH
    - One backlog, high CGPA -> MEDIUM
    - Missing or invalid academic data -> UNKNOWN (probability 0.50)
    """
    # 1. High CGPA, high attendance, zero backlogs
    r1 = predict_student_risks({"cgpa": 8.5, "overall_attendance_pct": 90.0, "backlogs": 0})
    assert r1["academic_risk"]["band"] == "LOW", f"Expected LOW, got {r1['academic_risk']}"
    assert r1["academic_risk"]["probability"] < 0.25

    # 2. Low attendance, zero backlogs (< 65%)
    r2 = predict_student_risks({"cgpa": 8.5, "overall_attendance_pct": 60.0, "backlogs": 0})
    assert r2["academic_risk"]["band"] == "HIGH", f"Expected HIGH, got {r2['academic_risk']}"
    assert r2["academic_risk"]["probability"] >= 0.65

    # 3. Multiple backlogs with high CGPA (2 backlogs, CGPA 8.5, attendance 90%)
    r3 = predict_student_risks({"cgpa": 8.5, "overall_attendance_pct": 90.0, "backlogs": 2})
    assert r3["academic_risk"]["band"] == "HIGH", f"Expected HIGH, got {r3['academic_risk']}"
    assert r3["academic_risk"]["probability"] >= 0.65

    # 4. Low CGPA with several backlogs (3 backlogs, CGPA 5.5, attendance 58%)
    r4 = predict_student_risks({"cgpa": 5.5, "overall_attendance_pct": 58.0, "backlogs": 3})
    assert r4["academic_risk"]["band"] == "HIGH", f"Expected HIGH, got {r4['academic_risk']}"
    assert r4["academic_risk"]["probability"] >= 0.90

    # 5. One backlog with high CGPA (1 backlog, CGPA 8.0, attendance 85%)
    r5 = predict_student_risks({"cgpa": 8.0, "overall_attendance_pct": 85.0, "backlogs": 1})
    assert r5["academic_risk"]["band"] == "MEDIUM", f"Expected MEDIUM, got {r5['academic_risk']}"
    assert 0.25 <= r5["academic_risk"]["probability"] <= 0.60

    # 6. Missing academic data (None values)
    r6 = predict_student_risks({"cgpa": None, "overall_attendance_pct": None, "backlogs": 0})
    assert r6["academic_risk"]["band"] == "UNKNOWN", f"Expected UNKNOWN, got {r6['academic_risk']}"
    assert r6["academic_risk"]["probability"] == 0.50

    print("[PASS] test_ml_risk_calculation_rules passed!")


def test_mentor_actual_database_aggregates():
    """
    Verifies that mentor aggregates in SQLite match actual records:
    - 20,447 total assigned mentees for Prof. Rajesh Kumar / Prof. Vihaan Singh
    - 3 verified enrolled profiles
    - 20,444 anonymous benchmark records
    - Exactly 6,858 high risk, 6,591 medium risk, 6,998 low risk
    - Exactly 7,089 mentees with backlogs > 0
    """
    conn = get_db_connection()
    c = conn.cursor()

    # Total assigned mentees
    c.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN record_type = 'verified_profile' THEN 1 ELSE 0 END) as verified_cnt,
               SUM(CASE WHEN record_type = 'anonymous_cohort' THEN 1 ELSE 0 END) as cohort_cnt,
               SUM(CASE WHEN academic_risk_band = 'HIGH' THEN 1 ELSE 0 END) as high_cnt,
               SUM(CASE WHEN academic_risk_band = 'MEDIUM' THEN 1 ELSE 0 END) as med_cnt,
               SUM(CASE WHEN academic_risk_band = 'LOW' THEN 1 ELSE 0 END) as low_cnt,
               SUM(CASE WHEN backlogs > 0 THEN 1 ELSE 0 END) as backlogs_cnt
        FROM students
        WHERE LOWER(assigned_mentor) LIKE '%rajesh%' OR LOWER(assigned_mentor) LIKE '%vihaan%'
    """)
    row = c.fetchone()
    conn.close()

    assert row["total"] == 20447, f"Expected 20447, got {row['total']}"
    assert row["verified_cnt"] == 3, f"Expected 3 verified, got {row['verified_cnt']}"
    assert row["cohort_cnt"] == 20444, f"Expected 20444 cohort, got {row['cohort_cnt']}"
    assert row["high_cnt"] == 6858, f"Expected 6858 high risk, got {row['high_cnt']}"
    assert row["med_cnt"] == 6591, f"Expected 6591 medium risk, got {row['med_cnt']}"
    assert row["low_cnt"] == 6998, f"Expected 6998 low risk, got {row['low_cnt']}"
    assert row["backlogs_cnt"] == 7089, f"Expected 7089 with backlogs, got {row['backlogs_cnt']}"

    # Calculate actual percentage distribution
    high_pct = round((row["high_cnt"] / row["total"]) * 100, 1)
    med_pct = round((row["med_cnt"] / row["total"]) * 100, 1)
    low_pct = round((row["low_cnt"] / row["total"]) * 100, 1)

    assert high_pct == 33.5, f"Expected 33.5%, got {high_pct}%"
    assert med_pct == 32.2, f"Expected 32.2%, got {med_pct}%"
    assert low_pct == 34.2, f"Expected 34.2%, got {low_pct}%"

    print("[PASS] test_mentor_actual_database_aggregates passed!")


def test_mentor_sorting_and_risk_prioritization():
    """
    Verifies that default mentor ordering prioritizes:
    1. Verified enrolled profiles at the top
    2. High risk students before Medium, and Medium before Low
    3. Within each risk level, students with more backlogs first
    """
    conn = get_db_connection()
    c = conn.cursor()

    order_clause = """ ORDER BY 
        (CASE WHEN record_type = 'verified_profile' THEN 0 ELSE 1 END) ASC,
        (CASE academic_risk_band WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END) ASC,
        backlogs DESC,
        cgpa ASC,
        overall_attendance_pct ASC"""

    c.execute(f"""
        SELECT roll_no, full_name, record_type, academic_risk_band, backlogs, cgpa
        FROM students
        WHERE LOWER(assigned_mentor) LIKE '%rajesh%' OR LOWER(assigned_mentor) LIKE '%vihaan%'
        {order_clause}
        LIMIT 50
    """)
    rows = c.fetchall()
    conn.close()

    assert len(rows) == 50

    # 1. First 3 must be the verified profiles
    first_3 = rows[:3]
    assert all(r["record_type"] == "verified_profile" for r in first_3)
    # Check within verified profiles: High risk first with backlogs (STU-2024-001), then Low risk
    assert first_3[0]["academic_risk_band"] == "HIGH"
    assert first_3[0]["backlogs"] == 2
    assert first_3[1]["academic_risk_band"] == "LOW"
    assert first_3[2]["academic_risk_band"] == "LOW"

    # 2. Subsequent 47 rows must be HIGH risk benchmark students
    subsequent = rows[3:]
    assert all(r["academic_risk_band"] == "HIGH" for r in subsequent), "Expected all initial benchmark students to be HIGH risk"

    # 3. Within HIGH risk, backlogs must be non-increasing (3, then 2, then 1, etc.)
    backlog_counts = [r["backlogs"] for r in subsequent]
    for i in range(len(backlog_counts) - 1):
        assert backlog_counts[i] >= backlog_counts[i + 1], f"Backlog ordering violated: {backlog_counts[i]} < {backlog_counts[i+1]}"

    # Verify that highest backlogs (3 backlogs) appear first across all 47 initial benchmark rows
    assert all(b == 3 for b in backlog_counts), f"Expected all initial 47 benchmark mentees to have maximum 3 backlogs, got {set(backlog_counts)}"

    print("[PASS] test_mentor_sorting_and_risk_prioritization passed!")


def test_mentor_filters_and_pagination_sql():
    """
    Verifies SQL behavior for Verified filter, High Risk filter, and Pagination.
    """
    conn = get_db_connection()
    c = conn.cursor()

    base_where = "WHERE (LOWER(assigned_mentor) LIKE '%rajesh%' OR LOWER(assigned_mentor) LIKE '%vihaan%')"

    # 1. Verified filter
    c.execute(f"SELECT COUNT(*) FROM students {base_where} AND record_type = 'verified_profile'")
    ver_count = c.fetchone()[0]
    assert ver_count == 3

    # 2. High Risk filter
    c.execute(f"SELECT COUNT(*) FROM students {base_where} AND academic_risk_band = 'HIGH'")
    high_count = c.fetchone()[0]
    assert high_count == 6858

    # 3. Pagination: Page 1 and Page 2 must be disjoint
    c.execute(f"""
        SELECT roll_no FROM students {base_where}
        ORDER BY (CASE WHEN record_type = 'verified_profile' THEN 0 ELSE 1 END) ASC,
                 (CASE academic_risk_band WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END) ASC,
                 backlogs DESC
        LIMIT 50 OFFSET 0
    """)
    page1_rolls = [r[0] for r in c.fetchall()]

    c.execute(f"""
        SELECT roll_no FROM students {base_where}
        ORDER BY (CASE WHEN record_type = 'verified_profile' THEN 0 ELSE 1 END) ASC,
                 (CASE academic_risk_band WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END) ASC,
                 backlogs DESC
        LIMIT 50 OFFSET 50
    """)
    page2_rolls = [r[0] for r in c.fetchall()]

    assert len(page1_rolls) == 50
    assert len(page2_rolls) == 50
    assert len(set(page1_rolls).intersection(set(page2_rolls))) == 0, "Page 1 and Page 2 must have zero overlap"

    conn.close()
    print("[PASS] test_mentor_filters_and_pagination_sql passed!")


if __name__ == "__main__":
    print("Running CODEBUFFET Faculty Mentor Data Accuracy Tests...\n")
    test_ml_risk_calculation_rules()
    test_mentor_actual_database_aggregates()
    test_mentor_sorting_and_risk_prioritization()
    test_mentor_filters_and_pagination_sql()
    print("\nALL FACULTY MENTOR DATA ACCURACY TESTS PASSED SUCCESSFULLY!")
