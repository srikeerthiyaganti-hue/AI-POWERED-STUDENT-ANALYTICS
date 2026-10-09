import unittest
import io
import openpyxl
from app.extractors.excel_extractor import AcademicExcelExtractor

class TestExcelExtractor(unittest.TestCase):
    def test_excel_parsing(self):
        # Create an in-memory workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Semester 1"
        ws.append(["Course Code", "Course Name", "L", "T", "P", "Credits", "Prerequisites"])
        ws.append(["22TP105", "Problem Solving through Programming - I", 2, 2, 2, 4, "None"])
        ws.append(["22MT103", "Linear Algebra and ODE", 3, 2, 0, 4, "Matrices"])

        buf = io.BytesIO()
        wb.save(buf)
        excel_bytes = buf.getvalue()

        extractor = AcademicExcelExtractor(excel_bytes, source_document_id=99)
        courses_by_sem = extractor.extract_courses()

        self.assertIn(1, courses_by_sem)
        self.assertEqual(len(courses_by_sem[1]), 2)
        c1 = courses_by_sem[1][0]
        self.assertEqual(c1["course_code"], "22TP105")
        self.assertEqual(c1["credits"], 4.0)
        self.assertEqual(c1["lecture_hours"], 2.0)
        self.assertEqual(c1["practical_hours"], 2.0)

if __name__ == "__main__":
    unittest.main()
