'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_PASSPORT } from '@/data';
import type { SkillScore } from '@/types';

export default function SkillPassportPage() {
  const passport = DEMO_PASSPORT;
  const [selectedSkill, setSelectedSkill] = useState<SkillScore | null>(null);

  const categories = ['Frontend', 'Backend', 'Database', 'Engineering'];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = passport.skills.filter((s) => s.category === cat);
    return acc;
  }, {} as Record<string, SkillScore[]>);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-saffron-400 uppercase tracking-widest mb-3">Skill Passport</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            From Proof of Course to<br />Proof of Ability.
          </h1>
          <p className="mt-5 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Your Skill Passport aggregates evidence from every challenge, lab, project, and assessment
            into a transparent, evidence-backed competency profile.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-amber-800">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          The passport below is a <strong className="mx-1">Demonstration Profile</strong> with sample data only. It does not represent a real credential.
        </div>
      </div>

      {/* Sample Passport */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Passport Header */}
          <div className="bg-passport-gradient rounded-2xl p-8 mb-8 shadow-passport relative overflow-hidden">
            <div className="absolute inset-0 hero-pattern pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-saffron-400" />
                  <span className="text-saffron-400 text-sm font-bold uppercase tracking-wider">SEVA Skill Passport</span>
                  <span className="demo-label ml-2">Demonstration Profile</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{passport.candidateName}</h2>
                <p className="text-blue-300 text-lg mt-1">{passport.role}</p>
                <p className="text-white/50 text-xs mt-2">ID: {passport.candidateId}</p>
              </div>
              <div className="text-center passport-glass rounded-xl p-5 min-w-[120px]">
                <p className="text-5xl font-black text-saffron-400">{passport.overallCompetency}</p>
                <p className="text-white/60 text-sm mt-1">/ 100</p>
                <p className="text-white/80 text-xs mt-1 font-medium">Overall Competency</p>
              </div>
            </div>
          </div>

          {/* Skill Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div key={cat} className="gov-card">
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-navy-600" />
                  {cat}
                </h3>
                <div className="space-y-4">
                  {grouped[cat].map((skill) => (
                    <div key={skill.name}>
                      <SkillBar name={skill.name} score={skill.score} />
                      <button
                        onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
                        className="mt-1 text-xs text-navy-600 hover:text-navy-800 underline-offset-2 hover:underline transition-colors flex items-center gap-1"
                        aria-expanded={selectedSkill?.name === skill.name}
                      >
                        View evidence
                        {selectedSkill?.name === skill.name ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Evidence panel */}
                      {selectedSkill?.name === skill.name && skill.evidence && (
                        <div className="mt-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
                          <p className="text-sm font-bold text-navy-900 mb-3">
                            {skill.name} — {skill.score}%
                          </p>
                          <div className="space-y-2">
                            {skill.evidence.map((ev) => (
                              <div key={ev.label} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                  <span className={`w-2 h-2 rounded-full ${
                                    ev.type === 'challenge' ? 'bg-blue-500' :
                                    ev.type === 'lab' ? 'bg-indigo-500' :
                                    ev.type === 'project' ? 'bg-violet-500' : 'bg-orange-500'
                                  }`} />
                                  {ev.label}
                                </span>
                                <span className="font-semibold text-navy-800">{ev.count}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-3 border-t border-navy-200 pt-2">
                            Score derived from evidence performance across all completed activities.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Evidence explanation */}
          <div className="mt-8 gov-card">
            <h3 className="font-bold text-navy-900 mb-4">Why This Score?</h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              Competency scores are not self-reported or based on simple quiz completion.
              Each score is derived from performance evidence across multiple activity types:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Coding Challenges', color: 'bg-blue-100 text-blue-700', desc: 'Applied problem solving at increasing difficulty' },
                { label: 'Labs', color: 'bg-indigo-100 text-indigo-700', desc: 'Hands-on implementation in structured environments' },
                { label: 'Projects', color: 'bg-violet-100 text-violet-700', desc: 'End-to-end implementation of real-world applications' },
                { label: 'Assessments', color: 'bg-orange-100 text-orange-700', desc: 'Structured evaluations generating signed evidence' },
              ].map((e) => (
                <div key={e.label} className="text-center p-3 rounded-xl bg-slate-50">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${e.color}`}>{e.label}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="section-heading mb-4">Build your own Skill Passport.</h2>
          <p className="section-sub mb-8">Start learning and building evidence of what you can actually do.</p>
          <Link href="/register" className="btn-primary">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
