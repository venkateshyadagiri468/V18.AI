import React from 'react';
import { Bot, Settings, Trash2, Menu, Cpu, Zap, Plus, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Header({
  agentState,
  provider,
  model,
  hasApiKey,
  onOpenSettings,
  onClearChat,
  onNewSession,
  onToggleSidebar,
}) {
  const getStatusBadge = () => {
    switch (agentState.status) {
      case 'thinking':
        return (
          <Badge variant="warning" className="animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1" />
            Reasoning & Planning...
          </Badge>
        );
      case 'acting':
        return (
          <Badge variant="cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse" />
            Invoking: {agentState.activeTool || 'Tool'}
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mr-1" />
            Ready
          </Badge>
        );
    }
  };

  const getProviderLabel = () => {
    if (provider === 'groq') return hasApiKey ? `Groq: ${model}` : 'Groq (Key Required)';
    if (provider === 'gemini') return hasApiKey ? `Gemini: ${model}` : 'Gemini (Key Required)';
    return '⚡ Autonomous ReAct';
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          className="text-zinc-400 hover:text-zinc-100"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => window.location.reload()}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-tight text-white bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                V18.ai
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                ReAct v2
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {getStatusBadge()}

        <button
          onClick={onOpenSettings}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          title="Configure Agent Provider & Model"
        >
          {provider === 'autonomous' ? (
            <Zap className="w-3 h-3 text-amber-400" />
          ) : (
            <Cpu className="w-3 h-3 text-cyan-400" />
          )}
          <span>{getProviderLabel()}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSession}
          title="New Investigation"
          className="text-zinc-400 hover:text-zinc-100"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          title="Clear Conversation"
          className="text-zinc-400 hover:text-zinc-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="Agent Settings"
          className="text-zinc-400 hover:text-zinc-100"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
