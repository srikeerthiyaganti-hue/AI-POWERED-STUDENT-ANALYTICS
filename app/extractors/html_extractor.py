import re
import logging
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from app.normalizer import clean_text, normalize_course_code, infer_course_category

logger = logging.getLogger("academic_pipeline.html_extractor")

class AcademicHTMLExtractor:
    """Extracts curriculum tables, PEOs/POs, and course listings from Vignan HTML pages."""

    def __init__(self, html_content: str, source_document_id: int):
        self.soup = BeautifulSoup(html_content, "html.parser")
        self.source_document_id = source_document_id

    def extract_program_objectives(self) -> Dict[str, List[Dict[str, str]]]:
        """Extract PEOs, PSOs, and POs from department HTML tables."""
        results = {"PEO": [], "PSO": [], "PO": []}
        tables = self.soup.find_all("table")

        for table in tables:
            rows = table.find_all("tr")
            for row in rows:
                cells = [clean_text(c.get_text()) for c in row.find_all(["th", "td"])]
                if len(cells) >= 2:
                    code_cell, desc_cell = cells[0], cells[1]
                    for key in ["PEO", "PSO", "PO"]:
                        if key in code_cell.upper():
                            results[key].append({"code": code_cell, "description": desc_cell})
        return results

    def extract_courses_from_tables(self) -> List[Dict[str, Any]]:
        """Extract course codes, names, and credits from any HTML course tables."""
        courses = []
        tables = self.soup.find_all("table")

        for table in tables:
            rows = table.find_all("tr")
            header_cols = []
            for idx, row in enumerate(rows):
                th_cells = row.find_all("th")
                if th_cells:
                    header_cols = [clean_text(th.get_text()).lower() for th in th_cells]
                    continue

                td_cells = [clean_text(td.get_text()) for td in row.find_all("td")]
                if len(td_cells) >= 3:
                    # Look for course code pattern in first or second column
                    code_cand = td_cells[0] if re.match(r'^\d{2}[A-Z]{2}\d{3}', td_cells[0]) else td_cells[1] if re.match(r'^\d{2}[A-Z]{2}\d{3}', td_cells[1]) else None
                    if code_cand:
                        code = normalize_course_code(code_cand)
                        name_idx = 1 if code_cand == td_cells[0] else 0
                        name = td_cells[name_idx]
                        credits = 3.0
                        if len(td_cells) >= 3:
                            try:
                                credits = float(td_cells[-1])
                            except ValueError:
                                pass

                        courses.append({
                            "course_code": code,
                            "course_name": name,
                            "credits": credits,
                            "course_category": infer_course_category(code, name),
                            "source_document_id": self.source_document_id
                        })
        return courses
