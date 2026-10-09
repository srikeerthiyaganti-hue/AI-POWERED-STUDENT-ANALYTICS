# PRATIBHA — Product Requirements Document (PRD)
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Author: Product Management & Senior Business Analysis | Status: Implementation-Ready*

---

## 1. Executive Summary & Product Goals

### 1.1 Product Positioning
- **Product Name**: PRATIBHA
- **Descriptor**: Student Success Intelligence Platform
- **Tagline**: *From Student Data to Student Success.*
- **Context**: Built as an independent analytics solution for the KPMG Challenge 4 project.  
  *(Brand Compliance Note: PRATIBHA is not an official KPMG product and does not use official corporate branding or logos).*

### 1.2 Core Product Goals
Higher education institutions operate with siloed student data across ERP systems, Learning Management Systems (LMS), attendance registers, coding platforms, and placement cells. This fragmentation prevents timely remediation and leaves students unaware of their comprehensive career readiness.

**PRATIBHA solves this by:**
1. **Unifying Seven Student-Data Domains**: Academic performance, attendance, LMS engagement, co-curricular activity, placement readiness, verified technical/soft skills, and institutional feedback.
2. **Delivering Explainable Intelligence**: Calculating a holistic, explainable Student Success Score (0–100) where factor contributions and data completeness are fully transparent. Missing data is never treated as a zero failure.
3. **Decoupling Risk Engines**: Independently evaluating **Academic Risk** and **Placement Risk** so that high-CGPA students with weak placement readiness and skilled coders with attendance gaps receive tailored, appropriate interventions.
4. **Providing Actionable 2x2 Segmentation**: Classifying student cohorts across an Academic Performance × Placement Readiness matrix to empower administrators, faculty mentors, and placement officers to execute targeted intervention workflows.
5. **Empowering Student Autonomy**: Offering a dedicated Student Portal featuring personalized progress trackers, verified skill ledgers, AI-curated learning roadmaps, mentor action items, and institutional feedback channels.

---

## 2. Target Personas & User Journeys

The platform serves four primary personas across two dedicated portals:

### 2.1 Persona Profiles

| Persona | Role | Primary Objective in PRATIBHA | Key Portal Views |
| :--- | :--- | :--- | :--- |
| **Dr. Sunita Rao** | **Institution Administrator / Provost** | Campus-wide KPI visibility, accreditation reporting, department-wise risk oversight, data pipeline integrity. | Campus Dashboard, Data Integration, Trends & Forecasting, Reports. |
| **Prof. Rajesh Kumar** | **Faculty Mentor / Department Head** | Early academic risk detection, identifying attendance drops, assigning remedial tutoring, tracking mentee progress. | Student Directory, Student Profile 360°, Academic Risk View, Interventions. |
| **Vikram Malhotra** | **Training & Placement Officer (TPO)** | Evaluating coding/aptitude benchmarks, company eligibility filtering, identifying mock-interview deficits. | Placement Risk View, 2x2 Segmentation Matrix, Student Directory, Export. |
| **Aarav Sharma** | **3rd Year Engineering Student (Demo)** | Understanding personal Success Score, identifying skill gaps, tracking mentor tasks, submitting feedback. | Student Dashboard, Progress Tracker, Recommendations, Student Interventions. |

### 2.2 Primary User Journeys

#### Journey A: Faculty Mentor Early Academic Intervention
1. Faculty mentor logs in or selects `Faculty Mentor` in the Demo Role Switcher.
2. Navigates to **Risk Analysis**, filters by `Department: Computer Science` and `Academic Risk: High`.
3. Reviews the top risk factors (`Attendance dropped to 68%`, `CGPA drop: -0.7`).
4. Clicks into the student's **Profile 360°** to inspect the 7-domain breakdown and verify that data completeness is high (`96%`).
5. Clicks **Assign Intervention**, selects `Remedial Tutoring - Data Structures`, specifies target milestone date, and saves the task.
6. The intervention appears on the student's portal and in the institutional tracking log.

