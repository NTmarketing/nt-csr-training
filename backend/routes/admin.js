const express = require('express');
const bcrypt = require('bcrypt');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const { adminRequired } = require('../middleware/admin');
const content = require('../lib/content');

const router = express.Router();

router.use(authRequired, adminRequired);

function safeParseJson(v, fallback = null) {
  if (v == null) return fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

function moduleTitle(moduleId) {
  const m = content.getModule(moduleId);
  return m ? m.title : moduleId;
}

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
    db.prepare('DELETE FROM section_views WHERE user_id = ?').run(userId);
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

router.get('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();

  const user = db.prepare(
    'SELECT id, username, name, role, created_at FROM users WHERE id = ?'
  ).get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const progressRows = db.prepare(
    `SELECT module_id, status, quiz_score, started_at, completed_at
     FROM progress WHERE user_id = ?`
  ).all(userId);

  const completedCount = progressRows.filter(p => p.status === 'completed').length;
  const inProgressCount = progressRows.filter(p => p.status === 'in_progress').length;

  const totalTimeRow = db.prepare(
    `SELECT COALESCE(SUM(duration_seconds), 0) AS total
     FROM section_views WHERE user_id = ?`
  ).get(userId);

  const quizCount = db.prepare(
    'SELECT COUNT(*) AS c FROM quiz_attempts WHERE user_id = ?'
  ).get(userId).c;
  const scenarioCount = db.prepare(
    'SELECT COUNT(*) AS c FROM scenario_attempts WHERE user_id = ?'
  ).get(userId).c;

  const finalExamRow = db.prepare(
    `SELECT passed FROM final_exam_attempts
     WHERE user_id = ? ORDER BY id DESC LIMIT 1`
  ).get(userId);
  const final_exam_passed = finalExamRow ? !!finalExamRow.passed : null;

  const lastRow = db.prepare(`
    SELECT MAX(t) AS t FROM (
      SELECT MAX(viewed_at) AS t FROM section_views WHERE user_id = ?
      UNION ALL SELECT MAX(created_at) FROM quiz_attempts WHERE user_id = ?
      UNION ALL SELECT MAX(created_at) FROM scenario_attempts WHERE user_id = ?
      UNION ALL SELECT MAX(updated_at) FROM ai_conversations WHERE user_id = ?
      UNION ALL SELECT MAX(created_at) FROM final_exam_attempts WHERE user_id = ?
      UNION ALL SELECT MAX(COALESCE(completed_at, started_at)) FROM progress WHERE user_id = ?
    )
  `).get(userId, userId, userId, userId, userId, userId);

  const timeByModule = db.prepare(
    `SELECT module_id, COALESCE(SUM(duration_seconds), 0) AS time_seconds
     FROM section_views WHERE user_id = ? GROUP BY module_id`
  ).all(userId);
  const timeByModuleMap = {};
  for (const r of timeByModule) timeByModuleMap[r.module_id] = r.time_seconds;

  const allModules = content.getModules().slice().sort((a, b) => a.number - b.number);
  const progressByModule = {};
  for (const p of progressRows) progressByModule[p.module_id] = p;

  const module_progress = allModules.map(m => {
    const p = progressByModule[m.id];
    return {
      module_id: m.id,
      module_title: m.title,
      module_number: m.number,
      status: p ? p.status : 'available',
      quiz_score: p ? p.quiz_score : null,
      started_at: p ? p.started_at : null,
      completed_at: p ? p.completed_at : null,
      time_seconds: timeByModuleMap[m.id] || 0
    };
  });

  res.json({
    user,
    stats: {
      modules_completed: completedCount,
      modules_in_progress: inProgressCount,
      total_time_seconds: totalTimeRow.total || 0,
      quiz_attempts_total: quizCount,
      scenario_attempts_total: scenarioCount,
      final_exam_passed,
      last_activity_at: lastRow ? lastRow.t : null
    },
    module_progress
  });
});

