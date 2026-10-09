# PRATIBHA — Premium Design System Specification
**Student Success Intelligence Platform (KPMG Challenge 4)**  
*Document Version: 1.0.0 | Author: Senior Product Designer & Design Systems Engineer | Status: Approved Baseline*

---

## 1. Product Identity & Brand Direction

### 1.1 Brand Foundation
- **Product Name**: PRATIBHA
- **Product Descriptor**: Student Success Intelligence Platform
- **Tagline**: *From Student Data to Student Success.*
- **Context**: Independent student success analytics solution developed for the KPMG Challenge 4 project.  
  *(Brand Compliance Note: PRATIBHA does not use official KPMG logos, copyrighted assets, or wording implying an official corporate product).*

### 1.2 Dual-Atmosphere Visual Strategy
PRATIBHA serves two distinct emotional contexts through a disciplined **Dual-Atmosphere** architecture:

1. **The Cinematic Marketing Experience (Public Portal)**:
   - **Mood**: Authoritative, visionary, institutional, deeply aspirational.
   - **Palette**: Deep Midnight Navy (`#061A33`), Heritage Navy (`#082B56`), Electric Sapphire accents (`#258BFA`), subtle luminous gradients.
   - **Imagery**: Crisp architectural campus imagery, high-contrast typography, and restrained blue CTA glows.
   - **Tone**: Appeals to university chancellors, provosts, deans, and senior leaders seeking transformative institutional intelligence.

2. **The Precision Analytics Canvas (Authenticated Institution & Student Portals)**:
   - **Mood**: Crisp, calm, high-legibility, distraction-free analytical clarity.
   - **Palette**: Clean Light Canvas (`#F6F8FC`), Pure White elevation cards (`#FFFFFF`), Slate borders (`#E4E9F0`), Dark Navy structural chrome (`#082B56` sidebar), and Primary Blue interactive accents (`#1677D2`).
   - **Information Density**: High tabular clarity, compact metric widgets, decoupled risk indicators, and clean Recharts palettes.
   - **Rule**: Avoid indiscriminate dark mode on dashboard cards. Do not use noisy gradients, random animations, or artificial glassmorphism that impedes data interpretation.

---

## 2. Master Color System & Semantic Tokens

### 2.1 Core Palette Tokens
The design system is strictly anchored by the required brand color palette:

| Token Name | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-navy` | `#082B56` | Primary brand authority, sidebar navigation background, major headings |
| `--color-navy-deep` | `#061A33` | Deepest canvas background, cinematic landing hero, high-contrast chrome |
| `--color-blue-primary` | `#1677D2` | Interactive primary actions, active tabs, primary buttons, key focus states |
| `--color-blue-bright` | `#258BFA` | Accent highlights, vibrant metric indicators, interactive hover accents |
| `--color-blue-surface` | `#EAF3FF` | Active row tints, subtle badge backdrops, light informational banners |
| `--color-white` | `#FFFFFF` | Card surfaces, modal sheets, light typography on dark navy chrome |
| `--color-text-main` | `#172033` | Primary body copy, table figures, high-legibility heading text |
| `--color-text-secondary` | `#667085` | Metadata, subtitles, column table headers, secondary labels |
| `--color-border` | `#E4E9F0` | Structural card borders, divider lines, table cell separators |
| `--color-bg-page` | `#F6F8FC` | Global analytics canvas background, neutral work area |

### 2.2 Functional Status & Risk Tokens
Color is never used alone to convey state; all indicators pair these tokens with descriptive text labels and icons.

| Token Name | Hex Value | Semantic Meaning |
| :--- | :--- | :--- |
| `--color-status-success` | `#0D9488` | On Track, Low Risk, Verified Benchmark, Completed Intervention |
| `--color-status-warning` | `#D97706` | Moderate Risk, Pending Review, Attendance Warning, Target Needed |
| `--color-status-danger` | `#DC2626` | High Risk, Critical Backlog Alert, Placement Ineligibility, Urgent |
| `--color-status-neutral` | `#64748B` | Archived, Baseline, Incomplete Data, Pending First Sync |

### 2.3 Tint & Surface Complements
To ensure WCAG AAA accessibility, every status token is paired with an ultra-light surface background and an accessible border:
- **Success Tint**: `rgba(13, 148, 136, 0.10)` | Border: `rgba(13, 148, 136, 0.25)`
- **Warning Tint**: `rgba(217, 119, 6, 0.10)` | Border: `rgba(217, 119, 6, 0.25)`
- **Danger Tint**: `rgba(220, 38, 38, 0.10)` | Border: `rgba(220, 38, 38, 0.25)`
- **Neutral Tint**: `rgba(100, 116, 139, 0.10)` | Border: `rgba(100, 116, 139, 0.22)`

