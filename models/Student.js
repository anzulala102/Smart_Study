const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  studentId: { type: String, trim: true }
}, { timestamps: true });
module.exports = mongoose.model('Student', studentSchema);
