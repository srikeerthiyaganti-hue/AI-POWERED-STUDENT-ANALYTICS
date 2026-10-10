"""
CODEBUFFET — Student Portal Analytics & Simulation Routes
Provides personalized student cockpit telemetry, dynamic 'What-If' simulations,
and interactive mentoring task management.
Secured with authentication and IDOR prevention.
"""

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, status
from backend.database import get_db_connection
from backend.auth import get_current_user
from ml_service import calculate_student_success_score

router = APIRouter(prefix="/api/student", tags=["Student Analytics"])


class SimulationRequest(BaseModel):
    attendance: float
    coding_skills: float
    lms_velocity: float
    cgpa: Optional[float] = 8.42
    backlogs: Optional[int] = 0


@router.get("/dashboard")
async def get_student_dashboard(
    roll_no: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns full personal intelligence cockpit for the student.
    Enforces authorization: Students may only access their personal telemetry (anti-IDOR).
    Faculty and administrative staff may inspect any student's record.
    """
    user_role = current_user.get("role")
    user_roll = current_user.get("roll_no")

    # Anti-IDOR: Students can only view their own telemetry record
    if user_role == "student":
        target_roll = user_roll or "STU-2024-042"
        if roll_no and roll_no.strip().upper() != target_roll.upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: Students may only view their personal cockpit telemetry."
            )
    else:
        # Institutional staff (admin, mentor, tpo) may inspect requested student
        target_roll = roll_no or "STU-2024-042"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE LOWER(roll_no) = LOWER(?) LIMIT 1", (target_roll,))
    student_row = cursor.fetchone()

    if not student_row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student telemetry record with roll number '{target_roll}' not found."
        )

    # Fetch assigned mentoring interventions
    cursor.execute("""
    SELECT id, title, category, assigned_mentor, status, due_date
    FROM interventions
    WHERE LOWER(student_roll_no) = LOWER(?)
    ORDER BY id ASC
    """, (student_row["roll_no"],))
    interventions = [dict(r) for r in cursor.fetchall()]

    conn.close()

    # Dynamic explainable placement readiness calculation
    plac_score = (
        (min(10.0, student_row["dsa_score"]) / 10.0 * 30.0) +
        (min(10.0, student_row["coding_skills"]) / 10.0 * 25.0) +
        (student_row["aptitude_score"] / 100.0 * 25.0) +
        (student_row["cgpa"] / 10.0 * 20.0)
    )
    placement_readiness_pct = round(max(5.0, min(99.0, plac_score)), 1)

    # Dynamic engagement metric combining attendance and LMS assignment velocity
    engagement_pct = round(float((student_row["overall_attendance_pct"] * 0.45) + (student_row["lms_assignment_completion_pct"] * 0.55)), 1)

    # Format student telemetry
    return {
        "roll_no": student_row["roll_no"],
        "name": student_row["full_name"],
        "department": student_row["department"],
        "year": student_row["year"],
        "semester": student_row["semester"],
        "cgpa": student_row["cgpa"],
        "backlogs": student_row["backlogs"],
        "attendance": student_row["overall_attendance_pct"],
        "coding_skills": student_row["coding_skills"],
        "dsa_score": student_row["dsa_score"],
        "aptitude_score": student_row["aptitude_score"],
        "success_score": student_row["success_score"],
        "placement_readiness_pct": placement_readiness_pct,
        "score_band": "EXCELLENT" if student_row["success_score"] >= 80 else ("GOOD" if student_row["success_score"] >= 65 else "NEEDS_SUPPORT"),
        "readiness_tier": "Tier-1 Ready" if student_row["cgpa"] >= 8.0 and student_row["dsa_score"] >= 8.0 else "Tier-2 In Training",
        "academic_risk": student_row["academic_risk_band"],
        "academic_risk_prob": student_row["academic_risk_prob"],
        "placement_risk": student_row["placement_risk_band"],
        "placement_risk_prob": student_row["placement_risk_prob"],
        "components": {
            "academic": round(float((student_row["cgpa"] / 10.0) * 100), 1),
            "placement": placement_readiness_pct,
            "attendance": student_row["overall_attendance_pct"],
            "lms": student_row["lms_assignment_completion_pct"],
            "skills": round(float(student_row["coding_skills"] * 10), 1),
            "engagement": engagement_pct
        },
        "mentoring_tasks": interventions
    }


@router.post("/simulate")
async def simulate_score(
    req: SimulationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Simulates a Student Success Score in real time based on What-If parameters.
    Accessible to authenticated users.
    """
    sim_data = {
        "cgpa": req.cgpa,
        "backlogs": req.backlogs,
        "overall_attendance_pct": max(0.0, min(100.0, req.attendance)),
        "aptitude_score": 75.0,
        "coding_skills": max(0.0, min(10.0, req.coding_skills)),
        "dsa_score": max(0.0, min(10.0, req.coding_skills)),
        "lms_assignment_completion_pct": max(0.0, min(100.0, req.lms_velocity)),
        "lms_logins_per_week": 8,
        "communication_skills": 7.5,
        "system_design": 7.0,
        "hackathons": 1,
        "certifications": 1
    }

    result = calculate_student_success_score(sim_data)
    return {
        "projected_score": result["student_success_score"],
        "score_band": result["score_band"],
        "components": result["components"]
    }


@router.post("/tasks/{task_id}/toggle")
async def toggle_task_status(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Toggles task status between OPEN and COMPLETED.
    Enforces that caller is either the assigned student or an institutional staff member.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM interventions WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    user_role = current_user.get("role")
    user_roll = current_user.get("roll_no")

    # If student, verify task belongs to them
    if user_role == "student" and row["student_roll_no"].upper() != (user_roll or "").upper():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Students may only update their own assigned tasks."
        )

    new_status = "COMPLETED" if row["status"] == "OPEN" else "OPEN"
    cursor.execute("UPDATE interventions SET status = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    conn.close()

    return {"task_id": task_id, "new_status": new_status}