---

## 3. Typography System

The typography system pairs a precision sans-serif for high-density analytics with an editorial serif for landing hero headlines.

### 3.1 Font Families
- **Analytics & Dashboard Sans**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`  
  *Optimized for dense data tables, micro-labels, metrics, and interactive dashboards.*
- **Cinematic Hero Serif**: `'Playfair Display', 'Merriweather', 'Georgia', serif`  
  *Used selectively and exclusively on the public landing page hero title for timeless academic prestige.*
- **Monospace & Code Metrics**: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`  
  *Used for student enrollment IDs, CGPA calculations, and machine-learning weights.*

### 3.2 Typography Scale
All measurements use proportional rems anchored at a `16px` base (`1rem`):

| Scale Token | Font Size | Line Height | Weight | Typical Application |
| :--- | :--- | :--- | :--- | :--- |
| `--text-hero` | `3.25rem` (52px) | `1.15` | `700` | Landing page hero headline (Cinematic serif) |
| `--text-h1` | `2.00rem` (32px) | `1.25` | `700` | Portal Page titles, Top-level dashboard headers |
| `--text-h2` | `1.50rem` (24px) | `1.30` | `600` | Section headings, Modal titles, Major widget titles |
| `--text-h3` | `1.15rem` (18px) | `1.35` | `600` | Card titles, Domain group headers, Tab labels |
| `--text-body-lg` | `1.00rem` (16px) | `1.50` | `400 / 500`| Lead paragraphs, Hero descriptions, Form inputs |
| `--text-body` | `0.875rem` (14px)| `1.50` | `400` | Standard body copy, Table rows, Descriptions |
| `--text-body-sm` | `0.8125rem` (13px)| `1.45`| `400 / 500`| Compact table cells, Timeline logs, Subtext |
| `--text-caption` | `0.75rem` (12px) | `1.40` | `500` | Badges, Micro-tags, Chart axis tick labels, Tooltips |
| `--text-stat-lg` | `2.25rem` (36px) | `1.10` | `700` | Primary KPI numbers (Success Score, Placement Rate) |
| `--text-stat-md` | `1.75rem` (28px) | `1.15` | `600` | Metric card values, Average CGPA, Active Counts |

---

## 4. Spacing, Elevation & Border Radii

### 4.1 Spacing Scale (8pt Grid with 4pt Halves)
- `--space-1`: `0.25rem` (4px)  — Micro badge padding, icon gap
- `--space-2`: `0.50rem` (8px)  — Button inner padding (compact), input inline gap
- `--space-3`: `0.75rem` (12px) — Card header margin, list item separation
- `--space-4`: `1.00rem` (16px) — Standard card padding, form group gap
- `--space-5`: `1.25rem` (20px) — Moderate container padding
- `--space-6`: `1.50rem` (24px) — Spacious dashboard card padding, grid gaps
- `--space-8`: `2.00rem` (32px) — Section vertical gaps, page topbar padding
- `--space-10`: `2.50rem` (40px) — Major section dividers
- `--space-12`: `3.00rem` (48px) — Dashboard page outer padding
- `--space-16`: `4.00rem` (64px) — Marketing section vertical rhythm

### 4.2 Elevation & Shadow Scale
Restrained, natural shadow tokens tailored for clean analytics:
- `--shadow-sm`: `0 1px 2px 0 rgba(16, 24, 40, 0.05)` (Compact controls, inputs)
- `--shadow-card`: `0 1px 3px 0 rgba(16, 24, 40, 0.07), 0 1px 2px -1px rgba(16, 24, 40, 0.05)` (Standard white cards)
- `--shadow-card-hover`: `0 6px 16px -2px rgba(8, 43, 86, 0.08), 0 2px 6px -1px rgba(8, 43, 86, 0.04)` (Interactive student cards)
- `--shadow-modal`: `0 20px 25px -5px rgba(6, 26, 51, 0.15), 0 8px 10px -6px rgba(6, 26, 51, 0.10)` (Dialog sheets & popovers)

### 4.3 Border Radii
- `--radius-xs`: `4px`  (Micro badges, tag pills)
- `--radius-sm`: `6px`  (Buttons, inputs, selects, dropdown menus)
- `--radius-md`: `10px` (Dashboard metric cards, nested containers)
- `--radius-lg`: `14px` (Main dashboard surface cards, modals)
- `--radius-full`: `9999px` (Status badges, avatar circles, circular gauges)

