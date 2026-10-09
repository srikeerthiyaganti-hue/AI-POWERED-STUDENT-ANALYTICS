import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCORE_WEIGHTS,
  MIN_DATA_COVERAGE_THRESHOLD,
  validateWeights,
  extractDimensionScores,
  calculateDataCoverage,
  calculateStudentSuccessScore,
  classifyAcademicRisk,
  classifyPlacementReadiness
} from '../src/services/analyticsEngine.js';

describe('CampusIQ Analytics Engine Unit Suite', () => {
  describe('Weight Validation', () => {
    it('Weights must strictly sum to 1.0 (100%)', () => {
      const result = validateWeights();
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.totalWeight, 1.0);
    });

    it('Weights must match the required specification', () => {
      assert.strictEqual(SCORE_WEIGHTS.academic, 0.30, 'Academic performance should be 30%');
      assert.strictEqual(SCORE_WEIGHTS.attendance, 0.15, 'Attendance should be 15%');
      assert.strictEqual(SCORE_WEIGHTS.lms, 0.10, 'LMS/assignments should be 10%');
      assert.strictEqual(SCORE_WEIGHTS.engagement, 0.10, 'Engagement should be 10%');
      assert.strictEqual(SCORE_WEIGHTS.placement, 0.15, 'Placement readiness should be 15%');
      assert.strictEqual(SCORE_WEIGHTS.skills, 0.15, 'Skills should be 15%');
      assert.strictEqual(SCORE_WEIGHTS.mentor, 0.05, 'Mentor feedback should be 5%');
    });
  });

  describe('Dimension Score Extraction', () => {
    it('Correctly extracts and scales complete student profile', () => {
      const student = {
        cgpa: 8.5,
        arrears: 0,
        attendanceRate: 90,
        assignmentCompletionRate: 85,
        engagementScore: 80,
        codingScore: 75,
        aptitudeScore: 80,
        mockInterviewScore: 85,
        technicalSkillsScore: 70,
        professionalSkillsScore: 80,
        mentorFeedbackScore: 90
      };

      const extracted = extractDimensionScores(student);
      assert.strictEqual(extracted.academic, 85);
      assert.strictEqual(extracted.attendance, 90);
      assert.strictEqual(extracted.lms, 85);
      assert.strictEqual(extracted.engagement, 80);
      assert.strictEqual(extracted.placement, 80); // (75 + 80 + 85) / 3 = 80
      assert.strictEqual(extracted.skills, 75);    // (70 + 80) / 2 = 75
      assert.strictEqual(extracted.mentor, 90);
    });

    it('Applies arrears penalty to academic dimension score', () => {
      const studentNoArrears = { cgpa: 8.0, arrears: 0 };
      const studentWithArrears = { cgpa: 8.0, arrears: 2 };

      const ext1 = extractDimensionScores(studentNoArrears);
      const ext2 = extractDimensionScores(studentWithArrears);

      assert.strictEqual(ext1.academic, 80);
      // 80 - (2 * 10) = 60
      assert.strictEqual(ext2.academic, 60);
    });
  });

  describe('Data Coverage Calculation', () => {
    it('Reports 100% coverage when all 7 dimensions are present', () => {
      const scores = {
        academic: 80,
        attendance: 85,
        lms: 90,
        engagement: 75,
        placement: 70,
        skills: 80,
        mentor: 85
      };
      const coverage = calculateDataCoverage(scores);
      assert.strictEqual(coverage.coveragePercentage, 100);
      assert.strictEqual(coverage.isSufficient, true);
      assert.strictEqual(coverage.missingDimensions.length, 0);
    });

    it('Calculates exact coverage when optional mentor dimension is missing (95%)', () => {
      const scores = {
        academic: 80,
        attendance: 85,
        lms: 90,
        engagement: 75,
        placement: 70,
        skills: 80,
        mentor: null // 5% missing
      };
      const coverage = calculateDataCoverage(scores);
      assert.strictEqual(coverage.coveragePercentage, 95);
      assert.strictEqual(coverage.isSufficient, true);
      assert.deepStrictEqual(coverage.missingDimensions, ['mentor']);
    });

    it('Identifies insufficient coverage when below 60% threshold', () => {
      // Only academic (30%) and attendance (15%) present = 45% coverage
      const scores = {
        academic: 80,
        attendance: 85,
        lms: null,
        engagement: null,
        placement: null,
        skills: null,
        mentor: null
      };
      const coverage = calculateDataCoverage(scores);
      assert.strictEqual(coverage.coveragePercentage, 45);
      assert.strictEqual(coverage.isSufficient, false);
      assert.strictEqual(coverage.missingDimensions.length, 5);
    });
  });

  describe('Student Success Score Calculation', () => {
    it('Calculates perfect 100 for maximum input scores', () => {
      const student = {
        cgpa: 10.0,
        arrears: 0,
        attendanceRate: 100,
        assignmentCompletionRate: 100,
        engagementScore: 100,
        codingScore: 100,
        aptitudeScore: 100,
        mockInterviewScore: 100,
        technicalSkillsScore: 100,
        professionalSkillsScore: 100,
        mentorFeedbackScore: 100
      };

      const result = calculateStudentSuccessScore(student);
      assert.strictEqual(result.isEligibleForScoring, true);
      assert.strictEqual(result.status, 'CALCULATED');
      assert.strictEqual(result.successScore, 100);
      assert.strictEqual(result.dataCoverage, 100);
    });

    it('Normalizes against available weights when partial data is present (>= 60%)', () => {
      // Missing mentor feedback (5% weight). Remaining available weight = 95%
      // All remaining dimensions are set to 80.
      const student = {
        cgpa: 8.0,
        arrears: 0,
        attendanceRate: 80,
        assignmentCompletionRate: 80,
        engagementScore: 80,
        codingScore: 80,
        aptitudeScore: 80,
        mockInterviewScore: 80,
        technicalSkillsScore: 80,
        professionalSkillsScore: 80,
        mentorFeedbackScore: null
      };

      const result = calculateStudentSuccessScore(student);
      assert.strictEqual(result.isEligibleForScoring, true);
      assert.strictEqual(result.isNormalized, true);
      assert.strictEqual(result.dataCoverage, 95);
      // Normalized score must equal 80 because all available dimensions are 80
      assert.strictEqual(result.successScore, 80);
      assert.ok(result.breakdown.mentor.missing);
    });

    it('Enforces 60% threshold: Returns null score and INSUFFICIENT_DATA when coverage < 60%', () => {
      // Only academic (30%) + attendance (15%) = 45% coverage
      const student = {
        cgpa: 7.5,
        arrears: 0,
        attendanceRate: 80,
        assignmentCompletionRate: null,
        engagementScore: null,
        codingScore: null,
        aptitudeScore: null,
        mockInterviewScore: null,
        technicalSkillsScore: null,
        professionalSkillsScore: null,
        mentorFeedbackScore: null
      };

      const result = calculateStudentSuccessScore(student);
      assert.strictEqual(result.isEligibleForScoring, false);
      assert.strictEqual(result.status, 'INSUFFICIENT_DATA');
      assert.strictEqual(result.successScore, null);
      assert.strictEqual(result.dataCoverage, 45);
      assert.match(result.reason, /below the minimum required 60%/);
    });

    it('Correctly calculates score at exact boundary of 60% coverage', () => {
      // Academic (30%) + Attendance (15%) + Placement (15%) = exactly 60%
      const student = {
        cgpa: 9.0, // 90
        arrears: 0,
        attendanceRate: 90, // 90
        codingScore: 90, // placement = 90
        aptitudeScore: 90,
        mockInterviewScore: 90,
        assignmentCompletionRate: null,
        engagementScore: null,
        technicalSkillsScore: null,
        professionalSkillsScore: null,
        mentorFeedbackScore: null
      };

      const result = calculateStudentSuccessScore(student);
      assert.strictEqual(result.isEligibleForScoring, true);
      assert.strictEqual(result.status, 'CALCULATED');
      assert.strictEqual(result.dataCoverage, 60);
      assert.strictEqual(result.successScore, 90);
    });
  });

  describe('Explainable Academic Risk Classification', () => {
    it('Flags High Risk when attendance is below mandatory 75% threshold', () => {
      const student = {
        cgpa: 8.5,
        attendanceRate: 68.0,
        arrears: 0
      };

      const risk = classifyAcademicRisk(student);
      assert.strictEqual(risk.level, 'High');
      assert.ok(risk.reasons.some((r) => r.includes('mandatory 75% threshold')));
    });

    it('Flags High Risk when student has 2 or more active backlogs', () => {
      const student = {
        cgpa: 7.5,
        attendanceRate: 88.0,
        arrears: 2
      };

      const risk = classifyAcademicRisk(student);
      assert.strictEqual(risk.level, 'High');
      assert.ok(risk.reasons.some((r) => r.includes('Active backlogs: 2 subjects')));
    });

    it('Flags Medium Risk for marginal GPA and borderline attendance', () => {
      const student = {
        cgpa: 6.8,
        attendanceRate: 78.5,
        arrears: 0
      };

      const risk = classifyAcademicRisk(student);
      assert.strictEqual(risk.level, 'Medium');
      assert.ok(risk.reasons.some((r) => r.includes('marginal academic performance band')));
    });

    it('Classifies Low Risk for high performers with clean record', () => {
      const student = {
        cgpa: 8.8,
        attendanceRate: 92.0,
        arrears: 0
      };

      const risk = classifyAcademicRisk(student);
      assert.strictEqual(risk.level, 'Low');
      assert.ok(risk.reasons.some((r) => r.includes('Strong academic standing')));
      assert.ok(risk.reasons.some((r) => r.includes('0 arrears')));
    });

    it('Does not falsely claim zero arrears when arrears data is missing', () => {
      const student = {
        cgpa: 8.5,
        attendanceRate: 90.0,
        arrears: null
      };

      const risk = classifyAcademicRisk(student);
      assert.strictEqual(risk.level, 'Low');
      assert.ok(risk.reasons.some((r) => r.includes('arrears unrecorded')), 'Should note arrears unrecorded');
      assert.ok(!risk.reasons.some((r) => r.includes('0 arrears')), 'Must not claim 0 arrears when missing');
    });
  });

  describe('Explainable Placement Readiness Classification', () => {
    it('Classifies Job Ready for student with high scores and confirmed zero backlogs', () => {
      const student = {
        arrears: 0,
        codingScore: 85,
        aptitudeScore: 80,
        mockInterviewScore: 82,
        technicalSkillsScore: 80,
        professionalSkillsScore: 85
      };

      const readiness = classifyPlacementReadiness(student);
      assert.strictEqual(readiness.status, 'Job Ready');
      assert.ok(readiness.reasons.some((r) => r.includes('coding benchmark')));
      assert.strictEqual(readiness.keyRecommendation, 'Eligible for Day-1 tier recruiters.');
    });

    it('Does not grant Job Ready status when arrears data is unrecorded', () => {
      const student = {
        arrears: null, // missing arrears
        codingScore: 85,
        aptitudeScore: 85,
        mockInterviewScore: 85,
        technicalSkillsScore: 85,
        professionalSkillsScore: 85
      };

      const readiness = classifyPlacementReadiness(student);
      assert.strictEqual(readiness.status, 'Needs Upskilling');
      assert.ok(readiness.reasons.some((r) => r.includes('backlogs unrecorded')));
    });

    it('Flags recruitment barrier when student has backlogs', () => {
      const student = {
        arrears: 1,
        codingScore: 78,
        aptitudeScore: 80,
        mockInterviewScore: 80,
        technicalSkillsScore: 75,
        professionalSkillsScore: 80
      };

      const readiness = classifyPlacementReadiness(student);
      assert.strictEqual(readiness.status, 'Needs Upskilling');
      assert.ok(readiness.reasons.some((r) => r.includes('Recruitment barrier: 1 active arrears')));
    });

    it('Identifies High Priority Intervention for low coding score and multiple arrears', () => {
      const student = {
        arrears: 2,
        codingScore: 35,
        aptitudeScore: 40,
        mockInterviewScore: 45,
        technicalSkillsScore: 40,
        professionalSkillsScore: 45
      };

      const readiness = classifyPlacementReadiness(student);
      assert.strictEqual(readiness.status, 'High Priority Intervention');
      assert.ok(readiness.reasons.some((r) => r.includes('Coding assessment score')));
    });
  });
});
