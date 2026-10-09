// CampusIQ Student Success & Analytics Engine
// Implements transparent 7-factor scoring, missing-data normalization,
// 60% coverage enforcement, and explainable risk/placement classifications.

export const SCORE_WEIGHTS = {
  academic: 0.30,      // Academic performance: 30%
  attendance: 0.15,    // Attendance: 15%
  lms: 0.10,           // LMS and assignments: 10%
  engagement: 0.10,    // Engagement: 10%
  placement: 0.15,     // Placement readiness: 15%
  skills: 0.15,        // Technical and professional skills: 15%
  mentor: 0.05         // Mentor feedback: 5%
};

export const MIN_DATA_COVERAGE_THRESHOLD = 0.60; // 60% minimum coverage required

/**
 * Validates that scoring weights strictly sum to 1.0 (100%)
 */
export function validateWeights() {
  const sum = Object.values(SCORE_WEIGHTS).reduce((acc, weight) => acc + weight, 0);
  const isValid = Math.abs(sum - 1.0) < 0.0001;
  return {
    isValid,
    totalWeight: Number(sum.toFixed(4)),
    weights: { ...SCORE_WEIGHTS }
  };
}

/**
 * Normalizes dimension values to a 0-100 scale.
 * Returns null if the dimension is missing/unrecorded.
 */
export function extractDimensionScores(student = {}) {
  // 1. Academic Performance (0-100): CGPA on 10.0 scale, minus arrears penalty (10 pts per backlog)
  let academicScore = null;
  if (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa)) {
    const rawAcademic = (student.cgpa / 10.0) * 100;
    const hasKnownArrears = student.arrears !== null && student.arrears !== undefined && !isNaN(student.arrears);
    const arrearsPenalty = hasKnownArrears ? Number(student.arrears) * 10 : 0;
    academicScore = Math.max(0, Math.min(100, Math.round(rawAcademic - arrearsPenalty)));
  }

  // 2. Attendance (0-100)
  let attendanceScore = null;
  if (student.attendanceRate !== null && student.attendanceRate !== undefined && !isNaN(student.attendanceRate)) {
    attendanceScore = Math.max(0, Math.min(100, Math.round(student.attendanceRate)));
  }

  // 3. LMS & Assignments (0-100)
  let lmsScore = null;
  const lmsVal = student.assignmentCompletionRate ?? student.lmsScore;
  if (lmsVal !== null && lmsVal !== undefined && !isNaN(lmsVal)) {
    lmsScore = Math.max(0, Math.min(100, Math.round(lmsVal)));
  }

  // 4. Engagement (0-100)
  let engagementScore = null;
  if (student.engagementScore !== null && student.engagementScore !== undefined && !isNaN(student.engagementScore)) {
    engagementScore = Math.max(0, Math.min(100, Math.round(student.engagementScore)));
  }

  // 5. Placement Readiness (0-100): Composite of coding, aptitude, mock interview, or direct score
  let placementScore = null;
  const placementComponents = [
    student.codingScore,
    student.aptitudeScore,
    student.mockInterviewScore,
    student.placementTrainingScore
  ].filter((v) => v !== null && v !== undefined && !isNaN(v));

  if (placementComponents.length > 0) {
    const sum = placementComponents.reduce((acc, v) => acc + v, 0);
    placementScore = Math.max(0, Math.min(100, Math.round(sum / placementComponents.length)));
  } else if (student.placementScore !== null && student.placementScore !== undefined && !isNaN(student.placementScore)) {
    placementScore = Math.max(0, Math.min(100, Math.round(student.placementScore)));
  }

  // 6. Technical and Professional Skills (0-100)
  let skillsScore = null;
  const skillComponents = [
    student.technicalSkillsScore,
    student.professionalSkillsScore
  ].filter((v) => v !== null && v !== undefined && !isNaN(v));

  if (skillComponents.length > 0) {
    const sum = skillComponents.reduce((acc, v) => acc + v, 0);
    skillsScore = Math.max(0, Math.min(100, Math.round(sum / skillComponents.length)));
  } else if (student.skillsScore !== null && student.skillsScore !== undefined && !isNaN(student.skillsScore)) {
    skillsScore = Math.max(0, Math.min(100, Math.round(student.skillsScore)));
  }

  // 7. Mentor Feedback (0-100)
  let mentorScore = null;
  if (student.mentorFeedbackScore !== null && student.mentorFeedbackScore !== undefined && !isNaN(student.mentorFeedbackScore)) {
    mentorScore = Math.max(0, Math.min(100, Math.round(student.mentorFeedbackScore)));
  }

  return {
    academic: academicScore,
    attendance: attendanceScore,
    lms: lmsScore,
    engagement: engagementScore,
    placement: placementScore,
    skills: skillsScore,
    mentor: mentorScore
  };
}

