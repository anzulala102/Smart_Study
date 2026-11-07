require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

const demoPassword = process.env.DEMO_STUDENT_PASSWORD || 'Student12345!';
const demoStudents = [
  {
    name: 'Avery Rahman',
    email: 'avery.rahman@demo.smartstudy.local',
    studentId: 'DEMO-1001',
    courses: [
      { code: 'CSE311', name: 'Web Programming Lab', supervisor: 'Dr. Nadia Karim' },
      { code: 'CSE321', name: 'Database Systems', supervisor: 'Dr. Farhan Ahmed' }
    ]
  },
  {
    name: 'Samira Chowdhury',
    email: 'samira.chowdhury@demo.smartstudy.local',
    studentId: 'DEMO-1002',
    courses: [
      { code: 'CSE311', name: 'Web Programming Lab', supervisor: 'Dr. Nadia Karim' },
      { code: 'CSE341', name: 'Software Engineering', supervisor: 'Dr. Imran Hossain' }
    ]
  },
  {
    name: 'Rafi Hasan',
    email: 'rafi.hasan@demo.smartstudy.local',
    studentId: 'DEMO-1003',
    courses: [
      { code: 'CSE321', name: 'Database Systems', supervisor: 'Dr. Farhan Ahmed' },
      { code: 'CSE341', name: 'Software Engineering', supervisor: 'Dr. Imran Hossain' }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartstudy');

  const adminEmail = 'admin@smartstudy.local';
  await Student.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: 'SmartStudy Administrator',
        email: adminEmail,
        role: 'admin',
        passwordHash: await bcrypt.hash('Admin12345!', 12)
      }
    },
    { upsert: true, new: true, runValidators: true }
  );
  console.log('Seeded admin: admin@smartstudy.local / Admin12345! (change immediately)');

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const dueDates = [5, 10, 16];
  for (const [index, demo] of demoStudents.entries()) {
    const student = await Student.findOneAndUpdate(
      { email: demo.email },
      {
        $set: {
          name: demo.name,
          email: demo.email,
          studentId: demo.studentId,
          role: 'student',
          passwordHash
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    for (const [courseIndex, courseData] of demo.courses.entries()) {
      const course = await Course.findOneAndUpdate(
        { code: courseData.code, createdBy: student.id },
        {
          $set: {
            ...courseData,
            createdBy: student.id
          },
          $addToSet: { students: student.id }
        },
        { upsert: true, new: true, runValidators: true }
      );

      const title = [
        'Build a responsive course dashboard',
        'Design and normalize a student database',
        'Prepare the project milestone report'
      ][(index + courseIndex) % 3];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + dueDates[(index + courseIndex) % dueDates.length]);
      deadline.setHours(23, 59, 0, 0);

      await Assignment.findOneAndUpdate(
        { student: student.id, course: course.id, title },
        {
          $set: {
            title,
            description: 'Demo assignment seeded for exploring the SmartStudy planner.',
            course: course.id,
            student: student.id,
            createdBy: student.id,
            deadline,
            priority: courseIndex === 0 ? 'High' : 'Medium',
            status: courseIndex === 0 ? 'In Progress' : 'Pending',
            progress: courseIndex === 0 ? 45 : 0
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`Seeded demo student ${student.email} (${demo.courses.length} courses, ${demo.courses.length} assignments)`);
  }
  console.log(`Demo student password: ${demoPassword} (development only; change before production)`);
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async error => {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
