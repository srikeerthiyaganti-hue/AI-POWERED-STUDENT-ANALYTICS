import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

describe('CampusIQ Student & Analytics API Integration Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
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

  it('GET /api/students should return list of at least 120 students with pagination', async () => {
    const res = await fetch(`${baseUrl}/api/students?limit=200`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data));
    assert.ok(body.pagination.total >= 120, `Expected total >= 120, got ${body.pagination.total}`);
    assert.ok(body.data.length >= 120);

    // Verify first record schema
    const first = body.data[0];
    assert.ok(first.registrationNumber);
    assert.ok(first.branchCode);
    assert.ok(first.analytics);
    assert.ok(first.academicRisk);
    assert.ok(first.placementReadiness);
  });

  it('GET /api/students?branch=04 should filter exclusively to CSE students', async () => {
    const res = await fetch(`${baseUrl}/api/students?branch=04`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data.length > 0);
    for (const student of body.data) {
      assert.strictEqual(student.branchCode, '04');
      assert.match(student.registrationNumber, /^241FA04\d{3}$/);
    }
  });

  it('GET /api/students?search=241FA18001 should find target AIML student', async () => {
    const res = await fetch(`${baseUrl}/api/students?search=241FA18001`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data.length >= 1);
    assert.strictEqual(body.data[0].registrationNumber, '241FA18001');
  });

  it('GET /api/students/:idOrRegNo should return detailed profile with score breakdown', async () => {
    const res = await fetch(`${baseUrl}/api/students/241FA04001`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    const student = body.data;
    assert.strictEqual(student.registrationNumber, '241FA04001');
    assert.strictEqual(student.branchCode, '04');

    // Validate score breakdown
    assert.ok(student.analytics);
    assert.ok(typeof student.analytics.dataCoverage === 'number');
    assert.ok(student.analytics.breakdown.academic);
    assert.ok(student.analytics.breakdown.attendance);
    assert.ok(student.analytics.breakdown.placement);
    assert.ok(student.analytics.breakdown.skills);

    // Validate explainable risk & placement reasons
    assert.ok(Array.isArray(student.academicRisk.reasons));
    assert.ok(student.academicRisk.reasons.length > 0);
    assert.ok(Array.isArray(student.placementReadiness.reasons));
    assert.ok(student.placementReadiness.reasons.length > 0);
  });

  it('GET /api/students/:idOrRegNo should return 404 for unknown identifier', async () => {
    const res = await fetch(`${baseUrl}/api/students/UNKNOWN_ID_999`);
    assert.strictEqual(res.status, 404);

    const body = await res.json();
    assert.strictEqual(body.status, 'error');
  });

  it('GET /api/analytics/overview should return cohort statistics and scoring config', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/overview`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    const overview = body.data;

    assert.ok(overview.totalStudents >= 120);
    assert.ok(typeof overview.averageSuccessScore === 'number');
    assert.ok(overview.riskDistribution.high !== undefined);
    assert.ok(overview.riskDistribution.medium !== undefined);
    assert.ok(overview.riskDistribution.low !== undefined);
    assert.ok(overview.placementDistribution.jobReady !== undefined);
    assert.strictEqual(overview.branches.length, 3);
    assert.strictEqual(overview.scoringConfiguration.weightsValidated, true);
  });

  it('GET /api/analytics/weights should return transparent scoring weights', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/weights`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.isValid, true);
    assert.strictEqual(body.data.weights.academic, 0.30);
    assert.strictEqual(body.data.weights.attendance, 0.15);
    assert.strictEqual(body.data.weights.placement, 0.15);
    assert.strictEqual(body.data.weights.skills, 0.15);
    assert.strictEqual(body.data.weights.lms, 0.10);
    assert.strictEqual(body.data.weights.engagement, 0.10);
    assert.strictEqual(body.data.weights.mentor, 0.05);
  });

  it('Root endpoint GET / should list all available resources', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.name, 'CampusIQ API');
    assert.strictEqual(body.health, '/api/health');
    assert.strictEqual(body.students, '/api/students');
    assert.strictEqual(body.analytics, '/api/analytics/overview');
  });
});
