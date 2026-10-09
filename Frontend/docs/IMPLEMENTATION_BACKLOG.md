# PRATIBHA — Frontend Implementation Backlog & Task Planning
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Author: Senior Technical Project Manager & Frontend Tech Lead | Status: Active Sprint Planning*

---

## 1. Executive Summary & Workspace Inspection

### 1.1 Documentation Audit & Status
The workspace was inspected to verify all planning and architectural baselines:

| Document Path | Purpose | Verified Status |
| :--- | :--- | :--- |
| [Frontend/docs/ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md) | Technical architecture, route map, service layer | **Present & Verified** |
| [Frontend/docs/DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md) | Design tokens, typography, component contracts | **Present & Verified** |
| [Frontend/docs/PROJECT_MEMORY.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PROJECT_MEMORY.md) | Persistent memory, memorized visual references | **Present & Verified** |
| [Frontend/docs/PRD.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PRD.md) | Persona journeys, page-by-page acceptance criteria | **Present & Verified** |
| [Frontend/docs/CODING_RULES.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/CODING_RULES.md) | Mandatory coding standards, verification protocol | **Present & Verified** |
| [AGENTS.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/AGENTS.md) | Native Antigravity root rules | **Present & Active** |

*Audit Result: 100% of required governance and architectural documents are present and strictly aligned. Zero missing files.*

---

## 2. Current Implementation State vs. Pending Features

### 2.1 Completed Work (Phases 1 & 2)
- **Phase 1: Foundation (COMPLETED)**
  - Vite 5 + React 18 configuration initialized in [Frontend/](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend).
  - Vetted dependencies installed: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `recharts`.
  - Design tokens established in [tokens.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/tokens.css).
  - Global CSS, modern reset, typography, and utility foundations in [global.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/global.css).
  - Client-side demo session management in [AuthContext.jsx](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/context/AuthContext.jsx).
  - Production build verified passing with zero errors (`npm run build` in 3.07s).
- **Phase 2: Public Experience (COMPLETED)**
  - [LandingPage.jsx](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/pages/public/LandingPage.jsx): Faithfully implements the memorized dusk/night campus hero, serif headline *"Every Student Has Potential."*, 7-domain luminous constellation network with interactive hover tooltips, and platform overview sections.
  - [LoginPage.jsx](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/pages/public/LoginPage.jsx): Faithfully implements the organic curved wave split-screen layout with sunlit daytime campus photo, floating `Student Success Intelligence` progress card, accessible inputs with eye toggle, and 1-click persona buttons.
  - End-to-end browser verification completed and validated.

### 2.2 Pending Implementation Work (Phases 3 to 9)
The remaining work spans the full analytical depth of the Institution Portal and Student Portal, structured into 7 granular, sequential phases below.

---

## 3. Granular Task Breakdown by Phase

### Phase 1: Foundation *(Status: COMPLETED)*

#### [TASK-101] Project Scaffolding, Tooling & Design System Setup
- **Priority**: P0
- **Status**: **DONE**
- **Scope**: `package.json`, `vite.config.js`, `index.html`, `tokens.css`, `global.css`, `AuthContext.jsx`, `src/components/ui/` (`Button.jsx`, `Input.jsx`, `Badge.jsx`, `Card.jsx`, `MetricStat.jsx`, `index.js`).
- **Delivered**: Modern React 18 + Vite environment, centralized design tokens, global reset, demo authentication context, atomic UI component library, and production build verification (`npm run build` passing in 3.29s).


---

### Phase 2: Public Experience *(Status: COMPLETED)*

#### [TASK-201] Cinematic Landing Page & 7-Domain Constellation
- **Priority**: P0
- **Status**: **DONE**
- **Scope**: `LandingPage.jsx`, `DomainConstellation.jsx`, `PublicNavbar.jsx`, `PublicFooter.jsx`.
- **Delivered**: Visual hero, interactive SVG network, platform overview, responsive mobile drawer.

#### [TASK-202] Welcome Gateway & 1-Click Persona Login
- **Priority**: P0
- **Status**: **DONE**
- **Scope**: `LoginPage.jsx`.
- **Delivered**: Curved split-screen, floating intelligence widget, password visibility toggle, 1-click demo personas.

