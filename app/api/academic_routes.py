import sqlite3
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Header, Depends
from app.database import get_db
from app.models import (
    ProgramOut,
    RegulationOut,
    SemesterOut,
    CourseOut,
    SyllabusUnitOut,
    SourceDocumentOut,
    CrawlRunOut,
    AIContextResponse
)
from app.ai_retrieval import retrieve_ai_context
from app.security import verify_admin_token

router = APIRouter(prefix="/api/academic", tags=["Academic Knowledge Base"])

@router.get("/programs")
def get_programs(
    regulation: Optional[str] = Query(None, description="Regulation code, e.g. R22"),
    degree: Optional[str] = Query(None, description="Degree, e.g. B.Tech, BCA, BBA"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Retrieve academic programs filtered by regulation and degree with pagination."""
    offset = (page - 1) * limit
    sql = """
        SELECT p.id, p.program_name, p.branch_code, p.degree, p.regulation_id, r.regulation_code
        FROM programs p
        JOIN regulations r ON p.regulation_id = r.id
        WHERE 1=1
    """
    params = []
    if regulation:
        sql += " AND r.regulation_code = ?"
        params.append(regulation.upper())
    if degree:
        sql += " AND p.degree = ?"
        params.append(degree)

    sql += " ORDER BY p.id ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows]

@router.get("/regulations")
def get_regulations():
    """List all university academic regulations with traceable source documents."""
    sql = """
        SELECT r.id, r.regulation_code, r.regulation_name, r.effective_academic_year, r.degree,
               r.source_document_id, sd.source_url, sd.title as source_title
        FROM regulations r
        JOIN source_documents sd ON r.source_document_id = sd.id
        ORDER BY r.id ASC
    """
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql)
        return [dict(r) for r in cur.fetchall()]

@router.get("/semesters")
def get_semesters(program_id: Optional[int] = Query(None, description="Filter by program ID")):
    """List semesters for academic programs."""
    sql = "SELECT id, program_id, semester_number, academic_year FROM semesters WHERE 1=1"
    params = []
    if program_id:
        sql += " AND program_id = ?"
        params.append(program_id)
    sql += " ORDER BY semester_number ASC"

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]

@router.get("/courses")
def get_courses(
    regulation: Optional[str] = Query(None, description="e.g. R22"),
    branch: Optional[str] = Query(None, description="e.g. CSE"),
    semester: Optional[int] = Query(None, description="1..8"),
    search: Optional[str] = Query(None, description="Search term in code or name"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """Retrieve validated academic courses with hours, credits, prerequisites, and source citations."""
    offset = (page - 1) * limit
    sql = """
        SELECT DISTINCT c.id, c.course_code, c.course_name, c.course_type, c.course_category,
               c.credits, c.lecture_hours, c.tutorial_hours, c.practical_hours, c.prerequisites,
               cc.page_reference, sd.source_url, sd.title as document_title
        FROM courses c
        LEFT JOIN curriculum_courses cc ON c.id = cc.course_id
        LEFT JOIN programs p ON cc.program_id = p.id
        LEFT JOIN semesters s ON cc.semester_id = s.id
        LEFT JOIN regulations r ON cc.regulation_id = r.id
        LEFT JOIN source_documents sd ON cc.source_document_id = sd.id
        WHERE 1=1
    """
    params = []
    if regulation:
        sql += " AND r.regulation_code = ?"
        params.append(regulation.upper())
    if branch:
        sql += " AND p.branch_code = ?"
        params.append(branch.upper())
    if semester:
        sql += " AND s.semester_number = ?"
        params.append(semester)
    if search:
        sql += " AND (c.course_code LIKE ? OR c.course_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    sql += " ORDER BY c.course_code ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]

@router.get("/courses/{course_id}/syllabus")
def get_course_syllabus(course_id: int):
    """Retrieve unit-by-unit syllabus, learning outcomes, textbooks, and page citations for a course."""
    with get_db() as conn:
        cur = conn.cursor()
        # Fetch course
        cur.execute(
            """
            SELECT c.*, sd.source_url, sd.title as document_title, cc.page_reference
            FROM courses c
            LEFT JOIN curriculum_courses cc ON c.id = cc.course_id
            LEFT JOIN source_documents sd ON cc.source_document_id = sd.id
            WHERE c.id = ?
            """,
            (course_id,)
        )
        course_row = cur.fetchone()
        if not course_row:
            raise HTTPException(status_code=404, detail=f"Course ID {course_id} not found")

        # Fetch units
        cur.execute(
            """
            SELECT su.*, sd.source_url, sd.title as source_title
            FROM syllabus_units su
            JOIN source_documents sd ON su.source_document_id = sd.id
            WHERE su.course_id = ?
            ORDER BY su.unit_number ASC
            """,
            (course_id,)
        )
        units = [dict(u) for u in cur.fetchall()]

        res = dict(course_row)
        res["syllabus_units"] = units
        return res

@router.get("/search")
def search_academic_data(
    q: str = Query(..., description="Query keyword or course code/name"),
    limit: int = Query(20, ge=1, le=100)
):
    """Full-text search across courses, syllabus units, and learning outcomes with source references."""
    sql = """
        SELECT DISTINCT c.id as course_id, c.course_code, c.course_name, c.credits,
               su.unit_number, su.unit_title, su.topic_text, su.page_number,
               sd.source_url, sd.title as document_title
        FROM courses c
        LEFT JOIN syllabus_units su ON c.id = su.course_id
        LEFT JOIN source_documents sd ON su.source_document_id = sd.id
        WHERE c.course_code LIKE ?
           OR c.course_name LIKE ?
           OR su.unit_title LIKE ?
           OR su.topic_text LIKE ?
        ORDER BY c.course_code ASC
        LIMIT ?
    """
    q_pattern = f"%{q.strip()}%"
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, (q_pattern, q_pattern, q_pattern, q_pattern, limit))
        return [dict(r) for r in cur.fetchall()]

@router.get("/sources/{source_id}")
def get_source_document(source_id: int):
    """Retrieve verified source document metadata, content hash, and audit trail."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM source_documents WHERE id = ?", (source_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Source document {source_id} not found")
        return dict(row)

@router.post("/ai/context", response_model=AIContextResponse)
def get_ai_context(
    query: str = Query(..., description="Student query or learning topic"),
    branch: Optional[str] = Query("CSE", description="Branch code"),
    semester: Optional[int] = Query(None, description="Semester number"),
    regulation: Optional[str] = Query("R22", description="Regulation code"),
    limit: int = Query(5, ge=1, le=10)
):
    """
    Retrieve grounded academic context with official citations for AI Student Success Platform.
    Adheres strictly to official sources.
    """
    return retrieve_ai_context(query, branch, semester, regulation, limit)

@router.post("/pipeline/run")
def trigger_pipeline(
    dry_run: bool = Query(False, description="Simulate without database writes"),
    x_admin_token: Optional[str] = Header(None, description="Administrative authorization key")
):
    """Trigger the academic extraction pipeline (restricted to authorized administrators)."""
    if not verify_admin_token(x_admin_token):
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin token")

    from app.pipeline import AcademicExtractionPipeline
    pipeline = AcademicExtractionPipeline(dry_run=dry_run)
    stats = pipeline.run()
    return stats

@router.get("/pipeline/runs")
def list_pipeline_runs():
    """Retrieve audit log of all crawl and extraction executions."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM crawl_runs ORDER BY id DESC LIMIT 50")
        return [dict(r) for r in cur.fetchall()]
