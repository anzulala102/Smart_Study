const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET || 'development-only-secret', { expiresIn: '7d' });
router.post('/register', async (req, res, next) => { try {
  const { name, email, password, studentId } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and password (8+ characters) are required' });
  const exists = await Student.findOne({ email: email.toLowerCase() }); if (exists) return res.status(409).json({ error: 'Email already registered' });
  const user = await Student.create({ name, email, studentId, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
} catch (e) { next(e); } });
router.post('/login', async (req, res, next) => { try {
  const user = await Student.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user || !await bcrypt.compare(req.body.password || '', user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
} catch (e) { next(e); } });
router.get('/me', protect, (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, studentId: req.user.studentId } }));
router.patch('/me', protect, async (req, res, next) => { try {
  const { name, studentId } = req.body || {};
  if (name && typeof name === 'string' && name.trim()) req.user.name = name.trim();
  if (studentId !== undefined) req.user.studentId = studentId || '';
  await req.user.save();
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, studentId: req.user.studentId } });
} catch (e) { next(e); } });
module.exports = router;
