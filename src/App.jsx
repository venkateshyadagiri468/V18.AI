import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBox from './components/InputBox';
import SettingsModal from './components/SettingsModal';
import { runAgentTask } from './services/geminiService';
import './styles/index.css';

const DEFAULT_CONFIG = {
  provider: 'autonomous', // default to autonomous multi-step ReAct loop out of the box
  apiKey: '',
  model: 'v18-react-autonomous-v2',
  temperature: 0.7,
  systemPrompt: `You are V18.ai, an elite autonomous AI Agent equipped with specialized tools.
You operate using the ReAct (Reasoning and Acting) methodology:
1. Always analyze the user's intent.
2. If the query requires factual knowledge, calculation, current time, weather, memory access, or code execution, explicitly call the appropriate tool.
3. Reflect on the tool's observation and synthesize a concise, beautifully formatted final answer.
4. Maintain a professional, articulate, and insightful tone. Format code, tables, and key insights cleanly.`,
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export default function App() {
  // Configuration stored in localStorage
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_agent_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Sessions list stored in localStorage
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_agent_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const initialSession = {
      id: generateId(),
      title: 'New Investigation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');

  // Agent execution state
  const [agentState, setAgentState] = useState({
    status: 'idle', // 'idle' | 'thinking' | 'acting' | 'complete'
    activeTool: '',
    statusText: '',
  });

  // Currently live streaming step/task
  const [activeTask, setActiveTask] = useState(null);
  const abortControllerRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_agent_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Sync config to localStorage
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('aura_agent_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const updateActiveSessionMessages = (updater) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === (activeSession?.id || activeSessionId)) {
          const nextMessages = typeof updater === 'function' ? updater(session.messages) : updater;
          // Dynamically compute title if it's the first message
          let title = session.title;
          if (session.messages.length === 0 && nextMessages.length > 0) {
            const firstUserMsg = nextMessages.find((m) => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '');
            }
          }
          return {
            ...session,
            title,
            messages: nextMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return session;
      })
    );
  };

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend) return;

    setInput('');

    // Append user message
    const userMsg = {
      id: generateId(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    updateActiveSessionMessages((prev) => [...prev, userMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setAgentState({
      status: 'thinking',
      activeTool: '',
      statusText: 'Analyzing intent & selecting tools...',
    });

    setActiveTask({
      statusText: 'Analyzing intent & selecting tools...',
      thought: '',
      steps: [],
      activeTool: '',
    });

    try {
      const result = await runAgentTask({
        prompt: textToSend,
        history: messages,
        apiKey: config.apiKey,
        provider: config.provider || (config.apiKey ? 'gemini' : 'autonomous'),
        model: config.model,
        temperature: config.temperature,
        systemPrompt: config.systemPrompt,
        onStep: (stepUpdate) => {
          setAgentState((prev) => ({
            ...prev,
            status: stepUpdate.status,
            activeTool: stepUpdate.activeTool || '',
            statusText: stepUpdate.statusText || prev.statusText,
          }));

          setActiveTask((prev) => ({
            ...prev,
            ...stepUpdate,
          }));
        },
        signal: abortController.signal,
      });

      // Task successfully finished, append assistant message
      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: result.finalAnswer,
        thought: activeTask?.thought || '',
        steps: result.steps || [],
        timestamp: new Date().toISOString(),
      };

      updateActiveSessionMessages((prev) => [...prev, assistantMsg]);
      setAgentState({ status: 'complete', activeTool: '', statusText: 'Completed' });
      setActiveTask(null);

      setTimeout(() => {
        setAgentState((prev) => (prev.status === 'complete' ? { ...prev, status: 'idle', statusText: '' } : prev));
      }, 3000);
    } catch (err) {
      if (abortController.signal.aborted) {
        setAgentState({ status: 'idle', activeTool: '', statusText: 'Cancelled' });
        setActiveTask(null);
        return;
      }

      const errorMsg = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ **Agent Error**: ${err.message}\n\n*Tip: Check provider configuration or API key in Settings.*`,
        thought: 'An unexpected exception occurred during task execution.',
        steps: [],
        timestamp: new Date().toISOString(),
      };
      updateActiveSessionMessages((prev) => [...prev, errorMsg]);
      setAgentState({ status: 'idle', activeTool: '', statusText: 'Error' });
      setActiveTask(null);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Clear all messages in the current conversation?')) {
      updateActiveSessionMessages([]);
    }
  };

  const handleNewSession = () => {
    const newSession = {
      id: generateId(),
      title: 'New Investigation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleToolClick = (tool) => {
    let suggestion = '';
    switch (tool.name) {
      case 'get_weather':
        suggestion = "What is the live weather in Tokyo and London right now?";
        break;
      case 'calculator':
        suggestion = 'Calculate: (450 * 12) + Math.sqrt(225)';
        break;
      case 'web_search':
        suggestion = 'Search web for: Latest breakthroughs in quantum computing';
        break;
      case 'execute_js':
        suggestion = 'Run JS script: [10, 4, 25, 80].filter(x => x > 20).reduce((a, b) => a + b, 0)';
        break;
      case 'agent_memory':
        suggestion = 'Store in memory: preferred_framework = React and Vite';
        break;
      case 'get_time':
        suggestion = 'What is the current time in UTC and Tokyo?';
        break;
      default:
        suggestion = `Use tool ${tool.name}`;
    }
    setInput(suggestion);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-[100vw] bg-zinc-950 text-zinc-100 overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 grid-pattern pointer-events-none z-0" />

      {/* History and Tools Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession?.id || activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewSession={handleNewSession}
        onToolClick={handleToolClick}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 min-w-0">
        <Header
          agentState={agentState}
          provider={config.provider}
          model={config.model}
          hasApiKey={Boolean(config.apiKey?.trim())}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearChat={handleClearChat}
          onNewSession={handleNewSession}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <ChatArea
          messages={messages}
          activeTask={activeTask}
          onSelectPrompt={(prompt) => handleSend(prompt)}
        />

        <InputBox
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          onStop={handleStop}
          isLoading={agentState.status === 'thinking' || agentState.status === 'acting'}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
