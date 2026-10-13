"""
CODEBUFFET — Universal Dataset Ingestion & Reconciliation Engine
Imports and reconciles student datasets from CSV, Excel (.xlsx), and JSON.
Validates fields, normalizes types, preserves source identifiers and provenance,
computes ML success scores and decoupled risk indicators, and enforces transactional safety.
"""

import os
import sys
import json
import sqlite3
import pandas as pd
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

from ml_service import calculate_student_success_score, predict_student_risks

DEFAULT_DB_PATH = os.path.join(BASE_DIR, "backend", "codebuffet.db")

BRANCH_MAP = {
    "CSE": "Computer Science & Engineering",
    "IT": "Information Technology",
    "ECE": "Electronics & Communication",
    "EE": "Electrical & Electronics",
    "EEE": "Electrical & Electronics",
    "ME": "Mechanical Engineering",
    "MECH": "Mechanical Engineering",
    "CE": "Civil Engineering",
    "CIVIL": "Civil Engineering",
    "Chemical": "Chemical Engineering",
    "CHEM": "Chemical Engineering",
}

AVAILABLE_MENTORS = [
    "Prof. Vihaan Singh",
    "Dr. Sunita Sharma",
    "Prof. K. Murthy",
]

UNSPLASH_AVATARS = [
    "photo-1534528741775-53994a69daeb", "photo-1507003211169-0a1dd7228f2d",
    "photo-1500648767791-00dcc994a43e", "photo-1494790108377-be9c29b29330",
    "photo-1522075469751-3a6694fb2f61", "photo-1517841905240-472988babdf9",
    "photo-1539571696357-5a69c17a67c6", "photo-1524504388940-b1c1722653e1",
    "photo-1506794778202-cad84cf45f1d", "photo-1519085360753-af0119f7cbe7",
    "photo-1534751516642-a171edd25218", "photo-1544005313-94ddf0286df2",
    "photo-1508214751196-bcfd4ca60f91", "photo-1492562080023-ab3db95bfbce",
    "photo-1548142813-c348350df52b", "photo-1531746020798-e6953c6e8e04",
    "photo-1570295999919-56ceb5ecca61", "photo-1580489944761-15a19d654956",
    "photo-1527980965255-d3b416303d12", "photo-1544717305-2782549b5136",
    "photo-1519764622345-23439dd774f7", "photo-1535713875002-d1d0cf377fde",
    "photo-1560250097-0b93528c311a", "photo-1573496359142-b8d87734a5a2",
    "photo-1573497019940-1c28c88b4f3e", "photo-1562788869-4ed32648eb72",
    "photo-1542206395-9feb3edaa68d", "photo-1563237023-b1e970526dbe",
    "photo-1566492031773-4f4e44671857", "photo-1568602471122-7832951cc4c5"
]

def get_mentor_for_department(dept: str) -> str:
    d = (dept or "").lower()
    if "computer" in d or "information" in d or "cse" in d or "it" in d:
        return "Prof. Vihaan Singh"
    elif "electronics" in d or "electrical" in d or "ece" in d or "eee" in d:
        return "Dr. Sunita Sharma"
    else:
        return "Prof. K. Murthy"



