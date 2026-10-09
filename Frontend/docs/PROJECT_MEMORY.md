# PRATIBHA — Persistent Project Memory
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Role: Single Source of Truth for Architecture, Integrity & State*

---

## 1. Product Identity & Context

- **Product Name**: PRATIBHA
- **Product Descriptor**: Student Success Intelligence Platform
- **Tagline**: *From Student Data to Student Success.*
- **Core Mission**: Unify multidimensional student records into transparent, explainable intelligence that enables institutions to provide timely academic/placement interventions and empowers students to navigate their career readiness.
- **Project Context**: Built independently for the **KPMG Challenge 4** project.
- **Brand Compliance**: PRATIBHA is an independent prototype. Under no circumstances should official KPMG logos, copyrighted marks, or language implying an official KPMG corporate product be introduced.

---

## 2. Core Portals & Scope Boundaries

### 2.1 Three Target Portals
1. **Public Marketing Portal**:
   - Routes: `/`, `/login`
   - Purpose: Institutional pitch, feature showcase, 1-click demo role gateway.
2. **Institution Portal**:
   - Routes: `/institution/dashboard`, `/institution/students`, `/institution/students/:studentId`, `/institution/data-integration`, `/institution/risk-analysis`, `/institution/segmentation`, `/institution/trends`, `/institution/interventions`, `/institution/reports`
   - Target Users: University Administrators, Department Heads, Faculty Mentors, Training & Placement Officers (TPOs).
3. **Student Portal**:
   - Routes: `/student/dashboard`, `/student/profile`, `/student/progress`, `/student/recommendations`, `/student/interventions`, `/student/feedback`
   - Target Users: Individual students tracking their growth, risk alerts, mentor tasks, and recommendations.

### 2.2 Scope Delimitation
- **Active Scope**: Complete, responsive, functional frontend built with local mock intelligence.
- **Explicitly Out of Scope**: Real backend server, live database instances, production OAuth/SSO authentication, live external ML inference containers.
- **Integration Readiness**: Future integration with REST/JSON endpoints, MongoDB document stores, and Python ML services is anticipated through an async service abstraction layer (`src/services/`).

---

## 3. Mandatory Product Integrity Principles

Every agent and developer working on PRATIBHA must strictly adhere to these rules:

1. **No Silent Zeroing of Missing Data**:
   - If a student's data is missing or pending ERP synchronization for any of the 7 domains, **never default it to zero**.
   - Dynamic weight redistribution must be applied, and the **Data Completeness Metric** (e.g., `85% Data Completeness`) must always accompany the score.
2. **Success Score ≠ Probability of Success**:
   - The Student Success Score is an explainable composite readiness index (0–100 scale), **not** an actuarial probability or deterministic guarantee of graduation/placement.
3. **Decoupled Risk Calculation**:
   - **Academic Risk** and **Placement Risk** are computed and presented independently.
   - An elite coder with active backlogs has High Academic Risk but High Placement Readiness; a high-CGPA student with zero coding ability has Low Academic Risk but High Placement Risk. Never collapse these into a single blended risk indicator.
4. **Transparent Explainability**:
   - Every risk tier or score deviation must expose human-readable contributing factors (e.g., `Attendance dropped below 75% in Week 6`, `Coding test score 42% below Tier-1 benchmark`).
5. **Clear Demonstration Labeling**:
   - All mock datasets, risk thresholds, and predictive indicators must be clearly labeled as demo/illustrative heuristics.
   - Do not claim ML models are trained or validated on production institutional datasets.
6. **Synthetic Demo Data Only**:
   - Use only fictional student records. Never expose or hardcode real personal student data or institutional PII.
7. **Demo Authorization**:
   - Role switching (Admin, Faculty, Placement Officer, Student) is an interactive client-side demonstration aid, not production-grade security.

---

## 4. Technology & Architectural Reference

- **Source of Truth for Architecture**: [Frontend/docs/ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md)
- **Source of Truth for Styling & Tokens**: [Frontend/docs/DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md)
- **Approved Stack**:
  - React 18 + Vite (ES6+ Modules)
  - React Router v6+ for all 17 planned routes
  - Custom Vanilla CSS using centralized tokens in [tokens.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/tokens.css) & [global.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/global.css)
  - Recharts for analytical data visualizations
  - Lucide React for consistent iconography
- **Directory Isolation**: All frontend source code, config, and assets belong exclusively inside `Frontend/`.

---

## 5. Visual Direction Baseline & Memorized Reference Screens

The platform design must faithfully realize the approved visual direction captured in the project reference screens:

### 5.1 Landing Page Hero ("Every Student Has Potential")
- **Header**:
  - Logo: Glowing 3D blue-cyan sphere icon + serif wordmark `PRATIBHA.` (with distinct period).
  - Nav: `Platform`, `Insights`, `How It Works`, `About`.
  - Action: Outlined rounded button `Explore Dashboard →`.
