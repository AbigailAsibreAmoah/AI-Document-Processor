// app/api/hakuna/chat/route.ts
import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';
import { AIService } from '@/ai';
import { AuthService } from '@/services/auth';

const aiService = new AIService();
const authService = new AuthService();

export const runtime = 'nodejs';

async function tavilySearch(query: string): Promise<string> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
      }),
    });
    const data = await response.json();
    if (!data.results?.length) return '';
    return data.results
      .map((r: { title: string; url: string; content: string }) =>
        `${r.title}: ${r.content}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

function needsWebSearch(message: string): boolean {
  const keywords = [
    'latest', 'current', 'today', 'news', 'recent', 'now', 'price',
    'market', 'economy', 'stock', 'weather', '2025', '2026', 'update',
    'happening', 'right now', 'this week', 'this month', 'this year'
  ];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    await authService.verifyToken(token);

    const { messages, documentContext } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get last user message
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    const lastText = lastUserMessage?.parts
      ?.filter((p: { type: string }) => p.type === 'text')
      ?.map((p: { type: string; text?: string }) => p.text ?? '')
      ?.join('') ?? lastUserMessage?.content ?? '';

    // Build system prompt
    let systemPrompt = aiService.getSystemPrompt();

    // Auto web search if needed
    if (lastText && needsWebSearch(lastText)) {
      const webResults = await tavilySearch(lastText);
      if (webResults) {
        systemPrompt += `\n\nLIVE WEB SEARCH RESULTS (use these for current information):\n\n${webResults}`;
      }
    }

    // Inject document context
    if (documentContext && documentContext.length > 0) {
      const docText = documentContext
        .map((d: { name: string; text: string }) => `--- ${d.name} ---\n${d.text}`)
        .join('\n\n');
      systemPrompt += `\n\nUSER'S UPLOADED DOCUMENTS (use these to answer questions):\n\n${docText}`;
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Hakuna chat error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}