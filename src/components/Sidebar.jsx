import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Search,
  Terminal,
  Database,
  Clock,
  CloudSun,
  Plus,
  MessageSquare,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { Button } from './ui/button';
import { TOOLS_REGISTRY } from '../tools';

const TOOL_ICONS = {
  Calculator: Calculator,
  Search: Search,
  CloudSun: CloudSun,
  Terminal: Terminal,
  Database: Database,
  Clock: Clock,
};

export default function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onToolClick,
}) {
  const [memoryItems, setMemoryItems] = useState({});

  const loadMemory = () => {
    try {
      const raw = localStorage.getItem('aura_agent_memory_store');
      if (raw) setMemoryItems(JSON.parse(raw));
      else setMemoryItems({});
    } catch {
      setMemoryItems({});
    }
  };

  useEffect(() => {
    loadMemory();
    const handleUpdate = () => loadMemory();
    window.addEventListener('aura-memory-updated', handleUpdate);
    return () => window.removeEventListener('aura-memory-updated', handleUpdate);
  }, []);

  const handleDeleteKey = (key) => {
    const updated = { ...memoryItems };
    delete updated[key];
    localStorage.setItem('aura_agent_memory_store', JSON.stringify(updated));
    setMemoryItems(updated);
  };

  const memoryKeys = Object.keys(memoryItems);

  const handleSelectSession = (id) => {
    onSelectSession(id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleNewSession = () => {
    onNewSession();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleToolClick = (tool) => {
    onToolClick?.(tool);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 md:z-10 w-72 max-w-[85vw] bg-zinc-950 border-r border-zinc-800/80 flex flex-col shadow-2xl md:shadow-none transition-transform md:transition-all duration-300 ease-in-out ${
          !isOpen ? '-translate-x-full md:w-0 md:border-r-0 md:translate-x-0 overflow-hidden' : 'translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-zinc-400">
            Agent Workspace
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            title="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
          {/* Sessions Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Conversations
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                title="New Conversation"
                className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full px-2.5 py-2 rounded-lg text-left text-xs transition-colors flex items-center gap-2 truncate min-h-[36px] ${
                    session.id === activeSessionId
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                  <span className="truncate">{session.title || 'New Session'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools Registry Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Registered Tools ({TOOLS_REGISTRY.length})
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="flex flex-col gap-1.5">
              {TOOLS_REGISTRY.map((tool) => {
                const IconComponent = TOOL_ICONS[tool.icon] || Zap;
                return (
                  <div
                    key={tool.name}
                    onClick={() => handleToolClick(tool)}
                    className="p-2 sm:p-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700/80 transition-all cursor-pointer flex items-center gap-2.5 select-none min-h-[44px]"
                    title={`Click to try tool: ${tool.name}`}
                  >
                    <div className="w-6 h-6 rounded-md bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-purple-400 flex-shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-medium text-zinc-200 truncate">
                        {tool.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {tool.description}
                      </div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memory Inspector Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>Memory ({memoryKeys.length})</span>
              </span>
            </div>

            {memoryKeys.length === 0 ? (
              <div className="p-2.5 rounded-lg border border-zinc-800/40 bg-zinc-900/20 text-[11px] text-zinc-500 italic">
                No saved memories yet. Ask the agent to "remember that..." to persist data.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {memoryKeys.map((key) => (
                  <div
                    key={key}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="truncate flex-1 min-w-0">
                      <span className="font-mono text-purple-300 font-medium">{key}:</span>{' '}
                      <span className="text-zinc-400 break-all">
                        {typeof memoryItems[key]?.value === 'object'
                          ? JSON.stringify(memoryItems[key]?.value)
                          : String(memoryItems[key]?.value)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(key)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1.5 flex-shrink-0"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-zinc-800/80 bg-zinc-950 text-[11px] text-zinc-500 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>V18.ai ReAct Engine</span>
          </div>
          <span className="font-mono text-[10px]">v2.0</span>
        </div>
      </aside>
    </>
  );
}
