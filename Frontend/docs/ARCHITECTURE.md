# PRATIBHA — Frontend Architecture Specification
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Status: Approved Architecture Plan | Scope: Frontend Architecture & Technical Design*

---

## 1. Executive Summary & Context

PRATIBHA is an enterprise-grade Student Success Intelligence Platform designed to address KPMG Challenge 4. It unifies academic, behavioral, skill, and placement metrics into predictive intelligence, actionable risk mitigation, and student empowerment.

### 1.1 Project Constraints & Ground Rules
- **Workspace Isolation**: All frontend source code, configuration, assets, and documentation reside strictly inside the `Frontend/` subdirectory of the repository.
- **Pure Frontend Execution**: In this phase, the application operates entirely client-side using a typed-like mock data and service abstraction layer. No running backend or external database is required.
- **Future Integration Readiness**: Architecture strictly adheres to REST/JSON standards, preparing seamless transitions to Node.js/FastAPI microservices, MongoDB document storage, and Python-based ML inference services.
- **Authentic Product Identity**: PRATIBHA is developed as an independent prototype for KPMG Challenge 4. Official brand trademarks and logos are strictly excluded.
- **Ethical AI & Explainability**: Success scores and risk tiers are fully explainable, deterministic, and transparent. Missing student data is never treated as a failure (zero), and demo predictions are explicitly marked as illustrative heuristics.

---

## 2. Workspace Inspection & File Baseline

Inspection of the repository baseline confirms:
- Repository root: `Pratibha/`
- Existing root files:
  - `.git/` (Git version control metadata)
  - `README.md` (Project baseline documentation)
  - `Frontend/` (Dedicated directory for the frontend application)
- Current state of `Frontend/`: Initialized, clean directory without legacy artifacts or conflicting dependencies.

---

## 3. Evaluated & Refined Frontend Directory Structure

The proposed structure has been refined to enforce strict separation of concerns, domain-driven modularity, clean service interfaces, and reusable layout boundaries.

