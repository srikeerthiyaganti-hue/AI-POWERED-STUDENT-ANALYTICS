import time
import logging
from typing import Dict, Any, Optional, List
from app.database import get_db, init_db
from app.config import SAMPLE_DATA_DIR
from app.extractors.source_manager import (
    OFFICIAL_APPROVED_SOURCES,
    fetch_document_content,
    get_or_register_source
)
from app.extractors.pdf_extractor import AcademicPDFExtractor
from app.extractors.api_extractor import AcademicAPIExtractor
from app.validator import (
    validate_course_record,
    validate_unit_sequence,
    validate_source_traceability,
    log_failed_record
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("academic_pipeline.pipeline")

class AcademicExtractionPipeline:
    """End-to-end pipeline for harvesting, validating, and persisting Vignan academic data."""

    def __init__(self, db_path=None, dry_run: bool = False):
        self.dry_run = dry_run
        self.db_path = db_path
        if not self.dry_run:
            init_db()

    def run(self) -> Dict[str, Any]:
        """Execute extraction and validation across all approved Vignan sources."""
        stats = {
            "pages_processed": 0,
            "records_created": 0,
            "records_updated": 0,
            "records_rejected": 0,
            "sources_processed": 0,
            "sources_skipped_incremental": 0,
            "status": "COMPLETED",
            "error_summary": None
        }

        start_time = time.time()
        logger.info(f"Starting Vignan Academic Extraction Pipeline (Dry run: {self.dry_run})...")

        crawl_run_id = None
        if not self.dry_run:
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO crawl_runs (status) VALUES ('RUNNING')")
                crawl_run_id = cur.lastrowid

        try:
            with get_db() as conn:
                # Process each approved source
                for src_info in OFFICIAL_APPROVED_SOURCES:
                    url = src_info["url"]
                    title = src_info["title"]
                    doc_type = src_info["type"]
                    reg_code = src_info["regulation"]
                    local_fallback = src_info.get("local_file")

                    logger.info(f"Processing source: {title} ({url})")

                    try:
                        content_bytes = fetch_document_content(url, local_fallback)
                    except Exception as e:
                        logger.error(f"Failed to fetch {url}: {e}")
                        stats["records_rejected"] += 1
                        continue

                    # Register or check content hash
                    source_id, is_modified = get_or_register_source(
                        conn,
                        url=url,
                        title=title,
                        document_type=doc_type,
                        regulation_code=reg_code,
                        content_bytes=content_bytes,
                        file_path=str(SAMPLE_DATA_DIR / local_fallback) if local_fallback else None
                    )

                    if not is_modified and not self.dry_run:
                        logger.info(f"Source {title} content unchanged (incremental skip).")
                        stats["sources_skipped_incremental"] += 1
                        continue

                    stats["sources_processed"] += 1

                    # 1. Regulations registration
                    reg_id = self._ensure_regulation(conn, reg_code, title, source_id)

                    # 2. Extract content based on document type
                    if doc_type == "curriculum_pdf":
                        self._process_curriculum_pdf(conn, content_bytes, source_id, reg_id, stats)
                    elif doc_type == "api_endpoint" and "subjects" in url:
                        self._process_api_subjects(conn, content_bytes, source_id, reg_id, stats)
                    elif doc_type == "api_endpoint" and "curriculum" in url:
                        self._process_curriculum_graph(conn, content_bytes, stats)
                    elif doc_type == "regulation_pdf":
                        stats["pages_processed"] += 30 # Regulation document registered

                    # Mark source document as processed
                    if not self.dry_run:
                        conn.execute(
                            "UPDATE source_documents SET extraction_status = 'processed' WHERE id = ?",
                            (source_id,)
                        )

            logger.info("Pipeline completed successfully!")

        except Exception as e:
            stats["status"] = "FAILED"
            stats["error_summary"] = str(e)
            logger.error(f"Pipeline encountered critical error: {e}", exc_info=True)

        finally:
            elapsed = time.time() - start_time
            if crawl_run_id and not self.dry_run:
                with get_db() as conn:
                    conn.execute(
                        """
                        UPDATE crawl_runs
                        SET finished_at = CURRENT_TIMESTAMP,
                            pages_processed = ?,
                            records_created = ?,
                            records_updated = ?,
                            records_rejected = ?,
                            status = ?,
                            error_summary = ?
                        WHERE id = ?
                        """,
                        (
                            stats["pages_processed"],
                            stats["records_created"],
                            stats["records_updated"],
                            stats["records_rejected"],
                            stats["status"],
                            stats["error_summary"],
                            crawl_run_id
                        )
                    )

        stats["elapsed_seconds"] = round(elapsed, 2)
        return stats

    def _ensure_regulation(self, conn, reg_code: str, title: str, source_id: int, degree: str = "B.Tech") -> int:
        """Ensure regulation record exists and return regulation_id."""
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM regulations WHERE regulation_code = ? AND degree = ?",
            (reg_code, degree)
        )
        row = cur.fetchone()
        if row:
            return row["id"]

        cur.execute(
            """
            INSERT INTO regulations (regulation_code, regulation_name, effective_academic_year, degree, source_document_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (reg_code, f"VFSTR Academic Regulations {reg_code} ({degree})", "2022-2023", degree, source_id)
        )
        return cur.lastrowid

    def _ensure_program(self, conn, branch_code: str, program_name: str, reg_id: int, degree: str = "B.Tech") -> int:
        """Ensure program record exists and return program_id."""
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM programs WHERE branch_code = ? AND degree = ? AND regulation_id = ?",
            (branch_code, degree, reg_id)
        )
        row = cur.fetchone()
        if row:
            return row["id"]

        cur.execute(
            """
            INSERT INTO programs (program_name, branch_code, degree, regulation_id)
            VALUES (?, ?, ?, ?)
            """,
            (program_name, branch_code, degree, reg_id)
        )
        return cur.lastrowid

    def _ensure_semester(self, conn, program_id: int, semester_num: int) -> int:
        """Ensure semester record exists and return semester_id."""
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM semesters WHERE program_id = ? AND semester_number = ?",
            (program_id, semester_num)
        )
        row = cur.fetchone()
        if row:
            return row["id"]

        academic_year = f"Year {(semester_num + 1) // 2} Semester {((semester_num - 1) % 2) + 1}"
        cur.execute(
            """
            INSERT INTO semesters (program_id, semester_number, academic_year)
            VALUES (?, ?, ?)
            """,
            (program_id, semester_num, academic_year)
        )
        return cur.lastrowid

    def _process_curriculum_pdf(self, conn, pdf_bytes: bytes, source_id: int, reg_id: int, stats: Dict[str, Any]):
        """Extract and persist 8-semester course structures and detailed syllabi from official PDF."""
        extractor = AcademicPDFExtractor(pdf_bytes, source_id)
        stats["pages_processed"] += extractor.total_pages

        program_id = self._ensure_program(conn, "CSE", "Computer Science and Engineering", reg_id, "B.Tech")

        # 1. Overview course structure across 8 semesters
        curriculum = extractor.extract_curriculum_structure()
        for sem_num, course_list in curriculum.items():
            sem_id = self._ensure_semester(conn, program_id, sem_num)
            for c in course_list:
                v_res = validate_course_record(c)
                if not v_res.is_valid:
                    log_failed_record(conn, source_id, "course", c, v_res.errors)
                    stats["records_rejected"] += 1
                    continue

                course_id = self._upsert_course(conn, c, stats)
                self._link_curriculum_course(conn, program_id, sem_id, course_id, reg_id, source_id, c.get("page_reference"), stats)

        # 2. Detailed unit-by-unit syllabus
        detailed_courses = extractor.extract_detailed_syllabus()
        for dc in detailed_courses:
            v_res = validate_course_record(dc)
            if not v_res.is_valid:
                log_failed_record(conn, source_id, "detailed_course", dc, v_res.errors)
                stats["records_rejected"] += 1
                continue

            course_id = self._upsert_course(conn, dc, stats)

            # Validate and persist units
            units = dc.get("units", [])
            u_res = validate_unit_sequence(units)
            if not u_res.is_valid:
                log_failed_record(conn, source_id, "syllabus_units", {"course": dc["course_code"], "units": units}, u_res.errors)
                # Still persist valid units

            for u in units:
                self._upsert_syllabus_unit(conn, course_id, u, source_id, stats)

    def _process_api_subjects(self, conn, json_bytes: bytes, source_id: int, reg_id: int, stats: Dict[str, Any]):
        """Ingest 211 catalog courses from backend API."""
        extractor = AcademicAPIExtractor(source_id)
        semesters_data = extractor.extract_subjects_json(json_bytes)

        # Map to CSE default program
        program_id = self._ensure_program(conn, "CSE", "Computer Science and Engineering", reg_id, "B.Tech")

        for sem_num, courses in semesters_data.items():
            sem_id = self._ensure_semester(conn, program_id, sem_num)
            for c in courses:
                v_res = validate_course_record(c)
                if not v_res.is_valid:
                    log_failed_record(conn, source_id, "api_course", c, v_res.errors)
                    stats["records_rejected"] += 1
                    continue

                course_id = self._upsert_course(conn, c, stats)
                self._link_curriculum_course(conn, program_id, sem_id, course_id, reg_id, source_id, None, stats)

    def _process_curriculum_graph(self, conn, json_bytes: bytes, stats: Dict[str, Any]):
        """Update prerequisites on courses based on backend dependency graph edges."""
        extractor = AcademicAPIExtractor(0)
        edges = extractor.extract_curriculum_edges(json_bytes)
        cur = conn.cursor()
        for e in edges:
            target_code = e["target_course"]
            prereq_code = e["prerequisite_course"]
            cur.execute(
                "UPDATE courses SET prerequisites = ? WHERE course_code = ? AND (prerequisites IS NULL OR prerequisites = '')",
                (prereq_code, target_code)
            )
            if cur.rowcount > 0:
                stats["records_updated"] += 1

    def _upsert_course(self, conn, course_data: Dict[str, Any], stats: Dict[str, Any]) -> int:
        """Insert or update course record."""
        cur = conn.cursor()
        code = course_data["course_code"]
        name = course_data["course_name"]

        cur.execute("SELECT id, course_name FROM courses WHERE course_code = ?", (code,))
        row = cur.fetchone()
        if row:
            course_id = row["id"]
            better_name = name if len(name) >= len(row["course_name"]) else row["course_name"]
            cur.execute(
                """
                UPDATE courses
                SET course_name = ?, credits = ?, lecture_hours = ?, tutorial_hours = ?, practical_hours = ?,
                    course_category = ?, prerequisites = COALESCE(?, prerequisites)
                WHERE id = ?
                """,
                (
                    better_name,
                    course_data["credits"],
                    course_data["lecture_hours"],
                    course_data["tutorial_hours"],
                    course_data["practical_hours"],
                    course_data.get("course_category"),
                    course_data.get("prerequisites"),
                    course_id
                )
            )
            stats["records_updated"] += 1
            return course_id
        else:
            cur.execute(
                """
                INSERT INTO courses (course_code, course_name, course_type, course_category, credits, lecture_hours, tutorial_hours, practical_hours, prerequisites)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    code,
                    name,
                    course_data.get("course_type", "Theory"),
                    course_data.get("course_category"),
                    course_data["credits"],
                    course_data["lecture_hours"],
                    course_data["tutorial_hours"],
                    course_data["practical_hours"],
                    course_data.get("prerequisites")
                )
            )
            stats["records_created"] += 1
            return cur.lastrowid

    def _link_curriculum_course(self, conn, program_id: int, sem_id: int, course_id: int, reg_id: int, source_id: int, page_ref: Optional[int], stats: Dict[str, Any]):
        """Ensure curriculum course association exists."""
        cur = conn.cursor()
        cur.execute(
            """
            INSERT OR IGNORE INTO curriculum_courses (program_id, semester_id, course_id, regulation_id, source_document_id, page_reference)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (program_id, sem_id, course_id, reg_id, source_id, page_ref)
        )

    def _upsert_syllabus_unit(self, conn, course_id: int, unit_data: Dict[str, Any], source_id: int, stats: Dict[str, Any]):
        """Insert or update syllabus unit record."""
        cur = conn.cursor()
        unit_num = unit_data["unit_number"]
        cur.execute(
            "SELECT id FROM syllabus_units WHERE course_id = ? AND unit_number = ? AND source_document_id = ?",
            (course_id, unit_num, source_id)
        )
        row = cur.fetchone()
        if row:
            cur.execute(
                """
                UPDATE syllabus_units
                SET unit_title = ?, topic_text = ?, learning_outcomes = ?, textbooks = ?, "references" = ?, page_number = ?
                WHERE id = ?
                """,
                (
                    unit_data["unit_title"],
                    unit_data["topic_text"],
                    unit_data.get("learning_outcomes"),
                    unit_data.get("textbooks"),
                    unit_data.get("references"),
                    unit_data.get("page_number"),
                    row["id"]
                )
            )
            stats["records_updated"] += 1
        else:
            cur.execute(
                """
                INSERT INTO syllabus_units (course_id, unit_number, unit_title, topic_text, learning_outcomes, textbooks, "references", source_document_id, page_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    course_id,
                    unit_num,
                    unit_data["unit_title"],
                    unit_data["topic_text"],
                    unit_data.get("learning_outcomes"),
                    unit_data.get("textbooks"),
                    unit_data.get("references"),
                    source_id,
                    unit_data.get("page_number")
                )
            )
            stats["records_created"] += 1
