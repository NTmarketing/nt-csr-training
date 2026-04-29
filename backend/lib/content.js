const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');

let cache = {
  modules: [],
  examQuestions: [],
  criticalFacts: [],
  kb: ''
};

function tryReadJson(file) {
  const p = path.join(CONTENT_DIR, file);
  try {
    if (!fs.existsSync(p)) {
      console.warn(`[content] ${file} not found at ${p} — serving empty data.`);
      return null;
    }
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[content] Failed to load ${file}: ${err.message}`);
    return null;
  }
}

function tryReadText(file) {
  const p = path.join(CONTENT_DIR, file);
  try {
    if (!fs.existsSync(p)) {
      console.warn(`[content] ${file} not found at ${p} — serving empty string.`);
      return '';
    }
    return fs.readFileSync(p, 'utf8');
  } catch (err) {
    console.warn(`[content] Failed to load ${file}: ${err.message}`);
    return '';
  }
}

function load() {
  const modulesJson = tryReadJson('modules.json');
  const examJson = tryReadJson('exam-questions.json');
  const factsJson = tryReadJson('critical-facts.json');
  const kbText = tryReadText('knowledge-base.txt');

  cache.modules = (modulesJson && Array.isArray(modulesJson.modules)) ? modulesJson.modules : [];
  cache.examQuestions = (examJson && Array.isArray(examJson.questions)) ? examJson.questions : [];
  cache.criticalFacts = (factsJson && Array.isArray(factsJson.facts)) ? factsJson.facts : [];
  cache.kb = kbText || '';
}

function getModules() {
  return cache.modules;
}

function getModule(id) {
  return cache.modules.find(m => m.id === id || String(m.number) === String(id)) || null;
}

function getExamQuestions() {
  return cache.examQuestions;
}

function getCriticalFacts() {
  return cache.criticalFacts;
}

function getKB() {
  return cache.kb;
}

function reload() {
  load();
}

load();

module.exports = {
  getModules,
  getModule,
  getExamQuestions,
  getCriticalFacts,
  getKB,
  reload
};
