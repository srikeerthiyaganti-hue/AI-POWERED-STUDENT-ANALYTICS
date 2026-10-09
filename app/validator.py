import sqlite3
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from app.models import (
    CourseCreate,
    SyllabusUnitCreate,
    RegulationCreate,
    ProgramCreate,
    CurriculumCourseCreate
)

logger = logging.getLogger("academic_pipeline.validator")

class ValidationResult:
    def __init__(self, is_valid: bool, errors: List[str] = None):
        self.is_valid = is_valid
        self.errors = errors or []

def validate_source_traceability(source_document_id: Optional[int], conn: sqlite3.Connection) -> ValidationResult:
    """Validate that the record links to a known, valid source document."""
    if not source_document_id or source_document_id <= 0:
        return ValidationResult(False, ["Missing or invalid source_document_id"])
    
    cur = conn.cursor()
    cur.execute("SELECT id, source_url FROM source_documents WHERE id = ?", (source_document_id,))
    row = cur.fetchone()
    if not row:
        return ValidationResult(False, [f"Source document ID {source_document_id} does not exist in database"])
    return ValidationResult(True)

def validate_course_record(course: Dict[str, Any]) -> ValidationResult:
    """Validate fields and constraints of a course."""
    errors = []
    code = str(course.get("course_code", "")).strip()
    name = str(course.get("course_name", "")).strip()

    if not code or len(code) < 3:
        errors.append(f"Invalid course_code: '{code}'")
    if not name or len(name) < 2:
        errors.append(f"Invalid course_name: '{name}'")

    credits = course.get("credits")
    try:
        c_val = float(credits)
        if c_val < 0.0 or c_val > 30.0:
            errors.append(f"Credits out of acceptable range (0..30): {c_val}")
    except (ValueError, TypeError):
        errors.append(f"Non-numeric credits: {credits}")

    for h_field in ["lecture_hours", "tutorial_hours", "practical_hours"]:
        val = course.get(h_field, 0.0)
        try:
            val_f = float(val)
            if val_f < 0.0 or val_f > 40.0:
                errors.append(f"{h_field} out of range (0..40): {val_f}")
        except (ValueError, TypeError):
            errors.append(f"Non-numeric {h_field}: {val}")

    return ValidationResult(len(errors) == 0, errors)

def validate_unit_sequence(units: List[Dict[str, Any]]) -> ValidationResult:
    """
    Validate that units for a course have no duplicates, no missing titles,
    and reasonable numbering (e.g. Unit 1..Unit 5).
    """
    errors = []
    if not units:
        return ValidationResult(True) # Course might not have syllabus units yet

    seen_numbers = set()
    for u in units:
        u_num = u.get("unit_number")
        if u_num is None or not isinstance(u_num, int) or u_num < 1:
            errors.append(f"Invalid unit_number: {u_num}")
            continue
        if u_num in seen_numbers:
            errors.append(f"Duplicate unit_number {u_num} detected in course")
        seen_numbers.add(u_num)

        title = str(u.get("unit_title", "")).strip()
        if not title:
            errors.append(f"Unit {u_num} is missing unit_title")
        topics = str(u.get("topic_text", "")).strip()
        if not topics:
            errors.append(f"Unit {u_num} is missing topic_text")

    # Check for gaps if consecutive units
    if seen_numbers:
        min_u = min(seen_numbers)
        max_u = max(seen_numbers)
        expected = set(range(min_u, max_u + 1))
        missing = expected - seen_numbers
        if missing:
            errors.append(f"Gap in unit sequence: missing unit(s) {sorted(missing)}")

    return ValidationResult(len(errors) == 0, errors)

def log_failed_record(
    conn: sqlite3.Connection,
    source_document_id: Optional[int],
    entity_type: str,
    raw_data: Any,
    errors: List[str]
):
    """Store rejected or flagged record in the staging/review queue table."""
    try:
        raw_json = json.dumps(raw_data, default=str)
        error_msg = "; ".join(errors)
        conn.execute(
            """
            INSERT INTO failed_records (source_document_id, entity_type, raw_data, validation_error)
            VALUES (?, ?, ?, ?)
            """,
            (source_document_id, entity_type, raw_json, error_msg)
        )
        logger.warning(f"Logged failed record [{entity_type}]: {error_msg}")
    except Exception as e:
        logger.error(f"Error logging failed record: {e}")
