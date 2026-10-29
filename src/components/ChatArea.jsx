import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  User,
  Calculator,
  Search,
  Terminal,
  CloudSun,
  Copy,
  Check,
} from 'lucide-react';
import ThoughtBox from './ThoughtBox';
import ToolCallCard from './ToolCallCard';
import { Button } from './ui/button';

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
    try {
      if (text) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const lines = (text || '').split('\n');

  return (
    <div className="relative group/msg w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute -top-1 right-0 opacity-80 sm:opacity-0 sm:group-hover/msg:opacity-100 transition-opacity h-6 w-6 sm:h-7 sm:w-7 text-zinc-400 hover:text-zinc-200"
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>

      <div className="prose-clean text-xs sm:text-sm text-zinc-200 leading-relaxed pt-1 break-words">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-semibold text-zinc-100 mt-3 sm:mt-4 mb-1 sm:mb-1.5 flex items-center gap-1.5">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base sm:text-lg font-bold text-white mt-4 sm:mt-5 mb-1.5 sm:mb-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 sm:ml-5 mb-1 text-zinc-300">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
              </li>
            );
          }
          if (line.trim() === '---') {
            return <hr key={idx} className="border-zinc-800 my-2" />;
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1.5 sm:h-2" />;
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
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-zinc-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono text-[11px] border border-zinc-700/50 break-all">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 break-all">$1</a>');
}

export default function ChatArea({
  messages = [],
  activeTask = null,
  onSelectPrompt,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, activeTask]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 py-4 sm:py-6 pb-6 flex flex-col items-center w-full min-w-0">
      <div className="w-full max-w-3xl flex flex-col gap-4 sm:gap-6 min-w-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center text-center my-auto py-6 sm:py-12 gap-4 sm:gap-5 select-none w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-0.5 sm:mb-1 animate-pulseGlow flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5 max-w-lg px-2">
              <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-white">
                What shall <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">V18.ai</span> solve today?
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Autonomous ReAct intelligence orchestrating live web tools, global atmospheric data, sandboxed computation, and persistent memory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-2xl mt-2 sm:mt-4">
              {STARTER_PROMPTS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPrompt(item.prompt)}
                    className="p-2.5 sm:p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700/80 text-left transition-all group flex flex-col gap-1 shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color} flex-shrink-0`} />
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
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
              className={`flex gap-2 sm:gap-3.5 w-full min-w-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <div
                className={`flex flex-col gap-2 max-w-[88%] sm:max-w-[82%] min-w-0 ${
                  msg.role === 'user'
                    ? 'bg-zinc-800/90 border border-zinc-700/60 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-zinc-100 text-xs sm:text-sm shadow-sm break-words overflow-hidden'
                    : 'flex-1 min-w-0 overflow-hidden'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</div>
                ) : (
                  <div className="flex flex-col gap-2.5 sm:gap-3 w-full min-w-0 overflow-hidden">
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
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Active Running Task State */}
        {activeTask && (
          <div className="flex gap-2 sm:gap-3.5 w-full min-w-0 justify-start animate-in fade-in duration-300">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping flex-shrink-0" />
                <span className="truncate">{activeTask.statusText || 'Reasoning...'}</span>
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
