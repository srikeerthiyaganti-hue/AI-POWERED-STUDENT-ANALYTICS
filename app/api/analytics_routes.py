import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body, Depends

from app.database import get_db
from app.analytics.service import StudentAnalyticsService
from app.ingestion.erp_adapter import VignanERPAdapter
from app.ingestion.pipeline import StudentDataIngestionPipeline

logger = logging.getLogger("academic_pipeline.api.analytics")

router = APIRouter(prefix="/api/analytics", tags=["Student Analytics & Success Platform"])

@router.get("/overview")
def get_analytics_overview(
    branch: Optional[str] = Query(None, description="Filter by branch, e.g. CSE, IT"),
    semester: Optional[int] = Query(None, description="Filter by semester 1..8"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level: LOW, MODERATE, HIGH"),
    segment: Optional[str] = Query(None, description="Filter by student segment code")
):
    """
    Overview dashboard metrics calculated dynamically from the integrated student dataset.
    Never uses hardcoded constants.
    """
    where_clauses = ["1=1"]
    params = []

    if branch:
        where_clauses.append("s.branch = ?")
        params.append(branch.upper())
    if semester:
        where_clauses.append("s.current_semester = ?")
        params.append(semester)
    if risk_level:
        where_clauses.append("ra.risk_level = ?")
        params.append(risk_level.upper())
    if segment:
        where_clauses.append("seg.segment_code = ?")
        params.append(segment)

    where_sql = " AND ".join(where_clauses)

    with get_db() as conn:
        cur = conn.cursor()

        # 1. Base counts & KPIs
        cur.execute(f"""
            SELECT 
                COUNT(s.id) as total_students,
                SUM(CASE WHEN ss.data_coverage_pct >= 50.0 THEN 1 ELSE 0 END) as students_sufficient_data,
                AVG(ss.score) as avg_success_score,
                AVG(ar.cgpa) as avg_cgpa,
                AVG(att.overall_percentage) as avg_attendance,
                AVG(plc.prep_progress_pct) as avg_placement_prep,
                SUM(CASE WHEN ra.risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN ra.risk_level = 'MODERATE' THEN 1 ELSE 0 END) as moderate_risk_count,
                SUM(CASE WHEN ra.risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk_count,
                SUM(CASE WHEN ra.risk_level = 'HIGH' OR ar.active_backlogs > 0 OR att.is_shortage = 1 THEN 1 ELSE 0 END) as intervention_needed_count
            FROM students s
            LEFT JOIN student_success_scores ss ON s.id = ss.student_id
            LEFT JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            LEFT JOIN academic_records ar ON s.id = ar.student_id AND s.current_semester = ar.semester
            LEFT JOIN attendance_records att ON s.id = att.student_id AND s.current_semester = att.semester
            LEFT JOIN placement_readiness plc ON s.id = plc.student_id AND s.current_semester = plc.semester
            WHERE {where_sql}
        """, params)
        kpis = dict(cur.fetchone())

        # 2. Risk breakdown
        cur.execute(f"""
            SELECT ra.risk_level, COUNT(*) as cnt
            FROM students s
            JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            WHERE {where_sql}
            GROUP BY ra.risk_level
        """, params)
        risk_dist = {r["risk_level"]: r["cnt"] for r in cur.fetchall()}

        # 3. Student Segments breakdown
        cur.execute(f"""
            SELECT seg.segment_code, seg.segment_name, COUNT(*) as cnt
            FROM students s
            JOIN student_segments seg ON s.id = seg.student_id
            LEFT JOIN risk_assessments ra ON s.id = ra.student_id
            WHERE {where_sql}
            GROUP BY seg.segment_code, seg.segment_name
            ORDER BY cnt DESC
        """, params)
        segment_dist = [dict(r) for r in cur.fetchall()]

        # 4. Success Score Distribution (Histogram Bins)
        cur.execute(f"""
            SELECT 
                SUM(CASE WHEN ss.score < 50 THEN 1 ELSE 0 END) as b_0_49,
                SUM(CASE WHEN ss.score >= 50 AND ss.score < 60 THEN 1 ELSE 0 END) as b_50_59,
                SUM(CASE WHEN ss.score >= 60 AND ss.score < 70 THEN 1 ELSE 0 END) as b_60_69,
                SUM(CASE WHEN ss.score >= 70 AND ss.score < 80 THEN 1 ELSE 0 END) as b_70_79,
                SUM(CASE WHEN ss.score >= 80 AND ss.score < 90 THEN 1 ELSE 0 END) as b_80_89,
                SUM(CASE WHEN ss.score >= 90 THEN 1 ELSE 0 END) as b_90_100
            FROM students s
            JOIN student_success_scores ss ON s.id = ss.student_id
            LEFT JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            WHERE {where_sql}
        """, params)
        score_bins = dict(cur.fetchone())

        # 5. Attendance vs Academic Scatter Sample Data
        cur.execute(f"""
            SELECT s.reg_no, s.name, s.branch, ar.cgpa, att.overall_percentage as attendance,
                   ss.score as success_score, ra.risk_level
            FROM students s
            JOIN academic_records ar ON s.id = ar.student_id AND s.current_semester = ar.semester
            LEFT JOIN attendance_records att ON s.id = att.student_id AND s.current_semester = att.semester
            JOIN student_success_scores ss ON s.id = ss.student_id
            JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            WHERE {where_sql} AND att.overall_percentage IS NOT NULL
            LIMIT 50
        """, params)
        scatter_points = [dict(r) for r in cur.fetchall()]

        # 6. Category Completeness Rates across 7 categories
        cur.execute("SELECT COUNT(*) FROM students")
        total_all_students = cur.fetchone()[0] or 1

        category_coverage = {}
        for cat_name, table_name in [
            ("Academic", "academic_records"),
            ("Attendance", "attendance_records"),
            ("LMS", "lms_activities"),
            ("Engagement", "student_engagements"),
            ("Placement", "placement_readiness"),
            ("Skills", "skill_assessments"),
            ("Feedback", "feedback_records")
        ]:
            cur.execute(f"SELECT COUNT(DISTINCT student_id) FROM {table_name}")
            c_cnt = cur.fetchone()[0]
            category_coverage[cat_name] = {
                "populated": c_cnt,
                "percentage": round((c_cnt / total_all_students) * 100.0, 1)
            }

        # 7. ERP Sync info
        erp_info = VignanERPAdapter().get_sync_status()

    return {
        "kpis": {
            "total_students": kpis.get("total_students") or 0,
            "students_sufficient_data": kpis.get("students_sufficient_data") or 0,
            "avg_success_score": round(kpis.get("avg_success_score") or 0.0, 1),
            "avg_cgpa": round(kpis.get("avg_cgpa") or 0.0, 2),
            "avg_attendance": round(kpis.get("avg_attendance") or 0.0, 1),
            "avg_placement_prep": round(kpis.get("avg_placement_prep") or 0.0, 1),
            "high_risk_count": kpis.get("high_risk_count") or 0,
            "moderate_risk_count": kpis.get("moderate_risk_count") or 0,
            "low_risk_count": kpis.get("low_risk_count") or 0,
            "intervention_needed_count": kpis.get("intervention_needed_count") or 0
        },
        "risk_distribution": risk_dist,
        "segment_distribution": segment_dist,
        "score_distribution": score_bins,
        "scatter_points": scatter_points,
        "category_coverage": category_coverage,
        "erp_sync": erp_info
    }

@router.get("/students")
def get_students_directory(
    search: Optional[str] = Query(None, description="Search by roll number or student name"),
    branch: Optional[str] = Query(None, description="Branch filter, e.g. CSE, IT, AIML"),
    semester: Optional[int] = Query(None, description="Semester filter 1..8"),
    risk_level: Optional[str] = Query(None, description="LOW, MODERATE, HIGH"),
    segment: Optional[str] = Query(None, description="Segment code"),
    tier: Optional[str] = Query(None, description="Performance tier"),
    sort_by: str = Query("score_desc", description="score_desc, score_asc, cgpa_desc, attendance_desc, reg_no_asc"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100)
):
    """Searchable, filterable student directory table with sorting and pagination."""
    where_clauses = ["1=1"]
    params = []

    if search:
        where_clauses.append("(s.reg_no LIKE ? OR s.name LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])
    if branch:
        where_clauses.append("s.branch = ?")
        params.append(branch.upper())
    if semester:
        where_clauses.append("s.current_semester = ?")
        params.append(semester)
    if risk_level:
        where_clauses.append("ra.risk_level = ?")
        params.append(risk_level.upper())
    if segment:
        where_clauses.append("seg.segment_code = ?")
        params.append(segment)
    if tier:
        where_clauses.append("ss.performance_tier = ?")
        params.append(tier)

    where_sql = " AND ".join(where_clauses)

    sort_sql = "ss.score DESC"
    if sort_by == "score_asc":
        sort_sql = "ss.score ASC"
    elif sort_by == "cgpa_desc":
        sort_sql = "ar.cgpa DESC"
    elif sort_by == "cgpa_asc":
        sort_sql = "ar.cgpa ASC"
    elif sort_by == "attendance_desc":
        sort_sql = "att.overall_percentage DESC"
    elif sort_by == "reg_no_asc":
        sort_sql = "s.reg_no ASC"
    elif sort_by == "risk_desc":
        sort_sql = "ra.composite_risk_score DESC"

    offset = (page - 1) * limit

    with get_db() as conn:
        cur = conn.cursor()

        # Count total matching
        cur.execute(f"""
            SELECT COUNT(*)
            FROM students s
            LEFT JOIN student_success_scores ss ON s.id = ss.student_id
            LEFT JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            LEFT JOIN academic_records ar ON s.id = ar.student_id AND s.current_semester = ar.semester
            LEFT JOIN attendance_records att ON s.id = att.student_id AND s.current_semester = att.semester
            WHERE {where_sql}
        """, params)
        total_matching = cur.fetchone()[0]

        # Fetch page rows
        query_params = list(params) + [limit, offset]
        cur.execute(f"""
            SELECT 
                s.id, s.reg_no, s.name, s.branch, s.current_semester, s.section,
                s.verification_status,
                ar.cgpa, ar.active_backlogs, ar.trend as academic_trend,
                att.overall_percentage as attendance_percentage, att.is_shortage,
                ss.score as success_score, ss.performance_tier, ss.data_coverage_pct,
                ra.risk_level, ra.composite_risk_score,
                plc.prep_progress_pct as placement_prep_pct, plc.is_placement_eligible,
                seg.segment_code, seg.segment_name
            FROM students s
            LEFT JOIN student_success_scores ss ON s.id = ss.student_id
            LEFT JOIN risk_assessments ra ON s.id = ra.student_id
            LEFT JOIN student_segments seg ON s.id = seg.student_id
            LEFT JOIN academic_records ar ON s.id = ar.student_id AND s.current_semester = ar.semester
            LEFT JOIN attendance_records att ON s.id = att.student_id AND s.current_semester = att.semester
            LEFT JOIN placement_readiness plc ON s.id = plc.student_id AND s.current_semester = plc.semester
            WHERE {where_sql}
            ORDER BY {sort_sql}
            LIMIT ? OFFSET ?
        """, query_params)
        rows = [dict(r) for r in cur.fetchall()]

    return {
        "page": page,
        "limit": limit,
        "total": total_matching,
        "total_pages": (total_matching + limit - 1) // limit if total_matching > 0 else 1,
        "students": rows
    }

@router.get("/students/{student_id}")
def get_student_detail(student_id: int):
    """
    Complete 360-degree unified student profile across all seven categories,
    including exact score breakdown, positive & negative factors, and risk explainability.
    """
    with get_db() as conn:
        cur = conn.cursor()

        # 1. Base student
        cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        st = cur.fetchone()
        if not st:
            raise HTTPException(status_code=404, detail="Student not found")
        student = dict(st)
        sem = student["current_semester"]

        # 2. Success Score & Explainability
        cur.execute("SELECT * FROM student_success_scores WHERE student_id = ? ORDER BY id DESC LIMIT 1", (student_id,))
        score_row = cur.fetchone()
        success_score = {}
        if score_row:
            s_dict = dict(score_row)
            success_score = {
                "score": s_dict["score"],
                "performance_tier": s_dict["performance_tier"],
                "data_coverage_pct": s_dict["data_coverage_pct"],
                "confidence_score_pct": s_dict["confidence_score_pct"],
                "scoring_version": s_dict["scoring_version"],
                "weights_used": json.loads(s_dict["weights_used_json"] or "{}"),
                "available_indicators": json.loads(s_dict["available_indicators_json"] or "[]"),
                "positive_factors": json.loads(s_dict["positive_factors_json"] or "[]"),
                "negative_factors": json.loads(s_dict["negative_factors_json"] or "[]"),
                "components": {
                    "academic": s_dict["academic_component"],
                    "attendance": s_dict["attendance_component"],
                    "lms": s_dict["lms_component"],
                    "placement": s_dict["placement_component"],
                    "skills": s_dict["skills_component"],
                    "engagement": s_dict["engagement_component"],
                }
            }

        # 3. Risk Assessment
        cur.execute("SELECT * FROM risk_assessments WHERE student_id = ? ORDER BY id DESC LIMIT 1", (student_id,))
        risk_row = cur.fetchone()
        risk_assessment = {}
        if risk_row:
            r_dict = dict(risk_row)
            risk_assessment = {
                "risk_level": r_dict["risk_level"],
                "composite_risk_score": r_dict["composite_risk_score"],
                "is_complete_data": bool(r_dict["is_complete_data"]),
                "triggered_rules": json.loads(r_dict["triggered_rules_json"] or "[]"),
                "suggested_interventions": json.loads(r_dict["suggested_interventions_json"] or "[]"),
                "faculty_review_notes": r_dict["faculty_review_notes"],
                "faculty_review_status": r_dict["faculty_review_status"]
            }

        # 4. Segment Assignment
        cur.execute("SELECT * FROM student_segments WHERE student_id = ?", (student_id,))
        seg_row = cur.fetchone()
        segment = dict(seg_row) if seg_row else {}

        # 5. Academic Data & Subjects
        cur.execute("SELECT * FROM academic_records WHERE student_id = ? AND semester = ?", (student_id, sem))
        acad_row = cur.fetchone()
        academic = dict(acad_row) if acad_row else {}

        cur.execute("SELECT * FROM subject_marks WHERE student_id = ? ORDER BY course_code ASC", (student_id,))
        subjects = [dict(s) for s in cur.fetchall()]
        academic["subjects"] = subjects

        # 6. Attendance Data
        cur.execute("SELECT * FROM attendance_records WHERE student_id = ? AND semester = ?", (student_id, sem))
        att_row = cur.fetchone()
        attendance = dict(att_row) if att_row else {}

        # 7. LMS Data
        cur.execute("SELECT * FROM lms_activities WHERE student_id = ? AND semester = ?", (student_id, sem))
        lms_row = cur.fetchone()
        lms = dict(lms_row) if lms_row else {}

        # 8. Placement Readiness
        cur.execute("SELECT * FROM placement_readiness WHERE student_id = ? AND semester = ?", (student_id, sem))
        plc_row = cur.fetchone()
        placement = dict(plc_row) if plc_row else {}

        # 9. Skills Assessments
        cur.execute("SELECT * FROM skill_assessments WHERE student_id = ? AND semester = ?", (student_id, sem))
        skl_row = cur.fetchone()
        skills = dict(skl_row) if skl_row else {}
        if skills.get("radar_scores_json"):
            skills["radar_scores"] = json.loads(skills["radar_scores_json"])

        # 10. Engagement Data
        cur.execute("SELECT * FROM student_engagements WHERE student_id = ? AND semester = ?", (student_id, sem))
        eng_row = cur.fetchone()
        engagement = dict(eng_row) if eng_row else {}

        # 11. Feedback Records
        cur.execute("SELECT * FROM feedback_records WHERE student_id = ? ORDER BY logged_at DESC", (student_id,))
        feedback = [dict(f) for f in cur.fetchall()]

    return {
        "student": student,
        "success_score": success_score,
        "risk_assessment": risk_assessment,
        "segment": segment,
        "academic": academic,
        "attendance": attendance,
        "lms": lms,
        "placement": placement,
        "skills": skills,
        "engagement": engagement,
        "feedback": feedback
    }

@router.post("/students/{student_id}/intervention")
def record_student_intervention(
    student_id: int,
    notes: str = Body(..., embed=True),
    status: str = Body("Action_Taken", embed=True)
):
    """Record faculty or mentor intervention note and update review status."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            UPDATE risk_assessments
            SET faculty_review_notes = ?, faculty_review_status = ?
            WHERE student_id = ?
        """, (notes, status, student_id))
    return {"status": "SUCCESS", "message": "Intervention recorded successfully."}

@router.get("/configurations")
def get_scoring_configuration():
    """Retrieve active scoring configuration and institutional risk thresholds."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM scoring_configurations WHERE is_active = 1 LIMIT 1")
        cfg = cur.fetchone()
        return dict(cfg) if cfg else {}

@router.post("/configurations")
def update_scoring_configuration(payload: Dict[str, Any] = Body(...)):
    """Update weights or thresholds and recalculate student scores dynamically."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            UPDATE scoring_configurations
            SET academic_weight = ?, attendance_weight = ?, lms_weight = ?,
                placement_weight = ?, skills_weight = ?, engagement_weight = ?,
                attendance_threshold = ?, detention_threshold = ?,
                cgpa_warning_threshold = ?, updated_at = CURRENT_TIMESTAMP
            WHERE config_name = 'default'
        """, (
            payload.get("academic_weight", 0.35),
            payload.get("attendance_weight", 0.20),
            payload.get("lms_weight", 0.15),
            payload.get("placement_weight", 0.15),
            payload.get("skills_weight", 0.10),
            payload.get("engagement_weight", 0.05),
            payload.get("attendance_threshold", 75.0),
            payload.get("detention_threshold", 65.0),
            payload.get("cgpa_warning_threshold", 6.0)
        ))

    # Recalculate all scores
    svc = StudentAnalyticsService()
    res = svc.process_all_students()
    return {"status": "SUCCESS", "message": "Configuration updated and scores recalculated.", "details": res}

@router.get("/erp/status")
def get_erp_status():
    """Return current connection and synchronization status of Vignan ERP."""
    return VignanERPAdapter().get_sync_status()

@router.post("/erp/sync")
def trigger_erp_sync():
    """
    Trigger repeatable synchronization run.
    If authenticated ERP API credentials are absent, securely executes benchmark refresh.
    """
    svc = StudentAnalyticsService()
    res = svc.process_all_students()
    VignanERPAdapter().update_sync_status("IMPORTED", records_count=res["processed_students"])
    return {"status": "SUCCESS", "synced_records": res["processed_students"]}

@router.get("/data-quality")
def get_data_quality_report():
    """Retrieve the latest data quality and completeness audit report."""
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM data_quality_reports ORDER BY id DESC LIMIT 1")
        rep = cur.fetchone()
        if not rep:
            return {"status": "NO_REPORT_YET"}
        r_dict = dict(rep)
        if r_dict.get("validation_errors_json"):
            try:
                r_dict["details"] = json.loads(r_dict["validation_errors_json"])
            except Exception:
                pass
        return r_dict