---

### Phase 3: Institution Portal Shell *(Status: READY TO IMPLEMENT)*

#### [TASK-301] Institution Layout, Navigation Chrome & Role Switcher
- **Priority**: P0
- **Dependencies**: TASK-101, TASK-202
- **Scope**:
  - `src/layouts/InstitutionLayout.jsx`
  - `src/components/layout/InstitutionSidebar.jsx`
  - `src/components/layout/InstitutionTopbar.jsx`
  - `src/components/layout/RoleSwitcherBar.jsx`
  - `src/components/layout/Breadcrumbs.jsx`
- **Description**: Build the structural shell for the Institution Portal. Includes a persistent dark-navy sidebar (`#082B56`) with collapsibility, active route indicators, a top command bar with search and active persona profile, an interactive top **Demo Role Switcher Bar** for 1-click persona toggling across all screens, and responsive drawer navigation for tablets/mobile.
- **Acceptance Criteria**:
  - [ ] Sidebar renders all 8 institution route links: Dashboard, Students, Data Integration, Risk Analysis, Segmentation, Trends, Interventions, Reports.
  - [ ] Role Switcher Bar allows instant switching between Admin, Faculty Mentor, Placement Officer, and Student without losing route state.
  - [ ] Breadcrumbs reactively reflect current route hierarchy.
  - [ ] Sidebar collapses cleanly to 72px icon-rail or mobile off-canvas drawer on `< 1024px` screens.
- **Verification**: Browser check on desktop and mobile viewports; verify sidebar collapse and role-switching hot-swap.
- **Definition of Done**: Layout mounts cleanly with zero layout shift; routes navigate without reloading.

---

### Phase 4: Student Analytics Engine & Core Directory

#### [TASK-401] 7-Domain Mock Dataset & Service Abstraction Layer
- **Priority**: P0
- **Dependencies**: TASK-301
- **Scope**:
  - `src/data/mock/mockStudents.js`
  - `src/data/mock/mockDepartments.js`
  - `src/services/studentService.js`
  - `src/services/api.js`
- **Description**: Author a deterministic, realistic cohort of 50+ synthetic student records covering all 7 official domains (Academics, Attendance, LMS, Engagement, Placement, Skills, Feedback). Build asynchronous service interfaces (`getStudents()`, `getStudentById()`, `getCampusKPIs()`) with simulated latency (120ms) and `sessionStorage` fallback for mock persistence.
- **Acceptance Criteria**:
  - [ ] Contains 50+ diverse student records across Computer Science, IT, Electronics, and Mechanical.
  - [ ] Every record contains realistic values across all 7 domains, including deliberate synthetic edge cases (e.g., student with high CGPA but 0 coding, student with coding star but low attendance, student with missing LMS sync).
  - [ ] Service functions return promises mimicking future REST API endpoints.
- **Verification**: Run node unit script or browser service inspection verifying data integrity across all 50 records.
- **Definition of Done**: Clean service exports consumed by React hooks without direct JSON imports.

#### [TASK-402] Explainable Success Scoring & Decoupled Risk Engines
- **Priority**: P0
- **Dependencies**: TASK-401
- **Scope**:
  - `src/features/scoring/calculateSuccessScore.js`
  - `src/features/scoring/domainWeights.js`
  - `src/features/risk/academicRiskEngine.js`
  - `src/features/risk/placementRiskEngine.js`
- **Description**: Implement pure JavaScript computation engines strictly isolated from presentation:
  1. Multi-factor Success Score ($0–100$) with dynamic weight redistribution for missing data.
  2. Independent Academic Risk Engine (CGPA trends, active backlogs, statutory 75% attendance).
  3. Independent Placement Risk Engine (Aptitude percentiles, DSA coding tests, mock interviews).
- **Acceptance Criteria**:
  - [ ] Missing domain data dynamically reallocates weights; **never outputs zero** for unrecorded domains.
  - [ ] Academic Risk and Placement Risk return independent tiers (`LOW`, `MODERATE`, `HIGH`, `CRITICAL` / `CAREER_READY`, `PREP_NEEDED`, `URGENT_INTERVENTION`) with explicit diagnostic root causes.
  - [ ] Calculates Data Completeness metric alongside every score.
