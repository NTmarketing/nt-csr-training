const express = require('express');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const MAX_DURATION_SECONDS = 3600;

router.post('/view', authRequired, (req, res, next) => {
  try {
    const { moduleId, sectionId, durationSeconds } = req.body || {};
    if (typeof moduleId !== 'string' || !moduleId) {
      return res.status(400).json({ error: 'moduleId must be a string' });
    }
    if (typeof sectionId !== 'string' || !sectionId) {
      return res.status(400).json({ error: 'sectionId must be a string' });
    }
    const duration = Number(durationSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ error: 'durationSeconds must be a positive number' });
    }
    const capped = Math.min(Math.round(duration), MAX_DURATION_SECONDS);

    const db = getDb();
    db.prepare(
      `INSERT INTO section_views (user_id, module_id, section_id, duration_seconds)
       VALUES (?, ?, ?, ?)`
    ).run(req.user.id, moduleId, sectionId, capped);

    res.json({ ok: true, duration_seconds: capped });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
