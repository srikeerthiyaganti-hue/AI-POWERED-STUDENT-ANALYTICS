import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Save,
  Activity
} from 'lucide-react';
import { createIntervention, updateIntervention } from '../services/api.js';

export function InterventionModal({
  isOpen,
  onClose,
  onSaved,
  initialData = null, // if provided, editing existing intervention or pre-filled from recommendation
  defaultStudent = null // optional pre-selected student object { registrationNumber, name, branch }
}) {
  const isEditing = Boolean(initialData && initialData.id);

  // Form State
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [issue, setIssue] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedFaculty, setAssignedFaculty] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Populate form on open or when initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
    if (initialData) {
      const reg = initialData.studentRegistrationNumber || initialData.studentRegNo || '';
      if (reg && reg.toString().match(/^241FA(04|18|19)\d{3}$/i)) {
        setStudentRegNo(reg.toString().toUpperCase());
        setStudentName(initialData.studentName || '');
      } else {
        setStudentRegNo('');
        setStudentName('');
      }
      setIssue(initialData.issue || initialData.reason || '');
      setActionPlan(initialData.actionPlan || initialData.suggestedAction || '');
      setPriority(initialData.priority || 'Medium');
      setAssignedFaculty(initialData.assignedFaculty || '');
      setStatus(initialData.status || 'Pending');
      setNotes(initialData.notes || '');
      setResolutionNotes(initialData.resolutionNotes || '');

      if (initialData.dueDate) {
        const d = new Date(initialData.dueDate);
        setDueDate(!isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '');
      } else {
        // Default 14 days in future for new interventions
        const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        setDueDate(future.toISOString().split('T')[0]);
      }
    } else if (defaultStudent) {
      const reg =
        defaultStudent.registrationNumber ||
        defaultStudent.studentRegistrationNumber ||
        defaultStudent.studentRegNo ||
        defaultStudent.id ||
        '';
      if (reg && reg.toString().match(/^241FA(04|18|19)\d{3}$/i)) {
        setStudentRegNo(reg.toString().toUpperCase());
        setStudentName(defaultStudent.name || '');
      } else {
        setStudentRegNo('');
        setStudentName('');
      }
      setIssue('');
      setActionPlan('');
      setPriority('Medium');
      setAssignedFaculty('');
      setStatus('Pending');
      setNotes('');
      setResolutionNotes('');

      const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      setDueDate(future.toISOString().split('T')[0]);
    } else {
      setStudentRegNo('');
      setStudentName('');
      setIssue('');
      setActionPlan('');
      setPriority('Medium');
      setAssignedFaculty('');
      setStatus('Pending');
      setNotes('');
      setResolutionNotes('');

      const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      setDueDate(future.toISOString().split('T')[0]);
    }
  }, [isOpen, initialData, defaultStudent]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validations
    const cleanReg = studentRegNo.trim().toUpperCase();
    if (!cleanReg) {
      setFormError('Student registration number is required');
      return;
    }
    if (!cleanReg.match(/^241FA(04|18|19)\d{3}$/)) {
      setFormError('Invalid registration number format. Format must match 241FA[04|18|19]xxx');
      return;
    }
    if (!issue.trim() || issue.trim().length < 5) {
      setFormError('Issue description is required and must be at least 5 characters');
      return;
    }
    if (!actionPlan.trim() || actionPlan.trim().length < 5) {
      setFormError('Action plan is required and must be at least 5 characters');
      return;
    }
    if (!assignedFaculty.trim()) {
      setFormError('Assigned faculty or mentor name is required');
      return;
    }
    if (!dueDate) {
      setFormError('Due date is required');
      return;
    }

    const parsedDue = new Date(dueDate);
    if (isNaN(parsedDue.getTime())) {
      setFormError('Due date must be a valid date');
      return;
    }

    // Only for NEW interventions: due date cannot be set in the past
    if (!isEditing) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (parsedDue < yesterday) {
        setFormError('Due date for new interventions cannot be set in the past');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      studentRegistrationNumber: cleanReg,
      issue: issue.trim(),
      actionPlan: actionPlan.trim(),
      priority,
      assignedFaculty: assignedFaculty.trim(),
      dueDate: parsedDue.toISOString(),
      status,
      notes: notes.trim(),
      resolutionNotes: resolutionNotes.trim()
    };

    let result;
    if (isEditing) {
      result = await updateIntervention(initialData.id, payload);
    } else {
      result = await createIntervention(payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      if (onSaved) onSaved(result.data);
      onClose();
    } else {
      setFormError(result.error || 'Failed to save intervention');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card intervention-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__main">
            <div className="modal-avatar modal-avatar--teal">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="modal-name">
                {isEditing ? 'Update Faculty Intervention' : 'New Faculty Intervention Plan'}
              </h2>
              <p className="modal-email">
                {isEditing
                  ? `Editing Record ID: ${initialData.id}`
                  : 'Assign targeted remediation and track faculty accountability'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body intervention-form">
          {formError && (
            <div className="alert-box alert-box--warning">
              <AlertTriangle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Student Identifiers */}
          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label" htmlFor="studentRegNo">
                Student Reg. Number <span className="text-danger">*</span>
              </label>
              <input
                id="studentRegNo"
                type="text"
                className="filter-input font-mono"
                placeholder="e.g. 241FA04001"
                value={studentRegNo}
                onChange={(e) => setStudentRegNo(e.target.value.toUpperCase())}
                disabled={isEditing}
                required
              />
              <span className="form-hint">Must match 241FA[04|18|19]xxx</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentName">
                Student Name (Optional reference)
              </label>
              <input
                id="studentName"
                type="text"
                className="filter-input"
                placeholder="Auto-populated from directory"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={isEditing}
              />
            </div>
          </div>

          {/* Issue Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="issue">
              Observed Academic / Skills Concern <span className="text-danger">*</span>
            </label>
            <textarea
              id="issue"
              className="filter-input form-textarea"
              rows={2}
              placeholder="e.g., Attendance has fallen to 68% in core modules; active risk of exam debarment."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
            />
          </div>

          {/* Action Plan */}
          <div className="form-group">
            <label className="form-label" htmlFor="actionPlan">
              Action Plan & Remediation Roadmap <span className="text-danger">*</span>
            </label>
            <textarea
              id="actionPlan"
              className="filter-input form-textarea"
              rows={3}
              placeholder="e.g., Mandatory attendance contract, 10 hours of lab catch-up, and weekly progress check-in."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              required
            />
          </div>

          {/* Priority & Assigned Faculty & Status */}
          <div className="form-row form-row--3">
            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority Tier <span className="text-danger">*</span>
              </label>
              <select
                id="priority"
                className="filter-select form-select-full"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High (Immediate Action)</option>
                <option value="Medium">Medium (Advisory)</option>
                <option value="Low">Low (General Guidance)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Lifecycle Status <span className="text-danger">*</span>
              </label>
              <select
                id="status"
                className="filter-select form-select-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending (Not Started)</option>
                <option value="In Progress">In Progress (Active)</option>
                <option value="Completed">Completed (Resolved)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dueDate">
                Resolution Target Date <span className="text-danger">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                className="filter-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Assigned Faculty */}
          <div className="form-group">
            <label className="form-label" htmlFor="assignedFaculty">
              Assigned Faculty / Academic Mentor <span className="text-danger">*</span>
            </label>
            <input
              id="assignedFaculty"
              type="text"
              className="filter-input"
              placeholder="e.g. Dr. Ramesh Kumar (CSE) or Faculty Advisor"
              value={assignedFaculty}
              onChange={(e) => setAssignedFaculty(e.target.value)}
              required
            />
          </div>

          {/* Internal Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">
              Faculty / Advisor Ongoing Notes
            </label>
            <textarea
              id="notes"
              className="filter-input form-textarea"
              rows={2}
              placeholder="Internal tracking observations, meeting dates, or counseling logs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Resolution Notes (Shown in edit mode or when status is Completed) */}
          {(isEditing || status === 'Completed') && (
            <div className="form-group">
              <label className="form-label" htmlFor="resolutionNotes">
                Resolution Notes & Outcome
              </label>
              <textarea
                id="resolutionNotes"
                className="filter-input form-textarea"
                rows={2}
                placeholder="Document observed student improvement, backlogs cleared, or attendance verified..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="modal-footer" style={{ marginTop: '1rem', padding: '0.75rem 0 0 0' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity size={16} className="spin-icon" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> {isEditing ? 'Update Intervention' : 'Create Intervention'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterventionModal;
