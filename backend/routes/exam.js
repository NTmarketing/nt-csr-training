const express = require('express');
const crypto = require('crypto');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const content = require('../lib/content');

const router = express.Router();

const EXAM_QUESTION_COUNT = 25;
const PASSING_PERCENT = 70;

const examCache = new Map();

function sample(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

router.post('/start', authRequired, (req, res) => {
  const pool = content.getExamQuestions();
  if (!Array.isArray(pool) || pool.length === 0) {
    return res.status(503).json({ error: 'Exam question pool not available yet' });
  }

  const picks = sample(pool, EXAM_QUESTION_COUNT);
  const examId = crypto.randomUUID();

  examCache.set(examId, {
    userId: req.user.id,
    questions: picks,
    createdAt: Date.now()
  });

  // Strip answer keys before returning to client.
  const clientQuestions = picks.map(q => ({
    id: q.id,
    module_ref: q.module_ref,
    question: q.question,
    type: q.type,
    options: q.options
  }));

  res.json({ examId, questions: clientQuestions });
});

router.post('/submit', authRequired, (req, res, next) => {
  try {
    const { examId, answers } = req.body || {};
    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'examId and answers[] required' });
    }
    const session = examCache.get(examId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Exam session not found' });
    }

    const answerByQ = {};
    for (const a of answers) {
      if (a && a.questionId != null) answerByQ[a.questionId] = a.answer;
    }

    let score = 0;
    const total = session.questions.length;
    const perModule = {};

    for (const q of session.questions) {
      const submitted = answerByQ[q.id];
      let correct = false;
      if (q.type === 'multiple_choice') {
        correct = Number(submitted) === Number(q.correct_index);
      }
      if (correct) score += 1;
      const key = q.module_ref || 'unknown';
      if (!perModule[key]) perModule[key] = { correct: 0, total: 0 };
      perModule[key].total += 1;
      if (correct) perModule[key].correct += 1;
    }

    const scorePct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = scorePct >= PASSING_PERCENT;
    const perModuleBreakdown = Object.entries(perModule).map(([module_ref, v]) => ({
      module_ref,
      correct: v.correct,
      total: v.total
    }));

    const db = getDb();
    db.prepare(`INSERT INTO final_exam_attempts
                (user_id, score, total, passed, answers_json, per_module_breakdown_json)
                VALUES (?, ?, ?, ?, ?, ?)`).run(
      req.user.id, score, total, passed ? 1 : 0,
      JSON.stringify(answers),
      JSON.stringify(perModuleBreakdown)
    );

    examCache.delete(examId);

    res.json({ score, total, passed, perModuleBreakdown });
  } catch (err) {
    next(err);
  }
});

router.get('/results', authRequired, (req, res) => {
  const db = getDb();
  const row = db.prepare(`SELECT id, score, total, passed, per_module_breakdown_json, created_at
                          FROM final_exam_attempts
                          WHERE user_id = ?
                          ORDER BY created_at DESC LIMIT 1`).get(req.user.id);
  if (!row) return res.status(404).json({ error: 'No exam attempts yet' });

  let perModuleBreakdown = [];
  try {
    perModuleBreakdown = JSON.parse(row.per_module_breakdown_json || '[]');
  } catch (_) {}

  res.json({
    id: row.id,
    score: row.score,
    total: row.total,
    passed: !!row.passed,
    perModuleBreakdown,
    created_at: row.created_at
  });
});

module.exports = router;
