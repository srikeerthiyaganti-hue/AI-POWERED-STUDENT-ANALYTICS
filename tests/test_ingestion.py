import unittest
from pathlib import Path
from app.ingestion.normalizer import (
    normalize_reg_no,
    normalize_name,
    normalize_branch,
    normalize_cgpa,
    normalize_semester,
    normalize_percentage
)
from app.ingestion.erp_adapter import VignanERPAdapter
from app.ingestion.pipeline import StudentDataIngestionPipeline

class TestIngestionNormalizer(unittest.TestCase):
    def test_normalize_reg_no(self):
        self.assertEqual(normalize_reg_no("231fa04128"), "231FA04128")
        self.assertEqual(normalize_reg_no("  REG1001  "), "REG1001")
        self.assertEqual(normalize_reg_no("'241FA04424'"), "241FA04424")
        self.assertIsNone(normalize_reg_no(""))
        self.assertIsNone(normalize_reg_no("AB"))

    def test_normalize_name(self):
        # Valid name
        name, malformed, issue = normalize_name("Diya Banerjee", "REG1001")
        self.assertEqual(name, "Diya Banerjee")
        self.assertFalse(malformed)
        self.assertIsNone(issue)

        # Placeholder name
        name, malformed, issue = normalize_name("Student (231FA04128)", "231FA04128")
        self.assertTrue(malformed)
        self.assertEqual(issue, "PLACEHOLDER_NAME")

        # Institutional entity scraped into name
        name, malformed, issue = normalize_name("GAUTHAMI JUNIOR COLLEGE", "231FA04424")
        self.assertTrue(malformed)
        self.assertEqual(issue, "INSTITUTIONAL_NAME_IN_STUDENT_FIELD")

    def test_normalize_branch(self):
        self.assertEqual(normalize_branch("cse"), "CSE")
        self.assertEqual(normalize_branch("Information Technology"), "IT")
        self.assertEqual(normalize_branch("AIML"), "AIML")

    def test_normalize_cgpa(self):
        self.assertEqual(normalize_cgpa("8.65"), 8.65)
        self.assertEqual(normalize_cgpa(9.24), 9.24)
        self.assertEqual(normalize_cgpa("invalid"), 0.0)
        self.assertEqual(normalize_cgpa(11.5), 10.0)

    def test_normalize_percentage(self):
        self.assertEqual(normalize_percentage("88.5%"), 88.5)
        self.assertEqual(normalize_percentage(92.0), 92.0)
        self.assertIsNone(normalize_percentage("[Not Available in Source]"))
        self.assertIsNone(normalize_percentage(None))

class TestIngestionPipelineAndERP(unittest.TestCase):
    def test_erp_adapter_status(self):
        adapter = VignanERPAdapter()
        status = adapter.get_sync_status()
        self.assertIn("last_sync_status", status)
        self.assertIn("portal_url", status)
        self.assertEqual(status["portal_url"], "https://erp.vignan.ac.in/student/")

    def test_pipeline_idempotence(self):
        pipeline = StudentDataIngestionPipeline()
        report1 = pipeline.run_initial_ingestion()
        self.assertGreater(report1["valid_rows"], 0)
        
        # Second run should succeed without error or duplicating students
        report2 = pipeline.run_initial_ingestion()
        self.assertGreater(report2["valid_rows"], 0)

if __name__ == "__main__":
    unittest.main()
