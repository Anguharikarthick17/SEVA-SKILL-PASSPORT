'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ArrowRight,
  Shield,
  Sparkles,
  Filter,
  RotateCcw
} from 'lucide-react';
import { AssessmentService } from '@/lib/assessments/service';
import { AssessmentConfig, AssessmentAttempt } from '@/types/assessment';
import { DataService, UserProfile } from '@/lib/data-service';

export default function AssessmentsCatalogPage() {
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
  const [, setUser] = useState<UserProfile | null>(null);
  const [userAttempts, setUserAttempts] = useState<Record<string, AssessmentAttempt[]>>({});
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      const currentUser = await DataService.getCurrentUser();
      setUser(currentUser);
      const list = AssessmentService.getAvailableAssessments();
      setAssessments(list);

      if (currentUser) {
        const attemptsMap: Record<string, AssessmentAttempt[]> = {};
        list.forEach((ass) => {
          attemptsMap[ass.id] = AssessmentService.getUserAttempts(currentUser.id, ass.id);
        });
        setUserAttempts(attemptsMap);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'Database'];

  const filteredAssessments = assessments.filter((ass) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Full Stack' && ass.skillId === 'full-stack') return true;
    if (selectedFilter === 'Frontend' && (ass.skillId === 'react' || ass.skills.includes('react'))) return true;
    if (selectedFilter === 'Backend' && (ass.skillId === 'nodejs' || ass.skills.includes('nodejs'))) return true;
    if (selectedFilter === 'Database' && (ass.skillId === 'sql' || ass.skills.includes('sql'))) return true;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Hero Header Banner - Milan Red Glossy Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <Award className="w-4 h-4 text-[#FFE4E6]" />
                Verified Competency Evaluations
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Module &amp; Practical Assessments</h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                Timed, proctored evaluations testing code reasoning, architecture trade-offs, and debugging. Every evaluated assessment produces cryptographically signed evidence for your Skill Passport (20% weight).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/skill-passport"
                className="bg-[#FFE4E6] text-[#881337] hover:bg-[#FFE4E6]/90 px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl shadow-md transition-all"
              >
                <Shield className="w-4 h-4" />
                View My Evidence Bank
              </Link>
              <Link
                href="/practice"
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#FFE4E6]" />
                Practice Coding Arena
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Notice Banner */}
        <div className="p-4 bg-[#FFE4E6]/50 border border-[#FECDD3] rounded-2xl flex items-start gap-3.5 text-slate-700 text-xs shadow-sm">
          <Shield className="w-4 h-4 text-[#881337] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#1C0D12]">Proof of Ability:</strong> Assessments are rigorously evaluated on the server with anti-tampering verification. Multiple question types are supported including code output prediction, syntax debugging, SQL interpretation, and software architecture decisions.
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#FFE4E6] shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#881337]" />
            <span className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">Domain Filter:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === cat
                      ? 'bg-[#881337] text-white shadow-sm'
                      : 'bg-[#FFFDF7] text-slate-600 border border-[#FECDD3] hover:text-[#1C0D12] hover:bg-[#FFE4E6]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-[#1C0D12]">{filteredAssessments.length}</strong> active assessments
          </div>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((ass) => {
            const attempts = userAttempts[ass.id] || [];
            const evaluatedAttempts = attempts.filter((a) => a.status === 'evaluated' || a.status === 'timed_out');
            const bestAttempt = evaluatedAttempts.length > 0
              ? [...evaluatedAttempts].sort((a, b) => b.percentage - a.percentage)[0]
              : null;
            const hasPassed = bestAttempt && bestAttempt.percentage >= ass.passingThreshold;
            const remainingAttempts = Math.max(0, ass.maxAttempts - evaluatedAttempts.length);

            return (
              <div
                key={ass.id}
                className="bg-white rounded-2xl border border-[#FFE4E6] hover:border-[#881337]/50 hover:shadow-md transition-all p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] px-2.5 py-0.5 rounded-full">
                      {ass.skillId.toUpperCase()}
                    </span>

                    {bestAttempt ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          hasPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-[#FFE4E6] text-[#881337] border border-[#FECDD3]'
                        }`}
                      >
                        {hasPassed ? `Passed (${bestAttempt.percentage}%)` : `Best: ${bestAttempt.percentage}%`}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium bg-[#FFFDF7] border border-[#FECDD3] px-2.5 py-0.5 rounded-full">
                        Not Attempted
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#1C0D12] leading-snug mb-2">
                    {ass.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {ass.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {ass.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-[#FFE4E6]/40 border border-[#FECDD3] text-slate-700 px-2 py-0.5 rounded-md font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specs Box */}
                <div className="pt-4 border-t border-[#FFE4E6] space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                      <span className="font-bold text-[#1C0D12] block">{ass.durationMinutes}m</span>
                      <span className="text-[10px] text-slate-500">Duration</span>
                    </div>
                    <div className="p-2.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                      <span className="font-bold text-[#1C0D12] block">{ass.questionCount}</span>
                      <span className="text-[10px] text-slate-500">Questions</span>
                    </div>
                    <div className="p-2.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                      <span className="font-bold text-[#1C0D12] block">{ass.passingThreshold}%</span>
                      <span className="text-[10px] text-slate-500">Pass Mark</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      Attempts left: <strong className="text-[#1C0D12]">{remainingAttempts}</strong> of {ass.maxAttempts}
                    </span>
                    <span className="text-[#881337] font-bold text-[11px]">
                      Weight: 20%
                    </span>
                  </div>

                  <Link
                    href={`/assessments/${ass.id}`}
                    className="w-full glow-button text-xs py-2.5 justify-center flex items-center gap-1.5 font-bold"
                  >
                    {bestAttempt ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        View / Retake Assessment
                      </>
                    ) : (
                      <>
                        <span>Start Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