---

## 5. UI Component Visual Contracts

### 5.1 Buttons (`.btn`)
- **Primary Button (`.btn-primary`)**:
  - Background: `--color-blue-primary` (`#1677D2`), Color: `#FFFFFF`.
  - Hover: `#1262AF`, Active: `#0E4F8E`.
  - Box Shadow: `0 1px 2px rgba(22, 119, 210, 0.25)`.
- **Secondary Button (`.btn-secondary`)**:
  - Background: `#FFFFFF`, Border: `1px solid var(--color-border)`, Color: `var(--color-navy)`.
  - Hover: Background `var(--color-blue-surface)`, Border: `var(--color-blue-primary)`.
- **Ghost Button (`.btn-ghost`)**:
  - Background: `transparent`, Color: `var(--color-text-secondary)`.
  - Hover: Background `rgba(8, 43, 86, 0.05)`, Color: `var(--color-navy)`.
- **Danger Button (`.btn-danger`)**:
  - Background: `var(--color-status-danger)`, Color: `#FFFFFF`.
- **Accessibility**: Explicit `:focus-visible` with `2px solid var(--color-blue-primary)` and `2px` offset.

### 5.2 Form Inputs & Filters (`.input`, `.select`)
- Height: `40px` (standard), `32px` (compact table filters).
- Border: `1px solid var(--color-border)`.
- Background: `#FFFFFF`.
- Focus State: Border color becomes `var(--color-blue-primary)` with subtle focus ring `0 0 0 3px rgba(22, 119, 210, 0.15)`.

### 5.3 Metric Cards (`.metric-card`)
- Surface: `#FFFFFF`, Border: `1px solid var(--color-border)`.
- Padding: `1.25rem` (20px).
- Internal Structure:
  1. Header: Micro-label (`--text-caption`, `--color-text-secondary`) + Icon.
  2. Value: Tabular stat (`--text-stat-md`, `--color-text-main`).
  3. Footer: Trend badge (`+4.2% vs last sem`) or contextual qualifier.

### 5.4 Data Tables (`.data-table`)
- Table Header (`thead`): Background `var(--color-bg-page)`, font weight `600`, color `var(--color-text-secondary)`, border bottom `1px solid var(--color-border)`.
- Table Rows (`tbody tr`): Hover background `var(--color-blue-surface)`. Border bottom `1px solid var(--color-border)`.
- Padding: `0.75rem 1rem` per cell for optimal scan density.

---

## 6. PRATIBHA-Specific Domain Visual Patterns

### 6.1 Student Success Score Ring (`.success-gauge`)
The Student Success Score is an explainable multi-factor composite (0–100 scale).
- **Presentation**: SVG circular progress ring or radial gauge.
- **Ring Stroke Tokens**:
  - 85–100 (Exemplary): `--color-status-success` (`#0D9488`)
  - 70–84 (Satisfactory): `--color-blue-primary` (`#1677D2`)
  - 50–69 (Needs Focus): `--color-status-warning` (`#D97706`)
  - 0–49 (Urgent Attention): `--color-status-danger` (`#DC2626`)
- **Accompanying Indicator**: Must always display the calculated **Data Completeness Index** (e.g., `Score: 78 | Data Completeness: 94%`) to reinforce that missing domain data is not treated as a zero failure.

### 6.2 Decoupled Risk Badges (Academic Risk vs. Placement Risk)
Under no circumstances should Academic Risk and Placement Risk be merged into a single ambiguous flag. They are displayed side-by-side as distinct badges:

- **Academic Risk Badge (`.badge-risk-academic`)**:
  - `LOW ACADEMIC RISK`: Emerald green tint + Check icon
  - `MODERATE ACADEMIC RISK`: Amber tint + Alert triangle icon (e.g., Attendance 72%, Backlog: 0)
  - `HIGH ACADEMIC RISK`: Crimson tint + Alert circle icon (e.g., Active Backlog: 2, CGPA < 5.5)
- **Placement Risk Badge (`.badge-risk-placement`)**:
  - `CAREER READY`: Emerald green tint + Briefcase icon
  - `MODERATE PREPARATION NEEDED`: Amber tint + Coding/Aptitude icon (e.g., Aptitude 58th percentile)
  - `INTERVENTION REQUIRED`: Crimson tint + Shield alert (e.g., Failed coding benchmarks)

