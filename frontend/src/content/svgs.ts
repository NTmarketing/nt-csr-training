// Named SVG diagrams for use in module media blocks. Reference from
// modules.json with media: [{ type: 'svg', svg: '$NAME' }] — the renderer
// looks up $NAME against this export.
//
// Conventions:
//   - viewBox + responsive (no fixed pixel width on root)
//   - Brand green #00bf63 for accents, #0F172A for primary lines/text
//   - sans-serif labels, kept legible at ~600px wide
//   - clean reference-diagram style, not illustrative

const NT_GREEN = '#00bf63';
const PRIMARY = '#0F172A';
const MUTED = '#64748B';
const LIGHT_BG = '#F1F5F9';
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

// Booking lifecycle: 9 numbered circles connected by arrows. Single-word
// labels (one or two words max) so they sit cleanly under each circle
// without overlapping their neighbors.
export const BOOKING_LIFECYCLE = (() => {
  const steps = [
    'Search',
    'Request',
    'Verify',
    'Accept',
    'Pickup',
    'Rental',
    'Return',
    'Review',
    'Payout',
  ];
  const xStart = 60;
  const yMid = 120;
  const gap = 90;
  const r = 26;
  const w = xStart + gap * (steps.length - 1) + 60;
  const h = 200;
  const dots = steps
    .map((label, i) => {
      const x = xStart + i * gap;
      const isHighlight = i === 3 || i === 8; // Accept + Payout
      const fill = isHighlight ? NT_GREEN : LIGHT_BG;
      const stroke = isHighlight ? NT_GREEN : PRIMARY;
      const numFill = isHighlight ? '#fff' : PRIMARY;
      return `
    <g>
      <circle cx="${x}" cy="${yMid}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${x}" y="${yMid + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${numFill}">${i + 1}</text>
      <text x="${x}" y="${yMid + 56}" text-anchor="middle" font-family="${FONT}" font-size="12" font-weight="600" fill="${PRIMARY}">${label}</text>
    </g>`;
    })
    .join('');
  const arrows = steps
    .slice(0, -1)
    .map((_, i) => {
      const x1 = xStart + i * gap + r + 2;
      const x2 = xStart + (i + 1) * gap - r - 2;
      return `<line x1="${x1}" y1="${yMid}" x2="${x2 - 6}" y2="${yMid}" stroke="${MUTED}" stroke-width="2"/><polygon points="${x2 - 6},${yMid - 4} ${x2},${yMid} ${x2 - 6},${yMid + 4}" fill="${MUTED}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Booking lifecycle">
    <rect width="${w}" height="${h}" fill="white"/>
    <text x="${w / 2}" y="24" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">Booking lifecycle — 9 steps</text>
    ${arrows}
    ${dots}
  </svg>`;
})();

// Cancellation refund timeline: rental start in middle, refund-zone bars before.
export const CANCELLATION_REFUND_TIMELINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 260" role="img" aria-label="Cancellation refund timeline">
  <defs>
    <linearGradient id="refundFade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="${NT_GREEN}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${NT_GREEN}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect width="700" height="260" fill="white"/>
  <text x="350" y="24" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">Cancellation refund — by hours before rental start</text>

  <!-- timeline axis -->
  <line x1="60" y1="160" x2="640" y2="160" stroke="${PRIMARY}" stroke-width="2"/>

  <!-- zone bars: 75% (>72h), 50% (72-48h), 25% (48-24h), 0% (<24h) -->
  <!-- proportional widths -->
  <rect x="60"  y="120" width="180" height="40" fill="url(#refundFade)" />
  <rect x="240" y="120" width="170" height="40" fill="${NT_GREEN}" fill-opacity="0.45"/>
  <rect x="410" y="120" width="150" height="40" fill="${NT_GREEN}" fill-opacity="0.20"/>
  <rect x="560" y="120" width="80"  height="40" fill="#fee2e2" stroke="#dc2626" stroke-width="1"/>

  <!-- labels in zones -->
  <text x="150" y="146" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">75%</text>
  <text x="325" y="146" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">50%</text>
  <text x="485" y="146" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">25%</text>
  <text x="600" y="146" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="#991b1b">0%</text>

  <!-- tick markers + hour labels -->
  <g font-family="${FONT}" font-size="11" fill="${MUTED}">
    <line x1="60"  y1="160" x2="60"  y2="170" stroke="${PRIMARY}" stroke-width="1"/>
    <text x="60" y="186" text-anchor="middle">&gt;72 hr</text>
    <line x1="240" y1="160" x2="240" y2="170" stroke="${PRIMARY}" stroke-width="1"/>
    <text x="240" y="186" text-anchor="middle">72 hr</text>
    <line x1="410" y1="160" x2="410" y2="170" stroke="${PRIMARY}" stroke-width="1"/>
    <text x="410" y="186" text-anchor="middle">48 hr</text>
    <line x1="560" y1="160" x2="560" y2="170" stroke="${PRIMARY}" stroke-width="1"/>
    <text x="560" y="186" text-anchor="middle">24 hr</text>
    <line x1="640" y1="160" x2="640" y2="170" stroke="${PRIMARY}" stroke-width="1"/>
    <text x="640" y="186" text-anchor="middle">0 hr</text>
  </g>

  <!-- rental-start marker -->
  <g>
    <line x1="640" y1="60" x2="640" y2="160" stroke="${PRIMARY}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <circle cx="640" cy="60" r="6" fill="${PRIMARY}"/>
    <text x="640" y="50" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="${PRIMARY}">rental start</text>
  </g>

  <!-- footer -->
  <text x="350" y="230" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${MUTED}">Earlier cancellation = larger refund. Within 24 hr: no refund.</text>
</svg>`;

export const NAMED_SVGS: Record<string, string> = {
  BOOKING_LIFECYCLE,
  CANCELLATION_REFUND_TIMELINE,
};

export function resolveSvg(svgField: string): string {
  if (typeof svgField !== 'string') return '';
  if (svgField.startsWith('$')) {
    const key = svgField.slice(1);
    return NAMED_SVGS[key] || '';
  }
  return svgField;
}
