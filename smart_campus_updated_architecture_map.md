# Smart Campus Analytics --- Updated Architecture Map

**Challenge:** KPMG in India --- Smart Campus Analytics: Predict,
Optimize & Improve Student Success\
**Document version:** v0.2 --- updated with Intervention Sandbox /
Student Success Decision Simulator\
**Database:** MongoDB\
**Product surfaces:** Institution Portal + Student Portal\
**Current status:** Architecture and requirements planning;
implementation has not been authorized by this document.

------------------------------------------------------------------------

## 1. Product vision

Build an Analytics & AI-powered Student Success Platform that integrates
campus data, calculates an explainable Student Success Score, identifies
academic and placement risks, and helps students and authorized
institution staff take appropriate action.

### Our differentiator: Student Success Decision Simulator

Most basic student analytics products stop at showing dashboards and
risk flags. Our platform will also help institutions **compare possible
support plans under real resource constraints**, understand the
assumptions behind each scenario, and track outcomes after
interventions.

The differentiator is a decision-support workflow, not an unsupported
promise that an AI can know the future:

`Campus Data → Data Quality → Analytics & ML → Explainable Risk/Readiness → Intervention Sandbox → Approved Intervention → Outcome Tracking → Evaluation`

The platform must not claim that an intervention causes improvement
unless the evidence and evaluation design support that conclusion.

## 2. High-level system architecture

``` mermaid
flowchart TB
    subgraph SOURCES["Campus Data Sources"]
        A1["Academic"]
        A2["Attendance"]
        A3["LMS"]
        A4["Engagement"]
        A5["Placement"]
        A6["Skills"]
        A7["Feedback"]
    end

    subgraph INGEST["Data Integration & Quality"]
        B1["CSV / JSON import"]
        B2["Schema and range validation"]
        B3["Cleaning and normalization"]
        B4["Student ID linkage"]
        B5["Missingness and data-quality report"]
    end

    subgraph DB["MongoDB Data Layer"]
        C1[("students")]
        C2[("source records")]
        C3[("feature snapshots")]
        C4[("scores and predictions")]
        C5[("segments")]
        C6[("interventions and outcomes")]
        C7[("simulation scenarios")]
        C8[("model registry and evaluation")]
        C9[("audit events")]
    end

    subgraph ML["Analytics & ML Layer"]
        D1["Feature engineering"]
        D2["Explainable Student Success Score"]
        D3["Academic risk model / rules"]
        D4["Placement risk or readiness model / rules"]
        D5["Student segmentation"]
        D6["Prediction explanations and uncertainty"]
    end

    subgraph DECISION["Decision Intelligence Layer"]
        E1["Intervention catalog and eligibility"]
        E2["Resource and capacity constraints"]
        E3["Scenario builder"]
        E4["Plan comparison"]
        E5["Assumptions, evidence and uncertainty"]
        E6["Human approval"]
        E7["Intervention outcome tracking"]
    end

    subgraph SERVICES["Application & AI Services"]
        F1["Authentication and role-based access"]
        F2["Student and cohort APIs"]
        F3["Analytics and prediction APIs"]
        F4["Scenario and intervention APIs"]
        F5["AI copilot using authorized evidence"]
    end

    subgraph PORTALS["Product Portals"]
        G1["Institution Portal"]
        G2["Student Portal"]
    end

    SOURCES --> INGEST
    INGEST --> DB
    DB <--> ML
    ML --> C4
    ML --> C5
    DB --> DECISION
    ML --> DECISION
    DECISION --> C6
    DECISION --> C7
    DB --> SERVICES
    ML --> SERVICES
    DECISION --> SERVICES
    SERVICES --> G1
    SERVICES --> G2
    G1 --> F4
    G2 --> F4
    F5 --> F1
    F5 --> F2
    F5 --> F3
```

## 3. Two portals, one shared platform

### A. Institution Portal

For authorized administrators, faculty members and placement officers: -
Campus-wide KPIs, trends and cohort analytics. - Unified student search
and detailed profiles. - Student Success Scores, score components and
explanations. - Academic risk and placement risk/readiness flags. -
Student segmentation and cohort comparisons. - Data import, validation
and quality reports. - Intervention catalog, assignment and progress
monitoring. - **Intervention Sandbox:** compare proposed plans against
capacity, eligibility and explicit assumptions. - **AI institutional
copilot:** answer questions using actual, authorized platform data.

