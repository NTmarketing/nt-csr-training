const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');

let cache = {
  modules: [],
  examQuestions: [],
  criticalFacts: [],
  kb: '',
  kbEntries: []
};

// Tokens shorter than 3 chars or in this set are dropped from query/entry
// keyword bags. Kept tight so domain terms like "MVR", "NT", "Q&A" still
// match if longer; we lowercase before testing.
const STOPWORDS = new Set([
  'the','and','for','are','but','not','you','your','what','when','where','which','with','have','has',
  'how','why','who','this','that','these','those','from','into','about','will','was','were','been',
  'can','do','does','did','any','all','our','out','off','its','it','if','i','a','an','to','of','in',
  'on','at','as','is','be','or','my','me','we','us','they','them','their','his','her','him','she',
  'he','one','two','three','too','also','than','then','there','here','more','most','some','such',
  'should','would','could','want','need','get','got','make','let','take','give','said','say','same',
  'just','like','really','very','okay','please','thanks','thank','hi','hello','hey','dear'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

// Parse the KB text into structured entries.
//
// Format (per KB):
//   --- [Audience] [category] Q: <title>... ---
//   <body lines>
//   <blank line(s)>
//   --- [next marker] ---
//   ...
//
// Some markers use "IMPORTANT:" or other labels instead of "Q:". We capture
// the full header text after the audience/category brackets as the title.
function parseKB(raw) {
  if (typeof raw !== 'string' || !raw.length) return [];
  const lines = raw.split(/\r?\n/);
  const entries = [];
  const headerRe = /^---\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*?)\s*---\s*$/;
  let current = null;
  let bodyBuf = [];
  for (const line of lines) {
    const m = headerRe.exec(line);
    if (m) {
      if (current) {
        current.body = bodyBuf.join('\n').trim();
        // Pre-tokenize for fast keyword scoring.
        current.titleTokens = tokenize(current.title);
        current.bodyTokens = tokenize(current.body);
        current.text = `${current.title}\n${current.body}`;
        entries.push(current);
      }
      current = {
        audience: m[1].trim(),
        category: m[2].trim(),
        title: m[3].trim(),
      };
      bodyBuf = [];
    } else if (current) {
      bodyBuf.push(line);
    }
  }
  if (current) {
    current.body = bodyBuf.join('\n').trim();
    current.titleTokens = tokenize(current.title);
    current.bodyTokens = tokenize(current.body);
    current.text = `${current.title}\n${current.body}`;
    entries.push(current);
  }
  return entries;
}

// Score each entry against a free-text query (the trainee's message, optionally
// concatenated with the last assistant turn for follow-up context). Returns
// the top `limit` entries, sorted by score desc.
//
// Scoring rationale:
//   - Title-token match is weighted 4x body-token match — titles are the most
//     informative summary of an entry.
//   - Category match adds a flat bonus when the query mentions a category name.
//   - Each unique query token contributes once per entry (not multiplied by
//     repetition) so length-padded templates don't bubble up.
//   - Real Q&A entries (title begins "Q:") get a 1.5x final multiplier; pure
//     templates ("Template:") and other reference-only stubs are not excluded
//     but lose ground vs. substantive answers.
//   - REFERENCE-ONLY / AUTO-REPLY-OK markers get a small penalty (they exist
//     in the KB to show wording, not to teach policy).
function findRelevantKBEntries(query, { limit = 6 } = {}) {
  if (!query || !cache.kbEntries.length) return [];
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const qSet = new Set(qTokens);

  const scored = [];
  for (const e of cache.kbEntries) {
    const titleSet = new Set(e.titleTokens);
    const bodySet = new Set(e.bodyTokens);
    let score = 0;
    for (const t of qSet) {
      if (titleSet.has(t)) score += 4;
      else if (bodySet.has(t)) score += 1;
    }
    if (e.category && qSet.has(e.category.toLowerCase())) score += 3;

    // Boost real question entries.
    if (/^Q\s*:/i.test(e.title)) score *= 1.5;

    // De-emphasize template / reference-only / auto-reply markers.
    if (e.audience === 'REFERENCE-ONLY' || e.audience === 'AUTO-REPLY-OK') score *= 0.4;
    if (/^Template\s*:/i.test(e.title)) score *= 0.5;

    // Tiny tiebreaker: cross-cutting "Both" / "Policy" entries are useful when
    // trainees ask abstract policy questions.
    if (e.audience === 'Policy' || e.audience === 'Both') score += 0.2;

    if (score > 0) scored.push({ entry: e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

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
  cache.kbEntries = parseKB(cache.kb);
  if (cache.kbEntries.length) {
    console.log(`[content] KB loaded: ${cache.kb.length} bytes, ${cache.kbEntries.length} entries`);
  }
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

function getKBEntries() {
  return cache.kbEntries;
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
  getKBEntries,
  findRelevantKBEntries,
  reload
};
