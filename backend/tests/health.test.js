import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { syntheticDataService } from '../src/services/syntheticDataService.js';
import { getDbStatus } from '../src/config/db.js';

describe('CampusIQ Backend Health & Fallback Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start ephemeral server on random available port
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

  it('GET /api/health should respond with 200 OK and valid health payload', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'CampusIQ Backend API');
    assert.ok(typeof body.uptimeSeconds === 'number');
    assert.ok(typeof body.timestamp === 'string');

    // Verify database status report
    assert.ok(body.database);
    assert.ok(['mongodb', 'synthetic_fallback'].includes(body.database.mode));
    assert.ok(typeof body.database.status === 'string');
  });

  it('GET /health alias should also respond with 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
  });

  it('Synthetic data generator should supply at least 100 fictional student records', () => {
    const students = syntheticDataService.getAllStudents();
    assert.ok(
      students.length >= 100,
      `Expected at least 100 synthetic student records, found ${students.length}`
    );
  });

  it('Synthetic data records must cover CSE (04), AIML (18), and Cybersecurity (19)', () => {
    const cseStudents = syntheticDataService.getByBranchCode('04');
    const aimlStudents = syntheticDataService.getByBranchCode('18');
    const cyberStudents = syntheticDataService.getByBranchCode('19');

    assert.ok(cseStudents.length > 0, 'CSE records missing');
    assert.ok(aimlStudents.length > 0, 'AIML records missing');
    assert.ok(cyberStudents.length > 0, 'Cybersecurity records missing');

    // Verify registration number conventions (e.g., 241FA04001, 241FA18001, 241FA19001)
    const firstCse = cseStudents[0];
    const firstAiml = aimlStudents[0];
    const firstCyber = cyberStudents[0];

    assert.match(firstCse.registrationNumber, /^241FA04\d{3}$/);
    assert.match(firstAiml.registrationNumber, /^241FA18\d{3}$/);
    assert.match(firstCyber.registrationNumber, /^241FA19\d{3}$/);
  });

  it('Synthetic student records contain valid academic and risk fields', () => {
    const students = syntheticDataService.getAllStudents();
    for (const student of students.slice(0, 10)) {
      assert.ok(student.name && typeof student.name === 'string');
      assert.ok(student.gpa >= 0 && student.gpa <= 10);
      assert.ok(student.attendanceRate >= 0 && student.attendanceRate <= 100);
      assert.ok(['Low', 'Medium', 'High'].includes(student.riskLevel));
      assert.ok(student.riskScore >= 0 && student.riskScore <= 100);
    }
  });

  it('Database configuration accurately reports synthetic fallback mode when MongoDB is offline', () => {
    const status = getDbStatus();
    assert.ok(typeof status.mode === 'string');
    assert.ok(typeof status.connected === 'boolean');
  });

  it('CORS should permit http://localhost:5173 origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

  it('CORS should permit http://localhost:5174 origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5174' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  });

  it('CORS preflight OPTIONS should permit http://localhost:5174 origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5174',
        'Access-Control-Request-Method': 'GET'
      }
    });
    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  });

  it('CORS should block untrusted origins from receiving access-control-allow-origin', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://unauthorized-domain.com' }
    });
    assert.strictEqual(res.headers.get('access-control-allow-origin'), null);
  });
});
