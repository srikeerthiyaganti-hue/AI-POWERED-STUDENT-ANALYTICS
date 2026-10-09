"""
CODEBUFFET — Student Portal Analytics & Simulation Routes
Provides personalized student cockpit telemetry, dynamic 'What-If' simulations,
and interactive mentoring task management.
"""

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
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
async def get_student_dashboard(roll_no: Optional[str] = "STU-2024-042"):
    """
    Returns full personal intelligence cockpit for the student.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE roll_no = ? LIMIT 1", (roll_no,))
    student_row = cursor.fetchone()

    if not student_row:
        # Fallback to first student if specific roll number is not found
        cursor.execute("SELECT * FROM students LIMIT 1")
        student_row = cursor.fetchone()

    # Fetch assigned mentoring interventions
    cursor.execute("""
    SELECT id, title, category, assigned_mentor, status, due_date
    FROM interventions
    WHERE student_roll_no = ?
    ORDER BY id ASC
    """, (student_row["roll_no"],))
    interventions = [dict(r) for r in cursor.fetchall()]

    conn.close()

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
        "placement_readiness_pct": 78.6,
        "score_band": "EXCELLENT",
        "readiness_tier": "Tier-1 Ready",
        "academic_risk": student_row["academic_risk_band"],
        "academic_risk_prob": student_row["academic_risk_prob"],
        "placement_risk": student_row["placement_risk_band"],
        "placement_risk_prob": student_row["placement_risk_prob"],
        "components": {
            "academic": 85.0,
            "placement": 78.6,
            "attendance": student_row["overall_attendance_pct"],
            "lms": student_row["lms_assignment_completion_pct"],
            "skills": 82.0,
            "engagement": 88.0
        },
        "mentoring_tasks": interventions
    }


@router.post("/simulate")
async def simulate_score(req: SimulationRequest):
    """
    Simulates a Student Success Score in real time based on What-If parameters.
    """
    # Build student dictionary matching ml_service expectations
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
async def toggle_task_status(task_id: int):
    """
    Toggles task status between OPEN and COMPLETED.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM interventions WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    new_status = "COMPLETED" if row["status"] == "OPEN" else "OPEN"
    cursor.execute("UPDATE interventions SET status = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    conn.close()

    return {"task_id": task_id, "new_status": new_status}
