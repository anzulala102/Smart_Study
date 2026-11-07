require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { startReminderWorker } = require('./services/reminderWorker');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const reminderRoutes = require('./routes/reminders');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SmartStudy API' }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.static(path.join(__dirname)));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartstudy')
    .then(() => { console.log('MongoDB connected'); startReminderWorker(); const port = process.env.PORT || 3000; app.listen(port, () => console.log(`SmartStudy running at http://localhost:${port}`)); })
    .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
}
module.exports = app;