```
Frontend/
├── docs/
│   └── ARCHITECTURE.md                  # This architecture document
├── public/
│   ├── favicon.svg                      # Custom PRATIBHA branding icon
│   └── mock/                            # Optional static JSON fixtures
├── src/
│   ├── app/
│   │   ├── router.jsx                   # Central route definitions & route guards
│   │   └── providers.jsx                # Global context providers (Theme, Auth/Role, Toast, Filter)
│   ├── components/
│   │   ├── ui/                          # Design-system atomic components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Table.jsx
│   │   │   └── MetricStat.jsx
│   │   ├── layout/                      # Navigation and structural chrome
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── RoleSwitcher.jsx         # Interactive demo role switcher banner
│   │   ├── charts/                      # Recharts visualization wrappers
│   │   │   ├── SuccessGauge.jsx         # Radial gauge for Success Score
│   │   │   ├── RiskRadarChart.jsx       # 7-domain radar analysis
│   │   │   ├── TrendLineChart.jsx       # Longitudinal performance tracking
│   │   │   ├── SegmentationMatrix.jsx   # 2x2 scatter matrix (Academic vs. Placement)
│   │   │   ├── DomainBarChart.jsx       # Comparative domain distributions
│   │   │   └── AttendanceHeatmap.jsx    # Visual calendar/subject heatmap
│   │   ├── students/                    # Student-specific presentation blocks
│   │   │   ├── StudentCard.jsx
│   │   │   ├── StudentFilterBar.jsx
│   │   │   ├── DomainQualityBadge.jsx
│   │   │   ├── RiskIndicatorPill.jsx
│   │   │   └── SkillBadgeGrid.jsx
│   │   ├── feedback/                    # Feedback and survey widgets
│   │   │   ├── FeedbackForm.jsx
│   │   │   └── SatisfactionGauge.jsx
│   │   └── interventions/               # Intervention action components
│   │       ├── InterventionModal.jsx
│   │       ├── InterventionTimeline.jsx
│   │       └── InterventionStatusBadge.jsx
│   ├── layouts/
│   │   ├── RootLayout.jsx               # Top-level shell with toasts & role switch bar
│   │   ├── PublicLayout.jsx             # Public landing & login shell
│   │   ├── InstitutionLayout.jsx        # Admin/Faculty dashboard shell (Sidebar + Appbar)
│   │   └── StudentLayout.jsx            # Student portal shell (Modern Top-Nav + Quick Action Rail)
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.jsx          # Platform introduction & feature overview
│   │   │   └── LoginPage.jsx            # Role-based demo credential selector
│   │   ├── institution/
│   │   │   ├── CampusDashboard.jsx      # Multi-department executive KPI overview
│   │   │   ├── StudentDirectory.jsx     # Master student listing with facet search & bulk export
│   │   │   ├── StudentProfile360.jsx    # Deep-dive individual profile across all 7 domains
│   │   │   ├── RiskAnalysisPage.jsx     # Decoupled academic & placement risk intelligence
│   │   │   ├── SegmentationPage.jsx     # 4-quadrant student segmentation & action cohorts
│   │   │   ├── TrendsForecastingPage.jsx# Historical trends & early warning indicators
│   │   │   ├── InterventionsPage.jsx    # Mentorship assignment & action tracking workflow
│   │   │   ├── DataIntegrationPage.jsx  # 7-domain data health, completeness, & ETL monitor
│   │   │   └── ReportsExportPage.jsx    # Executive summaries and data export builder
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx     # Personal metrics, success score & action summary
│   │   │   ├── StudentProfilePage.jsx   # 360° academic & skill portfolio
│   │   │   ├── StudentProgressPage.jsx  # Milestone tracking vs semester targets
│   │   │   ├── RecommendationsPage.jsx  # AI-suggested learning pathways & certifications
│   │   │   ├── StudentInterventionsPage.jsx # Active mentor sessions, remediation & tasks
│   │   │   └── FeedbackSubmissionPage.jsx   # Course, faculty, & platform experience surveys
│   │   └── NotFoundPage.jsx             # 404 handler with portal recovery redirection
│   ├── features/                        # Pure business logic, analytics engines & rule sets
│   │   ├── scoring/
│   │   │   ├── calculateSuccessScore.js # Explainable multi-factor scoring algorithm
│   │   │   ├── domainWeights.js         # Configurable weight matrices with sanity checks
│   │   │   └── scoreExplainability.js   # Human-readable factor contribution breakdown
│   │   ├── risk/
│   │   │   ├── academicRiskEngine.js    # Independent CGPA, backlog & attendance rules
│   │   │   ├── placementRiskEngine.js   # Independent coding, aptitude & interview rules
│   │   │   └── riskMitigationRules.js   # Automated intervention recommendation engine
│   │   ├── segmentation/
│   │   │   └── quadrantSegmentation.js  # 2x2 matrix categorization (High/Low Academic x Placement)
│   │   ├── data-integration/
│   │   │   ├── completenessValidator.js # Evaluates data completeness per domain
│   │   │   └── anomalyDetector.js       # Flags erratic drops or missing attendance feeds
│   │   └── interventions/
│   │       ├── interventionTypes.js     # Standard action taxonomies (Mentoring, Remedial, Mock Prep)
│   │       └── workflowTransitions.js   # State machine for intervention lifecycles
│   ├── data/
│   │   └── mock/
│   │       ├── mockStudents.js          # Realistic, diverse cohort of 50+ student records
│   │       ├── mockDepartments.js       # Faculty, department, and semester metadata
│   │       ├── mockTrends.js            # Multi-semester longitudinal analytics
│   │       ├── mockInterventions.js     # Active and completed intervention records
│   │       ├── mockRecommendations.js   # Curated skills, courses, and job readiness tracks
│   │       └── mockDataQuality.js       # Health status across 7 data sources
│   ├── services/                        # Service abstraction layer (Async Mock -> Future REST API)
│   │   ├── api.js                       # Base client interface with simulated latency & errors
│   │   ├── studentService.js            # Student queries, filter operations, 360 fetch
│   │   ├── analyticsService.js          # Campus aggregated KPIs and risk distribution
│   │   ├── interventionService.js       # CRUD operations for student interventions
│   │   ├── recommendationService.js     # Dynamic recommendations generation
│   │   └── dataIntegrationService.js    # Data source status and sync trigger simulations
│   ├── hooks/
│   │   ├── useAuth.js                   # Demo authentication & active role context
│   │   ├── useStudents.js               # Reactive hook for student directory querying
│   │   ├── useStudentDetail.js          # Single student fetch with computed intelligence
│   │   ├── useInterventions.js          # Interventions management hook
│   │   ├── useDebounce.js               # Search query debounce utility
│   │   └── useResponsive.js             # Viewport breakpoint detection
│   ├── utils/
│   │   ├── formatters.js                # Currency, percentages, CGPA, date formatters
│   │   ├── math.js                      # Weighted averages, percentiles, normalization
│   │   ├── colorTokens.js               # Dynamic status color resolver
│   │   └── exportUtils.js               # CSV/JSON client-side export generation
│   ├── styles/
│   │   ├── tokens.css                   # Custom CSS variables (Colors, typography, elevations, spacing)
│   │   ├── reset.css                    # Modern CSS reset & box-sizing normalization
│   │   ├── layout.css                   # Core shell layouts, grid systems, and responsiveness
│   │   └── components.css               # Base styling for cards, tables, badges, modals
│   ├── App.jsx                          # Application bootstrap & provider wiring
│   └── main.jsx                         # React 18 DOM mount point
├── index.html                           # Modern HTML5 shell with meta tags & Google Fonts
├── package.json                         # Minimal, strictly vetted dependencies
├── vite.config.js                       # Vite build configuration with path aliases
└── README.md                            # Frontend development instructions
```

