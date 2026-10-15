'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Info, ChevronDown, ChevronUp, Award, CheckCircle2, Sparkles } from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_PASSPORT } from '@/data';
import type { SkillScore } from '@/types';
import GlowButton from '@/components/ui/GlowButton';

export default function SkillPassportPage() {
  const passport = DEMO_PASSPORT;
  const [selectedSkill, setSelectedSkill] = useState<SkillScore | null>(null);

  const categories = ['Frontend', 'Backend', 'Database', 'Engineering'];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = passport.skills.filter((s) => s.category === cat);
    return acc;
  }, {} as Record<string, SkillScore[]>);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 text-center border-b border-milan-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-milan-50 rounded-full text-xs font-bold uppercase tracking-wider text-milan-600 mb-4 border border-milan-600/30">
            <Shield className="w-4 h-4 text-milan-600" />
            Evidence-Backed Competency Ledger
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-espresso-900">
            From Proof of Course to<br />
            <span className="text-milan-600">Proof of Ability.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            Your Skill Passport aggregates telemetry from every challenge, lab, capstone project, and timed assessment into a tamper-verifiable competency profile.
          </p>
        </div>
      </section>

      {/* Prototype Notice */}
      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-900 font-medium">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>The passport below is a <strong>Demonstration Profile</strong> with sample telemetry data for evaluation purposes.</span>
        </div>
      </div>

      {/* Sample Passport Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Passport Master Card (Glossy Milan Red) */}
          <div className="relative rounded-3xl p-8 mb-10 overflow-hidden bg-gradient-to-br from-[#9F1239] via-[#881337] to-[#4C0519] text-white shadow-xl border border-white/20">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                    SEVA Skill Passport · Demonstrated Profile
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white">{passport.candidateName}</h2>
                <p className="text-xs sm:text-sm text-white/80 mt-1">{passport.role}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-white/15 px-2.5 py-1 rounded-md">ID: {passport.candidateId}</span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-md">Issued: {passport.issueDate}</span>
                  <span className="bg-amber-400 text-espresso-900 font-bold px-2.5 py-1 rounded-md">VERIFIED GRADE A</span>
                </div>
              </div>

              {/* Overall Competency Gauge */}
              <div className="text-center md:text-right bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                <span className="text-xs text-white/80 font-medium block">Overall Competency</span>
                <span className="text-4xl sm:text-5xl font-black text-white">{passport.overallCompetency}%</span>
                <span className="text-[11px] text-amber-300 font-bold block mt-1">4 of 7 Core Evidenced</span>
              </div>
            </div>
          </div>

          {/* Grouped Skills Grid (White/Cream Cards) */}
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat} className="p-6 sm:p-8 rounded-3xl bg-white border border-milan-600/15 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-milan-600/10">
                  <h3 className="text-base font-extrabold text-espresso-900">{cat} Competencies</h3>
                  <span className="text-xs text-espresso-muted font-mono">{grouped[cat]?.length || 0} Domains</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[cat]?.map((skill) => (
                    <div
                      key={skill.name}
                      onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
                      className="p-4 rounded-2xl bg-[#FFFDF7] border border-milan-600/10 hover:border-milan-600/30 transition-all cursor-pointer"
                    >
                      <SkillBar name={skill.name} score={skill.score} category={skill.category} />
                      <div className="mt-2.5 pt-2 border-t border-milan-600/10 flex items-center justify-between text-[11px] text-espresso-muted">
                        <span>{skill.evidence?.reduce((sum, e) => sum + e.count, 0) || 0} verified artifacts</span>
                        <span className="text-milan-600 font-bold">Inspect Provenance →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
