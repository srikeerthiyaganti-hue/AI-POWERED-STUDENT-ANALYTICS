# CODEBUFFET — Local Execution & Operator Run Guide
**Platform:** CODEBUFFET Smart Campus Decision Intelligence  
**Execution Environment:** Pure Localhost (Windows / Linux / macOS)  
**Ports:** Backend: `http://localhost:8000` | Frontend: `http://localhost:3000`  
**Date:** October 10, 2026  

---

## 1. Prerequisites
- **Python:** 3.11, 3.12, or 3.14 with `pip`
- **Node.js:** v18+ (verified on Node v24) with `npm`
- **Git:** Present on system (no Git operations will be performed)

---

## 2. Fast Startup Instructions

### Terminal 1: Backend Service (FastAPI)
```powershell
# Navigate to repository root
cd C:\Users\Lenovo\Downloads\CODEBUFFET-git

# Run FastAPI backend with Uvicorn on Port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- Health Check: `http://127.0.0.1:8000/api/health`
- Swagger Interactive Documentation: `http://127.0.0.1:8000/docs`

### Terminal 2: Frontend Service (React + Vite)
```powershell
# Navigate to Frontend directory
cd C:\Users\Lenovo\Downloads\CODEBUFFET-git\Frontend

# Start Vite Development Server on Port 3000
npm run dev -- --port 3000
```
- Application UI: `http://localhost:3000`

---

## 3. Verified Multi-Role Login Credentials

| Role | Name | Identifier (Email or ID) | Password | Target Dashboard |
|---|---|---|---|---|
| **Institutional Admin** | Dr. R. Kumar | `admin@codebuffet.edu` | `CodeBuffet@2026!` | `/institution/dashboard` |
| **Faculty Mentor (CSE)** | Prof. Rajesh Kumar | `rajesh.kumar@codebuffet.edu` | `Mentor@2026!` | `/mentor/dashboard` |
| **Faculty Mentor (ECE)** | Dr. Sunita Sharma | `sunita.sharma@codebuffet.edu` | `Mentor@2026!` | `/mentor/dashboard` |
| **Faculty Mentor (MECH)** | Prof. K. Murthy | `k.murthy@codebuffet.edu` | `Mentor@2026!` | `/mentor/dashboard` |
| **Placement Officer (TPO)**| Vikram Malhotra | `vikram.tpo@codebuffet.edu` | `TPO@2026!` | `/placement/dashboard` |
| **Enrolled Student** | Aarav Sharma | `STU-2024-042` or `aarav.sharma@codebuffet.edu` | `Student@2026!` | `/student/dashboard` |

> [!TIP]
> The top demo persistent bar on all dashboards allows instantaneous one-click switching between Admin, Mentor, Placement, and Student views for streamlined evaluator inspection.

---

## 4. Automated Testing Commands

### Backend Test Suite (24 Integration Tests)
```powershell
cd C:\Users\Lenovo\Downloads\CODEBUFFET-git
python -m pytest tests/
```
Expected Output: `24 passed in ~12s (100% success rate)`.

### Frontend Production Build
```powershell
cd C:\Users\Lenovo\Downloads\CODEBUFFET-git\Frontend
npm run build
```
Expected Output: `built in ~6s (0 errors)`.

---

## 5. Key Verification Checkpoints for Evaluators
1. **Canonical Student Data Reconciliation:**
   - On the Executive Overview, observe the **Data Reconciliation Audit** reporting 8 Verified Profiles (University Registrar) and 50,000 Benchmark Records (kaggle.csv).
   - In the Student Directory, click the roster switcher buttons: "Verified Profiles (8)", "Benchmark Cohort (50,000)", and "All Records (50,008)".
2. **Differentiator 1 — 3D Student Success Digital Twin:**
   - Toggle between **3D Coordinate Space** (drag-to-rotate scatter plot mapping Attendance, Success Score, and CGPA) and **3D Campus Hotspots** (panoramic campus model with interactive nodes).
3. **Differentiator 2 — Decoupled Risk Intelligence:**
   - Click any quadrant in the 2-axis risk matrix (e.g., "Exam Toppers with Skill Gap") to immediately filter the student roster.
4. **Differentiator 3 — Intervention Impact Simulator:**
   - Adjust the Attendance, DSA, and LMS sliders and observe the real-time recalculated students rescued count and placement readiness improvement.
5. **Differentiator 4 — 6-Factor Success Score:**
   - Inspect any student in the directory to view the 6-factor radar and linear score weights.
6. **Differentiator 5 — Guided At-Risk Recovery Walkthrough:**
   - Click "Launch Walkthrough" in the left sidebar to step through the 5 interactive recovery stages for student `STU-2024-001` (Rajesh Kumar).