---

## 4. Route-to-Page Mapping Specification

All routes are client-side managed using `react-router-dom` (v6+). Each route specifies its layout, target page component, and demo role permission context.

| Route Path | Page Component | Layout Shell | Description & Target Role |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | `PublicLayout` | Public landing page showcasing platform value proposition |
| `/login` | `LoginPage.jsx` | `PublicLayout` | Role-selection gateway (Admin, Faculty, Placement, Student) |
| `/institution/dashboard` | `CampusDashboard.jsx` | `InstitutionLayout` | Executive campus KPIs, cohort distributions, quick alerts |
| `/institution/students` | `StudentDirectory.jsx` | `InstitutionLayout` | Filterable, searchable student directory with facet filters |
| `/institution/students/:studentId` | `StudentProfile360.jsx` | `InstitutionLayout` | Deep-dive 360° analytics across all 7 student data domains |
| `/institution/data-integration` | `DataIntegrationPage.jsx` | `InstitutionLayout` | 7-domain data sync health, completeness % and anomaly flags |
| `/institution/risk-analysis` | `RiskAnalysisPage.jsx` | `InstitutionLayout` | Decoupled Academic vs. Placement risk analysis & drivers |
| `/institution/segmentation` | `SegmentationPage.jsx` | `InstitutionLayout` | 2x2 Academic vs Placement matrix with actionable cohorts |
| `/institution/trends` | `TrendsForecastingPage.jsx`| `InstitutionLayout` | Longitudinal semester performance & early warning indicators |
| `/institution/interventions` | `InterventionsPage.jsx` | `InstitutionLayout` | Mentorship log, remediation workflows, progress monitor |
| `/institution/reports` | `ReportsExportPage.jsx` | `InstitutionLayout` | Multi-format executive reports builder & CSV/JSON exports |
| `/student/dashboard` | `StudentDashboard.jsx` | `StudentLayout` | Student personal cockpit: Success Score, trends & targets |
| `/student/profile` | `StudentProfilePage.jsx`| `StudentLayout` | Verified academic transcript, verified badges & skill ledger |
| `/student/progress` | `StudentProgressPage.jsx` | `StudentLayout` | Milestone journey, attendance breakdown, LMS engagement |
| `/student/recommendations` | `RecommendationsPage.jsx`| `StudentLayout` | Curated skill roadmaps, certifications, and contest suggestions |
| `/student/interventions` | `StudentInterventionsPage.jsx`| `StudentLayout` | Assigned remediation tasks, mentor meetings & active goals |
| `/student/feedback` | `FeedbackSubmissionPage.jsx`| `StudentLayout` | Course survey, faculty feedback, and support request portal |
| `*` | `NotFoundPage.jsx` | `RootLayout` | 404 Not Found page with intuitive recovery back to portals |

### Route Access Control & Demo Role Switching
Because this phase utilizes mock state without backend authentication:
- Authentication state is held in an in-memory `AuthContext` (backed by `sessionStorage`).
- An unobtrusive, modern **Demo Role Switcher Bar** is displayed on top of the layout, allowing reviewers to hot-swap between:
  1. `Institution Admin` (Full campus oversight)
  2. `Faculty Mentor` (Department & student mentee view)
  3. `Placement Officer` (Placement readiness & hiring risk view)
  4. `Demo Student` (Individual student experience, e.g., "Aarav Sharma - 3rd Year CSE")
