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
from backend.routes.placement_routes import router as placement_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_initial_data()
    yield


app = FastAPI(
    title="CODEBUFFET — Student Success Intelligence API",
    description=(
        "Backend service providing authentication, student telemetry, "
        "ML risk predictions, institution analytics, and placement pipeline.\n\n"
        "### How to Authenticate in Swagger UI:\n"
        "1. Open **POST /api/auth/login** below and click **Try it out**.\n"
        "2. Provide your credentials (e.g. `admin@codebuffet.edu` / `CodeBuffet@2026!` or `rajesh.kumar@codebuffet.edu` / `Mentor@2026!`).\n"
        "3. Copy the returned `access_token`.\n"
        "4. Click the green **Authorize** button at the top right of this page.\n"
        "5. Enter the token into the **Value** field and click **Authorize**.\n"
        "6. All protected endpoints will automatically include the `Authorization: Bearer <token>` header."
    ),
    version="2.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)

# Allowed Origins for CORS

# Allowed Origins for CORS
ALLOWED_ORIGINS = [
    # Render production frontend
    "https://ai-powered-student-analytics-frontend.onrender.com",

    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production Vercel domains
    "https://ai-powered-student-analytics.vercel.app",
    "https://ai-powered-student-analytics-srikeerthiyaganti-hue.vercel.app",
    "https://ai-powered-student-analytics-three.vercel.app",
    "https://ai-powered-student-analytics-g5yyvnry9-srikeerthiyaganti-hue.vercel.app",
    "https://ai-powered-student-analytics-qcqmmkbec-srikeerthiyaganti-hue.vercel.app",

    # Render Deployments
    "https://ai-powered-student-analytics-frontend.onrender.com",
    "https://ai-powered-student-analytics.onrender.com",
]

# Optional environment override from Render
_env_frontend = os.getenv("FRONTEND_URL", "").strip()
if _env_frontend and _env_frontend not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(_env_frontend)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|https://ai-powered-student-analytics(-[a-zA-Z0-9_-]+)?\.vercel\.app|https://.*\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(institution_router)
app.include_router(student_router)
app.include_router(placement_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "platform": "CODEBUFFET Student Success Intelligence Platform",
        "version": "2.0.0",
        "engine": "FastAPI + LightGBM ML Pipeline",
        "database": "SQLite Operational",
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port)
