// Synthetic Data Service for CampusIQ
// Generates realistic multi-dimensional student records with 7-factor analytics,
// explainable risk assessments, and placement readiness classifications.

import {
  calculateStudentSuccessScore,
  classifyAcademicRisk,
  classifyPlacementReadiness
} from './analyticsEngine.js';

const BRANCHES = [
  { name: 'Computer Science and Engineering', code: '04', slug: 'CSE' },
  { name: 'Artificial Intelligence and Machine Learning', code: '18', slug: 'AIML' },
  { name: 'Cybersecurity', code: '19', slug: 'Cybersecurity' }
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Akash', 'Ananya', 'Arjun', 'Bhavya', 'Chetan', 'Deepika',
  'Dev', 'Divya', 'Gaurav', 'Harini', 'Ishaan', 'Janani', 'Kavya', 'Karan',
  'Meera', 'Manoj', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Rhea', 'Rahul',
  'Rohan', 'Sneha', 'Siddharth', 'Tanvi', 'Varun', 'Vandana', 'Yash', 'Zoya'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Gupta',
  'Kumar', 'Singh', 'Chowdhury', 'Deshmukh', 'Joshi', 'Mehta', 'Nambiar', 'Bhat'
];

const MENTOR_FEEDBACK_TEMPLATES = {
  high: [
    'Exemplary student with strong analytical skills and consistent project contributions.',
    'Proactive in departmental hackathons, highly recommended for tier-1 campus drives.',
    'Demonstrates leadership in technical workshops; consistent peer mentor.'
  ],
  medium: [
    'Solid grasp of core fundamentals, but needs more focus on competitive coding.',
    'Consistent lecture attendance; advised to practice quantitative aptitude tests.',
    'Capable student; advised to clear backlogs early and participate in group discussions.'
  ],
  low: [
    'Requires immediate counseling regarding irregular attendance and backlogs.',
    'Struggling with coding assessments; remedial sessions arranged with teaching assistants.',
    'Critical intervention needed: attendance debarment warning issued.'
  ]
};

/**
 * Generates rich synthetic student records with full multi-dimensional profiles
 * @param {number} totalRecords - Minimum total records (default: 120, 40 per branch)
 */