#### Journey B: Placement Officer Cohort Acceleration
1. Placement Officer accesses **Segmentation Page** and views the 2x2 matrix.
2. Identifies Quadrant 3 (*High Academics, Low Placement Readiness* — 18 students).
3. Clicks the quadrant to inspect the drill-down list.
4. Identifies that these students have CGPA > 8.0 but have coding benchmark scores $< 50\%$.
5. Initiates a batch action: "Schedule Intensive Mock Technical Interview & LeetCode Sprint".
6. Exports the filtered student cohort as a CSV report for training partners.

#### Journey C: Student Self-Improvement & Recommendation
1. Student accesses **Student Dashboard** via the role switcher or login.
2. Views current Success Score (`76 / 100`) with a clear attribution breakdown (`+28 Academic`, `+14 Attendance`, `+12 Placement`, `+22 Other`).
3. Notices the Placement Readiness warning (`Aptitude 58th percentile`).
4. Navigates to **Recommendations** to view AI-curated preparation modules for quantitative aptitude and cloud certification roadmaps.
5. Checks **Interventions** to mark an assigned mentor preparation task as completed.

---

## 3. Page-by-Page Functional Requirements & Acceptance Criteria

### 3.1 Public Marketing Portal

#### Page 1: Public Landing Page (`/`)
- **Header**: PRATIBHA wordmark, descriptor badge, navigation links (`Features`, `7 Domains`, `Methodology`, `Portals`), and `Launch Demo / Login` CTA.
- **Hero Section**:
  - Cinematic dark-navy backdrop (`#061A33`), elegant typography with serif headline accent, and glowing sapphire CTAs (`#258BFA`).
  - Value proposition headline: *"Transform Student Data into Measurable Student Success."*
  - Dual primary CTAs: `Explore Institution Portal` and `Student Experience`.
- **7-Domain Architecture Grid**: Interactive cards detailing how PRATIBHA unifies Academics, Attendance, LMS, Co-Curricular, Placement, Skills, and Feedback.
- **Explainable AI & Risk Methodology Section**: Explains why PRATIBHA decouples Academic from Placement Risk and how dynamic weight redistribution prevents missing data from becoming zero.
- **Interactive Role Preview**: Cards showing what Administrators, Faculty, TPOs, and Students experience.
- **Footer**: Brand descriptor, links, KPMG Challenge 4 prototype disclaimer.
- **Acceptance Criteria**:
  - [x] Zero broken links; all CTAs route to valid pages or demo entry points.
  - [x] Responsive layout across 320px–1440px viewports without horizontal overflow.
  - [x] No claims of real institutional results or validated production ML models.

#### Page 2: Login & Demo Gateway (`/login`)
- **Form Interface**: Clean login card with email and password inputs, show/hide password toggle, and validation error messages.
- **1-Click Demo Persona Switcher**:
  - Four pre-configured 1-click persona buttons:
    1. `Institution Admin` (`admin@pratibha.edu`)
    2. `Faculty Mentor` (`mentor@pratibha.edu`)
    3. `Placement Officer` (`tpo@pratibha.edu`)
    4. `Demo Student (Aarav)` (`aarav.sharma@pratibha.edu`)
  - Clicking any persona auto-fills credentials and signs in immediately to the appropriate portal.
- **Demo Mode Disclosure**: Explicit banner explaining: *"Demonstration Environment: Authentication is simulated client-side using session storage. No live credentials or backend servers are connected."*
- **Acceptance Criteria**:
  - [x] Form validates email format and required password length.
  - [x] 1-click demo buttons successfully set active persona in `AuthContext` and route to `/institution/dashboard` or `/student/dashboard`.
  - [x] Clear demo disclosure badge is persistently visible.

---

### 3.2 Institution Portal Pages

#### Page 3: Campus Dashboard (`/institution/dashboard`)
- **Executive Metric Cards**:
  - Total Enrolled Students (e.g., `1,240`)
  - Campus Average Success Score (e.g., `74.8 / 100`)
  - Academic Risk Count (e.g., `86 students at risk` — Amber/Red)
  - Placement Risk Count (e.g., `112 students at risk` — Amber/Red)
  - Overall 7-Domain Data Completeness (e.g., `92.4%`)
