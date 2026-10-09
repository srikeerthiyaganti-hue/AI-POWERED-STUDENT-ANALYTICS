import sqlite3
import logging
from contextlib import contextmanager
from pathlib import Path
from app.config import DB_PATH

logger = logging.getLogger("academic_pipeline.database")

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS source_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,          -- 'regulation_pdf', 'curriculum_pdf', 'html_page', 'excel_sheet', 'api_endpoint'
    regulation_code TEXT,                 -- e.g. 'R22', 'R19'
    publication_date TEXT,
    content_hash TEXT NOT NULL,           -- SHA-256 of file/content
    file_path TEXT,
    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    extraction_status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'incremental_skip'
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regulation_code TEXT NOT NULL,        -- 'R22', 'R19', 'R16'
    regulation_name TEXT NOT NULL,        -- e.g. 'VFSTR Academic Regulations R22 (NEP-2020)'
    effective_academic_year TEXT,         -- '2022-2023'
    degree TEXT DEFAULT 'B.Tech',         -- 'B.Tech', 'BBA', 'BCA', 'MBA', 'MCA', 'M.Tech'
    source_document_id INTEGER NOT NULL,
    FOREIGN KEY(source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
    UNIQUE(regulation_code, degree)
);

CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_name TEXT NOT NULL,           -- 'Computer Science and Engineering'
    branch_code TEXT NOT NULL,            -- 'CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'AIML'
    degree TEXT NOT NULL DEFAULT 'B.Tech',-- 'B.Tech', 'BCA', 'BBA'
    regulation_id INTEGER NOT NULL,
    FOREIGN KEY(regulation_id) REFERENCES regulations(id) ON DELETE CASCADE,
    UNIQUE(branch_code, degree, regulation_id)
);

CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    semester_number INTEGER NOT NULL,     -- 1..8
    academic_year TEXT,                   -- 'I Year I Semester'
    FOREIGN KEY(program_id) REFERENCES programs(id) ON DELETE CASCADE,
    UNIQUE(program_id, semester_number)
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT NOT NULL,            -- '22TP105', '22CS201'
    course_name TEXT NOT NULL,            -- 'Problem Solving through Programming - I'
    course_type TEXT DEFAULT 'Theory',    -- 'Theory', 'Laboratory', 'Integrated', 'Project', 'Audit'
    course_category TEXT,                 -- 'BSC', 'ESC', 'PCC', 'PEC', 'OEC', 'HSMC', 'PRJ'
    credits REAL NOT NULL,
    lecture_hours REAL DEFAULT 0,
    tutorial_hours REAL DEFAULT 0,
    practical_hours REAL DEFAULT 0,
    prerequisites TEXT,
    UNIQUE(course_code, course_name)
);

CREATE TABLE IF NOT EXISTS curriculum_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    regulation_id INTEGER NOT NULL,
    source_document_id INTEGER NOT NULL,
    page_reference INTEGER,
    FOREIGN KEY(program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY(regulation_id) REFERENCES regulations(id) ON DELETE CASCADE,
    FOREIGN KEY(source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
    UNIQUE(program_id, semester_id, course_id, regulation_id)
);

CREATE TABLE IF NOT EXISTS syllabus_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    unit_number INTEGER NOT NULL,         -- 1..5
    unit_title TEXT NOT NULL,
    topic_text TEXT NOT NULL,
    learning_outcomes TEXT,
    textbooks TEXT,
    "references" TEXT,
    source_document_id INTEGER NOT NULL,
    page_number INTEGER,
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY(source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
    UNIQUE(course_id, unit_number, source_document_id)
);

CREATE TABLE IF NOT EXISTS crawl_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    pages_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    status TEXT DEFAULT 'RUNNING',        -- 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'
    error_summary TEXT
);

