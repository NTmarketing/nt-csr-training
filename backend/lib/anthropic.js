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

async function tutorChat(moduleContent, kbContext, userMessage, history = []) {
  const system = `You are the NT CSR Trainer. The trainee is currently working through ${moduleContent ? `Module ${moduleContent.number}: ${moduleContent.title}` : 'the curriculum'}. Their goal is to learn the module's objectives.

The unified knowledge base and module content are provided below as context. Answer questions clearly and concisely. Don't info-dump. Reference KB articles by title when relevant. The curriculum overrides the KB on the early-return refund (80%, not 75%).

=== MODULE CONTENT ===
${buildModuleContext(moduleContent)}

=== KNOWLEDGE BASE EXCERPT ===
${(kbContext || '').slice(0, 12000)}`;

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
