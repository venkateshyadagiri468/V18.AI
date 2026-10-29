import React, { useState } from 'react';
import {
  Wrench,
  ChevronDown,
  ChevronRight,
  Calculator,
  Search,
  Terminal,
  Database,
  Clock,
  CloudSun,
  Copy,
  Check,
  Code2,
  Eye,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const TOOL_ICONS = {
  calculator: Calculator,
  web_search: Search,
  get_weather: CloudSun,
  execute_js: Terminal,
  agent_memory: Database,
  get_time: Clock,
};

export default function ToolCallCard({ toolName, args, result, durationMs, isRunning = false }) {
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [activeTab, setActiveTab] = useState('observation'); // 'observation' | 'parameters'
  const [copied, setCopied] = useState(false);

  const IconComponent = TOOL_ICONS[toolName] || Wrench;
  const isError = result?.status === 'error';

  const handleCopy = (e) => {
    e.stopPropagation();
    const payload = activeTab === 'observation' ? JSON.stringify(result, null, 2) : JSON.stringify(args, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/70 overflow-hidden shadow-sm transition-all text-xs">
      {/* Tool Call Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 transition-colors select-none gap-1.5"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-mono font-medium text-zinc-200 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">{toolName}</span>
            {isRunning ? (
              <Badge variant="cyan" className="animate-pulse py-0 px-1.5 sm:px-2 text-[9px] sm:text-[10px] flex-shrink-0">
                Running...
              </Badge>
            ) : isError ? (
              <Badge variant="destructive" className="py-0 px-1.5 sm:px-2 text-[9px] sm:text-[10px] flex-shrink-0">
                Failed
              </Badge>
            ) : (
              <Badge variant="success" className="py-0 px-1.5 sm:px-2 text-[9px] sm:text-[10px] flex-shrink-0">
                Success {durationMs !== undefined ? <span className="hidden xs:inline">({durationMs}ms)</span> : ''}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-500 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy JSON payload"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 flex-shrink-0"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </Button>

          <div className="text-zinc-500">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Tabs Body */}
      {isOpen && (
        <div className="border-t border-zinc-800/80 bg-zinc-900/20 p-2 sm:p-3 flex flex-col gap-2 sm:gap-2.5">
          {/* Tab buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 border-b border-zinc-800/60 pb-1.5 sm:pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('observation')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors flex items-center gap-1 sm:gap-1.5 ${
                activeTab === 'observation'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Eye className="w-3 h-3 flex-shrink-0" />
              <span>Observation<span className="hidden sm:inline"> Output</span></span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('parameters')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors flex items-center gap-1 sm:gap-1.5 ${
                activeTab === 'parameters'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Code2 className="w-3 h-3 flex-shrink-0" />
              <span>Arguments<span className="hidden sm:inline"> (Input)</span></span>
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'observation' ? (
            <div className="rounded-lg bg-zinc-950 p-2 sm:p-3 border border-zinc-800/70 overflow-x-auto max-h-48 sm:max-h-56">
              <pre className={`font-mono text-[10px] sm:text-[11px] leading-relaxed ${isError ? 'text-rose-400' : 'text-emerald-300'}`}>
                {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result || 'No output')}
              </pre>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-950 p-2 sm:p-3 border border-zinc-800/70 overflow-x-auto max-h-48 sm:max-h-56">
              <pre className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-zinc-300">
                {JSON.stringify(args || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
