import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createApp } from '../src/app.js';

describe('CampusIQ Faculty Intervention Tracking API Suite', () => {
  let server;
  let baseUrl;
  let createdInterventionId;

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

  describe('Route Order & Statistics Endpoint', () => {
    test('GET /api/interventions/stats returns summary metrics without route collision with /:id', async () => {
      const res = await fetch(`${baseUrl}/api/interventions/stats`);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.ok(json.data);
      assert.ok(typeof json.data.total === 'number');
      assert.ok(typeof json.data.pending === 'number');
      assert.ok(typeof json.data.inProgress === 'number');
      assert.ok(typeof json.data.completed === 'number');
      assert.ok(typeof json.data.overdueCount === 'number');
      assert.ok(json.data.storage.mode);
    });
  });

  describe('Creation & Validation Safeguards', () => {
    test('POST /api/interventions rejects missing student registration number', async () => {
      const res = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue: 'Missing reg number',
          actionPlan: 'Needs review',
          priority: 'High',
          assignedFaculty: 'Dr. Smith',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.match(json.message, /registration number is required/i);
    });

    test('POST /api/interventions rejects non-existent student', async () => {
      const res = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRegistrationNumber: '241FA04999', // does not exist in 120 students
          issue: 'Attendance issue observed in lab',
          actionPlan: 'Bi-weekly tracking with faculty advisor',
          priority: 'High',
          assignedFaculty: 'Dr. Smith',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.match(json.message, /not found/i);
    });

    test('POST /api/interventions rejects short issue description (< 5 chars)', async () => {
      const res = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRegistrationNumber: '241FA04001',
          issue: 'Bad',
          actionPlan: 'Provide extra remedial guidance',
          priority: 'High',
          assignedFaculty: 'Dr. Smith',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.match(json.message, /at least 5 characters/i);
    });

    test('POST /api/interventions rejects creation with past due date', async () => {
      const res = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRegistrationNumber: '241FA04001',
          issue: 'Attendance fallen below threshold',
          actionPlan: 'Provide attendance contract',
          priority: 'High',
          assignedFaculty: 'Dr. Smith',
          dueDate: new Date(Date.now() - 7 * 86400000).toISOString() // 7 days in the past!
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.match(json.message, /past/i);
    });

    test('POST /api/interventions successfully creates new intervention for valid student', async () => {
      const futureDate = new Date(Date.now() + 10 * 86400000).toISOString();
      const res = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRegistrationNumber: '241FA04001',
          issue: 'Low mock interview score (62%) and verbal articulation hesitation',
          actionPlan: 'Schedule two 1-on-1 interview practice drills with senior alumni mentor',
          priority: 'High',
          assignedFaculty: 'Prof. Suresh Varma',
          dueDate: futureDate,
          notes: 'Focus specifically on operating system fundamentals'
        })
      });
      assert.strictEqual(res.status, 201);
      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.ok(json.data.id || json.data._id);
      assert.strictEqual(json.data.studentRegistrationNumber, '241FA04001');
      assert.strictEqual(json.data.status, 'Pending');
      assert.strictEqual(json.data.priority, 'High');

      createdInterventionId = json.data.id || json.data._id;
    });
  });

  describe('Listing & Filtering', () => {
    test('GET /api/interventions returns paginated records with storage mode metadata', async () => {
      const res = await fetch(`${baseUrl}/api/interventions`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.ok(Array.isArray(json.data));
      assert.ok(json.pagination.total > 0);
      assert.ok(json.storage.mode);
    });

    test('GET /api/interventions?status=Pending filters by status', async () => {
      const res = await fetch(`${baseUrl}/api/interventions?status=Pending`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((i) => i.status === 'Pending'));
    });

    test('GET /api/interventions?priority=High filters by priority', async () => {
      const res = await fetch(`${baseUrl}/api/interventions?priority=High`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((i) => i.priority === 'High'));
    });

    test('GET /api/interventions?student=241FA04001 filters by student registration number', async () => {
      const res = await fetch(`${baseUrl}/api/interventions?student=241FA04001`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((i) => i.studentRegistrationNumber === '241FA04001'));
    });
  });

  describe('Resource Retrieval, Update, and Deletion', () => {
    test('GET /api/interventions/:id returns single intervention', async () => {
      assert.ok(createdInterventionId);
      const res = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.data.id, createdInterventionId);
    });

    test('GET /api/interventions/:id returns 404 for unknown identifier', async () => {
      const res = await fetch(`${baseUrl}/api/interventions/UNKNOWN_INT_999`);
      assert.strictEqual(res.status, 404);
    });

    test('PATCH /api/interventions/:id updates status to In Progress', async () => {
      const res = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'In Progress',
          notes: 'First mock interview completed on Tuesday.'
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.data.status, 'In Progress');
      assert.match(json.data.notes, /First mock interview/);
    });

    test('PATCH /api/interventions/:id allows updating an overdue record with past due date', async () => {
      // Find an overdue record or update due date into the past to test update allowance
      const pastDate = new Date(Date.now() - 3 * 86400000).toISOString();
      const res = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dueDate: pastDate,
          status: 'Completed',
          resolutionNotes: 'Successfully completed after target deadline.'
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.data.status, 'Completed');
    });

    test('PATCH /api/interventions/:id rejects invalid status value', async () => {
      const res = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'INVALID_STATUS'
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.match(json.message, /status/i);
    });

    test('DELETE /api/interventions/:id removes intervention', async () => {
      const res = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`, {
        method: 'DELETE'
      });
      assert.strictEqual(res.status, 200);

      // Verify subsequent lookup yields 404
      const getRes = await fetch(`${baseUrl}/api/interventions/${createdInterventionId}`);
      assert.strictEqual(getRes.status, 404);
    });
  });

  describe('Legacy MongoDB Record Normalization & Safeguards', () => {
    test('normalizeIntervention normalizes legacy studentRegNo, assignedTo, targetDate, and type/notes', async () => {
      const { normalizeIntervention } = await import('../src/services/interventionService.js');
      const legacyDoc = {
        _id: '6ac8bef7f4af36eee8a9292a',
        studentId: 'STU_241FA04004',
        studentRegNo: '241FA04004',
        studentName: 'Arjun Gupta',
        branch: 'CSE',
        type: 'Remedial Classes',
        priority: 'HIGH',
        status: 'Pending',
        assignedTo: 'Prof. Sunita Rao',
        targetDate: '2025-06-15',
        notes: 'Assigned weekend remedial problem sessions in core domain subjects to address 1 backlog(s).',
        followUpHistory: [
          {
            date: '2025-05-10',
            author: 'Prof. Sunita Rao',
            note: 'Initial mentoring diagnostic completed. Student committed to remedial schedule.'
          }
        ]
      };

      const normalized = normalizeIntervention(legacyDoc);
      assert.strictEqual(normalized.studentRegistrationNumber, '241FA04004');
      assert.strictEqual(normalized.studentRegNo, '241FA04004');
      assert.strictEqual(normalized.assignedFaculty, 'Prof. Sunita Rao');
      assert.strictEqual(normalized.assignedTo, 'Prof. Sunita Rao');
      assert.strictEqual(normalized.dueDate, '2025-06-15');
      assert.strictEqual(normalized.priority, 'High'); // Title Case
      assert.strictEqual(normalized.status, 'Pending');
      assert.ok(normalized.issue.includes('Remedial Classes'));
      assert.ok(normalized.actionPlan.includes('Initial mentoring diagnostic'));
    });

    test('normalizeIntervention detects identity conflict when legacy doc name contradicts directory', async () => {
      const { normalizeIntervention } = await import('../src/services/interventionService.js');
      const conflictingDoc = {
        _id: '6ac8bef7f4af36eee8a9293a',
        studentId: 'STU_241FA04003',
        studentRegNo: '241FA04003',
        studentName: 'Deepika Chopra',
        type: 'Coding Bootcamp',
        priority: 'High',
        status: 'Pending',
        assignedTo: 'Placement Head T. Sharma',
        targetDate: '2025-06-30',
        notes: 'Coding score is 37.8%. Enrolled in 30-day DSA bootcamp prior to recruitment season.'
      };

      const normalized = normalizeIntervention(conflictingDoc);
      assert.strictEqual(normalized.studentRegistrationNumber, '241FA04003');
      assert.strictEqual(normalized.studentName, 'Deepika Chopra');
      assert.strictEqual(normalized.hasIdentityConflict, true);
      assert.strictEqual(normalized.verifiedOwnerName, 'Janani Singh');
    });

    test('Regression: Deepika Chopra with conflicting registration number 241FA04003 cannot claim ownership', async () => {
      // Querying by unverified student name Deepika Chopra should NOT return interventions whose registration belongs to Janani Singh
      const res = await fetch(`${baseUrl}/api/interventions?student=Deepika%20Chopra`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      // Must hide interventions whose ownership cannot be verified
      assert.strictEqual(json.data.length, 0);
    });

    test('Regression: Janani Singh verified profile excludes legacy conflicting Deepika Chopra intervention', async () => {
      // Querying for verified student 241FA04003 must exclude the legacy Deepika Chopra record
      const res = await fetch(`${baseUrl}/api/interventions?student=241FA04003`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.status, 'success');
      // Janani Singh must not receive Deepika Chopra's intervention
      assert.ok(
        json.data.every((i) => i.studentName === 'Janani Singh'),
        'All interventions for 241FA04003 must belong to Janani Singh'
      );
      assert.ok(
        json.data.every((i) => i.studentName !== 'Deepika Chopra'),
        'Deepika Chopra intervention must not be returned for Janani Singh'
      );
    });

    test('Regression: Correct intervention filtering for verified student with legitimate intervention', async () => {
      // Create a legitimate intervention for Janani Singh (241FA04003)
      const futureDate = new Date(Date.now() + 10 * 86400000).toISOString();
      const createRes = await fetch(`${baseUrl}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRegistrationNumber: '241FA04003',
          issue: 'Mock interview technical articulation guidance needed',
          actionPlan: 'Schedule two alumni mock interview practice rounds',
          priority: 'Medium',
          assignedFaculty: 'Prof. Ramesh Rao',
          dueDate: futureDate
        })
      });
      assert.strictEqual(createRes.status, 201);
      const created = await createRes.json();
      assert.strictEqual(created.data.studentRegistrationNumber, '241FA04003');
      assert.strictEqual(created.data.studentName, 'Janani Singh');

      // Now query for 241FA04003: must return Janani Singh's newly created intervention and NOT Deepika Chopra
      const res = await fetch(`${baseUrl}/api/interventions?student=241FA04003`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((i) => i.studentName === 'Janani Singh'));
      assert.ok(json.data.some((i) => i.id === created.data.id || i.id === created.data._id));

      // Clean up the created test intervention
      const delId = created.data.id || created.data._id;
      await fetch(`${baseUrl}/api/interventions/${delId}`, { method: 'DELETE' });
    });

    test('Regression: Unverified profiles cannot receive another student interventions', async () => {
      // Querying for an unregistered student name
      const res = await fetch(`${baseUrl}/api/interventions?student=Unregistered%20Student%20X`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.data.length, 0);
    });
  });
});