export function generateSyntheticDataset(totalRecords = 120) {
  const records = [];
  const perBranch = Math.max(40, Math.ceil(totalRecords / BRANCHES.length));

  BRANCHES.forEach((branch) => {
    for (let i = 1; i <= perBranch; i++) {
      const serial = String(i).padStart(3, '0');
      const registrationNumber = `241FA${branch.code}${serial}`;

      const firstName = FIRST_NAMES[(i * 3 + parseInt(branch.code, 10)) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i * 7 + parseInt(branch.code, 10)) % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;

      // Deterministic variations across cohorts
      const seed = (i * 17 + parseInt(branch.code, 10) * 31) % 100;
      const semester = ((i + 1) % 8) + 1;

      // 1. Academic Performance
      const rawCgpa = Number((5.2 + (seed / 100) * 4.6).toFixed(2)); // Range: 5.2 - 9.8
      const arrears = seed < 12 ? 2 : seed < 28 ? 1 : 0; // Realistic backlog distribution
      const semesterGpa = [
        Math.max(5.0, Number((rawCgpa - 0.2 + (seed % 5) * 0.1).toFixed(2))),
        Math.max(5.0, Number((rawCgpa + (seed % 3) * 0.1).toFixed(2)))
      ];

      // 2. Attendance (calibrated distribution: ~22.5% below 75% threshold, ~21.7% borderline 75-81.9%, ~55.8% strong >=82%)
      let attendanceRate;
      if (seed < 23) {
        attendanceRate = Number((63 + (seed % 12)).toFixed(1)); // 63% - 74.9% (below mandatory threshold)
      } else if (seed < 45) {
        attendanceRate = Number((75 + (seed % 7)).toFixed(1));  // 75% - 81.9% (borderline advisory band)
      } else {
        attendanceRate = Number((82 + (seed % 17)).toFixed(1)); // 82% - 98.9% (strong attendance)
      }

      // 3. LMS & Assignment Completion
      const assignmentCompletionRate = Number((60 + ((seed * 3) % 40)).toFixed(1));

      // 4. Engagement Score
      const engagementScore = Number((55 + ((seed * 5) % 45)).toFixed(1));

      // 5. Skills
      const technicalSkillsScore = Number((50 + ((seed * 7) % 50)).toFixed(1));
      const professionalSkillsScore = Number((55 + ((seed * 4) % 45)).toFixed(1));

      // 6. Placement Training & Assessments
      const codingScore = Number((42 + ((seed * 9) % 58)).toFixed(1));
      const aptitudeScore = Number((48 + ((seed * 6) % 52)).toFixed(1));
      const mockInterviewScore = Number((50 + ((seed * 8) % 50)).toFixed(1));
      const placementTrainingScore = Number(
        ((codingScore + aptitudeScore + mockInterviewScore) / 3).toFixed(1)
      );

      // 7. Mentor Feedback
      const mentorFeedbackScore = Number((50 + ((seed * 2) % 50)).toFixed(1));
      const feedbackTier = mentorFeedbackScore >= 80 ? 'high' : mentorFeedbackScore >= 65 ? 'medium' : 'low';
      const feedbackList = MENTOR_FEEDBACK_TEMPLATES[feedbackTier];
      const mentorNotes = feedbackList[(i + parseInt(branch.code, 10)) % feedbackList.length];

      // Build base raw student object
      let student = {
        id: `stu-${branch.code}-${serial}`,
        registrationNumber,
        name: fullName,
        email: `${registrationNumber.toLowerCase()}@campusiq.edu.local`,
        branch: branch.name,
        branchCode: branch.code,
        branchSlug: branch.slug,
        semester,
        cgpa: rawCgpa,
        gpa: rawCgpa, // Phase 1 compatibility
        semesterGpa,
        arrears,
        attendanceRate,
        assignmentCompletionRate,
        lmsScore: assignmentCompletionRate,
        engagementScore,
        technicalSkillsScore,
        professionalSkillsScore,
        codingScore,
        aptitudeScore,
        mockInterviewScore,
        placementTrainingScore,
        mentorFeedbackScore,
        mentorNotes,
        mentorAssigned: true,
        lastUpdated: new Date().toISOString()
      };

      // Deliberately introduce controlled missing-data edge cases to demonstrate coverage behavior:
      // Case A: Missing Mentor feedback only (coverage ~95%, valid normalized calculation)
      if (i === 15) {
        student.mentorFeedbackScore = null;
        student.mentorNotes = null;
        student.mentorAssigned = false;
      }
      // Case B: Missing Placement assessments (coverage 85%, valid normalized calculation)
      if (i === 25) {
        student.codingScore = null;
        student.aptitudeScore = null;
        student.mockInterviewScore = null;
        student.placementTrainingScore = null;
      }
      // Case C: Severe missing data (coverage < 60%, triggers INSUFFICIENT_DATA status)
      // Only in CSE student #38 to provide a realistic edge case
      if (branch.code === '04' && i === 38) {
        student.assignmentCompletionRate = null;
        student.lmsScore = null;
        student.engagementScore = null;
        student.technicalSkillsScore = null;
        student.professionalSkillsScore = null;
        student.codingScore = null;
        student.aptitudeScore = null;
        student.mockInterviewScore = null;
        student.placementTrainingScore = null;
        student.mentorFeedbackScore = null;
      }

      // Compute analytics using the scoring engine
      const successAnalytics = calculateStudentSuccessScore(student);
      const academicRisk = classifyAcademicRisk(student);
      const placementReadiness = classifyPlacementReadiness(student);

      // Attach analytics to student record
      student.analytics = successAnalytics;
      student.academicRisk = academicRisk;
      student.placementReadiness = placementReadiness;

      // Phase 1 compatibility fields
      student.riskLevel = academicRisk.level;
      student.riskScore = academicRisk.riskScore;

      records.push(student);
    }
  });

  return records;
}

// In-memory student dataset (initialized with 120 records: 40 CSE, 40 AIML, 40 Cyber)
let inMemoryStudents = generateSyntheticDataset(120);

