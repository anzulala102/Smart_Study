const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
exports.protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
    req.user = await Student.findById(payload.id).select('-passwordHash');
    if (!req.user) return res.status(401).json({ error: 'Account not found' });
    next();
  } catch (_e) { res.status(401).json({ error: 'Invalid or expired token' }); }
};
exports.adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access required' });
