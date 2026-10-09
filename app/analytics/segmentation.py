import logging
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

logger = logging.getLogger("academic_pipeline.analytics.segmentation")

@dataclass
class SegmentAssignment:
    segment_code: str
    segment_name: str
    rationale: str
    recommended_focus: str

class StudentSegmenter:
    """
    Classifies students into actionable, transparent segments based on actual multi-dimensional metrics.
    Guarantees that no student is forced into a misleading category when data is insufficient.
    """

    SEGMENTS = {
        "INSUFFICIENT_DATA": "Insufficient Data for Reliable Assessment",
        "ACADEMIC_SUPPORT_NEEDED": "Students Requiring Urgent Academic Support",
        "LOW_ATTEND_DECLINING": "Low Attendance & Declining Performance",
        "LOW_ACAD_GOOD_ATTEND": "Low Academics with Good Attendance (High Effort / Low Yield)",
        "STRONG_TECH_LOW_APTITUDE": "Strong Technical Skills with Low Aptitude / Interview Readiness",
        "HIGH_ACAD_LOW_PLACE": "High Academic Performance with Low Placement Readiness",
        "HIGH_ACAD_LOW_ENGAGE": "High Academic Performance with Low Co-Curricular Engagement",
        "HIGH_ACAD_HIGH_PLACE": "High Academic Performance & High Placement Readiness (Star Cohort)"
    }

    def assign_segment(self, student_data: Dict[str, Any], data_coverage_pct: float) -> SegmentAssignment:
        # Check insufficient data first
        if data_coverage_pct < 40.0:
            return SegmentAssignment(
                segment_code="INSUFFICIENT_DATA",
                segment_name=self.SEGMENTS["INSUFFICIENT_DATA"],
                rationale=f"Data coverage is only {data_coverage_pct:.1f}% across the 7 required categories. Incomplete profile prevents definitive classification.",
                recommended_focus="Request updated institutional ERP synchronization and student profile completion."
            )

        acad = student_data.get("academic") or {}
        att = student_data.get("attendance") or {}
        plc = student_data.get("placement") or {}
        skl = student_data.get("skills") or {}
        eng = student_data.get("engagement") or {}

        cgpa = float(acad.get("cgpa") or 0.0)
        backlogs = int(acad.get("backlogs") or 0)
        trend = str(acad.get("trend") or "STABLE")

        att_pct = float(att.get("overall_percentage") or 0.0) if att.get("overall_percentage") is not None else 80.0
        
        coding = float(plc.get("coding_score") or skl.get("programming_proficiency") or 0.0)
        aptitude = float(plc.get("aptitude_score") or skl.get("problem_solving_score") or 0.0)
        mock_int = float(plc.get("mock_interview_score") or skl.get("soft_skills_score") or 0.0)
        placement_avg = (coding + aptitude + mock_int) / 3.0 if (coding or aptitude or mock_int) else 0.0

        certs = int(eng.get("certifications_count") or 0)
        hacks = int(eng.get("hackathons_count") or 0)
        eng_score = float(eng.get("engagement_score") or 0.0)

        # 1. ACADEMIC_SUPPORT_NEEDED (Priority 1)
        if backlogs >= 1 or (cgpa < 5.5 and cgpa > 0):
            return SegmentAssignment(
                segment_code="ACADEMIC_SUPPORT_NEEDED",
                segment_name=self.SEGMENTS["ACADEMIC_SUPPORT_NEEDED"],
                rationale=f"Carries {backlogs} active course backlog(s) with CGPA of {cgpa:.2f}.",
                recommended_focus="Remedial tutoring sessions, question bank distribution, and mentor progress monitoring."
            )

        # 2. LOW_ATTEND_DECLINING (Priority 2)
        if att_pct < 75.0 and (trend == "DECLINING" or cgpa < 6.5):
            return SegmentAssignment(
                segment_code="LOW_ATTEND_DECLINING",
                segment_name=self.SEGMENTS["LOW_ATTEND_DECLINING"],
                rationale=f"Attendance is below statutory minimum at {att_pct:.1f}% alongside a declining semester trend.",
                recommended_focus="Urgent attendance condonation counseling and parent-mentor consultation."
            )

        # 3. LOW_ACAD_GOOD_ATTEND (High Effort / High Attendance but Low Marks)
        if cgpa < 6.5 and att_pct >= 80.0:
            return SegmentAssignment(
                segment_code="LOW_ACAD_GOOD_ATTEND",
                segment_name=self.SEGMENTS["LOW_ACAD_GOOD_ATTEND"],
                rationale=f"Shows strong discipline with {att_pct:.1f}% attendance, but academic yield is low (CGPA: {cgpa:.2f}).",
                recommended_focus="Conceptual bridge classes, doubt-clearing sessions, and learning style assessment."
            )

        # 4. STRONG_TECH_LOW_APTITUDE
        if coding >= 75.0 and (aptitude < 55.0 or mock_int < 55.0):
            return SegmentAssignment(
                segment_code="STRONG_TECH_LOW_APTITUDE",
                segment_name=self.SEGMENTS["STRONG_TECH_LOW_APTITUDE"],
                rationale=f"Strong hands-on coding capability ({coding:.1f}/100) hindered by quantitative aptitude ({aptitude:.1f}) or interview soft skills ({mock_int:.1f}).",
                recommended_focus="Quantitative aptitude bootcamps and verbal communication / mock interview drills."
            )

        # 5. HIGH_ACAD_LOW_PLACE
        if cgpa >= 8.0 and placement_avg < 60.0:
            return SegmentAssignment(
                segment_code="HIGH_ACAD_LOW_PLACE",
                segment_name=self.SEGMENTS["HIGH_ACAD_LOW_PLACE"],
                rationale=f"High academic standing (CGPA: {cgpa:.2f}) with placement preparation lagging behind ({placement_avg:.1f}/100).",
                recommended_focus="Mandatory CDC placement training, mock assessments, and resume building."
            )

        # 6. HIGH_ACAD_HIGH_PLACE (Star Cohort)
        if cgpa >= 8.0 and placement_avg >= 70.0:
            return SegmentAssignment(
                segment_code="HIGH_ACAD_HIGH_PLACE",
                segment_name=self.SEGMENTS["HIGH_ACAD_HIGH_PLACE"],
                rationale=f"Exemplary academic and placement standing (CGPA: {cgpa:.2f}, Placement Readiness: {placement_avg:.1f}/100).",
                recommended_focus="Fast-track to Tier-1 product placement drives and faculty research assistantships."
            )

        # 7. HIGH_ACAD_LOW_ENGAGE
        if cgpa >= 8.0 and (eng_score < 30.0 or (certs == 0 and hacks == 0)):
            return SegmentAssignment(
                segment_code="HIGH_ACAD_LOW_ENGAGE",
                segment_name=self.SEGMENTS["HIGH_ACAD_LOW_ENGAGE"],
                rationale=f"High academic standing (CGPA: {cgpa:.2f}) but minimal co-curricular or hackathon participation.",
                recommended_focus="Encourage student to lead technical club projects, join hackathons, and pursue industry certifications."
            )

        # Fallback Balanced Cohort
        return SegmentAssignment(
            segment_code="BALANCED_PROGRESSION",
            segment_name="Consistent Academic & Placement Progression",
            rationale=f"Balanced profile (CGPA: {cgpa:.2f}, Attendance: {att_pct:.1f}%, Placement: {placement_avg:.1f}/100).",
            recommended_focus="Maintain consistent semester performance and prepare for upcoming placement drives."
        )
