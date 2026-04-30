#!/usr/bin/env node
// Strip the `tone` field from every scenario in modules.json and remove
// rubric items that are about tone/register. Expand rubrics that drop
// below 2 items.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FILE = path.join(ROOT, 'content', 'modules.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Exact-match strings to drop from any rubric.
const TONE_RUBRIC_STRIPS = new Set([
  'Casual, conversational tone — not a formal essay',
  'Brief — fits a text message',
  'Tone is casual and conversational, not a formal pitch',
  "Brief — wouldn't bore a friend at dinner",
  'Tone matches a casual workplace explanation',
  'Stays professional',
  'Reactive tone',
  'Confident, not flustered',
  'Stays warm',
]);

// Per-scenario rubric expansions when removal drops the count below 2.
const RUBRIC_EXPANSIONS = {
  'tb-scenario-1': [
    'Mentions the typical use case that drives the choice (e.g., utility for everyday hauls; flatbed for oversized or odd-shaped loads)',
    "Avoids jargon a non-trailer-person wouldn't recognize",
  ],
  'module-1-scenario-1': [
    'Acknowledges the Turo analogy and refines it accurately (same two-sided marketplace model)',
    "Mentions NT's role as facilitator (payments, verification, Protection Package, dispute resolution) — not just a directory",
  ],
};

let toneFieldsRemoved = 0;
let rubricItemsRemoved = 0;
let scenariosExpanded = 0;

for (const mod of data.modules) {
  for (const sc of mod.scenarios || []) {
    if ('tone' in sc) {
      delete sc.tone;
      toneFieldsRemoved++;
    }
    if (Array.isArray(sc.rubric)) {
      const before = sc.rubric.length;
      sc.rubric = sc.rubric.filter((r) => !TONE_RUBRIC_STRIPS.has(r));
      rubricItemsRemoved += before - sc.rubric.length;
      if (sc.rubric.length < 2 && RUBRIC_EXPANSIONS[sc.id]) {
        sc.rubric.push(...RUBRIC_EXPANSIONS[sc.id]);
        scenariosExpanded++;
      }
    }
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`tone fields removed: ${toneFieldsRemoved}`);
console.log(`rubric items removed: ${rubricItemsRemoved}`);
console.log(`scenarios expanded:  ${scenariosExpanded}`);

// Sanity report — show every scenario's final rubric count.
const undersized = [];
for (const mod of data.modules) {
  for (const sc of mod.scenarios || []) {
    if ((sc.rubric || []).length < 2) undersized.push(`${mod.id} ${sc.id} (${sc.rubric.length})`);
  }
}
if (undersized.length) {
  console.log('\nWARNING: scenarios with fewer than 2 rubric items:');
  for (const u of undersized) console.log('  ', u);
}
