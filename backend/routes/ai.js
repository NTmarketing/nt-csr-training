const express = require('express');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const content = require('../lib/content');
const ai = require('../lib/anthropic');

const router = express.Router();

function findScenario(mod, scenarioId) {
  if (!mod || !Array.isArray(mod.scenarios)) return null;
  return mod.scenarios.find(s => s.id === scenarioId) || null;
}

function loadTutorConversation(db, userId, moduleId) {
  if (!moduleId) return null;
  return db.prepare(
    `SELECT id, messages_json, created_at, updated_at FROM ai_conversations
     WHERE user_id = ? AND module_id = ? AND mode = 'tutor'
     ORDER BY id DESC LIMIT 1`
  ).get(userId, moduleId);
}

router.post('/tutor', authRequired, async (req, res, next) => {
  try {
    const { moduleId, message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    if (!moduleId) return res.status(400).json({ error: 'moduleId required' });
    const mod = content.getModule(moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    const db = getDb();
    const existing = loadTutorConversation(db, req.user.id, moduleId);
    let history = [];
    if (existing) {
      try {
        const parsed = JSON.parse(existing.messages_json);
        if (Array.isArray(parsed)) history = parsed;
      } catch (_) {}
    }

    // Pick the most relevant KB entries for this turn. Use the new user
    // message + the last assistant turn (if any) as the search query so
    // follow-ups like "and how does that work for owners?" still hit.
    const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant');
    const searchQuery = lastAssistant
      ? `${message}\n${lastAssistant.content}`
      : message;
    const kbEntries = content.findRelevantKBEntries(searchQuery, { limit: 6 });

    const reply = await ai.tutorChat(mod, kbEntries, message, history);
    const newHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    ];

    let conversationId;
    if (existing) {
      db.prepare(`UPDATE ai_conversations
                  SET messages_json = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`).run(JSON.stringify(newHistory), existing.id);
      conversationId = existing.id;
    } else {
      const info = db.prepare(`INSERT INTO ai_conversations (user_id, module_id, mode, messages_json)
                  VALUES (?, ?, 'tutor', ?)`).run(req.user.id, moduleId, JSON.stringify(newHistory));
      conversationId = info.lastInsertRowid;
    }

    res.json({ id: conversationId, message: reply, messages: newHistory });
  } catch (err) {
    next(err);
  }
});

router.get('/conversation/:moduleId', authRequired, (req, res) => {
  const { moduleId } = req.params;
  const db = getDb();
  const row = loadTutorConversation(db, req.user.id, moduleId);
  if (!row) return res.json(null);
  let messages = [];
  try {
    const parsed = JSON.parse(row.messages_json);
    if (Array.isArray(parsed)) messages = parsed;
  } catch (_) {}
  res.json({
    id: row.id,
    messages,
    created_at: row.created_at,
    updated_at: row.updated_at
  });
});

router.delete('/conversation/:moduleId', authRequired, (req, res) => {
  const { moduleId } = req.params;
  const db = getDb();
  db.prepare(
    `DELETE FROM ai_conversations
     WHERE user_id = ? AND module_id = ? AND mode = 'tutor'`
  ).run(req.user.id, moduleId);
  res.json({ ok: true });
});

router.post('/grade-response', authRequired, async (req, res, next) => {
  try {
    const { moduleId, scenarioId, response } = req.body || {};
    if (!moduleId || !scenarioId || typeof response !== 'string') {
      return res.status(400).json({ error: 'moduleId, scenarioId, response required' });
    }
    const mod = content.getModule(moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    const scenario = findScenario(mod, scenarioId);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const grade = await ai.gradeResponse(scenario, scenario.rubric || [], response);

    try {
      const db = getDb();
      db.prepare(`INSERT INTO scenario_attempts
                  (user_id, module_id, scenario_id, transcript_json, grade_json, score)
                  VALUES (?, ?, ?, ?, ?, ?)`).run(
        req.user.id, moduleId, scenarioId,
        JSON.stringify([{ role: 'user', content: response }]),
        JSON.stringify(grade),
        Number.isFinite(grade.score) ? grade.score : null
      );
    } catch (_) {}

    res.json(grade);
  } catch (err) {
    next(err);
  }
});

router.post('/roleplay', authRequired, async (req, res, next) => {
  try {
    const { moduleId, scenarioId, message, history } = req.body || {};
    if (!moduleId || !scenarioId || typeof message !== 'string') {
      return res.status(400).json({ error: 'moduleId, scenarioId, message required' });
    }
    const mod = content.getModule(moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    const scenario = findScenario(mod, scenarioId);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const reply = await ai.roleplayCustomer(
      scenario,
      scenario.customer_persona,
      message,
      history || []
    );

    const newHistory = [
      ...(history || []),
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    ];

    res.json({ message: reply, history: newHistory });
  } catch (err) {
    next(err);
  }
});

router.post('/grade-roleplay', authRequired, async (req, res, next) => {
  try {
    const { moduleId, scenarioId, transcript } = req.body || {};
    if (!moduleId || !scenarioId || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'moduleId, scenarioId, transcript[] required' });
    }
    const mod = content.getModule(moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    const scenario = findScenario(mod, scenarioId);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const grade = await ai.gradeRoleplay(scenario, transcript, scenario.rubric || []);

    try {
      const db = getDb();
      db.prepare(`INSERT INTO scenario_attempts
                  (user_id, module_id, scenario_id, transcript_json, grade_json, score)
                  VALUES (?, ?, ?, ?, ?, ?)`).run(
        req.user.id, moduleId, scenarioId,
        JSON.stringify(transcript),
        JSON.stringify(grade),
        Number.isFinite(grade.score) ? grade.score : null
      );
    } catch (_) {}

    res.json(grade);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
