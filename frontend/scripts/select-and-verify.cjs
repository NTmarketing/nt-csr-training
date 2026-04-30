#!/usr/bin/env node
// Pick TARGET_PER_CAT listings per category from the manifest, HEAD-check
// each imageUrl, and emit a JSON report at content/picked-images.json.
//
// Selection strategy (for visual diversity):
//   - category field must exactly match the target trailer type
//   - rank candidates by fileSizeBytes desc, dedup by trailerID
//   - pick at *spread* anchor positions across the ranked pool (top + mid-pool)
//     so the two photos aren't always the two largest files (which tend to
//     come from the same listing/shoot). Different trailerIDs is the strongest
//     diversity signal we can enforce without visual review.
//   - HEAD-check each pick. Walk forward from the anchor on failure, EXCEPT
//     for motorcycle which keeps whatever passes (drops failures, no replacement).
//   - if motorcycle ends up at 0, drop the gallery entirely.

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'listing-manifest.json'), 'utf8'));

// Lesson-prose order. label = caption text.
const CATEGORIES = [
  { key: 'utility',     label: 'Utility',     match: 'Utility Trailer Rentals' },
  { key: 'enclosed',    label: 'Enclosed',    match: 'Enclosed Trailer Rentals' },
  { key: 'car-hauler',  label: 'Car Hauler',  match: 'Car Hauler Trailer Rentals' },
  { key: 'flatbed',     label: 'Flatbed',     match: 'Flatbed Trailer Rentals' },
  { key: 'dump',        label: 'Dump',        match: 'Dump Trailer Rentals' },
  { key: 'horse',       label: 'Horse',       match: 'Horse Trailer Rentals' },
  { key: 'boat',        label: 'Boat',        match: 'Boat Trailer Rentals' },
  { key: 'motorcycle',  label: 'Motorcycle',  match: 'Motorcycle Trailer Rentals' },
];

const TARGET_PER_CAT = 2;

const allEntries = Array.isArray(manifest) ? manifest : Object.values(manifest);

function rankCandidates(matchCat) {
  const seen = new Set();
  return allEntries
    .filter((e) => e.category === matchCat && typeof e.imageUrl === 'string' && e.imageUrl.includes('api.neighborstrailer.com'))
    .sort((a, b) => (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0))
    .filter((e) => {
      if (seen.has(e.trailerID)) return false;
      seen.add(e.trailerID);
      return true;
    });
}

// Anchor positions for TARGET_PER_CAT picks across a pool of size n.
// For TARGET=2 with a healthy pool: index 0 and ~40% in. For tiny pools,
// space evenly.
function anchorIndexes(n, target) {
  if (target >= n) return [...Array(n).keys()];
  if (target === 1) return [0];
  const idx = [];
  for (let i = 0; i < target; i++) {
    idx.push(Math.floor((i * n) / target));
  }
  return Array.from(new Set(idx));
}

function head(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.request(url, { method: 'HEAD', timeout: timeoutMs }, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      const ct = res.headers['content-type'] || '';
      resolve({ url, status: res.statusCode, ok, contentType: ct, isImage: ct.startsWith('image/') });
      res.resume();
    });
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }); });
    req.on('error', (e) => resolve({ url, status: 0, ok: false, error: e.message }));
    req.end();
  });
}

async function pickWithReplacement(candidates, anchor, used, failures) {
  // Walk forward from anchor (and wrap if needed) until a passing,
  // not-yet-used candidate is found. Returns { entry, ok }.
  const n = candidates.length;
  for (let off = 0; off < n; off++) {
    const i = (anchor + off) % n;
    if (used.has(i)) continue;
    const c = candidates[i];
    const r = await head(c.imageUrl);
    if (r.ok && r.isImage) {
      used.add(i);
      return { entry: c };
    }
    failures.push({ entry: c, ...r });
    console.log(`  FAIL idx=${i} ${c.trailerID} ${c.imageUrl} status=${r.status} err=${r.error || ''}`);
  }
  return null;
}

async function pickForCategory(cat) {
  const candidates = rankCandidates(cat.match);
  console.log(`\n[${cat.key}] ${candidates.length} clean candidates`);

  const anchors = anchorIndexes(candidates.length, TARGET_PER_CAT);
  console.log(`  anchors: [${anchors.join(', ')}]`);

  if (cat.key === 'motorcycle') {
    // No replacement: HEAD-check the anchor positions only, drop failures.
    const failures = [];
    const picks = [];
    for (const a of anchors) {
      const c = candidates[a];
      const r = await head(c.imageUrl);
      if (r.ok && r.isImage) picks.push(c);
      else {
        failures.push({ entry: c, ...r });
        console.log(`  FAIL idx=${a} ${c.trailerID} ${c.imageUrl} status=${r.status} err=${r.error || ''}`);
      }
    }
    if (picks.length === 0) {
      console.log(`  -> 0 passing — DROPPING gallery entirely`);
      return { cat, picks: [], dropped: true, failures };
    }
    console.log(`  -> ${picks.length} passing motorcycle entries`);
    return { cat, picks, failures };
  }

  // Other categories: each anchor picks one slot, with replacement walk-forward
  // on failure. Distinct used-set ensures no double-pick.
  const used = new Set();
  const failures = [];
  const picks = [];
  for (const a of anchors) {
    const got = await pickWithReplacement(candidates, a, used, failures);
    if (got) picks.push(got.entry);
  }
  console.log(`  -> ${picks.length}/${TARGET_PER_CAT} picked, ${failures.length} failures`);
  return { cat, picks, failures };
}

(async () => {
  const out = { generatedAt: new Date().toISOString(), categories: [] };
  let totalImages = 0;
  let totalFailures = 0;

  for (const cat of CATEGORIES) {
    const result = await pickForCategory(cat);
    totalImages += result.picks.length;
    totalFailures += result.failures.length;
    out.categories.push({
      key: cat.key,
      label: cat.label,
      droppedEntirely: !!result.dropped,
      picks: result.picks.map((p) => ({
        trailerID: p.trailerID,
        imageUrl: p.imageUrl,
        fileSizeBytes: p.fileSizeBytes,
      })),
      failures: result.failures.map((f) => ({
        trailerID: f.entry.trailerID,
        imageUrl: f.url,
        status: f.status,
        error: f.error || '',
      })),
    });
  }

  fs.writeFileSync(
    path.join(ROOT, 'content', 'picked-images.json'),
    JSON.stringify(out, null, 2) + '\n',
    'utf8',
  );

  console.log(`\n=== TOTAL: ${totalImages} images, ${totalFailures} failures across all categories ===`);
  if (totalFailures / Math.max(1, totalImages + totalFailures) > 0.2) {
    console.log('!!! Failure rate >20% — halt and report');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
