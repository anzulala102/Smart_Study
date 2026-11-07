const mongoose = require('mongoose');
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  progress: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });
assignmentSchema.index({ student: 1, deadline: 1 });
module.exports = mongoose.model('Assignment', assignmentSchema);
