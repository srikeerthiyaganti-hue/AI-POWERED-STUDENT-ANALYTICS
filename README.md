# Smart Campus Analytics: AI-Powered Student Analytics & Success Platform
**Predict, Optimize & Improve Student Success at Vignan's Foundation for Science, Technology and Research (VFSTR)**

[![Tests Status](https://img.shields.io/badge/tests-45%20passed%20(100%25)-emerald.svg)](tests)
[![Platform Version](https://img.shields.io/badge/version-2.2.0--explainable-indigo.svg)](app)
[![Instituion](https://img.shields.io/badge/institution-VFSTR%20Deemed%20to%20be%20University-blue.svg)](https://vignan.ac.in)

Interactive Web Application & Command Center: [http://localhost:8000/](http://localhost:8000/)  
Interactive API Documentation & Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)  
Direct Dashboard URL: [http://localhost:8000/dashboard](http://localhost:8000/dashboard)

---

## 1. System Overview & Architecture

The **Smart Campus Analytics Platform** integrates fragmented university data into a unified, source-traceable, and explainable intelligence system for VFSTR faculty, mentors, and academic leadership.

```
                         [Official VFSTR Data Sources]
       ┌───────────────────────┬─────────────────────────┬───────────────────────┐
       │                       │                         │                       │
VFSTR Exam Portal      Biometric RFID Gates         LMS Moodle Logs        CDC Placement Cell
 (SGPA, CGPA, Marks)    (<75%, <65% Attendance)   (Assignments, Logins)     (Coding, Aptitude)
       │                       │                         │                       │
       └───────────────────────┴───────────┬─────────────┴───────────────────────┘
                                           │
                       [Data Integration & Normalization Engine]
                         - Student Identifier Matcher (YY1FAXXXXX, REG1001)
                         - Anomaly Detection & Review Queue Isolator
                         - Idempotent Ingestion & Duplicate Prevention
                         - Source Provenance Tracker (SHA-256 Hashes)
                                           │
                         [Unified Relational Data Model (SQLite)]
                         - Students, Academic Records, Subject Marks
                         - Attendance Records, LMS Activities, Engagements
                         - Placement Readiness, Skills Radar, Feedback
                         - Import Jobs, Quality Reports, Users (RBAC)
                                           │
                         [Analytics, Scoring & Risk Engines]
                         - Student Success Score (0-100, Dynamic Renormalization)
                         - Explainable Risk Engine (Detention & Backlog Rules)
                         - 8 Actionable Student Segments
                                           │
                         [FastAPI Service & Interactive SPA UI]
                         - REST API: /api/analytics/* & /api/academic/*
                         - Executive Dashboard & Priority Attention Watchlist
                         - Searchable & Filterable Student Directory
                         - Student 360 Deep-Dive Modal with Faculty Action Logger
                         - In-App Demonstration Presentation (Deliverable 3)
```

---

## 2. Seven Categories of Integrated Student Data

| Category | Indicators Included | Normalization | Data Origin / Source |
| :--- | :--- | :--- | :--- |
| **A. Academic Data** | CGPA, SGPA, course marks (internal/external), active backlogs, semester trend | Normalized $0-100$ scale; penalized $-10$ pts per backlog | Examination Section / Marks Transcripts |
| **B. Attendance Data** | Overall %, classes attended/conducted, shortage alert ($<75\%$), detention warning ($<65\%$) | Direct percentage $[0, 100]$ | Campus Biometric RFID Gates / ERP Attendance |
| **C. LMS Activity** | Weekly login frequency, assignment completion %, late submissions, study hours | $65\%$ assignment completion + $35\%$ login frequency | VFSTR Moodle / Canvas LMS Server Logs |
| **D. Student Engagement**| Club membership, coordinator roles, hackathons, certifications, workshops | Composite index up to $100$ | Directorate of Student Affairs (SAC & Clubs) |
| **E. Placement Readiness**| Coding test score, quantitative aptitude, mock interview, CDC progress, eligibility | $40\%$ coding + $35\%$ aptitude + $25\%$ interview | Career Development Center (CDC) Portal |
| **F. Skills Assessments**| Programming proficiency, problem-solving (DSA), technical core, soft skills | Radar proficiency metrics $[0, 100]$ | Department Skill Assessment Centers |
| **G. Feedback Records** | Faculty counselor notes, student self-reflection, required academic support | Qualitative context & action logging | Faculty Mentorship & Counseling Cell |

---

## 3. Student Success Score Methodology

The Student Success Score is an explainable index ($0 - 100$) summarizing verified student indicators:

$$\text{Success Score} = \sum_{i \in \text{Available}} \left( W'_i \times S_i \right)$$

### 3.1 Provisional Indicator Weights (Configurable in Dashboard)
* **Academic Performance:** $35\%$ ($0.35$)
* **Classroom Attendance:** $20\%$ ($0.20$)
* **LMS Learning Activity:** $15\%$ ($0.15$)
* **Placement Readiness:** $15\%$ ($0.15$)
* **Skills Proficiency:** $10\%$ ($0.10$)
* **Campus Engagement:** $5\%$ ($0.05$)
* **Faculty Feedback:** Contextual validation and intervention planning.

### 3.2 Dynamic Weight Renormalization for Missing Data
When specific categories are unpopulated, weights are dynamically renormalized across genuinely available indicators:
$$W'_i = \frac{W_i}{\sum_{j \in \text{Available}} W_j}$$
* Missing indicators **never receive an arbitrary zero score**.
* Data Coverage ($\%$) and Confidence Rating (`HIGH` $\ge 85\%$, `MODERATE` $55-84\%$, `LOW` $<55\%$) are displayed separately.
* For full mathematical derivations, see [METHODOLOGY.md](file:///c:/Users/lenovo/Desktop/codebuffet/METHODOLOGY.md).

---

## 4. At-Risk Identification & Student Segmentation

### Institutional Risk Engine (VFSTR Regulation Aligned)
* **Detention Risk (`RULE_ATT_DETENTION`):** Attendance $<65.0\%$ — **HIGH RISK**. Immediate formal warning and parent consultation before semester exclusion.
* **Attendance Shortage (`RULE_ATT_SHORTAGE`):** Attendance $65.0\% - 74.9\%$ — **MODERATE RISK**. Daily biometric monitoring.
* **Multiple Backlogs (`RULE_ACAD_MULTIPLE_BACKLOGS`):** $\ge 2$ Active arrears — **HIGH RISK**. Mandatory allotment to Faculty Remedial Cell.
* **Senior Placement Lag (`RULE_PLACEMENT_UNPREPARED`):** Semester $\ge 4$ with Coding or Aptitude $<50/100$ — **MODERATE RISK**. CDC bootcamps.

### Actionable Student Segments (8 Distinct Cohorts)
1. **Star Cohort (`HIGH_ACAD_HIGH_PLACE`):** CGPA $\ge 8.0$ + Placement $\ge 70$.
2. **Placement Lag (`HIGH_ACAD_LOW_PLACE`):** CGPA $\ge 8.0$ + Placement $< 60$ (High GPA, needs interview/coding drills).
3. **High Effort / Low Yield (`LOW_ACAD_GOOD_ATTEND`):** CGPA $< 6.5$ + Attendance $\ge 80\%$ (High diligence, needs conceptual tutoring).
4. **Attendance Risk (`LOW_ATTEND_DECLINING`):** Attendance $< 75\%$ with declining semester trend.
5. **Aptitude Boost (`STRONG_TECH_LOW_APTITUDE`):** Coding $\ge 75$ + Aptitude $< 55$.
6. **Low Engagement (`HIGH_ACAD_LOW_ENGAGE`):** High GPA with minimal co-curricular or hackathon participation.
7. **Academic Support Needed (`ACADEMIC_SUPPORT_NEEDED`):** Active backlogs $\ge 1$ or CGPA $< 5.5$.
8. **Insufficient Data (`INSUFFICIENT_DATA`):** Data coverage $< 40\%$.

---

## 5. Prerequisites & Quick Start

### Prerequisites
* Python 3.10+
* Web browser (Chrome, Edge, Firefox)

### Installation
```bash
# Clone and enter directory
git clone <repo-url>
cd codebuffet

# Install required dependencies
pip install fastapi uvicorn requests beautifulsoup4 openpyxl python-dotenv
```

### Running the Complete Application
```bash
# Start FastAPI server (serves both REST API and interactive SPA dashboard)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser at:
* **Interactive Dashboard:** `http://localhost:8000/` or `http://localhost:8000/dashboard`
* **Swagger API Documentation:** `http://localhost:8000/docs`

---

## 6. Automated Testing & Verification

The test suite covers the entire pipeline, scoring engine, risk classifier, normalizer, and REST API.

```bash
# Execute the complete automated test suite
python -m unittest discover tests
```

### Actual Test Execution Output:
```
.............................................
----------------------------------------------------------------------
Ran 45 tests in 11.691s

OK
```
* **45 Tests Passed (100% Pass Rate, 0 Failures, 0 Errors)**:
  * 20 Academic Pipeline & Source Verification tests (`test_api`, `test_database`, `test_excel_extractor`, `test_html_extractor`, `test_pdf_extractor`, `test_security`, `test_validation`)
  * 13 Student Success Score, Risk Engine & Segmentation tests (`test_analytics`)
  * 5 Ingestion Normalizer, Anomaly Detection & ERP Adapter tests (`test_ingestion`)
  * 7 End-to-end Analytics REST API & Intervention tests (`test_analytics_api`)

---

## 7. Deliverables & Reference Documentation

* **Deliverable 1 (Working Prototype):** Live SPA dashboard at `http://localhost:8000/dashboard`
* **Deliverable 2 (Methodology Note):** Complete mathematical formulation in [METHODOLOGY.md](file:///c:/Users/lenovo/Desktop/codebuffet/METHODOLOGY.md)
* **Deliverable 3 (Demonstration Slides & Report):** Full 10-slide presentation deck in [DEMO_PRESENTATION.md](file:///c:/Users/lenovo/Desktop/codebuffet/DEMO_PRESENTATION.md) and inside the web dashboard under "Demonstration Slides"!
* **Vignan ERP Portal Reference:** [https://erp.vignan.ac.in/student/](https://erp.vignan.ac.in/student/)

---

## 8. Security, Privacy & Ethical Compliance

* **Least-Privilege RBAC:** Role enforcement for Admin, Faculty, Advisor, and Student.
* **No Credential Leakage:** API tokens, database secrets, and student personal phone numbers are never logged to console or committed to version control.
* **SSRF & Injection Prevention:** DNS verification blocks link-local/loopback requests; all SQL operations utilize parameterized bindings.
* **Supportive Interventions:** Non-punitive terminology ensures analytics assist student learning rather than penalize adversity.
