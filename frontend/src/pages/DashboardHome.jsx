import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  RefreshCw,
  ExternalLink,
  Info,
  Activity,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import AnalyticsCharts from '../components/AnalyticsCharts.jsx';
import StudentExplorer from '../components/StudentExplorer.jsx';
import StudentDetailModal from '../components/StudentDetailModal.jsx';
import { API_BASE_URL, fetchAnalyticsOverview } from '../services/api.js';

export function DashboardHome({
  healthInfo,
  isOnline,
  isLoading: isHealthLoading,
  error: healthError,
  onRetry,
  activeView = 'dashboard',
  onNavigate,
  onSelectStudent
}) {
  const [overview, setOverview] = useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadOverview = useCallback(async () => {
    setIsOverviewLoading(true);
    setOverviewError(null);

    const res = await fetchAnalyticsOverview();
    if (res.success && res.data) {
      setOverview(res.data);
    } else {
      setOverviewError(res.error || 'Failed to load cohort analytics overview');
    }
    setIsOverviewLoading(false);
  }, []);

  // Fetch immediately on mount and when retrying
  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleGlobalRetry = () => {
    if (onRetry) onRetry();
    loadOverview();
  };

  const dbMode = healthInfo?.database?.mode || 'synthetic_fallback';
  const totalStudents = overview?.totalStudents ?? (healthInfo?.syntheticFallback?.datasetSize || 120);

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-banner__content">
          <div className="badge-pill">
            {activeView === 'dashboard'
              ? 'Dashboard Overview • CampusIQ 2026'
              : activeView === 'explorer'
              ? 'Student Records & Performance Directory'
              : 'Cohort Analytics & Risk Distributions'}
          </div>
          <h2 className="welcome-title">Student Success & Early Warning Analytics</h2>
          <p className="welcome-desc">
            Continuous cohort tracking, explainable multi-factor risk detection, and placement readiness profiling across engineering programs.
          </p>
          <div className="welcome-actions">
            <button
              className={`welcome-nav-btn ${activeView === 'dashboard' ? 'welcome-nav-btn--active' : ''}`}
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              Overview
            </button>
            <button
              className={`welcome-nav-btn ${activeView === 'explorer' ? 'welcome-nav-btn--active' : ''}`}
              onClick={() => onNavigate && onNavigate('explorer')}
            >
              Student Explorer
            </button>
            <button
              className={`welcome-nav-btn ${activeView === 'analytics' ? 'welcome-nav-btn--active' : ''}`}
              onClick={() => onNavigate && onNavigate('analytics')}
            >
              Charts & Visualizations
            </button>
            <button
              className={`welcome-nav-btn ${activeView === 'recommendations' ? 'welcome-nav-btn--active' : ''}`}
              onClick={() => onNavigate && onNavigate('recommendations')}
            >
              Recommendations
            </button>
            <button
              className={`welcome-nav-btn ${activeView === 'interventions' ? 'welcome-nav-btn--active' : ''}`}
              onClick={() => onNavigate && onNavigate('interventions')}
            >
              Interventions
            </button>
          </div>
        </div>

        <div className="welcome-banner__api-meta">
          <div className="api-meta-item">
            <span className="api-meta-label">Configured API Base</span>
            <code className="api-meta-code">{API_BASE_URL}</code>
          </div>
          <div className="api-meta-item">
            <span className="api-meta-label">Backend Connection</span>
            <span className={`status-indicator ${isOnline ? 'status-indicator--online' : 'status-indicator--offline'}`}>
              {isOnline ? 'Live & Synchronized' : 'Offline / Unreachable'}
            </span>
          </div>
        </div>
      </section>

      {/* Disconnection Warning Banner if backend is down */}
      {!isOnline && (
        <section className="alert-box alert-box--warning">
          <div className="alert-box__icon">
            <AlertTriangle size={24} />
          </div>
          <div className="alert-box__content">
            <h4 className="alert-box__title">Backend Connection Required</h4>
            <p className="alert-box__text">
              The frontend is currently unable to communicate with the API server at <code>{API_BASE_URL}</code> ({healthError || 'Connection refused'}).
            </p>
            <p className="alert-box__text">
              Ensure the backend server is running on port 5002:
              <br />
              <code>cd backend && npm run dev</code>
            </p>
          </div>
          <button className="btn-secondary" onClick={handleGlobalRetry} disabled={isHealthLoading}>
            <RefreshCw size={16} className={isHealthLoading ? 'spin-icon' : ''} />
            Retry Connection
          </button>
        </section>
      )}

      {/* DASHBOARD VIEW */}
      {(activeView === 'dashboard' || activeView === 'analytics') && (
        <>
          {/* Live KPI Metric Cards */}
          <section className="metrics-grid">
            <MetricCard
              title="Total Students"
              value={overview ? `${overview.totalStudents}` : `${totalStudents}`}
              subtitle={
                overview
                  ? `Scored: ${overview.scoredStudents} • Incomplete: ${overview.insufficientDataStudents}`
                  : 'Cohort across 3 departments'
              }
              icon={Users}
              variant="info"
            />
            <MetricCard
              title="Average Success Score"
              value={overview?.averageSuccessScore ? `${overview.averageSuccessScore}` : '--'}
              subtitle="Cohort mean (/100) across 7 dimensions"
              icon={Award}
              variant="default"
            />
            <MetricCard
              title="High-Risk Students"
              value={overview?.riskDistribution ? `${overview.riskDistribution.high}` : '--'}
              subtitle="Attendance < 75% or multiple backlogs"
              icon={AlertTriangle}
              variant="warning"
            />
            <MetricCard
              title="Job-Ready Candidates"
              value={overview?.placementDistribution ? `${overview.placementDistribution.jobReady}` : '--'}
              subtitle="Clean records & strong assessment scores"
              icon={Briefcase}
              variant="success"
            />
          </section>

          {/* Cohort Analytics & Visualizations Grid */}
          <section className="analytics-section">
            <AnalyticsCharts overview={overview} isLoading={isOverviewLoading} />
          </section>

          {/* Direct Navigation Callout to Explorer */}
          {activeView === 'dashboard' && (
            <section className="explorer-callout-card">
              <div className="explorer-callout__content">
                <div className="explorer-callout__icon">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="explorer-callout__title">Explore Individual Student Records</h3>
                  <p className="explorer-callout__desc">
                    Search and filter across {totalStudents} fictional profiles in CSE (04), AIML (18), and Cybersecurity (19). Inspect detailed 7-factor score breakdowns, explainable risk reasons, and placement recommendations.
                  </p>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => onNavigate && onNavigate('explorer')}
              >
                Open Student Explorer <ArrowRight size={16} />
              </button>
            </section>
          )}
        </>
      )}

      {/* EXPLORER VIEW */}
      {activeView === 'explorer' && (
        <section className="explorer-section">
          <StudentExplorer onSelectStudent={onSelectStudent || setSelectedStudent} />
        </section>
      )}

      {/* Selected Student Slide-Over Modal (rendered here if onSelectStudent not supplied) */}
      {!onSelectStudent && selectedStudent && (
        <StudentDetailModal
          studentSummary={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Live System & API Reference Footer Card */}
      <section className="details-card">
        <div className="details-header">
          <Info size={18} className="text-blue" />
          <h3 className="details-title">API Verification & Architecture Reference</h3>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Monitored Programs:</span>
            <span className="detail-value">CSE (04), AIML (18), Cybersecurity (19)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Persistence Engine:</span>
            <span className="detail-value">{dbMode === 'mongodb' ? 'MongoDB Cluster (Connected)' : 'Synthetic Fallback (Active)'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cohort Overview API:</span>
            <a
              href={`${API_BASE_URL}/analytics/overview`}
              target="_blank"
              rel="noreferrer"
              className="detail-link"
            >
              <code>GET /api/analytics/overview</code> <ExternalLink size={14} />
            </a>
          </div>
          <div className="detail-item">
            <span className="detail-label">Students API Endpoint:</span>
            <a
              href={`${API_BASE_URL}/students?page=1&limit=10`}
              target="_blank"
              rel="noreferrer"
              className="detail-link"
            >
              <code>GET /api/students</code> <ExternalLink size={14} />
            </a>
          </div>
          <div className="detail-item">
            <span className="detail-label">AI Recommendations API:</span>
            <a
              href={`${API_BASE_URL}/recommendations`}
              target="_blank"
              rel="noreferrer"
              className="detail-link"
            >
              <code>GET /api/recommendations</code> <ExternalLink size={14} />
            </a>
          </div>
          <div className="detail-item">
            <span className="detail-label">Interventions API:</span>
            <a
              href={`${API_BASE_URL}/interventions/stats`}
              target="_blank"
              rel="noreferrer"
              className="detail-link"
            >
              <code>GET /api/interventions/stats</code> <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
