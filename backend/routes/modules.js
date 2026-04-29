const express = require('express');

const { getDb } = require('../db/db');
const { authRequired } = require('../middleware/auth');
const content = require('../lib/content');

const router = express.Router();

function loadProgressMap(userId) {
  const db = getDb();
  const rows = db.prepare('SELECT module_id, status, quiz_score FROM progress WHERE user_id = ?').all(userId);
  const map = {};
  for (const r of rows) map[r.module_id] = r;
  return map;
}

function computeStatuses(modules, progressMap) {
  const sorted = [...modules].sort((a, b) => a.number - b.number);
  const statusById = {};

  for (let i = 0; i < sorted.length; i++) {
    const mod = sorted[i];
    const stored = progressMap[mod.id];
    const isFinal = mod.number === 11;

    let status;
    if (stored && stored.status === 'completed') {
      status = 'completed';
    } else if (stored && stored.status === 'in_progress') {
      status = 'in_progress';
    } else {
      let unlocked;
      if (isFinal) {
        unlocked = sorted
          .filter(m => m.number >= 1 && m.number <= 10)
          .every(m => progressMap[m.id] && progressMap[m.id].status === 'completed');
      } else if (mod.number === 1) {
        unlocked = true;
      } else {
        const prev = sorted.find(m => m.number === mod.number - 1);
        unlocked = !!(prev && progressMap[prev.id] && progressMap[prev.id].status === 'completed');
      }
      status = unlocked ? 'available' : 'locked';
    }

    statusById[mod.id] = {
      status,
      quiz_score: stored ? stored.quiz_score : null
    };
  }

  return statusById;
}

router.get('/', authRequired, (req, res) => {
  const modules = content.getModules();
  const progressMap = loadProgressMap(req.user.id);
  const statusById = computeStatuses(modules, progressMap);

  const result = modules
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(m => ({
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      estimated_minutes: m.estimated_minutes,
      status: statusById[m.id].status,
      quiz_score: statusById[m.id].quiz_score
    }));

  res.json(result);
});

router.get('/:id', authRequired, (req, res) => {
  const mod = content.getModule(req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  res.json({
    id: mod.id,
    number: mod.number,
    title: mod.title,
    description: mod.description,
    estimated_minutes: mod.estimated_minutes,
    learning_objectives: mod.learning_objectives || [],
    sections: mod.sections || [],
    scenarios: mod.scenarios || [],
    quiz: mod.quiz || [],
    passing_score_percent: mod.passing_score_percent || 70
  });
});

module.exports = router;
