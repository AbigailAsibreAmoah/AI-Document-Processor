'use client';

interface HakunaMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function HakunaMessage({ message, isUser, timestamp }: HakunaMessageProps) {
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
          {/* Subtle shimmer line on user bubble */}
          {isUser && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)',
            }} />
          )}
          {/* Subtle accent on Hakuna bubble */}
          {!isUser && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(212,168,67,0.3), transparent)',
            }} />
          )}

          <p style={{
            fontSize: '13.5px',
            lineHeight: '1.65',
            whiteSpace: 'pre-wrap',
            color: isUser ? '#e0e7ff' : '#c8d1e8',
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontWeight: isUser ? '500' : '400',
            margin: 0,
          }}>
            {message}
          </p>
        </div>

        {/* Timestamp */}
        <p style={{
          fontSize: '10px',
          color: '#374151',
          marginTop: '4px',
          paddingLeft: isUser ? '0' : '6px',
          paddingRight: isUser ? '6px' : '0',
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.04em',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}