#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TOOL_DIR = 'C:/Users/trevo/.claude/projects/C--Users-trevo-nt-csr-training/b5b3d233-c356-4b41-b4c4-4ef623f75cca/tool-results';

function loadManifest(driveId) {
  for (const f of fs.readdirSync(TOOL_DIR)) {
    if (!f.endsWith('.txt')) continue;
    const full = path.join(TOOL_DIR, f);
    if (fs.statSync(full).size < 100000) continue;
    try {
      const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (obj.id === driveId) {
        const decoded = Buffer.from(obj.content, 'base64').toString('utf8');
        return JSON.parse(decoded);
      }
    } catch (_) {}
  }
  return null;
}

function summarize(manifest, label) {
  const arr = Array.isArray(manifest) ? manifest : Object.values(manifest);
  console.log(`\n=== ${label} (${arr.length} entries) ===`);
  const byCat = {};
  const byQuality = {};
  const trailerIds = new Set();
  let onApi = 0;
  for (const e of arr) {
    byCat[e.category] = (byCat[e.category] || 0) + 1;
    byQuality[e.quality] = (byQuality[e.quality] || 0) + 1;
    if (e.trailerID) trailerIds.add(e.trailerID);
    if (e.imageUrl && e.imageUrl.includes('api.neighborstrailer.com')) onApi++;
  }
  console.log('quality:', byQuality);
  console.log('on api.neighborstrailer.com:', onApi, '/', arr.length);
  console.log('unique trailerIDs:', trailerIds.size);
  console.log('categories:');
  for (const [k, v] of Object.entries(byCat).sort()) console.log(`  ${k}: ${v}`);
}

const big = loadManifest('1T_BXUXWIn8Yighh_p-TjKrtKIdtOCpJi');
const small = loadManifest('1UAB3IgONT9hfVn0MImHZRBoy-cRDDTX8');

if (big) summarize(big, 'manifest A (larger file)');
if (small) summarize(small, 'manifest B (smaller file)');
