'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo } from 'react';
import { HakunaMessage } from './HakunaMessage';
import { Send, RotateCcw, Paperclip, Trash2, Type } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HakunaChatProps {
  onStartTour: () => void;
  preselectDoc?: string | null;
}

interface DocumentContext {
  name: string;
  text: string;
}

// Module-level — prevents infinite re-render loop
const extractText = (msg: { parts: { type: string; text?: unknown }[] }) =>
  msg.parts
    .filter(p => p.type === 'text' && typeof p.text === 'string')
    .map(p => p.text as string)
    .filter(Boolean)
    .join('');

export function HakunaChat({ onStartTour, preselectDoc }: HakunaChatProps) {
  const [input, setInput] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [documents, setDocuments] = useState<DocumentContext[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('all');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fontSize, setFontSize] = useState(13.5);
  const [fontFamily, setFontFamily] = useState("'Crimson Pro', Georgia, serif");
  const [showFontControls, setShowFontControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? null;
  const welcomeText = firstName
    ? `Hi ${firstName}! I'm Hakuna AI 🦁. I can help you understand documents and navigate the platform.`
    : `Hi, I'm Hakuna AI 🦁. I can help you understand documents and navigate the platform.`;

  const getToken = () => localStorage.getItem('token') ?? '';
  const documentContextRef = useRef<DocumentContext[]>([]);

  const documentContext = useMemo(
    () => selectedDoc === 'all' ? documents : documents.filter(d => d.name === selectedDoc),
    [documents, selectedDoc]
  );

  useEffect(() => {
    documentContextRef.current = documentContext;
  }, [documentContext]);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/hakuna/chat',
      headers: () => ({ Authorization: `Bearer ${getToken()}` }),
      body: () => ({ documentContext: documentContextRef.current }),
    }),
    messages: [{
      id: 'welcome',
      role: 'assistant',
      parts: [{ type: 'text', text: welcomeText }],
    }],
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

  // Save messages to DB
  useEffect(() => {
    if (!historyLoaded || status !== 'ready') return;
    const last = messages[messages.length - 1];
    if (!last || last.id === 'welcome') return;
    const text = extractText(last);
    if (!text) return;
    fetch('/api/hakuna/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ role: last.role, content: text }),
    });
  }, [status]);

  // Auto-select document when preselectDoc changes
  useEffect(() => {
    if (!preselectDoc) return;
    if (documents.length > 0) {
      const match = documents.find(d => d.name === preselectDoc);
      if (match) {
        setSelectedDoc(preselectDoc);
        setTimeout(() => {
          sendMessage({ text: `I just opened "${preselectDoc}" — give me a quick summary of what I should know about it.` });
        }, 400);
      }
    }
  }, [preselectDoc, documents]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/hakuna/documents', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
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
          id: m.id, role: m.role,
          parts: [{ type: 'text', text: m.content ?? '' }],
        }));
        setMessages([{
          id: 'welcome', role: 'assistant',
          parts: [{ type: 'text', text: welcomeText }],
        }, ...historyMessages]);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
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
      id: 'welcome', role: 'assistant',
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
        method: 'POST', body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, {
          id: `upload-${Date.now()}`, role: 'assistant',
          parts: [{ type: 'text', text: `✅ **${file.name}** uploaded! Processing started — I'll be able to read it shortly.` }],
        }]);
        setTimeout(fetchDocuments, 5000);
      } else {
        setMessages(prev => [...prev, {
          id: `upload-error-${Date.now()}`, role: 'assistant',
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ role: 'user', content: input }),
    });
    sendMessage({ text: input });
    setInput('');
  };

  if (!tokenLoaded) return null;

  return (
    <div className="flex flex-col h-full" style={{
      background: 'linear-gradient(160deg, #0d1117 0%, #111827 40%, #1a1f2e 100%)',
    }}>
      <style>{`
        .hk-scrollbar::-webkit-scrollbar { width: 4px; }
        .hk-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hk-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
        .hk-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }

        @keyframes hk-dot-pulse {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes hk-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hk-input:focus {
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
        }
        .hk-send:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(99,102,241,0.5) !important;
          transform: translateY(-1px);
        }
        .hk-attach:hover:not(:disabled) {
          background: rgba(212,168,67,0.18) !important;
          border-color: rgba(212,168,67,0.45) !important;
        }
        .hk-select option { background: #1e2433; color: #c8d1e8; }
        .hk-font-select option { background: #1e2433; color: #c8d1e8; }
      `}</style>

      {/* Document selector */}
      {documents.length > 0 && (
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(15,23,42,0.6)',
        }}>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="hk-select"
            style={{
              width: '100%', fontSize: '11px', padding: '6px 10px',
              background: 'linear-gradient(135deg, #1e2433 0%, #1a1f30 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '8px', color: '#a5b4fc',
              fontFamily: "'Cinzel', serif", letterSpacing: '0.04em',
              outline: 'none', cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <option value="all">📁 All documents</option>
            {documents.map((d) => (
              <option key={d.name} value={d.name}>📄 {d.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Font controls */}
      {showFontControls && (
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(15,23,42,0.8)',
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: "'Cinzel', serif" }}>Font:</span>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="hk-font-select"
            style={{
              fontSize: '11px', padding: '4px 8px',
              background: '#1e2433', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px', color: '#a5b4fc',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="'Crimson Pro', Georgia, serif">Crimson Pro</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="system-ui, sans-serif">System</option>
            <option value="'Courier New', monospace">Courier New</option>
          </select>
          <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: "'Cinzel', serif" }}>Size:</span>
          <input
            type="range" min={11} max={18} step={0.5}
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            style={{ width: '80px', accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '10px', color: '#6366f1', fontFamily: "'Cinzel', serif" }}>
            {fontSize}px
          </span>
        </div>
      )}

      {/* Messages */}
      <div
        className="hk-scrollbar flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
      >
        {messages.map((msg, index) => {
          const text = extractText(msg);
          if (!text) return null;
          return (
            <HakunaMessage
              key={msg.id}
              message={text}
              isUser={msg.role !== 'assistant'}
              timestamp={new Date()}
              fontSize={fontSize}
              fontFamily={fontFamily}
              isStreaming={isLoading && index === messages.length - 1}
            />
          );
        })}

        {(isLoading || uploading) && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e2433 0%, #1a1f30 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '4px 18px 18px 18px',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: i === 1 ? '#D4A843' : '#6366f1',
                  animation: 'hk-dot-pulse 1.3s ease-in-out infinite',
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            color: '#f87171', fontSize: '12px', padding: '10px 14px',
            background: 'rgba(239,68,68,0.08)', borderRadius: '10px',
            border: '1px solid rgba(239,68,68,0.2)',
            fontFamily: "'Crimson Pro', serif",
          }}>
            {error.message || 'Something went wrong — try again?'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '6px 14px',
        borderTop: '1px solid rgba(99,102,241,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,12,20,0.7)',
      }}>
        <button
          onClick={onStartTour}
          style={{
            fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4b5563', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
        >
          <RotateCcw size={10} /> Tour
        </button>

        <button
          onClick={() => setShowFontControls(v => !v)}
          style={{
            fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
            background: 'none', border: 'none', cursor: 'pointer',
            color: showFontControls ? '#a78bfa' : '#4b5563', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={e => (e.currentTarget.style.color = showFontControls ? '#a78bfa' : '#4b5563')}
        >
          <Type size={10} /> Font
        </button>

        <button
          onClick={clearHistory}
          style={{
            fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4b5563', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '10px 12px',
          borderTop: '1px solid rgba(99,102,241,0.15)',
          background: 'linear-gradient(180deg, #0f1117 0%, #0d1117 100%)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="hk-attach"
            style={{
              padding: '9px',
              background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.25)',
              borderRadius: '10px', color: '#D4A843',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Upload document"
          >
            <Paperclip size={15} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Hakuna anything..."
            disabled={isLoading}
            className="hk-input"
            style={{
              flex: 1, padding: '9px 14px',
              background: 'linear-gradient(135deg, #1a1f2e 0%, #1e2433 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '12px', color: '#c8d1e8',
              fontSize: '13px', fontFamily,
              outline: 'none', transition: 'all 0.2s',
            }}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="hk-send"
            style={{
              padding: '9px 13px',
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%)'
                : 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '10px',
              color: input.trim() && !isLoading ? '#e0e7ff' : '#374151',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: input.trim() && !isLoading ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <Send size={15} />
          </button>
        </div>

        {input.length > 0 && (
          <div style={{
            marginTop: '5px', paddingLeft: '52px',
            fontSize: '10px', color: '#374151',
            fontFamily: "'Cinzel', serif",
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <span style={{ color: input.length > 400 ? '#f87171' : '#4b5563' }}>
              {input.length} chars
            </span>
          </div>
        )}
      </form>
    </div>
  );
}