- Route guards provide clean simulated redirections: accessing `/student/*` while logged in as an institution role prompts switching or navigating back to `/institution/dashboard`.

---

## 5. Reusable Layouts & Component Boundaries

### 5.1 Layout Hierarchy
```
[RootLayout] (Toast notifications, Global Modals, Demo Role Switcher)
   ├── [PublicLayout] (Clean header, Hero section, Footer)
   │     └── LandingPage / LoginPage
   │
   ├── [InstitutionLayout] (Collapsible Sidebar, Command Header, Breadcrumbs, Content Area)
   │     └── CampusDashboard, StudentDirectory, StudentProfile360, etc.
   │
   └── [StudentLayout] (Student Brand Nav, Quick Stats Banner, Mobile Action Bar)
         └── StudentDashboard, Profile, Progress, Recommendations, etc.
```

### 5.2 Component Responsibility Matrix
To prevent tight coupling, components are compartmentalized into three clear tiers:

1. **Design System Primitives (`components/ui/`)**:
   - Zero business logic; driven entirely by props.
   - Strict CSS variable compliance (`var(--color-primary)`, `var(--radius-md)`).
   - High accessibility standards (semantic HTML, ARIA labels, keyboard navigability).
2. **Specialized Visualization Wrappers (`components/charts/`)**:
   - Wraps `recharts` primitives inside responsive containers (`ResponsiveContainer`).
   - Standardizes tooltip styling, dark/light theme tokens, and custom legends.
   - Graceful fallback rendering for empty or incomplete data sets.
3. **Domain & Feature Components (`components/students/`, `components/interventions/`)**:
   - Render domain-specific entities (e.g., Student 360 header, Risk radar, Intervention timeline).
   - Consume standardized models without directly mutating backend state.

---

## 6. Mock-Data & Service/API Abstraction Architecture

To ensure PRATIBHA can transition to real REST microservices in future phases without rewriting page components, all data operations are strictly decoupled via a **Repository/Service Pattern**.

### 6.1 Service Interface Specification
Page components and hooks **never import mock JSON directly**. Instead, they invoke asynchronous service functions:

```javascript
// src/services/studentService.js
export const studentService = {
  // Query students with pagination, search query, and facet filters
  async getStudents(filters = {}, pagination = { page: 1, limit: 10 }) { ... },
  
  // Retrieve complete 7-domain 360 data for an individual student
  async getStudentById(studentId) { ... },
  
  // Calculate or fetch aggregated campus KPIs
  async getCampusKPIs(departmentId = 'ALL') { ... },
  
  // Retrieve segmentation distribution
  async getSegmentationCohorts() { ... },
  
  // Submit new intervention or update existing
  async createIntervention(interventionData) { ... }
};
```

### 6.2 Data Simulation & Determinism
- **Simulated Latency**: A configurable artificial latency (100ms–250ms) is built into `api.js` to showcase realistic skeleton loading states and responsive transitions.
- **In-Memory Mutations**: State-altering operations (e.g., adding an intervention note, submitting student feedback) mutate an in-memory copy stored in `localStorage`/`sessionStorage` so that reviewer interactions persist across page navigations without backend persistence.
- **7-Domain Mock Schema Alignment**: Every mock student record is enriched across all seven official domains:
  1. `academics`: `{ cgpa: 8.42, currentSemester: 6, backlogs: 0, historicalMarks: [...], creditsEarned: 132 }`
  2. `attendance`: `{ overallPercentage: 88.5, subjectWise: [...], consecutiveAbsences: 1, lastUpdated: '2026-10-01' }`
  3. `lmsActivity`: `{ weeklyLoginCount: 14, assignmentsSubmittedRatio: 0.94, forumPosts: 6, averageVideoWatchPct: 82 }`
  4. `engagement`: `{ clubs: ['Robotics', 'Coding Club'], eventsAttended: 5, hackathons: 2, certificationsCount: 3 }`
  5. `placementReadiness`: `{ aptitudeScore: 82, codingScore: 78, mockInterviewScore: 75, resumesVerified: true, targetTier: 'Tier-1 Tech' }`
  6. `skills`: `{ technical: [{ name: 'React', score: 85 }, { name: 'Python', score: 90 }], softSkills: [{ name: 'Communication', score: 78 }] }`
  7. `feedback`: `{ satisfactionIndex: 4.2, facultyRatings: 4.5, reportedConcernsCount: 0 }`

