# Student Success Score Methodology Note
**Smart Campus Analytics — Predict, Optimize & Improve Student Success**  
*Vignan's Foundation for Science, Technology and Research (VFSTR)*  
*Document Version: 2.1.0-explainable | Institutional Review: October 2026*

---

## 1. Executive Summary & Purpose

The **Student Success Score** is an explainable, deterministic, multi-dimensional index ranging from **0 to 100** designed to evaluate, predict, and support student success across their academic journey at VFSTR. 

Unlike traditional metrics that rely solely on historical grade point averages (CGPA) or isolated semester marks, the Student Success Score integrates real-time signals from **seven primary dimensions** of university life:
1. **Academic Performance** (CGPA, SGPA, course-wise internal/external examination scores, backlogs).
2. **Attendance Adherence** (Classroom attendance, statutory shortage warnings, detention risk).
3. **Digital Learning Activity** (LMS Moodle assignment submissions, login frequency, active learning hours).
4. **Campus & Co-Curricular Engagement** (SAC clubs, hackathons, technical conferences, certifications).
5. **Placement & Career Readiness** (Quantitative aptitude, coding assessments, technical mock interviews).
6. **Technical & Soft Skills Proficiency** (Core domain competencies, problem solving, system design, verbal communication).
7. **Faculty & Counselor Feedback** (Mentorship records, counseling check-ins, remedial support requirements).

### Core Philosophy: Supportive, Not Punitive
The platform is built on an ethical foundation of supportive intervention:
- It **never** labels a student as incapable.
- It **never** recommends punitive or disciplinary actions automatically.
- It identifies specific, actionable areas of struggle early—such as conceptual gaps in prerequisite courses or biometric attendance dips—allowing faculty mentors to deliver targeted academic and developmental support before irreparable failure occurs.

---

## 2. Integrated Data Sources & Provenance

| Dimension | Primary University Data Source | Key Indicators Ingested | Institutional Verification Status |
| :--- | :--- | :--- | :--- |
| **Academic** | VFSTR Examination Section / ERP (`erp.vignan.ac.in`) | CGPA, SGPA, internal (max 40), external (max 60), active backlogs | Official marksheet records |
| **Attendance** | Campus Biometric RFID Gates & ERP Attendance Portal | Aggregate %, classes conducted, classes attended, shortage flag | Statutory attendance registers |
| **LMS** | VFSTR Moodle / Canvas LMS Server Logs | Assignment completion %, login consistency (per wk), late submissions | System activity logs |
| **Placement** | Career Development Center (CDC) Assessment Portal | Quantitative aptitude, hands-on coding, mock interview scores | Proctored campus placement assessments |
| **Skills** | Departmental Skill Centers & Coding Challenges | Programming language proficiency, data structures & algorithms | Practical lab evaluations & hackathons |
| **Engagement** | Directorate of Student Affairs (SAC & Clubs) | Club membership, leadership roles, certifications, workshops | Verified event registers & certificates |
| **Feedback** | Faculty Mentorship & Counseling Cell | Qualitative counselor notes, remedial tutorial requirements | Authorized faculty advisor logs |

---

## 3. Mathematical Scoring Model & Indicator Normalization

The Student Success Score is calculated as a **weighted average of available, normalized indicators**. Every raw indicator is transformed into a standardized **0 to 100 scale** using deterministic, auditable rules:

### 3.1 Provisional Indicator Weights
These weights represent the baseline institutional assumptions established with academic leadership:

| Indicator Category | Configured Weight ($W_i$) | Normalization Formula |
| :--- | :---: | :--- |
| **Academic Performance** | **35%** ($0.35$) | $S_{\text{acad}} = \max\left(0, \min\left(100, \frac{\text{CGPA}}{10.0} \times 100 - (\text{Backlogs} \times 10.0)\right)\right)$ |
| **Classroom Attendance** | **20%** ($0.20$) | $S_{\text{att}} = \max\left(0, \min\left(100, \text{Attendance \%}\right)\right)$ |
| **LMS Learning Activity** | **15%** ($0.15$) | $S_{\text{lms}} = (\text{Assignment Completion \%} \times 0.65) + \left(\min\left(100, \frac{\text{Logins/wk}}{5.0} \times 100\right) \times 0.35\right)$ |
| **Placement Readiness** | **15%** ($0.15$) | $S_{\text{plc}} = (\text{Aptitude} \times 0.35) + (\text{Coding} \times 0.40) + (\text{Mock Interview} \times 0.25)$ |
| **Skills Assessments** | **10%** ($0.10$) | $S_{\text{skl}} = (\text{Programming} \times 0.40) + (\text{Problem Solving} \times 0.35) + (\text{Soft Skills} \times 0.25)$ |
| **Campus Engagement** | **5%** ($0.05$) | $S_{\text{eng}} = \min\left(100, (\text{Hackathons} \times 25) + (\text{Certs} \times 25) + (\text{Workshops} \times 15) + 10\right)$ |
| **Faculty Feedback** | *Contextual* | Used for qualitative risk adjustments, review validation, and action logs. |