/**
 * Calculates data coverage based on available dimensions and their baseline weights
 */
export function calculateDataCoverage(dimensionScores) {
  let availableWeight = 0;
  const missingDimensions = [];
  const availableDimensions = [];

  for (const [dimension, weight] of Object.entries(SCORE_WEIGHTS)) {
    if (dimensionScores[dimension] !== null && dimensionScores[dimension] !== undefined) {
      availableWeight += weight;
      availableDimensions.push(dimension);
    } else {
      missingDimensions.push(dimension);
    }
  }

  const coverageRatio = Number(availableWeight.toFixed(4));
  const coveragePercentage = Number((coverageRatio * 100).toFixed(1));

  return {
    coverageRatio,
    coveragePercentage,
    availableWeight: Number(availableWeight.toFixed(4)),
    isSufficient: coverageRatio >= MIN_DATA_COVERAGE_THRESHOLD,
    availableDimensions,
    missingDimensions
  };
}

/**
 * Calculates the transparent Student Success Score out of 100.
 * Normalizes against valid available weights when data is missing.
 * Requires at least 60% data coverage.
 */
export function calculateStudentSuccessScore(student = {}) {
  const dimensionScores = extractDimensionScores(student);
  const coverage = calculateDataCoverage(dimensionScores);

  // If data coverage is below 60%, score is null and status is INSUFFICIENT_DATA
  if (!coverage.isSufficient) {
    return {
      successScore: null,
      isEligibleForScoring: false,
      status: 'INSUFFICIENT_DATA',
      dataCoverage: coverage.coveragePercentage,
      availableWeight: coverage.availableWeight,
      missingDimensions: coverage.missingDimensions,
      availableDimensions: coverage.availableDimensions,
      dimensionScores,
      reason: `Data coverage (${coverage.coveragePercentage}%) is below the minimum required ${MIN_DATA_COVERAGE_THRESHOLD * 100}% threshold.`
    };
  }

  // Calculate raw weighted sum and normalized breakdown
  let rawWeightedSum = 0;
  const breakdown = {};

  for (const [dimension, weight] of Object.entries(SCORE_WEIGHTS)) {
    const rawVal = dimensionScores[dimension];
    if (rawVal !== null && rawVal !== undefined) {
      // Effective normalized weight for this available dimension
      const effectiveWeight = Number((weight / coverage.availableWeight).toFixed(4));
      const contribution = Number((rawVal * effectiveWeight).toFixed(2));
      rawWeightedSum += contribution;

      breakdown[dimension] = {
        score: rawVal,
        baseWeight: weight,
        effectiveWeight,
        contribution
      };
    } else {
      breakdown[dimension] = {
        score: null,
        baseWeight: weight,
        effectiveWeight: 0,
        contribution: 0,
        missing: true
      };
    }
  }

  const finalScore = Number(Math.max(0, Math.min(100, rawWeightedSum)).toFixed(1));

  return {
    successScore: finalScore,
    isEligibleForScoring: true,
    status: 'CALCULATED',
    dataCoverage: coverage.coveragePercentage,
    availableWeight: coverage.availableWeight,
    isNormalized: coverage.availableWeight < 1.0,
    breakdown,
    dimensionScores,
    missingDimensions: coverage.missingDimensions
  };
}

/**
 * Explainable Academic Risk Classification
 */
export function classifyAcademicRisk(student = {}) {
  const reasons = [];
  const cgpa = student.cgpa;
  const attendance = student.attendanceRate;
  const hasKnownArrears = student.arrears !== null && student.arrears !== undefined && !isNaN(student.arrears);
  const arrears = hasKnownArrears ? Number(student.arrears) : null;
  const lms = student.assignmentCompletionRate ?? student.lmsScore;

  let riskPoints = 0;

  // Attendance risk analysis (mandatory 75% college regulation)
  if (attendance !== null && attendance !== undefined) {
    if (attendance < 75) {
      riskPoints += 45;
      reasons.push(`Attendance (${attendance}%) is below the mandatory 75% threshold, risking exam debarment.`);
    } else if (attendance < 82) {
      riskPoints += 20;
      reasons.push(`Attendance (${attendance}%) is in the borderline advisory zone (75% - 82%).`);
    }
  }

  // CGPA risk analysis
  if (cgpa !== null && cgpa !== undefined) {
    if (cgpa < 6.0) {
      riskPoints += 40;
      reasons.push(`Cumulative GPA (${cgpa.toFixed(2)}/10.0) is critically low (< 6.0).`);
    } else if (cgpa < 7.2) {
      riskPoints += 15;
      reasons.push(`Cumulative GPA (${cgpa.toFixed(2)}/10.0) is in the marginal academic performance band.`);
    }
  }

  // Arrears / Backlogs risk analysis (only applied when arrears data is known)
  if (hasKnownArrears) {
    if (arrears >= 2) {
      riskPoints += 40;
      reasons.push(`Active backlogs: ${arrears} subjects pending clearance.`);
    } else if (arrears === 1) {
      riskPoints += 20;
      reasons.push(`1 active arrears subject pending clearance.`);
    }
  }

  // LMS / Assignment risk analysis
  if (lms !== null && lms !== undefined && lms < 65) {
    riskPoints += 15;
    reasons.push(`Assignment submission rate (${lms}%) indicates low weekly engagement.`);
  }

  let level = 'Low';
  if (riskPoints >= 45 || (hasKnownArrears && arrears >= 2) || (attendance !== null && attendance < 75)) {
    level = 'High';
  } else if (riskPoints >= 20 || (hasKnownArrears && arrears === 1)) {
    level = 'Medium';
  }

  if (reasons.length === 0) {
    const arrearsText = hasKnownArrears ? `${arrears} arrears` : 'arrears unrecorded';
    reasons.push(
      `Strong academic standing (CGPA: ${cgpa !== null && cgpa !== undefined ? cgpa.toFixed(2) : 'N/A'}, Attendance: ${attendance !== null && attendance !== undefined ? attendance + '%' : 'N/A'}, ${arrearsText}).`
    );
  }

  return {
    level,
    riskScore: Math.min(100, riskPoints),
    reasons,
    primaryReason: reasons[0]
  };
}

