'use client';

import { useState, useEffect } from 'react';
import { HakunaButton } from './HakunaButton';
import { HakunaPanel } from './HakunaPanel';
import { useAuth } from '../../lib/auth-context';

type TourStep = {
  target: string;
  message: string;
};

export function HakunaAI() {
  const { user } = useAuth();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [preselectDoc, setPreselectDoc] = useState<string | null>(null);

  const steps: TourStep[] = [
    { target: '[data-tour="upload"]', message: 'Upload your first document here.' },
    { target: '[data-tour="documents"]', message: 'View all processed documents here.' },
    { target: '[data-tour="dashboard"]', message: 'Your AI insights appear here.' },
  ];

  useEffect(() => {
    if (!user) return;

    const hasCompletedTour = localStorage.getItem('hakuna-tour-completed');
    if (!hasCompletedTour) {
      setTimeout(() => setRunTour(true), 1000);
    }

    checkUserContext();
  }, [user]);

  // Listen for "Ask Hakuna" button events from document detail page
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ documentName: string }>;
      const docName = custom.detail?.documentName ?? null;
      setPreselectDoc(docName);
      setIsPanelOpen(true);
    };

    window.addEventListener('hakuna:open', handleOpen);
    return () => window.removeEventListener('hakuna:open', handleOpen);
  }, []);

  // Also check localStorage on mount in case it was set before panel was ready
  useEffect(() => {
    const stored = localStorage.getItem('hakuna_preselect_doc');
    if (stored) {
      setPreselectDoc(stored);
      localStorage.removeItem('hakuna_preselect_doc');
    }
  }, [isPanelOpen]);

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
      setTourIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    localStorage.setItem('hakuna-tour-completed', 'true');
    setRunTour(false);
    setTourIndex(0);
  };

  const skipTour = () => {
    localStorage.setItem('hakuna-tour-completed', 'true');
    setRunTour(false);
    setTourIndex(0);
  };

  const startTour = () => {
    setIsPanelOpen(false);
    setTimeout(() => setRunTour(true), 300);
  };

  return (
    <>
      <HakunaButton onClick={() => setIsPanelOpen(true)} />

      <HakunaPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setPreselectDoc(null);
        }}
        onStartTour={startTour}
        preselectDoc={preselectDoc}
      />

      {runTour && (
        <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <p className="text-sm text-slate-700 mb-6">
              {steps[tourIndex]?.message}
            </p>
            <div className="flex justify-between gap-3">
              <button
                onClick={nextStep}
                className="bg-slate-700 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-slate-800 transition"
              >
                Got it
              </button>
              <button
                onClick={skipTour}
                className="border border-slate-300 px-4 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showHint && (
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-xl p-4 max-w-xs z-40 animate-slide-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦁</span>
            <div className="flex-1">
              <p className="text-sm text-slate-700 mb-3">{hintMessage}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowHint(false); setRunTour(true); }}
                  className="text-xs px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Show me
                </button>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-xs px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
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