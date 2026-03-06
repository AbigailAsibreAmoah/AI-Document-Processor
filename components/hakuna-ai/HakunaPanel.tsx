'use client';

import { X } from 'lucide-react';
import { HakunaChat } from './HakunaChat';

interface HakunaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export function HakunaPanel({ isOpen, onClose, onStartTour }: HakunaPanelProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🦁</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hakuna AI</h2>
              <p className="text-xs text-amber-100">Your AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100%-73px)]">
          <HakunaChat onStartTour={onStartTour} />
        </div>
      </div>
    </>
  );
}
