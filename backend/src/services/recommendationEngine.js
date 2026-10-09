// CampusIQ Personalized Student Recommendation Engine
// Generates explainable, evidence-backed recommendations derived from
// each student's multi-dimensional profile, existing risk levels, and placement benchmarks.

/**
 * Generates transparent recommendations for a student profile
 * @param {object} student - Student record with academic, skills, and analytics fields
 * @returns {Array<object>} Array of recommendation objects
 */
export function generateStudentRecommendations(student) {
  if (!student) return [];

  const recommendations = [];
  const regNo = student.registrationNumber || student.id || 'STUDENT';
  const analytics = student.analytics || {};

  // 1. Critical Safeguard: Insufficient Data Coverage (< 60%)
  // If data is insufficient, DO NOT fabricate performance scores or misleading task recommendations.
  // Instead, issue an explicit data-verification recommendation.
  const isInsufficient =
    analytics.isEligibleForScoring === false ||
    analytics.status === 'INSUFFICIENT_DATA' ||
    (analytics.dataCoverage !== undefined && analytics.dataCoverage < 60);

  if (isInsufficient) {
    const coverage = analytics.dataCoverage ?? 45;
    recommendations.push({
      id: `rec-data-verification-${regNo}`,
      studentRegistrationNumber: regNo,
      studentName: student.name,
      factor: 'data_verification',
      priority: 'High',
      title: 'Mandatory Academic Data Verification',
      reason: analytics.reason || `Data coverage is currently ${coverage}%, below the required 60% institutional threshold. Critical assessment dimensions are missing.`,
      suggestedAction: 'Schedule a departmental records audit and synchronize missing LMS, skills, or placement scores with the registrar.',
      sourceDimension: 'analytics_coverage'
    });

    // For students with insufficient data, we only evaluate attendance & CGPA if confirmed present;
    // we never infer missing assessments.
  }

  // 2. Attendance Dimension
  if (student.attendanceRate !== null && student.attendanceRate !== undefined && !isNaN(student.attendanceRate)) {
    const att = Number(student.attendanceRate);
    if (att < 75) {
      recommendations.push({
        id: `rec-attendance-critical-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'attendance',
        priority: 'High',
        title: 'Attendance Remediation & Debarment Alert',
        reason: `Attendance is ${att}%, which falls below the mandatory 75% college threshold and creates imminent exam debarment risk.`,
        suggestedAction: 'Execute a formal attendance recovery plan with mandatory 100% lecture presence and bi-weekly faculty advisor check-ins.',
        sourceDimension: 'attendanceRate'
      });
    } else if (att < 82) {
      recommendations.push({
        id: `rec-attendance-warning-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'attendance',
        priority: 'Medium',
        title: 'Attendance Advisory & Buffer Building',
        reason: `Attendance is currently ${att}%, lingering in the borderline advisory zone (75%–81.9%).`,
        suggestedAction: 'Maintain uninterrupted lecture attendance across upcoming weeks to establish a resilient buffer above 82%.',
        sourceDimension: 'attendanceRate'
      });
    }
  }

  // 3. Academic Arrears / Backlogs
  // Safeguard: strictly distinguish unrecorded null/undefined from 0
  const hasKnownArrears = student.arrears !== null && student.arrears !== undefined && !isNaN(student.arrears);
  if (!hasKnownArrears) {
    recommendations.push({
      id: `rec-arrears-verification-${regNo}`,
      studentRegistrationNumber: regNo,
      studentName: student.name,
      factor: 'academic',
      priority: 'Medium',
      title: 'Academic Backlog Record Audit',
      reason: 'Active backlog/arrears status is unrecorded in institutional records. Corporate recruitment eligibility requires verified clear status.',
      suggestedAction: 'Submit official grade card to departmental academic coordinator to confirm backlog status.',
      sourceDimension: 'arrears'
    });
  } else {
    const arrearsCount = Number(student.arrears);
    if (arrearsCount >= 2) {
      recommendations.push({
        id: `rec-arrears-critical-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'academic',
        priority: 'High',
        title: 'Urgent Multi-Backlog Clearance Roadmap',
        reason: `Student has ${arrearsCount} active backlogs pending, which triggers academic high risk and prohibits campus drive eligibility.`,
        suggestedAction: 'Enroll in departmental remedial tutorial classes and schedule fast-track supplementary examination attempts.',
        sourceDimension: 'arrears'
      });
    } else if (arrearsCount === 1) {
      recommendations.push({
        id: `rec-arrears-single-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'academic',
        priority: 'Medium',
        title: 'Single Backlog Clearance Priority',
        reason: 'Student has 1 active backlog, representing a direct hurdle to tier-1 recruitment drives.',
        suggestedAction: 'Meet with subject faculty for concept revision and prioritize clearing this single backlog in the upcoming examination cycle.',
        sourceDimension: 'arrears'
      });
    }
  }

  // 4. CGPA Performance
  if (student.cgpa !== null && student.cgpa !== undefined && !isNaN(student.cgpa)) {
    const cgpa = Number(student.cgpa);
    if (cgpa < 6.5) {
      recommendations.push({
        id: `rec-cgpa-low-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'academic',
        priority: 'High',
        title: 'Core Conceptual Mentoring',
        reason: `Cumulative GPA is ${cgpa.toFixed(2)} / 10.0, placing student in the marginal academic performance band.`,
        suggestedAction: 'Assign a departmental teaching assistant for fundamental concept coaching and conduct weekly problem-solving reviews.',
        sourceDimension: 'cgpa'
      });
    } else if (cgpa >= 8.5) {
      recommendations.push({
        id: `rec-cgpa-honors-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'academic',
        priority: 'Low',
        title: 'Honors Track & Research Mentorship',
        reason: `Outstanding academic record with cumulative GPA of ${cgpa.toFixed(2)} / 10.0.`,
        suggestedAction: 'Encourage enrollment in specialized research electives, conference publications, and peer mentoring roles.',
        sourceDimension: 'cgpa'
      });
    }
  }

  // Only evaluate skill & placement dimensions if not flagged as insufficient data
  if (!isInsufficient) {
    // 5. LMS & Assignments
    if (student.assignmentCompletionRate !== null && student.assignmentCompletionRate !== undefined && !isNaN(student.assignmentCompletionRate)) {
      const lms = Number(student.assignmentCompletionRate);
      if (lms < 70) {
        recommendations.push({
          id: `rec-lms-low-${regNo}`,
          studentRegistrationNumber: regNo,
          studentName: student.name,
          factor: 'lms',
          priority: 'Medium',
          title: 'Coursework & Assignment Catch-Up',
          reason: `Assignment submission rate is ${lms}%, signaling lagging weekly coursework engagement.`,
          suggestedAction: 'Establish scheduled weekly laboratory deadlines and attend TA helpdesk hours for pending coursework submissions.',
          sourceDimension: 'assignmentCompletionRate'
        });
      }
    }

    // 6. Coding Assessment
    if (student.codingScore !== null && student.codingScore !== undefined && !isNaN(student.codingScore)) {
      const coding = Number(student.codingScore);
      if (coding < 60) {
        recommendations.push({
          id: `rec-coding-low-${regNo}`,
          studentRegistrationNumber: regNo,
          studentName: student.name,
          factor: 'coding',
          priority: 'High',
          title: 'Intensive Coding & DSA Bootcamp',
          reason: `Coding assessment score is ${coding}%, below the minimum qualifying threshold for technical screening rounds.`,
          suggestedAction: 'Complete structured daily coding modules on Data Structures & Algorithms, aiming for at least 50 targeted problem solutions.',
          sourceDimension: 'codingScore'
        });
      }
    }

    // 7. Aptitude Assessment
    if (student.aptitudeScore !== null && student.aptitudeScore !== undefined && !isNaN(student.aptitudeScore)) {
      const aptitude = Number(student.aptitudeScore);
      if (aptitude < 65) {
        recommendations.push({
          id: `rec-aptitude-low-${regNo}`,
          studentRegistrationNumber: regNo,
          studentName: student.name,
          factor: 'aptitude',
          priority: 'Medium',
          title: 'Quantitative & Logical Reasoning Drills',
          reason: `Aptitude assessment score is ${aptitude}%, which places student at risk in preliminary corporate screening rounds.`,
          suggestedAction: 'Participate in targeted speed-aptitude workshops focusing on quantitative shortcuts and timed online mock tests.',
          sourceDimension: 'aptitudeScore'
        });
      }
    }

    // 8. Mock Interview Assessment
    if (student.mockInterviewScore !== null && student.mockInterviewScore !== undefined && !isNaN(student.mockInterviewScore)) {
      const mock = Number(student.mockInterviewScore);
      if (mock < 65) {
        recommendations.push({
          id: `rec-mock-low-${regNo}`,
          studentRegistrationNumber: regNo,
          studentName: student.name,
          factor: 'interview',
          priority: 'Medium',
          title: 'Behavioral & Technical Mock Interview Coaching',
          reason: `Mock interview evaluation is ${mock}%, indicating gaps in technical defense or verbal articulation.`,
          suggestedAction: 'Schedule 2 follow-up 1-on-1 mock interviews with alumni mentors focusing on project defense and soft skills.',
          sourceDimension: 'mockInterviewScore'
        });
      }
    }

    // 9. Job Ready Recognition
    const placementStatus = student.placementReadiness?.status;
    if (placementStatus === 'Job Ready') {
      recommendations.push({
        id: `rec-placement-ready-${regNo}`,
        studentRegistrationNumber: regNo,
        studentName: student.name,
        factor: 'placement',
        priority: 'Low',
        title: 'Tier-1 Campus Placement Nomination',
        reason: 'Student has cleared technical coding benchmarks, aptitude cutoffs, and maintains confirmed clean backlog status.',
        suggestedAction: 'Nominate candidate for tier-1 day-one placement drives and institutional hackathon sponsorships.',
        sourceDimension: 'placementReadiness'
      });
    }

    // 10. Mentor Feedback
    if (student.mentorFeedbackScore !== null && student.mentorFeedbackScore !== undefined && !isNaN(student.mentorFeedbackScore)) {
      const mentorScore = Number(student.mentorFeedbackScore);
      if (mentorScore < 65) {
        recommendations.push({
          id: `rec-mentor-checkin-${regNo}`,
          studentRegistrationNumber: regNo,
          studentName: student.name,
          factor: 'mentor',
          priority: 'Medium',
          title: 'Faculty Advisor Check-In Session',
          reason: `Faculty mentor rating is ${mentorScore}%, reflecting observed engagement or consistency concerns.`,
          suggestedAction: 'Conduct an in-person advisory check-in with the assigned mentor to identify and address academic obstacles.',
          sourceDimension: 'mentorFeedbackScore'
        });
      }
    }
  }

  // Fallback: If student has a completely clean profile and no issues flagged
  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-balanced-growth-${regNo}`,
      studentRegistrationNumber: regNo,
      studentName: student.name,
      factor: 'academic',
      priority: 'Low',
      title: 'Maintain Balanced Academic Performance',
      reason: 'Student maintains sound indicators across coursework, attendance, and skills assessments.',
      suggestedAction: 'Continue current study schedule and explore open-source contributions or extracurricular project leadership.',
      sourceDimension: 'overall'
    });
  }

  // Priority sorting: High > Medium > Low
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  recommendations.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  return recommendations;
}