- **Domain Distribution Radar / Bar Chart**: Comparative visual showing campus average scores across all 7 domains.
- **Decoupled Risk Alert Feed**: Side-by-side tables listing students requiring urgent academic attention vs. placement prep.
- **Actionable Insights Panel**: 3–4 bulleted analytical takeaways derived from current cohort data.
- **Acceptance Criteria**:
  - [x] Academic and Placement risk counts are rendered in separate cards with distinct badge styles.
  - [x] Tooltip on Success Score clearly defines it as an explainable composite index, not an actuarial probability.
  - [x] Clicking any risk alert row routes to the specific student's Profile 360°.

#### Page 4: Student Directory (`/institution/students`)
- **Faceted Filter Toolbar**:
  - Search input: Real-time search by student name or roll number.
  - Department dropdown: `All Departments`, `Computer Science`, `Information Tech`, `Electronics`, `Mechanical`.
  - Semester dropdown: `All Semesters`, `Sem 4`, `Sem 6`, `Sem 8`.
  - Academic Risk filter: `All`, `Low`, `Moderate`, `High`.
  - Placement Risk filter: `All`, `Career Ready`, `Prep Needed`, `High Risk`.
  - Sort by: `Success Score (High to Low)`, `CGPA`, `Attendance`, `Data Completeness`.
- **Master Student Table**:
  - Columns: Student Info (Avatar, Name, ID, Dept), Success Score Gauge, Academic Risk Pill, Placement Risk Pill, CGPA, Attendance %, Completeness %, Actions.
  - Interactive row hover and direct link to Student Profile 360°.
- **Empty & Pagination State**:
  - "No students match the selected filter criteria" with a "Reset Filters" action.
  - Pagination controls (`Showing 1–10 of 50 students`).
- **Acceptance Criteria**:
  - [x] Search query debounced (200ms) with instant client-side filtering.
  - [x] Both risk pills render meaningful text labels alongside status colors.
  - [x] URL query parameters update reactively for shareable filter states.

#### Page 5: Student Profile 360° (`/institution/students/:studentId`)
- **Student Header**: Avatar, Full Name, Roll ID, Department, Current Semester, Mentor Name, Quick Contact.
- **Composite Intelligence Panel**:
  - Large Student Success Score Gauge with Data Completeness badge.
  - Factor Attribution Waterfall/Bar (`+28 Academics`, `+18 Placement`, `+14 Attendance`, etc.).
  - Side-by-side Decoupled Risk Cards with concrete root causes.
- **7-Domain Detailed Tabs**:
  1. *Academics*: Semester-wise CGPA graph, active backlogs count, credit points, historical subject scores.
  2. *Attendance*: Overall % badge, subject-wise attendance breakdown, consecutive absence counter.
  3. *LMS Activity*: Weekly login volume, assignment completion ratio, video lecture progress.
  4. *Engagement*: Registered student clubs, hackathons attended, event certifications.
  5. *Placement Readiness*: Aptitude percentile, coding test score, mock interview ratings, resume verification status.
  6. *Skills*: Technical skill badges with proficiency levels, verified soft skill ratings.
  7. *Feedback*: Student satisfaction score, course feedback sentiment, recorded faculty comments.
- **Intervention Quick Action**: Button to trigger `Assign Intervention` modal pre-filled with student ID.
- **Acceptance Criteria**:
  - [x] If domain data is missing in mock data, UI shows `Pending Sync (Missing)` without penalizing overall score with a zero.
  - [x] Academic and Placement risk boxes display explicit diagnostic bullet points.
  - [x] Seamless transition to next/previous student.

#### Page 6: Data Integration & Source Health (`/institution/data-integration`)
- **7-Domain Pipeline Health Grid**:
  - Cards for each domain displaying: Source System (e.g., `College ERP`, `Moodle LMS`, `Biometric Attendance`, `HackerRank/LeetCode API`, `Placement Portal`), Sync Status (`Healthy`, `Syncing`, `Needs Attention`), Last Synced Timestamp, Record Completeness %.
