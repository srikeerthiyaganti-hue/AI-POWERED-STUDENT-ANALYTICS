import json
import logging
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("academic_pipeline.analytics.success_score")

@dataclass
class IndicatorBreakdown:
    indicator_key: str
    indicator_name: str
    raw_value: Optional[float]
    normalized_value: Optional[float] # 0..100
    configured_weight: float           # e.g. 0.35
    effective_weight: float            # re-normalized weight if others missing
    weighted_contribution: float       # effective_weight * normalized_value
    is_available: bool
    status_label: str                  # 'Strong', 'Satisfactory', 'Needs Attention', 'Missing'

@dataclass
class SuccessScoreResult:
    student_id: int
    reg_no: str
    score: float                       # 0..100
    performance_tier: str              # 'Exemplary', 'Proficient', 'Developing', 'Critical Support'
    breakdown: List[IndicatorBreakdown]
    data_coverage_pct: float           # 0..100
    confidence_level: str              # 'HIGH', 'MODERATE', 'LOW'
    positive_factors: List[str]
    negative_factors: List[str]
    missing_indicators: List[str]
    improvement_recommendations: List[str]
    scoring_version: str = "2.1.0-explainable"
    is_deterministic: bool = True

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d

class StudentSuccessScorer:
    """
    Transparent, explainable Student Success Scorer (0..100).
    Normalizes indicators, handles missing data via dynamic re-weighting,
    and provides comprehensive mathematical and human-readable explanations.
    """

    DEFAULT_WEIGHTS = {
        "academic": 0.35,
        "attendance": 0.20,
        "lms": 0.15,
        "placement": 0.15,
        "skills": 0.10,
        "engagement": 0.05
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        # Ensure weights sum to 1.0
        total_w = sum(self.weights.values())
        if total_w > 0:
            self.weights = {k: v / total_w for k, v in self.weights.items()}

    def calculate_score(self, student_id: int, reg_no: str, student_data: Dict[str, Any]) -> SuccessScoreResult:
        """
        Calculates the Student Success Score for a student.
        student_data contains raw category dictionaries:
        - 'academic': {'cgpa': float, 'backlogs': int, 'sgpa': float} or None
        - 'attendance': {'overall_percentage': float} or None
        - 'lms': {'assignment_completion_pct': float, 'logins_per_week': float} or None
        - 'placement': {'aptitude_score': float, 'coding_score': float, 'mock_interview_score': float} or None
        - 'skills': {'programming_proficiency': float, 'problem_solving_score': float, 'soft_skills_score': float} or None
        - 'engagement': {'engagement_score': float} or None
        - 'feedback': {'sentiment_score': float, 'remarks': str} or None (contextual only)
        """
        breakdowns: List[IndicatorBreakdown] = []
        positive_factors: List[str] = []
        negative_factors: List[str] = []
        missing_indicators: List[str] = []
        recommendations: List[str] = []

        # 1. Evaluate individual categories & normalize to 0..100
        raw_vals: Dict[str, Optional[float]] = {}
        norm_vals: Dict[str, Optional[float]] = {}

        # Academic (35%)
        acad = student_data.get("academic")
        if acad and acad.get("cgpa") is not None and acad.get("cgpa") > 0:
            cgpa = float(acad["cgpa"])
            backlogs = int(acad.get("backlogs") or 0)
            raw_vals["academic"] = cgpa
            # Base 10 scale to 100, penalized by backlogs (-10 points per backlog)
            norm_acad = max(0.0, min(100.0, (cgpa / 10.0) * 100.0 - (backlogs * 10.0)))
            norm_vals["academic"] = round(norm_acad, 1)
        else:
            raw_vals["academic"] = None
            norm_vals["academic"] = None

        # Attendance (20%)
        att = student_data.get("attendance")
        if att and att.get("overall_percentage") is not None:
            att_pct = float(att["overall_percentage"])
            raw_vals["attendance"] = att_pct
            norm_vals["attendance"] = max(0.0, min(100.0, round(att_pct, 1)))
        else:
            raw_vals["attendance"] = None
            norm_vals["attendance"] = None

        # LMS (15%)
        lms = student_data.get("lms")
        if lms and lms.get("assignment_completion_pct") is not None:
            assign_pct = float(lms["assignment_completion_pct"])
            logins = float(lms.get("logins_per_week") or 0)
            raw_vals["lms"] = assign_pct
            # 65% weight on assignments, 35% on logins (benchmark: 5 logins/week = 100%)
            login_score = min(100.0, (logins / 5.0) * 100.0)
            norm_lms = (assign_pct * 0.65) + (login_score * 0.35)
            norm_vals["lms"] = max(0.0, min(100.0, round(norm_lms, 1)))
        else:
            raw_vals["lms"] = None
            norm_vals["lms"] = None

        # Placement Readiness (15%)
        plc = student_data.get("placement")
        if plc and plc.get("coding_score") is not None:
            apt = float(plc.get("aptitude_score") or 0)
            cod = float(plc.get("coding_score") or 0)
            mock = float(plc.get("mock_interview_score") or 0)
            raw_vals["placement"] = round((apt + cod + mock) / 3.0, 1)
            norm_plc = (apt * 0.35) + (cod * 0.40) + (mock * 0.25)
            norm_vals["placement"] = max(0.0, min(100.0, round(norm_plc, 1)))
        else:
            raw_vals["placement"] = None
            norm_vals["placement"] = None

        # Skills Assessments (10%)
        skl = student_data.get("skills")
        if skl and skl.get("programming_proficiency") is not None:
            prog = float(skl.get("programming_proficiency") or 0)
            prob = float(skl.get("problem_solving_score") or 0)
            soft = float(skl.get("soft_skills_score") or 0)
            raw_vals["skills"] = round((prog + prob + soft) / 3.0, 1)
            norm_skl = (prog * 0.40) + (prob * 0.35) + (soft * 0.25)
            norm_vals["skills"] = max(0.0, min(100.0, round(norm_skl, 1)))
        else:
            raw_vals["skills"] = None
            norm_vals["skills"] = None

        # Engagement (5%)
        eng = student_data.get("engagement")
        if eng and eng.get("engagement_score") is not None:
            eng_score = float(eng["engagement_score"])
            raw_vals["engagement"] = eng_score
            norm_vals["engagement"] = max(0.0, min(100.0, round(eng_score, 1)))
        else:
            raw_vals["engagement"] = None
            norm_vals["engagement"] = None

        # 2. Dynamic Weight Renormalization
        available_categories = [k for k, v in norm_vals.items() if v is not None]
        sum_available_weight = sum(self.weights[k] for k in available_categories)
        data_coverage_pct = round(sum_available_weight * 100.0, 1)

        category_labels = {
            "academic": "Academic Performance (CGPA & Backlogs)",
            "attendance": "Classroom Attendance",
            "lms": "LMS & Learning Engagement",
            "placement": "Placement Readiness Assessments",
            "skills": "Technical & Soft Skills Proficiency",
            "engagement": "Campus & Extracurricular Engagement"
        }

        final_score = 0.0

        for key, conf_weight in self.weights.items():
            is_avail = key in available_categories
            norm_score = norm_vals.get(key)
            raw_score = raw_vals.get(key)

            if is_avail and sum_available_weight > 0:
                eff_weight = conf_weight / sum_available_weight
                contrib = round(eff_weight * norm_score, 2)
                final_score += contrib

                if norm_score >= 75.0:
                    status_lbl = "Strong"
                    positive_factors.append(f"{category_labels[key]} is robust at {norm_score}/100.")
                elif norm_score >= 60.0:
                    status_lbl = "Satisfactory"
                else:
                    status_lbl = "Needs Attention"
                    negative_factors.append(f"{category_labels[key]} is suboptimal at {norm_score}/100.")
                    recommendations.append(f"Targeted support required for {category_labels[key].lower()}.")
            else:
                eff_weight = 0.0
                contrib = 0.0
                status_lbl = "Missing Data"
                missing_indicators.append(category_labels[key])

            breakdowns.append(IndicatorBreakdown(
                indicator_key=key,
                indicator_name=category_labels[key],
                raw_value=raw_score,
                normalized_value=norm_score,
                configured_weight=round(conf_weight, 3),
                effective_weight=round(eff_weight, 3),
                weighted_contribution=contrib,
                is_available=is_avail,
                status_label=status_lbl
            ))

        final_score = round(max(0.0, min(100.0, final_score)), 1)

        # Performance Tier
        if data_coverage_pct < 30.0:
            performance_tier = "Insufficient Data"
        elif final_score >= 85.0:
            performance_tier = "Exemplary"
        elif final_score >= 70.0:
            performance_tier = "Proficient"
        elif final_score >= 50.0:
            performance_tier = "Developing"
        else:
            performance_tier = "Critical Support"

        # Confidence Level
        if data_coverage_pct >= 85.0:
            confidence = "HIGH"
        elif data_coverage_pct >= 55.0:
            confidence = "MODERATE"
        else:
            confidence = "LOW"

        if not positive_factors and data_coverage_pct >= 50.0:
            positive_factors.append("Foundational performance indicators are maintained within passing baseline.")
        if not negative_factors and data_coverage_pct >= 50.0:
            negative_factors.append("No critical indicator deficits detected.")

        return SuccessScoreResult(
            student_id=student_id,
            reg_no=reg_no,
            score=final_score,
            performance_tier=performance_tier,
            breakdown=breakdowns,
            data_coverage_pct=data_coverage_pct,
            confidence_level=confidence,
            positive_factors=positive_factors,
            negative_factors=negative_factors,
            missing_indicators=missing_indicators,
            improvement_recommendations=recommendations,
            is_deterministic=True
        )
