'use client';

import { X } from 'lucide-react';
import { HakunaChat } from './HakunaChat';

interface HakunaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  preselectDoc?: string | null;
}

export function HakunaPanel({ isOpen, onClose, onStartTour, preselectDoc }: HakunaPanelProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .hk-panel {
          background: linear-gradient(160deg, #0d1117 0%, #111827 40%, #1a1f2e 100%);
        }

        .hk-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e2a3a 100%);
          border-bottom: 1px solid rgba(139,92,246,0.4);
          position: relative;
          overflow: hidden;
        }

        .hk-pride-rock {
          position: absolute;
          bottom: 0; right: -10px;
          width: 100px; height: 50px;
          opacity: 0.07;
          background: linear-gradient(135deg, #D4A843 0%, transparent 70%);
          clip-path: polygon(25% 100%, 0% 55%, 18% 35%, 48% 25%, 75% 40%, 100% 100%);
        }

        .hk-stars {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 12% 18%, rgba(212,168,67,0.7) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 12%, rgba(232,184,75,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 28%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 22%, rgba(212,168,67,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 8%, rgba(167,139,250,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 38%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 65% 30%, rgba(212,168,67,0.3) 0%, transparent 100%);
        }

        .hk-sun {
          position: absolute;
          top: -20px; left: 50%;
          transform: translateX(-50%);
          width: 160px; height: 80px;
          background: radial-gradient(ellipse, rgba(212,168,67,0.12) 0%, rgba(99,102,241,0.08) 50%, transparent 70%);
          pointer-events: none;
        }

        .hk-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1035 100%);
          border: 1.5px solid rgba(212,168,67,0.6);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          box-shadow: 0 0 20px rgba(212,168,67,0.25), 0 0 40px rgba(99,102,241,0.2);
          position: relative;
          transition: box-shadow 0.3s ease;
        }
        .hk-avatar:hover {
          box-shadow: 0 0 28px rgba(212,168,67,0.4), 0 0 50px rgba(99,102,241,0.3);
        }

        .hk-avatar::after {
          content: '';
          position: absolute; inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(212,168,67,0.3);
          animation: hk-ring-pulse 2.5s ease-in-out infinite;
        }
        @keyframes hk-ring-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }

        .hk-title {
          font-family: 'Cinzel', serif;
          font-weight: 700; font-size: 17px;
          background: linear-gradient(135deg, #E8B84B 0%, #a78bfa 60%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .hk-subtitle {
          font-family: 'Crimson Pro', serif;
          font-style: italic; font-size: 11px;
          color: #6b7280; letter-spacing: 0.05em; margin-top: 2px;
        }

        .hk-close {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 50%; padding: 6px; color: #a78bfa;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .hk-close:hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          transform: rotate(90deg);
        }

        .hk-header-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.5) 30%, rgba(99,102,241,0.5) 70%, transparent 100%);
        }

        .hk-slide {
          transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .hk-online {
          position: absolute; bottom: 2px; right: 2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #34d399;
          border: 2px solid #0f172a;
          box-shadow: 0 0 6px rgba(52,211,153,0.6);
          animation: hk-online-pulse 2s ease-in-out infinite;
        }
        @keyframes hk-online-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(52,211,153,0.6); }
          50% { box-shadow: 0 0 12px rgba(52,211,153,0.9); }
        }
      `}</style>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
      )}

      <div
        className={`hk-panel hk-slide fixed top-0 right-0 h-full w-full md:w-96 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-4px 0 60px rgba(0,0,0,0.7), -1px 0 0 rgba(99,102,241,0.2)' }}
      >
        {/* Header */}
        <div className="hk-header p-4">
          <div className="hk-stars" />
          <div className="hk-sun" />
          <div className="hk-pride-rock" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div style={{ position: 'relative' }}>
                <div className="hk-avatar">🦁</div>
                <div className="hk-online" />
              </div>
              <div>
                <div className="hk-title">Hakuna AI</div>
                <div className="hk-subtitle">
                  {preselectDoc
                    ? `Viewing: ${preselectDoc.length > 24 ? preselectDoc.substring(0, 24) + '…' : preselectDoc}`
                    : 'Hakuna Matata — no worries'}
                </div>
              </div>
            </div>
            <button className="hk-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          <div className="hk-header-line" />
        </div>

        <div className="h-[calc(100%-77px)]">
          <HakunaChat onStartTour={onStartTour} preselectDoc={preselectDoc} />
        </div>
      </div>
    </>
  );
}