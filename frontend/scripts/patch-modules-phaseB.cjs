#!/usr/bin/env node
// Apply Phase B media-block edits to modules.json:
//   - tb-section-1: lifecycle SVG
//   - tb-section-2: 8 trailer-type galleries built from picked-images.json
//   - old module-7 section-7-1: refund-timeline SVG
// Idempotent.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const modulesPath = path.join(ROOT, 'content', 'modules.json');
const pickedPath = path.join(ROOT, 'content', 'picked-images.json');

const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
const picked = JSON.parse(fs.readFileSync(pickedPath, 'utf8'));

const tb = modules.modules.find((m) => m.id === 'module-trailer-basics');
if (!tb) throw new Error('module-trailer-basics not found');

const tb1 = tb.sections.find((s) => s.id === 'tb-section-1');
const tb2 = tb.sections.find((s) => s.id === 'tb-section-2');
if (!tb1 || !tb2) throw new Error('tb-section-1 or tb-section-2 not found');

tb1.media = [
  {
    type: 'svg',
    svg: '$BOOKING_LIFECYCLE',
    caption: 'The Neighbors Trailer booking lifecycle',
  },
];

const galleries = [];
for (const cat of picked.categories) {
  if (cat.droppedEntirely || !cat.picks.length) continue;
  galleries.push({
    type: 'gallery',
    columns: 2,
    images: cat.picks.map((p) => ({
      src: p.imageUrl,
      alt: `${cat.label} trailer`,
      caption: cat.label,
    })),
  });
}
tb2.media = galleries;

const m7 = modules.modules.find((m) => m.id === 'module-7');
if (!m7) throw new Error('module-7 not found');
const m7s1 = m7.sections.find((s) => s.id === 'section-7-1');
if (!m7s1) throw new Error('section-7-1 not found');
m7s1.media = [
  {
    type: 'svg',
    svg: '$CANCELLATION_REFUND_TIMELINE',
    caption: 'Cancellation refund schedule',
  },
];

fs.writeFileSync(modulesPath, JSON.stringify(modules, null, 2) + '\n', 'utf8');

console.log('patched modules.json');
console.log('  tb-section-1 media blocks:', tb1.media.length);
console.log('  tb-section-2 galleries:', galleries.length);
let imgTotal = 0;
for (const g of galleries) {
  imgTotal += g.images.length;
  console.log(`    ${g.images[0].caption} -> ${g.images.length} images`);
}
console.log('  total trailer-type images:', imgTotal);
console.log('  module-7/section-7-1 media blocks:', m7s1.media.length);
