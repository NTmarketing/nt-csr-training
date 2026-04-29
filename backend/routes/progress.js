const express = require('express');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const content = require('../lib/content');

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT module_id, status, quiz_score, started_at, completed_at FROM progress WHERE user_id = ?'
  ).all(req.user.id);
  res.json(rows);
});

router.post('/:moduleId/start', authRequired, (req, res) => {
  const { moduleId } = req.params;
  const mod = content.getModule(moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const db = getDb();
  const existing = db.prepare('SELECT id, status FROM progress WHERE user_id = ? AND module_id = ?')
    .get(req.user.id, moduleId);

  if (!existing) {
    db.prepare(`INSERT INTO progress (user_id, module_id, status, started_at)
                VALUES (?, ?, 'in_progress', CURRENT_TIMESTAMP)`).run(req.user.id, moduleId);
  } else if (existing.status !== 'completed') {
    db.prepare(`UPDATE progress
                SET status = 'in_progress',
                    started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
                WHERE id = ?`).run(existing.id);
  }

  const row = db.prepare('SELECT module_id, status, quiz_score FROM progress WHERE user_id = ? AND module_id = ?')
    .get(req.user.id, moduleId);
  res.json(row);
});

router.post('/:moduleId/complete', authRequired, (req, res) => {
  const { moduleId } = req.params;
  const mod = content.getModule(moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const db = getDb();
  const existing = db.prepare('SELECT id, quiz_score FROM progress WHERE user_id = ? AND module_id = ?')
    .get(req.user.id, moduleId);

  const passing = mod.passing_score_percent || 70;
  const hasPassingQuiz = existing && existing.quiz_score != null && existing.quiz_score >= passing;
  if (!hasPassingQuiz) {
    return res.status(400).json({ error: 'Module quiz must be passed (>=70%) before completion' });
  }

  if (existing) {
    db.prepare(`UPDATE progress
                SET status = 'completed',
                    completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
                WHERE id = ?`).run(existing.id);
  } else {
    db.prepare(`INSERT INTO progress (user_id, module_id, status, completed_at)
                VALUES (?, ?, 'completed', CURRENT_TIMESTAMP)`).run(req.user.id, moduleId);
  }

  const row = db.prepare('SELECT module_id, status, quiz_score FROM progress WHERE user_id = ? AND module_id = ?')
    .get(req.user.id, moduleId);
  res.json(row);
});

module.exports = router;