router.get('/users/:id/activity', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const events = [];

  const sectionViews = db.prepare(
    `SELECT module_id, section_id, duration_seconds, viewed_at
     FROM section_views WHERE user_id = ?`
  ).all(userId);
  for (const v of sectionViews) {
    events.push({
      type: 'section_view',
      module_id: v.module_id,
      module_title: moduleTitle(v.module_id),
      section_id: v.section_id,
      duration_seconds: v.duration_seconds,
      viewed_at: v.viewed_at,
      timestamp: v.viewed_at
    });
  }

  const quizAttempts = db.prepare(
    `SELECT id, module_id, score, total, passed, answers_json, created_at
     FROM quiz_attempts WHERE user_id = ?`
  ).all(userId);
  for (const q of quizAttempts) {
    events.push({
      type: 'quiz_attempt',
      id: q.id,
      module_id: q.module_id,
      module_title: moduleTitle(q.module_id),
      score: q.score,
      total: q.total,
      passed: !!q.passed,
      answers: safeParseJson(q.answers_json, []),
      created_at: q.created_at,
      timestamp: q.created_at
    });
  }

  const scenarioAttempts = db.prepare(
    `SELECT id, module_id, scenario_id, transcript_json, grade_json, score, created_at
     FROM scenario_attempts WHERE user_id = ?`
  ).all(userId);
  for (const s of scenarioAttempts) {
    events.push({
      type: 'scenario_attempt',
      id: s.id,
      module_id: s.module_id,
      module_title: moduleTitle(s.module_id),
      scenario_id: s.scenario_id,
      score: s.score,
      transcript: safeParseJson(s.transcript_json, []),
      grade: safeParseJson(s.grade_json, null),
      created_at: s.created_at,
      timestamp: s.created_at
    });
  }

  const conversations = db.prepare(
    `SELECT id, module_id, mode, messages_json, created_at, updated_at
     FROM ai_conversations WHERE user_id = ?`
  ).all(userId);
  for (const c of conversations) {
    const messages = safeParseJson(c.messages_json, []);
    const last = Array.isArray(messages) && messages.length
      ? messages[messages.length - 1]
      : null;
    const preview = last && typeof last.content === 'string'
      ? last.content.slice(0, 140)
      : '';
    events.push({
      type: 'ai_conversation',
      id: c.id,
      module_id: c.module_id,
      module_title: c.module_id ? moduleTitle(c.module_id) : null,
      mode: c.mode,
      message_count: Array.isArray(messages) ? messages.length : 0,
      last_message_preview: preview,
      updated_at: c.updated_at,
      timestamp: c.updated_at || c.created_at
    });
  }

  const finalExams = db.prepare(
    `SELECT id, score, total, passed, created_at
     FROM final_exam_attempts WHERE user_id = ?`
  ).all(userId);
  for (const f of finalExams) {
    events.push({
      type: 'final_exam',
      id: f.id,
      score: f.score,
      total: f.total,
      passed: !!f.passed,
      created_at: f.created_at,
      timestamp: f.created_at
    });
  }

  events.sort((a, b) => {
    const ta = a.timestamp || '';
    const tb = b.timestamp || '';
    if (ta === tb) return 0;
    return ta < tb ? 1 : -1;
  });

  res.json(events);
});

router.get('/users/:id/conversations', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rows = db.prepare(
    `SELECT id, module_id, mode, messages_json, created_at, updated_at
     FROM ai_conversations WHERE user_id = ? ORDER BY id DESC`
  ).all(userId);

  res.json(rows.map(r => ({
    id: r.id,
    module_id: r.module_id,
    module_title: r.module_id ? moduleTitle(r.module_id) : null,
    mode: r.mode,
    messages: safeParseJson(r.messages_json, []),
    created_at: r.created_at,
    updated_at: r.updated_at
  })));
});

router.get('/users/:id/scenario-attempts', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rows = db.prepare(
    `SELECT id, module_id, scenario_id, transcript_json, grade_json, score, created_at
     FROM scenario_attempts WHERE user_id = ? ORDER BY id DESC`
  ).all(userId);

  res.json(rows.map(r => {
    const mod = content.getModule(r.module_id);
    const scenario = mod && Array.isArray(mod.scenarios)
      ? mod.scenarios.find(s => s.id === r.scenario_id) || null
      : null;
    return {
      id: r.id,
      module_id: r.module_id,
      module_title: mod ? mod.title : r.module_id,
      scenario_id: r.scenario_id,
      scenario_type: scenario ? scenario.type : null,
      scenario_prompt: scenario ? scenario.prompt : null,
      transcript: safeParseJson(r.transcript_json, []),
      grade: safeParseJson(r.grade_json, null),
      score: r.score,
      created_at: r.created_at
    };
  }));
});

router.get('/users/:id/quiz-attempts', (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user id' });
  const db = getDb();

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rows = db.prepare(
    `SELECT id, module_id, score, total, passed, answers_json, created_at
     FROM quiz_attempts WHERE user_id = ? ORDER BY id DESC`
  ).all(userId);

  res.json(rows.map(r => {
    const mod = content.getModule(r.module_id);
    const quiz = mod && Array.isArray(mod.quiz) ? mod.quiz : [];
    const submitted = safeParseJson(r.answers_json, []);
    const submittedById = {};
    for (const a of (Array.isArray(submitted) ? submitted : [])) {
      if (a && a.questionId != null) submittedById[a.questionId] = a.answer;
    }
    const questions = quiz.map(q => {
      const trainee_answer = submittedById[q.id];
      let correct = false;
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        correct = Number(trainee_answer) === Number(q.correct_index);
      }
      return {
        question_id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || null,
        correct_index: q.correct_index != null ? q.correct_index : null,
        correct_answer_text:
          q.options && q.correct_index != null ? q.options[q.correct_index] : null,
        explanation: q.explanation || '',
        trainee_answer: trainee_answer == null ? null : trainee_answer,
        correct
      };
    });
    return {
      id: r.id,
      module_id: r.module_id,
      module_title: mod ? mod.title : r.module_id,
      score: r.score,
      total: r.total,
      passed: !!r.passed,
      created_at: r.created_at,
      questions
    };
  }));
});

module.exports = router;
