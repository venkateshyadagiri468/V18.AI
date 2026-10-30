import React from 'react';
import { Bot, Settings, Trash2, Menu, Cpu, Zap, Plus, LogOut, User } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
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
  isClerkActive = false,
  onSignOut,
}) {
  const getStatusBadge = () => {
    switch (agentState.status) {
      case 'thinking':
        return (
          <Badge variant="warning" className="animate-pulse py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-xs flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1 flex-shrink-0" />
            <span className="hidden xs:inline">Reasoning...</span>
            <span className="xs:hidden">Thinking</span>
          </Badge>
        );
      case 'acting':
        return (
          <Badge variant="cyan" className="py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-xs flex items-center max-w-[110px] sm:max-w-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse flex-shrink-0" />
            <span className="truncate">
              <span className="hidden xs:inline">Invoking: </span>{agentState.activeTool || 'Tool'}
            </span>
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="success" className="py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-xs flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 flex-shrink-0" />
            <span>Done</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-xs flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mr-1 flex-shrink-0" />
            <span>Ready</span>
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
    <header className="h-13 sm:h-14 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between z-20 select-none flex-shrink-0 min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100 flex-shrink-0"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group min-w-0"
          onClick={() => window.location.reload()}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-violet-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-heading font-bold text-sm tracking-tight text-white bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent truncate">
                V18.ai
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 flex-shrink-0">
                ReAct v2
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 mx-1">
        {getStatusBadge()}

        <button
          onClick={onOpenSettings}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors flex-shrink-0"
          title="Configure Agent Provider & Model"
        >
          {provider === 'autonomous' ? (
            <Zap className="w-3 h-3 text-amber-400" />
          ) : (
            <Cpu className="w-3 h-3 text-cyan-400" />
          )}
          <span className="truncate max-w-[150px]">{getProviderLabel()}</span>
        </button>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSession}
          title="New Investigation"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          title="Clear Conversation"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="Agent Settings"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Account / Sign Out */}
        <div className="ml-1 pl-1.5 border-l border-zinc-800 flex items-center">
          {isClerkActive ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-7 h-7 ring-1 ring-white/20 hover:ring-white/50 transition-all",
                }
              }}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              title="Return to V18.AI Cinematic Auth Screen"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
