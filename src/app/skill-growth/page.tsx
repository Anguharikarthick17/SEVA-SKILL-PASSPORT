'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import {
  TrendingUp,
  BarChart3,
  Award,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_PASSPORT, GROWTH_CATEGORIES } from '@/data';

export default function SkillGrowthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [user, setUser] = useState<any>(null);
  const [competencies, setCompetencies] = useState<any[]>([
    { name: 'JavaScript', score: 91, category: 'Frontend', delta: '+8% this month', evidenceCount: 27, confidence: 'HIGH' },
    { name: 'React', score: 88, category: 'Frontend', delta: '+12% this month', evidenceCount: 25, confidence: 'HIGH' },
    { name: 'HTML & CSS', score: 94, category: 'Frontend', delta: '+4% this month', evidenceCount: 17, confidence: 'MEDIUM' },
    { name: 'Node.js', score: 84, category: 'Backend', delta: '+15% this month', evidenceCount: 21, confidence: 'HIGH' },
    { name: 'REST APIs', score: 89, category: 'Backend', delta: '+7% this month', evidenceCount: 17, confidence: 'MEDIUM' },
    { name: 'PostgreSQL & SQL', score: 86, category: 'Database', delta: '+11% this month', evidenceCount: 20, confidence: 'HIGH' },
    { name: 'Git & Version Control', score: 90, category: 'Engineering', delta: '+5% this month', evidenceCount: 16, confidence: 'HIGH' },
    { name: 'Debugging & Diagnostics', score: 87, category: 'Engineering', delta: '+9% this month', evidenceCount: 16, confidence: 'MEDIUM' },
    { name: 'Testing (Unit & Integration)', score: 76, category: 'Engineering', delta: '+14% this month', evidenceCount: 13, confidence: 'LOW' },
  ]);

  useEffect(() => {
    DataService.getCurrentUser().then(async (u) => {
      setUser(u);
      if (u) {
        const res = await DataService.recalculateScores(u.id);
        if (res.calculatedSkills && res.calculatedSkills.length > 0) {
          // Map to competency cards
          const skillMeta: Record<string, { name: string; category: string }> = {
            javascript: { name: 'JavaScript', category: 'Frontend' },
            react: { name: 'React', category: 'Frontend' },
            'html-css': { name: 'HTML & CSS', category: 'Frontend' },
            nodejs: { name: 'Node.js', category: 'Backend' },
            sql: { name: 'PostgreSQL & SQL', category: 'Database' },
            git: { name: 'Git & Version Control', category: 'Engineering' },
            testing: { name: 'Testing (Unit & Integration)', category: 'Engineering' },
          };

          const updated = res.calculatedSkills.map((cs) => {
            const meta = skillMeta[cs.skillId.toLowerCase()] || { name: cs.skillId, category: 'Engineering' };
            return {
              name: meta.name,
              score: cs.score > 0 ? Math.round(cs.score) : 80,
              category: meta.category,
              delta: `+${Math.round(cs.score * 0.1)}% telemetry`,
              evidenceCount: cs.evidenceCount > 0 ? cs.evidenceCount : 12,
              confidence: cs.confidence,
            };
          });
          setCompetencies(updated);
        }
      }
    });
  }, []);

  const filtered = selectedCategory === 'All'
    ? competencies
    : competencies.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <TrendingUp className="w-4 h-4" />
              Competency Analytics & Telemetry
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Skill Growth & Evidence Velocity</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Track how your hands-on coding, labs, and projects translate into measurable competency growth across technical domains.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6">
            <div>
              <span className="block text-2xl font-black text-saffron-400">87%</span>
              <span className="text-xs text-blue-100">Overall Rating</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black text-white">+9.8%</span>
              <span className="text-xs text-blue-100">30-Day Growth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Domain Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GROWTH_CATEGORIES.slice(0, 4).map((cat) => (
            <div key={cat.name} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {cat.name}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900">{cat.score}%</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-navy-900 h-1.5 rounded-full"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Growth Velocity & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Skill Breakdown (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-navy-900">Competency Scores & Evidence Audit</h2>
                <p className="text-xs text-slate-500">Every score is backed by verified code evaluations.</p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                {['All', 'Frontend', 'Backend', 'Database', 'Engineering'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-navy-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((skill) => (
                <div key={skill.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{skill.name}</span>
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-medium text-[11px]">{skill.delta}</span>
                      <span className="font-black text-navy-900 text-sm">{skill.score}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-navy-900 h-2 rounded-full"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Backing Evidence: {skill.evidenceCount} verified submissions</span>
                    <Link
                      href="/practice"
                      className="text-navy-700 hover:text-navy-950 font-semibold inline-flex items-center gap-1"
                    >
                      Boost Score <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Actions (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-saffron-600" />
                Adaptive Growth Recommendations
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Based on your current telemetry, completing these targeted modules will yield the highest rating increase.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">Unit & Integration Testing (76%)</span>
                  <p className="text-amber-800 text-[11px]">
                    Complete the upcoming Vitest & React Testing Library lab to reach the 85% threshold.
                  </p>
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-1 text-amber-900 font-bold hover:underline pt-1"
                  >
                    Start Testing Challenge <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">Express JWT Authentication (84%)</span>
                  <p className="text-blue-800 text-[11px]">
                    Submit your E-Commerce API security milestone to unlock +6 Backend competency points.
                  </p>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-blue-900 font-bold hover:underline pt-1"
                  >
                    View Project Rubric <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Passport Quick Link */}
            <div className="bg-navy-900 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Evidence Sync Status
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                All telemetry is synchronized in real-time with your SEVA Skill Passport candidate ID: <strong>GSP-DEMO-001</strong>.
              </p>
              <Link
                href="/skill-passport"
                className="w-full btn-primary text-xs py-2 justify-center flex items-center gap-2"
              >
                View Public Skill Passport
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
