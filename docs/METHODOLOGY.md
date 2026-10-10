# CODEBUFFET — Analytical Methodology & Algorithmic Scoring
### Mathematical Formulation of Student Success Score, Independent Risk Engines, and What-If Simulation

---

## 1. Principles of Explainable Intelligence

The CODEBUFFET scoring architecture adheres to three non-negotiable principles:
1. **Explainable Readiness Rating ≠ Actuarial Probability:** The Student Success Score is an intuitive index (0 to 100) representing holistic student preparedness, not a deterministic fatalistic probability.
2. **Decoupled Risk Engines:** Academic Risk (failure or academic probation) and Placement Risk (campus drive conversion failure) are computed and presented through separate independent mathematical models.
3. **No Silent Zeroing of Incomplete Data:** If data for a specific domain is absent, it is not zeroed; the Data Completeness metric reports missing domains transparently.

---

## 2. Student Success Score Composite Formula

The composite Student Success Score $S \in [0, 100]$ aggregates normalized indicators across six weighted dimensions:

$$S = \sum_{i=1}^{6} w_i \cdot D_i$$

Where weights and domain computations are defined as:

### 2.1 Domain Weights ($w_i$)
- Academic Performance ($w_1 = 0.35$)
- Placement Preparedness ($w_2 = 0.20$)
- Attendance Discipline ($w_3 = 0.15$)
- LMS Learning Velocity ($w_4 = 0.12$)
- Technical & Communication Competence ($w_5 = 0.10$)
- Campus Engagement ($w_6 = 0.08$)

### 2.2 Domain Value Functions ($D_i$)
1. **Academic Domain ($D_1$):**
   $$D_1 = \max\left(0, \min\left(100, \left(\frac{\text{CGPA}}{10} \times 100\right) - (\text{Backlogs} \times 12)\right)\right)$$
2. **Placement Preparedness ($D_2$):**
   $$D_2 = 0.40 \times \text{Aptitude} + 0.35 \times (\text{Coding} \times 10) + 0.25 \times (\text{DSA} \times 10)$$
3. **Attendance Discipline ($D_3$):**
   $$D_3 = \text{Attendance \%}$$
   *(Note: Attendance below the statutory 75% threshold incurs an additional parabolic risk penalty in risk evaluation).*
4. **LMS Velocity ($D_4$):**
   $$D_4 = 0.70 \times \text{Assignment Completion \%} + 0.30 \times \min\left(100, \frac{\text{Logins Per Week}}{10} \times 100\right)$$
5. **Technical & Communication Competence ($D_5$):**
   $$D_5 = 0.50 \times (\text{Coding} \times 10) + 0.30 \times (\text{System Design} \times 10) + 0.20 \times (\text{Communication} \times 10)$$
6. **Campus Engagement ($D_6$):**
   $$D_6 = \min\left(100, (\text{Hackathons} \times 30) + (\text{Certifications} \times 25) + 20\right)$$

---

## 3. Independent Decoupled Risk Classification

### 3.1 Academic Risk Engine
Academic hazard assesses the likelihood of course arrears, prerequisite failure, and academic probation. It is computed independently from placement statistics:

$$\text{Prob}_{\text{academic}} = \min\left(0.95, \max\left(0.05, 0.15 + (\text{Backlogs} \times 0.25) + \max(0, 7.0 - \text{CGPA}) \times 0.15 + \max(0, 75.0 - \text{Attendance}) \times 0.02\right)\right)$$

- **`HIGH` Risk:** $\text{Prob}_{\text{academic}} \ge 0.60$ or $\text{Backlogs} \ge 2$ or $\text{Attendance} < 65\%$
- **`MEDIUM` Risk:** $0.30 \le \text{Prob}_{\text{academic}} < 0.60$
- **`LOW` Risk:** $\text{Prob}_{\text{academic}} < 0.30$

### 3.2 Placement Risk Engine
Placement risk assesses whether a student will require skill acceleration to clear corporate eligibility filters (Tier-1 vs. Tier-2 vs. Needs Acceleration):

$$\text{Prob}_{\text{placement}} = \min\left(0.95, \max\left(0.05, 0.10 + \max(0, 6.0 - \text{Coding}) \times 0.12 + \max(0, 6.5 - \text{CGPA}) \times 0.10 + \max(0, 60.0 - \text{Aptitude}) \times 0.008\right)\right)$$

- **`HIGH` Placement Risk:** $\text{Prob}_{\text{placement}} \ge 0.60$
- **`MEDIUM` Placement Risk:** $0.30 \le \text{Prob}_{\text{placement}} < 0.60$
- **`LOW` Placement Risk:** $\text{Prob}_{\text{placement}} < 0.30$

---

## 4. Real-Time "What-If" Simulation Engine

The student cockpit features interactive simulation sliders allowing students to simulate score improvements:
- Inputs: `attendance` ($\Delta$), `coding_skills` ($\Delta$), `lms_velocity` ($\Delta$).
- The backend evaluates the composite scoring pipeline on the fly (`POST /api/student/simulate`) with a 150ms debounce, returning the projected score and sub-component contributions in real time.