- **CSV Data Ingestion Simulator**:
  - File drag-and-drop dropzone supporting sample CSV uploads.
  - Pre-validation parser: Inspects header format, detects missing fields, identifies duplicate roll numbers.
  - Data preview table showing valid vs. erroneous rows.
  - Clear disclaimer: *"Simulated ingestion: Validates format client-side for demonstration. Records are not persisted to a production database."*
- **Acceptance Criteria**:
  - [x] Ingestion validator catches malformed rows and displays actionable error hints.
  - [x] Shows simulated sync trigger button with animated loading state.

#### Page 7: Risk Analysis Deep-Dive (`/institution/risk-analysis`)
- **Dual Analytical Views**:
  - View 1: **Academic Risk Analysis** — Cohort distribution across Low, Moderate, High risk tiers. Root cause breakdown (Attendance deficit vs. CGPA drop vs. Backlog alerts).
  - View 2: **Placement Risk Analysis** — Coding benchmark distribution, aptitude screening thresholds, company eligibility pipeline.
- **Threshold Rule Configurator (Illustrative)**:
  - Interactive slider controls allowing reviewers to test different risk thresholds (e.g., `Attendance Warning: 75%`, `Coding Pass: 60%`).
  - Re-evaluates student risk distribution reactively on the client.
- **Acceptance Criteria**:
  - [x] Academic and Placement engines are toggleable or displayed in clean parallel panels.
  - [x] Threshold simulator includes a badge clearly stating: *"Illustrative Heuristic Rules — Configurable for Institutional Policy"*.

#### Page 8: Student Segmentation Matrix (`/institution/segmentation`)
- **Interactive 2x2 Quadrant Scatter Plot**:
  - **X-Axis**: Academic Performance Index (0–100)
  - **Y-Axis**: Placement Readiness Index (0–100)
  - Quadrant 1: **Star Performers** (*High Academic, High Placement*) -> Leadership & Honors recommendations.
  - Quadrant 2: **Placement Critical** (*High Academic, Low Placement*) -> Intensive Coding & Mock Interview interventions.
  - Quadrant 3: **Academic Remediation** (*Low Academic, High Placement*) -> Subject Tutoring & Backlog Clear workflows.
  - Quadrant 4: **Priority Comprehensive Intervention** (*Low Academic, Low Placement*) -> Dedicated 1-on-1 Mentorship & Attendance counseling.
- **Interactive Quadrant Inspector**:
  - Clicking any quadrant highlights the cohort and displays the student list below with 1-click batch intervention options.
- **Acceptance Criteria**:
  - [x] Scatter plot renders individual student points with hover tooltips showing name, CGPA, and coding score.
  - [x] Quadrant breakdown statistics dynamically update if department filters are adjusted.

#### Page 9: Trends & Forecasting (`/institution/trends`)
- **Multi-Semester Longitudinal Charts**:
  - Historical average CGPA trend across the last 4 semesters.
  - Attendance consistency trend over the academic year.
  - Placement clearance rate progression for graduating cohorts.
- **Early Warning Indicators**:
  - Section highlighting early semester anomalies (e.g., *"Semester 5 showed a 12% drop in LMS engagement prior to midterms"*).
- **Acceptance Criteria**:
  - [x] Charts built with Recharts using design system tokens.
  - [x] Transparent disclaimer that historical trends represent synthetic longitudinal demo records.

#### Page 10: Interventions Management (`/institution/interventions`)
- **Intervention Workflow Board**:
  - Tabs or columns: `All Interventions`, `Scheduled`, `In Progress`, `Completed`, `Escalated`.
  - Intervention Cards displaying: Student Name & Roll ID, Type (Remedial Tutoring, Coding Bootcamp, Attendance Counseling, Mock Interview), Assigned Faculty Mentor, Due Date, Current Status, Action Notes.
- **Create / Assign Intervention Modal**:
  - Form fields: Student Selector, Intervention Category, Description, Target Completion Date, Severity Level.
  - Client-side state mutation: Newly created interventions immediately appear in the list and persist across session navigation.
- **Acceptance Criteria**:
  - [x] Supports status transitions (e.g., moving an intervention from "Scheduled" to "In Progress" to "Completed").
  - [x] User-friendly toast notification confirms changes.

