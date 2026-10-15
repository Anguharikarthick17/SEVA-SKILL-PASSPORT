'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Lock,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function InteractivePassportDemo() {
  const [activeTab, setActiveTab] = useState<'competencies' | 'projects' | 'assessments' | 'reviewer'>('competencies');
  const [passportQuery, setPassportQuery] = useState('');

  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden" aria-labelledby="passport-demo-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch max-w-7xl xl:max-w-[1440px] mx-auto">
          {/* ── LEFT PANEL: A VERIFIABLE RECORD (GLOSSY MILAN RED) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#9F1239] via-[#881337] to-[#4C0519] text-white p-7 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_-10px_rgba(136, 19, 55,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] relative overflow-hidden border border-white/20">
            {/* Top glossy sheen */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-white mb-4 border border-white/25">
                <span>✦ SKILL PASSPORT</span>
              </div>

              <h2 id="passport-demo-heading" className="text-2xl sm:text-3xl font-black text-white leading-tight">
                A Verifiable Record
                <br />
                of Your Abilities
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-white/85 leading-relaxed">
                Showcase your projects, assessments, and verified competencies in one shareable Skill Passport.
              </p>
            </div>

            <div className="pt-8 relative z-10">
              <GlowButton href="/skill-passport" variant="glass" size="md" className="w-full text-center">
                <span>Explore Skill Passport</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </GlowButton>
            </div>
          </div>

          {/* ── CENTER: INTERACTIVE SKILL PASSPORT CARD (CREAM) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-milan-600/20 p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_40px_-10px_rgba(136, 19, 55,0.1)] relative">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-milan-600/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-milan-50 border border-milan-600/30 flex items-center justify-center text-milan-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-milan-600 uppercase block leading-none">SEVA</span>
                    <span className="text-xs font-black text-espresso-900 leading-tight">Skill Passport</span>
                  </div>
                </div>

                <Link href="/skill-passport" className="w-6 h-6 rounded-full bg-milan-50 flex items-center justify-center text-milan-600 hover:bg-milan-600 hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Arjun Sharma Profile */}
              <div className="pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-espresso-900 text-white flex items-center justify-center font-bold text-xs">
                    AS
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-espresso-900">Arjun Sharma</h3>
                    <p className="text-[10px] text-espresso-muted">Full Stack Developer</p>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  VERIFIED
                </span>
              </div>

              {/* 4 Interactive Tabs */}
              <div className="flex items-center gap-1 border-b border-milan-600/10 pb-2 mb-3 text-[10px] font-bold">
                <button
                  onClick={() => setActiveTab('competencies')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeTab === 'competencies' ? 'bg-milan-600 text-white' : 'text-espresso-muted hover:text-milan-600'
                  }`}
                >
                  Competencies
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeTab === 'projects' ? 'bg-milan-600 text-white' : 'text-espresso-muted hover:text-milan-600'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('assessments')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeTab === 'assessments' ? 'bg-milan-600 text-white' : 'text-espresso-muted hover:text-milan-600'
                  }`}
                >
                  Assessments
                </button>
                <button
                  onClick={() => setActiveTab('reviewer')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeTab === 'reviewer' ? 'bg-milan-600 text-white' : 'text-espresso-muted hover:text-milan-600'
                  }`}
                >
                  Reviewer Report
                </button>
              </div>

              {/* Tab Content: Competency Meters */}
              {activeTab === 'competencies' && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-espresso-900 text-[11px] font-bold mb-1">
                      <span>React & Next.js</span>
                      <span className="text-milan-600 font-mono">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-milan-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#881337] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-espresso-900 text-[11px] font-bold mb-1">
                      <span>Node.js & Express</span>
                      <span className="text-milan-600 font-mono">89%</span>
                    </div>
                    <div className="w-full h-1.5 bg-milan-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#881337] rounded-full" style={{ width: '89%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-espresso-900 text-[11px] font-bold mb-1">
                      <span>Database & SQL</span>
                      <span className="text-milan-600 font-mono">84%</span>
                    </div>
                    <div className="w-full h-1.5 bg-milan-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#881337] rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-espresso-900 text-[11px] font-bold mb-1">
                      <span>System Design</span>
                      <span className="text-milan-600 font-mono">79%</span>
                    </div>
                    <div className="w-full h-1.5 bg-milan-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9F1239] to-[#881337] rounded-full" style={{ width: '79%' }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-milan-600/15">
                    <span className="text-xs font-bold text-espresso-900 block">SEVA Commerce Platform</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Evaluated Grade: 94%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-milan-600/15">
                    <span className="text-xs font-bold text-espresso-900 block">Realtime Collaboration Engine</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Evaluated Grade: 88%</span>
                  </div>
                </div>
              )}

              {activeTab === 'assessments' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-milan-600/15">
                    <span className="text-xs font-bold text-espresso-900 block">React & Next.js Advanced Architecture</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Score: 90% (Passed)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-milan-600/15">
                    <span className="text-xs font-bold text-espresso-900 block">Database Design & Schema Normalization</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Score: 85% (Passed)</span>
                  </div>
                </div>
              )}

              {activeTab === 'reviewer' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-milan-600/15">
                    <span className="text-xs font-bold text-espresso-900 block">Faculty Reviewer Evaluation</span>
                    <p className="text-[10px] text-espresso-muted mt-0.5">
                      Clean architectural boundaries, robust exception handling, and verified git commit integrity.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-milan-600/10 flex items-center justify-between text-[10px] text-espresso-muted">
              <span className="font-mono text-milan-600 font-bold">SHA256:SEVA:3dd5...</span>
              <span>100% Verifiable</span>
            </div>
          </div>

          {/* ── RIGHT PANEL: TRUSTED BY EMPLOYERS (CREAM SEARCH & VERIFY) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-milan-600/20 p-7 sm:p-8 flex flex-col justify-between shadow-[0_15px_40px_-10px_rgba(136, 19, 55,0.08)] relative">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-[10px] font-bold tracking-wider uppercase text-milan-600 mb-4">
                <span>✦ VERIFICATION</span>
              </div>

              <h3 className="text-2xl font-black text-espresso-900 leading-tight">
                Trusted by Employers
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-espresso-muted leading-relaxed">
                Employers can verify your skills, view real project evidence, and see assessment results.
              </p>

              {/* Passport Search Box with Red Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passportQuery) window.location.href = `/verify?id=${encodeURIComponent(passportQuery)}`;
                }}
                className="mt-6 flex items-center bg-[#FFFDF7] border border-milan-600/30 rounded-full p-1.5 shadow-sm"
              >
                <Search className="w-4 h-4 text-milan-600 ml-2.5 mr-1" />
                <input
                  type="text"
                  value={passportQuery}
                  onChange={(e) => setPassportQuery(e.target.value)}
                  placeholder="Enter Passport ID (e.g. SEVA-2026-IND)"
                  className="bg-transparent flex-1 text-xs font-semibold text-espresso-900 placeholder-espresso-muted focus:outline-none px-2"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9F1239] to-[#881337] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2.5 text-center">
                <Link
                  href="/verify?id=GSP-DEMO-001"
                  className="text-[11px] font-bold text-milan-600 hover:underline"
                >
                  Try Demo: SEVA-2026-IND-001
                </Link>
              </div>
            </div>

            {/* 3 Stats from Reference Image */}
            <div className="pt-6 border-t border-milan-600/10 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-black text-espresso-900 leading-none">100%</p>
                <p className="text-[10px] text-espresso-muted mt-1 leading-tight">Verifiable Evidence</p>
              </div>
              <div>
                <p className="text-base font-black text-espresso-900 leading-none">SHA-256</p>
                <p className="text-[10px] text-espresso-muted mt-1 leading-tight">Secure Hashing</p>
              </div>
              <div>
                <p className="text-base font-black text-espresso-900 leading-none">Trusted</p>
                <p className="text-[10px] text-espresso-muted mt-1 leading-tight">by Recruiters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
