import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import openpyxl

from app.database import get_db
from app.ingestion.normalizer import (
    normalize_reg_no,
    normalize_name,
    normalize_branch,
    normalize_cgpa,
    normalize_semester,
    normalize_percentage,
    DEPARTMENT_MAP
)
from app.ingestion.data_quality import DataQualityReport, QualityMetric

logger = logging.getLogger("academic_pipeline.ingestion")

class StudentDataIngestionPipeline:
    """Robust, idempotent data ingestion and normalization pipeline for student records."""

    def __init__(self, sample_data_dir: Path = Path("sample_data"), exports_dir: Path = Path("exports")):
        self.sample_data_dir = sample_data_dir
        self.exports_dir = exports_dir

    def run_initial_ingestion(self) -> Dict[str, Any]:
        """Ingest all supplied files and produce an audit quality report."""
        logger.info("Starting student data ingestion from supplied repository files...")
        report = DataQualityReport(dataset_name="VFSTR_Supplied_Repository_Files")
        
        job_id = None
        records_read = 0
        records_inserted = 0
        records_updated = 0
        records_rejected = 0

        # Create import job entry
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO data_import_jobs (job_type, source_name, status)
                VALUES ('MULTI_SOURCE_INGESTION', 'sample_data/ & exports/', 'RUNNING')
            """)
            job_id = cur.lastrowid

        try:
            # 1. Load API Students
            api_file = self.sample_data_dir / "existing_api_students.json"
            api_records = []
            if api_file.exists():
                with open(api_file, "r", encoding="utf-8") as f:
                    api_records = json.load(f)
            
            # 2. Load Teacher Students
            teacher_file = self.sample_data_dir / "existing_teacher_students.json"
            teacher_records = []
            if teacher_file.exists():
                with open(teacher_file, "r", encoding="utf-8") as f:
                    t_data = json.load(f)
                    teacher_records = t_data.get("data", [])

            # Map teacher records by student_id
            teacher_by_id = {}
            for tr in teacher_records:
                tid = normalize_reg_no(tr.get("student_id"))
                if tid:
                    teacher_by_id[tid] = tr

            # Process API Records
            processed_reg_nos = set()

            for rec in api_records:
                records_read += 1
                raw_reg = rec.get("reg_no")
                reg_no = normalize_reg_no(raw_reg)

                if not reg_no:
                    records_rejected += 1
                    report.missing_id_rows += 1
                    report.validation_errors.append({
                        "raw_record": rec,
                        "error": "Missing or invalid registration number"
                    })
                    continue

                if reg_no in processed_reg_nos:
                    report.duplicate_rows += 1
                    continue
                processed_reg_nos.add(reg_no)

                # Name cleaning & cross-referencing
                raw_name = rec.get("student_name")
                cleaned_name, is_malformed, issue_desc = normalize_name(raw_name, reg_no)

                # Check if teacher dataset has a higher quality name
                if (is_malformed or cleaned_name.startswith("Student (")) and reg_no in teacher_by_id:
                    t_name = teacher_by_id[reg_no].get("name")
                    if t_name:
                        cleaned_name = t_name
                        is_malformed = False
                        issue_desc = None

                branch = normalize_branch(rec.get("branch"))
                sem = normalize_semester(rec.get("semester"))
                cgpa = normalize_cgpa(rec.get("cgpa"))
                section = rec.get("section") or "A"

                # Determine verification status
                if is_malformed or cgpa == 0.0:
                    status = "REVIEW_REQUIRED"
                    report.anomalous_rows += 1
                elif cleaned_name.startswith("Student ("):
                    status = "REFERENCE_INCOMPLETE"
                else:
                    status = "VERIFIED"

                # Check existing student in DB
                with get_db() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT id FROM students WHERE reg_no = ?", (reg_no,))
                    existing = cur.fetchone()

                    if existing:
                        student_id = existing["id"]
                        cur.execute("""
                            UPDATE students 
                            SET name = ?, branch = ?, current_semester = ?, section = ?,
                                verification_status = ?, updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        """, (cleaned_name, branch, sem, section, status, student_id))
                        records_updated += 1
                    else:
                        cur.execute("""
                            INSERT INTO students (reg_no, name, branch, current_semester, section, verification_status, data_origin)
                            VALUES (?, ?, ?, ?, ?, ?, 'IMPORTED_DATA')
                        """, (reg_no, cleaned_name, branch, sem, section, status))
                        student_id = cur.lastrowid
                        records_inserted += 1

                    # Upsert academic_record for current semester
                    cur.execute("""
                        INSERT INTO academic_records (student_id, semester, cgpa, trend, source_provenance)
                        VALUES (?, ?, ?, 'STABLE', 'existing_api_students.json')
                        ON CONFLICT(student_id, semester) DO UPDATE SET
                            cgpa = excluded.cgpa
                    """, (student_id, sem, cgpa))

            # Also incorporate any teacher records that were not in API records
            for tr in teacher_records:
                tid = normalize_reg_no(tr.get("student_id"))
                if not tid or tid in processed_reg_nos:
                    continue
                records_read += 1
                processed_reg_nos.add(tid)

                cleaned_name, is_malformed, issue_desc = normalize_name(tr.get("name"), tid)
                branch = normalize_branch(tr.get("department"))
                sem = normalize_semester(tr.get("semester"))
                cgpa = normalize_cgpa(tr.get("cgpa"))
                status = "VERIFIED" if not is_malformed and cgpa > 0 else "REVIEW_REQUIRED"

                with get_db() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT id FROM students WHERE reg_no = ?", (tid,))
                    existing = cur.fetchone()
                    if existing:
                        student_id = existing["id"]
                        cur.execute("""
                            UPDATE students 
                            SET name = ?, branch = ?, current_semester = ?, verification_status = ?, updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        """, (cleaned_name, branch, sem, status, student_id))
                        records_updated += 1
                    else:
                        cur.execute("""
                            INSERT INTO students (reg_no, name, branch, current_semester, verification_status, data_origin)
                            VALUES (?, ?, ?, ?, ?, 'IMPORTED_DATA')
                        """, (tid, cleaned_name, branch, sem, status))
                        student_id = cur.lastrowid
                        records_inserted += 1

                    cur.execute("""
                        INSERT INTO academic_records (student_id, semester, cgpa, trend, source_provenance)
                        VALUES (?, ?, ?, 'STABLE', 'existing_teacher_students.json')
                        ON CONFLICT(student_id, semester) DO UPDATE SET
                            cgpa = excluded.cgpa
                    """, (student_id, sem, cgpa))

            report.total_rows = records_read
            report.valid_rows = records_inserted + records_updated

            # Calculate Category Completeness across the 7 categories for these imported records
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM students")
                total_st = cur.fetchone()[0]

                # 1. Academic
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM academic_records")
                acad_count = cur.fetchone()[0]
                report.category_metrics["Academic"] = QualityMetric(
                    category="Academic Data",
                    total_records=total_st,
                    populated_records=acad_count,
                    missing_records=total_st - acad_count,
                    completeness_percentage=round((acad_count / total_st * 100), 1) if total_st else 0
                )

                # 2. Attendance
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM attendance_records")
                att_count = cur.fetchone()[0]
                report.category_metrics["Attendance"] = QualityMetric(
                    category="Attendance Data",
                    total_records=total_st,
                    populated_records=att_count,
                    missing_records=total_st - att_count,
                    completeness_percentage=round((att_count / total_st * 100), 1) if total_st else 0
                )

                # 3. LMS
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM lms_activities")
                lms_count = cur.fetchone()[0]
                report.category_metrics["LMS"] = QualityMetric(
                    category="LMS Activity Data",
                    total_records=total_st,
                    populated_records=lms_count,
                    missing_records=total_st - lms_count,
                    completeness_percentage=round((lms_count / total_st * 100), 1) if total_st else 0
                )

                # 4. Engagement
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM student_engagements")
                eng_count = cur.fetchone()[0]
                report.category_metrics["Engagement"] = QualityMetric(
                    category="Student Engagement Data",
                    total_records=total_st,
                    populated_records=eng_count,
                    missing_records=total_st - eng_count,
                    completeness_percentage=round((eng_count / total_st * 100), 1) if total_st else 0
                )

                # 5. Placement
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM placement_readiness")
                plc_count = cur.fetchone()[0]
                report.category_metrics["Placement"] = QualityMetric(
                    category="Placement Readiness Data",
                    total_records=total_st,
                    populated_records=plc_count,
                    missing_records=total_st - plc_count,
                    completeness_percentage=round((plc_count / total_st * 100), 1) if total_st else 0
                )

                # 6. Skills
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM skill_assessments")
                skl_count = cur.fetchone()[0]
                report.category_metrics["Skills"] = QualityMetric(
                    category="Skill Assessment Data",
                    total_records=total_st,
                    populated_records=skl_count,
                    missing_records=total_st - skl_count,
                    completeness_percentage=round((skl_count / total_st * 100), 1) if total_st else 0
                )

                # 7. Feedback
                cur.execute("SELECT COUNT(DISTINCT student_id) FROM feedback_records")
                fdb_count = cur.fetchone()[0]
                report.category_metrics["Feedback"] = QualityMetric(
                    category="Faculty/Student Feedback Data",
                    total_records=total_st,
                    populated_records=fdb_count,
                    missing_records=total_st - fdb_count,
                    completeness_percentage=round((fdb_count / total_st * 100), 1) if total_st else 0
                )

                # Close import job & save quality report
                cur.execute("""
                    UPDATE data_import_jobs
                    SET records_read = ?, records_inserted = ?, records_updated = ?,
                        records_rejected = ?, status = 'COMPLETED'
                    WHERE id = ?
                """, (records_read, records_inserted, records_updated, records_rejected, job_id))

                cur.execute("""
                    INSERT INTO data_quality_reports (import_job_id, dataset_name, total_rows, valid_rows, duplicate_rows, missing_id_rows, validation_errors_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (job_id, report.dataset_name, report.total_rows, report.valid_rows, report.duplicate_rows, report.missing_id_rows, json.dumps(report.to_dict())))

            logger.info(f"Ingestion completed. Inserted {records_inserted}, Updated {records_updated}, Rejected {records_rejected}.")
            return report.to_dict()

        except Exception as e:
            logger.error(f"Error during ingestion: {e}")
            with get_db() as conn:
                cur = conn.cursor()
                if job_id:
                    cur.execute("""
                        UPDATE data_import_jobs
                        SET status = 'FAILED', error_details = ?
                        WHERE id = ?
                    """, (str(e), job_id))
            raise
