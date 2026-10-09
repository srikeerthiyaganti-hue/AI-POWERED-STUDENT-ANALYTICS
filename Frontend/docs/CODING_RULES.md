# PRATIBHA — Frontend Coding Rules and Agent Instructions
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Author: Technical Lead & Code Quality Architect | Status: Mandatory Engineering Standard*

---

## 1. Overview & Persistent Rule Mechanism

This document establishes the mandatory engineering standards, architecture constraints, component guidelines, and execution protocols for the PRATIBHA frontend. Every agent and developer must comply with these rules.

### 1.1 Supported Persistent Rules Mechanism
In this Antigravity workspace, persistent rules are natively discovered and enforced via:
- **Workspace Root Rule File**: [`AGENTS.md`](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/AGENTS.md) located at the repository root (`c:\Users\Md. Asad Raza\OneDrive\Desktop\Pratibha\AGENTS.md`).
- **Workspace Customization Root**: `.agents/rules/*.md` relative to the workspace root.

The root [`AGENTS.md`](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/AGENTS.md) file is verified to be automatically injected into agent context at session initialization. This file ([`CODING_RULES.md`](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/CODING_RULES.md)) serves as the comprehensive technical reference standard.

---

## 2. Project Boundaries & Workspace Hygiene

1. **Directory Strictness**:
   - All frontend application code, assets, styles, tests, and configuration must reside strictly inside [Frontend/](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend).
   - **Never** create a second project or duplicate files at the repository root.
2. **Backend Out of Scope**:
   - Do not construct Node.js/Python backend servers, real databases, or Docker containers in this phase.
3. **Preserve Existing Work**:
   - Never overwrite or delete architectural, design, or memory files without explicit user approval.
   - Inspect files before modifying them.
4. **Dependency Discipline**:
   - Only use approved, vetted dependencies:
     - `react`, `react-dom` (^18.3.1)
     - `react-router-dom` (^6.26.2)
     - `lucide-react` (^0.441.0)
     - `recharts` (^2.12.7)
     - `vite`, `@vitejs/plugin-react` (Dev)
   - Do not introduce UI kits (Tailwind, Material UI, Chakra UI, Ant Design) or bloated utility libraries (Lodash, Moment.js).

---

## 3. Technology Stack & Component Architecture

### 3.1 Component Conventions
- **Functional Components & Hooks Only**: Use clean ES6+ React functional components. Class components are strictly prohibited.
- **Single Responsibility Principle**:
  - Keep components focused and under ~200 lines where practical.
  - Break complex page views into reusable sub-components (e.g., student cards, domain rows, metric tiles).
- **No Prop Drilling / No Giant Monoliths**:
  - Avoid deeply nested conditional JSX (`cond ? (cond2 ? ... : ...) : ...`). Extract sub-render functions or child components.
- **Semantic HTML & Stable Keys**:
  - Use semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
  - Always provide unique, stable keys for lists (e.g., `key={student.id}`); never use array indices as keys when lists can be filtered or sorted.

### 3.2 Directory Separation of Concerns
Adhere strictly to the layer architecture defined in [ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md):
- `src/components/ui/` — Pure design primitives (Button, Card, Badge, Input, Table, Modal).
- `src/components/layout/` — Shell chrome (Navbar, Sidebar, Topbar, Demo Role Switcher).
- `src/components/charts/` — Recharts wrappers with responsive boundaries and tokenized tooltips.
- `src/features/` — Pure domain algorithms (scoring, risk engines, segmentation, completeness). Zero JSX.
- `src/services/` — Asynchronous service interfaces simulating future REST endpoints.
- `src/data/mock/` — Deterministic, realistic mock datasets.
- `src/pages/` — Page-level composition wiring services, state, and presentation.

---

## 4. Design System & Styling Rules

1. **Centralized CSS Variables Only**:
   - Always reference design tokens from [tokens.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/tokens.css) and classes from [global.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/global.css).
   - **Never** write arbitrary hardcoded hex codes or ad-hoc inline styles (e.g., `style={{ color: '#1677D2', margin: '14px' }}` is prohibited; use CSS classes and variables).
2. **Dual-Atmosphere Consistency**:
   - **Public Landing Page**: Cinematic dark navy hero canvas (`.hero-dark`, `--color-navy-deep`), elegant serif typography for hero headlines, glowing sapphire CTAs (`--color-blue-bright`).
   - **Portals (Institution & Student)**: Precision light analytics canvas (`.analytics-canvas`, `--color-bg-page`), pure white cards (`--color-white`), slate borders (`--color-border`), dark navy navigation (`--color-navy`).
   - Do not make random dashboard cards dark.
