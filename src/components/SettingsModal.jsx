import React, { useState } from 'react';
import {
  Key,
  Cpu,
  Sliders,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { testModelConnection } from '../services/geminiService';

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) {
  const [provider, setProvider] = useState(config.provider || 'gemini');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [model, setModel] = useState(config.model || 'gemini-1.5-flash');
  const [temperature, setTemperature] = useState(config.temperature ?? 0.7);
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setTestStatus(null);
    if (newProvider === 'groq') {
      setModel('llama-3.3-70b-versatile');
    } else if (newProvider === 'gemini') {
      setModel('gemini-1.5-flash');
    } else {
      setModel('v18-react-autonomous-v2');
    }
  };

  const handleTestKey = async () => {
    if (provider === 'autonomous') {
      setTestStatus('success');
      setTestMessage('Autonomous ReAct Engine is ready (no key required).');
      return;
    }
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage(`Connecting to ${provider.toUpperCase()}...`);
    const res = await testModelConnection({ provider, apiKey, model });
    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message || 'Connected successfully!');
    } else {
      setTestStatus('error');
      setTestMessage(res.error || 'Connection failed. Please check key.');
    }
  };

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      model,
      temperature: parseFloat(temperature),
      systemPrompt,
    });
    onClose();
  };

  const handleClearMemory = () => {
    if (window.confirm('Clear all stored agent persistent memories?')) {
      localStorage.removeItem('aura_agent_memory_store');
      window.dispatchEvent(new CustomEvent('aura-memory-updated'));
      alert('Persistent memory cleared.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Agent Configuration</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                Configure AI model providers, API credentials, and autonomous settings.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm">
          {/* Provider Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Execution Engine</span>
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="autonomous">⚡ Autonomous Multi-Step ReAct Engine (Zero Key Needed)</option>
              <option value="gemini">Google Gemini API (Function Calling & Reasoning)</option>
              <option value="groq">Groq Cloud (Ultra-Fast Llama 3.3 70B Tool Calling)</option>
            </select>
          </div>

          {/* API Key Section */}
          {provider !== 'autonomous' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{provider === 'groq' ? 'Groq API Key' : 'Google Gemini API Key'}</span>
                </label>
                <a
                  href={provider === 'groq' ? 'https://console.groq.com/keys' : 'https://aistudio.google.com/app/apikey'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setTestStatus(null);
                    }}
                    placeholder={provider === 'groq' ? 'gsk_...' : 'AIzaSy...'}
                    className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 pr-8 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestKey}
                  disabled={testStatus === 'testing'}
                  className="text-xs"
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Verify'}
                </Button>
              </div>

              {testStatus && (
                <div
                  className={`flex items-center gap-1.5 text-xs mt-1 ${
                    testStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {testStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model Architecture</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={provider === 'autonomous'}
              className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
            >
              {provider === 'groq' ? (
                <>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommended)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Ultra-Fast 700+ tok/s)</option>
                </>
              ) : provider === 'gemini' ? (
                <>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Fast & Free)</option>
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multistep)</option>
                </>
              ) : (
                <option value="v18-react-autonomous-v2">V18.ai ReAct Autonomous Engine v2 (6 Built-In Tools)</option>
              )}
            </select>
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Reasoning Temperature: {temperature}</span>
              <span className="text-zinc-500 text-[11px]">
                {temperature < 0.4 ? 'Deterministic' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* System Instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Agent System Prompt</span>
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt guiding tool decisions..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Persistent Memory Manager */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Persistent Memory Storage</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMemory}
              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Storage
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
