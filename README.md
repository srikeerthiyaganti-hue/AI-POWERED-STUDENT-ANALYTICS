# CampusIQ — AI-Powered Student Analytics & Success Platform

CampusIQ is an intelligent student analytics, early-warning, and intervention-tracking platform designed for higher education institutions. It aggregates academic performance, attendance, assignment completion, placement readiness, and qualitative faculty feedback to help educators deliver timely, explainable interventions for at-risk students before critical academic milestones.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast, responsive single-page application |
| **Styling** | Plain CSS | Modern custom design system with CSS custom properties |
| **Charts** | Recharts | Departmental enrollment, risk distribution, and readiness graphs |
| **Icons** | Lucide React | Clean, modern iconography |
| **Backend** | Node.js (ESM) + Express.js | Modular REST API service on port `5002` |
| **Database** | MongoDB + Mongoose | Scalable document data store with transparent fallback |
| **Analytics Engine** | Custom 7-Factor Scoring | Transparent Student Success Score (/100) with weight normalization |
| **Recommendation Engine**| Explainable AI Rules | Explainable, prioritized recommendations across 8 dimensions |
| **Interventions** | Dual-Storage CRUD | MongoDB persistent model with in-memory fallback & stats tracking |
| **Testing** | Node.js built-in test runner | Native `node:test` suite (65 passing automated tests) |

---

## Project Structure

```text
CampusIQ-Hackathon/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── components/
│       │   ├── AnalyticsCharts.jsx       # Recharts visualizations (Risk, Dept, Placement)
│       │   ├── InterventionModal.jsx     # Intervention creation & edit dialog with validation
│       │   ├── MetricCard.jsx            # KPI metric cards
│       │   ├── StudentDetailModal.jsx    # Slide-over drawer with 7-factor breakdown & interventions
│       │   └── StudentExplorer.jsx       # Filterable student records directory with search & pagination
│       ├── layouts/
│       │   └── MainLayout.jsx            # Responsive layout with sidebar navigation & live status
│       ├── pages/
│       │   ├── DashboardHome.jsx         # Executive dashboard & cohort overview
│       │   ├── InterventionsView.jsx     # Faculty intervention tracking & case management
│       │   └── RecommendationsView.jsx   # AI-guided cohort recommendations directory
│       ├── services/
│       │   └── api.js                    # Comprehensive fetch client with error handling
│       ├── utils/
│       │   └── formatters.js
│       ├── App.jsx                       # Top-level routing & state coordination
│       ├── App.css                       # Complete application design system
│       ├── index.css
│       └── main.jsx
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # Resilient DB connection with synthetic fallback
│   │   ├── controllers/
│   │   │   ├── analyticsController.js    # Cohort statistics & scoring weights
│   │   │   ├── healthController.js       # Health status & database mode reporter
│   │   │   ├── interventionController.js # Interventions CRUD & statistics
│   │   │   ├── recommendationController.js # Student & cohort recommendation generators
│   │   │   └── studentController.js      # Student listings, search, & profile details
│   │   ├── middleware/
│   │   │   └── errorHandler.js           # 404 & error handlers
│   │   ├── models/
│   │   │   ├── Intervention.js           # Mongoose intervention schema with validation
│   │   │   └── Student.js                # Mongoose student schema
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js        # /api/analytics routes
│   │   │   ├── healthRoutes.js           # /api/health and /health routes
│   │   │   ├── interventionRoutes.js     # /api/interventions routes (/stats registered first)
│   │   │   ├── recommendationRoutes.js   # /api/recommendations routes
│   │   │   └── studentRoutes.js          # /api/students routes
│   │   ├── services/
│   │   │   ├── analyticsEngine.js        # 7-factor scoring, risk & placement classifiers
│   │   │   ├── interventionService.js    # Dual-storage CRUD service with pre-seeded data
│   │   │   ├── recommendationEngine.js   # Explainable recommendation rules & safeguards
│   │   │   └── syntheticDataService.js   # 120 deterministic synthetic students
│   │   ├── utils/
│   │   │   └── logger.js                 # Structured console logger
│   │   ├── app.js                        # Express application & CORS configuration
│   │   └── server.js                     # Server entrypoint on port 5002
│   └── tests/
│       ├── analytics.test.js             # Scoring engine unit tests
│       ├── health.test.js                # Health & CORS endpoint tests
│       ├── interventions.test.js         # Interventions API & validation tests
│       ├── recommendations.test.js       # Recommendation engine unit & API tests
│       └── students.test.js              # Student directory & analytics tests
├── docs/
│   └── ARCHITECTURE.md                   # System architecture & Phase 1–4 contracts
├── .gitignore
├── .env.example
└── README.md
```