export const syntheticDataService = {
  /**
   * Return all in-memory synthetic students with optional filtering.
   * Returns array directly for full backwards compatibility.
   */
  getAllStudents: (filters = {}) => {
    let result = [...inMemoryStudents];

    // Branch filter
    if (filters.branch) {
      result = result.filter(
        (s) => s.branchCode === filters.branch || s.branchSlug.toLowerCase() === filters.branch.toLowerCase()
      );
    }

    // Risk level filter (High, Medium, Low)
    if (filters.riskLevel) {
      result = result.filter(
        (s) => s.academicRisk?.level.toLowerCase() === filters.riskLevel.toLowerCase()
      );
    }

    // Placement status filter ('Job Ready', 'Needs Upskilling', 'High Priority Intervention')
    if (filters.placementStatus) {
      result = result.filter(
        (s) => s.placementReadiness?.status.toLowerCase() === filters.placementStatus.toLowerCase()
      );
    }

    // Search term (registration number or name)
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) => s.registrationNumber.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    // Min / Max success score filter
    if (filters.minScore !== undefined && filters.minScore !== '') {
      const min = Number(filters.minScore);
      result = result.filter((s) => s.analytics?.successScore !== null && s.analytics?.successScore >= min);
    }
    if (filters.maxScore !== undefined && filters.maxScore !== '') {
      const max = Number(filters.maxScore);
      result = result.filter((s) => s.analytics?.successScore !== null && s.analytics?.successScore <= max);
    }

    return result;
  },

  /**
   * Return paginated student records with metadata
   */
  getPaginatedStudents: (filters = {}) => {
    const list = syntheticDataService.getAllStudents(filters);
    const page = Math.max(1, parseInt(filters.page || 1, 10));
    const limit = Math.max(1, parseInt(filters.limit || 50, 10));
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  /**
   * Return array of all student records without pagination wrapper (backward compatibility)
   */
  getAllRawStudents: () => inMemoryStudents,

  /**
   * Find student by registration number or id
   */
  getByRegistrationNumber: (regNo) => {
    if (!regNo) return null;
    return inMemoryStudents.find(
      (s) => s.registrationNumber.toUpperCase() === regNo.toUpperCase()
    ) || null;
  },

  /**
   * Find student by ID or registration number
   */
  getByIdOrRegistration: (idOrRegNo) => {
    if (!idOrRegNo) return null;
    const query = idOrRegNo.toUpperCase();
    return inMemoryStudents.find(
      (s) => s.id.toUpperCase() === query || s.registrationNumber.toUpperCase() === query
    ) || null;
  },

  /**
   * Filter students by branch code
   */
  getByBranchCode: (branchCode) => {
    return inMemoryStudents.filter((s) => s.branchCode === branchCode);
  },

  /**
   * Get comprehensive analytics summary across the cohort
   */
  getAnalyticsSummary: () => {
    const total = inMemoryStudents.length;

    // Filter students with calculated score
    const scoredStudents = inMemoryStudents.filter((s) => s.analytics?.successScore !== null);
    const avgSuccessScore = scoredStudents.length > 0
      ? Number((scoredStudents.reduce((acc, s) => acc + s.analytics.successScore, 0) / scoredStudents.length).toFixed(1))
      : 0;

    const avgCgpa = Number(
      (inMemoryStudents.reduce((acc, s) => acc + (s.cgpa || 0), 0) / total).toFixed(2)
    );
    const avgAttendance = Number(
      (inMemoryStudents.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / total).toFixed(1)
    );
    const avgDataCoverage = Number(
      (inMemoryStudents.reduce((acc, s) => acc + (s.analytics?.dataCoverage || 100), 0) / total).toFixed(1)
    );

    // Academic risk breakdown
    const highRisk = inMemoryStudents.filter((s) => s.academicRisk?.level === 'High').length;
    const mediumRisk = inMemoryStudents.filter((s) => s.academicRisk?.level === 'Medium').length;
    const lowRisk = inMemoryStudents.filter((s) => s.academicRisk?.level === 'Low').length;

    // Placement readiness breakdown
    const jobReady = inMemoryStudents.filter((s) => s.placementReadiness?.status === 'Job Ready').length;
    const needsUpskilling = inMemoryStudents.filter((s) => s.placementReadiness?.status === 'Needs Upskilling').length;
    const highPriorityPlacement = inMemoryStudents.filter((s) => s.placementReadiness?.status === 'High Priority Intervention').length;

    // Coverage & eligibility statistics
    const fullyScoredCount = scoredStudents.length;
    const insufficientDataCount = total - fullyScoredCount;

    return {
      totalStudents: total,
      scoredStudents: fullyScoredCount,
      insufficientDataStudents: insufficientDataCount,
      averageSuccessScore: avgSuccessScore,
      averageCgpa: avgCgpa,
      averageAttendance: avgAttendance,
      averageDataCoverage: avgDataCoverage,
      riskDistribution: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      placementDistribution: {
        jobReady,
        needsUpskilling,
        highPriorityIntervention: highPriorityPlacement
      },
      branches: BRANCHES.map((b) => {
        const branchStudents = inMemoryStudents.filter((s) => s.branchCode === b.code);
        const branchScored = branchStudents.filter((s) => s.analytics?.successScore !== null);
        const branchAvgScore = branchScored.length > 0
          ? Number((branchScored.reduce((acc, s) => acc + s.analytics.successScore, 0) / branchScored.length).toFixed(1))
          : 0;

        return {
          code: b.code,
          name: b.name,
          slug: b.slug,
          count: branchStudents.length,
          avgScore: branchAvgScore,
          highRiskCount: branchStudents.filter((s) => s.academicRisk?.level === 'High').length,
          jobReadyCount: branchStudents.filter((s) => s.placementReadiness?.status === 'Job Ready').length
        };
      })
    };
  },

  /**
   * Refresh in-memory dataset with custom record count
   */
  refreshDataset: (count = 120) => {
    inMemoryStudents = generateSyntheticDataset(count);
    return inMemoryStudents;
  },

  getBranches: () => BRANCHES
};
