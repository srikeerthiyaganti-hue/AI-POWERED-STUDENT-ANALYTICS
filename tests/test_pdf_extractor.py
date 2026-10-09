import unittest
from pathlib import Path
from app.extractors.pdf_extractor import AcademicPDFExtractor
from app.normalizer import parse_ltpc_string, normalize_course_code

class TestPDFExtractor(unittest.TestCase):
    def test_ltpc_parsing(self):
        res1 = parse_ltpc_string("3 2 0 4")
        self.assertEqual(res1["lecture_hours"], 3.0)
        self.assertEqual(res1["tutorial_hours"], 2.0)
        self.assertEqual(res1["practical_hours"], 0.0)
        self.assertEqual(res1["credits"], 4.0)

        res2 = parse_ltpc_string("L T P C\n2 0 2 3")
        self.assertEqual(res2["credits"], 3.0)
        self.assertEqual(res2["practical_hours"], 2.0)

    def test_normalize_course_code(self):
        self.assertEqual(normalize_course_code("22TP105"), "22TP105")
        self.assertEqual(normalize_course_code("22-tp-105"), "22TP105")
        self.assertEqual(normalize_course_code(" 22CS 201 "), "22CS201")

    def test_live_pdf_extraction_if_cached(self):
        pdf_path = Path(__file__).resolve().parent.parent / "sample_data" / "r22_cse.pdf"
        if pdf_path.exists():
            data = pdf_path.read_bytes()
            extractor = AcademicPDFExtractor(data, source_document_id=1)
            self.assertGreater(extractor.total_pages, 20)
            
            curriculum = extractor.extract_curriculum_structure()
            self.assertIn(1, curriculum)
            self.assertGreater(len(curriculum[1]), 0)

            detailed = extractor.extract_detailed_syllabus()
            self.assertGreater(len(detailed), 10)
            
            # Check unit extraction on first course
            first_course = detailed[0]
            self.assertIn("course_code", first_course)
            self.assertIn("units", first_course)
            self.assertGreater(len(first_course["units"]), 0)

if __name__ == "__main__":
    unittest.main()
