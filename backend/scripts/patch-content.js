#!/usr/bin/env node
/* eslint-disable no-console */
// One-shot transform of content/modules.json + content/exam-questions.json:
//   - Insert "module-trailer-basics" at number=1
//   - Bump every existing module's number by 1
//   - Loosen module-1's first two scenario rubrics
//   - Append three exam questions for the new module
//
// Idempotent: safe to re-run; transforms are guarded by detection of existing state.
// (Tone tagging was historically here too — removed when tone-based grading
// was scrapped in favor of content/clarity/escalation grading.)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MODULES_PATH = path.join(ROOT, 'content', 'modules.json');
const EXAM_PATH = path.join(ROOT, 'content', 'exam-questions.json');

function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writePretty(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function newModule() {
  return {
    id: 'module-trailer-basics',
    number: 1,
    title: 'Trailer Basics',
    description:
      'What trailers are, how they work, and how rentals fit in. Foundation knowledge before we dive into Neighbors Trailer specifically.',
    estimated_minutes: 20,
    learning_objectives: [
      'Identify common types of trailers and their primary uses',
      'Understand basic hitching and towing terminology',
      'Explain why people rent trailers instead of buying',
      'Recognize key safety and legal considerations for towing',
    ],
    sections: [
      {
        id: 'tb-section-1',
        title: 'What is a trailer?',
        content_md:
          "A trailer is an unpowered vehicle towed by a powered one. The key distinction: trailers don't move on their own. They're attached to a truck, SUV, or car via a hitch and pulled along. They show up in everyday life everywhere — moving across the country, hauling a boat to the lake, picking up lumber from Home Depot, transporting a horse, taking a side-by-side to the dunes.\n\nThe US trailer rental market is large because most people don't need a trailer often enough to justify owning one. Buying a $5,000 utility trailer to use twice a year doesn't make sense. Renting one for $50 a day does. That gap is the entire reason peer-to-peer trailer rental marketplaces like Neighbors Trailer exist.",
        key_points: [
          "Trailers don't have their own engine — they're towed",
          'Most people need a trailer occasionally, not regularly',
          'Renting is cheaper than buying for occasional use',
        ],
      },
      {
        id: 'tb-section-2',
        title: 'Common types of trailers',
        content_md:
          "Trailers fall into rough categories based on what they haul. As a CSR you don't need to be an expert, but recognizing these by name will save you on every other call:\n\n**Utility trailers** — open, flat-bedded, often with low side rails. The most common rental. Used for moving, yard waste, furniture, ATVs, anything weather doesn't matter for.\n\n**Enclosed trailers** — fully boxed in with a door. Used when cargo can't get wet or seen. Movers, contractors, anyone hauling tools or valuables.\n\n**Car haulers** — long, low, designed to carry a single vehicle. Two ramps at the back. Used for moving non-running cars, race cars, project vehicles.\n\n**Flatbed trailers** — flat platform with no walls or roof. For oversized loads — equipment, building materials, hay bales.\n\n**Dump trailers** — like a small dump truck bed but towed. Hydraulic lift to dump dirt, gravel, debris. Common for landscaping and demo work.\n\n**Horse / livestock trailers** — designed for transporting animals. Often divided into stalls. Some have living quarters on the front for owners.\n\n**Tow dollies** — minimal trailers with just two wheels and ramps; tow a car by lifting only its front wheels.\n\n**Boat trailers** — specialized cradle for hauling boats. Skinny, with rollers or bunks shaped for the hull.\n\n**Motorcycle trailers** — small, often with wheel chocks to lock bikes upright.\n\nNeighbors Trailer's listings span all of these categories. Knowing the difference between a 'flatbed' and a 'utility' helps you understand what the renter is asking about when they call.",
        key_points: [
          'Utility = open, the most common rental',
          'Enclosed = boxed in, for valuables or weather protection',
          'Car hauler = for vehicles',
          'Specialty types: dump, horse, boat, motorcycle, tow dolly',
        ],
      },
      {
        id: 'tb-section-3',
        title: 'Hitching and towing basics',
        content_md:
          'Trailers attach to tow vehicles via a **hitch**. The two most common types you\'ll hear about:\n\n**Ball hitch** — by far the most common. A metal ball mounted on the tow vehicle\'s hitch receiver. The trailer has a coupler that locks down over the ball. Comes in three standard sizes: 1-7/8", 2", and 2-5/16". The ball size MUST match the coupler — wrong size is a major safety issue.\n\n**Gooseneck / fifth-wheel** — used for heavier trailers (large livestock, big flatbeds). Mounts in the bed of a pickup truck rather than the rear bumper. Distributes weight better; allows heavier loads.\n\n**Light plug** — every trailer with brake lights/turn signals also plugs into the tow vehicle\'s electrical system. Two common types: **4-pin** (basic — running, brake, turn) and **7-pin** (4-pin functions plus electric brakes, reverse, charging). Renters routinely call confused because their truck\'s plug doesn\'t match the trailer\'s plug.\n\n**Tow capacity** — every vehicle has a maximum weight it can safely tow, listed in the owner\'s manual. The renter is responsible for knowing their vehicle\'s tow capacity. As a CSR, never quote a tow capacity for a renter\'s specific vehicle — that\'s a liability you don\'t want.\n\n**Trailer brakes** — heavier trailers have their own brakes that activate via a brake controller installed in the tow vehicle. If a renter is asking about a 7-pin plug or \'do I need a brake controller,\' the listing has electric brakes.',
        key_points: [
          'Ball hitch sizes: 1-7/8", 2", 2-5/16" — must match',
          'Gooseneck = heavy-duty, mounts in pickup bed',
          'Light plugs: 4-pin (basic) vs 7-pin (with electric brakes)',
          "Never quote tow capacity for someone's specific vehicle",
        ],
      },
      {
        id: 'tb-section-4',
        title: 'Why people rent',
        content_md:
          "Understanding the renter's mindset helps every conversation. Common reasons people rent rather than buy:\n\n**Moving** — the largest category. People moving across town or across the country. Often first-time trailer users; they need extra hand-holding.\n\n**One-off projects** — landscaping a yard, hauling debris from a remodel, picking up bulky furniture, moving a riding mower.\n\n**Recreation** — hauling ATVs, side-by-sides, boats, motorcycles to a destination. Weekend warriors.\n\n**Trying before buying** — people considering a trailer purchase rent first to see if the size works for them.\n\n**Their own trailer is unavailable** — broken, sold, lent out. They need a temporary replacement.\n\nFor owners on Neighbors Trailer, the equation is the same in reverse. They own a trailer, use it occasionally, and want to defray ownership costs by renting it out the rest of the time. Many owners are landscapers, contractors, or hobbyists whose trailer sits unused most weeks.\n\nThis isn't 'random rental income' for them — for many owners it's a real chunk of their monthly cash flow. When you're handling an owner's payout problem, that context matters.",
        key_points: [
          'Moving and one-off projects are the bulk of rentals',
          'Renters are often first-time trailer users',
          'For owners, payouts are real income — not pocket money',
        ],
      },
      {
        id: 'tb-section-5',
        title: 'Safety and legal essentials',
        content_md:
          "You don't need to be a tow expert as a CSR, but you should recognize the most common safety/legal issues that come up:\n\n**Driver's license requirements** — for standard trailers (under ~10,000 lb GVWR), a regular Class C driver's license is sufficient in Texas and most US states. CDL is only required for commercial heavy-duty hauling. Renters sometimes call worried they need a special license — they almost certainly don't, but the verification process (MVR) covers this.\n\n**Damage protection** — Neighbors Trailer provides NT Protect / the Protection Package on every booking — a built-in damage protection product, **not insurance**, that covers accidental damage during the rental. It does NOT cover tire damage from blowouts/road debris, intentional damage, or theft due to negligence.\n\n**Trailer registration & plates** — owner's responsibility. Every trailer on the platform must be legally registered in the owner's state.\n\n**Securing the load** — the renter's responsibility. Nothing falling out, nothing flying off, properly tied down. NT does not inspect this; the owner verbally walks renters through it at pickup.\n\n**Speed and route** — towing changes everything about driving. Stopping distance is longer. Turns are wider. Some highways and bridges have weight restrictions. Most rental trailers have a recommended max speed (typically 55-65 mph).\n\nWhen a renter calls and says 'I had a tire blow out, who covers it?' — you now know that's not covered by NT Protect. When they say 'do I need a CDL?' — you know almost certainly not.",
        key_points: [
          'Standard Class C license is sufficient for most trailers',
          'NT Protect covers accidental damage, NOT tire blowouts',
          "Securing the load is the renter's responsibility",
          'Towing changes stopping distance, turning radius, max speed',
        ],
      },
    ],
    kb_references: [],
    scenarios: [
      {
        id: 'tb-scenario-1',
        type: 'free_response',
        prompt:
          "Your buddy texts: 'hey what's the difference between a utility trailer and a flatbed?' Explain the difference clearly.",
        rubric: [
          'Identifies the key difference (sides/rails vs no sides)',
          'Mentions the typical use case that drives the choice (e.g., utility for everyday hauls; flatbed for oversized or odd-shaped loads)',
          "Avoids jargon a non-trailer-person wouldn't recognize",
        ],
      },
      {
        id: 'tb-scenario-2',
        type: 'free_response',
        prompt:
          "An inbound caller says: 'I rented a trailer last weekend and the lights didn't work with my truck. The plug was different.' Acknowledge the issue and explain at a basic level what happened.",
        rubric: [
          'Acknowledges the frustration',
          "Identifies that the trailer light plug type didn't match the vehicle's outlet",
          'Mentions 4-pin vs 7-pin distinction (or adapter availability)',
          "Doesn't blame the renter or the owner — explains it as a compatibility issue",
        ],
      },
      {
        id: 'tb-scenario-3',
        type: 'roleplay',
        prompt:
          "You're handling an inbound call. The caller is a first-time trailer renter and confused about what kind of trailer they actually need.",
        customer_persona:
          "Friendly but completely new to trailers. They're moving a 1-bedroom apartment 200 miles. They've never towed anything before. Don't volunteer information — make the trainee ask clarifying questions to figure out what trailer fits the job.",
        rubric: [
          "Asks clarifying questions about what they're moving",
          'Recommends a trailer category that fits (likely enclosed or large utility)',
          'Mentions tow vehicle capacity as something they should check',
          "Doesn't overwhelm the caller with jargon",
        ],
      },
    ],
    quiz: [
      {
        id: 'tb-q1',
        question:
          'Which type of trailer is fully enclosed and used when cargo needs protection from weather or theft?',
        type: 'multiple_choice',
        options: ['Utility trailer', 'Enclosed trailer', 'Flatbed trailer', 'Tow dolly'],
        correct_index: 1,
        explanation:
          'Enclosed trailers are fully boxed in with walls, roof, and a door — used by movers, contractors, and anyone hauling valuables or weather-sensitive cargo.',
      },
      {
        id: 'tb-q2',
        question: "What's the difference between a 4-pin and a 7-pin trailer light plug?",
        type: 'multiple_choice',
        options: [
          '4-pin is for cars, 7-pin is for trucks',
          '4-pin handles basic lights only; 7-pin adds electric brakes, reverse, and charging',
          '4-pin is older, 7-pin is the new standard',
          "There's no functional difference",
        ],
        correct_index: 1,
        explanation:
          '4-pin handles running lights, brake lights, and turn signals. 7-pin adds electric trailer brakes, reverse signal, and a charging line. Heavier trailers with their own brakes need a 7-pin connection.',
      },
      {
        id: 'tb-q3',
        question: "Should a CSR quote a renter's specific tow capacity over the phone?",
        type: 'multiple_choice',
        options: [
          'Yes, if you can look it up online',
          "Yes, if the trailer manufacturer's site lists it",
          "No — tow capacity depends on the renter's vehicle, and the renter is responsible for knowing it",
          'Only if a manager approves',
        ],
        correct_index: 2,
        explanation:
          "Tow capacity is specific to the renter's vehicle and is the renter's responsibility. Quoting it creates liability if it's wrong. Always direct them to their owner's manual.",
      },
      {
        id: 'tb-q4',
        question:
          'Does NT Protect (the Protection Package) cover a tire blowout from road debris during a rental?',
        type: 'multiple_choice',
        options: [
          'Yes, all damage is covered',
          'Yes, with a $250 deductible',
          'No — tire damage is excluded from NT Protect',
          'Only if the renter calls within 24 hours',
        ],
        correct_index: 2,
        explanation:
          'Tire damage from blowouts or road debris is not covered by NT Protect. This is one of the most common edge-case calls — know it cold.',
      },
      {
        id: 'tb-q5',
        question: 'Does someone renting a standard utility trailer in Texas need a CDL?',
        type: 'multiple_choice',
        options: [
          'Yes, always',
          'No — standard Class C license is sufficient for most rental trailers',
          "Only if they're crossing state lines",
          'Only if the trailer weighs over 5,000 lb',
        ],
        correct_index: 1,
        explanation:
          'A standard Class C driver\'s license is sufficient for trailers under about 10,000 lb GVWR — which covers virtually every trailer on Neighbors Trailer\'s platform. CDL is only required for commercial heavy-duty hauling.',
      },
    ],
    passing_score_percent: 70,
  };
}

const NEW_EXAM_QUESTIONS = [
  {
    id: 'exam-tb-1',
    module_ref: 'module-trailer-basics',
    question:
      'Which trailer type is open and the most common rental category — used for moving, yard waste, ATVs, and anything where weather is not a concern?',
    type: 'multiple_choice',
    options: ['Enclosed trailer', 'Utility trailer', 'Tow dolly', 'Dump trailer'],
    correct_index: 1,
    explanation:
      'Utility trailers are open with low rails, the most common rental, used when cargo doesn\'t need weather protection.',
  },
  {
    id: 'exam-tb-2',
    module_ref: 'module-trailer-basics',
    question:
      'A renter calls and says their truck\'s 4-pin plug won\'t connect to a trailer with a 7-pin plug. What is the actual issue?',
    type: 'multiple_choice',
    options: [
      'The trailer is broken',
      'They need an adapter — the trailer expects 7-pin (lights + electric brakes) but the truck only provides 4-pin (lights only)',
      'They need to call the owner to swap the plug',
      'The trailer is incompatible with their truck and the rental should be cancelled',
    ],
    correct_index: 1,
    explanation:
      '4-pin handles only basic lights; 7-pin adds electric brakes, reverse, and charging. A 4-to-7 adapter resolves the connection but the trailer\'s electric brakes will not work without a brake controller in the tow vehicle.',
  },
  {
    id: 'exam-tb-3',
    module_ref: 'module-trailer-basics',
    question:
      'A renter blew a tire from a piece of road debris during the rental. Is this damage covered by NT Protect?',
    type: 'multiple_choice',
    options: [
      'Yes, all damage during the rental is covered',
      'Yes, with a deductible',
      'No — tire damage from blowouts or road debris is excluded from NT Protect',
      'Only if the owner agrees',
    ],
    correct_index: 2,
    explanation:
      'Tire damage from blowouts/road debris is not covered. This is a frequent edge-case call — the policy excludes wear-and-tire damage even though general accidental damage is covered.',
  },
];

function loosenedRubricFor(scenarioId) {
  if (scenarioId === 'module-1-scenario-1') {
    return [
      'Captures the basic peer-to-peer marketplace idea',
      'Acknowledges the Turo analogy and refines it accurately (same two-sided marketplace model)',
      "Mentions NT's role as facilitator (payments, verification, Protection Package, dispute resolution) — not just a directory",
    ];
  }
  if (scenarioId === 'module-1-scenario-2') {
    return [
      'Distinguishes the two roles in plain language',
      'Concise',
    ];
  }
  return null;
}

function transformModules(data) {
  if (!data || !Array.isArray(data.modules)) {
    throw new Error('modules.json malformed: missing modules[]');
  }

  const alreadyHasNew = data.modules.some((m) => m.id === 'module-trailer-basics');

  // Step 1 — bump numbers (only if new module not yet inserted, otherwise idempotent skip)
  if (!alreadyHasNew) {
    for (const m of data.modules) {
      m.number = m.number + 1;
    }
  }

  // Step 2 — loosen module-1 scenarios 1+2 rubrics to focus on content
  // rather than formal-pitch coverage.
  for (const m of data.modules) {
    if (!Array.isArray(m.scenarios)) continue;
    if (m.id === 'module-trailer-basics') continue;
    for (const sc of m.scenarios) {
      const loose = loosenedRubricFor(sc.id);
      if (loose) sc.rubric = loose;
    }
  }

  // Step 3 — prepend new module if missing
  if (!alreadyHasNew) {
    data.modules.unshift(newModule());
  }

  return data;
}

function transformExam(data) {
  if (!data || !Array.isArray(data.questions)) return data;
  const existingIds = new Set(data.questions.map((q) => q.id));
  for (const q of NEW_EXAM_QUESTIONS) {
    if (!existingIds.has(q.id)) data.questions.push(q);
  }
  return data;
}

function main() {
  const modules = read(MODULES_PATH);
  transformModules(modules);
  writePretty(MODULES_PATH, modules);
  console.log(`modules.json: ${modules.modules.length} modules now`);

  if (fs.existsSync(EXAM_PATH)) {
    const exam = read(EXAM_PATH);
    transformExam(exam);
    writePretty(EXAM_PATH, exam);
    console.log(`exam-questions.json: ${exam.questions.length} questions now`);
  } else {
    console.log('exam-questions.json missing, skipping');
  }
}

main();
