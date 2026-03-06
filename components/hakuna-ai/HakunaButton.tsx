'use client';

import { useState } from 'react';

interface HakunaButtonProps {
  onClick: () => void;
}

export function HakunaButton({ onClick }: HakunaButtonProps) {
  const [isWinking, setIsWinking] = useState(false);

  const handleClick = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 300);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      aria-label="Open Hakuna AI Assistant"
    >
      <div className="relative w-12 h-12">
        {/* 3D Lion Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Mane */}
            <circle cx="50" cy="50" r="45" fill="#D97706" opacity="0.3" />
            <circle cx="50" cy="50" r="38" fill="#F59E0B" />
            
            {/* Face */}
            <ellipse cx="50" cy="55" rx="28" ry="25" fill="#FCD34D" />
            
            {/* Nose */}
            <ellipse cx="50" cy="60" rx="8" ry="6" fill="#92400E" />
            
            {/* Eyes */}
            {isWinking ? (
              <>
                <line x1="38" y1="48" x2="44" y2="48" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
                <circle cx="62" cy="48" r="4" fill="#92400E" />
              </>
            ) : (
              <>
                <circle cx="40" cy="48" r="4" fill="#92400E" />
                <circle cx="60" cy="48" r="4" fill="#92400E" />
              </>
            )}
            
            {/* Mouth */}
            <path d="M 42 68 Q 50 72 58 68" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-amber-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
    </button>
  );
}
