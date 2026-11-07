const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
let mongo, app, studentToken, adminToken, courseId, assignmentId, studentId;
before(async()=>{mongo=await MongoMemoryServer.create();process.env.MONGODB_URI=mongo.getUri();process.env.JWT_SECRET='test-secret';await mongoose.connect(mongo.getUri());app=require('../server');const Student=require('../models/Student');const bcrypt=require('bcryptjs');const admin=await Student.create({name:'Admin',email:'admin@test.dev',passwordHash:await bcrypt.hash('password123',4),role:'admin'});adminToken=require('jsonwebtoken').sign({id:admin.id},process.env.JWT_SECRET);});
after(async()=>{await mongoose.disconnect();await mongo.stop();});
test('student can register, create course/assignment, update progress and schedule reminder',async()=>{
 const reg=await request(app).post('/api/auth/register').send({name:'Test Student',email:'student@test.dev',password:'password123',studentId:'S-100'});assert.equal(reg.status,201);studentToken=reg.body.token;studentId=reg.body.user.id;
 const c=await request(app).post('/api/courses').set('Authorization',`Bearer ${studentToken}`).send({code:'CSE101',name:'Web Programming'});assert.equal(c.status,201);courseId=c.body._id;
 const a=await request(app).post('/api/assignments').set('Authorization',`Bearer ${studentToken}`).send({title:'Build API',course:courseId,deadline:new Date(Date.now()+86400000).toISOString(),priority:'High'});assert.equal(a.status,201);assignmentId=a.body._id;
 const update=await request(app).patch(`/api/assignments/${assignmentId}`).set('Authorization',`Bearer ${studentToken}`).send({status:'In Progress',progress:60});assert.equal(update.status,200);assert.equal(update.body.progress,60);
 const reminder=await request(app).post('/api/reminders').set('Authorization',`Bearer ${studentToken}`).send({assignment:assignmentId,remindAt:new Date(Date.now()+3600000).toISOString()});assert.equal(reminder.status,201);
 const list=await request(app).get('/api/assignments').set('Authorization',`Bearer ${studentToken}`);assert.equal(list.body.length,1);
});
test('administrator endpoints reject students and provide overview to admin',async()=>{
 const denied=await request(app).get('/api/admin/overview').set('Authorization',`Bearer ${studentToken}`);assert.equal(denied.status,403);
 const ok=await request(app).get('/api/admin/overview').set('Authorization',`Bearer ${adminToken}`);assert.equal(ok.status,200);assert.equal(ok.body.students,1);assert.equal(ok.body.assignments,1);
 const students=await request(app).get('/api/admin/students').set('Authorization',`Bearer ${adminToken}`);assert.equal(students.status,200);assert.equal(students.body[0].studentId,'S-100');
});
