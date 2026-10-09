import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RefreshCw,
  Users
} from 'lucide-react';
import { fetchStudents } from '../services/api.js';

export function StudentExplorer({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, branch, riskLevel, placementStatus]);

  // Load students from API
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetchStudents({
      page: pagination.page,
      limit: pagination.limit,
      search: debouncedSearch,
      branch: branch || undefined,
      riskLevel: riskLevel || undefined,
      placementStatus: placementStatus || undefined
    });

    if (res.success) {
      setStudents(res.data);
      setPagination(res.pagination);
    } else {
      setError(res.error || 'Failed to retrieve students');
      setStudents([]);
    }
    setIsLoading(false);
  }, [pagination.page, pagination.limit, debouncedSearch, branch, riskLevel, placementStatus]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Pagination navigation
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setBranch('');
    setRiskLevel('');
    setPlacementStatus('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Badges renderer
  const renderRiskBadge = (level) => {
    const lvl = level || 'Low';
    return (
      <span className={`pill-badge pill-badge--risk-${lvl.toLowerCase()}`}>
        {lvl}
      </span>
    );
  };

  const renderPlacementBadge = (status) => {
    if (!status) return <span className="text-muted-xs">--</span>;
    if (status === 'Job Ready') {
      return <span className="pill-badge pill-badge--placement-ready">Job Ready</span>;
    }
    if (status === 'Needs Upskilling') {
      return <span className="pill-badge pill-badge--placement-upskill">Needs Upskilling</span>;
    }
    return <span className="pill-badge pill-badge--placement-priority">High Priority</span>;
  };

  const renderScoreCell = (student) => {
    const analytics = student.analytics || {};
    if (analytics.isEligibleForScoring === false || analytics.successScore === null) {
      return (
        <span
          className="insufficient-badge"
          title={`Data coverage is ${analytics.dataCoverage ?? '--'}% (<60% minimum threshold)`}
        >
          <AlertTriangle size={12} /> Insufficient Data ({analytics.dataCoverage ?? 0}%)
        </span>
      );
    }

    const score = analytics.successScore;
    let scoreColor = '#10b981'; // Green
    if (score < 60) scoreColor = '#ef4444'; // Red
    else if (score < 75) scoreColor = '#f59e0b'; // Amber

    return (
      <div className="table-score-wrap">
        <span className="table-score-val" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="table-score-denom">/100</span>
      </div>
    );
  };

  const hasActiveFilters = Boolean(search || branch || riskLevel || placementStatus);

  return (
    <div className="explorer-card">
      {/* Explorer Header */}
      <div className="explorer-header">
        <div className="explorer-header__title-wrap">
          <Users size={20} className="text-blue" />
          <div>
            <h3 className="explorer-title">Student Explorer</h3>
            <p className="explorer-subtitle">
              Search, filter, and inspect student records with explainable risk insights
            </p>
          </div>
        </div>
        <div className="explorer-meta">
          <span className="count-pill">
            {pagination.total} Student{pagination.total === 1 ? '' : 's'} Found
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        {/* Search Bar */}
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="filter-input search-input"
            placeholder="Search by reg number (e.g. 241FA04001) or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="filter-selects-group">
          {/* Branch Select */}
          <select
            className="filter-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="04">CSE (04)</option>
            <option value="18">AIML (18)</option>
            <option value="19">Cybersecurity (19)</option>
          </select>

          {/* Academic Risk Select */}
          <select
            className="filter-select"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <option value="">All Academic Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Placement Status Select */}
          <select
            className="filter-select"
            value={placementStatus}
            onChange={(e) => setPlacementStatus(e.target.value)}
          >
            <option value="">All Placement Statuses</option>
            <option value="Job Ready">Job Ready</option>
            <option value="Needs Upskilling">Needs Upskilling</option>
            <option value="High Priority Intervention">High Priority</option>
          </select>

          {hasActiveFilters && (
            <button className="btn-filter-reset" onClick={handleClearFilters} title="Reset all filters">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="alert-box alert-box--warning" style={{ margin: '1rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button className="btn-secondary" onClick={loadStudents}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Student Name</th>
              <th>Branch</th>
              <th>Sem</th>
              <th>CGPA</th>
              <th>Attendance</th>
              <th>Success Score</th>
              <th>Academic Risk</th>
              <th>Placement Status</th>
              <th className="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="table-empty-cell">
                  <div className="table-loading-wrap">
                    <RefreshCw size={18} className="spin-icon" />
                    <span>Loading student records...</span>
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty-cell">
                  <div className="table-empty-state">
                    <AlertTriangle size={24} className="text-amber" />
                    <p className="table-empty-text">No students matched the selected filters.</p>
                    {hasActiveFilters && (
                      <button className="btn-secondary" onClick={handleClearFilters}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isInsufficient =
                  student.analytics?.isEligibleForScoring === false ||
                  student.analytics?.successScore === null;
                const isHighRisk = student.academicRisk?.level === 'High';

                return (
                  <tr
                    key={student.id || student.registrationNumber}
                    className={`student-row ${isHighRisk ? 'student-row--high-risk' : ''} ${isInsufficient ? 'student-row--insufficient' : ''}`}
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                  >
                    <td className="cell-reg font-mono">{student.registrationNumber}</td>
                    <td className="cell-name font-medium">{student.name}</td>
                    <td>
                      <span className="branch-tag">{student.branchSlug || student.branchCode}</span>
                    </td>
                    <td className="cell-sem">{student.semester ?? '--'}</td>
                    <td className="cell-cgpa font-semibold">
                      {student.cgpa !== null && student.cgpa !== undefined ? student.cgpa.toFixed(2) : '--'}
                    </td>
                    <td>
                      <span
                        className={`cell-attendance ${
                          student.attendanceRate < 75
                            ? 'text-danger font-semibold'
                            : student.attendanceRate < 82
                            ? 'text-amber'
                            : 'text-emerald'
                        }`}
                      >
                        {student.attendanceRate !== null && student.attendanceRate !== undefined
                          ? `${student.attendanceRate}%`
                          : '--'}
                      </span>
                    </td>
                    <td>{renderScoreCell(student)}</td>
                    <td>{renderRiskBadge(student.academicRisk?.level)}</td>
                    <td>{renderPlacementBadge(student.placementReadiness?.status)}</td>
                    <td className="cell-action" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-view-profile"
                        onClick={() => onSelectStudent && onSelectStudent(student)}
                        title={`View complete profile for ${student.name}`}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-bar">
        <div className="pagination-info">
          Showing{' '}
          <strong>
            {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong>
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </strong>{' '}
          of <strong>{pagination.total}</strong> students
        </div>

        <div className="pagination-controls">
          <div className="limit-selector">
            <label htmlFor="limit-select" className="limit-label">
              Rows:
            </label>
            <select
              id="limit-select"
              className="limit-select"
              value={pagination.limit}
              onChange={handleLimitChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="page-nav">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={pagination.page <= 1 || isLoading}
              title="Previous Page"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="page-indicator">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              title="Next Page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentExplorer;