### B. Student Portal

For an authenticated student: - Personal dashboard and Success Score. -
Own academic, attendance, LMS, engagement and skills information. - Own
risk/readiness explanations and improvement areas. - Personalized
recommendations and improvement roadmap. - Assigned mentoring or
training plans and progress. - Feedback submission. - **Personal
"what-if" pathway:** show how changing inputs changes a deterministic
score or readiness estimate; only show outcome probabilities if a
validated model supports them. - Personal AI copilot restricted to the
student's own authorized records and approved general resources.

### Access control

-   Students must never access other students' private records.
-   Institution-wide and individual-level data must be restricted by
    role and authorization.
-   Use aggregated or anonymized comparisons where appropriate.
-   AI-generated database requests must never bypass backend
    authorization.

## 4. Required data categories

The problem statement lists seven data categories:

1.  **Academic:** CGPA, internal/examination marks, backlogs and subject
    performance.
2.  **Attendance:** overall and subject-wise attendance.
3.  **LMS:** login/activity frequency and assignment completion.
4.  **Engagement:** clubs, events, hackathons, extracurricular
    activities and certifications.
5.  **Placement:** aptitude, coding assessments, mock interviews and
    placement outcomes where available.
6.  **Skills:** technical and soft-skill assessments.
7.  **Feedback:** student satisfaction and faculty feedback.

All linked records should use a stable `student_id` and suitable
time/term fields. Validate duplicate IDs, invalid ranges, inconsistent
categories, timestamps and missing fields. Never silently convert
missing data to zero.

## 5. MongoDB collection map

Initial logical collection plan; finalize fields after choosing the
dataset and target definitions.

  -----------------------------------------------------------------------
  Collection                          Purpose
  ----------------------------------- -----------------------------------
  `students`                          Stable student identity and
                                      authorized academic grouping
                                      attributes

  `academic_records`                  Semester, subject, assessment
                                      marks, CGPA/backlog indicators

  `attendance_records`                Student, course, classes
                                      attended/held, percentage and
                                      period

  `lms_activity`                      Activity counts, assignment
                                      completion and time window

  `engagement_records`                Events, clubs, hackathons,
                                      extracurriculars and certifications

  `placement_assessments`             Aptitude, coding, interview and
                                      placement-readiness observations

  `skill_assessments`                 Technical and soft-skill scores

  `feedback_records`                  Feedback responses and structured
                                      ratings with access controls

  `student_features`                  Versioned model-ready feature
                                      snapshots and feature timestamps

  `student_scores`                    Composite score, component values,
                                      formula version, calculation time
                                      and explanation

  `risk_predictions`                  Target, prediction date, model/rule
                                      version, risk band, probability if
                                      calibrated, factors and uncertainty

  `student_segments`                  Segment assignment,
                                      criteria/version, date and
                                      supporting indicators

  `intervention_catalog`              Available interventions,
                                      eligibility rules, duration,
                                      capacity/cost assumptions and
                                      intended outcomes

  `interventions`                     Student/cohort, chosen action,
                                      owner, assigned date, due date,
                                      status and outcome

  `simulation_scenarios`              Scenario inputs, selected strategy,
                                      resource constraints, eligible
                                      cohort, assumptions, estimates,
                                      uncertainty, comparison results and
                                      scenario version

  `model_registry`                    Model artifact reference, target
                                      definition, feature list, dataset
                                      version, metrics and model version

  `evaluation_runs`                   Reproducible training/evaluation
                                      configuration and held-out results

  `audit_events`                      Security-relevant access and
                                      administrative actions without
                                      unnecessary sensitive payloads
  -----------------------------------------------------------------------

Use references for unbounded historical records rather than embedding
unlimited histories in a single student document. Index `student_id`,
term/time fields, prediction target/date, intervention status and
scenario ownership as appropriate. Apply MongoDB schema validation where
practical. Do not store passwords or secrets in ordinary student
documents.

