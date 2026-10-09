import io
import re
import logging
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from app.normalizer import clean_text, normalize_course_code, parse_ltpc_string, infer_course_category

logger = logging.getLogger("academic_pipeline.pdf_extractor")

class AcademicPDFExtractor:
    """Extracts curriculum structures, courses, and syllabus units from Vignan PDFs."""

    def __init__(self, pdf_bytes: bytes, source_document_id: int):
        self.reader = PdfReader(io.BytesIO(pdf_bytes))
        self.source_document_id = source_document_id
        self.total_pages = len(self.reader.pages)

    def extract_curriculum_structure(self) -> Dict[str, Any]:
        """
        Scan curriculum overview pages (pages 5 to 12) for courses organized by semester.
        Returns a dict mapping semester_number -> list of course dicts.
        """
        semesters_data: Dict[int, List[Dict[str, Any]]] = {}

        # Look across the initial 15 pages where Course Structure tables reside
        scan_limit = min(15, self.total_pages)
        current_semester = 1

        for page_idx in range(4, scan_limit):
            page_num = page_idx + 1
            text = self.reader.pages[page_idx].extract_text()
            if not text or "Course Structure" not in text:
                continue

            # Determine semester from text or page range:
            # Page 6: Sem 1 & 2
            # Page 7: Sem 3 & 4
            # Page 8: Sem 5 & 6
            # Page 9: Sem 7 & 8
            page_semesters = []
            if page_num == 6: page_semesters = [1, 2]
            elif page_num == 7: page_semesters = [3, 4]
            elif page_num == 8: page_semesters = [5, 6]
            elif page_num == 9: page_semesters = [7, 8]
            else:
                page_semesters = [current_semester]

            lines = text.splitlines()
            courses_found = []
            for line in lines:
                line_str = line.strip()
                # Pattern: 22XX123 Course Name L T P C
                m = re.match(r'^(22[A-Z]{2}\d{3})\s+([A-Za-z0-9\s,\-–\(\)\/]+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$', line_str)
                if m:
                    code = normalize_course_code(m.group(1))
                    name = clean_text(m.group(2))
                    l, t, p, c = float(m.group(3)), float(m.group(4)), float(m.group(5)), float(m.group(6))
                    courses_found.append({
                        "course_code": code,
                        "course_name": name,
                        "lecture_hours": l,
                        "tutorial_hours": t,
                        "practical_hours": p,
                        "credits": c,
                        "course_category": infer_course_category(code, name),
                        "page_reference": page_num,
                        "source_document_id": self.source_document_id
                    })

            # Distribute courses across the two semesters on this page
            if len(page_semesters) == 2 and courses_found:
                midpoint = len(courses_found) // 2
                sem1 = page_semesters[0]
                sem2 = page_semesters[1]
                semesters_data.setdefault(sem1, []).extend(courses_found[:midpoint])
                semesters_data.setdefault(sem2, []).extend(courses_found[midpoint:])
            elif page_semesters and courses_found:
                sem = page_semesters[0]
                semesters_data.setdefault(sem, []).extend(courses_found)

        return semesters_data

    def extract_detailed_syllabus(self) -> List[Dict[str, Any]]:
        """
        Scan course pages (typically pages 12 through total_pages) to extract:
        - Course Code & Title
        - Hours & Credits (L T P C)
        - Prerequisites
        - Course Description & Objectives
        - Unit-by-Unit topics, outcomes, textbooks
        """
        detailed_courses: List[Dict[str, Any]] = []

        # Step 1: Detect course headers
        course_starts = []
        for page_idx in range(11, self.total_pages):
            page_num = page_idx + 1
            text = self.reader.pages[page_idx].extract_text()
            if not text:
                continue

            # Look for standard Vignan course header pattern: e.g. 22TP105 PROBLEM SOLVING...
            match = re.search(r'\b(22[A-Z]{2}\d{3})\s+([\s\S]+?)(?=Hours\s+Per\s+Week)', text, re.I)
            if match:
                code = normalize_course_code(match.group(1))
                raw_name = re.sub(r'\s+', ' ', clean_text(match.group(2))).strip().title()
                raw_name = re.sub(r'\s+[A-Z]$', '', raw_name)
                course_starts.append((page_idx, page_num, code, raw_name))

        logger.info(f"Identified {len(course_starts)} detailed course starts in PDF")

        # Step 2: Extract content for each identified course
        for i, (p_idx, p_num, code, name) in enumerate(course_starts):
            next_idx = course_starts[i+1][0] if i + 1 < len(course_starts) else min(p_idx + 6, self.total_pages)
            
            # Combine text of the course pages (usually 2-4 pages per course)
            course_text_blocks = []
            for p in range(p_idx, next_idx):
                course_text_blocks.append((p + 1, self.reader.pages[p].extract_text()))

            full_course_text = "\n".join(t for _, t in course_text_blocks)

            # Hours & Credits
            ltpc = parse_ltpc_string(full_course_text)

            # Prerequisite
            prereq = None
            prereq_m = re.search(r'PREREQUISITE\s+KNOWLEDGE\s*:\s*([^\n\r]+)', full_course_text, re.I)
            if prereq_m:
                prereq = clean_text(prereq_m.group(1))

            # Units extraction
            units = []
            # Match UNIT-1, UNIT-2, UNIT-3, etc.
            unit_matches = list(re.finditer(r'UNIT\s*[-–]\s*(\d+)(?:\s*[:\-]?\s*([^\n\r]+))?', full_course_text, re.I))

            # Detect Module-2 boundary to sequence units 1..5 continuously
            mod2_match = re.search(r'MODULE\s*[-–\s]*2', full_course_text, re.I)
            mod2_pos = mod2_match.start() if mod2_match else float('inf')

            mod1_count = sum(1 for m in unit_matches if m.start() < mod2_pos)

            for u_idx, u_match in enumerate(unit_matches):
                raw_num = int(u_match.group(1))
                if u_match.start() >= mod2_pos:
                    unit_num = mod1_count + raw_num
                else:
                    unit_num = raw_num
                unit_title = clean_text(u_match.group(2) or f"Unit {unit_num} Topics")
                
                # Content between this unit and next unit (or Course Outcomes)
                start_pos = u_match.end()
                if u_idx + 1 < len(unit_matches):
                    end_pos = unit_matches[u_idx + 1].start()
                else:
                    end_match = re.search(r'(COURSE\s+OUTCOMES|TEXT\s*BOOKS|REFERENCE|PRACTICES)', full_course_text[start_pos:], re.I)
                    end_pos = start_pos + end_match.start() if end_match else len(full_course_text)

                unit_body = clean_text(full_course_text[start_pos:end_pos])
                if not unit_body:
                    unit_body = f"Core syllabus topics for {code} Unit {unit_num}."

                # If first line is a topic heading (e.g. MATRICES, INTRODUCTION TO ALGORITHMS)
                lines = unit_body.splitlines()
                if lines and len(lines[0]) < 90 and not any(k in lines[0].lower() for k in ["hours", "http", "source:"]):
                    unit_title = lines[0].strip().title()
                    unit_body = "\n".join(lines[1:]).strip() if len(lines) > 1 else unit_body

                units.append({
                    "unit_number": unit_num,
                    "unit_title": unit_title[:150] if unit_title else f"Unit {unit_num}",
                    "topic_text": unit_body,
                    "page_number": p_num,
                    "source_document_id": self.source_document_id
                })

            # Textbooks and References
            textbooks = None
            tb_m = re.search(r'TEXT\s*BOOKS?\s*:\s*([\s\S]*?)(?=REFERENCE|COURSE OUTCOMES|$)', full_course_text, re.I)
            if tb_m:
                textbooks = clean_text(tb_m.group(1))[:500]

            references = None
            ref_m = re.search(r'REFERENCE\s*BOOKS?\s*:\s*([\s\S]*?)(?=COURSE OUTCOMES|$)', full_course_text, re.I)
            if ref_m:
                references = clean_text(ref_m.group(1))[:500]

            detailed_courses.append({
                "course_code": code,
                "course_name": name,
                "credits": ltpc["credits"],
                "lecture_hours": ltpc["lecture_hours"],
                "tutorial_hours": ltpc["tutorial_hours"],
                "practical_hours": ltpc["practical_hours"],
                "prerequisites": prereq,
                "course_category": infer_course_category(code, name),
                "page_reference": p_num,
                "source_document_id": self.source_document_id,
                "units": units,
                "textbooks": textbooks,
                "references": references
            })

        return detailed_courses
