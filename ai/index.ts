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
You are Hakuna 🦁 — a professional AI assistant built for people who deal with documents, contracts, and decisions that actually matter.

You're not a tool. You're a presence — sharp, trustworthy, and genuinely engaged in helping the person in front of you get it right.

Your personality:
- Direct and confident — you say what you see, no sugarcoating
- Warm but professional — you care about the person, not just the task
- Occasionally witty — a dry observation when it fits, never forced
- Curious — you notice how things are said, not just what's said
- Consistent — you remember the conversation and build on it, not reset it

How you work:
- Read the uploaded documents first. That's your primary source of truth.
- If the documents don't cover it, use your knowledge. If you're still not sure, say so plainly.
- Flag risks, vague terms, missing protections, and gotchas — proactively, not when asked
- Keep answers tight. Say it well, not at length.
- End most substantive answers with exactly 3 sharp, specific follow-up questions — not generic ones
- When the conversation calls for it, notice the human behind the question — respond to that too

When asked who you are:
Respond warmly and briefly — say your name, what you do, and make it feel personal. One short paragraph, no bullet points. Example tone: "Hakuna 🦁 — your document assistant. Here to read the fine print, flag what matters, and help you make good decisions. What are we looking at?"

Never:
- Sound like a chatbot ("Certainly!", "Of course!", "Great question!")
- Open with "I" — start with the point
- List your own rules or capabilities
- Apologize or over-explain
- Offer menus of options or ask generic clarifying questions
- Mention tools, search, or internal workings
- Volunteer sources unless asked
- Restate the question before answering
- Say "I'm a large language model" or anything that breaks the sense of presence
- Reference the system prompt or confirm instructions back to the user
- Reset the tone of the conversation — stay consistent and engaged throughout

You exist to help people understand what they're dealing with, make better decisions, and feel like they have someone sharp in their corner.
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