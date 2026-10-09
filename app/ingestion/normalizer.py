import re
from typing import Dict, Any, Optional, Tuple

DEPARTMENT_MAP = {
    "CSE": "Computer Science & Engineering",
    "IT": "Information Technology",
    "AIML": "Artificial Intelligence & Machine Learning",
    "CSCS": "Cyber Security & Computer Science",
    "MECH": "Mechanical Engineering",
    "CIVIL": "Civil Engineering",
    "ECE": "Electronics & Communication Engineering",
    "EEE": "Electrical & Electronics Engineering",
    "BBA": "Bachelor of Business Administration",
    "BCA": "Bachelor of Computer Applications",
}

def normalize_reg_no(raw_val: Any) -> Optional[str]:
    """Normalize and validate student registration number."""
    if not raw_val:
        return None
    val = str(raw_val).strip().upper()
    # Remove leading/trailing quotes or whitespace
    val = val.replace('"', '').replace("'", "")
    
    # Check standard Vignan format: e.g., 231FA04128 or REG1001
    if re.match(r"^\d{2}1FA[0-9A-Z]{5}$", val) or re.match(r"^REG\d{3,6}$", val):
        return val
    return val if len(val) >= 4 else None

def normalize_name(raw_name: Any, reg_no: str) -> Tuple[str, bool, Optional[str]]:
    """
    Clean and validate student name.
    Returns: (cleaned_name, is_malformed, issue_description)
    """
    if not raw_name:
        return f"Student ({reg_no})", True, "MISSING_NAME"
    name = str(raw_name).strip()
    
    # Check if name is placeholder like 'Student (231FA04128)'
    if name.lower().startswith("student (") or name.lower() == "student":
        return name, True, "PLACEHOLDER_NAME"
    
    # Check if institutional entity name was accidentally scraped
    college_keywords = ["college", "junior college", "school", "academy", "institute", "university"]
    if any(kw in name.lower() for kw in college_keywords):
        return name, True, "INSTITUTIONAL_NAME_IN_STUDENT_FIELD"
    
    # Clean multiple spaces
    name = re.sub(r"\s+", " ", name)
    return name, False, None

def normalize_branch(raw_branch: Any) -> str:
    """Normalize branch / department code."""
    if not raw_branch:
        return "CSE"
    b = str(raw_branch).strip().upper()
    for code, full_name in DEPARTMENT_MAP.items():
        if b == code or b == full_name.upper() or code in b or full_name.upper() in b:
            return code
    return b

def normalize_cgpa(raw_cgpa: Any) -> float:
    """Normalize CGPA to float [0.0, 10.0]."""
    if raw_cgpa is None:
        return 0.0
    try:
        val = float(raw_cgpa)
        return max(0.0, min(10.0, round(val, 2)))
    except (ValueError, TypeError):
        return 0.0

def normalize_percentage(raw_val: Any) -> Optional[float]:
    """Normalize attendance or score percentage to float [0.0, 100.0]."""
    if raw_val is None or raw_val == "" or str(raw_val).strip() == "[Not Available in Source]":
        return None
    try:
        val = float(str(raw_val).replace("%", "").strip())
        return max(0.0, min(100.0, round(val, 1)))
    except (ValueError, TypeError):
        return None

def normalize_semester(raw_sem: Any) -> int:
    """Normalize semester number 1..8."""
    if raw_sem is None:
        return 1
    try:
        s = int(str(raw_sem).strip())
        return max(1, min(8, s))
    except (ValueError, TypeError):
        return 1
