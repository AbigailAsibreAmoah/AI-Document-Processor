'use client';

import { useState, useEffect, useRef } from 'react';
import { HakunaButton } from './HakunaButton';
import { HakunaPanel } from './HakunaPanel';
import { useAuth } from '../../lib/auth-context';

type TourStep = {
  target: string;
  title: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function HakunaAI() {
  const { user } = useAuth();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [preselectDoc, setPreselectDoc] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      target: '[data-tour="dashboard"]',
      title: 'Dashboard',
      message: 'Your command center — see document stats, recent activity, and processing status at a glance.',
      position: 'right',
    },
    {
      target: '[data-tour="upload"]',
      title: 'Upload Documents',
      message: 'Upload any document here — contracts, reports, medical records, research papers. Hakuna will analyze it instantly.',
      position: 'right',
    },
    {
      target: '[data-tour="documents"]',
      title: 'Your Documents',
      message: 'All your processed documents live here. Click any document to see its full AI analysis, risks, and recommendations.',
      position: 'right',
    },
    {
      target: '[data-tour="hakuna-button"]',
      title: 'Hakuna AI',
      message: "This is me 🦁 — tap here anytime to ask questions about your documents or get help navigating the platform.",
      position: 'top',
    },
  ];

  useEffect(() => {
    if (!user) return;
    const hasCompletedTour = localStorage.getItem('hakuna-tour-completed');
    if (!hasCompletedTour) {
      setTimeout(() => setRunTour(true), 1200);
    }
    checkUserContext();
  }, [user]);

  useEffect(() => {
    if (!runTour) return;
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [runTour, tourIndex]);

  useEffect(() => {
    if (isPanelOpen) return;
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ documentName: string }>;
      setPreselectDoc(custom.detail?.documentName ?? null);
      setIsPanelOpen(true);
    };
    window.addEventListener('hakuna:open', handleOpen);
    return () => window.removeEventListener('hakuna:open', handleOpen);
  }, [isPanelOpen]);

  useEffect(() => {
    const stored = localStorage.getItem('hakuna_preselect_doc');
    if (stored) {
      setPreselectDoc(stored);
      localStorage.removeItem('hakuna_preselect_doc');
    }
  }, [isPanelOpen]);

  const updateSpotlight = () => {
    const step = steps[tourIndex];
    if (!step) return;

    const el = window.document.querySelector(step.target) as HTMLElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 8;

    const spotlight: SpotlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlightRect(spotlight);

    const tooltipWidth = 280;
    const tooltipHeight = 160;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding + 16;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding - 16;
        break;
      case 'bottom':
        top = rect.bottom + padding + 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        // Place above and to the left — clear of the button entirely
        top = rect.top - tooltipHeight - 32;
        left = rect.left - tooltipWidth - 16;
        break;
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 32));
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    setTooltipPos({ top, left });
  };

  const checkUserContext = async () => {
    try {
      const response = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data?.success && data.documents?.length === 0) {
        setTimeout(() => {
          setHintMessage('Upload your first document to start AI analysis.');
          setShowHint(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Hakuna context check failed:', error);
    }
  };

  const nextStep = () => {
    if (tourIndex < steps.length - 1) {
      setTourIndex(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    localStorage.setItem('hakuna-tour-completed', 'true');
    setRunTour(false);
    setTourIndex(0);
    setSpotlightRect(null);
  };

  const startTour = () => {
    setIsPanelOpen(false);
    setTourIndex(0);
    setTimeout(() => setRunTour(true), 300);
  };

  const currentStep = steps[tourIndex];

  return (
    <>
      <HakunaButton
        data-tour="hakuna-button"
        onClick={() => setIsPanelOpen(true)}
      />

      <HakunaPanel
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setPreselectDoc(null); }}
        onStartTour={startTour}
        preselectDoc={preselectDoc}
      />

      {/* SPOTLIGHT TOUR */}
      {runTour && spotlightRect && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlightRect.left}
                    y={spotlightRect.top}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx="10"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.72)"
                mask="url(#spotlight-mask)"
              />
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="10"
                fill="none"
                stroke="rgba(212,168,67,0.7)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: '280px',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e2a3a 100%)',
              border: '1px solid rgba(212,168,67,0.4)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
              animation: 'tour-fade-in 0.25s ease',
            }}
          >
            <style>{`
              @keyframes tour-fade-in {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {steps.map((_, i) => (
                  <div key={i} style={{
                    width: i === tourIndex ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === tourIndex
                      ? 'linear-gradient(90deg, #E8B84B, #a78bfa)'
                      : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
              <span style={{
                fontSize: '10px', color: '#4b5563',
                fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
              }}>
                {tourIndex + 1} / {steps.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '22px' }}>🦁</span>
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '13px', fontWeight: '700',
                background: 'linear-gradient(90deg, #E8B84B, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {currentStep.title}
              </span>
            </div>

            <p style={{
              fontSize: '13px', color: '#c8d1e8',
              lineHeight: '1.6', marginBottom: '16px',
              fontFamily: "'Crimson Pro', Georgia, serif",
            }}>
              {currentStep.message}
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={nextStep}
                style={{
                  flex: 1, padding: '8px 16px',
                  background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%)',
                  border: 'none', borderRadius: '8px',
                  color: '#e0e7ff', fontSize: '12px',
                  fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
                  cursor: 'pointer', fontWeight: '600',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {tourIndex === steps.length - 1 ? "Let's go 🦁" : 'Next →'}
              </button>
              <button
                onClick={completeTour}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '8px', color: '#4b5563',
                  fontSize: '12px', fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.05em', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              >
                Skip
              </button>
            </div>
          </div>
        </>
      )}

      {/* SMART HINT */}
      {showHint && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '24px',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '16px', maxWidth: '280px', zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🦁</span>
            <div>
              <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
                {hintMessage}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setShowHint(false); setRunTour(true); }}
                  style={{
                    fontSize: '11px', padding: '6px 12px',
                    background: '#1e293b', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                  }}
                >
                  Show me
                </button>
                <button
                  onClick={() => setShowHint(false)}
                  style={{
                    fontSize: '11px', padding: '6px 12px',
                    background: 'transparent', color: '#6b7280',
                    border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}