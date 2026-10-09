import sqlite3
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.models import AIContextResponse, AIContextCitation

def retrieve_ai_context(
    query: str,
    branch_code: Optional[str] = None,
    semester_number: Optional[int] = None,
    regulation_code: Optional[str] = "R22",
    limit: int = 5
) -> AIContextResponse:
    """
    Retrieves grounded academic syllabus context and official source citations for the AI advisor.
    Adheres strictly to the requirement:
    'The AI must not present unsupported statements as official Vignan rules.
     If the database does not contain the answer, clearly state that the information was not found in the verified sources.'
    """
    clean_query = query.strip()
    citations: List[AIContextCitation] = []
    context_blocks: List[str] = []

    sql = """
        SELECT DISTINCT
            c.course_code,
            c.course_name,
            c.credits,
            c.lecture_hours,
            c.tutorial_hours,
            c.practical_hours,
            c.prerequisites,
            c.course_category,
            p.branch_code,
            s.semester_number,
            r.regulation_code,
            su.unit_number,
            su.unit_title,
            su.topic_text,
            su.textbooks,
            su."references",
            su.page_number,
            sd.source_url,
            sd.title as document_title
        FROM courses c
        JOIN curriculum_courses cc ON c.id = cc.course_id
        JOIN programs p ON cc.program_id = p.id
        JOIN semesters s ON cc.semester_id = s.id
        JOIN regulations r ON cc.regulation_id = r.id
        JOIN source_documents sd ON cc.source_document_id = sd.id
        LEFT JOIN syllabus_units su ON c.id = su.course_id
        WHERE (
            c.course_code LIKE ?
            OR c.course_name LIKE ?
            OR su.unit_title LIKE ?
            OR su.topic_text LIKE ?
        )
    """
    params: List[Any] = [
        f"%{clean_query}%",
        f"%{clean_query}%",
        f"%{clean_query}%",
        f"%{clean_query}%"
    ]

    if regulation_code:
        sql += " AND r.regulation_code = ?"
        params.append(regulation_code.upper())
    if branch_code:
        sql += " AND p.branch_code = ?"
        params.append(branch_code.upper())
    if semester_number:
        sql += " AND s.semester_number = ?"
        params.append(int(semester_number))

    sql += " ORDER BY c.course_code ASC, su.unit_number ASC LIMIT ?"
    params.append(limit * 5)

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    if not rows:
        return AIContextResponse(
            query=clean_query,
            matched_courses=0,
            context_text="Information not found in the verified Vignan academic sources.",
            citations=[],
            found_in_verified_sources=False
        )

    # Group by course
    courses_seen = set()
    for row in rows:
        c_code = row["course_code"]
        c_name = row["course_name"]
        courses_seen.add(c_code)

        unit_str = f"Unit {row['unit_number']}: {row['unit_title']}" if row["unit_number"] else "Overview"
        page_str = f"Page {row['page_number']}" if row["page_number"] else "Curriculum Catalog"

        citation = AIContextCitation(
            course_code=c_code,
            course_name=c_name,
            unit_number=row["unit_number"],
            unit_title=row["unit_title"],
            source_url=row["source_url"],
            document_title=row["document_title"],
            page_number=row["page_number"]
        )
        citations.append(citation)

        block = (
            f"--- [VERIFIED VIGNAN SOURCE] ---\n"
            f"Course: {c_code} - {c_name} ({row['credits']} Credits)\n"
            f"Regulation: {row['regulation_code']} | Branch: {row['branch_code']} | Semester: {row['semester_number']}\n"
            f"Hours: L:{row['lecture_hours']}, T:{row['tutorial_hours']}, P:{row['practical_hours']}\n"
            f"Prerequisites: {row['prerequisites'] or 'None explicitly required'}\n"
            f"Source Document: {row['document_title']} ({page_str})\n"
            f"URL: {row['source_url']}\n"
        )
        if row["unit_number"]:
            block += (
                f"Syllabus {unit_str}:\n{row['topic_text']}\n"
            )
            if row["textbooks"]:
                block += f"Prescribed Textbooks: {row['textbooks']}\n"

        context_blocks.append(block)

    full_context = "\n\n".join(context_blocks[:limit])

    return AIContextResponse(
        query=clean_query,
        matched_courses=len(courses_seen),
        context_text=full_context,
        citations=citations[:limit],
        found_in_verified_sources=True
    )
