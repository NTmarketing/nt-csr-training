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

router.post('/tutor', authRequired, async (req, res, next) => {
  try {
    const { moduleId, message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    const mod = moduleId ? content.getModule(moduleId) : null;
    const kb = content.getKB();

    const reply = await ai.tutorChat(mod, kb, message, history || []);
    const newHistory = [
      ...(history || []),
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    ];

    try {
      const db = getDb();
      db.prepare(`INSERT INTO ai_conversations (user_id, module_id, mode, messages_json)
                  VALUES (?, ?, 'tutor', ?)`).run(req.user.id, moduleId || null, JSON.stringify(newHistory));
    } catch (_) {}

    res.json({ message: reply, history: newHistory });
  } catch (err) {
    next(err);
  }
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
