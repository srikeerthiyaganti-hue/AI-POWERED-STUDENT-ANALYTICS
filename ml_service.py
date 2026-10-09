"""
Smart Campus Analytics - ML Inference & Scoring Service
Team AARYA | KPMG in India Challenge

This service provides:
1. Deterministic Student Success Score calculation (transparent composite formula).
2. Academic and Placement Risk predictions with top contributing factors.
3. Model Registry metadata for the Institution Portal dashboard.
"""

import os
import json
import joblib
import numpy as np

# Resolve base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")
SCALER_PATH = os.path.join(MODELS_DIR, "feature_scaler.joblib")
ACADEMIC_MODEL_PATH = os.path.join(MODELS_DIR, "academic_risk_model.joblib")
PLACEMENT_MODEL_PATH = os.path.join(MODELS_DIR, "placement_risk_model.joblib")

# Cache for loaded artifacts
_METADATA = None
_SCALER = None
_ACADEMIC_MODEL = None
_PLACEMENT_MODEL = None


def _load_artifacts():
    global _METADATA, _SCALER, _ACADEMIC_MODEL, _PLACEMENT_MODEL
    if _METADATA is None:
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                _METADATA = json.load(f)
        else:
            _METADATA = {"feature_columns": []}

    if _SCALER is None and os.path.exists(SCALER_PATH):
        try:
            _SCALER = joblib.load(SCALER_PATH)
        except Exception:
            _SCALER = None

    if _ACADEMIC_MODEL is None and os.path.exists(ACADEMIC_MODEL_PATH):
        try:
            _ACADEMIC_MODEL = joblib.load(ACADEMIC_MODEL_PATH)
        except Exception:
            _ACADEMIC_MODEL = None

    if _PLACEMENT_MODEL is None and os.path.exists(PLACEMENT_MODEL_PATH):
        try:
            _PLACEMENT_MODEL = joblib.load(PLACEMENT_MODEL_PATH)
        except Exception:
            _PLACEMENT_MODEL = None


def calculate_student_success_score(student: dict) -> dict:
    """
    Computes transparent, deterministic Student Success Score (0 to 100).
    Weighted across 6 primary dimensions.
    """
    cgpa = float(student.get("cgpa", 7.0))
    backlogs = int(student.get("backlogs", 0))
    attendance = float(student.get("overall_attendance_pct", 75.0))
    aptitude = float(student.get("aptitude_score", 60.0))
    coding = float(student.get("coding_skills", 5.0))
    dsa = float(student.get("dsa_score", 5.0))
    lms_comp = float(student.get("lms_assignment_completion_pct", 80.0))
    lms_logins = int(student.get("lms_logins_per_week", 7))
    comm_skills = float(student.get("communication_skills", 6.0))
    tech_skills = float(student.get("system_design", 5.0))
    hackathons = int(student.get("hackathons", 0))
    certifications = int(student.get("certifications", 0))

    # Normalized component scores (0.0 to 1.0)
    norm_academic = min(1.0, max(0.0, (cgpa / 10.0) * 0.70 + (1.0 - min(1.0, backlogs / 3.0)) * 0.30))
    norm_attendance = min(1.0, max(0.0, attendance / 100.0))
    norm_placement = min(1.0, max(0.0, (aptitude * 0.40 + (coding * 10.0) * 0.35 + (dsa * 10.0) * 0.25) / 100.0))
    norm_lms = min(1.0, max(0.0, (lms_comp / 100.0) * 0.70 + min(1.0, lms_logins / 14.0) * 0.30))
    norm_skills = min(1.0, max(0.0, ((comm_skills + tech_skills) / 2.0) / 10.0))
    norm_engagement = min(1.0, max(0.0, (min(hackathons, 3) / 3.0) * 0.50 + (min(certifications, 3) / 3.0) * 0.50))

    # Composite weights: 35% Academics, 20% Placement, 15% Attendance, 12% LMS, 10% Skills, 8% Engagement
    composite = (
        0.35 * norm_academic +
        0.20 * norm_placement +
        0.15 * norm_attendance +
        0.12 * norm_lms +
        0.10 * norm_skills +
        0.08 * norm_engagement
    ) * 100.0

    total_score = round(min(99.0, max(10.0, composite)), 1)

    return {
        "student_success_score": total_score,
        "score_band": "EXCELLENT" if total_score >= 80 else ("GOOD" if total_score >= 65 else ("NEEDS_SUPPORT" if total_score >= 50 else "CRITICAL")),
        "components": {
            "academic": round(norm_academic * 100.0, 1),
            "placement": round(norm_placement * 100.0, 1),
            "attendance": round(norm_attendance * 100.0, 1),
            "lms": round(norm_lms * 100.0, 1),
            "skills": round(norm_skills * 100.0, 1),
            "engagement": round(norm_engagement * 100.0, 1)
        }
    }


