const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:58726/');
  const email = 'admin@smartstudy.local';
  const user = await Student.findOne({ email });

  console.log(JSON.stringify({
    exists: !!user,
    name: user && user.name,
    role: user && user.role,
    email: user && user.email,
    passwordMatch: user ? await bcrypt.compare('Admin12345!', user.passwordHash) : false
  }, null, 2));

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
