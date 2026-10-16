'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { AiChatMessage } from '@/lib/ai/provider';

interface AiTutorModalProps {
  contextType?: 'lesson' | 'course' | 'lab' | 'project' | 'dashboard' | 'practice' | 'assessment' | 'general';
  contextId?: string;
  contextTitle?: string;
  activeAssessmentId?: string;
}

export default function AiTutorModal({
  contextType = 'general',
  contextId,
  contextTitle,
  activeAssessmentId
}: AiTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your SEVA Academic AI Tutor. Ask me anything about ${
        contextTitle ? `"${contextTitle}"` : 'Full Stack Engineering'
      }, debugging techniques, or conceptual principles.`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configTip, setConfigTip] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    setInput('');
    setErrorMessage(null);
    setConfigTip(null);

    const updatedHistory: AiChatMessage[] = [...messages, { role: 'user', content: userPrompt }];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          history: messages.slice(-6),
          contextType,
          contextId,
          activeAssessmentId
        })
      });

      const data = await res.json();

      if (data.isBlocked) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `🛡️ **Academic Integrity Notice**:\n${data.message}`
          }
        ]);
        return;
      }

      if (data.configInstructions) {
        setConfigTip(data.configInstructions);
      }

      if (!data.success && data.error === 'MISSING_API_CREDENTIALS') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ **AI Provider Setup Required**:\n${data.message}`
          }
        ]);
        return;
      }

      if (!data.success && data.error === 'INVALID_API_CREDENTIALS') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ **AI Provider Authentication Error**:\n${data.message}`
          }
        ]);
        return;
      }

      if (data.success && data.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message
          }
        ]);
      } else {
        setErrorMessage(data.message || 'Unable to process inquiry at this moment.');
      }
    } catch (err: any) {
      setErrorMessage(`Network or server error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation cleared. How can I help you today?'
      }
    ]);
    setErrorMessage(null);
    setConfigTip(null);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="ai-tutor-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#9F1239] via-[#881337] to-[#4C0519] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-milan-600/30 hover:scale-105 active:scale-95 transition-all border border-amber-300/30 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
        </span>
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        <span>Ask AI Tutor</span>
      </button>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FFFDF7] border-l border-milan-600/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#9F1239] via-[#881337] to-[#4C0519] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight">SEVA Academic AI Tutor</h3>
                <p className="text-[10px] text-amber-200 font-medium">Grounded Curriculum Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 transition-colors"
                title="Clear Chat History"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Pill Banner */}
          {contextTitle && (
            <div className="px-4 py-2 bg-[#FFE4E6]/60 border-b border-milan-600/10 flex items-center gap-2 text-[11px] text-espresso-800">
              <BookOpen className="w-3.5 h-3.5 text-milan-600 flex-shrink-0" />
              <span className="truncate">Context: <strong>{contextTitle}</strong></span>
            </div>
          )}

          {/* Assessment Warning if active */}
          {activeAssessmentId && (
            <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-[11px] text-rose-800 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Assessment Anti-Cheat Guard Active: Direct solutions are locked.</span>
            </div>
          )}

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isAssistant
                        ? 'bg-gradient-to-br from-[#9F1239] to-[#881337] text-white shadow-sm'
                        : 'bg-espresso-900 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl relative group ${
                      isAssistant
                        ? 'bg-white border border-milan-600/15 text-espresso-900 shadow-sm leading-relaxed'
                        : 'bg-milan-600 text-white font-medium shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {isAssistant && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded hover:bg-stone-100 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy text"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-espresso-muted text-xs p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-milan-600" />
                <span>AI Tutor is formulating an engineering explanation...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {configTip && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Setup Guide for Administrators:</span>
                </div>
                <pre className="p-2 rounded bg-amber-100/70 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">
                  {configTip}
                </pre>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Form */}
          <div className="p-3.5 bg-white border-t border-milan-600/15">
            <div className="flex items-center gap-2 bg-[#FFFDF7] rounded-2xl border border-milan-600/20 px-3 py-1.5 focus-within:border-milan-600 transition-colors shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a technical or conceptual question..."
                rows={1}
                className="flex-1 bg-transparent border-none text-xs text-espresso-900 placeholder:text-stone-400 focus:outline-none resize-none py-1.5 max-h-24"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-[#9F1239] to-[#881337] text-white shadow-md shadow-milan-600/30 hover:scale-105 active:scale-95'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 text-center text-[10px] text-espresso-muted">
              AI Tutor is grounded in SEVA Full Stack courseware. Graded answers are prohibited.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
