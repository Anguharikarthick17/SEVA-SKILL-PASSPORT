'use client';

import React from 'react';
import {
  X,
  BookOpen,
  Code2,
  Layers,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

export default function ProblemComparison() {
  return (
    <section className="py-16 sm:py-20 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden" aria-labelledby="problem-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch max-w-7xl xl:max-w-[1400px] mx-auto">
          {/* ── LEFT CARD: THE PROBLEM (GLOSSY MILAN RED) ── */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-[#9F1239] via-[#881337] to-[#4C0519] text-white p-7 sm:p-9 flex flex-col justify-between shadow-[0_20px_50px_-10px_rgba(136, 19, 55,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] relative overflow-hidden border border-white/20">
            {/* Top reflective sheen */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-white mb-4 border border-white/25">
                <span>✦ THE PROBLEM</span>
              </div>

              {/* Title */}
              <h2 id="problem-heading" className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Certificates show completion.
                <br />
                Skills need evidence.
              </h2>

              <p className="mt-3 text-sm text-white/85 leading-relaxed max-w-md">
                Traditional learning gives you a certificate. SEVA gives you proof of what you can actually do.
              </p>
            </div>

            {/* Certificate with Red Cross Badge Graphic */}
            <div className="my-8 relative z-10 flex justify-center sm:justify-end pr-2 sm:pr-6">
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-52 sm:w-56 p-4 rounded-2xl bg-white text-espresso-900 shadow-2xl border-2 border-amber-200/80">
                  <div className="border border-dashed border-amber-300/80 p-3 rounded-xl text-center space-y-2">
                    <FileCheck2 className="w-6 h-6 mx-auto text-amber-600" />
                    <div>
                      <p className="text-xs font-black text-espresso-900">Certificate</p>
                      <p className="text-[9px] text-espresso-muted">of Course Completion</p>
                    </div>
                    <div className="h-1 w-16 bg-amber-200 mx-auto rounded" />
                    <p className="text-[8px] text-espresso-muted">Passive Watch Time: 100%</p>
                  </div>
                </div>

                {/* Big Red 'X' circle badge */}
                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#881337] border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <X className="w-6 h-6 stroke-[3]" />
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/20 text-xs text-white/80">
              <span className="font-semibold text-white">Unverified Gap:</span> Course completion alone does not demonstrate verified ability.
            </div>
          </div>

          {/* ── RIGHT CARD: THE SEVA WAY (LUMINOUS CREAM CARD) ── */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-milan-600/20 p-7 sm:p-9 flex flex-col justify-between shadow-[0_15px_40px_-10px_rgba(136, 19, 55,0.08)] relative overflow-hidden">
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-[10px] font-bold tracking-wider uppercase text-milan-600 mb-4">
                <span>✦ THE SEVA WAY</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-black text-espresso-900 leading-tight">
                <span className="text-milan-600 font-extrabold">Evidence</span> demonstrates ability.
              </h3>

              <p className="mt-3 text-sm text-espresso-muted leading-relaxed">
                Connect your learning directly to tamper-proof proof: real git commits, hands-on lab output, and authoritative rubric reviews.
              </p>
            </div>

            {/* Horizontal Workflow with Icons (Learn -> Practice -> Build -> Assess -> Evidence -> Skill Passport) */}
            <div className="my-8 py-5 px-3 rounded-2xl bg-[#FFFDF7] border border-milan-600/15">
              <div className="grid grid-cols-6 gap-1 sm:gap-2 items-center text-center">
                {/* 1. Learn */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-espresso-900">Learn</span>
                </div>

                {/* 2. Practice */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-1">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-espresso-900">Practice</span>
                </div>

                {/* 3. Build */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-1">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-espresso-900">Build</span>
                </div>

                {/* 4. Assess */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-1">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-espresso-900">Assess</span>
                </div>

                {/* 5. Evidence */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-espresso-900">Evidence</span>
                </div>

                {/* 6. Skill Passport */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-milan-600 text-white shadow-md flex items-center justify-center mb-1">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold text-milan-600">Passport</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-milan-600/10 text-xs text-espresso-muted">
              <span className="font-semibold text-espresso-900">SEVA Advantage:</span> Earn verifiable proof that recruiters can inspect in one click.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
