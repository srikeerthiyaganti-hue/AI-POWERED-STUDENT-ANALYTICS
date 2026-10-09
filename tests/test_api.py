import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_and_health(self):
        r1 = self.client.get("/")
        self.assertEqual(r1.status_code, 200)
        self.assertIn("VFSTR", r1.json()["institution"])

        r2 = self.client.get("/health")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["status"], "healthy")

    def test_get_programs(self):
        resp = self.client.get("/api/academic/programs")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)

    def test_get_regulations(self):
        resp = self.client.get("/api/academic/regulations")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)

    def test_get_courses_and_filtering(self):
        resp = self.client.get("/api/academic/courses?regulation=R22&limit=5")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            first = data[0]
            self.assertIn("course_code", first)
            self.assertIn("credits", first)

    def test_search_endpoint(self):
        resp = self.client.get("/api/academic/search?q=Programming")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)

    def test_ai_context_endpoint(self):
        resp = self.client.post("/api/academic/ai/context?query=Data Structures&branch=CSE")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["found_in_verified_sources"])
        self.assertIn("citations", data)

    def test_pipeline_auth(self):
        # Unauthorized without token
        unauth = self.client.post("/api/academic/pipeline/run?dry_run=true")
        self.assertEqual(unauth.status_code, 401)

if __name__ == "__main__":
    unittest.main()
