# CODEBUFFET — Data Dictionary & Telemetry Schema
### Field-Level Definitions, Types, Valid Ranges, and Source Mappings

---

## 1. Overview

The **CODEBUFFET** platform processes telemetry across seven core student success domains, stored across two primary persistence structures:
1. **Identifiable Operational Registry (`backend/codebuffet.db` — SQLite):** Normalized relational tables containing user credentials, verified student telemetry, and active mentoring intervention tasks.
2. **Anonymous Cohort Telemetry Benchmark (`kaggle.csv`):** 50,000 analytical records representing institutional cohort performance and historical placement outcomes.

---

## 2. SQLite Database Schema (`backend/codebuffet.db`)

### 2.1 `users` Table
Stores institutional staff, faculty mentors, placement officers, and student login accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier. |
| `email` | TEXT | UNIQUE NOT NULL | User institutional email address (case-insensitive lookup). |
| `roll_no` | TEXT | UNIQUE | Institutional roll number or employee badge identifier. |
| `password_hash` | TEXT | NOT NULL | Salted PBKDF2 hash format: `salt_hex:hash_hex` (100,000 rounds). |
| `full_name` | TEXT | NOT NULL | Display name of the user. |
| `role` | TEXT | NOT NULL | Role code: `'admin'`, `'mentor'`, `'tpo'`, `'student'`. |
| `role_label` | TEXT | NOT NULL | Human-readable role title (e.g., `'Faculty Mentor'`). |
| `department` | TEXT | NOT NULL | Institutional department assignment. |
| `avatar_url` | TEXT | | Profile image avatar URL. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp. |

---

### 2.2 `students` Table
Stores operational telemetry, readiness metrics, and decoupled risk predictions for verified enrolled students.

| Column | Type | Range / Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique student record ID. |
| `roll_no` | TEXT | UNIQUE NOT NULL | Institutional roll number (e.g., `'STU-2024-042'`). |
| `user_id` | INTEGER | FOREIGN KEY -> users(id) | Associated user account (optional for unlinked profiles). |
| `full_name` | TEXT | NOT NULL | Student's full legal name. |
| `department` | TEXT | NOT NULL | Academic branch (e.g., `'Computer Science & Engineering'`). |
| `year` | TEXT | NOT NULL | Current academic year (`'1st Year'` to `'4th Year'`). |
| `semester` | INTEGER | 1 – 8 | Active semester index. |
| `cgpa` | REAL | 0.0 – 10.0 | Cumulative Grade Point Average. |
| `backlogs` | INTEGER | >= 0 | Count of active unresolved course arrears. |
| `overall_attendance_pct`| REAL | 0.0 – 100.0% | Semester attendance percentage (statutory threshold: 75%). |
| `coding_skills` | REAL | 0.0 – 10.0 | Evaluated technical coding proficiency. |
| `dsa_score` | REAL | 0.0 – 10.0 | Data Structures & Algorithms assessment rating. |
| `aptitude_score` | REAL | 0.0 – 100.0 | Quantitative and logical reasoning aptitude score. |
| `communication_skills` | REAL | 0.0 – 10.0 | Verbal and professional communication benchmark. |
| `lms_assignment_completion_pct` | REAL | 0.0 – 100.0% | Proportion of LMS coursework submitted on time. |
| `success_score` | REAL | 0.0 – 100.0 | Composite Student Success Score (weighted multi-domain). |
| `academic_risk_prob`| REAL | 0.0 – 1.0 | Evaluated probability of academic failure or probation. |
| `academic_risk_band`| TEXT | `'LOW'`, `'MEDIUM'`, `'HIGH'` | Discrete operational academic risk category. |
| `placement_risk_prob`| REAL | 0.0 – 1.0 | Machine learning probability of non-placement. |
| `placement_risk_band`| TEXT | `'LOW'`, `'MEDIUM'`, `'HIGH'` | Discrete operational placement readiness risk category. |
| `avatar_url` | TEXT | | Student photo avatar URL. |
| `assigned_mentor` | TEXT | | Name of assigned faculty advisor (e.g., `'Prof. Rajesh Kumar'`). |

---

### 2.3 `interventions` Table
Tracks operational mentoring tasks, remediations, and advisory assignments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique intervention task identifier. |
| `student_roll_no` | TEXT | NOT NULL | Target student roll number. |
| `student_name` | TEXT | NOT NULL | Cached student name for fast reporting. |
| `department` | TEXT | NOT NULL | Student department. |
| `title` | TEXT | NOT NULL | Actionable intervention description. |
| `category` | TEXT | NOT NULL | Category: `'ACADEMIC'`, `'ATTENDANCE'`, `'SKILL_GAP'`, `'PLACEMENT'`, `'MENTORING'`. |
| `assigned_mentor` | TEXT | NOT NULL | Faculty advisor responsible for reviewing progress. |
| `status` | TEXT | `'OPEN'` / `'COMPLETED'` | Task completion lifecycle status. |
| `due_date` | TEXT | NOT NULL | Target completion date. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Task creation timestamp. |

---

## 3. Cohort Benchmark Dataset (`kaggle.csv`)

The benchmark dataset consists of **50,000 rows × 18 columns**:

| Column Name | Data Type | Description |
|---|---|---|
| `student_id` | Integer | Anonymous cohort index (1 to 50,000). |
| `branch` | String | Engineering discipline (`'CSE'`, `'ECE'`, `'EE'`, `'ME'`, `'CE'`, `'IT'`). |
| `cgpa` | Float (0–10) | Academic cumulative grade point average. |
| `backlogs` | Integer | Active historical backlogs. |
| `attendance_rate` | Float (0–100)| Aggregate cohort lecture attendance percentage. |
| `coding_score` | Float (0–100)| Standardized technical coding assessment score. |
| `dsa_score` | Float (0–100)| Data structures and algorithms score. |
| `aptitude_score` | Float (0–100)| Aptitude and logical reasoning test score. |
| `communication_score`| Float (0–100)| Communication and behavioral interview score. |
| `lms_completion` | Float (0–100)| Learning Management System engagement percentage. |
| `placement_status` | Integer (0/1)| Target label: `1` (Placed in campus drive), `0` (Unplaced). |
| `Unnamed: 15` | Null | Extraneous empty column in source dataset (50,000 null values; ignored). |
