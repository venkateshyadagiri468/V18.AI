import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  User,
  Sparkles,
  Calculator,
  Search,
  Terminal,
  Clock,
  CloudSun,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import ThoughtBox from './ThoughtBox';
import ToolCallCard from './ToolCallCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const STARTER_PROMPTS = [
  {
    icon: CloudSun,
    title: 'Live Global Weather & Analysis',
    prompt: 'What is the current live weather in Tokyo and London right now?',
    color: 'text-cyan-400',
  },
  {
    icon: Calculator,
    title: 'Multi-Step Math & Memory',
    prompt: 'Calculate compound interest on $15,000 at 8% for 4 years and save to memory.',
    color: 'text-purple-400',
  },
  {
    icon: Search,
    title: 'Live Fact Search & Chronology',
    prompt: 'Search who founded DeepMind and calculate how many years ago it was founded (2010).',
    color: 'text-emerald-400',
  },
  {
    icon: Terminal,
    title: 'Code Sandbox & Time Resolver',
    prompt: 'Run JavaScript to generate the Fibonacci sequence up to 10 terms and check the current UTC time.',
    color: 'text-amber-400',
  },
];

function FormattedMessage({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = text.split('\n');

  return (
    <div className="relative group/msg w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute -top-1 right-0 opacity-0 group-hover/msg:opacity-100 transition-opacity h-7 w-7 text-zinc-400 hover:text-zinc-200"
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>

      <div className="prose-clean text-sm text-zinc-200 leading-relaxed pt-1">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-semibold text-zinc-100 mt-4 mb-1.5 flex items-center gap-1.5">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-white mt-5 mb-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 mb-1 text-zinc-300">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    </div>
  );
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-zinc-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono text-[11px] border border-zinc-700/50">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">$1</a>');
}

export default function ChatArea({
  messages = [],
  activeTask = null,
  onSelectPrompt,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTask]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 pb-40 flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center text-center my-auto py-12 gap-5 select-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-1 animate-pulseGlow">
              <Bot className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1.5 max-w-lg">
              <h1 className="text-2xl font-heading font-bold tracking-tight text-white">
                What shall <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">V18.ai</span> solve today?
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Autonomous ReAct intelligence orchestrating live web tools, global atmospheric data, sandboxed computation, and persistent memory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl mt-4">
              {STARTER_PROMPTS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPrompt(item.prompt)}
                    className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700/80 text-left transition-all group flex flex-col gap-1 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      "{item.prompt}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex gap-3.5 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`flex flex-col gap-2 max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-zinc-800/90 border border-zinc-700/60 rounded-2xl px-4 py-2.5 text-zinc-100 text-sm shadow-sm'
                    : 'flex-1 min-w-0'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    {/* Collapsible Chain of Thought */}
                    {msg.thought && <ThoughtBox thought={msg.thought} />}

                    {/* Tool Invocations */}
                    {msg.steps &&
                      msg.steps
                        .filter((s) => s.type === 'tool_call')
                        .map((step, sIdx) => (
                          <ToolCallCard
                            key={sIdx}
                            toolName={step.toolName}
                            args={step.args}
                            result={step.result}
                            durationMs={step.durationMs}
                          />
                        ))}

                    {/* Final Synthesized Content */}
                    {msg.content && <FormattedMessage text={msg.content} />}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Active Running Task State */}
        {activeTask && (
          <div className="flex gap-3.5 w-full justify-start animate-in fade-in duration-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>{activeTask.statusText || 'Reasoning...'}</span>
              </div>

              {activeTask.thought && (
                <ThoughtBox thought={activeTask.thought} isLive={true} />
              )}

              {activeTask.steps &&
                activeTask.steps
                  .filter((s) => s.type === 'tool_call')
                  .map((step, sIdx) => (
                    <ToolCallCard
                      key={sIdx}
                      toolName={step.toolName}
                      args={step.args}
                      result={step.result}
                      durationMs={step.durationMs}
                    />
                  ))}

              {activeTask.activeTool && !activeTask.steps?.some(s => s.toolName === activeTask.activeTool && s.result) && (
                <ToolCallCard
                  toolName={activeTask.activeTool}
                  args={{}}
                  isRunning={true}
                />
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
