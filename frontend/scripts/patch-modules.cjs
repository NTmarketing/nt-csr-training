#!/usr/bin/env node
// Add media blocks to Trailer Basics section 1 (lifecycle SVG), Trailer
// Basics section 2 (gallery), and old Module 7 / new number 8 section 1
// (cancellation refund timeline SVG). Idempotent.

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', '..', 'content', 'modules.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const tb = data.modules.find((m) => m.id === 'module-trailer-basics');
const tbSection1 = tb.sections.find((s) => s.id === 'tb-section-1');
const tbSection2 = tb.sections.find((s) => s.id === 'tb-section-2');

tbSection1.media = [
  {
    type: 'svg',
    svg: '$BOOKING_LIFECYCLE',
    caption: 'The Neighbors Trailer booking lifecycle',
  },
];

// Captions pulled from prose in tb-section-2.
tbSection2.media = [
  {
    type: 'gallery',
    columns: 3,
    images: [
      {
        src: '/images/trailer-basics/types/utility-trailer.jpg',
        alt: 'Open utility trailer with low side rails',
        caption: 'Utility — open, the most common rental',
      },
      {
        src: '/images/trailer-basics/types/enclosed-trailer.jpg',
        alt: 'Enclosed cargo trailer',
        caption: 'Enclosed — for valuables or weather protection',
      },
      {
        src: '/images/trailer-basics/types/car-hauler.jpg',
        alt: 'Car hauler trailer with rear ramps',
        caption: 'Car hauler — for moving a single vehicle',
      },
      {
        src: '/images/trailer-basics/types/flatbed-trailer.jpg',
        alt: 'Flatbed trailer with no walls',
        caption: 'Flatbed — for oversized loads',
      },
      {
        src: '/images/trailer-basics/types/dump-trailer.jpg',
        alt: 'Dump trailer with hydraulic lift bed',
        caption: 'Dump — landscaping and demo work',
      },
      {
        src: '/images/trailer-basics/types/horse-trailer.jpg',
        alt: 'Horse / livestock trailer',
        caption: 'Horse / livestock — divided into stalls',
      },
      {
        src: '/images/trailer-basics/types/boat-trailer.jpg',
        alt: 'Boat trailer with hull cradle',
        caption: 'Boat — specialized cradle shaped for the hull',
      },
    ],
  },
];

const m7 = data.modules.find((m) => m.id === 'module-7');
const m7Section1 = m7.sections.find((s) => s.id === 'section-7-1');
m7Section1.media = [
  {
    type: 'svg',
    svg: '$CANCELLATION_REFUND_TIMELINE',
    caption: 'Cancellation refund schedule',
  },
];

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('patched modules.json');
console.log('  tb-section-1 media:', tbSection1.media.length);
console.log('  tb-section-2 media:', tbSection2.media.length, 'gallery items:', tbSection2.media[0].images.length);
console.log('  module-7 section-7-1 media:', m7Section1.media.length);
