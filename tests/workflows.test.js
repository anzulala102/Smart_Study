const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let mongo;
let app;
let studentToken;
let otherStudentToken;
let adminToken;
let assignmentId;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'workflow-test-secret';
  await mongoose.connect(mongo.getUri());
  app = require('../server');

  const Student = require('../models/Student');
  const passwordHash = await bcrypt.hash('password123', 4);
  const [student, otherStudent, admin] = await Student.create([
    { name: 'Student One', email: 'one@workflow.test', passwordHash },
    { name: 'Student Two', email: 'two@workflow.test', passwordHash },
    { name: 'Administrator', email: 'admin@workflow.test', passwordHash, role: 'admin' }
  ]);
  studentToken = jwt.sign({ id: student.id }, process.env.JWT_SECRET);
  otherStudentToken = jwt.sign({ id: otherStudent.id }, process.env.JWT_SECRET);
  adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);

  const courseResponse = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ code: 'CSE201', name: 'Workflow Testing' });
  assert.equal(courseResponse.status, 201);

  const assignmentResponse = await request(app)
    .post('/api/assignments')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Verify submission and reminder flows',
      course: courseResponse.body._id,
      deadline: new Date(Date.now() + 86400000).toISOString()
    });
  assert.equal(assignmentResponse.status, 201);
  assignmentId = assignmentResponse.body._id;
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('health endpoint and student/admin dashboard assets are served', async () => {
  const health = await request(app).get('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'ok');

  const studentDashboard = await request(app).get('/');
  assert.equal(studentDashboard.status, 200);
  assert.match(studentDashboard.text, /id="submission-form"/);
  assert.match(studentDashboard.text, /id="reminder-form"/);

  const adminDashboard = await request(app).get('/admin.html');
  assert.equal(adminDashboard.status, 200);
  assert.match(adminDashboard.text, /Administrator dashboard/);

  const taskScript = await request(app).get('/js/tasks.js');
  assert.equal(taskScript.status, 200);
  assert.match(taskScript.text, /renderReminders/);
});

test('submission workflow validates input, records work, and completes assignment', async () => {
  const headers = { Authorization: `Bearer ${studentToken}` };
  const empty = await request(app)
    .post(`/api/assignments/${assignmentId}/submissions`)
    .set(headers)
    .send({});
  assert.equal(empty.status, 400);

  const invalidUrl = await request(app)
    .post(`/api/assignments/${assignmentId}/submissions`)
    .set(headers)
    .send({ fileUrl: 'javascript:alert(1)' });
  assert.equal(invalidUrl.status, 400);

  const submitted = await request(app)
    .post(`/api/assignments/${assignmentId}/submissions`)
    .set(headers)
    .send({ fileUrl: 'https://example.test/work.zip', text: 'Completed work' });
  assert.equal(submitted.status, 201);
  assert.equal(submitted.body.text, 'Completed work');
  assert.equal(submitted.body.fileUrl, 'https://example.test/work.zip');

  const assignments = await request(app).get('/api/assignments').set(headers);
  assert.equal(assignments.status, 200);
  assert.equal(assignments.body[0].status, 'Completed');
  assert.equal(assignments.body[0].progress, 100);

  const forbidden = await request(app)
    .get(`/api/assignments/${assignmentId}/submissions`)
    .set('Authorization', `Bearer ${otherStudentToken}`);
  assert.equal(forbidden.status, 404);
});

test('reminder workflow rejects past times, lists reminders, marks read, and deletes', async () => {
  const headers = { Authorization: `Bearer ${studentToken}` };
  const past = await request(app)
    .post('/api/reminders')
    .set(headers)
    .send({ assignment: assignmentId, remindAt: new Date(Date.now() - 60000).toISOString() });
  assert.equal(past.status, 400);

  const created = await request(app)
    .post('/api/reminders')
    .set(headers)
    .send({
      assignment: assignmentId,
      remindAt: new Date(Date.now() + 3600000).toISOString(),
      message: 'Review before submission'
    });
  assert.equal(created.status, 201);

  const listed = await request(app).get('/api/reminders').set(headers);
  assert.equal(listed.status, 200);
  assert.equal(listed.body[0].assignment.title, 'Verify submission and reminder flows');

  const markedRead = await request(app)
    .patch(`/api/reminders/${created.body._id}/read`)
    .set(headers);
  assert.equal(markedRead.status, 200);
  assert.ok(markedRead.body.readAt);

  const deleted = await request(app)
    .delete(`/api/reminders/${created.body._id}`)
    .set(headers);
  assert.equal(deleted.status, 200);
});

test('administrator can review assignments and completed status sets full progress', async () => {
  const reviewed = await request(app)
    .patch(`/api/admin/assignments/${assignmentId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Completed' });
  assert.equal(reviewed.status, 200);
  assert.equal(reviewed.body.progress, 100);

  const forbidden = await request(app)
    .get('/api/admin/assignments')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(forbidden.status, 403);
});