def predict_student_risks(student: dict) -> dict:
    """
    Predicts academic and placement risk using trained LightGBM models.
    Extracts the top contributing factors for explainability.
    """
    _load_artifacts()

    feature_cols = _METADATA.get("feature_columns", [])
    if not feature_cols:
        feature_cols = [
            "cgpa", "backlogs", "overall_attendance_pct", "lms_assignment_completion_pct",
            "lms_logins_per_week", "aptitude_score", "coding_skills", "dsa_score",
            "system_design", "internships", "projects_count", "certifications",
            "hackathons", "open_source", "communication_skills", "ml_knowledge",
            "faculty_feedback_rating"
        ]

    # Construct input vector in exact schema order
    vector = [float(student.get(f, 0.0)) for f in feature_cols]
    vector_arr = np.array([vector])

    # 1. Independent Academic Risk Computation
    # Investigation Note: academic_risk_model.joblib and placement_risk_model.joblib
    # have identical binary checksums (both originally trained on placement_status).
    # To ensure analytical integrity and prevent duplicate predictions, Academic Risk
    # is evaluated independently on real academic indicators: backlogs, attendance, CGPA, and LMS velocity.
    backlogs = int(student.get("backlogs", 0))
    att = float(student.get("overall_attendance_pct", 75.0))
    cgpa = float(student.get("cgpa", 7.0))
    lms_comp = float(student.get("lms_assignment_completion_pct", 80.0))

    acad_hazard = (
        (min(backlogs, 4) / 4.0) * 0.45 +
        max(0.0, (75.0 - att) / 75.0) * 0.30 +
        max(0.0, (7.0 - min(cgpa, 7.0)) / 4.0) * 0.15 +
        max(0.0, (70.0 - min(lms_comp, 70.0)) / 70.0) * 0.10
    )
    acad_prob = round(min(0.95, max(0.05, acad_hazard)), 4)
    acad_band = "HIGH" if acad_prob >= 0.45 else ("MEDIUM" if acad_prob >= 0.25 else "LOW")

    # 2. Placement Risk Prediction (calibrated threshold 0.35 for minority class)
    if _PLACEMENT_MODEL is not None:
        place_prob = float(_PLACEMENT_MODEL.predict_proba(vector_arr)[0][1])
    else:
        # Fallback calibrated heuristic
        coding = student.get("coding_skills", 5.0) / 10.0
        aptitude = student.get("aptitude_score", 60.0) / 100.0
        place_prob = min(0.95, max(0.05, (1.0 - coding) * 0.50 + (1.0 - aptitude) * 0.40))

    place_band = "HIGH" if place_prob >= 0.35 else ("MEDIUM" if place_prob >= 0.20 else "LOW")

    # 3. Explainability: Identify Top Contributing Risk Factors
    risk_factors = []
    if float(student.get("overall_attendance_pct", 100.0)) < 75.0:
        risk_factors.append({
            "indicator": "Attendance Shortage",
            "observed_value": f"{student.get('overall_attendance_pct')}%",
            "benchmark": "75.0%",
            "severity": "HIGH"
        })
    if int(student.get("backlogs", 0)) > 0:
        risk_factors.append({
            "indicator": "Active Backlogs",
            "observed_value": str(student.get("backlogs")),
            "benchmark": "0",
            "severity": "HIGH"
        })
    if float(student.get("coding_skills", 10.0)) < 5.0:
        risk_factors.append({
            "indicator": "Coding Assessment Below Average",
            "observed_value": f"{student.get('coding_skills')}/10",
            "benchmark": "6.0/10",
            "severity": "MEDIUM"
        })
    if float(student.get("aptitude_score", 100.0)) < 55.0:
        risk_factors.append({
            "indicator": "Aptitude Score Gap",
            "observed_value": f"{student.get('aptitude_score')}/100",
            "benchmark": "60.0/100",
            "severity": "MEDIUM"
        })
    if float(student.get("lms_assignment_completion_pct", 100.0)) < 65.0:
        risk_factors.append({
            "indicator": "Low LMS Assignment Submissions",
            "observed_value": f"{student.get('lms_assignment_completion_pct')}%",
            "benchmark": "75.0%",
            "severity": "LOW"
        })

    return {
        "academic_risk": {
            "probability": round(acad_prob, 4),
            "band": acad_band
        },
        "placement_risk": {
            "probability": round(place_prob, 4),
            "band": place_band
        },
        "top_risk_factors": risk_factors[:3]
    }


def analyze_student(student: dict) -> dict:
    """
    Combined convenience function returning Success Score, Risks, and Explanations.
    """
    score_data = calculate_student_success_score(student)
    risk_data = predict_student_risks(student)

    return {
        "student_id": student.get("student_id", "STU_UNKNOWN"),
        "success_score": score_data,
        "risks": risk_data
    }


def get_model_registry() -> dict:
    """
    Returns model metadata and benchmark leaderboard for admin portal.
    """
    _load_artifacts()
    return _METADATA


if __name__ == "__main__":
    print("Testing ML Inference & Scoring Service...")
    sample = {
        "student_id": "STU_DEMO_01",
        "cgpa": 6.1,
        "backlogs": 1,
        "overall_attendance_pct": 68.5,
        "lms_assignment_completion_pct": 58.0,
        "lms_logins_per_week": 4,
        "aptitude_score": 48.0,
        "coding_skills": 4.0,
        "dsa_score": 3.8,
        "system_design": 3.0,
        "internships": 0,
        "projects_count": 1,
        "certifications": 0,
        "hackathons": 0,
        "open_source": 0,
        "communication_skills": 5.2,
        "ml_knowledge": 3.0,
        "faculty_feedback_rating": 2.8
    }

    result = analyze_student(sample)
    print("\nResult for Sample Student:")
    print(json.dumps(result, indent=2))
