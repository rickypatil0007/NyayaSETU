// Free-tier only, by design: Groq (primary, fast + generous free rate limits,
// good fit for a sequential multi-agent loop) with Gemini as fallback if Groq
// rate-limits or errors mid-audit. Verify current model IDs in each provider's
// dashboard before demo day — free-tier model names get deprecated/renamed
// more often than paid ones.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type LLMOpts = { temperature?: number };

export async function callLLM(prompt: string, opts: LLMOpts = {}): Promise<string> {
  try {
    return await callGroq(prompt, opts);
  } catch (err) {
    console.warn('[llm] Groq failed, falling back to Gemini:', (err as Error).message);
    return await callGemini(prompt, opts);
  }
}

async function callGroq(prompt: string, opts: LLMOpts): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature ?? 0.2,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callGemini(prompt: string, opts: LLMOpts): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: opts.temperature ?? 0.2 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text as string;
}
