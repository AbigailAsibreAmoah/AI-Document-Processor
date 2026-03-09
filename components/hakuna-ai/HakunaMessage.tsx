'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface HakunaMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  fontSize?: number;
  fontFamily?: string;
  isStreaming?: boolean;
}

export function HakunaMessage({
  message,
  isUser,
  timestamp,
  fontSize = 13.5,
  fontFamily = "'Crimson Pro', Georgia, serif",
  isStreaming = false,
}: HakunaMessageProps) {
  const [displayed, setDisplayed] = useState(isUser ? message : '');
  const prevMessage = useRef(message);

  useEffect(() => {
    if (isUser) {
      setDisplayed(message);
      return;
    }

    // If message grew (streaming in), animate the new characters
    if (message.startsWith(prevMessage.current)) {
      const newChars = message.slice(prevMessage.current.length);
      let i = 0;
      const interval = setInterval(() => {
        if (i >= newChars.length) {
          clearInterval(interval);
          prevMessage.current = message;
          return;
        }
        setDisplayed(prev => prev + newChars[i]);
        i++;
      }, 8); // ← adjust speed here: lower = faster, higher = slower
      return () => clearInterval(interval);
    } else {
      // Message changed entirely (new message)
      setDisplayed('');
      prevMessage.current = '';
      let i = 0;
      const interval = setInterval(() => {
        if (i >= message.length) {
          clearInterval(interval);
          prevMessage.current = message;
          return;
        }
        setDisplayed(prev => prev + message[i]);
        i++;
      }, 8);
      return () => clearInterval(interval);
    }
  }, [message, isUser]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div style={{ maxWidth: '84%' }}>

        {/* Hakuna label */}
        {!isUser && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '5px', paddingLeft: '4px',
          }}>
            <span style={{ fontSize: '12px' }}>🦁</span>
            <span style={{
              fontSize: '10px',
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(90deg, #E8B84B, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}>Hakuna</span>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          padding: '11px 15px',
          background: isUser
            ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%)'
            : 'linear-gradient(135deg, #1e2433 0%, #1a2035 50%, #1e1f2e 100%)',
          border: isUser
            ? '1px solid rgba(139,92,246,0.4)'
            : '1px solid rgba(99,102,241,0.2)',
          boxShadow: isUser
            ? '0 4px 16px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {isUser && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)',
            }} />
          )}
          {!isUser && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(212,168,67,0.3), transparent)',
            }} />
          )}

          {isUser ? (
            <p style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.65',
              whiteSpace: 'pre-wrap',
              color: '#e0e7ff',
              fontFamily,
              fontWeight: '500',
              margin: 0,
            }}>
              {message}
            </p>
          ) : (
            <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.65', color: '#c8d1e8', fontFamily }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p style={{ margin: '0 0 8px 0', fontFamily, fontSize: `${fontSize}px`, color: '#c8d1e8', lineHeight: '1.65' }}>
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: '#E8B84B', fontWeight: '600' }}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ color: '#a78bfa', fontStyle: 'italic' }}>{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ margin: '6px 0', paddingLeft: '18px', color: '#c8d1e8' }}>{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ margin: '6px 0', paddingLeft: '18px', color: '#c8d1e8' }}>{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li style={{ margin: '3px 0', fontFamily, fontSize: `${fontSize}px`, color: '#c8d1e8' }}>{children}</li>
                  ),
                  code: ({ children }) => (
                    <code style={{
                      background: 'rgba(99,102,241,0.2)',
                      padding: '2px 6px', borderRadius: '4px',
                      fontSize: `${fontSize - 1}px`, fontFamily: 'monospace', color: '#a78bfa',
                    }}>{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{
                      borderLeft: '3px solid #E8B84B', paddingLeft: '12px',
                      margin: '8px 0', color: '#9ca3af', fontStyle: 'italic',
                    }}>{children}</blockquote>
                  ),
                  h1: ({ children }) => (
                    <h1 style={{ color: '#E8B84B', fontSize: `${fontSize + 4}px`, margin: '8px 0 4px', fontFamily }}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{ color: '#E8B84B', fontSize: `${fontSize + 2}px`, margin: '8px 0 4px', fontFamily }}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{ color: '#E8B84B', fontSize: `${fontSize + 1}px`, margin: '6px 0 4px', fontFamily }}>{children}</h3>
                  ),
                }}
              >
                {displayed}
              </ReactMarkdown>
              {isStreaming && (
                <span style={{
                  display: 'inline-block', width: '2px', height: `${fontSize}px`,
                  background: '#E8B84B', marginLeft: '2px', verticalAlign: 'text-bottom',
                  animation: 'hk-cursor-blink 0.7s step-end infinite',
                }} />
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p style={{
          fontSize: '10px', color: '#374151', marginTop: '4px',
          paddingLeft: isUser ? '0' : '6px',
          paddingRight: isUser ? '6px' : '0',
          fontFamily: "'Cinzel', serif", letterSpacing: '0.04em',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}