---

## 4. Transparent Handling of Missing Data & Dynamic Renormalization

In real-world campus operations, certain data categories may be temporarily unpopulated (e.g., first-semester students who have not yet undertaken placement assessments, or partial ERP syncs).

### Critical Rule: Never Assign Zero to Missing Indicators
Assigning an arbitrary score of zero to an unrecorded indicator artificially pulls down a student's score and misleads counselors into believing the student failed.

### Dynamic Weight Renormalization Algorithm
When a subset of categories $\mathcal{A} \subseteq \{1, 2, \dots, 6\}$ is genuinely available:
1. Calculate the sum of configured weights for available categories:
   $$\Omega_{\text{available}} = \sum_{i \in \mathcal{A}} W_i$$
2. Compute the **Effective Weight** for each available category:
   $$W'_i = \frac{W_i}{\Omega_{\text{available}}} \quad \forall i \in \mathcal{A}$$
3. The final **Student Success Score** is calculated as:
   $$\text{Success Score} = \sum_{i \in \mathcal{A}} \left(W'_i \times S_i\right)$$
4. Calculate **Data Coverage Percentage**:
   $$\text{Data Coverage} = \Omega_{\text{available}} \times 100\%$$
5. Assign a **Confidence Level**:
   - **High Confidence**: Data Coverage $\ge 85\%$
   - **Moderate Confidence**: $55\% \le \text{Data Coverage} < 85\%$
   - **Low Confidence**: $\text{Data Coverage} < 55\%$

### Edge Case Handling
- **All Categories Missing:** Final Score = $0.0$, Coverage = $0.0\%$, Tier = `Insufficient Data`, Confidence = `LOW`.
- **Single Category Populated (e.g. CGPA only):** Effective weight becomes $1.0$. The student is scored purely on their academic performance, but their Data Coverage is accurately shown as $35\%$ with `LOW CONFIDENCE`.
- **Incomplete Profiles:** Clearly separated into the `INSUFFICIENT_DATA` student segment to prevent biased reporting.

---

## 5. Performance Tiers & Classification

| Score Range | Performance Tier | Institutional Interpretation |
| :---: | :--- | :--- |
| **85.0 – 100.0** | **Exemplary** | Outstanding multi-faceted performance. Recommended for Tier-1 product placement drives, merit scholarships, and leadership roles. |
| **70.0 – 84.9** | **Proficient** | Strong, consistent academic and co-curricular standing. Minor improvements in specific skills will elevate to top tier. |
| **50.0 – 69.9** | **Developing** | Foundational baseline met, but deficits exist in one or more areas (e.g. attendance dips or lagging coding prep). Target for mentorship. |
| **0.0 – 49.9** | **Critical Support** | Significant deficits across multiple dimensions. Immediate personalized academic recovery roadmap required. |

---

## 6. At-Risk Student Identification Engine

The platform implements an explainable, rule-based Risk Engine aligned strictly with **VFSTR Academic Regulations**:

### Institutional Rule Hierarchy
1. **Statutory Detention Risk (`RULE_ATT_DETENTION`):**
   - *Condition:* Aggregate Attendance $< 65.0\%$.
   - *Severity:* **HIGH RISK**.
   - *Evidence:* Explicit violation of Vignan statutory minimum for semester exam eligibility.
   - *Intervention:* Issue formal detention warning, review medical condonation documents, and mandate parent-mentor conference.
2. **Attendance Shortage Alert (`RULE_ATT_SHORTAGE`):**
   - *Condition:* $65.0\% \le \text{Attendance} < 75.0\%$.
   - *Severity:* **MODERATE RISK**.
   - *Evidence:* Falls below standard $75\%$ threshold required for unconditional hall ticket generation.
   - *Intervention:* Daily biometric monitoring and mentor check-ins.
3. **Multiple Course Arrears (`RULE_ACAD_MULTIPLE_BACKLOGS`):**
   - *Condition:* Active backlogs $\ge 2$.
   - *Severity:* **HIGH RISK**.
   - *Evidence:* Multiple course failures jeopardize graduation timeline and placement eligibility.
   - *Intervention:* Mandatory enrollment in Faculty Remedial Tutorial Cell.
4. **Single Course Arrear (`RULE_ACAD_SINGLE_BACKLOG`):**
   - *Condition:* Active backlogs $= 1$.
   - *Severity:* **MODERATE RISK**.
   - *Intervention:* Allot peer tutor and provide supplementary exam question banks.
5. **Critical CGPA Deficit (`RULE_ACAD_CRITICAL_CGPA`):**
   - *Condition:* Cumulative GPA $< 5.0$ (when $> 0$).
   - *Severity:* **HIGH RISK**.
   - *Intervention:* Individualized Academic Recovery Plan formulated with Department HOD.
6. **Senior Placement Gap (`RULE_PLACEMENT_UNPREPARED`):**
   - *Condition:* Semester $\ge 4$ and (Coding $< 50$ or Aptitude $< 50$).
   - *Severity:* **MODERATE RISK**.
   - *Intervention:* Mandatory registration in CDC coding bootcamps.

---

## 7. Actionable Student Segmentation

To empower faculty advisors to take concrete cohort-specific action, students are classified into **8 transparent segments**:

1. **Star Cohort (`HIGH_ACAD_HIGH_PLACE`):** CGPA $\ge 8.0$ and Placement Readiness $\ge 70$.
2. **Placement Lag (`HIGH_ACAD_LOW_PLACE`):** CGPA $\ge 8.0$ and Placement Readiness $< 60$. (High academic capability hindered by interview or coding assessment performance).
3. **High Effort / Low Yield (`LOW_ACAD_GOOD_ATTEND`):** CGPA $< 6.5$ and Attendance $\ge 80\%$. (Diligent students attending class regularly who need conceptual tutoring).
4. **Attendance Risk (`LOW_ATTEND_DECLINING`):** Attendance $< 75\%$ with declining semester trend.
5. **Aptitude Boost (`STRONG_TECH_LOW_APTITUDE`):** Strong coding ($\ge 75$) but low aptitude or soft skills ($< 55$).
6. **Low Engagement (`HIGH_ACAD_LOW_ENGAGE`):** CGPA $\ge 8.0$ with zero hackathons or verified certifications.
7. **Academic Support Needed (`ACADEMIC_SUPPORT_NEEDED`):** Active backlogs $\ge 1$ or CGPA $< 5.5$.
8. **Insufficient Data (`INSUFFICIENT_DATA`):** Data coverage $< 40\%$.

---

## 8. Faculty Interpretation & Action Guidelines

### How Faculty Advisors Should Use the Dashboard
1. **Review Priority Attention Watchlist:** The dashboard immediately bubbles up high-risk students requiring intervention this week.
2. **Inspect Full 360-Degree Profile:** Click any student to review the exact mathematical contribution of every indicator and inspect their subject-wise marksheet.
3. **Log Counselor Actions:** Use the integrated **Faculty Action Log** inside the student detail modal to record intervention notes, update review statuses, and track longitudinal progress.
4. **Simulate Custom Weights:** Adjust institutional weights in the **Scoring Model Config** panel to evaluate impact under different departmental policies.

---

## 9. Assumptions, Ethical Safeguards & Limitations

1. **Rule-Based Baseline vs. Machine Learning:** The current platform delivers a transparent, deterministic, rule-based baseline. In accordance with ethical AI standards, rule-based scores are never misrepresented as ML predictions.
2. **Absence of Proof is Not Proof of Absence:** Missing records (e.g. unrecorded hackathons) are represented explicitly as missing rather than assumed to be zero.
3. **Data Protection:** Personal contact information and sensitive disciplinary records are protected behind role-based access control. No credentials or personal records are exposed in system logs.
