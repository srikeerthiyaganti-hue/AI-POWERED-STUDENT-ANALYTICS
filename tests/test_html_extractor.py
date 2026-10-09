import unittest
from app.extractors.html_extractor import AcademicHTMLExtractor

class TestHTMLExtractor(unittest.TestCase):
    def test_html_table_parsing(self):
        sample_html = """
        <html>
            <body>
                <table>
                    <tr><th>Title</th><th>Description</th></tr>
                    <tr><td>PEO 1</td><td>Pursue a successful professional career in IT.</td></tr>
                    <tr><td>PO 1</td><td>Apply engineering knowledge to solve problems.</td></tr>
                </table>
                <table>
                    <tr><th>Code</th><th>Course</th><th>Credits</th></tr>
                    <tr><td>22CS201</td><td>Database Management Systems</td><td>4</td></tr>
                </table>
            </body>
        </html>
        """
        extractor = AcademicHTMLExtractor(sample_html, source_document_id=101)
        objectives = extractor.extract_program_objectives()
        self.assertEqual(len(objectives["PEO"]), 1)
        self.assertEqual(len(objectives["PO"]), 1)

        courses = extractor.extract_courses_from_tables()
        self.assertEqual(len(courses), 1)
        self.assertEqual(courses[0]["course_code"], "22CS201")
        self.assertEqual(courses[0]["credits"], 4.0)

if __name__ == "__main__":
    unittest.main()
