'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Code2, Sparkles, Terminal } from 'lucide-react';

interface PracticeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export default function PracticeEditor({
  value,
  language,
  onChange,
  height = '100%',
  readOnly = false,
}: PracticeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Update cursor position telemetry for bottom status bar
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBefore = target.value.substring(0, target.selectionStart);
    const line = textBefore.split('\n').length;
    const col = textBefore.split('\n').pop()?.length || 0;
    setCursorPos({ line, col: col + 1 });
  };

  // Keyboard accessibility: Indent with Tab (2 spaces) and Shift+Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const before = value.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const updated = value.substring(0, lineStart) + value.substring(lineStart + 2);
          onChange(updated);
          setTimeout(() => {
            target.selectionStart = Math.max(lineStart, start - 2);
            target.selectionEnd = Math.max(lineStart, end - 2);
          }, 0);
        }
      } else {
        // Tab: Insert 2 spaces
        const updated = value.substring(0, start) + '  ' + value.substring(end);
        onChange(updated);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  // Sync gutter scroll with textarea scroll
  const gutterRef = useRef<HTMLDivElement>(null);
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1C0D12] text-amber-100 font-mono select-none overflow-hidden border-none">
      {/* Editor File Tab Bar */}
      <div className="h-9 bg-[#1C0D12] border-b border-milan-600/20 px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#1C0D12] text-amber-200 text-xs font-bold rounded-t-lg border-t-2 border-milan-600 flex items-center gap-1.5 shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-milan-500" />
            <span>solution.{language === 'sql' ? 'sql' : language === 'css' ? 'css' : language === 'bash' ? 'sh' : 'js'}</span>
          </div>
          <span className="text-[11px] text-espresso-muted/60 hidden sm:inline">• UTF-8</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-espresso-muted/80">
          <span className="hidden md:inline font-sans text-[10px] text-amber-300/80 bg-milan-950/60 border border-milan-600/30 px-2 py-0.5 rounded-full">
            {language.toUpperCase()} ENGINE
          </span>
          <span>Tab: 2 spaces</span>
        </div>
      </div>

      {/* Main Coding Area with Line Numbers Gutter */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-12 sm:w-14 bg-[#1C0D12] text-[#6B4E56] py-3.5 pr-2.5 text-right text-xs font-mono select-none overflow-hidden border-r border-milan-600/15 flex-shrink-0"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const isCurrentLine = cursorPos.line === i + 1;
            return (
              <div
                key={i}
                className={`leading-relaxed ${isCurrentLine ? 'text-milan-500 font-bold' : ''}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Code Input Area */}
        <div className="flex-1 relative overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            onKeyUp={handleSelect}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full p-3.5 bg-transparent text-amber-100 font-mono text-xs sm:text-[13.5px] leading-relaxed focus:outline-none resize-none border-none selection:bg-milan-600/40 cursor-text overflow-auto"
            aria-label="Practice Code Editor"
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <footer className="h-6 bg-[#1C0D12] border-t border-milan-600/15 px-3 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-amber-200/80">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="hidden sm:inline">Lines: {lineCount}</span>
          <span className="hidden sm:inline">Spaces: 2</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </span>
          <span>{language.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
}