/**
 * Explainable Placement Readiness Classification
 */
export function classifyPlacementReadiness(student = {}) {
  const reasons = [];
  const hasKnownArrears = student.arrears !== null && student.arrears !== undefined && !isNaN(student.arrears);
  const arrears = hasKnownArrears ? Number(student.arrears) : null;
  const coding = student.codingScore;
  const aptitude = student.aptitudeScore;
  const mockInterview = student.mockInterviewScore;
  const technical = student.technicalSkillsScore;
  const professional = student.professionalSkillsScore;

  // Calculate composite placement score
  const validScores = [coding, aptitude, mockInterview, technical, professional].filter(
    (v) => v !== null && v !== undefined
  );

  const avgPlacement = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 50;

  // Recruiter eligibility filter: backlogs
  if (hasKnownArrears && arrears > 0) {
    reasons.push(`Recruitment barrier: ${arrears} active arrears (corporate recruiters enforce zero active backlogs).`);
  } else if (!hasKnownArrears) {
    reasons.push('Academic backlogs unrecorded; corporate recruitment requires backlog verification.');
  }

  // Coding benchmark
  if (coding !== null && coding !== undefined) {
    if (coding >= 75) {
      reasons.push(`High competitive coding benchmark (${coding}%).`);
    } else if (coding < 50) {
      reasons.push(`Coding assessment score (${coding}%) is below technical round cutoff.`);
    }
  }

  // Aptitude benchmark
  if (aptitude !== null && aptitude !== undefined) {
    if (aptitude < 55) {
      reasons.push(`Quantitative and logical aptitude (${aptitude}%) requires training.`);
    } else if (aptitude >= 75) {
      reasons.push(`Strong quantitative aptitude screening score (${aptitude}%).`);
    }
  }

  // Mock interview results
  if (mockInterview !== null && mockInterview !== undefined) {
    if (mockInterview < 60) {
      reasons.push(`Mock interview evaluation (${mockInterview}%) notes need for technical articulation improvement.`);
    } else if (mockInterview >= 75) {
      reasons.push(`Mock interview evaluation confirms solid behavioral and technical delivery (${mockInterview}%).`);
    }
  }

  let status = 'Needs Upskilling';
  // Job Ready requires confirmed zero arrears
  if (hasKnownArrears && arrears === 0 && avgPlacement >= 72 && (coding === null || coding >= 65)) {
    status = 'Job Ready';
    if (reasons.length === 0) {
      reasons.push('Demonstrates consistent placement aptitude, technical proficiency, and zero arrears.');
    }
  } else if ((hasKnownArrears && arrears >= 2) || avgPlacement < 50 || (coding !== null && coding < 45)) {
    status = 'High Priority Intervention';
    if (reasons.length === 0) {
      reasons.push('Requires intensive placement training and backlog remediation.');
    }
  } else {
    if (reasons.length === 0) {
      reasons.push('Meets baseline qualifications but requires targeted aptitude and coding practice.');
    }
  }

  return {
    status,
    readinessScore: Math.round(avgPlacement),
    reasons,
    keyRecommendation: status === 'Job Ready'
      ? 'Eligible for Day-1 tier recruiters.'
      : status === 'Needs Upskilling'
      ? 'Recommend participating in coding bootcamps and aptitude drills.'
      : 'Mandatory mentor intervention and remedial training recommended.'
  };
}
