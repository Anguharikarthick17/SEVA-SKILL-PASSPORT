'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Eye,
  ShieldAlert,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { ChallengeDefinition } from '@/data/challenges';

interface ViewAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeDefinition;
}

export default function ViewAnswerModal({
  isOpen,
  onClose,
  challenge,
}: ViewAnswerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (challenge.referenceSolution) {
      navigator.clipboard.writeText(challenge.referenceSolution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-answer-title"
    >
      <div className="relative w-full max-w-3xl bg-[#FFFDF7] rounded-3xl border border-milan-600/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cream-100 via-white to-cream-100 border-b border-milan-600/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-milan-50 border border-milan-600/30 text-milan-600 flex items-center justify-center shadow-xs">
              <Eye className="w-5 h-5 text-milan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="view-answer-title" className="text-base font-extrabold text-espresso-900 leading-tight">
                  Reference Solution
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-milan-100 text-milan-800 px-2 py-0.5 rounded-full border border-milan-600/20">
                  Engineering Standard
                </span>
              </div>
              <p className="text-xs text-espresso-muted">
                {challenge.title} ({challenge.language.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {challenge.referenceSolution && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl border border-milan-600/25 bg-white hover:bg-milan-50 text-xs font-bold text-espresso-900 flex items-center gap-1.5 transition-colors shadow-xs"
                aria-label="Copy reference solution"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-milan-600" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-milan-100 border border-milan-600/20 flex items-center justify-center text-espresso-900 hover:text-milan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-milan-600"
              aria-label="Close solution modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pedagogical Integrity Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-milan-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Learning Integrity Notice:</strong> This reference implementation is provided for pedagogical review. Closing this modal preserves your working code in the editor without overwriting your draft. Evidence hashes are generated only from your submitted tests.
          </div>
        </div>

        {/* Solution Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {challenge.referenceSolution ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-espresso-muted">
                <span className="flex items-center gap-1.5 font-bold text-milan-700">
                  <FileCode className="w-3.5 h-3.5" />
                  solution.{challenge.language === 'sql' ? 'sql' : challenge.language === 'css' ? 'css' : challenge.language === 'bash' ? 'sh' : 'js'}
                </span>
                <span className="text-[11px] text-slate-400">Reference Architecture</span>
              </div>

              <div className="rounded-2xl border border-milan-600/20 bg-[#1C0D12] p-4 text-xs sm:text-sm font-mono text-amber-100 leading-relaxed overflow-x-auto shadow-inner selection:bg-milan-600/40">
                <pre className="whitespace-pre-wrap">{challenge.referenceSolution}</pre>
              </div>

              {/* Solution Output & Explanation */}
              {challenge.solutionOutput && (
                <div className="p-3.5 bg-white rounded-2xl border border-milan-600/15 text-xs space-y-1">
                  <span className="font-bold text-espresso-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-milan-600" />
                    Expected Test Suite Behavior:
                  </span>
                  <pre className="text-[11px] text-emerald-800 whitespace-pre-wrap font-mono pt-1">
                    {challenge.solutionOutput}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-espresso-muted space-y-2">
              <p className="font-bold text-espresso-900">No Verified Reference Solution Available</p>
              <p>This laboratory challenge requires original student implementation and review.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-cream-50 border-t border-milan-600/15">
          <span className="text-[11px] text-espresso-muted">
            Your editor draft remains untouched.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-milan-600 hover:bg-milan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Return to Coding Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
