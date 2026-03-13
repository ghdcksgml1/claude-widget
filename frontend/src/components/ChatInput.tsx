import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-xl overflow-hidden">
        <textarea
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 px-5 pt-4 pb-2 resize-none outline-none text-base leading-relaxed min-h-[80px] max-h-48"
          placeholder="Ask Claude to create a widget... (Enter to send, Shift+Enter for newline)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={3}
        />
        <div className="flex justify-end px-4 pb-3">
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors duration-150"
          >
            {disabled ? 'Generating...' : 'Send'}
          </button>
        </div>
      </div>
      <p className="text-center text-slate-500 text-xs mt-3">
        Powered by Claude claude-opus-4-6 · show_widget tool
      </p>
    </div>
  );
}