CREATE TABLE IF NOT EXISTS failed_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_document_id INTEGER,
    entity_type TEXT NOT NULL,            -- 'course', 'unit', 'regulation', 'curriculum'
    raw_data TEXT,
    validation_error TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(source_document_id) REFERENCES source_documents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    branch TEXT NOT NULL,
    degree TEXT DEFAULT 'B.Tech',
    regulation TEXT DEFAULT 'R22',
    current_semester INTEGER DEFAULT 1,
    section TEXT DEFAULT 'A',
    mentor_faculty TEXT,
    verification_status TEXT DEFAULT 'VERIFIED',
    data_origin TEXT DEFAULT 'IMPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    academic_year TEXT,
    sgpa REAL,
    cgpa REAL NOT NULL,
    total_credits_earned REAL DEFAULT 0,
    credits_attempted REAL DEFAULT 0,
    active_backlogs INTEGER DEFAULT 0,
    total_backlogs_cleared INTEGER DEFAULT 0,
    trend TEXT DEFAULT 'STABLE',
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS subject_marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_record_id INTEGER REFERENCES academic_records(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    credits REAL DEFAULT 3.0,
    internal_marks REAL,
    external_marks REAL,
    total_marks REAL,
    grade TEXT,
    grade_points REAL,
    is_backlog INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    overall_percentage REAL NOT NULL,
    classes_conducted INTEGER DEFAULT 100,
    classes_attended INTEGER DEFAULT 85,
    is_shortage INTEGER DEFAULT 0,
    is_detained INTEGER DEFAULT 0,
    trend TEXT DEFAULT 'STABLE',
    subject_breakdown_json TEXT,
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS lms_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    logins_per_week REAL DEFAULT 0,
    assignment_completion_pct REAL DEFAULT 0,
    late_submissions_count INTEGER DEFAULT 0,
    hours_spent_per_week REAL DEFAULT 0,
    forum_posts_count INTEGER DEFAULT 0,
    engagement_trend TEXT DEFAULT 'STABLE',
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS student_engagements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    club_name TEXT,
    role TEXT,
    hackathons_count INTEGER DEFAULT 0,
    technical_events_count INTEGER DEFAULT 0,
    extracurricular_count INTEGER DEFAULT 0,
    certifications_count INTEGER DEFAULT 0,
    workshops_count INTEGER DEFAULT 0,
    engagement_score REAL DEFAULT 0,
    details_json TEXT,
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS placement_readiness (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    aptitude_score REAL DEFAULT 0,
    coding_score REAL DEFAULT 0,
    mock_interview_score REAL DEFAULT 0,
    prep_progress_pct REAL DEFAULT 0,
    is_placement_eligible INTEGER DEFAULT 1,
    eligibility_criteria_notes TEXT,
    company_tier_eligibility TEXT,
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS skill_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    programming_proficiency REAL DEFAULT 0,
    problem_solving_score REAL DEFAULT 0,
    technical_core_score REAL DEFAULT 0,
    soft_skills_score REAL DEFAULT 0,
    radar_scores_json TEXT,
    source_provenance TEXT,
    UNIQUE(student_id, semester)
);

CREATE TABLE IF NOT EXISTS feedback_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    feedback_type TEXT DEFAULT 'faculty_counselor',
    sentiment_score REAL DEFAULT 70,
    support_required TEXT DEFAULT 'none',
    remarks TEXT,
    logged_by TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_success_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score REAL NOT NULL,
    performance_tier TEXT NOT NULL,
    academic_component REAL,
    attendance_component REAL,
    lms_component REAL,
    placement_component REAL,
    skills_component REAL,
    engagement_component REAL,
    weights_used_json TEXT,
    available_indicators_json TEXT,
    data_coverage_pct REAL,
    confidence_score_pct REAL,
    positive_factors_json TEXT,
    negative_factors_json TEXT,
    scoring_version TEXT DEFAULT '2.0.0-provisional',
    is_deterministic INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_level TEXT NOT NULL,
    composite_risk_score REAL NOT NULL,
    triggered_rules_json TEXT,
    severity_breakdown_json TEXT,
    is_complete_data INTEGER DEFAULT 1,
    suggested_interventions_json TEXT,
    faculty_review_notes TEXT,
    faculty_review_status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS student_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    segment_code TEXT NOT NULL,
    segment_name TEXT NOT NULL,
    rationale TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS data_import_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL,
    source_name TEXT NOT NULL,
    records_read INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED',
    error_details TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_by TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS data_quality_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_job_id INTEGER REFERENCES data_import_jobs(id) ON DELETE SET NULL,
    dataset_name TEXT NOT NULL,
    total_rows INTEGER DEFAULT 0,
    valid_rows INTEGER DEFAULT 0,
    duplicate_rows INTEGER DEFAULT 0,
    missing_id_rows INTEGER DEFAULT 0,
    validation_errors_json TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp_sync_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portal_url TEXT NOT NULL DEFAULT 'https://erp.vignan.ac.in/student/',
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_status TEXT DEFAULT 'DISCONNECTED',
    last_sync_at TIMESTAMP,
    last_successful_sync_at TIMESTAMP,
    records_synced INTEGER DEFAULT 0,
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'FACULTY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scoring_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_name TEXT NOT NULL UNIQUE,
    academic_weight REAL DEFAULT 0.35,
    attendance_weight REAL DEFAULT 0.20,
    lms_weight REAL DEFAULT 0.15,
    placement_weight REAL DEFAULT 0.15,
    skills_weight REAL DEFAULT 0.10,
    engagement_weight REAL DEFAULT 0.05,
    attendance_threshold REAL DEFAULT 75.0,
    detention_threshold REAL DEFAULT 65.0,
    cgpa_warning_threshold REAL DEFAULT 6.0,
    cgpa_critical_threshold REAL DEFAULT 5.0,
    is_active INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'admin'
);

