const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/'
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const db = getDb();
    const user = db.prepare('SELECT id, username, password_hash, name, role FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, cookieOpts());
    res.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ ok: true });
});

router.get('/me', authRequired, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, name, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;
