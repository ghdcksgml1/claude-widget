import { useEffect, useState } from 'react';

interface LoadingDisplayProps {
  messages: string[];
}

export function LoadingDisplay({ messages }: LoadingDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[currentIndex] ?? 'Generating...';

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>

      {/* Message */}
      <div className="text-center">
        <p
          key={currentMessage}
          className="text-slate-300 text-lg font-medium animate-pulse"
        >
          {currentMessage}
        </p>
        {messages.length > 1 && (
          <div className="flex gap-1.5 justify-center mt-3">
            {messages.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === currentIndex ? 'bg-violet-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