- **Verification**: Automated test asserting that a student with missing attendance receives a score based on remaining 6 domains with `Data Completeness: 85.7%`.
- **Definition of Done**: 100% test pass on calculation edge cases; zero UI dependencies in feature code.

#### [TASK-403] Student Directory Page with Faceted Filtering & Sorting
- **Priority**: P0
- **Dependencies**: TASK-401, TASK-402
- **Scope**:
  - `src/pages/institution/StudentDirectory.jsx`
  - `src/components/students/StudentFilterBar.jsx`
  - `src/components/students/StudentTable.jsx`
- **Description**: Build master student directory with debounced text search (name/roll ID), department dropdowns, semester filters, independent Academic Risk and Placement Risk facet filters, and multi-column sorting (Success Score, CGPA, Attendance).
- **Acceptance Criteria**:
  - [ ] Real-time search filters 50+ student records with $< 50\text{ms}$ responsiveness.
  - [ ] Filtering by "High Academic Risk" and "Career Ready" simultaneously isolates the exact intersection cohort.
  - [ ] Decoupled risk pills display meaningful text labels alongside status colors.
  - [ ] Clicking any student row navigates to `/institution/students/:studentId`.
  - [ ] Empty state with "Reset Filters" action when no match is found.
- **Verification**: Browser test searching "Sharma", filtering by "Computer Science", and verifying row count.
- **Definition of Done**: Directory fully reactive, keyboard navigable, and responsive on mobile tables.

#### [TASK-404] Student Profile 360° Deep-Dive
- **Priority**: P0
- **Dependencies**: TASK-402, TASK-403
- **Scope**:
  - `src/pages/institution/StudentProfile360.jsx`
  - `src/components/students/DomainDetailTabs.jsx`
  - `src/components/charts/SuccessScoreGauge.jsx`
  - `src/components/students/RiskEvidenceCard.jsx`
- **Description**: Build the comprehensive 360° student diagnostic view across all seven domains. Features a large radial Success Score gauge with Data Completeness badge, factor attribution waterfall, independent Academic & Placement Risk cards with concrete diagnostic root causes, and tabbed exploration for Academics, Attendance, LMS, Engagement, Placement, Skills, and Feedback.
- **Acceptance Criteria**:
  - [ ] Renders all 7 domain tabs with longitudinal data (e.g. semester SGPA progression, subject-wise attendance).
  - [ ] Score explanation panel breaks down positive contributors and risk deductions.
  - [ ] Missing domain data displays `Pending Sync (Unrecorded)` badge without penalizing the overall score.
  - [ ] "Assign Intervention" button launches intervention assignment modal pre-filled with student ID.
- **Verification**: Navigate to student with active backlogs (e.g., Rohan Gupta) and verify Academic Risk displays specific backlog alerts while Placement Risk is calculated independently.
- **Definition of Done**: Profile loads reactively from URL parameter `:studentId` with graceful fallback for invalid IDs.

---

### Phase 5: Advanced Analytics & Segmentation

#### [TASK-501] Academic Performance × Placement Readiness 2x2 Segmentation Matrix
- **Priority**: P1
- **Dependencies**: TASK-402, TASK-403
- **Scope**:
  - `src/pages/institution/SegmentationPage.jsx`
  - `src/features/segmentation/quadrantSegmentation.js`
  - `src/components/charts/SegmentationMatrixChart.jsx`
- **Description**: Implement an interactive 2x2 scatter matrix categorizing students into 4 actionable quadrants:
  - Quadrant 1: *Star Performers* (High Academics, High Placement)
  - Quadrant 2: *Placement Critical* (High Academics, Low Placement)
  - Quadrant 3: *Academic Remediation* (Low Academics, High Placement)
  - Quadrant 4: *Priority Comprehensive Intervention* (Low Academics, Low Placement)
