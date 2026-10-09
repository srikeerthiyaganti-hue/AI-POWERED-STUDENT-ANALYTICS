import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Briefcase,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Activity,
  Layers,
  Lightbulb,
  ShieldAlert,
  Plus,
  Edit2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  fetchStudentDetail,
  fetchStudentRecommendations,
  fetchInterventions
} from '../services/api.js';
import InterventionModal from './InterventionModal.jsx';
import AiSuccessCopilot from './AiSuccessCopilot.jsx';

export function StudentDetailModal({ studentSummary, onClose }) {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // Interventions state
  const [interventions, setInterventions] = useState([]);
  const [isInterventionsLoading, setIsInterventionsLoading] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);

  const reg =
    studentSummary?.registrationNumber ||
    studentSummary?.studentRegistrationNumber ||
    studentSummary?.studentRegNo ||
    studentSummary?.id;

  const loadStudentInterventions = async (regNo, verifiedStudentName) => {
    if (!regNo) {
      setInterventions([]);
      setIsInterventionsLoading(false);
      return;
    }
    setIsInterventionsLoading(true);
    const intRes = await fetchInterventions({ student: regNo });
    if (intRes.success && intRes.data) {
      const sReg = regNo.toUpperCase();
      const sName = (verifiedStudentName || '').toLowerCase().trim();
      const filtered = intRes.data.filter((i) => {
        const iReg = (i.studentRegistrationNumber || i.studentRegNo || '').toUpperCase();
        const iName = (i.studentName || '').toLowerCase().trim();
        // Registration number must match verified student
        if (iReg !== sReg) return false;
        // Never associate an intervention based only on a conflicting registration number
        if (i.hasIdentityConflict) return false;
        if (iName && sName && iName !== 'unknown student' && iName !== sName) {
          return false;
        }
        return true;
      });
      setInterventions(filtered);
    } else {
      setInterventions([]);
    }
    setIsInterventionsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadFullProfile() {
      if (!studentSummary) return;

      if (!reg || reg === 'undefined') {
        if (isMounted) {
          setError(
            `Student details for '${studentSummary.name || 'Unknown'}' are unavailable (Registration number missing or unregistered).`
          );
          setIsLoading(false);
          setStudent(null);
          setRecommendations([]);
          setInterventions([]);
          setIsInterventionsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await fetchStudentDetail(reg);

      if (isMounted) {
        if (res.success && res.data) {
          // Check for name mismatch: if studentSummary.name was provided and doesn't match directory name
          if (
            studentSummary.name &&
            res.data.name &&
            studentSummary.name.toLowerCase().trim() !== res.data.name.toLowerCase().trim()
          ) {
            setStudent(null);
            setError(
              `Student '${studentSummary.name}' is not registered in the student directory (Registration number ${reg} belongs to ${res.data.name}).`
            );
            setRecommendations([]);
            setIsRecsLoading(false);
            // Hide interventions whose ownership cannot be verified
            setInterventions([]);
            setIsInterventionsLoading(false);
          } else {
            setStudent(res.data);
            setError(null);
            setIsRecsLoading(true);
            const recsRes = await fetchStudentRecommendations(reg);
            if (isMounted) {
              if (recsRes.success && recsRes.data) {
                setRecommendations(recsRes.data.recommendations || []);
              } else {
                setRecommendations([]);
              }
              setIsRecsLoading(false);
            }
            // Verified profile: load interventions only for the verified student
            loadStudentInterventions(reg, res.data.name);
          }
        } else {
          setStudent(null);
          setError(res.error || `Student details for '${reg}' are unavailable (HTTP 404). Record not found in directory.`);
          setRecommendations([]);
          setIsRecsLoading(false);
          setInterventions([]);
          setIsInterventionsLoading(false);
        }
        setIsLoading(false);
      }
    }

    loadFullProfile();
    return () => {
      isMounted = false;
    };
  }, [studentSummary, reg]);

  const isStudentUnavailable = Boolean(error || !student);
  const data = student || studentSummary || {};
  const analytics = data.analytics || {};
  const academicRisk = data.academicRisk || {};
  const placement = data.placementReadiness || {};

  const handleOpenNewIntervention = (prefill = null) => {
    if (isStudentUnavailable || !student?.registrationNumber) {
      alert('Interventions can only be created for verified student records.');
      return;
    }
    if (prefill) {
      setEditingIntervention({
        studentRegistrationNumber: student.registrationNumber,
        studentName: student.name,
        issue: prefill.reason,
        actionPlan: prefill.suggestedAction,
        priority: prefill.priority || 'Medium'
      });
    } else {
      setEditingIntervention({
        studentRegistrationNumber: student.registrationNumber,
        studentName: student.name
      });
    }
    setIsInterventionModalOpen(true);
  };

  const handleOpenEditIntervention = (intervention) => {
    setEditingIntervention(intervention);
    setIsInterventionModalOpen(true);
  };

  const handleInterventionSaved = () => {
    if (student?.registrationNumber) {
      loadStudentInterventions(student.registrationNumber);
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!studentSummary) return null;

  // Arrears representation logic: strictly distinguish 0 from unrecorded null/undefined
  const renderArrearsBadge = () => {
    if (data.arrears === null || data.arrears === undefined) {
      return (
        <span className="badge-arrears badge-arrears--unrecorded" title="Arrears information unrecorded">
          <HelpCircle size={14} /> Backlogs Unrecorded (Verification Required)
        </span>
      );
    }
    if (data.arrears === 0) {
      return (
        <span className="badge-arrears badge-arrears--clean" title="Zero active arrears">
          <CheckCircle2 size={14} /> 0 Backlogs (Clean Academic Record)
        </span>
      );
    }
    return (
      <span className="badge-arrears badge-arrears--active" title={`${data.arrears} active backlogs`}>
        <XCircle size={14} /> {data.arrears} Active Backlogs Pending
      </span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__main">
            <div className="modal-avatar">
              <User size={24} />
            </div>
            <div>
              <div className="modal-header__tags">
                <span className="tag-reg">{data.registrationNumber}</span>
                <span className="tag-branch">{data.branchSlug || data.branchCode}</span>
                <span className="tag-sem">Semester {data.semester || 'N/A'}</span>
              </div>
              <h2 className="modal-name">{data.name}</h2>
              <p className="modal-email">{data.email}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Profile (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading && (
            <div className="loading-banner">
              <Activity size={18} className="spin-icon" />
              <span>Fetching live student analytics & 7-factor breakdown...</span>
            </div>
          )}

          {error && (
            <div className="alert-box alert-box--warning">
              <AlertTriangle size={18} />
              <span>{error}. Displaying available summary records.</span>
            </div>
          )}

          {/* Top Status Cards Grid */}
          <div className="modal-status-grid">
            {/* Success Score Banner */}
            <div className="status-metric-card status-metric-card--primary">
              <div className="status-metric-card__header">
                <span className="status-metric-label">Student Success Score</span>
                <span className="status-metric-tag">7-Factor Model</span>
              </div>
              {isStudentUnavailable ? (
                <div className="insufficient-score-banner">
                  <div className="insufficient-score-title">
                    <AlertTriangle size={18} className="text-amber" /> Profile Unavailable
                  </div>
                  <p className="insufficient-score-desc">
                    Student records could not be verified in the directory. Scores cannot be computed.
                  </p>
                  <div className="coverage-pill">
                    Coverage: <strong>Unavailable</strong>
                  </div>
                </div>
              ) : analytics.isEligibleForScoring === false || analytics.successScore === null ? (
                <div className="insufficient-score-banner">
                  <div className="insufficient-score-title">
                    <AlertTriangle size={18} className="text-amber" /> Insufficient Data
                  </div>
                  <p className="insufficient-score-desc">
                    {analytics.reason || `Data coverage is below the required 60% threshold.`}
                  </p>
                  <div className="coverage-pill">
                    Coverage: <strong>{analytics.dataCoverage !== undefined && analytics.dataCoverage !== null ? `${analytics.dataCoverage}%` : 'Unavailable'}</strong> (Min. 60% Required)
                  </div>
                </div>
              ) : (
                <div className="score-display">
                  <div className="score-number-wrap">
                    <span className="score-number">{analytics.successScore ?? '--'}</span>
                    <span className="score-max">/ 100</span>
                  </div>
                  <div className="score-meta">
                    <span className="coverage-badge">
                      {analytics.dataCoverage !== undefined && analytics.dataCoverage !== null ? `${analytics.dataCoverage}%` : '--%'} Data Coverage
                    </span>
                    {analytics.isNormalized && (
                      <span className="normalized-badge" title="Normalized against valid available weights">
                        Weights Normalized
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Academic Risk Banner */}
            {isStudentUnavailable ? (
              <div className="status-metric-card status-metric-card--risk-low">
                <div className="status-metric-card__header">
                  <span className="status-metric-label">Academic Risk Status</span>
                  <span className="risk-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                    Unavailable
                  </span>
                </div>
                <div className="status-metric-body">
                  <div className="risk-score-text">
                    Risk Index: <strong>--</strong>
                  </div>
                  <p className="risk-primary-reason">
                    Risk classification cannot be determined for unverified records.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`status-metric-card status-metric-card--risk-${(academicRisk.level || 'Low').toLowerCase()}`}>
                <div className="status-metric-card__header">
                  <span className="status-metric-label">Academic Risk Status</span>
                  <span className={`risk-badge risk-badge--${(academicRisk.level || 'Low').toLowerCase()}`}>
                    {academicRisk.level || 'Low'} Risk
                  </span>
                </div>
                <div className="status-metric-body">
                  <div className="risk-score-text">
                    Risk Index: <strong>{academicRisk.riskScore ?? 0} / 100</strong>
                  </div>
                  <p className="risk-primary-reason">
                    {academicRisk.primaryReason || 'Student maintains sound academic indicators.'}
                  </p>
                </div>
              </div>
            )}

            {/* Placement Readiness Banner */}
            {isStudentUnavailable ? (
              <div className="status-metric-card status-metric-card--placement">
                <div className="status-metric-card__header">
                  <span className="status-metric-label">Placement Readiness</span>
                  <span className="placement-status-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                    Unavailable
                  </span>
                </div>
                <div className="status-metric-body">
                  <div className="placement-score-text">
                    Readiness Benchmark: <strong>--</strong>
                  </div>
                  <p className="placement-recommendation">
                    Placement readiness metrics unavailable.
                  </p>
                </div>
              </div>
            ) : (
              <div className="status-metric-card status-metric-card--placement">
                <div className="status-metric-card__header">
                  <span className="status-metric-label">Placement Readiness</span>
                  <span className="placement-status-badge">
                    {placement.status || 'Needs Upskilling'}
                  </span>
                </div>
                <div className="status-metric-body">
                  <div className="placement-score-text">
                    Readiness Benchmark: <strong>{placement.readinessScore ?? '--'} / 100</strong>
                  </div>
                  <p className="placement-recommendation">
                    {placement.keyRecommendation || 'Participate in aptitude and coding preparation.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Academic & Attendance Section */}
          <div className="section-card">
            <h4 className="section-title">
              <GraduationCap size={16} /> Academic Performance & Attendance
            </h4>
            <div className="metric-pill-grid">
              <div className="metric-pill">
                <span className="metric-pill__label">Cumulative GPA</span>
                <span className="metric-pill__value">{isStudentUnavailable ? '-- / 10.0' : data.cgpa ? data.cgpa.toFixed(2) : '--'} / 10.0</span>
              </div>
              <div className="metric-pill">
                <span className="metric-pill__label">Attendance Rate</span>
                <span className={`metric-pill__value ${isStudentUnavailable ? '' : data.attendanceRate < 75 ? 'text-danger' : data.attendanceRate < 82 ? 'text-amber' : 'text-emerald'}`}>
                  {isStudentUnavailable ? 'Unavailable' : data.attendanceRate !== null && data.attendanceRate !== undefined ? `${data.attendanceRate}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-pill__label">LMS / Assignment Rate</span>
                <span className="metric-pill__value">
                  {isStudentUnavailable ? 'Unavailable' : data.assignmentCompletionRate !== null && data.assignmentCompletionRate !== undefined ? `${data.assignmentCompletionRate}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-pill__label">Engagement Index</span>
                <span className="metric-pill__value">
                  {isStudentUnavailable ? 'Unavailable' : data.engagementScore !== null && data.engagementScore !== undefined ? `${data.engagementScore} / 100` : 'Unrecorded'}
                </span>
              </div>
            </div>
            <div className="arrears-row">
              <span className="arrears-label">Backlog / Arrears Status:</span>
              {renderArrearsBadge()}
            </div>
          </div>

          {/* 7-Dimensional Breakdown Table */}
          <div className="section-card">
            <div className="section-title-wrap">
              <h4 className="section-title">
                <Layers size={16} /> Transparent 7-Factor Success Score Breakdown
              </h4>
              <span className="text-muted-xs">Sum of Weights = 100%</span>
            </div>
            {analytics.breakdown ? (
              <div className="breakdown-table-wrap">
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Factor Dimension</th>
                      <th>Base Weight</th>
                      <th>Effective Weight</th>
                      <th>Score (/100)</th>
                      <th>Contribution</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'academic', label: 'Academic Performance', defaultWeight: '30%' },
                      { key: 'attendance', label: 'Attendance Rate', defaultWeight: '15%' },
                      { key: 'placement', label: 'Placement Readiness', defaultWeight: '15%' },
                      { key: 'skills', label: 'Technical & Professional Skills', defaultWeight: '15%' },
                      { key: 'lms', label: 'LMS & Assignments', defaultWeight: '10%' },
                      { key: 'engagement', label: 'Student Engagement', defaultWeight: '10%' },
                      { key: 'mentor', label: 'Mentor Feedback', defaultWeight: '5%' }
                    ].map((row) => {
                      const item = analytics.breakdown[row.key] || {};
                      const isMissing = item.missing || item.score === null || item.score === undefined;
                      return (
                        <tr key={row.key} className={isMissing ? 'row-missing' : ''}>
                          <td className="font-medium">{row.label}</td>
                          <td>{item.baseWeight ? `${(item.baseWeight * 100).toFixed(0)}%` : row.defaultWeight}</td>
                          <td>{item.effectiveWeight ? `${(item.effectiveWeight * 100).toFixed(1)}%` : '0%'}</td>
                          <td>{item.score !== null && item.score !== undefined ? `${item.score}` : '--'}</td>
                          <td className="font-semibold text-blue">
                            {item.contribution !== null && item.contribution !== undefined ? `${item.contribution}` : '0.00'}
                          </td>
                          <td>
                            {isMissing ? (
                              <span className="status-tag status-tag--excluded">Unrecorded / Excluded</span>
                            ) : (
                              <span className="status-tag status-tag--active">Calculated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-notice">Breakdown details not available for this record.</p>
            )}
          </div>

          {/* Explainable Academic Risk Reasons */}
          <div className="section-card">
            <h4 className="section-title">
              <AlertTriangle size={16} className="text-amber" /> Explainable Academic Risk Factors
            </h4>
            {isStudentUnavailable ? (
              <p className="empty-notice">Risk factors unavailable for unverified records.</p>
            ) : academicRisk.reasons && academicRisk.reasons.length > 0 ? (
              <ul className="reasons-list">
                {academicRisk.reasons.map((reason, i) => (
                  <li key={i} className="reason-item">
                    <span className="reason-bullet" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-notice">No risk factors identified.</p>
            )}
          </div>

          {/* Placement Assessment Benchmarks */}
          <div className="section-card">
            <h4 className="section-title">
              <Briefcase size={16} className="text-blue" /> Placement & Skills Assessment Profile
            </h4>
            <div className="skills-grid">
              <div className="skill-box">
                <span className="skill-box__label">Coding Test</span>
                <span className="skill-box__value">
                  {isStudentUnavailable ? 'Unavailable' : data.codingScore !== null && data.codingScore !== undefined ? `${data.codingScore}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="skill-box">
                <span className="skill-box__label">Aptitude Test</span>
                <span className="skill-box__value">
                  {isStudentUnavailable ? 'Unavailable' : data.aptitudeScore !== null && data.aptitudeScore !== undefined ? `${data.aptitudeScore}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="skill-box">
                <span className="skill-box__label">Mock Interview</span>
                <span className="skill-box__value">
                  {isStudentUnavailable ? 'Unavailable' : data.mockInterviewScore !== null && data.mockInterviewScore !== undefined ? `${data.mockInterviewScore}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="skill-box">
                <span className="skill-box__label">Technical Skills</span>
                <span className="skill-box__value">
                  {isStudentUnavailable ? 'Unavailable' : data.technicalSkillsScore !== null && data.technicalSkillsScore !== undefined ? `${data.technicalSkillsScore}%` : 'Unrecorded'}
                </span>
              </div>
              <div className="skill-box">
                <span className="skill-box__label">Professional Skills</span>
                <span className="skill-box__value">
                  {isStudentUnavailable ? 'Unavailable' : data.professionalSkillsScore !== null && data.professionalSkillsScore !== undefined ? `${data.professionalSkillsScore}%` : 'Unrecorded'}
                </span>
              </div>
            </div>

            {isStudentUnavailable ? (
              <div className="placement-reasons-wrap">
                <p className="empty-notice">Assessment observations unavailable for unverified records.</p>
              </div>
            ) : placement.reasons && placement.reasons.length > 0 ? (
              <div className="placement-reasons-wrap">
                <span className="placement-reasons-label">Assessment Observations:</span>
                <ul className="reasons-list">
                  {placement.reasons.map((r, i) => (
                    <li key={i} className="reason-item reason-item--blue">
                      <span className="reason-bullet reason-bullet--blue" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Mentor Feedback Section */}
          <div className="section-card">
            <h4 className="section-title">
              <MessageSquare size={16} /> Faculty & Mentor Observations
            </h4>
            <div className="mentor-notes-card">
              <div className="mentor-header">
                <span className="mentor-tag">
                  {data.mentorAssigned ? 'Assigned Mentor Feedback' : 'No Mentor Formally Assigned'}
                </span>
                {data.mentorFeedbackScore !== null && data.mentorFeedbackScore !== undefined && (
                  <span className="mentor-score">Rating: {data.mentorFeedbackScore}%</span>
                )}
              </div>
              <p className="mentor-text">
                {data.mentorNotes ? `"${data.mentorNotes}"` : 'No qualitative mentor comments recorded for this student.'}
              </p>
            </div>
          </div>

          {/* Phase 4: Personalized AI Recommendations Section */}
          <div className="section-card">
            <div className="section-title-wrap">
              <h4 className="section-title">
                <Lightbulb size={16} className="text-amber" /> Personalized Recommendations
              </h4>
              <span className="text-muted-xs">
                {isStudentUnavailable
                  ? 'Unavailable'
                  : `${recommendations.length} Actionable Insight${recommendations.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {isRecsLoading ? (
              <div className="table-loading-wrap" style={{ padding: '1.5rem' }}>
                <Activity size={16} className="spin-icon" />
                <span>Generating tailored recommendations...</span>
              </div>
            ) : isStudentUnavailable ? (
              <p className="empty-notice">Student profile is unavailable. Recommendations cannot be generated for unverified records.</p>
            ) : recommendations.length === 0 ? (
              <p className="empty-notice">No specific remediation recommendations required at this time.</p>
            ) : (
              <div className="modal-recommendations-list">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`modal-rec-card modal-rec-card--${(rec.priority || 'Medium').toLowerCase()}`}
                  >
                    <div className="modal-rec-header">
                      <div className="modal-rec-title-wrap">
                        <span className={`pill-badge pill-badge--risk-${(rec.priority || 'Medium').toLowerCase()}`}>
                          {rec.priority} Priority
                        </span>
                        <span className="factor-tag">
                          {rec.factor.replace('_', ' ')}
                        </span>
                        <h5 className="modal-rec-title">{rec.title}</h5>
                      </div>
                      <button
                        className="btn-create-intervention-sm"
                        onClick={() => handleOpenNewIntervention(rec)}
                        title="Create Intervention from this recommendation"
                      >
                        <Plus size={13} /> Intervene
                      </button>
                    </div>

                    <div className="modal-rec-content">
                      <p className="modal-rec-reason">
                        <strong>Observed Reason:</strong> {rec.reason}
                      </p>
                      <p className="modal-rec-action">
                        <strong>Suggested Action:</strong> {rec.suggestedAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phase 5: Gemini AI Student Success Copilot Section */}
          <AiSuccessCopilot
            student={student || studentSummary}
            isStudentUnavailable={isStudentUnavailable}
          />

          {/* Phase 4: Faculty Interventions & Remediation Tracking Section */}
          <div className="section-card">
            <div className="section-title-wrap">
              <h4 className="section-title">
                <ShieldAlert size={16} className="text-teal" /> Faculty Intervention History
              </h4>
              <button
                className="btn-sm btn-secondary"
                onClick={() => handleOpenNewIntervention(null)}
                disabled={isStudentUnavailable}
                title={isStudentUnavailable ? 'Interventions can only be created for verified student records' : 'New Intervention Plan'}
              >
                <Plus size={14} /> New Intervention Plan
              </button>
            </div>

            {isInterventionsLoading ? (
              <div className="table-loading-wrap" style={{ padding: '1.5rem' }}>
                <Activity size={16} className="spin-icon" />
                <span>Loading intervention records...</span>
              </div>
            ) : isStudentUnavailable ? (
              <div className="modal-empty-interventions">
                <p className="empty-notice">Intervention history unavailable because student identity could not be verified.</p>
              </div>
            ) : interventions.length === 0 ? (
              <div className="modal-empty-interventions">
                <p className="empty-notice">No active or prior interventions recorded for this student.</p>
                {!isStudentUnavailable && (
                  <button
                    className="btn-link"
                    onClick={() => handleOpenNewIntervention(null)}
                  >
                    Create initial intervention plan &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="modal-interventions-list">
                {interventions.map((item) => {
                  const dueTimestamp = item.dueDate || item.targetDate;
                  const overdue = item.status !== 'Completed' && dueTimestamp && new Date(dueTimestamp) < new Date();
                  return (
                    <div
                      key={item.id || item._id}
                      className={`modal-intervention-item ${overdue ? 'modal-intervention-item--overdue' : ''}`}
                    >
                      <div className="modal-intervention-top">
                        <div className="modal-intervention-meta">
                          <span className={`pill-badge pill-badge--risk-${(item.priority || 'Medium').toLowerCase()}`}>
                            {item.priority || 'Medium'}
                          </span>
                          <span className={`status-tag status-tag--${(item.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                            {item.status || 'Pending'}
                          </span>
                          {overdue && <span className="overdue-tag">Overdue</span>}
                          <span className="faculty-badge">
                            <User size={12} /> {item.assignedFaculty || item.assignedTo || 'Unassigned'}
                          </span>
                        </div>
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEditIntervention(item)}
                          title="Edit Intervention"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>

                      <div className="modal-intervention-body">
                        <p className="intervention-issue">
                          <strong>Concern:</strong> {item.issue || item.notes || item.type || 'Not recorded'}
                        </p>
                        <p className="intervention-action">
                          <strong>Roadmap:</strong> {item.actionPlan || (item.type ? `Remediation type: ${item.type}` : 'Not recorded')}
                        </p>
                        {item.resolutionNotes && (
                          <p className="intervention-resolution">
                            <strong>Outcome:</strong> {item.resolutionNotes}
                          </p>
                        )}
                      </div>

                      <div className="modal-intervention-footer">
                        <span className="due-date-text">
                          <Clock size={12} /> Target Due: {dueTimestamp ? new Date(dueTimestamp).toLocaleDateString() : 'Not specified'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Profile
          </button>
        </div>

        {/* Intervention Modal Dialog */}
        <InterventionModal
          isOpen={isInterventionModalOpen}
          onClose={() => {
            setIsInterventionModalOpen(false);
            setEditingIntervention(null);
          }}
          onSaved={handleInterventionSaved}
          initialData={editingIntervention}
          defaultStudent={data}
        />
      </div>
    </div>
  );
}

export default StudentDetailModal;
