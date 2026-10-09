from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class SourceDocumentBase(BaseModel):
    source_url: str
    title: str
    document_type: str
    regulation_code: Optional[str] = None
    publication_date: Optional[str] = None
    content_hash: str
    file_path: Optional[str] = None

class SourceDocumentCreate(SourceDocumentBase):
    pass

class SourceDocumentOut(SourceDocumentBase):
    id: int
    last_checked_at: Optional[str] = None
    extraction_status: str
    error_message: Optional[str] = None

class RegulationBase(BaseModel):
    regulation_code: str
    regulation_name: str
    effective_academic_year: Optional[str] = None
    degree: str = "B.Tech"

    @field_validator("regulation_code")
    def validate_code(cls, v):
        code = v.strip().upper()
        if not code:
            raise ValueError("Regulation code cannot be empty")
        return code

class RegulationCreate(RegulationBase):
    source_document_id: int

class RegulationOut(RegulationBase):
    id: int
    source_document_id: int

class ProgramBase(BaseModel):
    program_name: str
    branch_code: str
    degree: str = "B.Tech"

    @field_validator("branch_code")
    def validate_branch(cls, v):
        b = v.strip().upper()
        if not b:
            raise ValueError("Branch code cannot be empty")
        return b

class ProgramCreate(ProgramBase):
    regulation_id: int

class ProgramOut(ProgramBase):
    id: int
    regulation_id: int

class SemesterBase(BaseModel):
    semester_number: int = Field(ge=1, le=10)
    academic_year: Optional[str] = None

class SemesterCreate(SemesterBase):
    program_id: int

class SemesterOut(SemesterBase):
    id: int
    program_id: int

class CourseBase(BaseModel):
    course_code: str
    course_name: str
    course_type: str = "Theory"
    course_category: Optional[str] = None
    credits: float = Field(ge=0.0, le=30.0)
    lecture_hours: float = Field(ge=0.0, default=0.0)
    tutorial_hours: float = Field(ge=0.0, default=0.0)
    practical_hours: float = Field(ge=0.0, default=0.0)
    prerequisites: Optional[str] = None

    @field_validator("course_code")
    def validate_course_code(cls, v):
        v_clean = v.strip().upper()
        if not v_clean or len(v_clean) < 3:
            raise ValueError(f"Invalid course code: {v}")
        return v_clean

    @field_validator("course_name")
    def validate_course_name(cls, v):
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Course name cannot be empty")
        return v_clean

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: int

class CurriculumCourseCreate(BaseModel):
    program_id: int
    semester_id: int
    course_id: int
    regulation_id: int
    source_document_id: int
    page_reference: Optional[int] = None

class CurriculumCourseOut(BaseModel):
    id: int
    program_id: int
    semester_id: int
    course_id: int
    regulation_id: int
    source_document_id: int
    page_reference: Optional[int] = None
    course: Optional[CourseOut] = None

class SyllabusUnitBase(BaseModel):
    unit_number: int = Field(ge=1, le=10)
    unit_title: str
    topic_text: str
    learning_outcomes: Optional[str] = None
    textbooks: Optional[str] = None
    references: Optional[str] = None
    page_number: Optional[int] = None

    @field_validator("unit_title", "topic_text")
    def validate_non_empty(cls, v):
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Field cannot be empty")
        return v_clean

class SyllabusUnitCreate(SyllabusUnitBase):
    course_id: int
    source_document_id: int

class SyllabusUnitOut(SyllabusUnitBase):
    id: int
    course_id: int
    source_document_id: int

class CrawlRunOut(BaseModel):
    id: int
    started_at: str
    finished_at: Optional[str] = None
    pages_processed: int
    records_created: int
    records_updated: int
    records_rejected: int
    status: str
    error_summary: Optional[str] = None

class AIContextCitation(BaseModel):
    course_code: str
    course_name: str
    unit_number: Optional[int] = None
    unit_title: Optional[str] = None
    source_url: str
    document_title: str
    page_number: Optional[int] = None

class AIContextResponse(BaseModel):
    query: str
    matched_courses: int
    context_text: str
    citations: List[AIContextCitation]
    found_in_verified_sources: bool