- **Acceptance Criteria**:
  - [ ] Scatter plot plots each student point with tooltip showing Name, Roll ID, CGPA, and Placement Index.
  - [ ] Clicking any quadrant filters the student table below to that specific cohort.
  - [ ] Displays recommended institutional action policies per quadrant.
  - [ ] Segment thresholds are configurable and clearly labeled as illustrative.
- **Verification**: Click Quadrant 2 and verify only students with CGPA $\ge 7.5$ and Placement Score $< 60\%$ appear in the drill-down list.
- **Definition of Done**: Recharts scatter matrix renders smoothly and updates dynamically when department filters change.

#### [TASK-502] Dedicated Risk Analysis Deep-Dive & Threshold Simulator
- **Priority**: P1
- **Dependencies**: TASK-402, TASK-403
- **Scope**:
  - `src/pages/institution/RiskAnalysisPage.jsx`
  - `src/components/charts/RiskDistributionChart.jsx`
  - `src/components/risk/ThresholdSimulator.jsx`
- **Description**: Build a dedicated risk intelligence cockpit with parallel views for Academic Risk vs. Placement Risk. Includes cohort risk distribution charts, top diagnostic drivers, and an illustrative interactive slider control allowing reviewers to simulate different institutional thresholds (e.g., shifting attendance cutoff from 75% to 80%).
- **Acceptance Criteria**:
  - [ ] Academic Risk and Placement Risk views are strictly decoupled.
  - [ ] Threshold slider reactively updates risk cohort counts on the client.
  - [ ] Prominent disclaimer badge: *"Illustrative Heuristic Rules — Configurable for Institutional Policy"*.
- **Verification**: Adjust attendance threshold slider from 75% to 70% and verify Academic Risk count drops accordingly.
- **Definition of Done**: Zero conflation between academic and placement risk; fully interactive.

#### [TASK-503] Longitudinal Trends & Forecasting Insights
- **Priority**: P1
- **Dependencies**: TASK-401
- **Scope**:
  - `src/pages/institution/TrendsForecastingPage.jsx`
  - `src/data/mock/mockTrends.js`
  - `src/components/charts/MultiSemesterTrendChart.jsx`
- **Description**: Build multi-semester longitudinal tracking showing average CGPA progression over 4 semesters, year-over-year attendance consistency, and historical placement conversion rates. Highlights early warning anomalies.
- **Acceptance Criteria**:
  - [ ] Recharts line and area charts rendered with design system color tokens (`#1677D2`, `#0D9488`, `#8B5CF6`).
  - [ ] Department comparison toggles (CSE vs. IT vs. ECE).
  - [ ] Clearly disclaims that historical trends utilize synthetic longitudinal demo records.
- **Verification**: Toggle department filters and verify trend curves re-render without layout flicker.
- **Definition of Done**: Responsive on mobile and tablet without SVG overflow.

---

### Phase 6: Data Integration & Pipeline Health

#### [TASK-601] 7-Domain Data Integration & Source Health Dashboard
- **Priority**: P1
- **Dependencies**: TASK-301
- **Scope**:
  - `src/pages/institution/DataIntegrationPage.jsx`
  - `src/data/mock/mockDataQuality.js`
  - `src/components/data-integration/DataSourceCard.jsx`
- **Description**: Dashboard showing synchronization health, sync frequency, record completeness percentage, and anomaly flags across all 7 institutional feeder systems (College ERP, Moodle LMS, Biometric Attendance, HackerRank/LeetCode API, Campus Placement Portal, Skill Verification Ledger, Student Survey System).
- **Acceptance Criteria**:
  - [ ] Status badges for each source: `Healthy`, `Syncing`, `Action Required`.
  - [ ] Displays last synced timestamp and domain completeness breakdown.
  - [ ] Includes "Trigger Sync Simulation" button with animated progress spinner.
- **Verification**: Click "Trigger Sync" and verify animated status transitions to "Healthy (Just now)".
- **Definition of Done**: All 7 domains represented with clear data pipeline provenance.

#### [TASK-602] CSV Ingestion Simulator & Data Quality Pre-Validator
- **Priority**: P1
- **Dependencies**: TASK-601
- **Scope**:
  - `src/components/data-integration/CsvUploadDropzone.jsx`
  - `src/components/data-integration/ValidationPreviewTable.jsx`
  - `src/features/data-integration/completenessValidator.js`
