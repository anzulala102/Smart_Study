const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  supervisor: { type: String, trim: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }
}, { timestamps: true });
courseSchema.index({ code: 1, createdBy: 1 }, { unique: true });
module.exports = mongoose.model('Course', courseSchema);