- **Hero Typography & Layout**:
  - Eyebrow tag: `— STUDENT SUCCESS INTELLIGENCE • BUILT FOR CAMPUS IMPACT —` (small uppercase spaced text).
  - Headline: `Every Student Has Potential.` (Refined high-contrast serif font; `Every Student Has` in crisp `#FFFFFF`, `Potential.` highlighted in electric blue `#258BFA`).
  - Subtitle: *"Unify academic performance, attendance, LMS activity, engagement, skills, feedback and placement readiness into clear insights that help every student move forward."*
  - CTAs:
    - Primary: `EXPLORE THE PLATFORM →` (Solid vibrant electric blue `#258BFA`, uppercase, arrow).
    - Secondary: `See how it works →` (Subtle inline link with blue arrow).
- **Background & 7-Domain Constellation**:
  - Cinematic dusk/night campus scene with illuminated modern university glass building, warm interior lights, and campus walkway with student silhouettes.
  - Architectural text on building facade: `LEARN GROW INNOVATE BELONG`.
  - Luminous floating network connecting all 7 student data domains with circular icon nodes and light paths:
    1. `Academics` (Graduation cap)
    2. `Attendance` (Bar chart)
    3. `LMS Activity` (Laptop)
    4. `Engagement` (People / group)
    5. `Skills` (Lightbulb)
    6. `Feedback` (Chat bubble)
    7. `Placement` (Briefcase)

### 5.2 Login & Welcome Gateway ("Welcome to PRATIBHA.")
- **Organic Curved Split-Screen Layout**:
  - **Left Section**: Pure white analytics surface with a smooth organic curved wave boundary transitioning into the campus photograph.
  - **Right Section**: Bright, daytime campus photo showing modern architecture, students walking towards campus, and lush greenery.
  - **Floating Intelligence Preview Card**:
    - Floating white card with subtle shadow over the campus photo.
    - Title: Bar chart icon + `Student Success Intelligence`.
    - Three live progress indicators:
      - `Academic Performance` — `78%` (Cobalt blue bar)
      - `Placement Readiness` — `64%` (Violet / purple bar)
      - `Engagement & Skills` — `72%` (Emerald green bar)
- **Left Form Architecture**:
  - Header: `PRATIBHA.` logo with `Home` and `Help` links.
  - Eyebrow: `WELCOME BACK` (Light electric blue uppercase).
  - Title: `Welcome to PRATIBHA.` (Serif bold heading with period).
  - Subtitle: `Your student success journey starts here.`
  - **Portal Selection Pill Tabs**:
    - `[🏛️ Institution Portal]` (Active: Filled primary blue `#1677D2`).
    - `[🎓 Student Portal]` (Inactive: Outline / muted).
  - **Form Controls**:
    - Email field: Mail icon + placeholder *"Enter your email"*.
    - Password field: Lock icon + placeholder *"Enter your password"* + Eye toggle icon.
    - Checkbox: `Remember me` + `Forgot password?` link.
    - Primary Action: `Sign in →` (Full width vibrant blue button).
  - **Demo Disclaimer Banner**:
    - Soft blue surface card (`#EAF3FF` background, info icon):
    - `Demo experience • No real student data.`
    - `Use the provided demo credentials to explore the platform.`

---


## 6. Current Implementation State & Phasing

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Frontend Architecture Specification ([ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md)) | **Completed** |
| **Phase 2** | Design System Specification ([DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md), `tokens.css`, `global.css`) | **Completed** |
| **Phase 3** | Project Memory & Native Rules Setup ([PROJECT_MEMORY.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PROJECT_MEMORY.md)) | **Current** |
| **Phase 4** | Scaffolding & Routing Shell (Vite setup, React Router, Layouts, Role Switcher) | Upcoming |
| **Phase 5** | Mock Data Engine & 7-Domain Service Layer (`src/data/mock/`, `src/services/`) | Upcoming |
| **Phase 6** | Core Intelligence Engines (Success Score, Independent Risk, 2x2 Matrix) | Upcoming |
| **Phase 7** | Institution Portal Pages (9 pages) | Upcoming |
| **Phase 8** | Student Portal Pages (6 pages) | Upcoming |
| **Phase 9** | Public Portal Pages (Landing, Login) & Final Polish | Upcoming |

---

## 7. Instructions for Future Agents

Before making code modifications in this workspace:
1. **Always Inspect Existing Documents**:
   - Consult [PROJECT_MEMORY.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PROJECT_MEMORY.md), [ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md), and [DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md) before implementing features.
2. **Never Break Integrity Rules**:
   - Preserve decoupled risk calculations, explainable scoring formulas, and dynamic missing-data handling.
3. **Keep Memory Synchronized**:
   - When a phase is completed or an architectural decision is approved, update the status table and file map in this document.
4. **Preserve Isolation**:
   - Write all frontend code strictly inside `Frontend/`. Do not create parallel projects at the repository root.

---

## 8. Native Antigravity Rules Mechanism

In the Antigravity IDE environment, persistent project instructions are natively supported through:
1. **Workspace Root Rules**: An `AGENTS.md` file located at the repository root (`c:\Users\Md. Asad Raza\OneDrive\Desktop\Pratibha\AGENTS.md`).
2. **Workspace Customization Root**: `.agents/rules/*.md` files relative to the workspace root.

These files are automatically discovered and loaded into agent context at session startup. It is recommended to maintain a concise pointer file `AGENTS.md` at the workspace root referencing `Frontend/docs/PROJECT_MEMORY.md`.
