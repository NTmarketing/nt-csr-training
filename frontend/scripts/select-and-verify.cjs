#!/usr/bin/env node
// Pick 6 listings per category from the manifest, HEAD-check each
// imageUrl, and emit a JSON report at content/picked-images.json.
//
// Selection rules:
//   - category field must exactly match the target trailer type
//   - prefer larger fileSizeBytes
//   - spread across trailerIDs (one image per trailer)
//   - replace failures with next-best, EXCEPT for motorcycle which
//     keeps whatever passes (drops failures, no replacement)
//   - if motorcycle ends up < 3, drop it entirely

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

const TARGET_PER_CAT = 6;
const MIN_MOTORCYCLE = 3;

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

async function pickForCategory(cat) {
  const candidates = rankCandidates(cat.match);
  console.log(`\n[${cat.key}] ${candidates.length} clean candidates`);

  if (cat.key === 'motorcycle') {
    // No replacement: take top 6, head-check, drop failures, no fallback.
    const picks = candidates.slice(0, TARGET_PER_CAT);
    const results = await Promise.all(picks.map((p) => head(p.imageUrl).then((r) => ({ entry: p, ...r }))));
    const passing = results.filter((r) => r.ok && r.isImage);
    const failing = results.filter((r) => !(r.ok && r.isImage));
    for (const f of failing) console.log(`  FAIL ${f.entry.trailerID} ${f.url} status=${f.status} ct=${f.contentType || ''} err=${f.error || ''}`);
    if (passing.length < MIN_MOTORCYCLE) {
      console.log(`  -> only ${passing.length} passed; below threshold (${MIN_MOTORCYCLE}) — DROPPING gallery entirely`);
      return { cat, picks: [], dropped: true, failures: failing };
    }
    console.log(`  -> ${passing.length} passing motorcycle entries`);
    return { cat, picks: passing.map((r) => r.entry), failures: failing };
  }

  // For other categories: walk the ranked list until we have 6 passing.
  const picks = [];
  const failures = [];
  let i = 0;
  while (picks.length < TARGET_PER_CAT && i < candidates.length) {
    const c = candidates[i++];
    const r = await head(c.imageUrl);
    if (r.ok && r.isImage) {
      picks.push(c);
    } else {
      failures.push({ entry: c, ...r });
      console.log(`  FAIL ${c.trailerID} ${c.imageUrl} status=${r.status} err=${r.error || ''}`);
    }
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
