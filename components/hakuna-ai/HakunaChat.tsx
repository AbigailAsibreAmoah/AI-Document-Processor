'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { HakunaMessage } from './HakunaMessage';
import { Send, RotateCcw } from 'lucide-react';

interface HakunaChatProps {
  onStartTour: () => void;
}

export function HakunaChat({ onStartTour }: HakunaChatProps) {
  const [input, setInput] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    setTokenLoaded(true);
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/hakuna/chat',
      headers: () => ({
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      }),
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: "Hi, I'm Hakuna AI 🦁. I can help you understand documents and navigate the platform." }],
      }
    ],
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  if (!tokenLoaded) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <HakunaMessage
            key={msg.id}
            message={msg.parts
              .filter((p) => p.type === 'text')
              .map((p) => (p as { type: 'text'; text: string }).text)
              .join('')}
            isUser={msg.role !== 'assistant'}
            timestamp={new Date()}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-slate-500">
              Hakuna is thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm p-2">
            {error.message || 'Something went wrong — try again?'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 border-t border-slate-200">
        <button
          onClick={onStartTour}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Replay Platform Tour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Hakuna anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}