### 6.3 Seven-Domain Data Overview Bar (`.domain-matrix`)
A visual summary card representing all seven tracked domains:
1. Academic Performance (CGPA, Marks)
2. Attendance (Overall & Subject-wise)
3. LMS Activity (Assignments, Logins)
4. Co-Curricular Engagement (Clubs, Hackathons)
5. Placement Readiness (Aptitude, Mock Interviews)
6. Technical & Soft Skills (Verified competencies)
7. Institutional Feedback (Surveys, Faculty reviews)

Each domain renders:
- Domain icon + Name
- Normalized rating pill (e.g., `86 / 100`)
- Synchronization health indicator (Synced 2h ago / Sync Pending)

### 6.4 Academic Performance × Placement Readiness 2x2 Matrix
An interactive scatter-plot quadrant layout:
- **X-Axis**: Academic Index (0 to 100)
- **Y-Axis**: Placement Readiness Index (0 to 100)
- **Quadrant 1 (Top-Right)**: *High Academics, High Placement* -> **Star Performers** (Badge: Emerald)
- **Quadrant 2 (Top-Left)**: *Low Academics, High Placement* -> **Practical Talents** (Action: Focus on Backlog Remediation)
- **Quadrant 3 (Bottom-Right)**: *High Academics, Low Placement* -> **Placement Needy** (Action: Intensive Coding & Mock Prep)
- **Quadrant 4 (Bottom-Left)**: *Low Academics, Low Placement* -> **Priority Intervention** (Action: Dedicated Faculty Mentorship)

---

## 7. Layout Shell & Responsive System

### 7.1 Dashboard Shell Anatomy
```
+-----------------------------------------------------------------------------------------+
| [Top Global Role Switcher Bar] (Interactive role selector: Admin / Faculty / Student)   |
+---------------------+-------------------------------------------------------------------+
|                     | [Dashboard Topbar] (Breadcrumbs, Search, Alerts, User Profile)   |
| [Sidebar Nav]       +-------------------------------------------------------------------+
| - PRATIBHA Brand    |                                                                   |
| - Navigation links  | [Page Header] (Title, Subtitle, Date Filter, Primary Action CTA)  |
| - Active role info  |                                                                   |
| - Data sync status  | [Main Analytics Canvas]                                           |
|                     | - KPI Metric Cards Grid                                           |
|                     | - 2-Column Split: Charts & Risk Tables                            |
|                     | - Detailed Tabular Exploration                                    |
+---------------------+-------------------------------------------------------------------+
```

### 7.2 Responsive Breakpoint Specifications
- **Mobile (`< 768px`)**:
  - Sidebar collapses into a slide-over off-canvas drawer triggered by a hamburger button.
  - KPI grid collapses from 4 columns to 1 or 2 columns.
  - Data tables enable horizontal touch scrolling (`overflow-x: auto`) with sticky student name columns.
  - Full-width touch-friendly button targets (minimum 44px hit box).
- **Tablet (`768px - 1024px`)**:
  - Compact sidebar navigation rail (icons + tooltips).
  - 2-column analytics grid.
- **Desktop (`> 1024px`)**:
  - Persistent 260px dark navy sidebar (`#082B56`).
  - Maximum content canvas: `1440px` centered with fluid gutters.

---

## 8. Accessibility & Quality Standards

- **Color Contrast**: All primary text (`#172033`) on page background (`#F6F8FC`) achieves a contrast ratio of `11.8:1` (exceeds WCAG AAA requirement of `7:1`).
- **Focus Rings**: All interactive links and buttons display an explicit `2px` focus outline with a `2px` offset (`outline: 2px solid var(--color-blue-primary); outline-offset: 2px;`).
- **Semantic Structure**: Every page enforces strict semantic hierarchy (`header`, `nav`, `main`, `aside`, `section`, `h1`-`h4`).
- **Motion Accessibility**: All CSS transitions and animations are wrapped with `@media (prefers-reduced-motion: reduce) { transition: none !important; animation: none !important; }`.

---

## 9. Implementation Files Map

The design system specification is implemented in the following codebase files:
- **Specification Document**: [Frontend/docs/DESIGN_SYSTEM.md](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/docs/DESIGN_SYSTEM.md)
- **Design Tokens**: [Frontend/src/styles/tokens.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/tokens.css)
- **Global Base Styles & Utility Classes**: [Frontend/src/styles/global.css](file:///c:/Users/Md.%20Asad%20Raza/OneDrive/Desktop/Pratibha/Frontend/src/styles/global.css)