## 6. Student Success Score and ML responsibilities

Keep the following components distinct.

### A. Student Success Score

A transparent, documented composite indicator built from normalized
academic and engagement indicators.

-   Define each indicator, normalization method, weight and missing-data
    rule.
-   Version the formula.
-   Store component scores and explanations alongside the final score.
-   Do not interpret the composite score as a probability.
-   Do not penalize students simply because a source field is missing.
-   Avoid protected or sensitive attributes as scoring features.

### B. Academic risk

Define a measurable future target (for example, a course failure or
future performance band) before choosing the model. Use only features
available at the prediction date. Start with an interpretable baseline
and compare it with simple rules.

### C. Placement risk/readiness

If reliable historical outcome labels exist, define a specific target
and train/evaluate a model. If labels are unavailable or unsuitable,
provide a clearly labelled readiness index or transparent rules instead
of presenting an unvalidated model prediction as fact.

### D. Segmentation

Create understandable, actionable groups, for example: - Strong
academics but low placement readiness. - Low attendance combined with
declining assessment performance. - Strong technical skills but limited
placement preparation. - Consistently strong performance.

Segments should support constructive assistance, not stigmatizing
labels.

### E. Explainability

Each score or prediction should show its relevant drivers, observed
values, applicable thresholds or comparisons, calculation/model version,
prediction date and limitations.

## 7. Intervention Sandbox / Student Success Decision Simulator

This is the project's signature differentiator.

### Purpose

Help authorized staff compare possible support plans when staff time,
mentoring slots or training capacity is limited.

### Example user journey

1.  Select a cohort or a set of students requiring support.
2.  Choose available interventions, such as coding mentorship, aptitude
    preparation or academic mentoring.
3.  Set constraints such as 30 mentoring slots, staff availability or
    intervention duration.
4.  Choose an allocation strategy: targeted by skill gap, uniform
    support, or a mixed plan.
5.  Compare plans on eligible students, resource use, baseline
    risk/readiness and supported outcome estimates where evidence
    exists.
6.  Inspect why students were selected and which assumptions drive the
    comparison.
7.  Have an authorized staff member review and approve the plan.
8.  Track participation and subsequent outcomes after the intervention.
9.  Evaluate results honestly; do not imply causation from a simple
    before/after comparison.

### Scenario engine design

The scenario engine should initially be a deterministic, testable
decision-support module: - Validate available capacity and intervention
eligibility. - Apply explicit prioritization/allocation rules. - Report
who is included/excluded and why. - Show resource use and trade-offs. -
Separate observed baseline indicators from hypothetical inputs. -
Clearly label assumptions and uncertainty. - Never fabricate improvement
percentages.

If validated predictive estimates become feasible, show their model
version and evaluation limitations. A causal claim about intervention
effectiveness requires an appropriate evaluation design and data; an
ordinary risk model alone does not establish causality.

### Student "what-if" pathway

Students can explore how changes to attendance, assessments or skill
indicators affect a calculated score. Clearly distinguish: - **Score
simulation:** deterministic recalculation under changed hypothetical
inputs. - **Outcome prediction:** a model-estimated outcome with
validation and uncertainty. - **Causal impact:** whether an intervention
actually caused improvement, which requires stronger evidence.

## 8. ML training and evaluation workflow

``` mermaid
flowchart LR
    A["Dataset and provenance"] --> B["Define target and prediction date"]
    B --> C["Audit quality, missingness and leakage"]
    C --> D["Create time-aware/cohort-aware split"]
    D --> E["Train transparent baseline"]
    E --> F["Evaluate held-out data"]
    F --> G{"Meets pre-defined criteria?"}
    G -- "No" --> H["Review errors, features and data"]
    H --> E
    G -- "Yes" --> I["Version model and preprocessing"]
    I --> J["Inference API"]
    J --> K["Monitor data drift and later outcomes"]
    K --> L["Feed intervention outcomes into evaluation"]
```

