'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Code2,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { AssessmentService } from '@/lib/assessments/service';
import { DataService, UserProfile } from '@/lib/data-service';
import {
  AssessmentConfig,
  AssessmentAttempt,
  ClientAssessmentQuestion,
} from '@/types/assessment';

export default function AssessmentTakePage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentConfig | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [questions, setQuestions] = useState<ClientAssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Phase 8 Security & Integrity Monitoring States
  const [violationCount, setViolationCount] = useState(0);
  const [violationWarning, setViolationWarning] = useState<string | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [cooldownExpiry, setCooldownExpiry] = useState<string | null>(null);
  const [appealNotes, setAppealNotes] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  const autoSubmittedRef = useRef(false);

  // Initialize or resume attempt
  useEffect(() => {
    async function initAttempt() {
      try {
        const currentUser = await DataService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        const assConfig = AssessmentService.getAssessmentById(assessmentId);
        if (!assConfig) {
          setErrorMsg('Assessment configuration could not be found.');
          setLoading(false);
          return;
        }
        setAssessment(assConfig);

        const res = await AssessmentService.startOrResumeAttempt({
          userId: currentUser.id,
          assessmentId: assConfig.id,
        });

        if (res.attempt.status === 'terminated') {
          setIsTerminated(true);
          setTerminationReason(res.attempt.terminationReason || 'violation_limit_exceeded');
          setCooldownExpiry(res.attempt.cooldownUntil || null);
        }

        setAttempt(res.attempt);
        setQuestions(res.questions);

        if (res.attempt.answers) {
          setAnswers(res.attempt.answers);
        }
        if (res.attempt.markedForReview) {
          setMarkedForReview(new Set(res.attempt.markedForReview));
        }

        // Calculate initial remaining time from server expiresAt
        const expiry = new Date(res.attempt.expiresAt).getTime();
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeRemaining(diffSeconds);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to initialize assessment.');
      } finally {
        setLoading(false);
      }
    }

    initAttempt();
  }, [assessmentId, router]);

  // Security & Integrity Monitoring: Visibility & Fullscreen
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || isTerminated) return;

    const reportViolation = async (eventType: string) => {
      try {
        const res = await fetch('/api/assessments/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId: attempt.id,
            userId: user?.id || 'std-001',
            eventType,
            metadata: { timestamp: new Date().toISOString() },
          }),
        });

        const data = await res.json();
        if (data.terminated) {
          setIsTerminated(true);
          setTerminationReason(data.reason || 'violation_limit_exceeded');
          setCooldownExpiry(data.cooldownUntil || null);
        } else if (data.violationCount > 0) {
          setViolationCount(data.violationCount);
          setViolationWarning(
            `Integrity Warning (${data.violationCount}/3): Navigating away from the examination window or exiting fullscreen is monitored. At 3 violations, the attempt is terminated with a 24-hour cooldown.`
          );
        }
      } catch (e) {
        console.warn('Security event log failed:', e);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportViolation('visibility_lost');
      } else {
        reportViolation('visibility_restored');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation('fullscreen_exit');
      }
    };

    // Keyboard clipboard deterrence: block Cmd+C, Cmd+V, Ctrl+C, Ctrl+V
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        setClipboardToast('Clipboard copying and pasting is disabled during graded assessments.');
        setTimeout(() => setClipboardToast(null), 3000);
        reportViolation('clipboard_attempt');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [attempt, isTerminated, user]);

  // Countdown timer loop
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || isTerminated) return;

    const interval = setInterval(() => {
      const expiry = new Date(attempt.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(diff);

      if (diff <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, isTerminated]);

  // Auto-submit when time expires
  const handleAutoSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const result = await AssessmentService.submitAndEvaluateAttempt({
        userId: user?.id || 'std-001',
        attemptId: attempt.id,
        answers,
      });
      router.push(`/assessments/${assessmentId}/result/${result.attempt.id}`);
    } catch (err) {
      console.error('Auto-submit failed:', err);
      router.push(`/assessments/${assessmentId}`);
    }
  };

  // Explicit user submission
  const handleManualSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const result = await AssessmentService.submitAndEvaluateAttempt({
        userId: user?.id || 'std-001',
        attemptId: attempt.id,
        answers,
      });
      router.push(`/assessments/${assessmentId}/result/${result.attempt.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit assessment.');
      setSubmitting(false);
      setSubmitModalOpen(false);
    }
  };

  // Toggle answer selection
  const toggleAnswerSelection = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || [];
      let updated: string[];

      if (isMulti) {
        if (existing.includes(optionId)) {
          updated = existing.filter((id) => id !== optionId);
        } else {
          updated = [...existing, optionId];
        }
      } else {
        updated = [optionId];
      }

      const nextAnswers = { ...prev, [questionId]: updated };

      if (attempt) {
        AssessmentService.saveAnswerProgress({
          userId: user?.id || 'std-001',
          attemptId: attempt.id,
          answers: nextAnswers,
          markedForReview: Array.from(markedForReview),
        });
      }

      return nextAnswers;
    });
  };

  // Toggle mark for review
  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }

      if (attempt) {
        AssessmentService.saveAnswerProgress({
          userId: user?.id || 'std-001',
          attemptId: attempt.id,
          answers,
          markedForReview: Array.from(next),
        });
      }

      return next;
    });
  };

  // Stats calculation
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((arr) => arr.length > 0).length;
  }, [answers]);

  const markedCount = markedForReview.size;
  const unansweredCount = questions.length - answeredCount;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#881337] mx-auto" />
          <h2 className="text-base font-bold text-[#1C0D12]">Preparing Secure Exam Environment...</h2>
          <p className="text-xs text-slate-500">Checking proctoring integrity and server timestamp.</p>
        </div>
      </div>
    );
  }

  if (isTerminated) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-3xl border-2 border-milan-600 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-milan-50 border border-milan-600/30 text-milan-600 flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-milan-600 bg-milan-50 px-3 py-1 rounded-full border border-milan-600/20">
              Exam Terminated · Policy Enforced
            </span>
            <h2 className="text-2xl font-black text-espresso-900 mt-3">
              Assessment Attempt Terminated
            </h2>
            <p className="text-xs text-espresso-muted mt-2 leading-relaxed">
              This attempt was terminated due to exceeding the maximum allowed window-blur or fullscreen-exit violations (3 violations recorded).
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-left text-xs space-y-2">
            <div className="flex justify-between items-center text-amber-900 font-bold">
              <span>Termination Policy:</span>
              <span className="font-mono">{terminationReason || 'violation_limit_exceeded'}</span>
            </div>
            <div className="flex justify-between items-center text-amber-900">
              <span>24-Hour Cooldown Expiry:</span>
              <span className="font-mono font-bold text-milan-600">
                {cooldownExpiry ? new Date(cooldownExpiry).toLocaleString() : 'Active (24 Hours)'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200">
              In accordance with academic verification standards, re-attempts are locked until the cooldown window expires.
            </p>
          </div>

          {/* Appeal Form */}
          <div className="text-left space-y-2 pt-2 border-t border-milan-600/10">
            <h4 className="text-xs font-bold text-espresso-900">Submit Administrative Appeal</h4>
            {!appealSubmitted ? (
              <div className="space-y-2">
                <textarea
                  value={appealNotes}
                  onChange={(e) => setAppealNotes(e.target.value)}
                  placeholder="Explain any technical disruption or browser anomaly for review..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-milan-600/20 focus:outline-none focus:border-milan-600 bg-[#FFFDF7]"
                />
                <button
                  onClick={() => {
                    if (appealNotes.trim()) {
                      AssessmentService.submitCooldownAppeal(attempt?.id || 'att', user?.id || 'std-001', appealNotes);
                      setAppealSubmitted(true);
                    }
                  }}
                  disabled={!appealNotes.trim()}
                  className="w-full py-2 bg-espresso-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors disabled:opacity-40"
                >
                  Submit Appeal for Review
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold text-center">
                ✓ Appeal submitted. An academic reviewer will inspect your session audit log.
              </div>
            )}
          </div>

          <Link
            href={`/assessments/${assessmentId}`}
            className="glow-button text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-1.5 font-bold mx-auto"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Assessment Overview
          </Link>
        </div>
      </div>
    );
  }

  if (errorMsg || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-[#FFE4E6] text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#881337] mx-auto" />
          <h2 className="text-lg font-bold text-[#1C0D12]">Unable to Load Assessment</h2>
          <p className="text-xs text-slate-600">{errorMsg || 'No active examination attempt could be verified.'}</p>
          <Link
            href={`/assessments/${assessmentId}`}
            className="glow-button text-xs inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Assessment Overview
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isMultiSelect = currentQ.type === 'multiple-select';
  const currentAnswers = answers[currentQ.id] || [];
  const isCurrentMarked = markedForReview.has(currentQ.id);
  const isTimeCritical = timeRemaining < 300; // less than 5 minutes

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-sans select-none text-[#1C0D12]">
      {/* Top Proctored Header Bar */}
      <header className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-md border-b border-red-400/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 border border-white/30 px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#FFE4E6] uppercase tracking-wider flex-shrink-0">
              Exam Mode
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white truncate">{assessment?.title}</h1>
              <p className="text-[11px] text-white/80 hidden sm:block">
                Attempt #{attempt?.attemptNumber} of {assessment?.maxAttempts} • Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors ${
                isTimeCritical
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-black/30 border-white/20 text-white'
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-[#FFE4E6]'}`} />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Finish/Submit CTA */}
            <button
              onClick={() => setSubmitModalOpen(true)}
              disabled={submitting}
              className="bg-white text-[#881337] hover:bg-[#FFE4E6] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish & Submit</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Critical time alert banner */}
      {isTimeCritical && (
        <div className="bg-rose-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>Less than 5 minutes remaining! Assessment will automatically submit upon countdown expiry.</span>
        </div>
      )}

      {/* Security & Integrity Violation Banner */}
      {violationWarning && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
          <span>{violationWarning}</span>
        </div>
      )}

      {/* Clipboard Toast Banner */}
      {clipboardToast && (
        <div className="bg-rose-700 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
          <span>🛡️ {clipboardToast}</span>
        </div>
      )}

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question Workspace (8 cols) */}
        <main className="lg:col-span-8 flex flex-col gap-4">
          <div
            onCopy={(e) => {
              e.preventDefault();
              setClipboardToast('Copying exam questions is restricted to preserve academic integrity.');
              setTimeout(() => setClipboardToast(null), 3000);
            }}
            onPaste={(e) => {
              e.preventDefault();
              setClipboardToast('Pasting is restricted inside protected answer fields.');
              setTimeout(() => setClipboardToast(null), 3000);
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="bg-white rounded-3xl border border-[#FFE4E6] shadow-sm p-6 sm:p-8 flex-1 flex flex-col select-none"
          >
            {/* Question Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#FFE4E6]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] px-2.5 py-1 rounded-lg">
                  Q{currentIndex + 1}
                </span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {currentQ.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentQ.difficulty === 'HARD'
                      ? 'bg-rose-100 text-[#881337]'
                      : currentQ.difficulty === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  +{currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                  {currentQ.negativeMarks ? ` (-${currentQ.negativeMarks} Neg)` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl border transition-colors ${
                    isCurrentMarked
                      ? 'bg-[#FFE4E6] text-[#881337] border-[#FECDD3]'
                      : 'text-slate-600 border-[#FECDD3] hover:bg-[#FFE4E6]/40'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-[#881337] text-[#881337]' : ''}`} />
                  <span>{isCurrentMarked ? 'Marked' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mt-5 space-y-4">
              <p className="text-[#1C0D12] font-bold text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </p>

              {/* Code Snippet if present */}
              {currentQ.codeSnippet && (
                <div className="bg-[#1C0D12] rounded-2xl p-4 font-mono text-xs sm:text-sm text-[#FFE4E6] overflow-x-auto border border-[#FECDD3] shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-white/70 pb-2 mb-2 border-b border-white/10 uppercase tracking-wider font-sans">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-[#FFE4E6]" />
                      Technical Code Snippet
                    </span>
                    <span>Syntax View</span>
                  </div>
                  <pre className="leading-relaxed">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {isMultiSelect && (
                <div className="flex items-center gap-1.5 text-xs text-[#881337] bg-[#FFE4E6]/40 px-3 py-1.5 rounded-xl border border-[#FECDD3] font-medium">
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Multiple Choice Question: Select all options that apply.</span>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="mt-6 space-y-3 flex-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentAnswers.includes(opt.id);
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleAnswerSelection(currentQ.id, opt.id, isMultiSelect)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#881337] bg-[#FFE4E6]/30 ring-2 ring-[#881337]/30'
                        : 'border-[#FFE4E6] bg-white hover:border-[#FECDD3] hover:bg-[#FFFDF7]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#881337] text-white'
                          : 'bg-[#FFFDF7] text-slate-700 border border-[#FECDD3]'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : letter}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <span className={`text-sm ${isSelected ? 'font-bold text-[#1C0D12]' : 'text-slate-700'}`}>
                        {opt.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="mt-8 pt-4 border-t border-[#FFE4E6] flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnswers((prev) => {
                      const copy = { ...prev };
                      delete copy[currentQ.id];
                      return copy;
                    });
                  }}
                  className="text-xs text-slate-500 hover:text-[#881337] underline px-2 py-1"
                >
                  Clear Selection
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="glow-button text-xs inline-flex items-center gap-1.5 font-bold"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(true)}
                    className="glow-button text-xs inline-flex items-center gap-1.5 font-bold shadow-md"
                  >
                    Review & Submit <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Column: Question Navigator & Session Stats (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Question Matrix Card */}
          <div className="bg-white rounded-3xl border border-[#FFE4E6] p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-[11px] text-slate-400 lowercase font-normal">click to jump</span>
            </h2>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 pt-1 pb-3 border-b border-[#FFE4E6]">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#FFE4E6] border border-[#FECDD3]" />
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded ring-2 ring-[#881337] bg-white" />
                <span>Current Question</span>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAns = (answers[q.id] || []).length > 0;
                const isMarked = markedForReview.has(q.id);
                const isCurr = idx === currentIndex;

                let colorClasses = 'bg-[#FFFDF7] text-slate-700 hover:bg-[#FFE4E6]/40 border-[#FECDD3]';
                if (isAns) {
                  colorClasses = 'bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-emerald-600';
                }
                if (isMarked) {
                  colorClasses = 'bg-[#FFE4E6] text-[#881337] font-bold border-[#FECDD3]';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${colorClasses} ${
                      isCurr ? 'ring-2 ring-offset-1 ring-[#881337] scale-105 font-bold' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Quick Summary Footer */}
            <div className="pt-3 border-t border-[#FFE4E6] text-xs text-slate-500 flex justify-between">
              <span>Total Questions:</span>
              <span className="font-bold text-[#1C0D12]">{questions.length}</span>
            </div>
          </div>

          {/* Guidelines Notice */}
          <div className="bg-white rounded-3xl border border-[#FFE4E6] p-5 text-[11px] text-slate-600 space-y-2 shadow-sm">
            <h3 className="font-bold text-[#1C0D12] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#881337]" /> Assessment Rules
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Answers are securely auto-saved as you select them.</li>
              <li>You may navigate between questions at any time.</li>
              <li>Explanations are displayed after final submission.</li>
              <li>When the timer expires, work will auto-submit.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Confirmation Submit Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#FFE4E6] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE4E6] text-[#881337] flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-[#881337]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C0D12]">Submit Assessment?</h3>
                <p className="text-xs text-slate-500">Your answers will be evaluated on the server.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFDF7] rounded-xl text-xs space-y-2 border border-[#FFE4E6]">
              <div className="flex justify-between">
                <span className="text-slate-600">Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount} of {questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Unanswered Questions:</span>
                <span className="font-bold text-slate-800">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Marked for Review:</span>
                <span className="font-bold text-[#881337]">{markedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Remaining Time:</span>
                <span className="font-bold text-[#1C0D12] font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>You have {unansweredCount} unanswered questions. Are you sure you want to finish?</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="px-4 py-2 border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-slate-700 rounded-xl text-xs font-semibold"
                disabled={submitting}
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="glow-button text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
                disabled={submitting}
              >
                {submitting ? 'Evaluating...' : 'Yes, Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
