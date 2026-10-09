// CampusIQ Faculty Intervention Tracking Service
// Implements full intervention lifecycle with dual persistence:
// MongoDB when connected, and clearly labeled in-memory fallback when offline.

import mongoose from 'mongoose';
import { Intervention } from '../models/Intervention.js';
import { getDbStatus } from '../config/db.js';
import { syntheticDataService } from './syntheticDataService.js';
import { logger } from '../utils/logger.js';

// Pre-seeded in-memory store for development/demo fallback
let inMemoryInterventions = [
  {
    _id: 'int-demo-001',
    id: 'int-demo-001',
    studentRegistrationNumber: '241FA04001',
    studentName: 'Deepika Deshmukh',
    studentBranch: 'Computer Science and Engineering',
    branchCode: '04',
    issue: 'Attendance (81%) in borderline advisory zone; assignment submission rate dipped to 63%.',
    actionPlan: 'Assign faculty mentor for bi-weekly check-ins and weekly assignment submission tracking.',
    priority: 'High',
    assignedFaculty: 'Dr. Ramesh Kumar',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In Progress',
    notes: 'Student agreed to attend Friday lab clinics.',
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'int-demo-002',
    id: 'int-demo-002',
    studentRegistrationNumber: '241FA04038',
    studentName: 'Rhea Nambiar',
    studentBranch: 'Computer Science and Engineering',
    branchCode: '04',
    issue: 'Data coverage is only 45% (<60% minimum threshold). Missing assignment, skills, and placement records.',
    actionPlan: 'Audit departmental gradebook and schedule assessment evaluation with lab in-charge.',
    priority: 'High',
    assignedFaculty: 'Prof. Ananya Iyer',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    notes: 'Coordinating with examination branch.',
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'int-demo-003',
    id: 'int-demo-003',
    studentRegistrationNumber: '241FA18005',
    studentName: 'Arjun Rao',
    studentBranch: 'Artificial Intelligence and Machine Learning',
    branchCode: '18',
    issue: 'Coding assessment score (48%) is below technical round cutoff.',
    actionPlan: 'Enroll student in 4-week competitive programming and DSA clinic.',
    priority: 'Medium',
    assignedFaculty: 'Dr. Priya Sharma',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue record for demonstration
    status: 'Pending',
    notes: 'Initial practice sets sent via email.',
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'int-demo-004',
    id: 'int-demo-004',
    studentRegistrationNumber: '241FA19008',
    studentName: 'Karan Mehta',
    studentBranch: 'Cybersecurity',
    branchCode: '19',
    issue: 'Mock interview evaluation reported communication hesitation and project defense gaps.',
    actionPlan: 'Two one-on-one mock interview sessions with alumni mentors.',
    priority: 'Medium',
    assignedFaculty: 'Prof. Vikram Joshi',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
    notes: 'Both mock rounds completed.',
    resolutionNotes: 'Demonstrated notable improvement in behavioral articulation and system design defense.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function isMongoActive() {
  const status = getDbStatus();
  return status.mode === 'mongodb' && mongoose.connection.readyState === 1;
}

/**
 * Helper to normalize intervention document (supporting both Phase 4 schema and legacy MongoDB records)
 */
export function normalizeIntervention(doc) {
  if (!doc) return null;
  const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const id = (raw._id || raw.id || '').toString();

  // Normalize registration number
  const studentRegistrationNumber = raw.studentRegistrationNumber || raw.studentRegNo || '';

  // Normalize student name
  const studentName = raw.studentName || 'Unknown Student';

  // Identity verification against authoritative student directory
  const dirStudent = studentRegistrationNumber
    ? syntheticDataService.getByIdOrRegistration(studentRegistrationNumber)
    : null;

  let hasIdentityConflict = false;
  let verifiedOwnerName = null;

  if (dirStudent) {
    verifiedOwnerName = dirStudent.name;
    const cleanDocName = (studentName || '').trim().toLowerCase();
    const cleanDirName = dirStudent.name.trim().toLowerCase();
    if (cleanDocName && cleanDocName !== 'unknown student' && cleanDocName !== cleanDirName) {
      hasIdentityConflict = true;
    }
  }

  // Normalize branch
  const studentBranch = raw.studentBranch || raw.branch || '';
  const branchCode =
    raw.branchCode ||
    (studentBranch.includes('04') || studentBranch === 'CSE'
      ? '04'
      : studentBranch.includes('18') || studentBranch === 'AIML'
      ? '18'
      : studentBranch.includes('19') || studentBranch === 'Cybersecurity'
      ? '19'
      : '');

  // Normalize faculty
  const assignedFaculty = raw.assignedFaculty || raw.assignedTo || 'Unassigned Faculty';

  // Normalize due date
  const dueDate = raw.dueDate || raw.targetDate || null;

  // Normalize issue / concern
  let issue = raw.issue || '';
  if (!issue) {
    if (raw.type && raw.notes) {
      issue = `${raw.type}: ${raw.notes}`;
    } else if (raw.notes) {
      issue = raw.notes;
    } else if (raw.type) {
      issue = raw.type;
    } else {
      issue = 'Academic or skills concern';
    }
  }

  // Normalize action plan / roadmap
  let actionPlan = raw.actionPlan || '';
  if (!actionPlan) {
    if (raw.followUpHistory && raw.followUpHistory.length > 0 && raw.followUpHistory[0].note) {
      actionPlan = raw.followUpHistory[0].note;
    } else if (raw.notes) {
      actionPlan = raw.notes;
    } else {
      actionPlan = 'Follow up with student and monitor progress';
    }
  }

  // Normalize priority to Title Case
  let priority = raw.priority || 'Medium';
  const pUpper = priority.toUpperCase();
  if (pUpper === 'CRITICAL' || pUpper === 'HIGH') {
    priority = 'High';
  } else if (pUpper === 'MEDIUM' || pUpper === 'MODERATE') {
    priority = 'Medium';
  } else if (pUpper === 'LOW') {
    priority = 'Low';
  } else {
    priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }

  // Normalize status to Title Case
  let status = raw.status || 'Pending';
  const sUpper = status.toUpperCase();
  if (sUpper === 'IN PROGRESS' || sUpper === 'IN_PROGRESS' || sUpper === 'ACTIVE') {
    status = 'In Progress';
  } else if (sUpper === 'COMPLETED' || sUpper === 'RESOLVED' || sUpper === 'DONE') {
    status = 'Completed';
  } else {
    status = 'Pending';
  }

  return {
    ...raw,
    _id: id,
    id,
    studentRegistrationNumber,
    studentRegNo: studentRegistrationNumber,
    studentName,
    studentBranch,
    branchCode,
    assignedFaculty,
    assignedTo: assignedFaculty,
    dueDate,
    targetDate: dueDate,
    issue,
    actionPlan,
    priority,
    status,
    notes: raw.notes || '',
    resolutionNotes: raw.resolutionNotes || '',
    hasIdentityConflict,
    verifiedOwnerName
  };
}

export const interventionService = {
  /**
   * Returns current persistence mode with honest labeling
   */
  getStorageMode: () => {
    const mongoActive = isMongoActive();
    return {
      mode: mongoActive ? 'mongodb' : 'synthetic_fallback',
      isPersistent: mongoActive,
      warning: mongoActive
        ? null
        : 'Interventions are stored in development in-memory fallback. Records will be lost if the backend server restarts.'
    };
  },

  /**
   * Validate and create a new faculty intervention
   */
  createIntervention: async (data) => {
    const {
      studentRegistrationNumber,
      issue,
      actionPlan,
      priority = 'Medium',
      assignedFaculty,
      dueDate,
      notes = ''
    } = data;

    // 1. Required field validation
    if (!studentRegistrationNumber || typeof studentRegistrationNumber !== 'string') {
      throw new Error('Student registration number is required');
    }
    const cleanRegNo = studentRegistrationNumber.trim().toUpperCase();

    if (!cleanRegNo.match(/^241FA(04|18|19)\d{3}$/)) {
      throw new Error(`Invalid registration number format '${cleanRegNo}'. Expected format 241FA[04|18|19]xxx.`);
    }

    if (!issue || typeof issue !== 'string' || issue.trim().length < 5) {
      throw new Error('Issue description is required and must be at least 5 characters');
    }

    if (!actionPlan || typeof actionPlan !== 'string' || actionPlan.trim().length < 5) {
      throw new Error('Action plan is required and must be at least 5 characters');
    }

    if (!['High', 'Medium', 'Low'].includes(priority)) {
      throw new Error('Priority must be one of: High, Medium, Low');
    }

    if (!assignedFaculty || typeof assignedFaculty !== 'string' || assignedFaculty.trim().length === 0) {
      throw new Error('Assigned faculty or mentor name is required');
    }

    // 2. Due Date validation
    if (!dueDate) {
      throw new Error('Due date is required');
    }
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      throw new Error('Due date must be a valid date');
    }

    // Enforce future or current date on CREATION (allowing up to 12 hour clock drift)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (parsedDueDate < twelveHoursAgo) {
      throw new Error('Due date cannot be set in the past for new interventions');
    }

    // 3. Verify student exists in student repository
    const student = syntheticDataService.getByIdOrRegistration(cleanRegNo);
    if (!student) {
      throw new Error(`Student with registration number '${cleanRegNo}' was not found in the student directory`);
    }

    const payload = {
      studentRegistrationNumber: cleanRegNo,
      studentName: student.name,
      studentBranch: student.branch || (student.branchCode === '04' ? 'Computer Science and Engineering' : student.branchCode === '18' ? 'Artificial Intelligence and Machine Learning' : 'Cybersecurity'),
      branchCode: student.branchCode,
      issue: issue.trim(),
      actionPlan: actionPlan.trim(),
      priority,
      assignedFaculty: assignedFaculty.trim(),
      dueDate: parsedDueDate,
      status: 'Pending',
      notes: notes ? notes.trim() : '',
      resolutionNotes: ''
    };

    if (isMongoActive()) {
      const doc = new Intervention(payload);
      const saved = await doc.save();
      return {
        ...saved.toObject(),
        id: saved._id.toString(),
        storageMode: 'mongodb'
      };
    } else {
      const newId = `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const inMemDoc = {
        _id: newId,
        id: newId,
        ...payload,
        dueDate: parsedDueDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storageMode: 'synthetic_fallback'
      };
      inMemoryInterventions.unshift(inMemDoc);
      return inMemDoc;
    }
  },

  /**
   * Retrieve filtered interventions with metadata
   */
  getInterventions: async (filters = {}) => {
    const { status, priority, branch, student, search, page = 1, limit = 50 } = filters;
    const storageMeta = interventionService.getStorageMode();

    if (isMongoActive()) {
      const query = {};
      if (status) {
        query.status = new RegExp(`^${status}$`, 'i');
      }
      if (priority) {
        if (priority.toLowerCase() === 'high') {
          query.priority = { $in: ['High', 'HIGH', 'CRITICAL', 'critical'] };
        } else {
          query.priority = new RegExp(`^${priority}$`, 'i');
        }
      }
      if (branch) {
        query.$or = [
          { branchCode: branch },
          { studentBranch: new RegExp(branch, 'i') },
          { branch: new RegExp(branch, 'i') }
        ];
      }
      if (student && student !== 'undefined' && student.trim() !== '') {
        const sQuery = student.trim();
        const dirStudent = syntheticDataService.getByIdOrRegistration(sQuery);

        if (dirStudent) {
          // Querying for a verified student:
          // Match the verified student's registration number, but exclude known identity conflicts
          const escapedDirName = dirStudent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { studentRegistrationNumber: new RegExp(`^${dirStudent.registrationNumber}$`, 'i') },
              { studentRegNo: new RegExp(`^${dirStudent.registrationNumber}$`, 'i') }
            ]
          });
          query.$and.push({
            $or: [
              { studentName: new RegExp(`^${escapedDirName}$`, 'i') },
              { studentName: { $exists: false } },
              { studentName: null },
              { studentName: '' },
              { studentName: 'Unknown Student' }
            ]
          });
        } else {
          // Querying by name or unverified identifier
          query.$or = [
            { studentName: new RegExp(sQuery, 'i') }
          ];
        }
      }
      if (search) {
        const q = search.trim();
        query.$or = [
          { studentRegistrationNumber: new RegExp(q, 'i') },
          { studentRegNo: new RegExp(q, 'i') },
          { studentName: new RegExp(q, 'i') },
          { issue: new RegExp(q, 'i') },
          { notes: new RegExp(q, 'i') },
          { actionPlan: new RegExp(q, 'i') },
          { assignedFaculty: new RegExp(q, 'i') },
          { assignedTo: new RegExp(q, 'i') }
        ];
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const total = await Intervention.countDocuments(query);
      const docs = await Intervention.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      let normalized = docs.map((d) => normalizeIntervention(d));

      // Post-normalization check when querying specifically for a student:
      if (student && student !== 'undefined' && student.trim() !== '') {
        const dirStudent = syntheticDataService.getByIdOrRegistration(student.trim());
        if (dirStudent) {
          // Verified student: exclude any records with known identity conflicts
          normalized = normalized.filter((i) => !i.hasIdentityConflict);
        } else {
          // Unverified student: hide interventions whose ownership cannot be verified
          normalized = normalized.filter((i) => !i.hasIdentityConflict);
        }
      }

      return {
        interventions: normalized,
        total: normalized.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        storage: storageMeta
      };
    } else {
      let result = inMemoryInterventions.map((d) => normalizeIntervention(d));

      if (status) {
        result = result.filter((i) => i.status.toLowerCase() === status.toLowerCase());
      }
      if (priority) {
        result = result.filter((i) => i.priority.toLowerCase() === priority.toLowerCase());
      }
      if (branch) {
        const b = branch.toLowerCase();
        result = result.filter(
          (i) => i.branchCode === branch || (i.studentBranch && i.studentBranch.toLowerCase().includes(b))
        );
      }
      if (student && student !== 'undefined' && student.trim() !== '') {
        const s = student.toLowerCase().trim();
        const dirStudent = syntheticDataService.getByIdOrRegistration(student.trim());

        if (dirStudent) {
          const dReg = dirStudent.registrationNumber.toUpperCase();
          const dName = dirStudent.name.toLowerCase().trim();
          result = result.filter((i) => {
            const iReg = (i.studentRegistrationNumber || i.studentRegNo || '').toUpperCase();
            if (iReg !== dReg) return false;
            if (i.hasIdentityConflict) return false;
            const iName = (i.studentName || '').toLowerCase().trim();
            return !iName || iName === 'unknown student' || iName === dName;
          });
        } else {
          result = result.filter((i) => {
            const iName = (i.studentName || '').toLowerCase().trim();
            if (!iName.includes(s)) return false;
            if (i.hasIdentityConflict) return false;
            return true;
          });
        }
      }
      if (search) {
        const q = search.toLowerCase().trim();
        result = result.filter(
          (i) =>
            (i.studentRegistrationNumber && i.studentRegistrationNumber.toLowerCase().includes(q)) ||
            (i.studentRegNo && i.studentRegNo.toLowerCase().includes(q)) ||
            (i.studentName && i.studentName.toLowerCase().includes(q)) ||
            (i.issue && i.issue.toLowerCase().includes(q)) ||
            (i.actionPlan && i.actionPlan.toLowerCase().includes(q)) ||
            (i.assignedFaculty && i.assignedFaculty.toLowerCase().includes(q))
        );
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const total = result.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = result.slice(startIndex, startIndex + limitNum);

      return {
        interventions: paginated,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        storage: storageMeta
      };
    }
  },

  /**
   * Find single intervention by ID
   */
  getById: async (id) => {
    if (!id) return null;

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await Intervention.findById(id).lean();
      return doc ? normalizeIntervention(doc) : null;
    } else {
      const item = inMemoryInterventions.find((i) => i.id === id || i._id === id);
      return item ? normalizeIntervention(item) : null;
    }
  },

  /**
   * Update intervention fields (status, actionPlan, resolutionNotes, etc.)
   */
  updateIntervention: async (id, updates = {}) => {
    if (!id) throw new Error('Intervention ID is required');

    // Validation for update fields
    if (updates.status && !['Pending', 'In Progress', 'Completed'].includes(updates.status)) {
      throw new Error("Invalid status. Must be one of: 'Pending', 'In Progress', 'Completed'");
    }
    if (updates.priority && !['High', 'Medium', 'Low'].includes(updates.priority)) {
      throw new Error("Invalid priority. Must be one of: 'High', 'Medium', 'Low'");
    }
    if (updates.dueDate) {
      const parsed = new Date(updates.dueDate);
      if (isNaN(parsed.getTime())) {
        throw new Error('Due date must be a valid date');
      }
      // Note: Past due dates ARE allowed on updates so existing overdue records can be edited/completed!
    }

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Intervention with ID '${id}' not found`);
      }
      const updated = await Intervention.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw new Error(`Intervention with ID '${id}' not found`);
      }
      return normalizeIntervention(updated);
    } else {
      const index = inMemoryInterventions.findIndex((i) => i.id === id || i._id === id);
      if (index === -1) {
        throw new Error(`Intervention with ID '${id}' not found`);
      }

      const existing = inMemoryInterventions[index];
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      inMemoryInterventions[index] = updated;
      return normalizeIntervention(updated);
    }
  },

  /**
   * Delete an intervention
   */
  deleteIntervention: async (id) => {
    if (!id) throw new Error('Intervention ID is required');

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const res = await Intervention.findByIdAndDelete(id);
      return Boolean(res);
    } else {
      const index = inMemoryInterventions.findIndex((i) => i.id === id || i._id === id);
      if (index === -1) return false;
      inMemoryInterventions.splice(index, 1);
      return true;
    }
  },

  /**
   * Calculate high-level statistics for faculty dashboards
   */
  getStats: async () => {
    const now = new Date();
    const storageMeta = interventionService.getStorageMode();

    if (isMongoActive()) {
      const total = await Intervention.countDocuments();
      const pending = await Intervention.countDocuments({ status: { $in: ['Pending', 'pending'] } });
      const inProgress = await Intervention.countDocuments({ status: { $in: ['In Progress', 'in progress', 'ACTIVE', 'Active'] } });
      const completed = await Intervention.countDocuments({ status: { $in: ['Completed', 'completed', 'RESOLVED', 'Resolved'] } });
      const highPriority = await Intervention.countDocuments({
        priority: { $in: ['High', 'HIGH', 'CRITICAL', 'critical'] },
        status: { $nin: ['Completed', 'completed', 'RESOLVED', 'Resolved'] }
      });
      const overdue = await Intervention.countDocuments({
        status: { $nin: ['Completed', 'completed', 'RESOLVED', 'Resolved'] },
        $or: [
          { dueDate: { $lt: now } },
          { targetDate: { $lt: now.toISOString().split('T')[0] } }
        ]
      });

      return {
        total,
        pending,
        inProgress,
        completed,
        highPriority,
        overdueCount: overdue,
        storage: storageMeta
      };
    } else {
      const total = inMemoryInterventions.length;
      const pending = inMemoryInterventions.filter((i) => i.status === 'Pending').length;
      const inProgress = inMemoryInterventions.filter((i) => i.status === 'In Progress').length;
      const completed = inMemoryInterventions.filter((i) => i.status === 'Completed').length;
      const highPriority = inMemoryInterventions.filter((i) => i.priority === 'High' && i.status !== 'Completed').length;
      const overdue = inMemoryInterventions.filter(
        (i) => i.status !== 'Completed' && new Date(i.dueDate) < now
      ).length;

      return {
        total,
        pending,
        inProgress,
        completed,
        highPriority,
        overdueCount: overdue,
        storage: storageMeta
      };
    }
  },

  /**
   * Helper for testing: reset in-memory records
   */
  _resetInMemoryStore: () => {
    inMemoryInterventions = [];
  }
};

export default interventionService;