#### Page 11: Reports & Export Hub (`/institution/reports`)
- **Report Generator Controls**:
  - Report Type: `Executive Campus Summary`, `Departmental Risk Ledger`, `Placement Eligibility Roster`, `Student 360 Detail Sheet`.
  - Format Selector: `CSV Spreadsheet`, `JSON Data Dump`, `Printable Executive View`.
- **Client-Side Export Execution**:
  - Functional CSV export generated dynamically via JavaScript `Blob` and downloaded directly to the reviewer's browser.
- **Acceptance Criteria**:
  - [x] Clicking `Export CSV` downloads a properly formatted, valid CSV file containing the active filtered cohort.
  - [x] Unsupported backend features (e.g., scheduled automated email dispatch) are clearly labeled as *"Future Enterprise Integration"*.

---

### 3.3 Student Portal Pages

#### Page 12: Student Personal Dashboard (`/student/dashboard`)
- **Personal Cockpit Header**: Greeting, Current Semester, Department, and Faculty Mentor card.
- **Personal Student Success Score**:
  - Large animated radial gauge displaying the student's Success Score.
  - Accompanying Data Completeness rating.
  - Human-readable factor breakdown: *"Your score is boosted by high attendance (+18) and strong academics (+32), with room for improvement in coding practice (-6)."*
- **Independent Status Indicators**:
  - Academic Standing Card: `Low Risk (CGPA: 8.42, Backlogs: 0)`.
  - Placement Readiness Card: `Prep Needed (Aptitude: 62%, Coding: 54%)`.
- **Active Action Rail**: Today's tasks, upcoming mentor review sessions, and recommended quick activities.
- **Acceptance Criteria**:
  - [x] Displays data for the currently active student demo persona (e.g., Aarav Sharma).
  - [x] Clean, motivating, student-centric visual language.

#### Page 13: Student 360° Profile (`/student/profile`)
- **Personal Academic Record**: Verified semester SGPA/CGPA progression, completed course credits, faculty endorsements.
- **Verified Skills Ledger**: Interactive skill tags categorized into Technical, Cloud/Tools, and Interpersonal skills.
- **Badges & Achievements Showcase**: Micro-credentials and event participations (Hackathons, Clubs).
- **Acceptance Criteria**:
  - [x] Clean tabular and card layout with zero unauthorized access to other students' profiles.

#### Page 14: Student Progress & Milestones (`/student/progress`)
- **Longitudinal Milestone Tracker**: Visual semester progress towards graduation requirements and placement eligibility.
- **Attendance Breakdown Widget**: Subject-by-subject attendance percentages with statutory threshold markers (75% minimum).
- **LMS Learning Activity Log**: Weekly study hours, assignment submissions, and quiz completion ratios.
- **Acceptance Criteria**:
  - [x] Clear visual warnings when attendance in any single subject drops below 75%.

#### Page 15: AI-Curated Recommendations (`/student/recommendations`)
- **Personalized Growth Opportunities**:
  - Recommended Coding Challenges (e.g., "Top 20 Binary Tree Questions on LeetCode").
  - Aptitude Practice Modules tailored to weak areas (e.g., "Probability & Permutations Sprint").
  - Suggested Certifications (e.g., "AWS Cloud Practitioner", "Postman API Fundamentals").
- **Interactive Action**: "Add to My Goals" button that queues the item in the student's personal intervention list.
- **Acceptance Criteria**:
  - [x] Recommendations directly align with the student's diagnosed placement risk gaps.

#### Page 16: Student Interventions & Tasks (`/student/interventions`)
- **Assigned Mentorship Tasks**:
  - List of remediation sessions, mentor appointments, and milestone assignments created by faculty.
  - Task completion checkbox and submission notes textarea.
- **Mentor Communication Snippet**: View latest guidance notes from assigned faculty mentor.
- **Acceptance Criteria**:
  - [x] Student can mark tasks completed, updating task state reactively.

#### Page 17: Feedback & Support Submission (`/student/feedback`)
- **Multidimensional Survey Interface**:
  - Course Experience Rating (1–5 Stars).
  - Faculty Feedback & Mentorship Satisfaction Rating.
  - Open-text Support Request / Grievance form.
