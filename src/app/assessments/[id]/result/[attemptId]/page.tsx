'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Award,
  Shield,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AssessmentService } from '@/lib/assessments/service';
import { DataService, UserProfile } from '@/lib/data-service';
import { QUESTION_BANK } from '@/data/question-bank';
import {
  AssessmentConfig,
  AssessmentAttempt,
  AttemptEvaluationSummary,
} from '@/types/assessment';

export default function AssessmentResultPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const attemptId = params.attemptId as string;

  const [, setUser] = useState<UserProfile | null>(null);
  const [resultData, setResultData] = useState<{
    attempt: AssessmentAttempt;
    evaluation: AttemptEvaluationSummary;
    assessment: AssessmentConfig;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  useEffect(() => {
    async function loadResult() {
      try {
        const currentUser = await DataService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        const res = AssessmentService.getAttemptResult(currentUser.id, attemptId);
        setResultData(res);
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#881337]/30 border-t-[#881337] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Computing evaluation analytics...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-[#FFE4E6] text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#881337] mx-auto" />
          <h2 className="text-lg font-bold text-[#1C0D12]">Attempt Record Not Found</h2>
          <p className="text-xs text-slate-500">
            The evaluation results for attempt {attemptId} could not be retrieved.
          </p>
          <Link href={`/assessments/${assessmentId}`} className="glow-button text-xs inline-flex items-center gap-1.5 font-bold">
            <ChevronLeft className="w-4 h-4" /> Back to Assessment Overview
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, evaluation, assessment } = resultData;
  const { questionResults } = evaluation;

  const filteredQuestions = questionResults.filter((q) => {
    if (selectedFilter === 'correct') return q.isCorrect;
    if (selectedFilter === 'incorrect') return !q.isCorrect;
    return true;
  });

  const correctCount = questionResults.filter((q) => q.isCorrect).length;
  const incorrectCount = questionResults.length - correctCount;

  const minutesTaken = Math.floor(evaluation.timeTakenSeconds / 60);
  const secondsTaken = evaluation.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Top Banner - Milan Red Glossy Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/assessments/${assessment.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#FFE4E6] hover:underline transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Assessment Details
              </Link>

              <span className="text-[11px] font-mono text-white/90 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg">
                Attempt #{attempt.attemptNumber}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      evaluation.passed
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-300/40'
                        : 'bg-white/20 text-[#FFE4E6] border border-white/30'
                    }`}
                  >
                    {evaluation.passed ? 'PASSED COMPETENCY' : 'NEEDS REINFORCEMENT'}
                  </span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-[#FFE4E6]">Official Server Evaluation</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{assessment.title}</h1>
                <p className="mt-1 text-white/80 text-xs sm:text-sm">
                  Completed on {new Date(evaluation.submittedAt).toLocaleDateString()} at{' '}
                  {new Date(evaluation.submittedAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Big Score Card */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex-shrink-0 shadow-md">
                <div className="text-center px-2">
                  <div
                    className={`text-3xl sm:text-4xl font-black ${
                      evaluation.passed ? 'text-emerald-300' : 'text-[#FFE4E6]'
                    }`}
                  >
                    {evaluation.percentage}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/70 tracking-wider mt-0.5">
                    Final Score
                  </div>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="text-left text-xs space-y-1">
                  <div>
                    <span className="text-white/70">Earned:</span>{' '}
                    <span className="font-bold text-white">
                      {evaluation.earnedMarks} / {evaluation.totalMarks} Marks
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">Status:</span>{' '}
                    <span
                      className={`font-bold ${evaluation.passed ? 'text-emerald-300' : 'text-[#FFE4E6]'}`}
                    >
                      {evaluation.passed ? 'Passed (≥' + assessment.passingThreshold + '%)' : 'Did Not Meet Threshold'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">Duration:</span>{' '}
                    <span className="font-medium text-white">
                      {minutesTaken}m {secondsTaken}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Evidence Verification Banner */}
        {evaluation.verificationHash && (
          <div className="bg-white rounded-2xl border border-[#FFE4E6] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-[#1C0D12]">Cryptographic Competency Evidence Landed</h2>
                  <span className="text-[10px] bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] font-bold px-2 py-0.5 rounded-full">
                    Weight: 20%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-md sm:max-w-lg">
                  Hash: {evaluation.verificationHash}
                </p>
              </div>
            </div>
            <Link
              href="/skill-passport/my"
              className="px-4 py-2 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
            >
              <span>View in Skill Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Skill & Dimension Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Breakdown */}
          <div className="bg-white rounded-2xl border border-[#FFE4E6] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE4E6]">
              <h2 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#881337]" />
                Skill Performance Breakdown
              </h2>
              <span className="text-[11px] text-slate-400">Score by Domain</span>
            </div>

            <div className="space-y-3">
              {Object.entries(evaluation.skillBreakdown).map(([skill, data]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-slate-700">{skill}</span>
                    <span className="text-[#1C0D12] font-bold">
                      {data.earnedMarks} / {data.totalMarks} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.percentage >= 75
                          ? 'bg-emerald-600'
                          : data.percentage >= 50
                          ? 'bg-gradient-to-r from-[#881337] to-[#9F1239]'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competency Dimension Breakdown */}
          <div className="bg-white rounded-2xl border border-[#FFE4E6] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE4E6]">
              <h2 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#881337]" />
                Competency Dimensions
              </h2>
              <span className="text-[11px] text-slate-400">Engineering Facets</span>
            </div>

            <div className="space-y-3">
              {Object.entries(evaluation.dimensionBreakdown).map(([dim, data]) => (
                <div key={dim} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{dim}</span>
                    <span className="text-[#1C0D12] font-bold">
                      {data.earnedMarks} / {data.totalMarks} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.percentage >= 75
                          ? 'bg-gradient-to-r from-[#881337] to-[#9F1239]'
                          : data.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Focus / Weak Areas Notice */}
        {evaluation.weakAreas.length > 0 && (
          <div className="bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#881337]" />
              <h2 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">
                Recommended Focus Areas for Mastery
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your evaluation, reinforcement in the following dimensions will strengthen your Skill Passport:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {evaluation.weakAreas.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#FECDD3] px-3 py-1.5 rounded-xl text-xs font-medium text-[#1C0D12] flex items-center gap-2"
                >
                  <span className="capitalize font-bold">{w.skillId}</span>
                  <span className="text-slate-400">•</span>
                  <span>{w.dimension}</span>
                  <span className="text-[#881337] font-semibold">({w.score}%)</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link
                href="/practice"
                className="text-xs font-bold text-[#881337] hover:underline inline-flex items-center gap-1"
              >
                Go to Practice Exercises for these skills <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Detailed Question Review Section */}
        <section className="bg-white rounded-3xl border border-[#FFE4E6] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FFE4E6]">
            <div>
              <h2 className="text-base font-bold text-[#1C0D12]">Detailed Technical Question Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your responses, correct answers, and comprehensive engineering explanations.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#FFFDF7] p-1 rounded-xl text-xs font-medium text-slate-600 border border-[#FECDD3]">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'all' ? 'bg-[#881337] text-white font-bold shadow-xs' : 'hover:text-[#1C0D12]'
                }`}
              >
                All ({questionResults.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('correct')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'correct' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'hover:text-[#1C0D12]'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('incorrect')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedFilter === 'incorrect' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'hover:text-[#1C0D12]'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {filteredQuestions.map((q) => {
              const questionNumber = questionResults.findIndex((item) => item.questionId === q.questionId) + 1;
              const originalQ = QUESTION_BANK.find((item) => item.id === q.questionId);

              return (
                <div
                  key={q.questionId}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                    q.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 bg-white border border-[#FECDD3] px-2 py-0.5 rounded-lg">
                        Q{questionNumber}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {q.skillId} • {q.dimension}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-[#881337]'
                        }`}
                      >
                        {q.isCorrect ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> +{q.earnedMarks} Marks
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" /> 0 / {q.maxMarks} Marks
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="mt-4 text-[#1C0D12] font-bold text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {originalQ?.question || 'Technical Assessment Question'}
                  </p>

                  {/* Optional Code Snippet */}
                  {originalQ?.codeSnippet && (
                    <div className="mt-3 bg-[#1C0D12] rounded-xl p-3.5 font-mono text-xs text-[#FFE4E6] overflow-x-auto border border-[#FECDD3]">
                      <pre>
                        <code>{originalQ.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="mt-4 space-y-2">
                    {(originalQ?.options || []).map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isUserChoice = q.userAnswers.includes(opt.id);
                      const isCorrectChoice = q.correctAnswers.includes(opt.id);

                      let optionStyle = 'border-[#FFE4E6] bg-white text-slate-700';
                      if (isCorrectChoice) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500';
                      } else if (isUserChoice && !isCorrectChoice) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${optionStyle}`}
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                              isCorrectChoice
                                ? 'bg-emerald-600 text-white'
                                : isUserChoice
                                ? 'bg-rose-500 text-white'
                                : 'bg-[#FFFDF7] text-slate-700 border border-[#FECDD3]'
                            }`}
                          >
                            {letter}
                          </div>
                          <div className="flex-1 pt-0.5">{opt.text}</div>
                          <div className="flex-shrink-0 text-[11px] font-semibold">
                            {isCorrectChoice && <span className="text-emerald-700">✓ Correct</span>}
                            {isUserChoice && !isCorrectChoice && <span className="text-[#881337]">✗ Your Choice</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  <div className="mt-4 p-4 rounded-xl bg-[#FFFDF7] border border-[#FFE4E6] text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-[#1C0D12] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#881337]" />
                      Engineering Explanation:
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-5">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Retake / Actions CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-[#FFE4E6] shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[#1C0D12]">Want to improve your performance?</h3>
            <p className="text-xs text-slate-500">
              {assessment.maxAttempts - attempt.attemptNumber > 0
                ? `You have ${assessment.maxAttempts - attempt.attemptNumber} retake attempts remaining.`
                : 'Maximum attempts reached for this assessment.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/assessments" className="px-4 py-2 border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold">
              All Assessments
            </Link>
            <Link
              href="/skill-passport/my"
              className="px-4 py-2 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#881337]" /> View Skill Passport
            </Link>
            {assessment.maxAttempts - attempt.attemptNumber > 0 && (
              <Link
                href={`/assessments/${assessment.id}`}
                className="glow-button text-xs inline-flex items-center gap-1.5 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
