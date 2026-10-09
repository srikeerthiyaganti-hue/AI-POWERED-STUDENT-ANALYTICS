import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAnalyticsAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["database_connected"])
        self.assertGreater(data["database_stats"]["students_count"], 0)

    def test_analytics_overview(self):
        res = self.client.get("/api/analytics/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("kpis", data)
        self.assertIn("risk_distribution", data)
        self.assertIn("segment_distribution", data)
        self.assertIn("score_distribution", data)
        self.assertIn("category_coverage", data)
        self.assertGreater(data["kpis"]["total_students"], 0)

    def test_students_directory_and_filtering(self):
        # 1. Base list
        res = self.client.get("/api/analytics/students?limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("students", data)
        self.assertEqual(len(data["students"]), 10)
        self.assertGreaterEqual(data["total"], 69)

        # 2. Search filter
        res_search = self.client.get("/api/analytics/students?search=231FA04128")
        self.assertEqual(res_search.status_code, 200)
        data_search = res_search.json()
        self.assertGreaterEqual(len(data_search["students"]), 1)
        self.assertEqual(data_search["students"][0]["reg_no"], "231FA04128")

        # 3. Risk filter
        res_risk = self.client.get("/api/analytics/students?risk_level=HIGH")
        self.assertEqual(res_risk.status_code, 200)
        data_risk = res_risk.json()
        for s in data_risk["students"]:
            self.assertEqual(s["risk_level"], "HIGH")

    def test_student_detail_360(self):
        res = self.client.get("/api/analytics/students/1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("student", data)
        self.assertIn("success_score", data)
        self.assertIn("risk_assessment", data)
        self.assertIn("academic", data)
        self.assertIn("attendance", data)
        self.assertIn("placement", data)
        self.assertIn("skills", data)
        self.assertIn("engagement", data)
        self.assertIn("feedback", data)

    def test_record_intervention(self):
        res = self.client.post("/api/analytics/students/1/intervention", json={
            "notes": "Completed weekly coding review and attendance verification.",
            "status": "Action_Taken"
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "SUCCESS")

    def test_erp_status_and_data_quality(self):
        res_erp = self.client.get("/api/analytics/erp/status")
        self.assertEqual(res_erp.status_code, 200)
        self.assertIn("last_sync_status", res_erp.json())

        res_dq = self.client.get("/api/analytics/data-quality")
        self.assertEqual(res_dq.status_code, 200)

if __name__ == "__main__":
    unittest.main()