Recommended evaluation: - Classification: precision, recall, F1,
confusion matrix and PR-AUC when classes are imbalanced; evaluate
probability calibration if probabilities are displayed. -
Prioritization: precision@k or recall@k for the number of students staff
can realistically support. - Regression, if justified: MAE/RMSE and
residual checks. - Operational: inference latency, data freshness and
missing-feature rates. - Safety/fairness: inspect error rates across
appropriate groups where lawful and supported by sufficient data; never
rely on predictions alone for consequential decisions.

Prevent leakage by ensuring all features were available at prediction
time. Use appropriate time/cohort splits and held-out testing. Record
dataset version, target, features, preprocessing, model version and
metrics for each experiment.

## 9. AI copilot boundary

The LLM is a natural-language interface and explanation assistant. It is
not the authoritative scoring engine and must not invent student records
or outcome estimates.

Recommended request flow: 1. Authenticate user and resolve role. 2.
Check authorization for the requested cohort, student and fields. 3.
Route the request to approved analytics, scenario or intervention APIs.
4. Fetch real records and calculations from the backend. 5. Ask the LLM
to summarize only the supplied evidence and assumptions. 6. Return the
time window, evidence, limitations and relevant scenario/model version.
7. Record security-relevant activity without retaining unnecessary
sensitive prompt data.

Do not permit unrestricted LLM-generated database queries or let the LLM
bypass access control.

## 10. Logical service boundaries

A modular monolith is sufficient for the hackathon prototype. Keep these
concerns separated in code: - Authentication and role-based access -
Student/cohort profiles - Data ingestion and quality reports - Feature
engineering and score calculation - Risk prediction and model
inference - Institution analytics and segmentation - Intervention
catalog and allocation rules - Scenario simulation and comparison -
Intervention outcome tracking - Student personal insights - AI copilot
using authorized APIs - Model training/evaluation and version metadata

Keep training workflows separate from online inference so models can be
retrained and evaluated without coupling training to the UI.

## 11. Round 1 implementation checklist

### Mandatory problem-statement coverage

-   [ ] All seven data categories represented in an integrated dataset.
-   [ ] Data cleaning, validation and stable student ID linkage.
-   [ ] Documented Student Success Score.
-   [ ] Academic risk identification.
-   [ ] Placement outcome risk or clearly defined placement-readiness
    identification.
-   [ ] Interactive dashboard with scores, risk flags, trends and
    student insights.
-   [ ] Working integrated-data prototype.
-   [ ] Short scoring methodology note and demo/slides.

### Differentiation and bonus capabilities

-   [ ] Student segmentation.
-   [ ] Explainable score and risk drivers.
-   [ ] Institution Intervention Sandbox with capacity constraints and
    plan comparison.
-   [ ] Student "what-if" score pathway.
-   [ ] Intervention assignment and progress tracking.
-   [ ] Outcome evaluation with honest limitations.
-   [ ] AI copilot grounded in real data and role permissions.

The Intervention Sandbox is a differentiator, but it must not delay or
replace any mandatory requirement.

## 12. Development principles

1.  Complete and test mandatory PS coverage before polishing optional
    extras.
2.  Use clearly labelled synthetic data during early development if real
    data is unavailable.
3.  Do not claim predictive performance until evaluated on held-out
    data.
4.  Separate deterministic scores, predictive models and scenario
    assumptions.
5.  Treat model outputs as decision support and keep human review for
    interventions.
6.  Keep the architecture replaceable so suitable real data can replace
    synthetic data without rebuilding the portals.
7.  Maintain a requirement-to-feature-to-test mapping for the Round 1
    evaluator.
8.  Build a small, working end-to-end path before expanding.
9.  Use privacy-conscious data access, least-privilege roles and audit
    logging.
10. Do not fabricate scenario outcome gains or claim causality from
    correlation.

## 13. Decisions still open

-   Dataset source, licensing/access and data provenance.
-   Academic and placement prediction target labels.
-   Exact Success Score indicators, weights and missing-data behavior.
-   Model selection and acceptance thresholds based on the data.
-   Frontend/backend frameworks and authentication implementation.
-   Intervention catalog, resource constraints and allocation rules.
-   Whether outcome estimates are supportable or the first version
    should remain rule-based.
-   Deployment and refresh strategy.

These decisions should be made deliberately after dataset assessment;
they are not assumed to be finalized in this document.