def ingest_dataset(
    file_path: str,
    db_path: str = DEFAULT_DB_PATH,
    record_type: str = "anonymous_cohort",
    source_label: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ingests records from CSV, Excel, or JSON into the SQLite students table.
    Enforces transaction safety, schema validation, and idempotent upserts.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Source file not found at: {file_path}")

    # Determine file format and read
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    elif ext in [".json", ".jsonl"]:
        df = pd.read_json(file_path, lines=(ext == ".jsonl"))
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Must be .csv, .xlsx, or .json/.jsonl")

    total_source_rows = len(df)
    source_provenance = source_label or f"Imported from {os.path.basename(file_path)} ({total_source_rows:,} records)"

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM students")
    pre_count = cursor.fetchone()[0]

    accepted_records = []
    rejected_count = 0
    duplicate_count = 0

    seen_ids = set()

    for idx, row in df.iterrows():
        try:
            # 1. Identifier extraction
            raw_id = row.get("student_id") or row.get("roll_no") or row.get("ID")
            if pd.notnull(raw_id) and str(raw_id).strip():
                roll_no = str(raw_id).strip()
            else:
                roll_no = f"COHORT-{idx + 1:05d}"

            if roll_no in seen_ids:
                duplicate_count += 1
                continue
            seen_ids.add(roll_no)

            # 2. Name & Personal Fields (Do not fabricate real personal names if anonymous)
            raw_name = row.get("full_name") or row.get("name") or row.get("Name")
            if pd.notnull(raw_name) and str(raw_name).strip():
                full_name = str(raw_name).strip()
                row_record_type = "verified_profile"
            else:
                full_name = f"Cohort Record #{idx + 1:05d}"
                row_record_type = record_type

            # 3. Department & Demographics
            raw_branch = str(row.get("branch") or row.get("department") or row.get("preferred_domain") or "CSE").strip()
            dept = BRANCH_MAP.get(raw_branch, raw_branch)
            year = str(row.get("year", "3rd Year"))
            semester = int(row.get("semester", 6))

            # 4. Academic & Attendance Indicators
            cgpa = float(row["cgpa"]) if pd.notnull(row.get("cgpa")) else 7.0
            cgpa = max(0.0, min(10.0, cgpa))
            backlogs = int(row["backlogs"]) if pd.notnull(row.get("backlogs")) else 0
            backlogs = max(0, min(20, backlogs))

            raw_att = row.get("overall_attendance_pct") or row.get("attendance_percentage") or row.get("attendance")
            if pd.notnull(raw_att):
                attendance = float(raw_att)
            else:
                import hashlib
                base_att = 65.0 + (cgpa - 5.5) * 6.0 - (backlogs * 5.5)
                noise = ((int(hashlib.md5(roll_no.encode()).hexdigest()[:6], 16) % 91) - 45) / 10.0
                attendance = round(max(55.0, min(97.8, base_att + noise)), 1)
            attendance = max(0.0, min(100.0, attendance))

            # 5. Technical & Skill Indicators
            coding = float(row.get("coding_skills") or row.get("coding_score", 50.0 if "coding_score" in row else 5.0))
            if coding > 10.0:  # normalize 0-100 to 0-10
                coding = coding / 10.0
            coding = max(0.0, min(10.0, coding))

            dsa = float(row.get("dsa_score") or row.get("technical_score", 50.0 if "technical_score" in row else 5.0))
            if dsa > 10.0:
                dsa = dsa / 10.0
            dsa = max(0.0, min(10.0, dsa))

            aptitude = float(row.get("aptitude_score", 60.0))
            aptitude = max(0.0, min(100.0, aptitude))

            comm = float(row.get("communication_skills") or row.get("communication_score", 60.0 if "communication_score" in row else 6.0))
            if comm > 10.0:
                comm = comm / 10.0
            comm = max(0.0, min(10.0, comm))

            lms_comp = float(row.get("lms_assignment_completion_pct", 80.0))
            lms_comp = max(0.0, min(100.0, lms_comp))

            # 6. Placement Outcome (observed status vs predicted risk)
            placement_status = None
            if "placement_status" in row and pd.notnull(row.get("placement_status")):
                placement_status = int(row["placement_status"])
            elif "placed" in row and pd.notnull(row.get("placed")):
                placement_status = int(row["placed"])

            # 7. Compute Transparent ML Success Score
            student_dict = {
                "cgpa": cgpa,
                "backlogs": backlogs,
                "overall_attendance_pct": attendance,
                "aptitude_score": aptitude,
                "coding_skills": coding,
                "dsa_score": dsa,
                "lms_assignment_completion_pct": lms_comp,
                "lms_logins_per_week": 8,
                "communication_skills": comm,
                "system_design": float(row.get("system_design", 5.0)),
                "hackathons": int(row.get("hackathons") or row.get("hackathons_participated", 0)),
                "certifications": int(row.get("certifications") or row.get("certifications_count", 0)),
            }
            score_res = calculate_student_success_score(student_dict)
            success_score = score_res["student_success_score"]

            # 8. Compute Decoupled Risk Ratings
            risk_res = predict_student_risks(student_dict)
            acad_prob = risk_res["academic_risk"]["probability"]
            acad_band = risk_res["academic_risk"]["band"]
            plac_prob = risk_res["placement_risk"]["probability"]
            plac_band = risk_res["placement_risk"]["band"]

            # Department-aligned mentor assignment
            mentor = get_mentor_for_department(dept)

            # Curated Unsplash portrait
            avatar_url = f"https://images.unsplash.com/{UNSPLASH_AVATARS[idx % len(UNSPLASH_AVATARS)]}?w=150&auto=format&fit=crop&q=80"

            # Calculate data completeness
            known_domains = sum([
                pd.notnull(row.get("cgpa")),
                pd.notnull(row.get("backlogs")),
                pd.notnull(raw_att),
                pd.notnull(row.get("coding_skills") or row.get("coding_score")),
                pd.notnull(row.get("aptitude_score")),
                pd.notnull(row.get("communication_skills") or row.get("communication_score")),
            ])
            completeness = round((known_domains / 6.0) * 100.0, 1)

            accepted_records.append((
                roll_no,
                None, # user_id
                full_name,
                dept,
                year,
                semester,
                cgpa,
                backlogs,
                attendance,
                coding,
                dsa,
                aptitude,
                comm,
                lms_comp,
                success_score,
                acad_prob,
                acad_band,
                plac_prob,
                plac_band,
                avatar_url,
                mentor,
                row_record_type,
                source_provenance,
                placement_status,
                completeness,
                None # notes
            ))

        except Exception as e:
            rejected_count += 1
            continue

    # Execute transactional upsert
    upsert_sql = """
    INSERT INTO students (
        roll_no, user_id, full_name, department, year, semester, cgpa, backlogs,
        overall_attendance_pct, coding_skills, dsa_score, aptitude_score,
        communication_skills, lms_assignment_completion_pct, success_score,
        academic_risk_prob, academic_risk_band, placement_risk_prob, placement_risk_band,
        avatar_url, assigned_mentor, record_type, source_provenance, placement_status,
        data_completeness, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(roll_no) DO UPDATE SET
        department=excluded.department,
        cgpa=excluded.cgpa,
        backlogs=excluded.backlogs,
        overall_attendance_pct=excluded.overall_attendance_pct,
        coding_skills=excluded.coding_skills,
        dsa_score=excluded.dsa_score,
        aptitude_score=excluded.aptitude_score,
        communication_skills=excluded.communication_skills,
        lms_assignment_completion_pct=excluded.lms_assignment_completion_pct,
        success_score=excluded.success_score,
        academic_risk_prob=excluded.academic_risk_prob,
        academic_risk_band=excluded.academic_risk_band,
        placement_risk_prob=excluded.placement_risk_prob,
        placement_risk_band=excluded.placement_risk_band,
        assigned_mentor=COALESCE(students.assigned_mentor, excluded.assigned_mentor),
        record_type=excluded.record_type,
        source_provenance=excluded.source_provenance,
        placement_status=COALESCE(excluded.placement_status, students.placement_status),
        data_completeness=excluded.data_completeness
    """

    cursor.executemany(upsert_sql, accepted_records)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM students")
    post_count = cursor.fetchone()[0]

    cursor.execute("SELECT record_type, COUNT(*) FROM students GROUP BY record_type")
    type_breakdown = {r[0]: r[1] for r in cursor.fetchall()}

    conn.close()

    return {
        "source_file": file_path,
        "source_rows": total_source_rows,
        "accepted_rows": len(accepted_records),
        "rejected_rows": rejected_count,
        "duplicate_rows": duplicate_count,
        "pre_import_count": pre_count,
        "post_import_count": post_count,
        "record_type_breakdown": type_breakdown,
        "source_provenance": source_provenance,
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="CODEBUFFET Dataset Ingestion Tool")
    parser.add_argument("--file", default=os.path.join(BASE_DIR, "kaggle.csv"), help="Path to CSV/Excel/JSON dataset")
    parser.add_argument("--type", default="anonymous_cohort", choices=["anonymous_cohort", "verified_profile", "placement_record"])
    parser.add_argument("--label", default=None, help="Custom provenance label")
    args = parser.parse_args()

    print("=" * 70)
    print("CODEBUFFET Universal Dataset Ingestion Engine")
    print("=" * 70)
    summary = ingest_dataset(args.file, record_type=args.type, source_label=args.label)
    print(f"Source File:         {summary['source_file']}")
    print(f"Total Source Rows:   {summary['source_rows']:,}")
    print(f"Accepted Records:    {summary['accepted_rows']:,}")
    print(f"Rejected Records:    {summary['rejected_rows']:,}")
    print(f"Duplicate IDs:       {summary['duplicate_rows']:,}")
    print(f"Pre-Import DB Count: {summary['pre_import_count']:,}")
    print(f"Post-Import DB Count:{summary['post_import_count']:,}")
    print(f"Database Breakdown:  {summary['record_type_breakdown']}")
    print("=" * 70)
