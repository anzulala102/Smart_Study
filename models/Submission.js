const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fileUrl: { type: String, trim: true, maxlength: 2048 },
  text: { type: String, default: '', maxlength: 20000 },
  submittedAt: { type: Date, default: Date.now },
  feedback: { type: String, default: '' },
  grade: { type: Number, min: 0, max: 100 }
}, { timestamps: true });
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
module.exports = mongoose.model('Submission', submissionSchema);
