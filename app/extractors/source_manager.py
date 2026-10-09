import hashlib
import sqlite3
import os
import requests
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from app.config import (
    USER_AGENT,
    REQUEST_TIMEOUT_SECONDS,
    MAX_DOWNLOAD_SIZE_BYTES,
    SAMPLE_DATA_DIR
)
from app.security import validate_url_security

logger = logging.getLogger("academic_pipeline.source_manager")

OFFICIAL_APPROVED_SOURCES = [
    {
        "url": "https://www.vignan.ac.in/r22/R22%20B.Tech%20(CSE)%20Course%20Structure%20and%20Contents.pdf",
        "title": "VFSTR R22 B.Tech (CSE) Course Structure and Contents",
        "type": "curriculum_pdf",
        "regulation": "R22",
        "local_file": "r22_cse.pdf"
    },
    {
        "url": "https://vignan.ac.in/2023pdf/R22%20regulations%20for%20B.Tech.pdf",
        "title": "VFSTR Academic Regulations R22 for B.Tech",
        "type": "regulation_pdf",
        "regulation": "R22",
        "local_file": "r22_btech_regulations.pdf"
    },
    {
        "url": "https://vignan.ac.in/2023pdf/R22%20regulations%20for%20BCA.pdf",
        "title": "VFSTR Academic Regulations R22 for BCA",
        "type": "regulation_pdf",
        "regulation": "R22",
        "local_file": "r22_bca_regulations.pdf"
    },
    {
        "url": "https://vignan.ac.in/2023pdf/R22%20regulations%20for%20BBA.pdf",
        "title": "VFSTR Academic Regulations R22 for BBA",
        "type": "regulation_pdf",
        "regulation": "R22",
        "local_file": "r22_bba_regulations.pdf"
    },
    {
        "url": "https://omega-hnqg.onrender.com/api/subjects",
        "title": "Omega Hackathon Academic Catalog (211 Subjects)",
        "type": "api_endpoint",
        "regulation": "R22",
        "local_file": "backend_subjects.json"
    },
    {
        "url": "https://omega-hnqg.onrender.com/api/degree-requirements",
        "title": "Omega Hackathon Degree & Graduation Requirements",
        "type": "api_endpoint",
        "regulation": "R22",
        "local_file": "backend_degree_requirements.json"
    },
    {
        "url": "https://omega-hnqg.onrender.com/api/graph/curriculum",
        "title": "Omega Hackathon Curriculum Dependency Graph",
        "type": "api_endpoint",
        "regulation": "R22",
        "local_file": "backend_curriculum_graph.json"
    }
]

def calculate_content_hash(data: bytes) -> str:
    """Compute SHA-256 hash of binary content for change detection."""
    return hashlib.sha256(data).hexdigest()

def get_or_register_source(
    conn: sqlite3.Connection,
    url: str,
    title: str,
    document_type: str,
    regulation_code: Optional[str] = None,
    content_bytes: Optional[bytes] = None,
    file_path: Optional[str] = None
) -> Tuple[int, bool]:
    """
    Register source document or check if changed.
    Returns (source_id, is_new_or_modified).
    """
    is_safe, reason = validate_url_security(url)
    if not is_safe:
        raise ValueError(f"Security validation failed for URL '{url}': {reason}")

    content_hash = calculate_content_hash(content_bytes) if content_bytes else "unknown"

    cur = conn.cursor()
    cur.execute(
        "SELECT id, content_hash, extraction_status FROM source_documents WHERE source_url = ?",
        (url,)
    )
    existing = cur.fetchone()

    if existing:
        doc_id = existing["id"]
        old_hash = existing["content_hash"]
        if old_hash == content_hash and existing["extraction_status"] == "processed":
            # No changes detected, skip re-extraction
            cur.execute(
                "UPDATE source_documents SET last_checked_at = CURRENT_TIMESTAMP WHERE id = ?",
                (doc_id,)
            )
            return doc_id, False
        else:
            # Content changed or needs re-extraction
            cur.execute(
                """
                UPDATE source_documents
                SET title = ?, document_type = ?, regulation_code = ?, content_hash = ?,
                    file_path = ?, last_checked_at = CURRENT_TIMESTAMP, extraction_status = 'pending'
                WHERE id = ?
                """,
                (title, document_type, regulation_code, content_hash, file_path, doc_id)
            )
            return doc_id, True
    else:
        # New document
        cur.execute(
            """
            INSERT INTO source_documents (source_url, title, document_type, regulation_code, content_hash, file_path, extraction_status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
            """,
            (url, title, document_type, regulation_code, content_hash, file_path)
        )
        return cur.lastrowid, True

def fetch_document_content(url: str, local_file_fallback: Optional[str] = None) -> bytes:
    """
    Fetch content with safety validation, timeout, and size limits.
    Falls back to cached local copy in sample_data if available.
    """
    # Check if local cached copy exists
    if local_file_fallback:
        cached_path = SAMPLE_DATA_DIR / local_file_fallback
        if cached_path.exists() and cached_path.stat().st_size > 0:
            logger.info(f"Using verified local cached copy: {cached_path}")
            return cached_path.read_bytes()

    is_safe, reason = validate_url_security(url)
    if not is_safe:
        raise ValueError(f"SSRF / Allowlist violation: {reason}")

    headers = {"User-Agent": USER_AGENT}
    with requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS, stream=True) as resp:
        resp.raise_for_status()
        content = bytearray()
        for chunk in resp.iter_content(chunk_size=64*1024):
            content.extend(chunk)
            if len(content) > MAX_DOWNLOAD_SIZE_BYTES:
                raise ValueError(f"Document at {url} exceeded size limit ({MAX_DOWNLOAD_SIZE_BYTES} bytes)")
        return bytes(content)
