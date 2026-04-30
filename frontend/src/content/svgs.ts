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

// Three trailer-coupler ball sizes shown to relative scale.
// Real diameters: 1.875" (1-7/8"), 2", 2.3125" (2-5/16"). Render at ~25 px / inch.
export const BALL_HITCH_SIZES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" role="img" aria-label="Ball hitch sizes">
  <defs>
    <radialGradient id="ballGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="${PRIMARY}"/>
    </radialGradient>
  </defs>
  <rect width="600" height="240" fill="white"/>
  <!-- shaft baseline -->
  <line x1="60" y1="170" x2="540" y2="170" stroke="${PRIMARY}" stroke-width="2"/>
  <!-- 1-7/8" ball -->
  <g>
    <rect x="135" y="150" width="20" height="40" fill="${PRIMARY}"/>
    <circle cx="145" cy="130" r="23.4" fill="url(#ballGrad)" stroke="${PRIMARY}" stroke-width="1.5"/>
    <text x="145" y="220" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${PRIMARY}">1-7/8"</text>
    <text x="145" y="50" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${MUTED}">small / light loads</text>
  </g>
  <!-- 2" ball -->
  <g>
    <rect x="290" y="146" width="20" height="44" fill="${PRIMARY}"/>
    <circle cx="300" cy="125" r="25" fill="url(#ballGrad)" stroke="${PRIMARY}" stroke-width="1.5"/>
    <text x="300" y="220" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${NT_GREEN}">2"</text>
    <text x="300" y="50" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${MUTED}">most common</text>
  </g>
  <!-- 2-5/16" ball -->
  <g>
    <rect x="445" y="142" width="22" height="48" fill="${PRIMARY}"/>
    <circle cx="456" cy="118" r="28.9" fill="url(#ballGrad)" stroke="${PRIMARY}" stroke-width="1.5"/>
    <text x="456" y="220" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${PRIMARY}">2-5/16"</text>
    <text x="456" y="50" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${MUTED}">heavy duty</text>
  </g>
  <!-- caption -->
  <text x="300" y="20" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="600" fill="${PRIMARY}">Trailer ball sizes (to relative scale)</text>
</svg>`;

// 4-pin and 7-pin trailer plug pinouts side by side.
export const PIN_PLUG_4VS7 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" role="img" aria-label="4-pin vs 7-pin trailer plugs">
  <rect width="600" height="320" fill="white"/>
  <text x="300" y="22" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${PRIMARY}">4-pin vs 7-pin trailer plugs</text>

  <!-- 4-pin (flat) -->
  <g transform="translate(70,60)">
    <text x="105" y="0" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${PRIMARY}">4-pin flat</text>
    <text x="105" y="18" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${MUTED}">basic lights only</text>
    <rect x="20" y="40" width="170" height="50" rx="6" fill="${LIGHT_BG}" stroke="${PRIMARY}" stroke-width="2"/>
    <!-- 4 pins horizontal -->
    <circle cx="50" cy="65" r="7" fill="${PRIMARY}"/>
    <circle cx="85" cy="65" r="7" fill="${PRIMARY}"/>
    <circle cx="125" cy="65" r="7" fill="${PRIMARY}"/>
    <circle cx="160" cy="65" r="7" fill="${PRIMARY}"/>
    <text x="50" y="115" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${MUTED}">ground</text>
    <text x="85" y="115" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${MUTED}">L turn</text>
    <text x="125" y="115" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${MUTED}">R turn</text>
    <text x="160" y="115" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${MUTED}">tail</text>
    <!-- callout -->
    <text x="105" y="155" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${PRIMARY}">running, brake, turn signals</text>
  </g>

  <!-- divider -->
  <line x1="300" y1="60" x2="300" y2="280" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>

  <!-- 7-pin (round) -->
  <g transform="translate(330,60)">
    <text x="120" y="0" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${NT_GREEN}">7-pin round</text>
    <text x="120" y="18" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${MUTED}">basic lights + electric brakes</text>
    <circle cx="120" cy="90" r="55" fill="${LIGHT_BG}" stroke="${PRIMARY}" stroke-width="2"/>
    <!-- center pin -->
    <circle cx="120" cy="90" r="6" fill="${NT_GREEN}"/>
    <!-- 6 outer pins -->
    <g fill="${PRIMARY}">
      <circle cx="120" cy="55" r="6"/>
      <circle cx="150" cy="72" r="6"/>
      <circle cx="150" cy="108" r="6"/>
      <circle cx="120" cy="125" r="6"/>
      <circle cx="90" cy="108" r="6"/>
      <circle cx="90" cy="72" r="6"/>
    </g>
    <text x="120" y="170" text-anchor="middle" font-family="${FONT}" font-size="10" fill="${MUTED}">center: aux / ground</text>
    <text x="120" y="195" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${PRIMARY}">+ electric brakes</text>
    <text x="120" y="210" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${PRIMARY}">+ reverse</text>
    <text x="120" y="225" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${PRIMARY}">+ charging line</text>
  </g>
</svg>`;

// Booking lifecycle: 9 numbered circles connected by arrows.
export const BOOKING_LIFECYCLE = (() => {
  const steps = [
    'Renter searches',
    'Booking requested',
    'ID verified (Clear + MVR)',
    'Owner accepts',
    'Pickup info shared',
    'Owner starts rental',
    'Rental period',
    'Owner ends rental',
    'Reviews + payout',
  ];
  const xStart = 60;
  const yMid = 130;
  const gap = 90;
  const r = 26;
  const w = xStart + gap * (steps.length - 1) + 60;
  const dots = steps
    .map((label, i) => {
      const x = xStart + i * gap;
      const isHighlight = i === 3 || i === 8; // owner accepts + reviews
      const fill = isHighlight ? NT_GREEN : LIGHT_BG;
      const stroke = isHighlight ? NT_GREEN : PRIMARY;
      const numFill = isHighlight ? '#fff' : PRIMARY;
      return `
    <g>
      <circle cx="${x}" cy="${yMid}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${x}" y="${yMid + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${numFill}">${i + 1}</text>
      <text x="${x}" y="${yMid + 60}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${PRIMARY}">${label}</text>
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 220" role="img" aria-label="Booking lifecycle">
    <rect width="${w}" height="220" fill="white"/>
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
    <text x="60" y="186" text-anchor="middle">>72 hr</text>
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
  BALL_HITCH_SIZES,
  PIN_PLUG_4VS7,
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
