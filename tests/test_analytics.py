import unittest
from app.analytics.success_score import StudentSuccessScorer
from app.analytics.risk_engine import StudentRiskEngine
from app.analytics.segmentation import StudentSegmenter

class TestStudentSuccessScore(unittest.TestCase):
    def setUp(self):
        self.scorer = StudentSuccessScorer()

    def test_complete_profile_scoring(self):
        student_data = {
            "academic": {"cgpa": 8.5, "backlogs": 0, "sgpa": 8.7},
            "attendance": {"overall_percentage": 90.0},
            "lms": {"assignment_completion_pct": 95.0, "logins_per_week": 5.0},
            "placement": {"aptitude_score": 80.0, "coding_score": 85.0, "mock_interview_score": 80.0},
            "skills": {"programming_proficiency": 85.0, "problem_solving_score": 80.0, "soft_skills_score": 80.0},
            "engagement": {"engagement_score": 80.0}
        }
        res = self.scorer.calculate_score(1, "231FA04128", student_data)
        self.assertGreaterEqual(res.score, 80.0)
        self.assertEqual(res.data_coverage_pct, 100.0)
        self.assertEqual(res.confidence_level, "HIGH")
        self.assertIn("Exemplary", res.performance_tier)

    def test_missing_data_dynamic_reweighting(self):
        # Only academic and attendance available (55% raw weight: 0.35 + 0.20)
        student_data = {
            "academic": {"cgpa": 8.0, "backlogs": 0},
            "attendance": {"overall_percentage": 80.0},
            "lms": None,
            "placement": None,
            "skills": None,
            "engagement": None
        }
        res = self.scorer.calculate_score(2, "REG1002", student_data)
        self.assertGreater(res.score, 0.0)
        self.assertEqual(res.data_coverage_pct, 55.0)
        self.assertEqual(res.confidence_level, "MODERATE")
        # Academic effective weight should be 0.35 / 0.55 = ~0.636
        acad_breakdown = next(b for b in res.breakdown if b.indicator_key == "academic")
        self.assertAlmostEqual(acad_breakdown.effective_weight, 0.35 / 0.55, places=2)
        self.assertEqual(len(res.missing_indicators), 4)

    def test_all_missing_data_edge_case(self):
        student_data = {}
        res = self.scorer.calculate_score(3, "REG1003", student_data)
        self.assertEqual(res.score, 0.0)
        self.assertEqual(res.data_coverage_pct, 0.0)
        self.assertEqual(res.confidence_level, "LOW")
        self.assertEqual(res.performance_tier, "Insufficient Data")

    def test_deterministic_scoring(self):
        student_data = {
            "academic": {"cgpa": 7.5, "backlogs": 1},
            "attendance": {"overall_percentage": 78.0}
        }
        res1 = self.scorer.calculate_score(4, "REG1004", student_data)
        res2 = self.scorer.calculate_score(4, "REG1004", student_data)
        self.assertEqual(res1.score, res2.score)
        self.assertEqual(res1.performance_tier, res2.performance_tier)

class TestStudentRiskEngine(unittest.TestCase):
    def setUp(self):
        self.engine = StudentRiskEngine(attendance_threshold=75.0, detention_threshold=65.0)

    def test_attendance_detention_high_risk(self):
        student_data = {
            "academic": {"cgpa": 7.0, "backlogs": 0},
            "attendance": {"overall_percentage": 62.0} # Below 65%
        }
        res = self.engine.evaluate_risk(1, "REG1001", student_data, semester=2)
        self.assertEqual(res.risk_level, "HIGH")
        rule_ids = [r.rule_id for r in res.triggered_rules]
        self.assertIn("RULE_ATT_DETENTION", rule_ids)
        self.assertTrue(any("detention" in i.lower() for i in res.suggested_interventions))

    def test_multiple_backlogs_high_risk(self):
        student_data = {
            "academic": {"cgpa": 5.4, "backlogs": 3},
            "attendance": {"overall_percentage": 82.0}
        }
        res = self.engine.evaluate_risk(2, "REG1002", student_data, semester=3)
        self.assertEqual(res.risk_level, "HIGH")
        rule_ids = [r.rule_id for r in res.triggered_rules]
        self.assertIn("RULE_ACAD_MULTIPLE_BACKLOGS", rule_ids)

    def test_healthy_low_risk(self):
        student_data = {
            "academic": {"cgpa": 8.8, "backlogs": 0, "trend": "IMPROVING"},
            "attendance": {"overall_percentage": 92.0},
            "lms": {"assignment_completion_pct": 98.0},
            "placement": {"coding_score": 85.0, "aptitude_score": 82.0}
        }
        res = self.engine.evaluate_risk(3, "REG1003", student_data, semester=4)
        self.assertEqual(res.risk_level, "LOW")
        self.assertEqual(len(res.triggered_rules), 0)

class TestStudentSegmenter(unittest.TestCase):
    def setUp(self):
        self.segmenter = StudentSegmenter()

    def test_insufficient_data_segment(self):
        res = self.segmenter.assign_segment({}, data_coverage_pct=30.0)
        self.assertEqual(res.segment_code, "INSUFFICIENT_DATA")

    def test_high_acad_high_place_segment(self):
        data = {
            "academic": {"cgpa": 8.6, "backlogs": 0},
            "placement": {"coding_score": 85.0, "aptitude_score": 80.0, "mock_interview_score": 75.0}
        }
        res = self.segmenter.assign_segment(data, data_coverage_pct=100.0)
        self.assertEqual(res.segment_code, "HIGH_ACAD_HIGH_PLACE")

    def test_high_acad_low_place_segment(self):
        data = {
            "academic": {"cgpa": 8.4, "backlogs": 0},
            "placement": {"coding_score": 45.0, "aptitude_score": 50.0, "mock_interview_score": 40.0}
        }
        res = self.segmenter.assign_segment(data, data_coverage_pct=100.0)
        self.assertEqual(res.segment_code, "HIGH_ACAD_LOW_PLACE")

    def test_low_acad_good_attend_segment(self):
        data = {
            "academic": {"cgpa": 6.2, "backlogs": 0},
            "attendance": {"overall_percentage": 88.0}
        }
        res = self.segmenter.assign_segment(data, data_coverage_pct=100.0)
        self.assertEqual(res.segment_code, "LOW_ACAD_GOOD_ATTEND")

    def test_academic_support_needed_segment(self):
        data = {
            "academic": {"cgpa": 6.0, "backlogs": 2}
        }
        res = self.segmenter.assign_segment(data, data_coverage_pct=100.0)
        self.assertEqual(res.segment_code, "ACADEMIC_SUPPORT_NEEDED")

if __name__ == "__main__":
    unittest.main()
