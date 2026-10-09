import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Edit2,
  Trash2,
  RefreshCw,
  Database,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import InterventionModal from '../components/InterventionModal.jsx';
import {
  fetchInterventions,
  fetchInterventionStats,
  updateIntervention,
  deleteIntervention
} from '../services/api.js';

export function InterventionsView({ onSelectStudent }) {
  const [interventions, setInterventions] = useState([]);
  const [stats, setStats] = useState(null);
  const [storageMeta, setStorageMeta] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [branch, setBranch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load stats
  const loadStats = useCallback(async () => {
    const res = await fetchInterventionStats();
    if (res.success && res.data) {
      setStats(res.data);
      if (res.data.storage) {
        setStorageMeta(res.data.storage);
      }
    }
  }, []);

  // Load interventions list
  const loadInterventions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetchInterventions({
      page: pagination.page,
      limit: pagination.limit,
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
      branch: branch || undefined
    });

    if (res.success) {
      setInterventions(res.data);
      setPagination(res.pagination);
      if (res.storage) {
        setStorageMeta(res.storage);
      }
    } else {
      setError(res.error || 'Failed to retrieve interventions');
      setInterventions([]);
    }
    setIsLoading(false);
  }, [pagination.page, pagination.limit, debouncedSearch, status, priority, branch]);

  useEffect(() => {
    loadStats();
    loadInterventions();
  }, [loadStats, loadInterventions]);

  const handleOpenCreate = () => {
    setEditingIntervention(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (intervention) => {
    setEditingIntervention(intervention);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateIntervention(id, { status: newStatus });
    if (res.success) {
      loadInterventions();
      loadStats();
    } else {
      alert(`Failed to update status: ${res.error}`);
    }
  };

  const handleDelete = async (id, regNo) => {
    if (!window.confirm(`Are you sure you want to delete intervention for ${regNo}?`)) {
      return;
    }
    const res = await deleteIntervention(id);
    if (res.success) {
      loadInterventions();
      loadStats();
    } else {
      alert(`Failed to delete: ${res.error}`);
    }
  };

  const handleSaved = () => {
    loadInterventions();
    loadStats();
  };

  // Helper: check if overdue
  const isOverdue = (intervention) => {
    if (intervention.status === 'Completed') return false;
    const dueTimestamp = intervention.dueDate || intervention.targetDate;
    if (!dueTimestamp) return false;
    const due = new Date(dueTimestamp);
    return !isNaN(due.getTime()) && due < new Date();
  };

  return (
    <div className="interventions-page">
      {/* View Header */}
      <div className="view-header">
        <div>
          <div className="badge-pill">Phase 4: Faculty Accountability & Case Tracking</div>
          <h2 className="view-title">Faculty Intervention Management</h2>
          <p className="view-desc">
            Assign targeted remediation plans, track mentor commitments, and record verifiable outcomes for at-risk learners.
          </p>
        </div>
        <div className="view-header__actions">
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> New Intervention Plan
          </button>
        </div>
      </div>

      {/* Storage Mode Transparency Warning */}
      {storageMeta && storageMeta.mode === 'synthetic_fallback' && (
        <div className="alert-box alert-box--warning">
          <Database size={20} className="text-amber" />
          <div className="alert-box__content">
            <h4 className="alert-box__title">In-Memory Fallback Mode Active</h4>
            <p className="alert-box__text">
              MongoDB is currently disconnected. Interventions are temporarily stored in the in-memory development repository and will reset on backend restart.
            </p>
          </div>
        </div>
      )}

      {/* Stats KPI Cards */}
      <section className="metrics-grid">
        <MetricCard
          title="Total Interventions"
          value={stats ? `${stats.total}` : '--'}
          subtitle="Across all departments"
          icon={ShieldAlert}
          variant="info"
        />
        <MetricCard
          title="Pending Action"
          value={stats ? `${stats.pending}` : '--'}
          subtitle="Awaiting initial session"
          icon={Clock}
          variant="default"
        />
        <MetricCard
          title="In Progress"
          value={stats ? `${stats.inProgress}` : '--'}
          subtitle="Remediation active"
          icon={Activity}
          variant="warning"
        />
        <MetricCard
          title="Resolved & Completed"
          value={stats ? `${stats.completed}` : '--'}
          subtitle="Verified positive outcomes"
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
              placeholder="Search by student, reg number, issue, or faculty..."
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="filter-select"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              className="filter-select"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
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
                setStatus('');
                setPriority('');
                setBranch('');
                setPagination((p) => ({ ...p, page: 1 }));
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

        {/* Interventions Table */}
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Observed Issue</th>
                <th>Remediation Action Plan</th>
                <th>Priority</th>
                <th>Assigned Faculty</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="table-loading-wrap">
                      <RefreshCw size={18} className="spin-icon" />
                      <span>Loading interventions...</span>
                    </div>
                  </td>
                </tr>
              ) : interventions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="table-empty-state">
                      <ShieldAlert size={28} className="text-muted" />
                      <p className="table-empty-text">No intervention records matched the selected filters.</p>
                      <button className="btn-secondary" onClick={handleOpenCreate}>
                        Create New Intervention
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                interventions.map((item) => {
                  const overdue = isOverdue(item);
                  return (
                    <tr
                      key={item.id || item._id}
                      className={`student-row ${overdue ? 'student-row--high-risk' : ''}`}
                    >
                      <td>
                        <button
                          className="student-link-btn"
                          onClick={() =>
                            onSelectStudent &&
                            onSelectStudent({
                              registrationNumber: item.studentRegistrationNumber || item.studentRegNo,
                              name: item.studentName
                            })
                          }
                          title="View complete student profile"
                        >
                          <div className="student-cell-wrap">
                            <span className="cell-reg font-mono">
                              {item.studentRegistrationNumber || item.studentRegNo || 'Unregistered'}
                            </span>
                            <span className="student-cell-name">{item.studentName}</span>
                            <span className="branch-tag">{item.studentBranch || item.branchCode || item.branch || '--'}</span>
                            {item.hasIdentityConflict && (
                              <span
                                className="pill-badge pill-badge--risk-high"
                                style={{ fontSize: '10px', padding: '1px 5px', whiteSpace: 'nowrap' }}
                                title={`Registration number belongs to ${item.verifiedOwnerName || 'another student'} in directory`}
                              >
                                Unverified
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <p className="cell-clamp-2" title={item.issue || item.notes || item.type || 'Not recorded'}>
                          {item.issue || item.notes || item.type || 'Not recorded'}
                        </p>
                      </td>
                      <td style={{ maxWidth: '260px' }}>
                        <p className="cell-clamp-2" title={item.actionPlan || (item.type ? `Remediation type: ${item.type}` : 'Not recorded')}>
                          {item.actionPlan || (item.type ? `Remediation type: ${item.type}` : 'Not recorded')}
                        </p>
                        {item.resolutionNotes && (
                          <p className="resolution-notes-preview">
                            <strong>Outcome:</strong> {item.resolutionNotes}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className={`pill-badge pill-badge--risk-${(item.priority || 'Medium').toLowerCase()}`}>
                          {item.priority || 'Medium'}
                        </span>
                      </td>
                      <td>
                        <span className="faculty-badge">
                          <User size={12} /> {item.assignedFaculty || item.assignedTo || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <div className="due-date-cell">
                          <span>
                            {item.dueDate || item.targetDate
                              ? new Date(item.dueDate || item.targetDate).toLocaleDateString()
                              : '--'}
                          </span>
                          {overdue && (
                            <span className="overdue-tag" title="Target date has passed!">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-select status-select--${(item.status || 'Pending').toLowerCase().replace(' ', '-')}`}
                          value={item.status || 'Pending'}
                          onChange={(e) => handleStatusChange(item.id || item._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="cell-action">
                        <div className="action-buttons-group">
                          <button
                            className="btn-icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Intervention Details"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn-icon btn-icon--danger"
                            onClick={() =>
                              handleDelete(
                                item.id || item._id,
                                item.studentRegistrationNumber || item.studentRegNo || item.studentName
                              )
                            }
                            title="Delete Intervention"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing <strong>{interventions.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</strong> to{' '}
            <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
            <strong>{pagination.total}</strong> interventions
          </div>

          <div className="pagination-controls">
            <div className="page-nav">
              <button
                className="pagination-btn"
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="page-indicator">
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Modal Dialog */}
      <InterventionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialData={editingIntervention}
      />
    </div>
  );
}

export default InterventionsView;
