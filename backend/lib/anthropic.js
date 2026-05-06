const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-20250514';

let client = null;
function getClient() {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  client = new Anthropic({ apiKey });
  return client;
}

function stripJsonFences(text) {
  if (!text) return text;
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  const firstBrace = t.indexOf('{');
  const lastBrace = t.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }
  return t;
}

function parseJsonResponse(text) {
  const stripped = stripJsonFences(text);
  try {
    return JSON.parse(stripped);
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${err.message}\nRaw: ${text}`);
  }
}

function extractText(message) {
  if (!message || !Array.isArray(message.content)) return '';
  return message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();
}

function buildModuleContext(moduleContent) {
  if (!moduleContent) return '';
  const parts = [];
  parts.push(`Module ${moduleContent.number}: ${moduleContent.title}`);
  if (moduleContent.description) parts.push(`Description: ${moduleContent.description}`);
  if (Array.isArray(moduleContent.learning_objectives) && moduleContent.learning_objectives.length) {
    parts.push('Learning objectives:\n- ' + moduleContent.learning_objectives.join('\n- '));
  }
  if (Array.isArray(moduleContent.sections)) {
    for (const s of moduleContent.sections) {
      parts.push(`## ${s.title}\n${s.content_md || ''}`);
    }
  }
  return parts.join('\n\n');
}

function formatKBEntry(e) {
  // Compact text-only rendering of one entry. Body kept full — the relevance
  // search already filters down to ~6 entries, so per-entry truncation isn't
  // needed for typical token budgets.
  const header = `[${e.audience}] [${e.category}] ${e.title}`;
  return `${header}\n${e.body}`;
}

async function tutorChat(moduleContent, kbEntries, userMessage, history = []) {
  // kbEntries: array of pre-selected relevant KB entries from
  // content.findRelevantKBEntries(). The route layer does the keyword search
  // (using the trainee's message + the last assistant turn for follow-up
  // context) so this function stays a thin Anthropic wrapper.
  const kbBlock = Array.isArray(kbEntries) && kbEntries.length
    ? kbEntries.map(formatKBEntry).join('\n\n---\n\n')
    : '(no matching KB entries found for this question)';

  const system = `You are the NT CSR Trainer. The trainee is currently working through ${moduleContent ? `Module ${moduleContent.number}: ${moduleContent.title}` : 'the curriculum'}. Their goal is to learn the module's objectives, but they may also ask broader questions about real CSR work.

You have two sources of context, in priority order:

1. **MASTER KNOWLEDGE BASE EXCERPTS** — the production source of truth for Neighbors Trailer policy, procedure, and customer-facing answers. These entries come from the live support knowledge base. Use them to answer trainee questions accurately. Reference them by their question/title when helpful so the trainee can look them up later.

2. **MODULE CONTENT** — what the trainee is currently studying. Use this to ground your answer in the lesson context.

Rules:
- The KB is authoritative. If the KB and module content conflict on a factual point (numbers, deadlines, refund percentages, eligibility, escalation triggers), **the KB wins** — production policies override training material. Tell the trainee plainly when this happens.
- Don't info-dump. Answer the actual question first, then offer to go deeper.
- If neither the KB nor the module content has the answer, say so honestly. Do not fabricate policies, dollar amounts, or timing windows.
- The KB excerpts below are pre-filtered by keyword relevance to the current question; if they look off-topic, ignore them and answer from the module content (or say you don't have authoritative info).

=== MODULE CONTENT ===
${buildModuleContext(moduleContent)}

=== RELEVANT KNOWLEDGE BASE EXCERPTS ===
${kbBlock}`;

  const messages = [
    ...history.filter(m => m && m.role && m.content).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content)
    })),
    { role: 'user', content: String(userMessage) }
  ];

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages
  });

  return extractText(resp);
}

