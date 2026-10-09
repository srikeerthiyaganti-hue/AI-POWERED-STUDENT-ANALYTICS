import re
import html
from typing import Tuple, Dict, Any

import unicodedata

def clean_text(text: str) -> str:
    """Normalize whitespace, convert PDF ligatures, and strip unprintable characters."""
    if not text:
        return ""
    text = html.unescape(text)
    # Normalize ligatures (e.g. fi, fl, ffi)
    text = unicodedata.normalize('NFKD', text)
    # Replace non-breaking spaces and irregular whitespace
    text = re.sub(r'[\u00a0\u200b\u200c\u200d]', ' ', text)
    # Normalize multiple whitespace to single space, preserve paragraphs
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.splitlines()]
    # Remove empty lines excess
    cleaned = "\n".join(line for line in lines if line)
    return cleaned.strip()

def normalize_course_code(code: str) -> str:
    """Normalize course codes to standard VFSTR format, e.g. '22TP105'."""
    if not code:
        return ""
    cleaned = re.sub(r'[\s\-_]+', '', code).upper()
    return cleaned

def parse_ltpc_string(text: str) -> Dict[str, float]:
    """
    Extract Lecture, Tutorial, Practical, and Credit values.
    Supports formats like:
      '3 2 0 4'
      'L T P C \n 3 2 0 4'
      '3-2-0-4'
      'L: 3, T: 2, P: 0, C: 4'
    """
    res = {"lecture_hours": 0.0, "tutorial_hours": 0.0, "practical_hours": 0.0, "credits": 3.0}
    
    # Check for direct 4 numbers in a row
    match = re.search(r'(\d+(?:\.\d+)?)\s*[-|\s]\s*(\d+(?:\.\d+)?)\s*[-|\s]\s*(\d+(?:\.\d+)?)\s*[-|\s]\s*(\d+(?:\.\d+)?)', text)
    if match:
        try:
            res["lecture_hours"] = float(match.group(1))
            res["tutorial_hours"] = float(match.group(2))
            res["practical_hours"] = float(match.group(3))
            res["credits"] = float(match.group(4))
            return res
        except ValueError:
            pass

    # Check for individual labels
    l_m = re.search(r'L\s*[:=-]?\s*(\d+(?:\.\d+)?)', text, re.I)
    t_m = re.search(r'T\s*[:=-]?\s*(\d+(?:\.\d+)?)', text, re.I)
    p_m = re.search(r'P\s*[:=-]?\s*(\d+(?:\.\d+)?)', text, re.I)
    c_m = re.search(r'C\s*[:=-]?\s*(\d+(?:\.\d+)?)', text, re.I)

    if l_m: res["lecture_hours"] = float(l_m.group(1))
    if t_m: res["tutorial_hours"] = float(t_m.group(1))
    if p_m: res["practical_hours"] = float(p_m.group(1))
    if c_m: res["credits"] = float(c_m.group(1))

    return res

def infer_course_category(course_code: str, course_name: str) -> str:
    """
    Categorize course according to AICTE / VFSTR classification:
    BSC: Basic Science Courses (Math, Physics, Chemistry)
    ESC: Engineering Science Courses (Graphics, Basics of EE/EC/CS)
    HSMC: Humanities, Social Sciences and Management Courses (English, Management, Constitution)
    PCC: Professional Core Courses (Core Dept subjects)
    PEC: Professional Elective Courses
    OEC: Open Elective Courses
    PRJ: Project / Internship / Seminar
    AUD: Audit / Non-credit courses
    """
    code = course_code.upper()
    name = course_name.upper()

    if any(k in name for k in ["PROJECT", "INTERNSHIP", "SEMINAR"]):
        return "PRJ"
    if any(k in name for k in ["OPEN ELECTIVE"]):
        return "OEC"
    if any(k in name for k in ["DEPARTMENT ELECTIVE", "PROFESSIONAL ELECTIVE"]):
        return "PEC"
    if any(k in name for k in ["AUDIT", "PHYSICAL FITNESS", "SPORTS", "ORIENTATION"]):
        return "AUD"

    # Prefix heuristics
    if code.startswith(("22MT", "22PY", "22CT", "22CH")):
        return "BSC"
    if code.startswith(("22EN", "22MS", "22HS")):
        return "HSMC"
    if code.startswith("22TP"):
        if "CONSTITUTION" in name or "COMMUNICATION" in name:
            return "HSMC"
        return "ESC"
    if code.startswith(("22ME", "22EE", "22EC", "22CE")) and any(k in name for k in ["BASICS", "GRAPHICS", "MECHANICS"]):
        return "ESC"

    return "PCC"
