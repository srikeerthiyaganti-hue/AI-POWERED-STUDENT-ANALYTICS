# ML Models & Artifacts Registry

This directory contains the serialized machine learning models, preprocessors, and metadata artifacts for the **Smart Campus Analytics** platform.

---

## 1. Directory Contents

| File | Type | Size | Description |
| :--- | :--- | :--- | :--- |
| `academic_risk_model.joblib` | Binary (LightGBM) | ~420 KB | Predicts whether a student is at risk of semester backlog or academic probation. |
| `placement_risk_model.joblib` | Binary (LightGBM) | ~420 KB | Predicts whether a student faces placement readiness gaps or unplaced risk. |
| `feature_scaler.joblib` | Binary (StandardScaler) | ~1.5 KB | Fits the exact 17 input dimensions for normalization. |
| `model_metadata.json` | JSON | ~2.1 KB | Schema definition, input feature ordering, benchmark leaderboard, and version tags. |

---

## 2. Input Feature Contract (Exact 17 Dimensions)

When submitting a student profile to the models, features **must** be passed in this exact order:

```json
[
  "cgpa",
  "backlogs",
  "overall_attendance_pct",
  "lms_assignment_completion_pct",
  "lms_logins_per_week",
  "aptitude_score",
  "coding_skills",
  "dsa_score",
  "system_design",
  "internships",
  "projects_count",
  "certifications",
  "hackathons",
  "open_source",
  "communication_skills",
  "ml_knowledge",
  "faculty_feedback_rating"
]
```

### Feature Specification Table:

| Index | Feature Name | Expected Range | Category | Description |
| :--- | :--- | :--- | :--- | :--- |
| 0 | `cgpa` | `0.0 - 10.0` | Academic | Cumulative Grade Point Average |
| 1 | `backlogs` | `0 - 10` | Academic | Current count of active uncleared backlogs |
| 2 | `overall_attendance_pct` | `0.0 - 100.0` | Attendance | Overall semester attendance percentage |
| 3 | `lms_assignment_completion_pct` | `0.0 - 100.0` | LMS | Percentage of submitted LMS assignments |
| 4 | `lms_logins_per_week` | `0 - 30` | LMS | Average weekly portal login frequency |
| 5 | `aptitude_score` | `0.0 - 100.0` | Placement | Quantitative, logical, and verbal score |
| 6 | `coding_skills` | `0.0 - 10.0` | Placement | Practical programming assessment rating |
| 7 | `dsa_score` | `0.0 - 10.0` | Placement | Data structures and algorithms score |
| 8 | `system_design` | `0.0 - 10.0` | Skills | System architecture and design score |
| 9 | `internships` | `0 - 5` | Experience | Number of completed internships |
| 10 | `projects_count` | `0 - 10` | Experience | Number of completed technical projects |
| 11 | `certifications` | `0 - 10` | Engagement | Industry/course certifications earned |
| 12 | `hackathons` | `0 - 10` | Engagement | Hackathons or competitions participated |
| 13 | `open_source` | `0 - 10` | Engagement | Open source contributions or repositories |
| 14 | `communication_skills` | `0.0 - 10.0` | Skills | Soft skills and interview communication rating |
| 15 | `ml_knowledge` | `0.0 - 10.0` | Skills | Advanced technical / domain domain score |
| 16 | `faculty_feedback_rating` | `1.0 - 5.0` | Feedback | Faculty assessment of student discipline |

---

## 3. Backend Integration Guide

### Step 1: Install Dependencies
```bash
pip install lightgbm scikit-learn joblib
```

### Step 2: Load Models and Run Offline Inference
```python
import joblib
import json
import numpy as np

# Load once during backend server startup
scaler = joblib.load("models/feature_scaler.joblib")
academic_model = joblib.load("models/academic_risk_model.joblib")
placement_model = joblib.load("models/placement_risk_model.joblib")

with open("models/model_metadata.json", "r") as f:
    metadata = json.load(f)
feature_order = metadata["feature_columns"]

def predict_student_risk(student_dict):
    """
    Accepts student profile dict, returns risk probabilities and flags.
    """
    # 1. Order features according to schema
    raw_vector = [float(student_dict.get(feat, 0.0)) for feat in feature_order]
    
    # 2. Compute probabilities
    acad_prob = float(academic_model.predict_proba([raw_vector])[0][1])
    place_prob = float(placement_model.predict_proba([raw_vector])[0][1])
    
    # 3. Categorize risk bands
    # Note: Placement risk uses a calibrated threshold of 0.35 due to class distribution
    acad_risk_band = "HIGH" if acad_prob > 0.50 else ("MEDIUM" if acad_prob > 0.30 else "LOW")
    place_risk_band = "HIGH" if place_prob > 0.35 else ("MEDIUM" if place_prob > 0.20 else "LOW")
    
    return {
        "academic_risk": {
            "probability": round(acad_prob, 4),
            "band": acad_risk_band
        },
        "placement_risk": {
            "probability": round(place_prob, 4),
            "band": place_risk_band
        }
    }
```

---

## 4. Benchmark Performance Metrics

Derived from 50,000 empirical student records with an 80/20 held-out split (10,000 test records):

| Target | Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Academic Risk** | LightGBM | 90.97% | 0.7736 | 0.9606 | **0.8570** | **0.9497** |
| **Academic Risk** | XGBoost | 90.95% | 0.7735 | 0.9599 | **0.8566** | **0.9502** |
| **Academic Risk** | Random Forest | 90.95% | 0.7735 | 0.9599 | **0.8566** | **0.9504** |
| **Academic Risk** | Logistic Reg | 84.94% | 0.8033 | 0.6163 | **0.6975** | **0.9458** |
| **Placement Risk**| Logistic Reg | 69.30% | 0.5649 | 0.1332 | **0.2156** | **0.6572** |
| **Placement Risk**| LightGBM | 69.09% | 0.5554 | 0.1203 | **0.1978** | **0.6498** |
| **Placement Risk**| XGBoost | 69.01% | 0.5642 | 0.0944 | **0.1618** | **0.6507** |
| **Placement Risk**| Random Forest | 68.76% | 0.5900 | 0.0445 | **0.0828** | **0.6448** |
