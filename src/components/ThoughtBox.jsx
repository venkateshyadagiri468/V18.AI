import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ThoughtBox({ thought, isLive = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thought) return null;

  return (
    <div className="w-full rounded-lg border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          {isLive ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : (
            <Brain className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span className="font-medium text-zinc-300">
            {isLive ? 'Reasoning chain (in progress)...' : 'Thought Process'}
          </span>
          {isLive && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
          <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 py-2.5 border-t border-zinc-800/60 bg-zinc-950/60">
          <div className="pl-3 border-l-2 border-amber-500/30 font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
            {thought}
          </div>
        </div>
      )}
    </div>
  );
}
