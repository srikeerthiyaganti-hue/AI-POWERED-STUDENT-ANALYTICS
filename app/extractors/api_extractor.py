import json
import logging
from typing import Dict, Any, List
from app.normalizer import clean_text, normalize_course_code, infer_course_category

logger = logging.getLogger("academic_pipeline.api_extractor")

class AcademicAPIExtractor:
    """Ingests catalog courses, curriculum graphs, and degree rules from the existing backend API."""

    def __init__(self, source_document_id: int):
        self.source_document_id = source_document_id

    def extract_subjects_json(self, raw_bytes: bytes) -> Dict[int, List[Dict[str, Any]]]:
        """
        Parses the /api/subjects response (211 catalog courses).
        Maps Semester 1..4 -> list of courses.
        """
        data = json.loads(raw_bytes.decode('utf-8'))
        semesters_data: Dict[int, List[Dict[str, Any]]] = {}

        semesters_dict = data.get("semesters", {})
        for sem_str, courses in semesters_dict.items():
            # Extract number from 'Semester 1'
            import re
            m = re.search(r'(\d+)', sem_str)
            sem_num = int(m.group(1)) if m else 1

            for c in courses:
                code = normalize_course_code(c.get("subject_id", ""))
                name = clean_text(c.get("subject_name", ""))
                credits = float(c.get("credits", 3.0))

                if code and name:
                    semesters_data.setdefault(sem_num, []).append({
                        "course_code": code,
                        "course_name": name,
                        "credits": credits,
                        "lecture_hours": 3.0,
                        "tutorial_hours": 0.0,
                        "practical_hours": 0.0,
                        "course_category": infer_course_category(code, name),
                        "source_document_id": self.source_document_id
                    })
        return semesters_data

    def extract_curriculum_edges(self, raw_bytes: bytes) -> List[Dict[str, str]]:
        """Parses graph nodes and edges to extract course prerequisite pairs."""
        data = json.loads(raw_bytes.decode('utf-8'))
        edges = data.get("edges", [])
        prereqs = []
        for edge in edges:
            src = normalize_course_code(edge.get("source", ""))
            tgt = normalize_course_code(edge.get("target", ""))
            if src and tgt:
                prereqs.append({"prerequisite_course": src, "target_course": tgt})
        return prereqs
