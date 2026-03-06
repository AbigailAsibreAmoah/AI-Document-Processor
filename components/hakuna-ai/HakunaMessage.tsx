'use client';

interface HakunaMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function HakunaMessage({ message, isUser, timestamp }: HakunaMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1 px-2">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
