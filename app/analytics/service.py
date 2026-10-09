import json
import logging
from dataclasses import asdict
from typing import Dict, Any, List, Optional

from app.database import get_db
from app.analytics.success_score import StudentSuccessScorer
from app.analytics.risk_engine import StudentRiskEngine
from app.analytics.segmentation import StudentSegmenter

logger = logging.getLogger("academic_pipeline.analytics.service")

class StudentAnalyticsService:
    """Coordinates calculation of Student Success Scores, Risk Assessments, and Segmentation."""

    def __init__(self):
        # Fetch active scoring configuration if available
        weights = None
        att_thresh = 75.0
        det_thresh = 65.0
        cgpa_warn = 6.0

        try:
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("SELECT * FROM scoring_configurations WHERE is_active = 1 LIMIT 1")
                cfg = cur.fetchone()
                if cfg:
                    weights = {
                        "academic": cfg["academic_weight"],
                        "attendance": cfg["attendance_weight"],
                        "lms": cfg["lms_weight"],
                        "placement": cfg["placement_weight"],
                        "skills": cfg["skills_weight"],
                        "engagement": cfg["engagement_weight"]
                    }
                    att_thresh = cfg["attendance_threshold"]
                    det_thresh = cfg["detention_threshold"]
                    cgpa_warn = cfg["cgpa_warning_threshold"]
        except Exception as e:
            logger.warning(f"Could not load custom scoring configuration: {e}. Using defaults.")

        self.scorer = StudentSuccessScorer(weights=weights)
        self.risk_engine = StudentRiskEngine(attendance_threshold=att_thresh, detention_threshold=det_thresh, cgpa_warning=cgpa_warn)
        self.segmenter = StudentSegmenter()

    def process_all_students(self) -> Dict[str, Any]:
        """Compute scores, risk, and segments for all students in the database."""
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, reg_no, name, current_semester FROM students ORDER BY id ASC")
            students = cur.fetchall()

            processed_count = 0

            for st in students:
                student_id = st["id"]
                reg_no = st["reg_no"]
                sem = st["current_semester"]

                # Gather category data
                cur.execute("SELECT cgpa, sgpa, active_backlogs as backlogs, trend FROM academic_records WHERE student_id = ? AND semester = ?", (student_id, sem))
                acad = cur.fetchone()

                cur.execute("SELECT overall_percentage, trend FROM attendance_records WHERE student_id = ? AND semester = ?", (student_id, sem))
                att = cur.fetchone()

                cur.execute("SELECT assignment_completion_pct, logins_per_week, hours_spent_per_week FROM lms_activities WHERE student_id = ? AND semester = ?", (student_id, sem))
                lms = cur.fetchone()

                cur.execute("SELECT aptitude_score, coding_score, mock_interview_score, prep_progress_pct, is_placement_eligible FROM placement_readiness WHERE student_id = ? AND semester = ?", (student_id, sem))
                plc = cur.fetchone()

                cur.execute("SELECT programming_proficiency, problem_solving_score, technical_core_score, soft_skills_score FROM skill_assessments WHERE student_id = ? AND semester = ?", (student_id, sem))
                skl = cur.fetchone()

                cur.execute("SELECT engagement_score, hackathons_count, certifications_count, club_name FROM student_engagements WHERE student_id = ? AND semester = ?", (student_id, sem))
                eng = cur.fetchone()

                cur.execute("SELECT sentiment_score, support_required, remarks FROM feedback_records WHERE student_id = ? AND semester = ?", (student_id, sem))
                fdb = cur.fetchone()

                student_data = {
                    "academic": dict(acad) if acad else None,
                    "attendance": dict(att) if att else None,
                    "lms": dict(lms) if lms else None,
                    "placement": dict(plc) if plc else None,
                    "skills": dict(skl) if skl else None,
                    "engagement": dict(eng) if eng else None,
                    "feedback": dict(fdb) if fdb else None,
                }

                # 1. Success Score
                score_res = self.scorer.calculate_score(student_id, reg_no, student_data)

                cur.execute("""
                    INSERT INTO student_success_scores (
                        student_id, score, performance_tier, academic_component,
                        attendance_component, lms_component, placement_component,
                        skills_component, engagement_component, weights_used_json,
                        available_indicators_json, data_coverage_pct, confidence_score_pct,
                        positive_factors_json, negative_factors_json, scoring_version, is_deterministic
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                """, (
                    student_id,
                    score_res.score,
                    score_res.performance_tier,
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "academic"), 0.0),
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "attendance"), 0.0),
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "lms"), 0.0),
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "placement"), 0.0),
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "skills"), 0.0),
                    next((b.weighted_contribution for b in score_res.breakdown if b.indicator_key == "engagement"), 0.0),
                    json.dumps(self.scorer.weights),
                    json.dumps([b.indicator_key for b in score_res.breakdown if b.is_available]),
                    score_res.data_coverage_pct,
                    100.0 if score_res.confidence_level == "HIGH" else (70.0 if score_res.confidence_level == "MODERATE" else 40.0),
                    json.dumps(score_res.positive_factors),
                    json.dumps(score_res.negative_factors),
                    score_res.scoring_version
                ))

                # 2. Risk Assessment
                risk_res = self.risk_engine.evaluate_risk(student_id, reg_no, student_data, semester=sem)

                cur.execute("""
                    INSERT INTO risk_assessments (
                        student_id, risk_level, composite_risk_score,
                        triggered_rules_json, severity_breakdown_json,
                        is_complete_data, suggested_interventions_json
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    student_id,
                    risk_res.risk_level,
                    risk_res.composite_risk_score,
                    json.dumps([asdict(r) for r in risk_res.triggered_rules]),
                    json.dumps({"high": sum(1 for r in risk_res.triggered_rules if r.severity == "HIGH"),
                                "moderate": sum(1 for r in risk_res.triggered_rules if r.severity == "MODERATE")}),
                    1 if risk_res.is_complete_data else 0,
                    json.dumps(risk_res.suggested_interventions)
                ))

                # 3. Student Segmentation
                seg_res = self.segmenter.assign_segment(student_data, score_res.data_coverage_pct)

                cur.execute("""
                    INSERT INTO student_segments (student_id, segment_code, segment_name, rationale)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(student_id) DO UPDATE SET
                        segment_code = excluded.segment_code,
                        segment_name = excluded.segment_name,
                        rationale = excluded.rationale,
                        assigned_at = CURRENT_TIMESTAMP
                """, (student_id, seg_res.segment_code, seg_res.segment_name, seg_res.rationale))

                processed_count += 1

        logger.info(f"Processed analytics for {processed_count} students.")
        return {"processed_students": processed_count, "status": "SUCCESS"}
