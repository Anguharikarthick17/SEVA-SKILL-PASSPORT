'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Code2,
  Layers,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

const STEPS = [
  {
    step: 1,
    title: 'Learn',
    sub: 'Core concepts with structured modules',
    icon: BookOpen,
    detail: 'Master technical fundamentals through hands-on lessons, architecture breakdowns, and interactive examples.',
  },
  {
    step: 2,
    title: 'Practice',
    sub: 'Guided labs and hands-on exercises',
    icon: Code2,
    detail: 'Write and run code in our browser execution environment with automated unit tests and instant feedback.',
  },
  {
    step: 3,
    title: 'Build',
    sub: 'Real-world projects with mentorship',
    icon: Layers,
    detail: 'Develop full-stack capstone projects from scratch, committing clean git history and production deployment URLs.',
  },
  {
    step: 4,
    title: 'Assess',
    sub: 'Timed assessments and skill evaluations',
    icon: FileText,
    detail: 'Complete timed multiple-select and code-output assessments with strict anti-leakage and attempt protection.',
  },
  {
    step: 5,
    title: 'Evidence',
    sub: 'Verified and secured with SHA-256 hashing',
    icon: ShieldCheck,
    detail: 'Every successful submission and rubric review produces an immutable, cryptographically verifiable hash record.',
  },
  {
    step: 6,
    title: 'Earn Passport',
    sub: 'Showcase your skills to the world',
    icon: Award,
    detail: 'Receive a live, tamper-proof SEVA Skill Passport that recruiters and employers can verify in a single click.',
  },
];

export default function ProcessVisualization() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden border-t border-b border-milan-600/10" aria-labelledby="journey-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        {/* Section Header (Matching Visual Reference) */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-[10px] font-bold tracking-wider uppercase text-milan-600 mb-3">
            <span>✦ HOW IT WORKS</span>
          </div>
          <h2 id="journey-heading" className="text-3xl sm:text-4xl font-black text-espresso-900 tracking-tight">
            Your Learning Journey
          </h2>
          <p className="text-espresso-muted text-sm sm:text-base mt-2 leading-relaxed">
            A complete path from learning to verified skills.
          </p>
        </div>

        {/* 6-Stage Connected Sequence (Matching Visual Reference) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-white border-milan-600 shadow-[0_10px_25px_rgba(136, 19, 55,0.15)] -translate-y-1'
                    : 'bg-white/60 border-milan-600/15 hover:bg-white hover:border-milan-600/40 shadow-sm'
                }`}
              >
                {/* Number Circle Badge */}
                <div className="flex items-center justify-center mb-3">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${
                      isSelected
                        ? 'bg-milan-600 text-white shadow-md'
                        : 'bg-milan-50 text-milan-600 border border-milan-600/30'
                    }`}
                  >
                    {s.step}
                  </div>
                </div>

                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    isSelected
                      ? 'bg-milan-50 text-milan-600'
                      : 'bg-[#FFFDF7] text-espresso-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-espresso-900 mb-1">
                  {s.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[11px] text-espresso-muted leading-snug line-clamp-2">
                  {s.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Detail Drawer */}
        <div className="mt-10 max-w-3xl mx-auto p-6 sm:p-7 rounded-3xl bg-white border border-milan-600/20 shadow-[0_10px_35px_-10px_rgba(136, 19, 55,0.1)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-milan-50 border border-milan-600/30 flex items-center justify-center text-milan-600 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-milan-600 uppercase tracking-wider">
                  Step {STEPS[activeStep].step} Focus
                </span>
                <span className="text-[10px] text-espresso-muted">•</span>
                <span className="text-xs font-bold text-espresso-900">{STEPS[activeStep].title}</span>
              </div>
              <p className="text-xs sm:text-sm text-espresso-muted mt-1 leading-relaxed">
                {STEPS[activeStep].detail}
              </p>
            </div>
          </div>

          <GlowButton href="/how-it-works" size="sm" variant="primary" className="whitespace-nowrap flex-shrink-0">
            Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