3. **Accessibility & Contrast**:
   - All interactive controls must support visible `:focus-visible` outlines.
   - Text contrast must exceed WCAG AAA requirements (`> 11:1` for main text on canvas).
   - All animations must respect `@media (prefers-reduced-motion: reduce)`.
4. **Responsive Integrity**:
   - Design for three explicit breakpoints: Mobile (`< 768px`), Tablet (`768px – 1024px`), Desktop (`> 1024px`).
   - Tables must include horizontal overflow scrolling (`overflow-x: auto`) on mobile viewports.

---

## 5. Data Integrity, Scoring & Domain Logic Rules

1. **Never Silently Convert Missing Data to Zero**:
   - If attendance, LMS, or feedback records have not yet synced from university ERP, dynamically re-weight remaining active domains.
   - Always accompany the Success Score with the **Data Completeness Metric** (e.g., `85% Data Completeness`).
2. **Success Score ≠ Probability**:
   - The Student Success Score is an explainable readiness rating (0–100), not an actuarial probability.
   - Tooltips and explanatory panels must describe what the score represents.
3. **Decoupled Risk Engines**:
   - Academic Risk and Placement Risk must always be computed and presented independently.
   - Never blend or average them into a single ambiguous flag.
4. **Explainability First**:
   - Every risk alert must expose human-readable diagnostic drivers (e.g., `Attendance dropped to 68% in Week 6`, `Coding test score 42% below Tier-1 benchmark`).
5. **Clear Demonstration Disclaimers**:
   - Synthetic records only. Clearly label all data as fictional demo records.
   - Disclaim that ML inference and thresholds are illustrative prototypes.

---

## 6. Functional & Interaction Standards

1. **Zero Dead Buttons or Broken Links**:
   - Every button must perform its advertised action (trigger modal, execute filter, change status, download export).
   - If an action depends on future backend infrastructure (e.g., automated email alerts), display an explicit modal or toast: *"Future Enterprise Feature: This capability requires a connected institutional SMTP service."*
2. **Real Reactive State**:
   - Search inputs must filter the directory in real time (debounced).
   - Department, batch, semester, and risk dropdowns must actively filter table rows.
   - Sorting by CGPA, Success Score, or Attendance must function properly.
3. **Intervention State Mutations**:
   - Creating an intervention or updating its status must update the client-side state in `sessionStorage` so changes persist across page transitions.
4. **Functional Client-Side Exports**:
   - The CSV export button on Reports and Student Directory must construct and download a real `.csv` file via browser `Blob`.
5. **CSV Ingestion Simulation**:
   - The Data Integration page must actually parse uploaded sample CSV files, validate headers, detect mock row errors, and display a validation preview table.

---

## 7. Security, Safety & Privacy Guidelines

1. **Zero Secrets in Code**: Never hardcode API keys, tokens, or credentials in client-side code.
2. **No Unsafe HTML**: Do not use `dangerouslySetInnerHTML` with user inputs or unvetted text.
3. **Synthetic PII Only**: Never use real student names, phone numbers, or real institutional student records.
4. **Trademark Protection**: Do not use official KPMG logos, copyrighted assets, or language implying an official corporate product.
5. **Accessible Labels**: Form inputs must always have associated `<label>` elements or accessible `aria-label` attributes.

---

## 8. Task Execution Protocol

When executing any task or phase, follow this sequential protocol:

```
[1. Consult Specifications]
   Inspect ARCHITECTURE.md, DESIGN_SYSTEM.md, PROJECT_MEMORY.md, and PRD.md.
         │
         ▼
[2. File Impact Inspection]
   Inspect the exact files to be created or modified using list_dir or view_file.
         │
         ▼
[3. Scoped Implementation]
   Write modular, clean code strictly inside Frontend/.
   Avoid sweeping unrelated refactors.
         │
         ▼
[4. Build & Lint Verification]
   Run terminal verification: npm run build / npx vite build.
   Ensure 0 compile errors, 0 broken imports, 0 unhandled warnings.
         │
         ▼
[5. Interactive & Visual Check]
   Verify keyboard focus, responsive layout, and primary click interactions.
         │
         ▼
[6. Transparent Reporting]
   Report files inspected, created, modified, verification checks performed,
   and exact next phase.
```

---

## 9. Definition of Done (DoD)

A task or feature is marked as **Done** only when:
- [x] Resides strictly inside `Frontend/` and matches architecture layers.
- [x] Adheres to design tokens from `tokens.css`; zero rogue hex codes.
- [x] Respects decoupled risk rules and non-zero missing data rules.
- [x] All visible controls, links, and forms function interactively.
- [x] State updates persist across session navigation.
- [x] Code passes `npm run build` without errors.
- [x] Free of console errors or unhandled promises during standard user flows.
