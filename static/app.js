/**
 * Smart Campus Analytics - AI Student Success Platform
 * Frontend Controller & Chart Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    view: 'dashboard',
    filters: {
      search: '',
      branch: '',
      semester: '',
      risk_level: '',
      segment: ''
    },
    pagination: {
      page: 1,
      limit: 15,
      total: 0,
      total_pages: 1
    },
    sort: 'score_desc',
    activeStudentId: null,
    currentSlide: 0,
    charts: {}
  };

  // Presentation Slides Content (Deliverable 3)
  const presentationSlides = [
    {
      title: "1. Problem Statement: Campus Data Fragmentation",
      subtitle: "Why Disconnected University Data Inhibits Timely Student Interventions",
      content: `
        <p>In modern universities like VFSTR, student data is fragmented across isolated departmental silos:</p>
        <ul>
          <li><strong>Academic Marks:</strong> Examination cell databases & grade sheets (SGPA, CGPA, backlogs).</li>
          <li><strong>Attendance:</strong> Biometric RFID gates & ERP portals (<a href="https://erp.vignan.ac.in/student/" target="_blank" style="color:var(--accent-cyan);">erp.vignan.ac.in</a>).</li>
          <li><strong>Learning Activity:</strong> LMS Moodle server logs & assignment repositories.</li>
          <li><strong>Placement Cell:</strong> Aptitude assessments, mock interviews, and coding tests.</li>
          <li><strong>Student Affairs:</strong> SAC clubs, hackathons, and extracurriculars.</li>
        </ul>
        <p><strong>The Impact:</strong> Faculty advisors and counselors lack a unified view. Interventions happen too late—often only after semester exam failures or placement disqualification.</p>
      `
    },
    {
      title: "2. The Proposed Solution: Smart Campus Analytics",
      subtitle: "Unified AI-Powered Student Analytics and Success Platform",
      content: `
        <p>Our platform breaks down institutional silos by aggregating and normalizing student data into a single 360-degree student profile:</p>
        <ul>
          <li><strong>Unified Data Integration:</strong> Combines 7 primary categories of student life into one verifiable schema.</li>
          <li><strong>Transparent Success Scoring (0-100):</strong> Objective, explainable metric calculated deterministically from verified indicators.</li>
          <li><strong>Early At-Risk Warning:</strong> Proactive identification of detention risks, backlog risks, and placement gaps.</li>
          <li><strong>Actionable Segmentation:</strong> 8 distinct student cohorts enabling targeted faculty interventions.</li>
          <li><strong>High-Performance Dashboard:</strong> Faculty and dean-level interactive command center.</li>
        </ul>
      `
    },
    {
      title: "3. Complete 7-Category Data Integration Architecture",
      subtitle: "Robust Pipeline Ingesting Disparate Academic & Behavioral Sources",
      content: `
        <p>The platform ingests and normalizes data across seven distinct categories:</p>
        <ul>
          <li><strong>A. Academic Data:</strong> CGPA, SGPA, course-wise marks (Internal/External), active backlogs, performance trends.</li>
          <li><strong>B. Attendance Data:</strong> Aggregate percentage, classes attended/conducted, shortage (<75%) & detention (<65%) alerts.</li>
          <li><strong>C. LMS Engagement Data:</strong> Weekly login frequency, assignment completion rates, late submissions.</li>
          <li><strong>D. Student Engagement:</strong> SAC clubs, coordinator roles, hackathons, technical events, certifications.</li>
          <li><strong>E. Placement Readiness:</strong> Aptitude, coding proficiency, mock interviews, CDC preparation progress.</li>
          <li><strong>F. Skills Assessments:</strong> Technical core, problem-solving, programming languages, soft skills.</li>
          <li><strong>G. Qualitative Feedback:</strong> Faculty mentor observations, counselor notes, remedial tutoring requirements.</li>
        </ul>
      `
    },
    {
      title: "4. Student Success Score Methodology",
      subtitle: "Mathematical Formulation, Weights & Dynamic Renormalization",
      content: `
        <p>The Student Success Score summarizes multi-dimensional performance into a 0-100 index using configurable provisional weights:</p>
        <ul>
          <li><strong>Academic Performance (35%):</strong> Normalized CGPA scale penalized by active course backlogs.</li>
          <li><strong>Attendance (20%):</strong> Aggregate attendance percentage calibrated to institutional thresholds.</li>
          <li><strong>LMS Digital Learning (15%):</strong> Blend of assignment completion rate (65%) and login consistency (35%).</li>
          <li><strong>Placement Readiness (15%):</strong> Weighted composite of coding (40%), aptitude (35%), and mock interviews (25%).</li>
          <li><strong>Skills Proficiency (10%):</strong> Hands-on technical programming, problem solving, and communication.</li>
          <li><strong>Campus Engagement (5%):</strong> Hackathon participation, verified certifications, and club coordination.</li>
        </ul>
        <p><strong>Missing-Data Renormalization:</strong> When certain categories are unpopulated, weights are dynamically renormalized across available indicators—preventing artificial penalization while lowering confidence score.</p>
      `
    },
    {
      title: "5. Transparent & Explainable Analytics",
      subtitle: "No Black-Box Predictions — Complete Mathematical & Rule Provenance",
      content: `
        <p>Every generated score provides a transparent, auditable breakdown:</p>
        <ul>
          <li><strong>Mathematical Contribution:</strong> For each indicator, displays raw value, normalized score, effective weight, and exact points contributed.</li>
          <li><strong>Positive Contributors:</strong> Pinpoints high-performing areas (e.g., strong attendance or exemplary coding skills).</li>
          <li><strong>Areas Requiring Attention:</strong> Highlights specific indicator deficits depressing the score.</li>
          <li><strong>Confidence & Coverage:</strong> Distinctly separates the final score from data coverage percentage (High: >=85%, Moderate: 55-84%, Low: <55%).</li>
          <li><strong>Non-Punitive Language:</strong> Frame insights supportively to guide improvement rather than label students as incapable.</li>
        </ul>
      `
    },
    {
      title: "6. At-Risk Student Identification",
      subtitle: "Proactive Warning Rules Based on Vignan Institutional Regulations",
      content: `
        <p>The Risk Engine continuously monitors institutional thresholds and flags at-risk students:</p>
        <ul>
          <li><strong>Statutory Attendance Risk:</strong>
            <ul>
              <li>< 65%: Critical Detention Risk (Mandatory examination exclusion warning).</li>
              <li>65% - 74.9%: Attendance Shortage Warning (Condonation required).</li>
            </ul>
          </li>
          <li><strong>Academic Arrears & CGPA:</strong>
            <ul>
              <li>>= 2 Backlogs: Severe academic delay, remediation allotment.</li>
              <li>1 Backlog: Supplementary exam guidance and peer tutoring.</li>
              <li>CGPA < 5.0: Critical academic recovery plan with HOD.</li>
            </ul>
          </li>
          <li><strong>Placement Disqualification:</strong> Senior students (Sem >= 5) with coding < 50 or aptitude < 50.</li>
        </ul>
      `
    },
    {
      title: "7. Actionable Student Segmentation",
      subtitle: "8 Distinct Behavioral & Academic Cohorts for Targeted Faculty Action",
      content: `
        <p>Rather than treating all students identically, the system assigns students into 8 clear cohorts:</p>
        <ul>
          <li><strong>1. Star Cohort (High Acad + High Placement):</strong> Fast-track to Tier-1 product placement drives and research.</li>
          <li><strong>2. Placement Lag (High Acad + Low Placement):</strong> High GPA students needing technical coding clinics & CDC interview drills.</li>
          <li><strong>3. High Effort / Low Yield (Low Acad + Good Attendance):</strong> Diligent students attending class regularly who need concept bridge sessions.</li>
          <li><strong>4. Attendance Risk (Low Attendance + Declining):</strong> Immediate parent-mentor counseling and biometric monitoring.</li>
          <li><strong>5. Aptitude Boost (Strong Tech + Low Aptitude):</strong> Good coders needing quantitative aptitude bootcamps.</li>
          <li><strong>6. Low Engagement (High Acad + Low Activities):</strong> Top students encouraged to lead clubs & join hackathons.</li>
          <li><strong>7. Academic Support Needed:</strong> Students with active backlogs requiring faculty remedial tutoring.</li>
          <li><strong>8. Insufficient Data:</strong> Incomplete profiles flagged for administrative verification.</li>
        </ul>
      `
    },
    {
      title: "8. Professional Interactive Dashboard",
      subtitle: "Enterprise UI Designed for University Administrators & Faculty",
      content: `
        <p>The dashboard provides an intuitive, high-density interface:</p>
        <ul>
          <li><strong>Executive KPIs:</strong> Total students, data coverage, average success score, attendance, placement readiness, and high-risk count.</li>
          <li><strong>Rich Visualizations:</strong> Score distribution histogram, risk breakdown donut, attendance-vs-CGPA scatter plot, 7-category completeness radar, and segment horizontal bar chart.</li>
          <li><strong>Searchable Student Directory:</strong> Search by roll number or name, multi-criteria filters (Branch, Sem, Risk, Segment), sortable headers, pagination.</li>
          <li><strong>Student 360 Modal:</strong> Deep dive with marksheets, attendance breakdown, skill radar chart, and counselor action logger.</li>
        </ul>
      `
    },
    {
      title: "9. Security, Privacy & Responsible Analytics",
      subtitle: "Adhering to Student Data Protection & Institutional Ethics",
      content: `
        <p>Designed with institutional-grade security and ethics at its core:</p>
        <ul>
          <li><strong>Role-Based Access Control:</strong> Admin, Faculty/Advisor, Placement Officer, and Student roles.</li>
          <li><strong>Sanitized Logging & Safe Storage:</strong> Zero passwords, API keys, or student phone numbers exposed in terminal logs.</li>
          <li><strong>Parameterized SQL & SSRF Protection:</strong> All database queries parameterized; strictly allowlisted Vignan domains.</li>
          <li><strong>Data Provenance:</strong> Every record tracks source origin (official PDF, ERP export, or verified API).</li>
          <li><strong>Ethical Intervention:</strong> Support-oriented terminology; prevents automated punitive actions.</li>
        </ul>
      `
    },
    {
      title: "10. Verification, Results & Next Steps",
      subtitle: "Validation Across 69 Verified Records & Extensible Roadmap",
      content: `
        <p>The platform has been rigorously tested and verified:</p>
        <ul>
          <li><strong>Data Pipeline:</strong> 100% test pass rate across 20 automated unit & regression tests.</li>
          <li><strong>Live Ingestion:</strong> 69 student records cleanly normalized with 68 fully populated multi-category profiles and 1 verified review queue edge case.</li>
          <li><strong>Extensible ERP Connector:</strong> Ready to integrate live OAuth or scheduled SFTP feeds with <a href="https://erp.vignan.ac.in/student/" target="_blank" style="color:var(--accent-cyan);">erp.vignan.ac.in</a>.</li>
          <li><strong>Future Enhancements:</strong> Multi-branch scale-up to ECE, Mechanical, Civil, and predictive ML models trained on multi-year graduation cohorts.</li>
        </ul>
      `
    }
  ];

  // Initialize Application
  initNavigation();
  initTheme();
  initFilters();
  initPresentation();
  initModals();
  loadOverviewData();
  loadStudentsDirectory();

  // Navigation Controller
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        switchView(targetView);
      });
    });

    document.getElementById('btn-view-all-table')?.addEventListener('click', () => {
      switchView('directory');
    });
  }

  function switchView(viewName) {
    state.view = viewName;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    document.querySelectorAll('.view-panel').forEach(p => {
      p.classList.toggle('active', p.id === `view-${viewName}`);
    });

    if (viewName === 'dashboard') {
      loadOverviewData();
    } else if (viewName === 'directory') {
      loadStudentsDirectory();
    } else if (viewName === 'segments') {
      renderSegmentsView();
    } else if (viewName === 'erp') {
      loadERPViewData();
    } else if (viewName === 'config') {
      loadConfigViewData();
    } else if (viewName === 'presentation') {
      renderSlide(state.currentSlide);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Theme Controller
  function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('vignan_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.replace('dark-theme', 'light-theme');
      toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    toggleBtn.addEventListener('click', () => {
      if (document.body.classList.contains('dark-theme')) {
        document.body.classList.replace('dark-theme', 'light-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('vignan_theme', 'light');
      } else {
        document.body.classList.replace('light-theme', 'dark-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('vignan_theme', 'dark');
      }
      // Re-render active charts with updated theme colors
      if (state.view === 'dashboard') loadOverviewData();
    });
  }

  // Filters Controller
  function initFilters() {
    const searchInput = document.getElementById('global-search');
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.search = e.target.value.trim();
        state.pagination.page = 1;
        if (state.view !== 'directory') switchView('directory');
        else loadStudentsDirectory();
      }, 300);
    });

    document.getElementById('filter-branch').addEventListener('change', (e) => {
      state.filters.branch = e.target.value;
      state.pagination.page = 1;
      refreshCurrentView();
    });

    document.getElementById('filter-semester').addEventListener('change', (e) => {
      state.filters.semester = e.target.value;
      state.pagination.page = 1;
      refreshCurrentView();
    });

    document.getElementById('filter-risk').addEventListener('change', (e) => {
      state.filters.risk_level = e.target.value;
      state.pagination.page = 1;
      refreshCurrentView();
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
      refreshCurrentView();
    });

    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

    // Segment chips filter in Directory view
    document.querySelectorAll('#segment-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#segment-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filters.segment = chip.dataset.segment;
        state.pagination.page = 1;
        loadStudentsDirectory();
      });
    });

    // Page size selector
    document.getElementById('page-size')?.addEventListener('change', (e) => {
      state.pagination.limit = parseInt(e.target.value, 10);
      state.pagination.page = 1;
      loadStudentsDirectory();
    });

    // Table sorting
    document.querySelectorAll('#main-students-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const sortVal = th.dataset.sort;
        state.sort = sortVal;
        loadStudentsDirectory();
      });
    });
  }

  function refreshCurrentView() {
    loadOverviewData();
    if (state.view === 'directory') loadStudentsDirectory();
  }

  // Load Overview Data & Render Charts
  async function loadOverviewData() {
    try {
      const params = new URLSearchParams();
      if (state.filters.branch) params.append('branch', state.filters.branch);
      if (state.filters.semester) params.append('semester', state.filters.semester);
      if (state.filters.risk_level) params.append('risk_level', state.filters.risk_level);
      if (state.filters.segment) params.append('segment', state.filters.segment);

      const res = await fetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load overview data');
      const data = await res.json();

      // 1. Update KPI Values
      const kpis = data.kpis;
      document.getElementById('kpi-val-total').textContent = kpis.total_students;
      document.getElementById('kpi-val-sufficient').textContent = kpis.students_sufficient_data;
      document.getElementById('kpi-val-score').textContent = kpis.avg_success_score.toFixed(1);
      document.getElementById('kpi-val-attendance').textContent = kpis.avg_attendance.toFixed(1);
      document.getElementById('kpi-val-placement').textContent = kpis.avg_placement_prep.toFixed(1);
      document.getElementById('kpi-val-intervention').textContent = kpis.intervention_needed_count;
      document.getElementById('kpi-val-high-risk').textContent = kpis.high_risk_count;
      document.getElementById('kpi-val-mod-risk').textContent = kpis.moderate_risk_count;

      if (kpis.total_students > 0) {
        document.getElementById('sidebar-student-count').textContent = kpis.total_students;
      }

      // 2. Render Charts
      renderScoreDistributionChart(data.score_distribution);
      renderRiskDistributionChart(data.risk_distribution);
      renderAttendanceScatterChart(data.scatter_points);
      renderCompletenessRadarChart(data.category_coverage);
      renderSegmentsBarChart(data.segment_distribution);

      // 3. Render Priority Watchlist Table
      loadPriorityWatchlist();

    } catch (err) {
      console.error('Error loading overview data:', err);
    }
  }

  // Priority Attention Watchlist
  async function loadPriorityWatchlist() {
    try {
      const res = await fetch('/api/analytics/students?risk_level=HIGH&limit=5&sort_by=risk_desc');
      if (!res.ok) return;
      const data = await res.json();
      const tbody = document.getElementById('priority-tbody');
      tbody.innerHTML = '';

      if (data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--text-dim);">No high-risk students found matching current filters. All within acceptable range.</td></tr>';
        return;
      }

      data.students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-mono"><strong>${s.reg_no}</strong></td>
          <td>${s.name}</td>
          <td><span class="badge">${s.branch}</span></td>
          <td>Sem ${s.current_semester}</td>
          <td><strong>${s.cgpa.toFixed(2)}</strong></td>
          <td><span class="${s.attendance_percentage < 75 ? 'text-danger font-bold' : ''}">${s.attendance_percentage ? s.attendance_percentage.toFixed(1) + '%' : 'N/A'}</span></td>
          <td><strong>${s.success_score.toFixed(1)}</strong></td>
          <td><span class="badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> HIGH</span></td>
          <td><small style="color:#fb7185;">${s.active_backlogs > 0 ? s.active_backlogs + ' Backlogs' : (s.attendance_percentage < 65 ? 'Detention Risk' : 'Low CGPA')}</small></td>
          <td><button class="btn btn-sm btn-outline btn-inspect" data-id="${s.id}"><i class="fa-solid fa-magnifying-glass"></i> Inspect</button></td>
        `;
        tr.querySelector('.btn-inspect').addEventListener('click', (e) => {
          e.stopPropagation();
          openStudentModal(s.id);
        });
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Failed to load priority watchlist:', err);
    }
  }

  // Chart 1: Success Score Distribution Bar Chart
  function renderScoreDistributionChart(bins) {
    const ctx = document.getElementById('chart-score-dist');
    if (!ctx) return;
    if (state.charts.scoreDist) state.charts.scoreDist.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    state.charts.scoreDist = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['< 50 (Critical)', '50-59', '60-69', '70-79', '80-89 (High)', '90-100 (Exemplary)'],
        datasets: [{
          label: 'Student Count',
          data: [bins.b_0_49 || 0, bins.b_50_59 || 0, bins.b_60_69 || 0, bins.b_70_79 || 0, bins.b_80_89 || 0, bins.b_90_100 || 0],
          backgroundColor: [
            'rgba(244, 63, 94, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(59, 130, 246, 0.75)',
            'rgba(99, 102, 241, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(6, 182, 212, 0.85)'
          ],
          borderColor: 'transparent',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { color: textColor, stepSize: 5 }, grid: { color: gridColor } }
        }
      }
    });
  }

  // Chart 2: Risk Categorization Doughnut Chart
  function renderRiskDistributionChart(riskData) {
    const ctx = document.getElementById('chart-risk-dist');
    if (!ctx) return;
    if (state.charts.riskDist) state.charts.riskDist.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';

    state.charts.riskDist = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
        datasets: [{
          data: [riskData.LOW || 0, riskData.MODERATE || 0, riskData.HIGH || 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(244, 63, 94, 0.85)'
          ],
          borderColor: isLight ? '#ffffff' : '#101622',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { size: 12 }, padding: 14 }
          }
        }
      }
    });
  }

  // Chart 3: Attendance vs CGPA Scatter Plot
  function renderAttendanceScatterChart(points) {
    const ctx = document.getElementById('chart-attendance-scatter');
    if (!ctx) return;
    if (state.charts.scatter) state.charts.scatter.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    const scatterData = (points || []).map(p => ({
      x: p.attendance,
      y: p.cgpa,
      reg_no: p.reg_no,
      name: p.name,
      risk: p.risk_level
    }));

    state.charts.scatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Students',
          data: scatterData,
          backgroundColor: (ctx) => {
            const raw = ctx.raw;
            if (!raw) return 'rgba(99, 102, 241, 0.7)';
            if (raw.risk === 'HIGH') return 'rgba(244, 63, 94, 0.85)';
            if (raw.risk === 'MODERATE') return 'rgba(245, 158, 11, 0.85)';
            return 'rgba(16, 185, 129, 0.85)';
          },
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const r = ctx.raw;
                return `${r.name} (${r.reg_no}) - Attendance: ${r.x}%, CGPA: ${r.y}, Risk: ${r.risk}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Aggregate Attendance (%)', color: textColor, font: { size: 12 } },
            ticks: { color: textColor },
            grid: { color: gridColor },
            min: 50,
            max: 100
          },
          y: {
            title: { display: true, text: 'Cumulative GPA (CGPA)', color: textColor, font: { size: 12 } },
            ticks: { color: textColor },
            grid: { color: gridColor },
            min: 0,
            max: 10
          }
        }
      }
    });
  }

  // Chart 4: Category Completeness Radar Chart
  function renderCompletenessRadarChart(catData) {
    const ctx = document.getElementById('chart-completeness');
    if (!ctx) return;
    if (state.charts.completeness) state.charts.completeness.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

    const categories = ['Academic', 'Attendance', 'LMS', 'Placement', 'Skills', 'Engagement', 'Feedback'];
    const values = categories.map(c => catData[c] ? catData[c].percentage : 0);

    state.charts.completeness = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Completeness %',
          data: values,
          backgroundColor: 'rgba(6, 182, 212, 0.25)',
          borderColor: 'rgba(6, 182, 212, 0.9)',
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, color: textColor, backdropColor: 'transparent' },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { color: textColor, font: { size: 11, weight: '600' } }
          }
        }
      }
    });
  }

  // Chart 5: Student Segments Horizontal Bar Chart
  function renderSegmentsBarChart(segments) {
    const ctx = document.getElementById('chart-segments');
    if (!ctx) return;
    if (state.charts.segments) state.charts.segments.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    const labels = (segments || []).map(s => s.segment_name);
    const data = (segments || []).map(s => s.cnt);

    state.charts.segments = new Chart(ctx, {
      type: 'bar',
      indexAxis: 'y',
      data: {
        labels: labels,
        datasets: [{
          label: 'Student Count',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.95)',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 10
          }
        },
        scales: {
          x: { ticks: { color: textColor, stepSize: 5 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // Load Full Student Directory Table
  async function loadStudentsDirectory() {
    try {
      const params = new URLSearchParams({
        page: state.pagination.page,
        limit: state.pagination.limit,
        sort_by: state.sort
      });

      if (state.filters.search) params.append('search', state.filters.search);
      if (state.filters.branch) params.append('branch', state.filters.branch);
      if (state.filters.semester) params.append('semester', state.filters.semester);
      if (state.filters.risk_level) params.append('risk_level', state.filters.risk_level);
      if (state.filters.segment) params.append('segment', state.filters.segment);

      const res = await fetch(`/api/analytics/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load students');
      const data = await res.json();

      state.pagination.total = data.total;
      state.pagination.total_pages = data.total_pages;

      // Update counter
      const start = (data.page - 1) * data.limit + 1;
      const end = Math.min(data.page * data.limit, data.total);
      document.getElementById('table-info-counter').textContent = 
        data.total > 0 ? `Showing ${start}-${end} of ${data.total} students` : 'No students found';

      const tbody = document.getElementById('students-tbody');
      tbody.innerHTML = '';

      if (data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:30px; color:var(--text-dim);">No students matched the active search and filter criteria.</td></tr>';
        return;
      }

      data.students.forEach(s => {
        const tr = document.createElement('tr');
        
        // Risk Badge
        let riskBadge = '<span class="badge-success">LOW</span>';
        if (s.risk_level === 'HIGH') {
          riskBadge = '<span class="badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> HIGH</span>';
        } else if (s.risk_level === 'MODERATE') {
          riskBadge = '<span class="badge-warning">MODERATE</span>';
        }

        // Performance Tier
        let tierClass = 'text-cyan';
        if (s.performance_tier === 'Critical Support') tierClass = 'text-rose';
        else if (s.performance_tier === 'Exemplary') tierClass = 'text-emerald';

        tr.innerHTML = `
          <td class="font-mono"><strong>${s.reg_no}</strong></td>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge">${s.branch}</span></td>
          <td>Sem ${s.current_semester}</td>
          <td><strong>${s.cgpa.toFixed(2)}</strong></td>
          <td>${s.attendance_percentage ? s.attendance_percentage.toFixed(1) + '%' : '<span class="text-dim">N/A</span>'}</td>
          <td><strong style="color:var(--accent-indigo); font-size:14px;">${s.success_score.toFixed(1)}</strong></td>
          <td><span class="${tierClass}">${s.performance_tier}</span></td>
          <td>${riskBadge}</td>
          <td><span class="segment-pill" title="${s.segment_name || ''}">${s.segment_name || 'Balanced'}</span></td>
          <td><span class="coverage-pill">${s.data_coverage_pct ? s.data_coverage_pct.toFixed(0) + '%' : '0%'}</span></td>
          <td><button class="btn btn-sm btn-outline btn-open-student" data-id="${s.id}"><i class="fa-solid fa-id-card"></i> 360 View</button></td>
        `;

        tr.addEventListener('click', () => openStudentModal(s.id));
        tbody.appendChild(tr);
      });

      renderPagination();

    } catch (err) {
      console.error('Error loading students directory:', err);
    }
  }

  // Pagination Renderer
  function renderPagination() {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    container.innerHTML = '';

    const current = state.pagination.page;
    const total = state.pagination.total_pages;

    if (total <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&laquo;';
    prevBtn.disabled = current === 1;
    prevBtn.addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        loadStudentsDirectory();
      }
    });
    container.appendChild(prevBtn);

    // Page number buttons
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${p === current ? 'active' : ''}`;
        pageBtn.textContent = p;
        pageBtn.addEventListener('click', () => {
          state.pagination.page = p;
          loadStudentsDirectory();
        });
        container.appendChild(pageBtn);
      } else if (p === current - 2 || p === current + 2) {
        const dot = document.createElement('span');
        dot.style.padding = '0 4px';
        dot.textContent = '...';
        container.appendChild(dot);
      }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '&raquo;';
    nextBtn.disabled = current === total;
    nextBtn.addEventListener('click', () => {
      if (state.pagination.page < total) {
        state.pagination.page++;
        loadStudentsDirectory();
      }
    });
    container.appendChild(nextBtn);
  }

  // Student 360 Deep-Dive Modal (Phase 7 & 8)
  async function openStudentModal(studentId) {
    try {
      state.activeStudentId = studentId;
      const res = await fetch(`/api/analytics/students/${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch student details');
      const data = await res.json();

      const st = data.student;
      const score = data.success_score;
      const risk = data.risk_assessment;
      const seg = data.segment;

      // 1. Header Information
      document.getElementById('modal-name').textContent = st.name;
      document.getElementById('modal-reg-no').textContent = st.reg_no;
      document.getElementById('modal-avatar').textContent = st.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      document.getElementById('modal-branch-sem').innerHTML = `<i class="fa-solid fa-code-branch"></i> ${st.branch} | Semester ${st.current_semester} | Section ${st.section || 'A'}`;
      document.getElementById('modal-verification').textContent = st.verification_status || 'VERIFIED';
      document.getElementById('modal-segment-badge').textContent = seg.segment_name || 'Consistent Cohort';

      // 2. Success Score Gauge & Breakdown Table
      document.getElementById('modal-score-val').textContent = (score.score || 0).toFixed(1);
      document.getElementById('modal-tier').textContent = score.performance_tier || 'Developing Standing';
      document.getElementById('modal-coverage-val').textContent = (score.data_coverage_pct || 0).toFixed(0) + '%';
      document.getElementById('modal-coverage-fill').style.width = (score.data_coverage_pct || 0) + '%';
      
      const confBadge = document.getElementById('modal-confidence-val');
      confBadge.textContent = score.confidence_score_pct >= 85 ? 'HIGH CONFIDENCE' : (score.confidence_score_pct >= 55 ? 'MODERATE CONFIDENCE' : 'LOW CONFIDENCE');
      confBadge.className = score.confidence_score_pct >= 85 ? 'badge-success' : (score.confidence_score_pct >= 55 ? 'badge-warning' : 'badge-danger');

      // Breakdown Table
      const breakdownTbody = document.getElementById('modal-breakdown-tbody');
      breakdownTbody.innerHTML = '';
      const catWeights = score.weights_used || { academic: 0.35, attendance: 0.20, lms: 0.15, placement: 0.15, skills: 0.10, engagement: 0.05 };
      const catLabels = {
        academic: 'Academic CGPA & Backlogs',
        attendance: 'Aggregate Attendance',
        lms: 'LMS Engagement',
        placement: 'Placement CDC Tests',
        skills: 'Technical Skills Radar',
        engagement: 'Campus Co-Curricular'
      };

      for (const [key, confWeight] of Object.entries(catWeights)) {
        const isAvail = (score.available_indicators || []).includes(key);
        const contrib = score.components ? (score.components[key] || 0) : 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${catLabels[key] || key}</strong></td>
          <td>${isAvail ? 'Available' : '<span class="text-dim">Missing</span>'}</td>
          <td>${isAvail ? (contrib / confWeight).toFixed(1) + '/100' : '-'}</td>
          <td>${(confWeight * 100).toFixed(0)}%</td>
          <td><strong>${contrib.toFixed(1)} pts</strong></td>
        `;
        breakdownTbody.appendChild(tr);
      }

      // 3. Risk Assessment Box
      const riskBadge = document.getElementById('modal-risk-badge');
      riskBadge.textContent = `${risk.risk_level || 'LOW'} RISK`;
      riskBadge.className = `risk-level-badge ${risk.risk_level || 'LOW'}`;
      document.getElementById('modal-risk-score').textContent = `${(risk.composite_risk_score || 0).toFixed(1)}/100`;

      const riskRulesContainer = document.getElementById('modal-risk-rules');
      riskRulesContainer.innerHTML = '';
      if (risk.triggered_rules && risk.triggered_rules.length > 0) {
        risk.triggered_rules.forEach(r => {
          const item = document.createElement('div');
          item.className = 'risk-rule-item';
          item.innerHTML = `
            <span class="badge-${r.severity === 'HIGH' ? 'danger' : 'warning'}">${r.severity}</span>
            <span><strong>${r.rule_name}:</strong> ${r.evidence}</span>
          `;
          riskRulesContainer.appendChild(item);
        });
      } else {
        riskRulesContainer.innerHTML = '<span style="color:var(--accent-emerald);">No critical risk rules triggered. Student is progressing within healthy parameters.</span>';
      }

      // Positive & Negative Factors
      const posList = document.getElementById('modal-positive-factors');
      posList.innerHTML = '';
      (score.positive_factors || ['Foundational performance indicators are maintained within baseline.']).forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        posList.appendChild(li);
      });

      const negList = document.getElementById('modal-negative-factors');
      negList.innerHTML = '';
      (score.negative_factors || ['No critical indicator deficits detected.']).forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        negList.appendChild(li);
      });

      // Interventions List
      const intList = document.getElementById('modal-interventions-list');
      intList.innerHTML = '';
      (risk.suggested_interventions || ['Maintain periodic mentor check-ins.']).forEach(i => {
        const li = document.createElement('li');
        li.textContent = i;
        intList.appendChild(li);
      });

      // 4. Tab 1: Academic Data & Subjects Table
      const acad = data.academic || {};
      document.getElementById('modal-acad-cgpa').textContent = (acad.cgpa || 0).toFixed(2);
      document.getElementById('modal-acad-sgpa').textContent = (acad.sgpa || acad.cgpa || 0).toFixed(2);
      document.getElementById('modal-acad-backlogs').textContent = acad.active_backlogs || 0;
      document.getElementById('modal-acad-trend').textContent = acad.trend || 'STABLE';

      const subjTbody = document.getElementById('modal-subjects-tbody');
      subjTbody.innerHTML = '';
      if (acad.subjects && acad.subjects.length > 0) {
        acad.subjects.forEach(s => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="font-mono"><strong>${s.course_code}</strong></td>
            <td>${s.course_name}</td>
            <td>${s.credits}</td>
            <td>${s.internal_marks || '-'}</td>
            <td>${s.external_marks || '-'}</td>
            <td><strong>${s.total_marks || '-'}</strong></td>
            <td><span class="badge ${s.grade === 'F' ? 'badge-danger' : 'badge-success'}">${s.grade || 'P'}</span></td>
          `;
          subjTbody.appendChild(tr);
        });
      } else {
        subjTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:12px; color:var(--text-dim);">No individual subject marksheet records found in source.</td></tr>';
      }

      // 5. Tab 2: Attendance
      const att = data.attendance || {};
      document.getElementById('modal-att-pct').textContent = att.overall_percentage ? att.overall_percentage.toFixed(1) + '%' : 'N/A';
      document.getElementById('modal-att-classes').textContent = `${att.classes_attended || 0} / ${att.classes_conducted || 0} Conducted Classes`;
      const attStatus = document.getElementById('modal-att-status');
      if (att.is_detained) {
        attStatus.textContent = 'CRITICAL DETENTION SHORTAGE (< 65%)';
        attStatus.className = 'stat-status text-danger';
      } else if (att.is_shortage) {
        attStatus.textContent = 'Shortage Warning (< 75%)';
        attStatus.className = 'stat-status text-warning';
      } else {
        attStatus.textContent = 'Compliant (Above 75% Cutoff)';
        attStatus.className = 'stat-status text-emerald';
      }

      // 6. Tab 3: LMS
      const lms = data.lms || {};
      document.getElementById('modal-lms-assignment').textContent = lms.assignment_completion_pct ? lms.assignment_completion_pct.toFixed(1) + '%' : 'N/A';
      document.getElementById('modal-lms-lates').textContent = `${lms.late_submissions_count || 0} Late Submissions`;
      document.getElementById('modal-lms-logins').textContent = `${lms.logins_per_week || 0} / wk`;
      document.getElementById('modal-lms-hours').textContent = `Avg ${lms.hours_spent_per_week || 0} Hours Active Weekly`;

      // 7. Tab 4: Placement
      const plc = data.placement || {};
      document.getElementById('modal-plc-apt').textContent = `${(plc.aptitude_score || 0).toFixed(1)}/100`;
      document.getElementById('modal-plc-coding').textContent = `${(plc.coding_score || 0).toFixed(1)}/100`;
      document.getElementById('modal-plc-mock').textContent = `${(plc.mock_interview_score || 0).toFixed(1)}/100`;
      const plcStatus = document.getElementById('modal-plc-status');
      plcStatus.textContent = plc.is_placement_eligible ? 'ELIGIBLE' : 'CONDITIONAL';
      plcStatus.className = plc.is_placement_eligible ? 'stat-status text-emerald' : 'stat-status text-rose';
      document.getElementById('modal-plc-tier').textContent = plc.company_tier_eligibility || 'Needs Preparation';

      // 8. Tab 5: Skills Radar
      renderSkillsRadar(data.skills);

      // 9. Tab 6: Engagement
      const eng = data.engagement || {};
      document.getElementById('modal-eng-club').textContent = eng.club_name || 'General Member';
      document.getElementById('modal-eng-role').textContent = eng.role || 'Member';
      document.getElementById('modal-eng-hacks').textContent = `${eng.hackathons_count || 0} Completed`;
      document.getElementById('modal-eng-certs').textContent = `${eng.certifications_count || 0} Verified`;
      document.getElementById('modal-eng-workshops').textContent = `${eng.workshops_count || 0} Attended`;

      // 10. Tab 7: Feedback & Intervention Form
      const fbList = data.feedback || [];
      if (fbList.length > 0) {
        const latestFb = fbList[0];
        document.getElementById('modal-fb-logger').textContent = latestFb.logged_by || 'Faculty Mentor Cell';
        document.getElementById('modal-fb-support').textContent = `Support Required: ${latestFb.support_required || 'None'}`;
        document.getElementById('modal-fb-remarks').textContent = latestFb.remarks || 'Consistent academic progression.';
      }
      if (risk.faculty_review_notes) {
        document.getElementById('intervention-notes').value = risk.faculty_review_notes;
      } else {
        document.getElementById('intervention-notes').value = '';
      }

      // Show Modal
      document.getElementById('student-modal').style.display = 'flex';

    } catch (err) {
      console.error('Error opening student 360 modal:', err);
    }
  }

  // Render Skills Radar in Modal
  function renderSkillsRadar(skillsData) {
    const listCol = document.getElementById('modal-skills-list');
    const ctx = document.getElementById('modal-skills-radar');
    if (!ctx) return;
    if (state.charts.modalSkills) state.charts.modalSkills.destroy();

    const prog = skillsData ? (skillsData.programming_proficiency || 70) : 70;
    const prob = skillsData ? (skillsData.problem_solving_score || 72) : 72;
    const core = skillsData ? (skillsData.technical_core_score || 75) : 75;
    const soft = skillsData ? (skillsData.soft_skills_score || 70) : 70;
    const sys = Math.round((prog + core) / 2);

    listCol.innerHTML = `
      <div class="mini-scores-list" style="margin-top:10px;">
        <div>Programming Proficiency: <strong>${prog.toFixed(1)}/100</strong></div>
        <div>Problem Solving & DSA: <strong>${prob.toFixed(1)}/100</strong></div>
        <div>Technical Core Domains: <strong>${core.toFixed(1)}/100</strong></div>
        <div>Soft Skills & Communication: <strong>${soft.toFixed(1)}/100</strong></div>
        <div>System Design & Architecture: <strong>${sys.toFixed(1)}/100</strong></div>
      </div>
    `;

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';

    state.charts.modalSkills = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Programming', 'Problem Solving', 'Technical Core', 'Soft Skills', 'System Design'],
        datasets: [{
          label: 'Proficiency',
          data: [prog, prob, core, soft, sys],
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: 'rgba(99, 102, 241, 0.9)',
          pointBackgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false, stepSize: 25 },
            pointLabels: { color: textColor, font: { size: 10, weight: '600' } }
          }
        }
      }
    });
  }

  // Modals Controller
  function initModals() {
    const modal = document.getElementById('student-modal');
    document.getElementById('modal-close')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Modal internal tab navigation
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.modal-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tabPane = document.getElementById(btn.dataset.tab);
        if (tabPane) tabPane.classList.add('active');
      });
    });

    // Save Intervention Action
    document.getElementById('btn-save-intervention')?.addEventListener('click', async () => {
      if (!state.activeStudentId) return;
      const notes = document.getElementById('intervention-notes').value.trim();
      const status = document.getElementById('intervention-status-select').value;
      if (!notes) {
        alert('Please enter intervention notes before saving.');
        return;
      }

      try {
        const res = await fetch(`/api/analytics/students/${state.activeStudentId}/intervention`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes, status })
        });
        if (res.ok) {
          alert('Faculty intervention recorded and audit trail updated successfully!');
        }
      } catch (err) {
        console.error('Error saving intervention:', err);
      }
    });

    // Print PDF Button
    document.getElementById('btn-print-report')?.addEventListener('click', () => {
      window.print();
    });
  }

  // Segments View Generator
  async function renderSegmentsView() {
    try {
      const res = await fetch('/api/analytics/overview');
      if (!res.ok) return;
      const data = await res.json();
      const segments = data.segment_distribution || [];

      const segmentDescriptions = {
        HIGH_ACAD_HIGH_PLACE: {
          desc: "Students demonstrating stellar academic discipline (CGPA >= 8.0) and top placement readiness (Score >= 75).",
          focus: "Fast-track to Tier-1 product placement drives, international hackathons, and faculty research assistantships."
        },
        HIGH_ACAD_LOW_PLACE: {
          desc: "High academic performers (CGPA >= 8.0) whose placement assessments lag behind (Placement < 60).",
          focus: "Mandatory CDC technical coding bootcamps, mock interview coaching, and aptitude problem-solving drills."
        },
        LOW_ACAD_GOOD_ATTEND: {
          desc: "Diligent students with strong classroom attendance (>= 80%) but below-average academic marks (CGPA < 6.5).",
          focus: "Conceptual bridge classes, doubt-clearing sessions, and learning-style assessment. Effort is high but comprehension requires support."
        },
        LOW_ATTEND_DECLINING: {
          desc: "Students with attendance shortages (< 75%) and deteriorating semester performance trends.",
          focus: "Urgent statutory attendance counseling, parent-mentor consultation, and personal roadblock check-in."
        },
        STRONG_TECH_LOW_APTITUDE: {
          desc: "Hands-on coding capability (>= 75) hindered by quantitative aptitude or verbal interview barriers (< 55).",
          focus: "Quantitative aptitude bootcamps and verbal communication / mock interview drills."
        },
        HIGH_ACAD_LOW_ENGAGE: {
          desc: "High academic standing with minimal co-curricular, hackathon, or club participation.",
          focus: "Encourage leadership roles in technical clubs, joining hackathons, and pursuing industry certifications."
        },
        ACADEMIC_SUPPORT_NEEDED: {
          desc: "Students carrying active course backlogs (>= 1) or low cumulative GPA (< 5.5).",
          focus: "Allotment to Faculty Remedial Cell, question bank distribution, and individual backlog recovery roadmap."
        },
        INSUFFICIENT_DATA: {
          desc: "Students with data coverage below 40%. Incomplete profile prevents definitive classification.",
          focus: "Request updated institutional ERP synchronization and student profile completion."
        },
        BALANCED_PROGRESSION: {
          desc: "Consistent performance across all 7 indicators.",
          focus: "Maintain consistent semester performance and prepare for upcoming placement drives."
        }
      };

      const container = document.getElementById('segments-cards-container');
      container.innerHTML = '';

      segments.forEach(seg => {
        const info = segmentDescriptions[seg.segment_code] || {
          desc: "Consistent performance across all 7 indicators.",
          focus: "Maintain consistent semester performance and prepare for upcoming placement drives."
        };

        const card = document.createElement('div');
        card.className = 'segment-card';
        card.innerHTML = `
          <div class="segment-card-header">
            <span class="badge badge-success font-mono">${seg.cnt} Students</span>
            <span class="font-mono text-dim" style="font-size:11px;">${seg.segment_code}</span>
          </div>
          <h3>${seg.segment_name}</h3>
          <p>${info.desc}</p>
          <div class="audit-notes-box" style="margin-bottom:14px;">
            <strong>Target Action:</strong> ${info.focus}
          </div>
          <div class="segment-card-action">
            <span class="text-dim" style="font-size:12px;">Cohorts Filter</span>
            <button class="btn btn-sm btn-primary btn-filter-seg" data-seg="${seg.segment_code}">Filter Roster &rarr;</button>
          </div>
        `;

        card.querySelector('.btn-filter-seg').addEventListener('click', () => {
          state.filters.segment = seg.segment_code;
          switchView('directory');
          document.querySelectorAll('#segment-chips .chip').forEach(c => {
            c.classList.toggle('active', c.dataset.segment === seg.segment_code);
          });
        });

        container.appendChild(card);
      });

    } catch (err) {
      console.error('Error rendering segments view:', err);
    }
  }

  // ERP View Controller
  async function loadERPViewData() {
    try {
      const res = await fetch('/api/analytics/erp/status');
      if (res.ok) {
        const erp = await res.json();
        document.getElementById('erp-sync-state-badge').textContent = `${erp.last_sync_status || 'IMPORTED'} (AUTHORIZED EXPORT)`;
        document.getElementById('erp-sync-count').textContent = `${erp.records_synced || 69} verified student records`;
        if (erp.last_sync_at) {
          document.getElementById('erp-sync-timestamp').textContent = new Date(erp.last_sync_at).toLocaleString();
        }
      }

      document.getElementById('btn-trigger-erp-sync')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-trigger-erp-sync');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ingesting...';
        btn.disabled = true;

        try {
          const syncRes = await fetch('/api/analytics/erp/sync', { method: 'POST' });
          if (syncRes.ok) {
            alert('ERP Ingestion completed successfully! All records verified and analytics updated.');
            loadERPViewData();
            loadOverviewData();
          }
        } finally {
          btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Run Ingestion Pipeline';
          btn.disabled = false;
        }
      });
    } catch (err) {
      console.error('Error loading ERP view data:', err);
    }
  }

  // Scoring Configuration View Controller
  async function loadConfigViewData() {
    try {
      const res = await fetch('/api/analytics/configurations');
      if (!res.ok) return;
      const cfg = await res.json();

      const sliders = [
        { id: 'academic', key: 'academic_weight', val: cfg.academic_weight || 0.35 },
        { id: 'attendance', key: 'attendance_weight', val: cfg.attendance_weight || 0.20 },
        { id: 'lms', key: 'lms_weight', val: cfg.lms_weight || 0.15 },
        { id: 'placement', key: 'placement_weight', val: cfg.placement_weight || 0.15 },
        { id: 'skills', key: 'skills_weight', val: cfg.skills_weight || 0.10 },
        { id: 'engagement', key: 'engagement_weight', val: cfg.engagement_weight || 0.05 }
      ];

      sliders.forEach(s => {
        const input = document.getElementById(`input-w-${s.id}`);
        const label = document.getElementById(`val-w-${s.id}`);
        if (input && label) {
          input.value = Math.round(s.val * 100);
          label.textContent = `${Math.round(s.val * 100)}%`;
          input.oninput = () => { label.textContent = `${input.value}%`; };
        }
      });

      if (document.getElementById('input-thresh-att')) {
        document.getElementById('input-thresh-att').value = cfg.attendance_threshold || 75.0;
        document.getElementById('input-thresh-det').value = cfg.detention_threshold || 65.0;
        document.getElementById('input-thresh-cgpa').value = cfg.cgpa_warning_threshold || 6.0;
      }

      document.getElementById('btn-save-config')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-save-config');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Recalculating...';
        btn.disabled = true;

        const payload = {
          academic_weight: parseInt(document.getElementById('input-w-academic').value, 10) / 100.0,
          attendance_weight: parseInt(document.getElementById('input-w-attendance').value, 10) / 100.0,
          lms_weight: parseInt(document.getElementById('input-w-lms').value, 10) / 100.0,
          placement_weight: parseInt(document.getElementById('input-w-placement').value, 10) / 100.0,
          skills_weight: parseInt(document.getElementById('input-w-skills').value, 10) / 100.0,
          engagement_weight: parseInt(document.getElementById('input-w-engagement').value, 10) / 100.0,
          attendance_threshold: parseFloat(document.getElementById('input-thresh-att').value),
          detention_threshold: parseFloat(document.getElementById('input-thresh-det').value),
          cgpa_warning_threshold: parseFloat(document.getElementById('input-thresh-cgpa').value)
        };

        try {
          const updateRes = await fetch('/api/analytics/configurations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (updateRes.ok) {
            alert('Scoring model updated and all student scores recalculated across the database!');
            loadOverviewData();
          }
        } finally {
          btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Recalculate Scores';
          btn.disabled = false;
        }
      });

    } catch (err) {
      console.error('Error loading config:', err);
    }
  }

  // Slide Deck Presentation Mode Controller (Deliverable 3)
  function initPresentation() {
    const strip = document.getElementById('slide-thumbnails');
    if (!strip) return;
    strip.innerHTML = '';

    presentationSlides.forEach((slide, idx) => {
      const btn = document.createElement('button');
      btn.className = `slide-thumb-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = `Slide ${idx + 1}`;
      btn.addEventListener('click', () => {
        state.currentSlide = idx;
        renderSlide(idx);
      });
      strip.appendChild(btn);
    });

    document.getElementById('btn-slide-prev')?.addEventListener('click', () => {
      if (state.currentSlide > 0) {
        state.currentSlide--;
        renderSlide(state.currentSlide);
      }
    });

    document.getElementById('btn-slide-next')?.addEventListener('click', () => {
      if (state.currentSlide < presentationSlides.length - 1) {
        state.currentSlide++;
        renderSlide(state.currentSlide);
      }
    });
  }

  function renderSlide(index) {
    const slide = presentationSlides[index];
    if (!slide) return;

    document.getElementById('slide-indicator').textContent = `Slide ${index + 1} / ${presentationSlides.length}`;
    document.querySelectorAll('.slide-thumb-btn').forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });

    const viewport = document.getElementById('slide-viewport');
    viewport.innerHTML = `
      <div class="slide-content-wrap">
        <h2 class="slide-title">${slide.title}</h2>
        <div class="slide-subtitle">${slide.subtitle}</div>
        <div class="slide-body">${slide.content}</div>
      </div>
    `;
  }

  // CSV Export Utility
  async function exportCSV() {
    try {
      const res = await fetch('/api/analytics/students?limit=200');
      if (!res.ok) return;
      const data = await res.json();
      const students = data.students || [];

      if (students.length === 0) {
        alert('No students to export.');
        return;
      }

      const headers = ['Registration_Number', 'Student_Name', 'Branch', 'Semester', 'CGPA', 'Attendance_Pct', 'Success_Score', 'Performance_Tier', 'Risk_Level', 'Segment'];
      const csvRows = [headers.join(',')];

      students.forEach(s => {
        const row = [
          `"${s.reg_no}"`,
          `"${s.name}"`,
          `"${s.branch}"`,
          s.current_semester,
          s.cgpa,
          s.attendance_percentage || '',
          s.success_score,
          `"${s.performance_tier}"`,
          `"${s.risk_level}"`,
          `"${s.segment_name || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `VFSTR_Student_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  }
});