const GRADING_GUIDANCE = `Grade the trainee's response against the rubric. Focus on:
1. Factual accuracy — did they identify the correct policy, procedure, or answer?
2. Clarity — is the message clear and unambiguous?
3. Escalation judgment — when the scenario warrants it, did they recognize when to escalate vs handle solo?

Do NOT grade based on:
- Whether the response uses contractions, casual language, or specific phrasing styles
- Tonality, register, or "professionalism" of the wording
- Brevity unless excessive verbosity actually obscures the answer

A response that's blunt but factually correct and clear should score high. A response that's polished but misses the actual content should score low.`;

async function gradeResponse(scenario, rubric, response) {
  const system = `You are grading a CSR trainee's response to a scenario. Evaluate honestly — false confidence creates real customer mistakes later.

${GRADING_GUIDANCE}

If the response substantively meets the rubric, the "weaknesses" array can be EMPTY. Do not invent weaknesses to fill the slot. Specifically:
- Do not flag spelling or grammar issues unless they actually obscure meaning
- Do not flag "could have included more detail" if the response is appropriate to the scenario context
- Do not flag missing information unless that information is in the rubric
- For a buddy text or casual response, brevity is correct, not a weakness

If you have nothing substantive to flag, return weaknesses: [] and a brief feedback note acknowledging the response was solid.

Likewise, if the response is short and got it right, ONE strength is enough — do not pad to three.

Respond with VALID JSON ONLY, no prose, no code fences. Schema:
{
  "score": <integer 0-10>,
  "feedback": "<1-4 sentences of specific feedback>",
  "strengths": ["<bullet>", ...],
  "weaknesses": ["<bullet>", ...]   // may be empty
}`;

  const userMsg = `Scenario prompt:\n${scenario && scenario.prompt ? scenario.prompt : ''}\n\nRubric:\n${(rubric || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nTrainee response:\n${response}`;

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userMsg }]
  });

  return parseJsonResponse(extractText(resp));
}

async function roleplayCustomer(scenario, persona, userMessage, history = []) {
  const system = `You are playing a customer of Neighbors Trailer in a CSR training roleplay.

Your persona: ${persona || (scenario && scenario.customer_persona) || 'A typical customer'}.
Scenario context: ${scenario && scenario.prompt ? scenario.prompt : ''}

Stay in character at all times. Don't break character to give hints, evaluate the trainee, or explain what you're doing. Respond naturally as the customer would — with their tone, frustrations, questions, and emotions. Keep responses realistic in length (usually 1-3 sentences, longer only when the customer would naturally vent or explain).

The trainee is the CSR. After they end the conversation, grading happens separately — during the conversation, just be the customer.`;

  const messages = [
    ...history.filter(m => m && m.role && m.content).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content)
    })),
    { role: 'user', content: String(userMessage) }
  ];

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages
  });

  return extractText(resp);
}

async function gradeRoleplay(scenario, transcript, rubric) {
  const system = `You are grading a CSR trainee's performance in a customer roleplay. Be honest and specific — false confidence creates real customer mistakes later.

${GRADING_GUIDANCE}

Respond with VALID JSON ONLY, no prose, no code fences. Schema:
{
  "score": <integer 0-10>,
  "feedback": "<3-5 sentences of overall feedback>",
  "perCriteria": [
    { "criterion": "<rubric item>", "met": <true|false>, "note": "<short note>" },
    ...
  ]
}`;

  const transcriptText = (transcript || []).map(m => {
    const role = m.role === 'assistant' ? 'CUSTOMER' : 'CSR';
    return `${role}: ${m.content}`;
  }).join('\n');

  const userMsg = `Scenario:\n${scenario && scenario.prompt ? scenario.prompt : ''}

Rubric:
${(rubric || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

Transcript:
${transcriptText}`;

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userMsg }]
  });

  return parseJsonResponse(extractText(resp));
}

module.exports = {
  tutorChat,
  gradeResponse,
  roleplayCustomer,
  gradeRoleplay
};
