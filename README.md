# CODEBUFFET — Student Success Intelligence Platform
### Analytics & AI-Powered Decision Support for Higher Education Institutions

**Hackathon:** HacXLerate 2026  
**Platform Name:** CODEBUFFET  
**Stack:** React (Vite) + Vanilla CSS Design Tokens + FastAPI + LightGBM + SQLite  
**Design Reference:** STITH Plan UI/UX Architecture + 3D Campus Experience  

---

## 1. Executive Summary

**CODEBUFFET** is a next-generation Student Success Intelligence and Decision Support Platform built for universities and technical institutions. Rather than operating as a passive dashboard, CODEBUFFET synthesizes multi-dimensional campus data across seven key domains to provide transparent, explainable success scores, early academic risk detection, and placement readiness intelligence.

### Key Capabilities
- **3D Spatial Campus Experience:** Interactive digital twin with realistic perspective depth, holographic HUD cards, and clickable building hotspots revealing real-time department telemetry.
- **Dual Role-Based Cockpits:**
  - **Institution Portal:** STITH Plan-inspired dashboard featuring high-contrast panoramic campus hero, 4 KPI cards with sparklines, Recharts trend and distribution analytics, alert feeds, and four interactive feature modals (Student Directory, Intervention Sandbox, AI Copilot, 3D Experience).
  - **Student Cockpit:** Personalized cockpit with Student Success Score breakdown, interactive "What-If" score simulator slider, and checkable mentoring action items.
- **Enterprise Security & Authentication:**
  - Fast, cryptographically secure password hashing using NIST-approved PBKDF2-HMAC-SHA256 with unique 16-byte random salts (100,000 iterations).
  - Signed JWT access tokens with role validation (`admin`, `mentor`, `tpo`, `student`).
  - Strict prevention of hardcoded production credentials, zero exposed secrets, and environment variable configuration (`.env.example`).
  - Transparent credential governance and reset policy.

---

## 2. Seven Unified Student Data Domains

CODEBUFFET unifies all seven multidimensional data domains mandated for comprehensive student evaluation:

| # | Domain | Core Indicators & Telemetry | Weight |
|---|---|---|---|
| 1 | **Academic Performance** | CGPA, active arrears, semester marks, historical backlogs | 35% |
| 2 | **Placement Readiness** | Aptitude score, coding assessment, DSA benchmarks, mock interviews | 20% |
| 3 | **Attendance Consistency** | Overall attendance percentage (statutory 75% threshold), subject attendance | 15% |
| 4 | **LMS Telemetry** | Weekly login frequency, assignment velocity, resource consumption | 12% |
| 5 | **Technical & Communication Skills** | System design ratings, coding skills, communication evaluation | 10% |
| 6 | **Campus Engagement** | Hackathon participation, technical certifications, club leadership | 8% |
| 7 | **Faculty Feedback** | Mentorship reviews, semester faculty feedback evaluations | Advisory |

---

## 3. Machine Learning & Predictive Analytics Pipeline

- **Empirical Training Dataset:** 50,000 verified student records (`kaggle.csv`) with 17 engineered features.
- **Placement Risk Model:** LightGBM supervised gradient-boosted decision tree predicting placement conversion probabilities with calibrated thresholds.
- **Independent Academic Risk Evaluation:** Fully resolved model binary duplication by evaluating academic hazard independently across active backlogs, statutory attendance shortage (<75%), and CGPA probation risk.
- **Student Success Score Formula:** Transparent composite calculation (0 to 100) combining normalized performance factors across all 6 weighted dimensions.

---

## 4. Quick Start & Local Setup

### Prerequisites
- **Node.js:** v18+ (verified on v24)
- **Python:** 3.10+ (verified on 3.11)

### 1. Backend Service (FastAPI)
```bash
# From repository root
# 1. Copy environment template
copy .env.example .env

# 2. Initialize database schema & seed initial accounts
python -m backend.seed

# 3. Start the FastAPI backend (Port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Application (React + Vite)
```bash
# Navigate to Frontend directory
cd Frontend

# 1. Install dependencies
npm install

# 2. Launch development server (Port 3000)
npm run dev
```

Visit the application at: **http://localhost:3000**  
API Documentation (Swagger UI): **http://localhost:8000/docs**

---

## 5. Preconfigured Development & Demonstration Personas

For evaluation and hackathon demonstrations, the following accounts are initialized with PBKDF2 hashed credentials:

| Persona | Role | Email / ID | Default Seed Password |
|---|---|---|---|
| **Dr. R. Kumar** | Institution Admin | `admin@codebuffet.edu` | `CodeBuffet@2026!` |
| **Aarav Sharma** | Student (3rd Year B.Tech) | `STU-2024-042` / `aarav.sharma@codebuffet.edu` | `Student@2026!` |
| **Prof. Rajesh Kumar** | Faculty Mentor | `rajesh.kumar@codebuffet.edu` | `Mentor@2026!` |
| **Vikram Malhotra** | Placement Director | `vikram.tpo@codebuffet.edu` | `TPO@2026!` |

*(Note: Passwords can be customized via `.env` before running `python -m backend.seed`.)*

---

## 6. Backend API Specification

- `GET  /api/health` — System status, database health, and ML pipeline diagnostic.
- `POST /api/auth/login` — PBKDF2 hash verification and signed JWT token issuance.
- `POST /api/auth/logout` — Session termination acknowledgment.
- `GET  /api/auth/me` — Bearer-token validated user profile.
- `GET  /api/institution/summary` — Aggregate dataset metrics across 50,000 students.
- `GET  /api/institution/departments` — Department-wise success and placement benchmarks.
- `GET  /api/institution/students` — Paginated and searchable student records with predicted risk probabilities.
- `GET  /api/institution/interventions` — Active administrative priorities and interventions.
- `GET  /api/student/dashboard` — Personal student cockpit telemetry and assigned tasks.
- `POST /api/student/simulate` — Dynamic What-If score calculator.
- `POST /api/student/tasks/{id}/toggle` — Interactive task status completion update.

---

## 7. Automated Test Suite

Run the full backend and ML integration test suite:
```bash
python tests/test_backend.py
```
**Results:** 12/12 test suites passing (Health, Admin Auth, Student Auth, Roll ID Auth, Invalid Credentials, Role Isolation, Dataset Aggregation, Department Metrics, Student Filters, Cockpit Telemetry, What-If Simulator, Logout).
