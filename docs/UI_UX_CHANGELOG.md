# CODEBUFFET — Final Release UI/UX Changelog & Design Specification
**Release:** Final Differentiation Master Release (v2.0-PROD)  
**Date:** October 10, 2026  
**Audience:** KPMG in India Challenge Evaluators & Design Reviewers  

---

## 1. Design System Overview & Dual-Atmosphere Visual Language
CODEBUFFET implements an intentional, accessible design architecture:
1. **Public Landing Atmosphere (`LandingPage.jsx`):**
   - Deep cinematic navy (`#0B1120`, `#0F172A`) with interactive constellation nodes representing student telemetry domains.
   - Zero distraction, high-contrast typography, and immediate role switchers.
2. **Clinical High-Density Analytics Canvas (`CampusDashboard.jsx`):**
   - Professional, high-legibility layout (`#F4F7FC` / `#FFFFFF`) optimized for rapid administrative decision-making.
   - Strict color semantics:
     * **Brand Accent:** `#1E6BFF` (Royal Blue)
     * **Optimal / On-Track:** `#10B981` (Emerald Green)
     * **Warning / Moderate Risk:** `#F59E0B` (Amber Orange)
     * **Critical / High Risk:** `#EF4444` (Crimson Red)
     * **Specialized Tier-1:** `#8B5CF6` (Violet)

---

## 2. Key Interface Upgrades & Differentiators

### A. Executive Overview & Data Provenance Banner
- **6 KPI Metric Cards:** Total Students (50,008 with explicit breakdown: 8 Verified Profiles | 50,000 Benchmark Cohort), Average Success Score (72.6% verified / 67.8% cohort), Placement Readiness Rate (77.8% cohort / 50.0% verified), At-Risk Population (25.0% verified / 6.2% cohort), Attendance Shortage (<75%), and Active Faculty Mentors (3 mentors with 9 open tasks).
- **Mandatory Provenance Reconciliation Banner:** Prominently explains that 8 verified registrar profiles represent enrolled students with 100% data completeness, while 50,000 records represent anonymous benchmark telemetry from `kaggle.csv`. Also discloses the provenance of the ~12,424 UCI research records in `KPMG-Student-Success`.
- **Faculty Mentor Scope Filter Bar:** Allows administrators to scope the entire dashboard to all faculty or specific mentors: `Prof. Rajesh Kumar` (CSE), `Dr. Sunita Sharma` (ECE), or `Prof. K. Murthy` (MECH).

### B. Differentiator 1 — Student Success Digital Twin
- **Interactive 3D Coordinate Space:** Visualizes students across three orthogonal dimensions:
  * **X-Axis:** Attendance Rate (0–100%)
  * **Y-Axis:** Student Success Score (0–100)
  * **Z-Axis:** Academic CGPA (0–10)
  * Features drag-to-rotate mouse controls, auto-orbit, hover tooltips, and student inspection.
- **3D Campus Hotspots Mode:** Isometric 3D campus visualization with interactive nodes for Academics, Research & Innovation, Placement Hub, and Student Engagement.
- **2D Analytical Matrix Fallback:** Provides an accessible 4-quadrant grid for non-WebGL environments.

### C. Differentiator 2 — Decoupled Risk Intelligence Matrix
- **2-Axis Risk Matrix:** Disentangles Academic Risk from Placement Risk:
  * **Star Tier-1 Candidates:** Low Academic Risk / Low Placement Risk
  * **Coding Wizards (Arrear Risk):** High Academic Risk / Low Placement Risk (High tech skills, failing attendance/backlogs)
  * **Exam Toppers (Skill Gap):** Low Academic Risk / High Placement Risk (High CGPA, but missing DSA/coding skills)
  * **Critical Dual-Risk Cohort:** High Academic Risk / High Placement Risk (Immediate intervention required)
- **One-Click Quadrant Filtering:** Clicking any quadrant card instantly filters the complete student directory below.

### D. Differentiator 3 — Intervention Impact Simulator
- **Interactive Policy Sliders:**
  * Attendance Remedial Boost: +0% to +20%
  * DSA & Coding Bootcamps: +0.0 to +3.0 pts
  * LMS Engagement Drive: +0% to +30%
  * Faculty Mentor Capacity: 10 to 100 slots
- **Real-Time Projection Engine:** Calculates live students rescued count, projected score increase (+4.8 pts), and placement readiness gain (+12.4%) with a concrete institutional ROI statement.

### E. Differentiator 4 — Explainable Student Success Score (0–100)
- **6 Weighted Dimensions:** Academic Performance (35%), Placement Preparedness (20%), Attendance & Diligence (15%), LMS Velocity (12%), Technical & Soft Skills (10%), and Applied Innovation (8%).
- **Data Completeness Indicators:** Renders explicit data completeness badges: 100.0% for verified profiles vs 94.1% for anonymous benchmark cohort records.

### F. Differentiator 5 — Guided At-Risk Recovery Demonstration
- **5-Step Interactive Walkthrough for KPMG Evaluators:**
  * **Step 1:** Detect At-Risk Student (Rajesh Kumar `STU-2024-001`, Score: 51.4)
  * **Step 2:** Diagnose Root Drivers (Attendance 68%, 2 Backlogs, DSA Gap)
  * **Step 3:** Assign Faculty Mentor (`Prof. Rajesh Kumar`)
  * **Step 4:** Prescribe Targeted Interventions (Attendance counseling, LeetCode Top 50, LMS case study)
  * **Step 5:** Simulate Positive Recovery (Projected score moves from 51.4 to 74.8, achieving placement readiness)

### G. Complete Student Directory with Roster Switcher
- **Segmented View Tabs:**
  * "Verified Profiles (8)"
  * "Benchmark Cohort (50,000)"
  * "All Records (50,008)"
- **Server-Side Pagination:** Fast page switching (Previous, Next, First, Last, Page numbers, Page size: 25, 50, 100) across all 50,008 records.
- **Provenance Badges:** Clear green `Verified (100%)` badge vs slate `Benchmark (94%)` badge per row.
- **Sortable Columns & Multi-Domain Filters:** Department, Risk Band, Mentor, Attendance Range (<75%, 75-85%, >85%), CGPA, and Backlogs.
- **360-Degree Detail Drawer:** Complete diagnostic drawer rendering real student academic and placement telemetry, risk drivers, and assigned mentor.
- **Export Functionality:** CSV download preserving the `Record Type` and `Source Provenance` columns.

### H. Model Intelligence & Transparency Section
- Live status display of `placement_risk_model.joblib` (LightGBM, cutoff: 0.35, SHA256 verified).
- Honest disclosure of identical binary checksum between placement and academic models, documenting the deterministic policy engine used for academic risk to prevent data leakage.
