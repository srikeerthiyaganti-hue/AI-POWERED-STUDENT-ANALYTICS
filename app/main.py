from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse

from app.api.academic_routes import router as academic_router
from app.api.analytics_routes import router as analytics_router
from app.database import init_db, get_db

app = FastAPI(
    title="Smart Campus Analytics — AI Student Success Platform",
    description="Explainable, source-traceable Vignan academic analytics, at-risk identification, and student success platform REST API.",
    version="2.2.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Mount static assets directory
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root(request: Request):
    """Serve SPA dashboard for browser navigation; JSON for API clients."""
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        index_file = Path("static/index.html")
        if index_file.exists():
            return FileResponse(index_file)
    return {
        "service": "VFSTR Academic Knowledge Base & Student Success API",
        "version": "2.2.0",
        "institution": "Vignan's Foundation for Science, Technology and Research (VFSTR)",
        "frontend": "/dashboard",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/dashboard")
def dashboard():
    """Direct URL to the interactive Student Analytics & Success Platform web application."""
    index_file = Path("static/index.html")
    if index_file.exists():
        return FileResponse(index_file)
    return FileResponse("static/index.html")

@app.get("/api")
def api_info():
    return {
        "service": "VFSTR Academic Knowledge Base API",
        "version": "2.2.0",
        "institution": "Vignan's Foundation for Science, Technology and Research (VFSTR)",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health():
    db_ok = False
    stats = {}
    try:
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) as cnt FROM courses")
            stats["courses_count"] = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM syllabus_units")
            stats["units_count"] = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM source_documents")
            stats["sources_count"] = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM students")
            stats["students_count"] = cur.fetchone()["cnt"]
            db_ok = True
    except Exception as e:
        stats["db_error"] = str(e)

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database_connected": db_ok,
        "database_stats": stats
    }

app.include_router(academic_router)
app.include_router(analytics_router)

