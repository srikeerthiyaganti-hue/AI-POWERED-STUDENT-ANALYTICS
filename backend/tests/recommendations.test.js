import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createApp } from '../src/app.js';
import { generateStudentRecommendations } from '../src/services/recommendationEngine.js';
import { syntheticDataService } from '../src/services/syntheticDataService.js';

describe('CampusIQ Recommendations Engine & API Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp();
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

  describe('Recommendation Generation Unit Rules', () => {
    test('Flags high-priority attendance remediation when attendance < 75%', () => {
      const student = {
        registrationNumber: '241FA04001',
        name: 'Test Student',
        attendanceRate: 68,
        cgpa: 7.5,
        arrears: 0,
        analytics: { dataCoverage: 100, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const attRec = recs.find((r) => r.factor === 'attendance');
      assert.ok(attRec, 'Attendance recommendation should be present');
      assert.strictEqual(attRec.priority, 'High');
      assert.match(attRec.reason, /68%/);
      assert.match(attRec.title, /Remediation/);
    });

    test('Flags advisory attendance buffer when attendance is in 75-81.9% band', () => {
      const student = {
        registrationNumber: '241FA04002',
        name: 'Test Student',
        attendanceRate: 78.5,
        cgpa: 7.5,
        arrears: 0,
        analytics: { dataCoverage: 100, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const attRec = recs.find((r) => r.factor === 'attendance');
      assert.ok(attRec, 'Attendance advisory should be present');
      assert.strictEqual(attRec.priority, 'Medium');
      assert.match(attRec.title, /Advisory/);
    });

    test('Treats unknown/unrecorded arrears as backlog verification without claiming 0 backlogs', () => {
      const student = {
        registrationNumber: '241FA04003',
        name: 'Unrecorded Arrears Student',
        attendanceRate: 85,
        cgpa: 7.8,
        arrears: null, // Unrecorded!
        analytics: { dataCoverage: 95, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const arrearsRec = recs.find((r) => r.id.includes('arrears'));
      assert.ok(arrearsRec, 'Arrears record audit recommendation should be present');
      assert.strictEqual(arrearsRec.priority, 'Medium');
      assert.match(arrearsRec.title, /Backlog Record Audit/);
      assert.match(arrearsRec.reason, /unrecorded/i);
      assert.doesNotMatch(arrearsRec.reason, /0 active backlogs/i);
    });

    test('Flags critical multi-backlog clearance roadmap when student has >= 2 arrears', () => {
      const student = {
        registrationNumber: '241FA04004',
        name: 'Arrears Student',
        attendanceRate: 80,
        cgpa: 6.2,
        arrears: 3,
        analytics: { dataCoverage: 100, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const arrearsRec = recs.find((r) => r.id.includes('arrears-critical'));
      assert.ok(arrearsRec, 'Critical arrears recommendation should be present');
      assert.strictEqual(arrearsRec.priority, 'High');
      assert.match(arrearsRec.reason, /3 active backlogs/);
    });

    test('Identifies low coding score and recommends DSA bootcamp', () => {
      const student = {
        registrationNumber: '241FA04005',
        name: 'Coding Learner',
        attendanceRate: 88,
        cgpa: 8.0,
        arrears: 0,
        codingScore: 45,
        analytics: { dataCoverage: 100, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const codingRec = recs.find((r) => r.factor === 'coding');
      assert.ok(codingRec, 'Coding recommendation should be present');
      assert.strictEqual(codingRec.priority, 'High');
      assert.match(codingRec.title, /Coding & DSA Bootcamp/);
    });

    test('Enforces data coverage safeguard: Student < 60% receives data verification recommendation without fabricated scores', () => {
      const incompleteStudent = syntheticDataService.getByIdOrRegistration('241FA04038');
      assert.ok(incompleteStudent, 'Student 241FA04038 should exist');
      assert.strictEqual(incompleteStudent.analytics?.status, 'INSUFFICIENT_DATA');

      const recs = generateStudentRecommendations(incompleteStudent);
      const dataRec = recs.find((r) => r.factor === 'data_verification');
      assert.ok(dataRec, 'Data verification recommendation must be generated');
      assert.strictEqual(dataRec.priority, 'High');
      assert.match(dataRec.title, /Data Verification/);
      assert.match(dataRec.reason, /below the (minimum )?required 60%/);

      // Verify no fabricated coding or LMS recommendations were created from missing null values
      const codingRec = recs.find((r) => r.factor === 'coding');
      assert.strictEqual(codingRec, undefined, 'Coding recommendation should NOT be fabricated for unrecorded data');
    });

    test('Job-Ready student receives tier-1 nomination recommendation', () => {
      const student = {
        registrationNumber: '241FA04006',
        name: 'Job Ready Star',
        attendanceRate: 90,
        cgpa: 8.8,
        arrears: 0,
        codingScore: 85,
        aptitudeScore: 90,
        mockInterviewScore: 88,
        placementReadiness: { status: 'Job Ready' },
        analytics: { dataCoverage: 100, isEligibleForScoring: true }
      };

      const recs = generateStudentRecommendations(student);
      const placementRec = recs.find((r) => r.factor === 'placement');
      assert.ok(placementRec, 'Placement recommendation should be present');
      assert.match(placementRec.title, /Tier-1/);
    });
  });

  describe('Recommendation REST Endpoints', () => {
    test('GET /api/students/:idOrRegNo/recommendations returns explainable list for valid student', async () => {
      const res = await fetch(`${baseUrl}/api/students/241FA04001/recommendations`);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.data.student.registrationNumber, '241FA04001');
      assert.ok(Array.isArray(json.data.recommendations));
      assert.ok(json.data.recommendations.length > 0);

      const firstRec = json.data.recommendations[0];
      assert.ok(firstRec.title);
      assert.ok(firstRec.reason);
      assert.ok(firstRec.suggestedAction);
      assert.ok(['High', 'Medium', 'Low'].includes(firstRec.priority));
    });

    test('GET /api/students/:idOrRegNo/recommendations returns 404 for unknown student', async () => {
      const res = await fetch(`${baseUrl}/api/students/UNKNOWN_STUDENT_999/recommendations`);
      assert.strictEqual(res.status, 404);
      const json = await res.json();
      assert.strictEqual(json.status, 'error');
    });

    test('GET /api/recommendations retrieves cohort recommendations with priority filter', async () => {
      const res = await fetch(`${baseUrl}/api/recommendations?priority=High`);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.ok(Array.isArray(json.data));
      assert.ok(json.meta.total > 0);
      assert.ok(json.meta.distribution.high > 0);

      // Verify all returned records have priority High
      const nonHigh = json.data.find((r) => r.priority !== 'High');
      assert.strictEqual(nonHigh, undefined, 'All filtered recommendations should have priority High');
    });

    test('GET /api/recommendations supports factor filtering (attendance)', async () => {
      const res = await fetch(`${baseUrl}/api/recommendations?factor=attendance`);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((r) => r.factor === 'attendance'));
    });
  });
});