---

## 7. Separation of Intelligence Engines vs. Presentation

Business intelligence calculations are strictly isolated in pure, deterministic JavaScript modules under `src/features/`. Presentation components strictly consume computed output.

### 7.1 Student Success Score (Explainable Formula)
The Student Success Score is an explainable index normalized from **0 to 100**. It is **not** a probability; it represents a holistic readiness and engagement rating.

#### Formula & Weighting Matrix
$$\text{Success Score} = \frac{\sum_{i=1}^{7} (W_i \times D_i \times C_i)}{\sum_{i=1}^{7} (W_i \times C_i)}$$

Where:
- $W_i$: Baseline configurable weight for domain $i$.
  - Academic Performance ($W_1$): `0.30`
  - Placement Readiness ($W_2$): `0.20`
  - Attendance Consistency ($W_3$): `0.15`
  - LMS Activity & Learning Habit ($W_4$): `0.10`
  - Skills & Verified Competencies ($W_5$): `0.10`
  - Co-curricular & Event Engagement ($W_6$): `0.08`
  - Feedback & Institutional Harmony ($W_7$): `0.07`
- $D_i$: Normalized score of domain $i$ (0 to 100 scale).
- $C_i$: Completeness factor of domain $i$ ($C_i = 1$ if valid data exists; $C_i = 0$ if missing).

#### Handling Missing Data
- **Critical Architectural Rule**: Missing domain data **does not default to zero**. If attendance or feedback data has not yet been synced from college ERP, $C_i$ is set to 0 and the domain weight is re-allocated dynamically among available domains.
- A **Completeness Metric** (e.g., `85% Data Completeness`) is displayed alongside the score, ensuring faculty and students understand data confidence.

### 7.2 Independent Risk Assessment Engines
Academic Risk and Placement Risk are assessed **completely independently** to prevent false cross-contamination (e.g., a student with high CGPA who cannot pass coding rounds, or an elite coder with low attendance).

#### 1. Academic Risk Engine (`academicRiskEngine.js`)
Evaluates:
- Current CGPA and delta from previous semester ($<-0.5 \implies \text{Warning}$).
- Active backlogs ($>0 \implies \text{High Risk}$).
- Attendance ($<75\% \implies \text{Statutory Risk}$, $<65\% \implies \text{Critical Risk}$).
- LMS assignment submission rate ($<70\% \implies \text{Engagement Drop}$).
- **Output Tiers**: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
- **Explainability**: Returns specific root causes, e.g., `['Attendance below statutory 75%', 'Drop of 0.8 CGPA in Semester 5']`.

#### 2. Placement Risk Engine (`placementRiskEngine.js`)
Evaluates:
- Aptitude percentile ($<60\% \implies \text{Screening Risk}$).
- Data Structures & Coding Benchmark ($<65\% \implies \text{Technical Round Risk}$).
- Mock Technical & HR Interview ratings ($<3/5 \implies \text{Soft Skills Gap}$).
- Minimum eligibility criteria (CGPA $<6.5$ or active backlog restricts corporate placements).
- **Output Tiers**: `CAREER_READY`, `MODERATE_PREP_NEEDED`, `HIGH_RISK_INTERVENTION_NEEDED`.
- **Explainability**: Returns specific deficit alerts, e.g., `['Coding benchmark below Tier-1 eligibility threshold (42%)']`.

### 7.3 Student Segmentation Matrix (2x2 Quad Engine)
Students are classified into actionable cohorts by intersecting their **Academic Performance Index** (X-axis) with their **Placement Readiness Index** (Y-axis):

```
       ▲ High
       │
       │   [QUADRANT 2: PLACEMENT CRITICAL]        [QUADRANT 1: STAR PERFORMERS]
       │   High Academics | Low Placement          High Academics | High Placement
       │   Action: Aptitude, Coding & Mock Prep   Action: Leadership, Honors & Research
       │
PLACEMENT
READINESS
       │   [QUADRANT 4: COMPREHENSIVE INTERVENTION][QUADRANT 3: ACADEMIC FOCUS]
       │   Low Academics | Low Placement           Low Academics | High Placement
       │   Action: Attendance, Remedial, Mentoring Action: Backlog Clear, Subject Tutoring
       │
       └─────────────────────────────────────────────────────────────► High
                               ACADEMIC PERFORMANCE
```

