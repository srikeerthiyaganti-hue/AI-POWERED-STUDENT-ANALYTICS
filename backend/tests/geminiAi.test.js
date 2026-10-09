import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createApp } from '../src/app.js';
import { syntheticDataService } from '../src/services/syntheticDataService.js';
import { SCORE_WEIGHTS } from '../src/services/analyticsEngine.js';
import { generateStudentInsights } from '../src/services/geminiService.js';

describe('CampusIQ Gemini AI Copilot API Suite', () => {
  let server;
  let baseUrl;
  let app;

  const validMockGeminiResponse = JSON.stringify({
    performanceExplanation:
      'Aarav Sharma maintains a strong academic foundation with an 8.75 CGPA and 92.5% attendance. Success Score reflects consistent performance across theory and laboratory modules.',
    mainContributingFactors: [
      {
        factor: 'Academic Performance',
        impact: 'Positive',
        observation: 'High cumulative GPA of 8.75 with zero arrears.'
      },
      {
        factor: 'Classroom Attendance',
        impact: 'Positive',
        observation: 'Attendance is 92.5%, well above the mandatory 75% threshold.'
      },
      {
        factor: 'Technical Assessments',
        impact: 'Neutral',
        observation: 'Consistent scores in coding and aptitude tests.'
      }
    ],
    personalizedActions: [
      {
        priority: 'High',
        factor: 'coding',
        action: 'Practice advanced data structures and dynamic programming on competitive platforms.',
        rationale: 'Elevate technical rounds performance for tier-1 campus drives.'
      },
      {
        priority: 'Medium',
        factor: 'aptitude',
        action: 'Participate in weekly timed quantitative and reasoning mock tests.',
        rationale: 'Sharpen speed and accuracy in placement screening tests.'
      },
      {
        priority: 'Low',
        factor: 'skills',
        action: 'Lead departmental technical seminar or open-source hackathon group.',
        rationale: 'Strengthen leadership and professional presentation portfolio.'
      }
    ],
    fourWeekRoadmap: {
      week1: 'Complete 10 graph algorithm problems and review mock assessment solutions.',
      week2: 'Take 2 full-length quantitative aptitude mock exams and analyze weak topics.',
      week3: 'Attend departmental technical interview simulation workshop.',
      week4: 'Review comprehensive placement portfolio with assigned faculty advisor.'
    },
    missingDataAndUncertainty: {
      unrecordedMetrics: [],
      limitations: 'All baseline metrics are recorded; continuous tracking is recommended.',
      certaintyDisclaimer:
        'This AI Copilot provides advisory guidance based on available institutional metrics. It does not predict future academic or placement outcomes with certainty.'
    },
    questionAnswer: null
  });

  before(async () => {
    app = createApp();
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    // Reset any mock override before each test
    delete app.locals.geminiClientOverride;
  });

  describe('Input Validation & Safeguards', () => {
    test('Rejects request with missing registrationNumber (400)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'INVALID_REGISTRATION_NUMBER');
    });

    test('Rejects request for non-existent student registration (404)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA99999' })
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'STUDENT_NOT_FOUND');
      assert.match(data.message, /241FA99999/);
    });

    test('Rejects question longer than 500 characters (400)', async () => {
      const longQuestion = 'A'.repeat(501);
      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '241FA04001',
          question: longQuestion
        })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'QUESTION_TOO_LONG');
    });

    test('Rejects question with invalid non-string type (400)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '241FA04001',
          question: 12345
        })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'INVALID_QUESTION_FORMAT');
    });

    test('Rejects identity mismatch when supplied studentName contradicts directory (400)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '241FA04001',
          studentName: 'Completely Wrong Student Name'
        })
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'IDENTITY_MISMATCH');
      assert.match(data.message, /Identity conflict/);
    });
  });

  describe('Missing Key & Provider Failure Handling', () => {
    test('Returns clear GEMINI_KEY_MISSING error without fabricating insights when API key is missing', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationNumber: '241FA04001' })
        });

        assert.equal(res.status, 503);
        const data = await res.json();
        assert.equal(data.status, 'error');
        assert.equal(data.code, 'GEMINI_KEY_MISSING');
        assert.match(data.message, /backend\/\.env/);
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    test('Handles provider error gracefully without crashing (502)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => {
          throw new Error('Google Gemini API unavailable: 503 Service Unavailable');
        }
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 502);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'GEMINI_PROVIDER_ERROR');
    });

    test('Handles deprecated or unavailable model (404) with clear GEMINI_MODEL_UNAVAILABLE error (503)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => {
          const err = new Error('This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash');
          err.status = 404;
          throw err;
        }
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 503);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'GEMINI_MODEL_UNAVAILABLE');
      assert.match(data.message, /GEMINI_MODEL/);
    });

    test('Handles quota / rate limit exceeded (429) gracefully (429)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => {
          const err = new Error('You exceeded your current quota, please check your plan and billing details.');
          err.status = 429;
          throw err;
        }
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 429);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'GEMINI_RATE_LIMIT');
    });

    test('Handles invalid API key authentication error (401)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => {
          const err = new Error('API key not valid. Please pass a valid API key.');
          err.status = 400;
          throw err;
        }
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'GEMINI_AUTH_ERROR');
    });

    test('Handles provider timeout gracefully (504)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => {
          throw new Error('GEMINI_TIMEOUT: Request timed out');
        }
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 504);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'GEMINI_TIMEOUT');
    });

    test('Handles malformed unparseable AI provider response safely (502)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: 'This is not valid JSON at all! Just raw plain text output.'
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 502);
      const data = await res.json();
      assert.equal(data.status, 'error');
      assert.equal(data.code, 'MALFORMED_AI_RESPONSE');
    });
  });

  describe('Successful Insights Generation & Schema Integrity', () => {
    test('Generates structured student insights with 4-week roadmap and personalized actions (200)', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: validMockGeminiResponse
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(body.data);

      const insight = body.data;
      // 1. Performance explanation
      assert.ok(insight.performanceExplanation);
      assert.match(insight.performanceExplanation, /Aarav Sharma/);

      // 2. Contributing factors
      assert.ok(Array.isArray(insight.mainContributingFactors));
      assert.ok(insight.mainContributingFactors.length >= 2);
      assert.ok(insight.mainContributingFactors[0].factor);
      assert.ok(insight.mainContributingFactors[0].impact);

      // 3. Personalized actions (3 to 5)
      assert.ok(Array.isArray(insight.personalizedActions));
      assert.ok(insight.personalizedActions.length >= 3 && insight.personalizedActions.length <= 5);
      assert.ok(insight.personalizedActions[0].action);
      assert.ok(insight.personalizedActions[0].priority);

      // 4. Four-week roadmap
      assert.ok(insight.fourWeekRoadmap);
      assert.ok(insight.fourWeekRoadmap.week1);
      assert.ok(insight.fourWeekRoadmap.week2);
      assert.ok(insight.fourWeekRoadmap.week3);
      assert.ok(insight.fourWeekRoadmap.week4);

      // 5. Missing data & uncertainty disclaimer
      assert.ok(insight.missingDataAndUncertainty);
      assert.ok(insight.missingDataAndUncertainty.certaintyDisclaimer);
      assert.match(insight.missingDataAndUncertainty.certaintyDisclaimer, /advisory/i);

      // 6. Question answer is null when no question was asked
      assert.equal(insight.questionAnswer, null);
    });

    test('Answers specific faculty question when provided', async () => {
      const answerText = 'The student should focus on graph algorithms and mock interview simulations.';
      const responseWithAnswer = JSON.parse(validMockGeminiResponse);
      responseWithAnswer.questionAnswer = answerText;

      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: JSON.stringify(responseWithAnswer)
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '241FA04001',
          question: 'What specific technical areas should this student prepare for campus placements?'
        })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'success');
      assert.equal(body.data.questionAnswer, answerText);
    });

    test('Correctly handles markdown code fences in model output', async () => {
      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: `\`\`\`json\n${validMockGeminiResponse}\n\`\`\``
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(body.data.performanceExplanation);
    });
  });

  describe('Scoring & Data Invariance Safeguards', () => {
    test('Student directory records and scoring weights remain strictly intact', async () => {
      const student = syntheticDataService.getByIdOrRegistration('241FA04001');
      assert.ok(student);
      assert.equal(student.registrationNumber, '241FA04001');
      assert.equal(student.branchCode, '04');
      assert.ok(student.analytics);
      assert.ok(student.analytics.breakdown);

      // Verify all 7 weights match institutional constants
      assert.equal(SCORE_WEIGHTS.academic, 0.30);
      assert.equal(SCORE_WEIGHTS.attendance, 0.15);
      assert.equal(SCORE_WEIGHTS.placement, 0.15);
      assert.equal(SCORE_WEIGHTS.skills, 0.15);
      assert.equal(SCORE_WEIGHTS.lms, 0.10);
      assert.equal(SCORE_WEIGHTS.engagement, 0.10);
      assert.equal(SCORE_WEIGHTS.mentor, 0.05);

      // Verify total synthetic dataset size remains 120
      const allStudents = syntheticDataService.getAllRawStudents();
      assert.equal(allStudents.length, 120);
    });
  });

  describe('Audit Regression: Student 241FA04001 (Deepika Deshmukh)', () => {
    test('Authoritative metrics for 241FA04001 match expected institutional record', async () => {
      const student = syntheticDataService.getByIdOrRegistration('241FA04001');
      assert.ok(student, 'Student 241FA04001 must exist in directory');
      assert.equal(student.name, 'Deepika Deshmukh');
      assert.equal(student.registrationNumber, '241FA04001');
      assert.equal(student.cgpa, 7.09);
      assert.deepEqual(student.semesterGpa, [6.99, 7.29]);
      assert.equal(student.arrears, 0);
      assert.equal(student.attendanceRate, 81);
      assert.equal(student.assignmentCompletionRate, 63);
      assert.equal(student.lmsScore, 63);
      assert.equal(student.engagementScore, 80);
      assert.equal(student.codingScore, 63);
      assert.equal(student.aptitudeScore, 86);
      assert.equal(student.mockInterviewScore, 78);
      assert.equal(student.technicalSkillsScore, 87);
      assert.equal(student.professionalSkillsScore, 84);
      assert.equal(student.mentorFeedbackScore, 82);
      assert.equal(student.mentorNotes, 'Demonstrates leadership in technical workshops; consistent peer mentor.');
      assert.equal(student.analytics.successScore, 76.1);
      assert.equal(student.analytics.dataCoverage, 100);
      assert.equal(student.academicRisk.level, 'High');
      assert.equal(student.academicRisk.riskScore, 50);
      assert.equal(student.placementReadiness.status, 'Needs Upskilling');
    });

    test('Gemini copilot insights for 241FA04001 faithfully reflect authoritative metrics with advisory framing', async () => {
      const deepikaAuditMock = JSON.stringify({
        performanceExplanation:
          'Deepika Deshmukh holds an institutional Success Score of 76.1/100 and is classified under High academic risk (Risk Score 50). This risk is driven by her marginal CGPA of 7.09 (semester GPAs of 6.99 and 7.29) and a borderline attendance rate of 81%, placed in the 75%-82% advisory zone. Additionally, an LMS assignment completion rate of 63% reflects low weekly engagement.',
        mainContributingFactors: [
          {
            factor: 'Attendance Rate',
            impact: 'Negative',
            observation: 'Attendance is at 81%, placing her in the borderline advisory zone (75% - 82%).'
          },
          {
            factor: 'LMS Assignment Completion',
            impact: 'Negative',
            observation: 'Assignment completion rate of 63% indicates low weekly academic engagement.'
          },
          {
            factor: 'Coding Assessment',
            impact: 'Negative',
            observation: 'Coding score of 63% places placement readiness in Needs Upskilling status.'
          },
          {
            factor: 'Quantitative Aptitude & Technical Skills',
            impact: 'Positive',
            observation: 'Strong core abilities with 86% aptitude score and 87/100 technical skills.'
          }
        ],
        personalizedActions: [
          {
            priority: 'High',
            factor: 'attendance',
            action: 'Maintain 100% lecture and laboratory attendance over the next month to pull cumulative attendance above 85%.',
            rationale: 'Borderline attendance (81%) is the primary driver of her High risk classification.'
          },
          {
            priority: 'High',
            factor: 'academics',
            action: 'Establish a structured schedule to submit pending and upcoming LMS coursework, lifting completion from 63% to 80%.',
            rationale: 'LMS completion rate (63%) directly impacts internal academic performance.'
          },
          {
            priority: 'Medium',
            factor: 'coding',
            action: 'Dedicate 4 hours weekly to fundamental data structures practice on coding platforms.',
            rationale: 'Addresses the 63% coding score while capitalizing on strong 87/100 technical skills.'
          },
          {
            priority: 'Medium',
            factor: 'engagement',
            action: 'Channel peer-mentoring leadership from technical workshops into an accountability study group.',
            rationale: 'Leverages mentor notes highlighting her strong peer leadership to reinforce coursework deadlines.'
          }
        ],
        fourWeekRoadmap: {
          week1: 'Review outstanding LMS assignments with academic mentor and submit 3 pending modules to address the 63% rate.',
          week2: 'Achieve 100% attendance across all course modules to lift the 81% borderline average.',
          week3: 'Complete 10 focused coding exercises in arrays and strings to address the 63% coding benchmark.',
          week4: 'Achieve 75%+ cumulative LMS completion and hold an advisory progress review with faculty mentor.'
        },
        missingDataAndUncertainty: {
          unrecordedMetrics: ['Subject-wise mid-semester exam marks'],
          limitations: 'Full 100% data coverage is present across institutional pillars, though lack of granular exam marks limits subject-level isolation.',
          certaintyDisclaimer: 'This analysis is an advisory aid based on recorded campus metrics and does not guarantee academic or placement outcomes.'
        },
        questionAnswer: null
      });

      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: deepikaAuditMock
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: '241FA04001' })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'success');
      const data = body.data;

      // Verify narrative cites authoritative numbers
      assert.match(data.performanceExplanation, /76\.1/);
      assert.match(data.performanceExplanation, /High/);
      assert.match(data.performanceExplanation, /7\.09/);
      assert.match(data.performanceExplanation, /81%/);
      assert.match(data.performanceExplanation, /63%/);

      // Verify contributing factors match record
      assert.ok(data.mainContributingFactors.length >= 4);
      const codingFactor = data.mainContributingFactors.find(f => f.factor.toLowerCase().includes('coding'));
      assert.ok(codingFactor);
      assert.equal(codingFactor.impact, 'Negative');

      // Verify 3 to 5 actionable items
      assert.ok(data.personalizedActions.length >= 3 && data.personalizedActions.length <= 5);

      // Verify 4-week roadmap
      assert.ok(data.fourWeekRoadmap.week1);
      assert.ok(data.fourWeekRoadmap.week2);
      assert.ok(data.fourWeekRoadmap.week3);
      assert.ok(data.fourWeekRoadmap.week4);

      // Verify non-predictive certainty disclaimer
      assert.match(data.missingDataAndUncertainty.certaintyDisclaimer, /advisory/i);
      assert.match(data.missingDataAndUncertainty.certaintyDisclaimer, /does not guarantee/i);

      // Verify student identity metadata
      assert.equal(data.metadata.studentRegistrationNumber, '241FA04001');
      assert.equal(data.metadata.studentName, 'Deepika Deshmukh');
    });

    test('Zero arrears is strictly preserved as 0 and not mischaracterized as backlog or unrecorded', async () => {
      const student = syntheticDataService.getByIdOrRegistration('241FA04001');
      assert.equal(student.arrears, 0);

      // Test with custom question regarding backlogs
      const backlogQuestionAnswer = 'Deepika Deshmukh has 0 active arrears. Her academic standing has no active backlogs.';
      const mockResponse = JSON.parse(validMockGeminiResponse);
      mockResponse.questionAnswer = backlogQuestionAnswer;

      app.locals.geminiClientOverride = {
        generateContent: async () => ({
          text: JSON.stringify(mockResponse)
        })
      };

      const res = await fetch(`${baseUrl}/api/ai/student-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: '241FA04001',
          question: 'Does Deepika Deshmukh have any backlogs or arrears?'
        })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'success');
      assert.match(body.data.questionAnswer, /0 active arrears/);
    });
  });
});