- **Description**: Build an interactive client-side CSV upload simulator with drag-and-drop dropzone, sample CSV template download, real client-side parsing, schema validation, duplicate roll ID detection, and error summary preview.
- **Acceptance Criteria**:
  - [ ] Accepts sample `.csv` uploads and parses them client-side.
  - [ ] Detects missing mandatory columns (`studentId`, `cgpa`, `attendance`).
  - [ ] Displays a preview table highlighting valid rows (green) vs. malformed rows (red) with descriptive error tooltips.
  - [ ] Prominent disclaimer: *"Simulated Ingestion: Validates format client-side for demonstration. Records are not persisted to a backend database."*
- **Verification**: Upload a sample test CSV and verify parsed rows appear in the preview table with accurate validation flags.
- **Definition of Done**: Does not claim backend persistence; handles malformed files gracefully without crashes.

---

### Phase 7: Interventions Management & Executive Reporting

#### [TASK-701] Interventions Management Workflow & State Tracking
- **Priority**: P0
- **Dependencies**: TASK-301, TASK-401
- **Scope**:
  - `src/pages/institution/InterventionsPage.jsx`
  - `src/components/interventions/InterventionModal.jsx`
  - `src/components/interventions/InterventionCard.jsx`
  - `src/services/interventionService.js`
- **Description**: Build full mentorship intervention tracking workflow: catalog of standard intervention types (Remedial Tutoring, Coding Bootcamp, Attendance Counseling, Mock Interview Prep), assignment modal, status lifecycle (`Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`), and client-side persistence in `sessionStorage`.
- **Acceptance Criteria**:
  - [ ] Assigning an intervention via modal adds it immediately to the active list.
  - [ ] Status can be updated (e.g. marked Completed) with reactive UI update.
  - [ ] Changes persist across page navigations in the demo session.
  - [ ] Filter by status and intervention category.
- **Verification**: Assign an intervention to student Aarav Sharma, navigate to Student Portal, and verify the task appears under Aarav's interventions.
- **Definition of Done**: Cross-portal state synchronization verified; zero dead action buttons.

#### [TASK-702] Reports Hub & Genuine Client-Side CSV Export Engine
- **Priority**: P1
- **Dependencies**: TASK-401, TASK-403
- **Scope**:
  - `src/pages/institution/ReportsExportPage.jsx`
  - `src/utils/exportUtils.js`
- **Description**: Build executive reporting hub supporting custom report generation: Executive Campus Summary, Departmental Risk Ledger, Placement Eligibility Roster. Implements a genuine client-side CSV export engine that dynamically constructs and downloads `.csv` files using browser `Blob`.
- **Acceptance Criteria**:
  - [ ] Clicking `Export CSV` downloads a real, valid `.csv` file with current filtered cohort data.
  - [ ] Export contains student name, ID, CGPA, Success Score, Academic Risk, and Placement Risk columns.
  - [ ] Backend-dependent capabilities (e.g. automated email schedule) are clearly labeled: *"Future Enterprise Feature"*.
- **Verification**: Click "Export CSV" and verify the browser downloads a valid file readable in Excel/Google Sheets.
- **Definition of Done**: Clean client-side Blob generation with zero memory leaks or pop-up blocker issues.

---

### Phase 8: Student Experience Portal

#### [TASK-801] Personal Student Cockpit & Success Score Explanation
- **Priority**: P0
- **Dependencies**: TASK-402, TASK-701
- **Scope**:
  - `src/pages/student/StudentDashboard.jsx` (upgrade from placeholder)
  - `src/components/student/StudentMetricCard.jsx`
  - `src/components/student/PersonalScoreBreakdown.jsx`
- **Description**: Upgrade the student dashboard into a personal empowerment cockpit for demo student Aarav Sharma (3rd Year CSE). Features an animated radial Success Score gauge, Data Completeness metric, plain-language attribution factors (*"Your score is boosted by +18 attendance and +32 academics"*), decoupled academic standing vs. placement readiness cards, and active mentorship tasks rail.
- **Acceptance Criteria**:
  - [ ] Displays authenticated data for active demo student profile (`STU-2024-042`).
  - [ ] Restricts view to personal records; demo student cannot browse other private student records.
  - [ ] Score explanation panel breaks down actionable areas for improvement.