This segmentation directly drives the institution's intervention recommendations.

---

## 8. Shared State & Navigation State Strategy

To avoid introducing heavy state libraries like Redux for this scoped frontend prototype, we adopt a lightweight, high-performance architecture using **React Context + Custom Hooks**:

1. **`AuthContext` (`useAuth`)**:
   - Manages active demo identity (`activeRole`, `activeUser`, `switchRole()`).
   - Automatically synchronizes with `sessionStorage` for demo session continuity.
2. **`FilterContext` (`useStudentFilters`)**:
   - Stores global cohort selection: `selectedDepartment`, `selectedBatch`, `selectedSemester`, `riskTierFilter`, `searchQuery`.
   - Synchronizes with URL query parameters (`useSearchParams`) so that filtered views can be directly bookmarked and shared.
3. **`InterventionContext` (`useInterventions`)**:
   - Maintains client-side state of planned, active, and completed interventions.
   - Provides reactive update methods (`assignIntervention()`, `updateStatus()`).
4. **`ToastContext` (`useToast`)**:
   - Centralized notifications for user interactions (e.g., "Intervention assigned to Aarav Sharma", "Report exported successfully").

---

## 9. Responsive Layout & CSS Design Token Strategy

### 9.1 Pure Vanilla CSS with Design Tokens
To guarantee lightweight loading, maximum aesthetic control, and zero build tool lock-in, styling is built on **CSS Variables (Design Tokens)** defined in `src/styles/tokens.css`.

#### Core Token Categories:
- **Color Palette**:
  - Brand Primary: Deep indigo/navy (`--color-primary: #1e293b; --color-brand-accent: #3b82f6;`)
  - Accent / Vibrant: Electric sapphire & violet highlights (`#6366f1; #8b5cf6;`)
  - Status Indicators:
    - Success / Low Risk: Emerald (`#10b981`)
    - Warning / Moderate Risk: Amber (`#f59e0b`)
    - High Risk: Coral Red (`#ef4444`)
    - Critical Risk: Crimson (`#b91c1c`)
  - Neutrals: Crisp slate scale (`--color-slate-50` to `--color-slate-900`)
  - Surfaces: Frosted glassmorphic card overlays (`--surface-glass: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);`)
- **Typography**: Modern system sans-serif hierarchy paired with Google Fonts (Inter/Outfit):
  - Headings: Bold, tight letter-spacing (`font-weight: 600 / 700; letter-spacing: -0.02em;`)
  - Body & Data Metrics: Clean tabular figures for analytical clarity (`font-variant-numeric: tabular-nums;`)
- **Spacing & Radius**: Unified 4px/8px rhythm (`--space-1` to `--space-12`), standard radii (`--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;`).
- **Elevations & Shadows**: Subtle ambient layering (`--shadow-sm`, `--shadow-md`, `--shadow-glow`).

### 9.2 Responsive Breakpoint System
- `Mobile` ($< 640\text{px}$): Single-column stack, collapsible drawer navigation, card-based tabular representations, simplified chart views.
- `Tablet` ($640\text{px} - 1024\text{px}$): Dual-column layouts, compact sidebar icon-rail, horizontal scroll for multi-column comparison tables.
- `Desktop` ($> 1024\text{px}$): Full analytical dashboards, side-by-side risk and segmentation matrices, persistent navigation sidebar.

---

## 10. Implementation Dependencies & Risk Mitigation

### 10.1 Approved Production & Dev Dependencies
To preserve fast load times and clean builds, dependencies are strictly scoped:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "lucide-react": "^0.441.0",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### 10.2 Technical Risks & Proactive Mitigations

