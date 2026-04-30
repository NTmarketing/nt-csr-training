#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TOOL_DIR = 'C:/Users/trevo/.claude/projects/C--Users-trevo-nt-csr-training/b5b3d233-c356-4b41-b4c4-4ef623f75cca/tool-results';

function loadByTitle(title) {
  for (const f of fs.readdirSync(TOOL_DIR)) {
    if (!f.endsWith('.txt')) continue;
    const full = path.join(TOOL_DIR, f);
    if (fs.statSync(full).size < 1000) continue;
    try {
      const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (obj.title === title && obj.mimeType === 'application/json') {
        return { obj, full };
      }
    } catch (_) {}
  }
  return null;
}

const manifests = [];
for (const f of fs.readdirSync(TOOL_DIR)) {
  if (!f.endsWith('.txt')) continue;
  const full = path.join(TOOL_DIR, f);
  if (fs.statSync(full).size < 100000) continue;
  try {
    const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (obj.title === 'manifest.json' && obj.mimeType === 'application/json') {
      const decoded = Buffer.from(obj.content, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      manifests.push({ id: obj.id, file: full, decodedLen: decoded.length, data: parsed });
    }
  } catch (_) {}
}

console.log('found manifests:', manifests.length);
for (const m of manifests) {
  console.log('---');
  console.log('drive id:', m.id);
  console.log('decoded length:', m.decodedLen);
  console.log('top-level keys:', Object.keys(m.data));
  const arr = Array.isArray(m.data) ? m.data : (m.data.entries || m.data.items || m.data.images || m.data.files || m.data.records || []);
  console.log('entries (auto-detected):', arr.length);
  if (arr.length) {
    const sample = arr[0];
    console.log('sample entry keys:', Object.keys(sample));
    if (sample.imageUrl) console.log('sample imageUrl:', sample.imageUrl);
    if (sample.fileSizeBytes !== undefined) console.log('sample fileSizeBytes:', sample.fileSizeBytes);
    if (sample.quality) console.log('sample quality:', sample.quality);
  }
}
