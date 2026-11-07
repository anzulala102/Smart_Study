const mongoose = require('mongoose');
const reminderSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  remindAt: { type: Date, required: true },
  channel: { type: String, enum: ['in-app'], default: 'in-app' },
  message: { type: String, default: 'Assignment deadline approaching' },
  sentAt: { type: Date, default: null },
  readAt: { type: Date, default: null }
}, { timestamps: true });
reminderSchema.index({ remindAt: 1, sentAt: 1 });
module.exports = mongoose.model('Reminder', reminderSchema);