| Identified Risk | Severity | Proactive Architectural Mitigation |
| :--- | :--- | :--- |
| **Recharts Resize / Container Glitches** | Medium | Wrap all charts in a custom `<ChartContainer>` component with standard min-height and `ResponsiveContainer` dimension stabilizers. |
| **Data Completeness Ambiguity** | High | Explicitly compute and display the `Data Completeness Score` alongside the Success Score to prevent false assumptions when ERP feeds are incomplete. |
| **Perception of "Black-Box" ML** | High | Display explicit factor attribution charts (e.g. "+12 pts Academic, -8 pts Attendance gap") making all scoring 100% explainable and verifiable. |
| **State Drift Across Mock Navigation** | Medium | Use `sessionStorage` fallback within context hooks so user actions (like adding interventions) remain consistent across views. |
| **Overwhelming Data Density** | Medium | Use progressive disclosure: high-level KPI cards on dashboards with intuitive drill-downs into the 360° student profile. |

---

## 11. Ordered Implementation Plan (Phase-by-Phase)

The project will proceed through the following phased sequence:

```
[Phase 1: Architecture Planning] (CURRENT - COMPLETED)
  ├── Workspace inspection & folder baseline verified
  ├── Architectural document generated & saved to Frontend/docs/ARCHITECTURE.md
  └── Ready for User Approval
         │
         ▼
[Phase 2: Design System & Tokens]
  ├── tokens.css (Colors, Typography, Spacing, Shadows, Glassmorphism)
  ├── reset.css & layout.css
  └── Atomic UI Primitives (Button, Card, Badge, Table, Modal, MetricStat, Tooltip)
         │
         ▼
[Phase 3: Scaffolding, Tooling & Routing Shell]
  ├── Vite + React 18 configuration in Frontend/
  ├── React Router v6 setup with all 17 planned routes & 404 handler
  ├── Layout components (RootLayout, InstitutionLayout, StudentLayout, PublicLayout)
  └── Interactive Demo Role Switcher component
         │
         ▼
[Phase 4: Mock Data Engine & Service Abstraction]
  ├── 50+ diverse, realistic student records covering all 7 domains
  ├── Department, semester, trend, and data-quality fixtures
  └── studentService, analyticsService, interventionService, recommendationService
         │
         ▼
[Phase 5: Core Intelligence Engines]
  ├── calculateSuccessScore.js (Explainable multi-factor formula with completeness adjustment)
  ├── academicRiskEngine.js (Independent academic risk classification)
  ├── placementRiskEngine.js (Independent placement readiness risk classification)
  └── quadrantSegmentation.js (2x2 Academic vs Placement matrix engine)
         │
         ▼
[Phase 6: Institution Portal Pages]
  ├── CampusDashboard.jsx (Executive metrics, domain radar, quick risk alerts)
  ├── StudentDirectory.jsx (Search, filters, faceted exploration, bulk exports)
  ├── StudentProfile360.jsx (Deep-dive 7-domain breakdown, score explainability)
  ├── RiskAnalysisPage.jsx (Decoupled risk inspection & intervention triggers)
  ├── SegmentationPage.jsx (Interactive 2x2 matrix with cohort drilling)
  ├── TrendsForecastingPage.jsx (Longitudinal performance & early warning indicators)
  ├── InterventionsPage.jsx (Intervention logging, tracking, and progress management)
  ├── DataIntegrationPage.jsx (7-domain completeness & sync status dashboard)
  └── ReportsExportPage.jsx (Custom report generator & data export)
         │
         ▼
[Phase 7: Student Portal Pages]
  ├── StudentDashboard.jsx (Student cockpit: Success score, indicators, goals)
  ├── StudentProfilePage.jsx (360° academic record, skills & verified badges)
  ├── StudentProgressPage.jsx (Attendance tracker, LMS engagement, semester goals)
  ├── RecommendationsPage.jsx (AI-curated learning paths, contests, skill suggestions)
  ├── StudentInterventionsPage.jsx (Remediation schedule, mentor feedback, actions)
  └── FeedbackSubmissionPage.jsx (Student survey and satisfaction inputs)
         │
         ▼
[Phase 8: Public Pages & Onboarding]
  ├── LandingPage.jsx (Platform presentation, feature highlights, value proposition)
  └── LoginPage.jsx (Role selection gateway with 1-click persona switching)
         │
         ▼
[Phase 9: Polish, Performance & Verification]
  ├── End-to-end user journey verification across all 4 personas
  ├── Responsive testing across desktop, tablet, and mobile breakpoints
  └── Production build verification (`npm run build`)
```

---

## 12. Next Immediate Step

With the architecture specification complete and committed to [ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md), the next recommended step is **Phase 2: Design System & Tokens Foundation**, which establishes the CSS design system, color tokens, layout primitives, and reusable UI components.
