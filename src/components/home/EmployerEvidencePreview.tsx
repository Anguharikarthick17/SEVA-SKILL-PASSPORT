'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Search, CheckCircle, Shield, FileSearch, ArrowRight, ExternalLink } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function EmployerEvidencePreview() {
  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden border-b border-milan-600/10" aria-labelledby="employers-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Storytelling for Hiring Managers */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-milan-600 text-[10px] font-bold tracking-wider uppercase">
              <Briefcase className="w-3.5 h-3.5 text-milan-600" />
              <span>For Engineering Leaders & Recruiters</span>
            </div>

            <h2 id="employers-heading" className="text-3xl sm:text-4xl font-black text-espresso-900 tracking-tight leading-tight">
              Hire for Demonstrated Ability,
              <br />
              <span className="text-milan-600">Not Resume Keywords.</span>
            </h2>

            <p className="text-sm sm:text-base text-espresso-muted leading-relaxed">
              Resumes and passive course completion certificates fail to reveal code quality or architectural hygiene.
              SEVA provides hiring teams with pre-validated, tamper-evident engineering telemetry before the first interview.
            </p>

            {/* Recruiter Advantages */}
            <div className="space-y-3.5 pt-2">
              {[
                {
                  title: 'Inspect Real Code & Live Deployments',
                  desc: 'Review verified GitHub commits and production endpoints built to rigorous specs.',
                },
                {
                  title: 'Standardized Faculty Rubric Evaluations',
                  desc: 'Scores reflect architectural depth, database resilience, and security best practices.',
                },
                {
                  title: 'Instant Cryptographic Verification',
                  desc: 'Confirm authenticity using SEVA’s public verification lookup with zero phone-tag overhead.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-milan-50 text-milan-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-milan-600/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-espresso-900">{item.title}</h4>
                    <p className="text-xs text-espresso-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex flex-wrap gap-3.5">
              <GlowButton href="/employers" variant="primary" size="md">
                <span>Employer Solutions</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </GlowButton>
              <Link
                href="/verify"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-milan-50 border border-milan-600/25 hover:border-milan-600 text-espresso-900 hover:text-milan-600 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Verify a Candidate</span>
                <ExternalLink className="w-3.5 h-3.5 text-milan-600" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Recruiter Dashboard Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-milan-600/20 p-6 sm:p-8 shadow-[0_15px_45px_-10px_rgba(136, 19, 55,0.12)]">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-milan-600/10 text-xs text-espresso-muted">
                <div className="flex items-center gap-2 text-espresso-900 font-bold">
                  <FileSearch className="w-4 h-4 text-milan-600" />
                  <span>SEVA Recruiter Inspection Suite</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                  VERIFIED RECORD
                </span>
              </div>

              {/* Candidate Quick Overview */}
              <div className="my-5 p-4 rounded-2xl bg-[#FFFDF7] border border-milan-600/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-espresso-900">Candidate #IND-9021</p>
                    <p className="text-xs text-espresso-muted">Demonstrated Competency: 88.5%</p>
                  </div>
                  <span className="text-base font-black text-milan-600 bg-milan-50 px-2.5 py-1 rounded-full border border-milan-600/20">
                    Top 5%
                  </span>
                </div>

                {/* Evidence Artifacts Verified */}
                <div className="space-y-2 pt-2 border-t border-milan-600/10 text-xs">
                  <div className="flex justify-between items-center text-espresso-800">
                    <span>1. Next.js & TypeScript Capstone</span>
                    <span className="text-emerald-600 font-mono font-bold">Passed (92%)</span>
                  </div>
                  <div className="flex justify-between items-center text-espresso-800">
                    <span>2. PostgreSQL Schema Architecture</span>
                    <span className="text-emerald-600 font-mono font-bold">Passed (88%)</span>
                  </div>
                  <div className="flex justify-between items-center text-espresso-800">
                    <span>3. Proctored Security Exam</span>
                    <span className="text-emerald-600 font-mono font-bold">Passed (90%)</span>
                  </div>
                </div>
              </div>

              {/* Reviewer Stamp */}
              <div className="p-3.5 rounded-2xl bg-milan-50 border border-milan-600/20 text-xs text-espresso-muted flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-espresso-muted block">Accredited Reviewer</span>
                  <span className="font-bold text-espresso-900">Prof. R. Banerjee, System Architect</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-espresso-muted block">Security Seal</span>
                  <span className="text-milan-600 font-mono text-[10px] font-bold">SHA256:SEVA:9e21...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
