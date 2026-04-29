const express = require('express');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const content = require('../lib/content');

const router = express.Router();

router.post('/:moduleId/submit', authRequired, (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { answers } = req.body || {};
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    const mod = content.getModule(moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    const quiz = mod.quiz || [];
    if (quiz.length === 0) {
      return res.status(400).json({ error: 'Module has no quiz' });
    }

    const answerByQ = {};
    for (const a of answers) {
      if (a && a.questionId != null) answerByQ[a.questionId] = a.answer;
    }

    let score = 0;
    const feedback = [];
    for (const q of quiz) {
      const submitted = answerByQ[q.id];
      let correct = false;
      if (q.type === 'multiple_choice') {
        correct = Number(submitted) === Number(q.correct_index);
      }
      if (correct) score += 1;
      feedback.push({
        questionId: q.id,
        correct,
        explanation: q.explanation || ''
      });
    }

    const total = quiz.length;
    const passingPct = mod.passing_score_percent || 70;
    const scorePct = Math.round((score / total) * 100);
    const passed = scorePct >= passingPct;

    const db = getDb();
    db.prepare(`INSERT INTO quiz_attempts (user_id, module_id, score, total, passed, answers_json)
                VALUES (?, ?, ?, ?, ?, ?)`).run(
      req.user.id, moduleId, score, total, passed ? 1 : 0, JSON.stringify(answers)
    );

    const existing = db.prepare('SELECT id, quiz_score, status FROM progress WHERE user_id = ? AND module_id = ?')
      .get(req.user.id, moduleId);
    const newBest = existing && existing.quiz_score != null
      ? Math.max(existing.quiz_score, scorePct)
      : scorePct;

    if (existing) {
      if (passed) {
        db.prepare(`UPDATE progress
                    SET quiz_score = ?,
                        status = 'completed',
                        completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
                    WHERE id = ?`).run(newBest, existing.id);
      } else {
        db.prepare(`UPDATE progress
                    SET quiz_score = ?,
                        status = CASE WHEN status = 'completed' THEN status ELSE 'in_progress' END,
                        started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
                    WHERE id = ?`).run(newBest, existing.id);
      }
    } else {
      db.prepare(`INSERT INTO progress (user_id, module_id, status, quiz_score, started_at, completed_at)
                  VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`).run(
        req.user.id,
        moduleId,
        passed ? 'completed' : 'in_progress',
        scorePct,
        passed ? new Date().toISOString() : null
      );
    }

    res.json({ score, total, passed, feedback });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
