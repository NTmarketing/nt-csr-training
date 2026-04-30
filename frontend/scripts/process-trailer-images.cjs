#!/usr/bin/env node
// One-shot script: read MCP-saved download payloads, decode base64, resize
// with sharp, save into public/images/trailer-basics/types/.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TOOL_RESULTS_DIR = 'C:/Users/trevo/.claude/projects/C--Users-trevo-nt-csr-training/b5b3d233-c356-4b41-b4c4-4ef623f75cca/tool-results';
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'trailer-basics', 'types');

const targets = [
  { fileId: '1AW1hUP5G_eraJqtSYhF_Q_lr5ALGEn8A', driveTitle: 'Boat-Trailer-02.jpg', outName: 'boat-trailer.jpg' },
  { fileId: '1PWsCd0z8PiTepo6A1PPcal-hvyx0PITp', driveTitle: 'Car-Hauler-Trailer-05.jpg', outName: 'car-hauler.jpg' },
  { fileId: '1FtrbQQt1VpGQNxzqjtpq9FJmAQe6AmPn', driveTitle: 'Dump-Trailer-09.jpg', outName: 'dump-trailer.jpg' },
  { fileId: '11vZ4p1S2I4ZD6tyTIW1KzwgQfFpu2YUR', driveTitle: 'Enclosed-Trailer-04.jpg', outName: 'enclosed-trailer.jpg' },
  { fileId: '1t0xxdzw2mW_-nd8PUOG3GJ45P7mpBZNt', driveTitle: 'Flatbed-Trailer-05.jpg', outName: 'flatbed-trailer.jpg' },
  { fileId: '19viBKgtJgwkmL7CLJxY5LzuvzxFuWKlA', driveTitle: 'Horse-Livestock-Trailer-01.jpg', outName: 'horse-trailer.jpg' },
  { fileId: '1yFPmjuc6zXrnYmL9I85SW9_UrJKwkQTU', driveTitle: 'Tow-Dolly-Trailer-01.jpg', outName: 'tow-dolly.jpg' },
  { fileId: '1pth2iMFD8_kFAPGCmesV76PnvcNxcDCb', driveTitle: 'Utility-Trailer-01.jpg', outName: 'utility-trailer.jpg' },
];

function findPayloadFile(driveTitle) {
  const files = fs.readdirSync(TOOL_RESULTS_DIR);
  for (const f of files) {
    if (!f.endsWith('.txt')) continue;
    const full = path.join(TOOL_RESULTS_DIR, f);
    const stat = fs.statSync(full);
    if (stat.size < 1000) continue;
    try {
      const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (obj.title === driveTitle) return obj;
    } catch (_) {}
  }
  return null;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const report = [];
  for (const t of targets) {
    const payload = findPayloadFile(t.driveTitle);
    if (!payload) {
      console.log(`MISS: ${t.driveTitle} not found in tool-results — skipping`);
      report.push({ name: t.outName, status: 'missing' });
      continue;
    }
    const buf = Buffer.from(payload.content, 'base64');
    const meta = await sharp(buf).metadata();

    const outPath = path.join(OUT_DIR, t.outName);
    let pipeline = sharp(buf).rotate(); // honor EXIF orientation
    if (meta.width > 1600) {
      pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
    }
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(outPath);

    const stat = fs.statSync(outPath);
    report.push({
      name: t.outName,
      drive: t.driveTitle,
      origDims: `${meta.width}x${meta.height}`,
      origSize: payload.content.length, // approximate (base64 inflated)
      outSize: stat.size,
    });
    console.log(`OK   ${t.outName.padEnd(22)} ${meta.width}x${meta.height} -> ${(stat.size / 1024).toFixed(0)} KB`);
  }

  console.log('\nReport:');
  console.table(report);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
