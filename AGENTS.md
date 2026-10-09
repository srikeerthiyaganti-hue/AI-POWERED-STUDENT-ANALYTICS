# PRATIBHA — Agent Guidelines & Persistent Project Rules

This workspace contains **PRATIBHA: Student Success Intelligence Platform** (KPMG Challenge 4).

## 1. Directory Strictness & Hygiene
- All frontend application code, assets, styles, tests, and configuration must be written strictly inside `Frontend/`.
- Do not create a second project or duplicate files at the repository root.
- Backend and database development are strictly out of scope for this phase.
- Preserve existing documentation and files; avoid destructive changes.

## 2. Core Documentation References
Always consult these specifications before implementing features or making changes:
- **Coding Rules**: [Frontend/docs/CODING_RULES.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/CODING_RULES.md)
- **Product Requirements (PRD)**: [Frontend/docs/PRD.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PRD.md)
- **Project Memory**: [Frontend/docs/PROJECT_MEMORY.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/PROJECT_MEMORY.md)
- **Architecture Specification**: [Frontend/docs/ARCHITECTURE.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/ARCHITECTURE.md)
- **Design System & Tokens**: [Frontend/docs/DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md)
- **Design Tokens CSS**: [Frontend/src/styles/tokens.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/tokens.css)
- **Global CSS**: [Frontend/src/styles/global.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/global.css)

## 3. Mandatory Product Integrity Rules
1. **Never Silently Zero Missing Data**: Missing student domain data must not default to zero. Always compute and show the Data Completeness metric.
2. **Success Score ≠ Probability**: Explainable readiness rating (0–100), not an actuarial probability.
3. **Decoupled Risk Engines**: Academic Risk and Placement Risk must always be computed and presented independently.
4. **Explainability First**: Provide human-readable contributing factors for all risk alerts.
5. **Clear Demo Labeling**: Fictional synthetic records only; clear demo role switcher. Do not claim validated ML accuracy.
6. **No Brand Infringement**: Do not use official KPMG logos or imply official corporate endorsement.

## 4. Engineering & Design Standards
- **Technology**: React 18, Vite, React Router v6, Lucide React, Recharts.
- **Styling**: Vanilla CSS using centralized tokens from `tokens.css` and `global.css`. Never write hardcoded inline hex colors.
- **Dual-Atmosphere**: Cinematic dark navy hero on landing page; clean light analytics canvas on dashboards.
- **Functional Fidelity**: Zero dead buttons or broken links. Search, filters, and forms must use real reactive state. Exports must generate real files.
- **Verification**: Never claim tests or builds pass without running them. Run `npm run build` after modifications.
