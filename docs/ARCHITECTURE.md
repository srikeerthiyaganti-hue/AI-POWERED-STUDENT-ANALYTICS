# CampusIQ Architecture & Technical Specification

## Overview
**CampusIQ** is an AI-Powered Student Analytics & Success Platform designed to assist academic advisors, faculty, and administrators in identifying at-risk students, tracking multi-factor performance metrics, generating personalized remediation recommendations, and coordinating faculty intervention workflows.

---

## High-Level System Architecture

```text
+-------------------------------------------------------------------------------+
|                               Frontend Tier (React 18 + Vite)                |
|  - Dashboard Overview (KPI Metrics, Recharts Visualizations)                   |
|  - Student Explorer (Directory, Filters, Search, Pagination)                  |
|  - Student Profile Drawer (7-Factor Breakdown, Explainable Risk, Placement)   |
|  - Recommendations View (AI Guidance Cards, Filtering, + Intervene Action)   |
|  - Interventions Management (Table, Stats, Dual-Storage Indicator, CRUD Modal)|
+---------------------------------------+---------------------------------------+
                                        |
                               REST / JSON (Port 5002)
                                        |
+---------------------------------------v---------------------------------------+
|                               Backend API Service (Express.js)               |
|  - Controllers: Analytics, Health, Students, Recommendations, Interventions   |
|  - Services:                                                                  |
|    * Analytics Engine (7-Factor Scoring, Normalization, Coverage Check)       |
|    * Recommendation Engine (Explainable Rules across 8 Dimensions)            |
|    * Intervention Service (Dual-Storage CRUD, Overdue Logic, Stats)           |
|    * Synthetic Data Service (120 Deterministic Students across 3 Branches)   |
+-------------------+---------------------------------------+-------------------+
                    |                                       |
          (MongoDB Connected)                     (Fallback Active)
                    |                                       |
+-------------------v-------------------+   +---------------v-------------------+
|     MongoDB / Mongoose Collections    |   |     In-Memory Fallback Store      |
|  - Students Collection                |   |  - 120 Synthetic Profiles         |
|  - Interventions Collection           |   |  - Ephemeral Interventions Map    |
+---------------------------------------+   +-----------------------------------+
```

---

## Core Algorithms & Engines

### 1. Student Success Score Engine (`analyticsEngine.js`)
The Student Success Score is calculated out of 100 across 7 weighted dimensions:

$$\text{Success Score} = \sum_{i=1}^{7} \left( \text{Normalized Weight}_i \times \text{Dimension Score}_i \right)$$

| Dimension | Base Weight | Data Coverage Rule |
|---|---|---|
| Academic Performance (CGPA, SGPA, Arrears) | **30%** | Critical metric |
| Attendance Rate (Lectures & Labs) | **15%** | Critical threshold at 75% |
| Placement Readiness (Assessments & Mock Interview) | **15%** | Excludes students with unrecorded arrears |
| Technical & Professional Skills | **15%** | Normalized if unrecorded |
| LMS Coursework & Assignments | **10%** | Normalized if unrecorded |
| Student Engagement Index | **10%** | Normalized if unrecorded |
| Mentor Observations & Feedback | **5%** | Normalized if unrecorded |

#### Dynamic Weight Normalization
If a non-critical dimension is unrecorded, its weight is proportionally redistributed across all valid dimensions:

$$W_{\text{effective}, i} = \frac{W_{\text{base}, i}}{\sum_{j \in \text{valid}} W_{\text{base}, j}}$$

#### Data Coverage Safeguard
A minimum of **60% data coverage** is strictly required to produce a valid score. If coverage is below 60% (such as student `241FA04038` with 45%), `isEligibleForScoring: false` is returned, preventing misleading composite scores.

#### Academic Risk Classification
- **High Risk**: Attendance `< 75%`, active backlogs `\ge 2`, or CGPA `< 6.0`.
- **Medium Risk**: Attendance in `[75%, 81.9%]`, active backlogs `= 1`, or CGPA in `[6.0, 6.99]`.
- **Low Risk**: Attendance `\ge 82%`, clean academic record (`0` arrears), and CGPA `\ge 7.0`.

---

### 2. Explainable Recommendation Engine (`recommendationEngine.js`)
Generates prioritized, explainable guidance:
- **Attendance**:
  - `< 75%`: High priority remedial attendance contract.
  - `75%–81.9%`: Medium priority attendance buffer advisory.
- **Academic & Backlogs**:
  - `\ge 2` backlogs: High priority backlog clearance roadmap.
  - `1` backlog: Medium priority subject tutorial referral.
  - `Unrecorded backlogs`: High priority records audit (never assumed 0).
- **Technical & Coding**:
  - Coding `< 60%`: High priority Data Structures & Algorithms bootcamp.
- **Aptitude & Placement**:
  - Aptitude `< 60%`: Medium priority quantitative/reasoning drill.
- **Data Coverage Safeguard**:
  - Coverage `< 60%`: High priority mandatory data verification audit without fabricating performance recommendations.

---

### 3. Faculty Intervention Service (`interventionService.js`)
Manages intervention lifecycles with dual-storage persistence:
- **MongoDB Persistence**: Stored via Mongoose `Intervention` schema with schema validation, indexes on `studentRegistrationNumber`, `status`, and `dueDate`.
- **In-Memory Fallback**: When MongoDB is disconnected, interventions are held in an in-memory repository with pre-seeded demonstration records. Every response includes `storage: { mode: 'synthetic_fallback', isPersistent: false, warning: '...' }` to guarantee transparency.
- **Validation Rules**:
  - Registration number must match regex `/^241FA(04|18|19)\d{3}$/`.
  - Issue and action plan must each have at least 5 characters.
  - Assigned faculty name is required.
  - Due date must be valid; new interventions require future due dates; existing overdue records allow past due dates so ongoing cases can be resolved.
- **Route Order**: `GET /api/interventions/stats` is registered before `GET /api/interventions/:id` to eliminate route parameter shadowing.

---

## API Contracts Summary

```text
GET    /api/health                                 # System health, MongoDB status, fallback mode
GET    /api/analytics/overview                     # Cohort metrics, score averages, distributions
GET    /api/analytics/weights                      # 7-factor weights and normalization rules
GET    /api/students                               # Query: page, limit, search, branch, risk, sort
GET    /api/students/:idOrRegNo                    # Detailed profile with 7-factor score breakdown
GET    /api/students/:idOrRegNo/recommendations    # Recommendations for specific student
GET    /api/recommendations                        # Query: priority, factor, branch, search, page
GET    /api/interventions/stats                    # Summary metrics & storage status
GET    /api/interventions                          # Query: status, priority, branch, student, search
POST   /api/interventions                          # Create intervention (body validation enforced)
GET    /api/interventions/:id                      # Retrieve single intervention
PATCH  /api/interventions/:id                      # Update status, due date, action plan, notes
DELETE /api/interventions/:id                      # Remove intervention
```
