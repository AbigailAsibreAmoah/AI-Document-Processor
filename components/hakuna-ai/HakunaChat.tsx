'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { HakunaMessage } from './HakunaMessage';
import { Send, RotateCcw, Paperclip, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HakunaChatProps {
  onStartTour: () => void;
}

interface DocumentContext {
  name: string;
  text: string;
}

export function HakunaChat({ onStartTour }: HakunaChatProps) {
  const [input, setInput] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [documents, setDocuments] = useState<DocumentContext[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('all');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? null;
  const welcomeText = firstName
    ? `Hi ${firstName}! I'm Hakuna AI 🦁. I can help you understand documents and navigate the platform.`
    : `Hi, I'm Hakuna AI 🦁. I can help you understand documents and navigate the platform.`;

  const getToken = () => localStorage.getItem('token') ?? '';

  const documentContext = selectedDoc === 'all'
    ? documents
    : documents.filter(d => d.name === selectedDoc);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/hakuna/chat',
      headers: () => ({ Authorization: `Bearer ${getToken()}` }),
      body: { documentContext },
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: welcomeText }],
      }
    ],
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    setTokenLoaded(true);
    fetchDocuments();
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save assistant messages to DB when streaming completes
  useEffect(() => {
    if (!historyLoaded || status !== 'ready') return;
    const last = messages[messages.length - 1];
    if (!last || last.id === 'welcome') return;
    const text = last.parts
      .filter(p => p.type === 'text')
      .map(p => (p as { type: 'text'; text: string }).text)
      .join('');
    if (!text) return;
    fetch('/api/hakuna/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ role: last.role, content: text }),
    });
  }, [status]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/hakuna/documents', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/hakuna/messages', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const historyMessages = data.data.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: 'text', text: m.content }],
        }));
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            parts: [{ type: 'text', text: welcomeText }],
          },
          ...historyMessages,
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all conversation history?')) return;
    await fetch('/api/hakuna/messages', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      parts: [{ type: 'text', text: welcomeText }],
    }]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const result = await res.json();
      if (result.success) {
        // Notify user in chat
        setMessages(prev => [...prev, {
          id: `upload-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: `✅ **${file.name}** uploaded successfully! Processing has started — I'll be able to read it shortly. Refresh the page in a minute to load the updated document context.` }],
        }]);
        // Refresh document context after a delay
        setTimeout(fetchDocuments, 5000);
      } else {
        setMessages(prev => [...prev, {
          id: `upload-error-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: `❌ Upload failed: ${result.error}` }],
        }]);
      }
    } catch {
      console.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    fetch('/api/hakuna/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ role: 'user', content: input }),
    });
    sendMessage({ text: input });
    setInput('');
  };

  if (!tokenLoaded) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Document selector */}
      {documents.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="all">📁 All documents</option>
            {documents.map((d) => (
              <option key={d.name} value={d.name}>📄 {d.name}</option>
            ))}
          </select>
        </div>
      )}

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

        {(isLoading || uploading) && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-slate-500">
              {uploading ? 'Uploading document...' : 'Hakuna is thinking...'}
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

      <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onStartTour}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Replay Platform Tour
        </button>
        <button
          onClick={clearHistory}
          className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Clear history
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="Upload document"
          >
            <Paperclip className="h-5 w-5 text-slate-500" />
          </button>
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