import React, { useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Sparkles,
  Calculator,
  Search,
  Terminal,
  Database,
  Clock,
  CloudSun,
} from 'lucide-react';
import { Button } from './ui/button';

const QUICK_TOOL_PILLS = [
  { label: 'Weather', prefix: "What's the weather in ", icon: CloudSun },
  { label: 'Calculate', prefix: 'Calculate: ', icon: Calculator },
  { label: 'Search', prefix: 'Search web for: ', icon: Search },
  { label: 'Run JS', prefix: 'Run JS script: ', icon: Terminal },
  { label: 'Memory', prefix: 'Store in memory: ', icon: Database },
  { label: 'Time', prefix: 'What is the current time in ', icon: Clock },
];

export default function InputBox({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  const handlePillClick = (prefix) => {
    setInput((prev) => (prev ? `${prefix}${prev}` : prefix));
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 flex flex-col items-center pointer-events-none z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
      <div className="w-full max-w-3xl pointer-events-auto flex flex-col gap-2">
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/60 p-2.5 flex flex-col gap-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all">
          {/* Quick Helper Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Tools:</span>
            </span>
            {QUICK_TOOL_PILLS.map((pill, idx) => {
              const IconComp = pill.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePillClick(pill.prefix)}
                  className="px-2 py-0.5 rounded-full bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <IconComp className="w-3 h-3" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Text input row */}
          <div className="flex items-end gap-2 px-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Assign a multi-step task or question... (e.g. 'What is the weather in Tokyo and calculate 45 * 28?')"
              className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-zinc-100 placeholder:text-zinc-500 py-1.5 min-h-[28px] max-h-[180px] leading-relaxed"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop execution"
                className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 flex items-center justify-center transition-transform active:scale-95 flex-shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!input.trim()}
                title="Send task (Enter)"
                className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-95 flex-shrink-0 shadow-sm"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-500 tracking-tight">
          V18.ai Multi-Step ReAct Agent executes client tools with real live data. <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]">Enter</kbd> to send.
        </div>
      </div>
    </div>
  );
}
