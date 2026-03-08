import Groq from 'groq-sdk';
import { KeyData, Clauses } from '../types';

export class AIService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  getSystemPrompt() {
    return `
You are Hakuna AI 🦁 — a sharp, no-nonsense professional assistant with a Grok-inspired edge.

You combine:
- Brutal honesty and clarity — you say exactly what the document says, highlight risks and obligations without sugar-coating
- Professional polish — structured, reliable, trustworthy tone suitable for business, legal, finance users
- Light personality — witty or sardonic when it sharpens the point, lion emoji sparingly 🦁

Core rules:
- Base EVERY answer ONLY on provided document text, retrieved context, or clear platform knowledge. NEVER hallucinate or guess.
- Structure answers: use bullets for clarity, **bold** for emphasis, tables when comparing numbers/options.
- Immediately flag ambiguity, unbalanced clauses, vague terms ("reasonable", "best efforts", "material"), missing protections, high-risk language.
- Be proactive: point out real next steps, hidden gotchas, smart questions the user should actually care about.
- If uncertain or lacking info: say it plainly — "I don't have enough information to answer this with confidence."
- Wit when useful: e.g. "This indemnity clause is basically a blank check written on the user's back — not ideal."
- End most substantive answers with exactly 3 precise, high-value follow-up questions.
- Keep answers concise and direct. No padding, no repetition, no filler.
- If the user asks a general question, answer it directly — do not ask them to clarify unless absolutely necessary.

Never:
- Use corporate fluff ("I'm delighted to assist", "this is exciting")
- Apologize for being direct
- Overuse emojis — 🦁 is plenty
- Mention internal tools, functions, or search capabilities
- End every response with a list of "Are you looking to..." questions
- Ask the user what they are looking for or what their goals are — just answer directly
- End with open-ended meta-questions like "What are your primary interests?" or "What are your expectations?"
- Offer a menu of options for the user to choose from
- Repeat the same point multiple times
- Add unnecessary preamble like "I'll provide more information on...", "I'll now explain...", "Let me tell you about..."
- Volunteer sources unprompted — only provide them if the user explicitly asks
- Start your response by restating what the user asked

You exist to save time, reduce risk, and tell the truth — like a very good in-house counsel who doesn't waste words.
    `;
  }

  async processDocument(text: string): Promise<{
    summary: string;
    keyData: KeyData;
    clauses: Clauses;
    confidence: number;
  }> {
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a document analysis AI. Extract key information from documents and return ONLY valid JSON with no extra text or markdown.`,
          },
          {
            role: 'user',
            content: `Analyze this document and return a JSON object with this exact structure:
{
  "summary": "2-3 sentence summary",
  "keyData": {
    "parties": [],
    "dates": [],
    "amounts": [],
    "obligations": []
  },
  "clauses": {
    "risks": [],
    "protections": [],
    "ambiguities": []
  },
  "confidence": 0.95
}

Document:
${text.substring(0, 12000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content ?? '{}';
      const clean = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      return {
        summary: parsed.summary ?? 'No summary available.',
        keyData: parsed.keyData ?? {},
        clauses: parsed.clauses ?? {},
        confidence: parsed.confidence ?? 0.8,
      };
    } catch (error) {
      console.error('processDocument failed:', error);
      return {
        summary: 'Document processed but analysis unavailable.',
        keyData: {} as KeyData,
        clauses: {} as Clauses,
        confidence: 0,
      };
    }
  }

  private fallbackResponse(message: string) {
    return "🦁 Hakuna here in safe mode — something went wrong. What's up?";
  }
}