- **Interactive Feedback History**: List of past submitted feedback logs with status badges (`Reviewed`, `Action Taken`).
- **Acceptance Criteria**:
  - [x] Form submission provides responsive success confirmation and adds new entry to local feedback log.

#### Page 18: Not Found Handler (`/404` or `*`)
- **Friendly 404 Visual**: Custom PRATIBHA graphic, descriptive error message, and direct navigation buttons back to the Public Landing Page, Institution Dashboard, or Student Dashboard.

---

## 4. Score and Risk Calculation Methodology

### 4.1 Explainable Student Success Score Formula
The Student Success Score ($S$) is a normalized index from **0 to 100**. It is an explainable readiness metric, **not** an actuarial probability.

$$S = \frac{\sum_{i=1}^{7} \left( W_i \times D_i \times C_i \right)}{\sum_{i=1}^{7} \left( W_i \times C_i \right)}$$

Where:
- $D_i \in [0, 100]$: Normalized score for domain $i$.
- $W_i$: Configured domain weight.
  - $W_{\text{Academic}} = 0.30$
  - $W_{\text{Placement}} = 0.20$
  - $W_{\text{Attendance}} = 0.15$
  - $W_{\text{LMS}} = 0.10$
  - $W_{\text{Skills}} = 0.10$
  - $W_{\text{Engagement}} = 0.08$
  - $W_{\text{Feedback}} = 0.07$
- $C_i \in \{0, 1\}$: Completeness factor ($1$ if valid data exists, $0$ if data is missing or unsynced).

#### Non-Zero Dynamic Normalization Rule
If domain $k$ has missing data ($C_k = 0$), $W_k$ is excluded from the denominator. The remaining valid domains dynamically scale to represent 100% of the active score. Under no circumstances is an unrecorded domain treated as a score of zero.

#### Data Completeness Index
Accompanying every score:
$$\text{Data Completeness} = \left( \frac{\sum_{i=1}^{7} C_i}{7} \right) \times 100\%$$

### 4.2 Decoupled Risk Engine Rules

#### Academic Risk Engine
Calculated strictly independently using academic and attendance heuristics:
- **Low Risk**: $\text{CGPA} \ge 7.0 \land \text{Backlogs} = 0 \land \text{Attendance} \ge 75\%$.
- **Moderate Risk**: $(6.0 \le \text{CGPA} < 7.0) \lor (70\% \le \text{Attendance} < 75\%) \lor (\Delta\text{CGPA} < -0.5)$.
- **High Risk**: $\text{CGPA} < 6.0 \lor \text{Backlogs} \ge 1 \lor \text{Attendance} < 70\%$.
- **Critical Risk**: $\text{CGPA} < 5.0 \lor \text{Backlogs} \ge 3 \lor \text{Attendance} < 60\%$.
- **Diagnostic Output**: Returns precise text triggers (e.g., `["Attendance at 69% (Below statutory 75%)", "1 Active Backlog: Applied Mathematics"]`).

#### Placement Risk Engine
Calculated strictly independently using aptitude, coding, and interview benchmarks:
- **Career Ready**: $\text{Coding Score} \ge 70\% \land \text{Aptitude} \ge 70\% \land \text{Interview Rating} \ge 3.5/5 \land \text{Backlogs} = 0$.
- **Moderate Prep Needed**: $(50\% \le \text{Coding} < 70\%) \lor (50\% \le \text{Aptitude} < 70\%) \lor (3.0 \le \text{Interview} < 3.5)$.
- **High Risk / Intervention Needed**: $\text{Coding} < 50\% \lor \text{Aptitude} < 50\% \lor \text{Interview} < 3.0 \lor \text{Active Backlogs} > 0$.
- **Diagnostic Output**: Returns concrete skill deficits (e.g., `["Data structures benchmark below Tier-1 eligibility threshold (42%)", "Aptitude quantitative percentile: 48th"]`).

---

## 5. Non-Functional Requirements (NFRs)

1. **Performance & Bundle Size**:
   - Initial page load under 1.5 seconds on standard broadband.
   - Client-side route transitions under 100ms.
   - Pure CSS architecture without heavyweight utility bundle overhead.
