const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:58726/');
  const email = 'admin@smartstudy.local';
  const password = 'Admin12345!';

  const existing = await Student.findOne({ email });
  if (existing) {
    existing.name = 'SmartStudy Administrator';
    existing.role = 'admin';
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log('Updated admin user');
  } else {
    await Student.create({
      name: 'SmartStudy Administrator',
      email,
      role: 'admin',
      passwordHash: await bcrypt.hash(password, 12)
    });
    console.log('Created admin user');
  }

  await mongoose.disconnect();
})();
