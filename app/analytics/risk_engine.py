import json
import logging
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional

logger = logging.getLogger("academic_pipeline.analytics.risk_engine")

@dataclass
class TriggeredRiskRule:
    rule_id: str
    rule_name: str
    category: str
    severity: str        # 'HIGH', 'MODERATE', 'LOW'
    evidence: str        # e.g., "Attendance is 63.5% (below 65% detention threshold)"
    suggested_action: str

@dataclass
class RiskAssessmentResult:
    student_id: int
    reg_no: str
    risk_level: str                 # 'HIGH', 'MODERATE', 'LOW'
    composite_risk_score: float     # 0..100
    is_complete_data: bool
    triggered_rules: List[TriggeredRiskRule]
    suggested_interventions: List[str]
    audit_notes: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class StudentRiskEngine:
    """
    Explainable, supportive At-Risk Identification Engine based on Vignan Institutional Policies.
    Evaluates academic backlogs, attendance shortage thresholds, LMS drops, and placement readiness.
    """

    def __init__(self, attendance_threshold: float = 75.0, detention_threshold: float = 65.0, cgpa_warning: float = 6.0):
        self.attendance_threshold = attendance_threshold
        self.detention_threshold = detention_threshold
        self.cgpa_warning = cgpa_warning

    def evaluate_risk(self, student_id: int, reg_no: str, student_data: Dict[str, Any], semester: int = 1) -> RiskAssessmentResult:
        triggered: List[TriggeredRiskRule] = []
        interventions: List[str] = []
        risk_points = 0.0
        missing_critical_data = False

        acad = student_data.get("academic")
        att = student_data.get("attendance")
        lms = student_data.get("lms")
        plc = student_data.get("placement")

        # 1. ATTENDANCE RULES (Institutional Regulation Priority)
        if att and att.get("overall_percentage") is not None:
            pct = float(att["overall_percentage"])
            if pct < self.detention_threshold:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ATT_DETENTION",
                    rule_name="Critical Attendance Shortage (Detention Risk)",
                    category="Attendance",
                    severity="HIGH",
                    evidence=f"Current attendance is {pct:.1f}%, which is below the VFSTR statutory detention threshold of {self.detention_threshold}%.",
                    suggested_action="Issue formal detention alert, schedule parent-mentor consultation, and review medical/leave condonation documentation."
                ))
                risk_points += 40.0
                interventions.append("Schedule urgent counseling regarding VFSTR attendance regulations (<65% detention).")
            elif pct < self.attendance_threshold:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ATT_SHORTAGE",
                    rule_name="Attendance Shortage Condonation Warning",
                    category="Attendance",
                    severity="MODERATE",
                    evidence=f"Attendance is {pct:.1f}%, below the required 75.0% threshold.",
                    suggested_action="Conduct mentor review and set up daily biometric monitoring to reach >= 75%."
                ))
                risk_points += 25.0
                interventions.append("Mentor monitoring: daily attendance adherence tracking required.")
        else:
            missing_critical_data = True

        # 2. ACADEMIC & BACKLOG RULES
        if acad and acad.get("cgpa") is not None:
            cgpa = float(acad["cgpa"])
            backlogs = int(acad.get("backlogs") or 0)
            trend = str(acad.get("trend") or "STABLE")

            if backlogs >= 2:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ACAD_MULTIPLE_BACKLOGS",
                    rule_name="Multiple Active Course Backlogs",
                    category="Academics",
                    severity="HIGH",
                    evidence=f"Student has {backlogs} active course arrears.",
                    suggested_action="Mandatory allotment to Faculty Remedial Cell and backlog clearing roadmap."
                ))
                risk_points += 35.0
                interventions.append("Enroll in remedial tutorial batches for backlog subjects.")
            elif backlogs == 1:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ACAD_SINGLE_BACKLOG",
                    rule_name="Single Course Backlog Arrear",
                    category="Academics",
                    severity="MODERATE",
                    evidence="Student carries 1 active subject backlog.",
                    suggested_action="Provide question banks, peer study partner, and supplementary exam guidance."
                ))
                risk_points += 18.0
                interventions.append("Assign senior peer tutor for supplementary examination preparation.")

            if cgpa < 5.0 and cgpa > 0:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ACAD_CRITICAL_CGPA",
                    rule_name="Critical CGPA Performance (< 5.0)",
                    category="Academics",
                    severity="HIGH",
                    evidence=f"Cumulative GPA is {cgpa:.2f}, below minimum graduation pass threshold.",
                    suggested_action="Immediate Dean-Academic intervention and individualized academic recovery plan."
                ))
                risk_points += 30.0
                interventions.append("Formulate individualized academic recovery plan with HOD.")
            elif cgpa < self.cgpa_warning and cgpa > 0:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ACAD_WARNING_CGPA",
                    rule_name="Low CGPA Warning (< 6.0)",
                    category="Academics",
                    severity="MODERATE",
                    evidence=f"Cumulative GPA is {cgpa:.2f}, falling below optimal institutional placement cutoff.",
                    suggested_action="Continuous evaluation improvement through mid-term assignment enhancement."
                ))
                risk_points += 15.0
                interventions.append("Recommend academic workshops and mid-exam score boosting.")

            if trend == "DECLINING":
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_ACAD_TREND_DECLINE",
                    rule_name="Declining Semester Performance Trend",
                    category="Academics",
                    severity="MODERATE",
                    evidence="Current SGPA is lower than cumulative historical benchmark.",
                    suggested_action="Investigate non-academic or conceptual roadblocks."
                ))
                risk_points += 12.0
                interventions.append("Counselor check-in to identify reasons for semester score decline.")
        else:
            missing_critical_data = True

        # 3. LMS RULES
        if lms and lms.get("assignment_completion_pct") is not None:
            assign_pct = float(lms["assignment_completion_pct"])
            if assign_pct < 50.0:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_LMS_INACTIVE",
                    rule_name="High Assignment Non-Completion on LMS",
                    category="LMS Engagement",
                    severity="MODERATE",
                    evidence=f"Assignment completion rate is only {assign_pct:.1f}%.",
                    suggested_action="Review pending LMS submissions with lab faculty."
                ))
                risk_points += 15.0
                interventions.append("Schedule LMS submission catch-up window with course instructor.")

        # 4. PLACEMENT READINESS RULES (Senior Semesters >= 4)
        if semester >= 4 and plc:
            coding = float(plc.get("coding_score") or 0)
            apt = float(plc.get("aptitude_score") or 0)
            if coding < 50.0 or apt < 50.0:
                triggered.append(TriggeredRiskRule(
                    rule_id="RULE_PLACEMENT_UNPREPARED",
                    rule_name="Placement Assessment Benchmark Deficit",
                    category="Placement",
                    severity="MODERATE",
                    evidence=f"Placement readiness metrics are low (Coding: {coding:.1f}, Aptitude: {apt:.1f}).",
                    suggested_action="Mandatory participation in VFSTR Career Development Center coding bootcamp."
                ))
                risk_points += 15.0
                interventions.append("Enroll in CDC weekly mock placement aptitude & coding clinic.")

        # Composite Classification
        risk_score = round(max(0.0, min(100.0, risk_points)), 1)
        if any(r.severity == "HIGH" for r in triggered) or risk_score >= 50.0:
            risk_level = "HIGH"
        elif any(r.severity == "MODERATE" for r in triggered) or risk_score >= 25.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        if not interventions:
            interventions.append("Student is performing satisfactorily; maintain periodic faculty advisor check-ins.")

        audit_notes = (
            f"Risk calculated from {len(triggered)} active rule triggers. "
            f"Data status: {'Complete' if not missing_critical_data else 'Partial (Confidence reduced due to unpopulated categories)'}."
        )

        return RiskAssessmentResult(
            student_id=student_id,
            reg_no=reg_no,
            risk_level=risk_level,
            composite_risk_score=risk_score,
            is_complete_data=not missing_critical_data,
            triggered_rules=triggered,
            suggested_interventions=interventions,
            audit_notes=audit_notes
        )