2. **Accessibility & Usability**:
   - Full keyboard navigability (`Tab`, `Enter`, `Escape` for modals).
   - High-contrast text compliance (WCAG AAA contrast ratio $> 11:1$).
   - Screen reader accessible form labels and aria attributes on charts and risk indicators.
3. **Cross-Browser & Responsive Compatibility**:
   - Flawless rendering on modern Chromium (Chrome, Edge), Firefox, and Safari.
   - Smooth responsiveness across Mobile (<768px), Tablet (768px–1024px), and Desktop (>1024px).
4. **Data Integrity & Consistency**:
   - Uniform student identities and IDs across all 17 routes. If a reviewer updates Aarav Sharma's intervention on `/institution/interventions`, the change is reflected when viewing `/student/interventions`.

---

## 6. Out of Scope

- Real Node/Python backend servers and live REST microservice execution.
- Production OAuth 2.0 / SSO / SAML integration.
- Production MongoDB / PostgreSQL database deployments.
- Training or validating real deep learning / machine learning neural nets.
- Financial fee payment processing, SMS gateways, or institutional email relays.

---

## 7. Assumptions & Technical Dependencies

- **Development Runtime**: Node.js v18+ and npm installed in the environment.
- **Approved Dependencies**: `react`, `react-dom`, `react-router-dom` (v6+), `lucide-react`, `recharts`, `vite`, `@vitejs/plugin-react`.
- **Browser State**: In-memory `sessionStorage` and `localStorage` are available for interactive demo persistence.

---

## 8. Prioritized Implementation Backlog

| Sprint / Phase | Scope Item | Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Architecture Specification | [Frontend/docs/ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md) | **Completed** |
| **Phase 2** | Design System & Tokens | [Frontend/docs/DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md), `tokens.css`, `global.css` | **Completed** |
| **Phase 3** | Project Memory & Native Rules | [Frontend/docs/PROJECT_MEMORY.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PROJECT_MEMORY.md), [AGENTS.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/AGENTS.md) | **Completed** |
| **Phase 4** | Product Requirements Document | [Frontend/docs/PRD.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PRD.md) | **Completed (Current)** |
| **Phase 5** | Coding Rules & Agent Instructions | `Frontend/docs/CODING_RULES.md` & workspace integration | Next Up |
| **Phase 6** | Scaffolding, Tooling & Routing Shell | Vite setup, React Router with all 17 routes, Layout shells, Demo Role Switcher | Upcoming |
| **Phase 7** | Mock Data Engine & Service Abstraction | 50+ 7-domain student records, async services (`studentService`, `analyticsService`, etc.) | Upcoming |
| **Phase 8** | Core Intelligence Engines | Pure scoring algorithm, decoupled risk engines, 2x2 segmentation matrix | Upcoming |
| **Phase 9** | Institution Portal Pages | 9 institutional analytics & action pages | Upcoming |
| **Phase 10**| Student Portal Pages | 6 student-centric empowerment pages | Upcoming |
| **Phase 11**| Public Landing & Login Experience | Marketing hero, feature showcases, 1-click persona gateway | Upcoming |
| **Phase 12**| Polish, Verification & Build Quality | Cross-portal verification, responsive testing, production build check | Upcoming |

---

## 9. Definition of Done (DoD)

A page, feature, or phase is considered **Done** only when:
1. **Architectural Alignment**: Code strictly resides inside `Frontend/` and conforms to `ARCHITECTURE.md`.
2. **Design System Compliance**: Uses centralized CSS variables from `tokens.css`; no arbitrary hardcoded inline styles.
3. **Data Integrity Adherence**: Missing data is never silently zeroed; Success Score is explainable; Academic Risk and Placement Risk remain decoupled.
4. **Interactive Fidelity**: No dead buttons or non-functional placeholder links. Forms validate inputs; actions trigger toasts.
5. **State Consistency**: Data mutations (e.g. interventions) persist within the browser session across page switches.
6. **Cross-Viewport Responsiveness**: Tested and functional on mobile, tablet, and desktop viewports.
7. **Clean Build**: Executes `npm run build` with zero syntax errors, unhandled exceptions, or missing module imports.