-- Optimization indexes
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_curriculum_lookup ON curriculum_courses(program_id, semester_id, regulation_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_course ON syllabus_units(course_id);
CREATE INDEX IF NOT EXISTS idx_doc_hash ON source_documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_doc_url ON source_documents(source_url);
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(reg_no);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
CREATE INDEX IF NOT EXISTS idx_academic_student ON academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_success_score_student ON student_success_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_student ON risk_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_segment_student ON student_segments(student_id);
"""

def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Create a SQLite connection with Row factory and foreign keys enabled."""
    conn = sqlite3.connect(str(db_path), timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

@contextmanager
def get_db(db_path: Path = DB_PATH):
    """Context manager for safe database transactions."""
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Transaction rolled back due to error: {e}")
        raise
    finally:
        conn.close()

def init_db(db_path: Path = DB_PATH):
    """Initialize database tables, indexes, and default configurations."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with get_db(db_path) as conn:
        conn.executescript(SCHEMA_SQL)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM scoring_configurations WHERE config_name = 'default'")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO scoring_configurations (config_name, academic_weight, attendance_weight, lms_weight, placement_weight, skills_weight, engagement_weight)
                VALUES ('default', 0.35, 0.20, 0.15, 0.15, 0.10, 0.05)
            """)
        cur.execute("SELECT COUNT(*) FROM erp_sync_configs")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO erp_sync_configs (portal_url, sync_interval_minutes, last_sync_status)
                VALUES ('https://erp.vignan.ac.in/student/', 60, 'DISCONNECTED')
            """)
        cur.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO users (username, password_hash, full_name, email, role)
                VALUES ('admin', 'scrypt$admin$mock', 'Vignan Dean Academic Analytics', 'analytics@vignan.ac.in', 'ADMIN')
            """)
        cur.execute("SELECT COUNT(*) FROM users WHERE username = 'faculty'")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO users (username, password_hash, full_name, email, role)
                VALUES ('faculty', 'scrypt$faculty$mock', 'Dr. Ramesh Kumar (CSE HOD)', 'ramesh.k@vignan.ac.in', 'FACULTY')
            """)
    logger.info(f"Initialized database schema at {db_path}")
