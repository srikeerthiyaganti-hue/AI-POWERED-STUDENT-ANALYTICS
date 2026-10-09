"""
CODEBUFFET — FastAPI Main Application Entrypoint
Student Success Intelligence Platform Backend Service
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, seed_initial_data
from backend.routes.auth_routes import router as auth_router
from backend.routes.institution_routes import router as institution_router
from backend.routes.student_routes import router as student_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and development seed accounts on startup
    init_db()
    seed_initial_data()
    yield


app = FastAPI(
    title="CODEBUFFET — Student Success Intelligence API",
    description="Backend service providing authentication, student telemetry, ML risk predictions, and institution analytics.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware configured for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth_router)
app.include_router(institution_router)
app.include_router(student_router)


@app.get("/api/health")
async def health_check():
    """System health check and diagnostic status."""
    return {
        "status": "healthy",
        "platform": "CODEBUFFET Student Success Intelligence Platform",
        "version": "2.0.0",
        "engine": "FastAPI + LightGBM ML Pipeline",
        "database": "SQLite Operational"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