- **Verification**: Log in as demo student Aarav and verify personal metrics match Aarav's 7-domain records.
- **Definition of Done**: Motivating, accessible student visual language; zero broken links.

#### [TASK-802] Student 360° Profile & Longitudinal Progress Tracker
- **Priority**: P1
- **Dependencies**: TASK-801
- **Scope**:
  - `src/pages/student/StudentProfilePage.jsx`
  - `src/pages/student/StudentProgressPage.jsx`
  - `src/components/student/AttendanceSubjectBreakdown.jsx`
  - `src/components/student/VerifiedSkillLedger.jsx`
- **Description**: Build the student's personal academic record page (verified SGPA progression, course credits) and longitudinal milestone progress tracker (subject-by-subject attendance breakdown with statutory 75% markers, weekly LMS study hours log, verified technical skill badges).
- **Acceptance Criteria**:
  - [ ] Subject-wise attendance highlights warnings if any subject falls below 75%.
  - [ ] Verified skill badges categorized by Technical, Tools, and Soft Skills.
- **Verification**: Verify attendance progress bars match synthetic record and display warning indicators accurately.
- **Definition of Done**: Fully responsive; clean presentation on mobile devices.

#### [TASK-803] AI-Curated Recommendations & Growth Pathways
- **Priority**: P1
- **Dependencies**: TASK-801
- **Scope**:
  - `src/pages/student/RecommendationsPage.jsx`
  - `src/services/recommendationService.js`
  - `src/components/student/RecommendationCard.jsx`
- **Description**: Personalized recommendation center displaying curated skill roadmaps, aptitude practice modules, coding challenge sprints, and certifications dynamically aligned with the student's diagnosed placement risk gaps. Includes "Add to My Goals" action that links directly to interventions.
- **Acceptance Criteria**:
  - [ ] Recommendations directly address the student's identified skill gaps (e.g. Quantitative Aptitude practice modules for student with 58th percentile).
  - [ ] Clicking "Add to Goals" queues the item in the student's intervention list.
- **Verification**: Click "Add to Goals" on AWS Cloud Practitioner module and verify it appears in Student Interventions.
- **Definition of Done**: Clear illustrative labeling; functional goal addition.

#### [TASK-804] Student Tasks Tracker & Multidimensional Feedback Portal
- **Priority**: P1
- **Dependencies**: TASK-701, TASK-801
- **Scope**:
  - `src/pages/student/StudentInterventionsPage.jsx`
  - `src/pages/student/FeedbackSubmissionPage.jsx`
  - `src/components/student/FeedbackForm.jsx`
- **Description**: Dedicated pages for student task management (marking assigned faculty remediation tasks completed, viewing mentor guidance notes) and institutional feedback submission (course ratings, mentorship satisfaction, support requests, and submission history log).
- **Acceptance Criteria**:
  - [ ] Student can toggle task completion, updating state reactively.
  - [ ] Feedback submission form validates ratings and comments, confirms with a toast, and updates the local feedback history.
- **Verification**: Submit a course satisfaction survey and verify the new entry appears in the feedback history log.
- **Definition of Done**: Form validation and state mutations persist across session navigation.

---

### Phase 9: Quality Assurance & Cross-Portal Verification

#### [TASK-901] End-to-End Route, Interaction & Responsiveness Audit
- **Priority**: P0
- **Dependencies**: All previous tasks
- **Scope**: Cross-codebase audit
- **Description**: Rigorous cross-portal verification covering all 18 routes, keyboard focus management (`:focus-visible`), WCAG contrast checks, mobile table responsiveness, empty/error state handling, and `npm run build` production validation.
- **Acceptance Criteria**:
  - [ ] Zero dead buttons across the entire platform.
  - [ ] Zero console errors or unhandled promise rejections.
  - [ ] All 18 routes navigable and recover gracefully via 404 handler.
  - [ ] `npm run build` passes with 0 errors and 0 warnings.
