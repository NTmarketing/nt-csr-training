const express = require('express');
const bcrypt = require('bcrypt');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const { adminRequired } = require('../middleware/admin');

const router = express.Router();

router.use(authRequired, adminRequired);

router.get('/users', (req, res) => {
  const db = getDb();
  const users = db.prepare(`SELECT id, username, name, role, created_at FROM users ORDER BY id ASC`).all();
  const summary = db.prepare(`
    SELECT user_id,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
           COUNT(*) AS touched
    FROM progress GROUP BY user_id
  `).all();
  const byUser = {};
  for (const s of summary) byUser[s.user_id] = s;

  res.json(users.map(u => ({
    ...u,
    progress: {
      modules_completed: byUser[u.id] ? byUser[u.id].completed : 0,
      modules_touched: byUser[u.id] ? byUser[u.id].touched : 0
    }
  })));
});

router.post('/users', async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body || {};
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'username, password, name required' });
    }
    const finalRole = role === 'admin' ? 'admin' : 'trainee';
    const hash = await bcrypt.hash(password, 12);
    const db = getDb();
    try {
      const info = db.prepare(`INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)`)
        .run(username, hash, name, finalRole);
      const user = db.prepare('SELECT id, username, name, role, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json({ user });
    } catch (err) {
      if (err && /UNIQUE constraint failed/.test(err.message)) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/reset', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM progress WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM quiz_attempts WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM scenario_attempts WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM ai_conversations WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM final_exam_attempts WHERE user_id = ?').run(userId);
  });
  tx();

  res.json({ ok: true });
});

router.delete('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const db = getDb();
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  if (info.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
});

module.exports = router;
