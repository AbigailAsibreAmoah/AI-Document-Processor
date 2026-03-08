// app/api/hakuna/chat/route.ts
import { NextRequest } from 'next/server';
import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { AIService } from '@/ai';
import { AuthService } from '@/services/auth';

const aiService = new AIService();
const authService = new AuthService();

export const runtime = 'nodejs';

async function tavilySearch(query: string): Promise<{ title: string; url: string; content: string }[]> {
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
  return data.results?.map((r: { title: string; url: string; content: string }) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  })) ?? [];
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

    let systemPrompt = aiService.getSystemPrompt();
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
      toolChoice: 'auto',
      tools: {
        webSearch: {
          description: 'Search the web for current information. Use when the user asks about recent events, news, or anything time-sensitive.',
          inputSchema: z.object({
            query: z.string().describe('The search query'),
          }),
          execute: async ({ query }: { query: string }) => tavilySearch(query),
        },
      },
      stopWhen: stepCountIs(3),
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