- **Verification**: Full browser subagent run executing end-to-end user journeys for Administrator, Faculty Mentor, Placement Officer, and Student.
- **Definition of Done**: Build verification command exits with code 0; all acceptance criteria satisfied.

---

## 4. Implementation Milestones & Dependency Graph

```
                                  [MILESTONE 0: FOUNDATION & PUBLIC]
                                   TASK-101 & TASK-201/202 (COMPLETED)
                                                  │
                                                  ▼
                                      [MILESTONE 1: CORE SHELL]
                                              TASK-301
                                       (Institution Layout &
                                        Role Switcher Bar)
                                                  │
                                                  ▼
                                  [MILESTONE 2: DATA & INTELLIGENCE]
                                              TASK-401 ────► TASK-402
                                          (7-Domain Mock    (Explainable Scoring
                                           Dataset & API)    & Decoupled Risk)
                                                  │                 │
                                                  ▼                 ▼
                                  [MILESTONE 3: INSTITUTION ANALYTICS]
                                              TASK-403 ────► TASK-404
                                          (Student Directory (Student 360° Profile)
                                           & Filtering)
                                                  │
                                      ┌───────────┴───────────┐
                                      ▼                       ▼
                         [MILESTONE 4: ADVANCED]    [MILESTONE 5: WORKFLOWS]
                                TASK-501                   TASK-601/602
                          (2x2 Matrix & Cohorts)     (Data Integration & CSV)
                                TASK-502                       │
                            (Risk Deep-Dive)                   ▼
                                TASK-503                   TASK-701/702
                            (Trends Forecasting)      (Interventions & Reports)
                                      │                       │
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                                  [MILESTONE 6: STUDENT EMPOWERMENT]
                                              TASK-801
                                      (Student Personal Cockpit)
                                                  │
                                      ┌───────────┴───────────┐
                                      ▼                       ▼
                                  TASK-802                TASK-803/804
                            (Student Profile 360    (AI Recommendations &
                             & Progress Tracker)     Feedback Survey Portal)
                                                  │
                                                  ▼
                                     [MILESTONE 7: VERIFICATION]
                                              TASK-901
                                     (Full E2E Audit & Build QA)
```

---

## 5. Technical Risks & Mitigation Matrix

| Risk ID | Identified Risk | Severity | Proactive Architectural Mitigation |
| :--- | :--- | :--- | :--- |
| **RISK-1** | Recharts resize rendering glitches inside responsive grid containers | Medium | Wrap charts inside standard `<ChartContainer>` with min-height and `ResponsiveContainer` dimension stabilizers. |
| **RISK-2** | False student zeroing when synthetic domain data is omitted | High | Enforce mandatory `completenessValidator.js` formula: missing domains reallocate weights dynamically and expose Data Completeness %. |
| **RISK-3** | Conflating Academic Risk with Placement Readiness | High | Strict decoupling: separate feature modules (`academicRiskEngine.js` vs. `placementRiskEngine.js`) and independent UI pills with textual explanations. |
| **RISK-4** | Browser session state loss during demo role hot-swapping | Medium | Back `AuthContext` and `InterventionContext` with `sessionStorage` serialization to ensure persistence across navigations. |

---

## 6. Recommended Next Implementation Task

The highest-priority incomplete task is:

### 👉 **[TASK-301] Institution Layout, Navigation Chrome & Role Switcher**
- **Priority**: **P0**
- **Prerequisites Satisfied**: Foundation (TASK-101) and Public Experience (TASK-201/202) are complete.
- **Target Deliverables**:
  1. `src/layouts/InstitutionLayout.jsx`
  2. `src/components/layout/InstitutionSidebar.jsx` (collapsible 260px dark-navy sidebar with 8 navigation items)
  3. `src/components/layout/InstitutionTopbar.jsx` (breadcrumbs, search bar, active user profile)
  4. `src/components/layout/RoleSwitcherBar.jsx` (persistent interactive top bar supporting hot-swapping between Admin, Faculty, TPO, and Student personas)
  5. Route configuration in `src/app/router.jsx` wrapping institution pages with `InstitutionLayout`.