---

## Features & Implementation

### 1. Student Success Score Engine (Phase 2)
- **Transparent 7-Factor Model**:
  - Academic Performance: **30%**
  - Attendance: **15%**
  - Placement Readiness: **15%**
  - Technical & Professional Skills: **15%**
  - LMS Coursework & Assignments: **10%**
  - Student Engagement: **10%**
  - Mentor Observations: **5%**
- **Dynamic Weight Normalization**: Missing non-critical fields redistribute weight proportionally across valid indicators.
- **Data Coverage Safeguard**: Profiles with `< 60%` data coverage (e.g., student `241FA04038` at 45%) receive `isEligibleForScoring: false` and are flagged for mandatory departmental verification.
- **Arrears Integrity**: Distinguishes 0 backlogs (clean record) from unrecorded backlogs (`null`). Unrecorded arrears prevent `Job Ready` placement status.

### 2. Interactive Analytics Dashboard (Phase 3)
- Live KPI summary cards (Total Students, Mean Success Score, High Risk, Job Ready).
- Visual charts powered by Recharts (Academic Risk Tiers, Departmental Distributions, Placement Benchmarks).
- Student Explorer with real-time text search, department filtering (CSE `04`, AIML `18`, Cybersecurity `19`), risk status filtering, and sorting.
- Slide-over profile drawer with complete 7-factor breakdown tables, explainable risk reasons, and placement recommendations.

### 3. Explainable AI Recommendations (Phase 4)
- Generates tailored, actionable guidance across 8 dimensions: Academic, Attendance, Coding, Aptitude, Placement, LMS, Data Verification, and Mentor.
- Enforces strict safeguards: missing test data triggers data audits rather than fabricated low performance.
- Direct conversion: single-click `+ Create Intervention Plan` button pre-fills the intervention modal from any recommendation.

### 4. Faculty Intervention Tracking (Phase 4)
- Comprehensive case management lifecycle: `Pending` &rarr; `In Progress` &rarr; `Completed`.
- Server-side validation: required faculty assignment, non-empty issue/action plans, future due date for new records.
- Overdue integrity: past due dates permitted for existing records so overdue remediation plans can be actively tracked, updated, and completed.
- Dual storage architecture:
  - Persistent MongoDB collection when database is connected.
  - Transparent in-memory development repository when running in synthetic fallback mode with explicit UI labeling.
- Route collision safeguard: `GET /api/interventions/stats` registered before `GET /api/interventions/:id`.

---

## Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusiq
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5002/api
```

---

## Setup & Running on macOS

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Run Backend Test Suite (65/65 PASS)
```bash
cd backend
npm test
```

### 3. Start Backend Server (Port 5002)
```bash
cd backend
npm run dev
```
Verify health:
```bash
curl http://localhost:5002/api/health
```

### 4. Start Frontend Server (Port 5174)
```bash
cd frontend
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, MongoDB state, fallback mode |
| `GET` | `/api/analytics/overview` | Cohort KPIs, score averages, risk distributions |
| `GET` | `/api/analytics/weights` | Transparent 7-factor scoring weights & configuration |
| `GET` | `/api/students` | Filterable, paginated student records |
| `GET` | `/api/students/:idOrRegNo` | Full student profile with 7-factor breakdown |
| `GET` | `/api/students/:idOrRegNo/recommendations` | Explainable recommendations for single student |
| `GET` | `/api/recommendations` | Cohort-wide recommendations with priority & factor filters |
| `GET` | `/api/interventions/stats` | Faculty intervention summary statistics |
| `GET` | `/api/interventions` | Filterable, paginated interventions list |
| `POST` | `/api/interventions` | Create a new faculty intervention plan |
| `GET` | `/api/interventions/:id` | Retrieve single intervention details |
| `PATCH`| `/api/interventions/:id` | Update intervention status, notes, or roadmap |
| `DELETE`| `/api/interventions/:id` | Remove an intervention plan |
