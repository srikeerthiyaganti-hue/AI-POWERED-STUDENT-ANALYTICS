import React, { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Database,
  User,
  GraduationCap
} from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import InterventionModal from '../components/InterventionModal.jsx';
import { fetchAllRecommendations } from '../services/api.js';

export function RecommendationsView({ onSelectStudent }) {
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState({ total: 0, distribution: { high: 0, medium: 0, low: 0 }, page: 1, limit: 12, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [factor, setFactor] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Intervention Modal State for creating an intervention directly from a recommendation
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetchAllRecommendations({
      page,
      limit,
      search: debouncedSearch || undefined,
      priority: priority || undefined,
      factor: factor || undefined,
      branch: branch || undefined
    });

    if (res.success) {
      setRecommendations(res.data);
      setMeta(res.meta || { total: 0, distribution: { high: 0, medium: 0, low: 0 }, page: 1, limit: 12, totalPages: 1 });
    } else {
      setError(res.error || 'Failed to load recommendations');
      setRecommendations([]);
    }
    setIsLoading(false);
  }, [page, limit, debouncedSearch, priority, factor, branch]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleOpenCreateIntervention = (rec) => {
    setSelectedRecommendation(rec);
    setIsInterventionModalOpen(true);
  };

  const handleInterventionSaved = (savedIntervention) => {
    setSuccessToast(
      `Intervention created successfully for ${savedIntervention?.studentRegistrationNumber || 'student'}!`
    );
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getFactorBadgeClass = (f) => {
    switch (f?.toLowerCase()) {
      case 'academic':
        return 'factor-tag factor-tag--academic';
      case 'attendance':
        return 'factor-tag factor-tag--attendance';
      case 'placement':
        return 'factor-tag factor-tag--placement';
      case 'coding':
        return 'factor-tag factor-tag--coding';
      case 'aptitude':
        return 'factor-tag factor-tag--aptitude';
      case 'lms':
        return 'factor-tag factor-tag--lms';
      case 'data_verification':
      case 'data verification':
        return 'factor-tag factor-tag--data-verification';
      case 'mentor':
        return 'factor-tag factor-tag--mentor';
      default:
        return 'factor-tag';
    }
  };

  return (
    <div className="recommendations-page">
      {/* View Header */}
      <div className="view-header">
        <div>
          <div className="badge-pill">Phase 4: AI Recommendations Engine</div>
          <h2 className="view-title">Personalized Student Recommendations</h2>
          <p className="view-desc">
            Algorithmic, explainable remediation recommendations generated directly from live multi-factor indicators and data-coverage audits.
          </p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="alert-box alert-box--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} className="text-emerald" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <section className="metrics-grid">
        <MetricCard
          title="Total Recommendations"
          value={meta ? `${meta.total}` : '--'}
          subtitle="Filtered recommendations"
          icon={Lightbulb}
          variant="info"
        />
        <MetricCard
          title="High Priority"
          value={meta?.distribution ? `${meta.distribution.high}` : '--'}
          subtitle="Requires immediate faculty action"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Medium Priority"
          value={meta?.distribution ? `${meta.distribution.medium}` : '--'}
          subtitle="Targeted skills upskilling"
          icon={Sparkles}
          variant="default"
        />
        <MetricCard
          title="Low Priority"
          value={meta?.distribution ? `${meta.distribution.low}` : '--'}
          subtitle="Proactive career guidance"
          icon={CheckCircle2}
          variant="success"
        />
      </section>

      {/* Filter Toolbar */}
      <div className="explorer-card">
        <div className="filter-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="filter-input search-input"
              placeholder="Search by student, reg number, issue, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          <div className="filter-selects-group">
            <select
              className="filter-select"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              className="filter-select"
              value={factor}
              onChange={(e) => {
                setFactor(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Factors</option>
              <option value="academic">Academic (CGPA/Arrears)</option>
              <option value="attendance">Attendance (&lt;75%)</option>
              <option value="coding">Coding Assessment</option>
              <option value="aptitude">Aptitude Testing</option>
              <option value="placement">Placement Readiness</option>
              <option value="lms">LMS Completion</option>
              <option value="data_verification">Data Verification</option>
              <option value="mentor">Mentor Guidance</option>
            </select>

            <select
              className="filter-select"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Branches</option>
              <option value="04">CSE (04)</option>
              <option value="18">AIML (18)</option>
              <option value="19">Cybersecurity (19)</option>
            </select>

            <button
              className="btn-filter-reset"
              onClick={() => {
                setSearch('');
                setPriority('');
                setFactor('');
                setBranch('');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="alert-box alert-box--warning" style={{ margin: '1rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Recommendations Cards Grid */}
        <div className="recommendations-container">
          {isLoading ? (
            <div className="loading-banner" style={{ margin: '2rem 1rem' }}>
              <RefreshCw size={20} className="spin-icon" />
              <span>Generating real-time recommendations for cohort...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="table-empty-state" style={{ padding: '3rem 1rem' }}>
              <Lightbulb size={36} className="text-muted" />
              <p className="table-empty-text">No recommendations match the specified criteria.</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearch('');
                  setPriority('');
                  setFactor('');
                  setBranch('');
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`recommendation-card recommendation-card--${(rec.priority || 'Medium').toLowerCase()}`}
                >
                  <div className="recommendation-card__header">
                    <div className="recommendation-card__student">
                      <button
                        className="student-link-btn"
                        onClick={() =>
                          onSelectStudent &&
                          onSelectStudent({
                            registrationNumber: rec.studentRegistrationNumber,
                            name: rec.studentName
                          })
                        }
                        title="View complete student profile"
                      >
                        <span className="rec-reg font-mono">{rec.studentRegistrationNumber}</span>
                        <span className="rec-name">{rec.studentName}</span>
                      </button>
                      <span className="branch-tag">{rec.branchSlug || rec.branchCode}</span>
                    </div>

                    <div className="recommendation-card__badges">
                      <span className={getFactorBadgeClass(rec.factor)}>
                        {rec.factor.replace('_', ' ')}
                      </span>
                      <span
                        className={`pill-badge pill-badge--risk-${(rec.priority || 'Medium').toLowerCase()}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                  </div>

                  <div className="recommendation-card__body">
                    <h4 className="rec-title">{rec.title}</h4>

                    <div className="rec-detail-block">
                      <span className="rec-detail-label">Why Flagged:</span>
                      <p className="rec-reason">{rec.reason}</p>
                    </div>

                    <div className="rec-detail-block rec-detail-block--action">
                      <span className="rec-detail-label">Recommended Action:</span>
                      <p className="rec-action">{rec.suggestedAction}</p>
                    </div>

                    {/* Student Snapshot Metrics */}
                    <div className="rec-snapshot-strip">
                      <div className="rec-snapshot-item">
                        <span className="snapshot-label">CGPA:</span>
                        <span className="snapshot-value">{rec.cgpa ? rec.cgpa.toFixed(2) : '--'}</span>
                      </div>
                      <div className="rec-snapshot-item">
                        <span className="snapshot-label">Attendance:</span>
                        <span
                          className={`snapshot-value ${
                            rec.attendanceRate < 75 ? 'text-danger font-semibold' : ''
                          }`}
                        >
                          {rec.attendanceRate !== null && rec.attendanceRate !== undefined
                            ? `${rec.attendanceRate}%`
                            : '--'}
                        </span>
                      </div>
                      <div className="rec-snapshot-item">
                        <span className="snapshot-label">Risk Level:</span>
                        <span
                          className={`snapshot-value risk-text--${(rec.riskLevel || 'Low').toLowerCase()}`}
                        >
                          {rec.riskLevel || 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="recommendation-card__footer">
                    <button
                      className="btn-create-intervention"
                      onClick={() => handleOpenCreateIntervention(rec)}
                    >
                      <Plus size={15} /> Create Intervention Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing <strong>{recommendations.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
            <strong>{Math.min(page * limit, meta.total)}</strong> of{' '}
            <strong>{meta.total}</strong> recommendations
          </div>

          <div className="pagination-controls">
            <div className="page-nav">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="page-indicator">
                Page <strong>{page}</strong> of <strong>{meta.totalPages || 1}</strong>
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
                disabled={page >= (meta.totalPages || 1) || isLoading}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Creation Modal */}
      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => {
          setIsInterventionModalOpen(false);
          setSelectedRecommendation(null);
        }}
        onSaved={handleInterventionSaved}
        initialData={
          selectedRecommendation
            ? {
                studentRegistrationNumber: selectedRecommendation.studentRegistrationNumber,
                studentName: selectedRecommendation.studentName,
                issue: selectedRecommendation.reason,
                actionPlan: selectedRecommendation.suggestedAction,
                priority: selectedRecommendation.priority
              }
            : null
        }
      />
    </div>
  );
}

export default RecommendationsView;
