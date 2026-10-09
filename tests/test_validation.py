import unittest
import sqlite3
from app.validator import (
    validate_course_record,
    validate_unit_sequence,
    validate_source_traceability,
    log_failed_record
)
from app.database import get_connection

class TestValidation(unittest.TestCase):
    def test_course_validation(self):
        # Valid course
        valid = {"course_code": "22CS201", "course_name": "DBMS", "credits": 4.0}
        res = validate_course_record(valid)
        self.assertTrue(res.is_valid)

        # Invalid course code
        invalid_code = {"course_code": "1", "course_name": "Test", "credits": 4.0}
        self.assertFalse(validate_course_record(invalid_code).is_valid)

        # Invalid credits
        invalid_cred = {"course_code": "22CS201", "course_name": "DBMS", "credits": 99.0}
        self.assertFalse(validate_course_record(invalid_cred).is_valid)

    def test_unit_sequence_validation(self):
        # Continuous units 1..4
        units = [
            {"unit_number": 1, "unit_title": "Intro", "topic_text": "Text 1"},
            {"unit_number": 2, "unit_title": "Data", "topic_text": "Text 2"},
            {"unit_number": 3, "unit_title": "Trees", "topic_text": "Text 3"},
            {"unit_number": 4, "unit_title": "Graphs", "topic_text": "Text 4"}
        ]
        self.assertTrue(validate_unit_sequence(units).is_valid)

        # Duplicate unit numbers
        dup_units = [
            {"unit_number": 1, "unit_title": "Intro", "topic_text": "Text 1"},
            {"unit_number": 1, "unit_title": "Duplicate", "topic_text": "Text 2"}
        ]
        res_dup = validate_unit_sequence(dup_units)
        self.assertFalse(res_dup.is_valid)
        self.assertIn("Duplicate", res_dup.errors[0])

        # Missing unit in sequence (gap)
        gap_units = [
            {"unit_number": 1, "unit_title": "Intro", "topic_text": "Text 1"},
            {"unit_number": 3, "unit_title": "Skip 2", "topic_text": "Text 3"}
        ]
        res_gap = validate_unit_sequence(gap_units)
        self.assertFalse(res_gap.is_valid)

if __name__ == "__main__":
    unittest.main()
