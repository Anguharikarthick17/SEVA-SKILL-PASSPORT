'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

const STEPS = [
  {
    num: '01',
    icon: BookOpen,
    title: 'Choose a Career Pathway',
    desc: 'Select from industry-vetted learning pathways. Each pathway is designed around a specific career domain — Full Stack Development, AI/ML, Cloud Computing, and more.',
    detail: 'Every pathway includes a granular competency roadmap, structured learning milestones, and transparent rubric criteria.',
  },
  {
    num: '02',
    icon: BookOpen,
    title: 'Learn with Structured Modules & AI Tutor',
    desc: 'Access modular lessons, conceptual deep dives, and an on-demand AI learning companion.',
    detail: 'The AI Tutor operates strictly in learning mode to clarify concepts and explain syntax errors, ensuring genuine comprehension.',
  },
  {
    num: '03',
    icon: Code2,
    title: 'Practice in Hands-On Coding Labs',
    desc: 'Work through interactive browser challenges with automated multi-case test runners.',
    detail: 'Code executes in a secure environment with instant test case feedback. Repeated submissions are scaled by anti-spam diminishing return curves.',
  },
  {
    num: '04',
    icon: Layers,
    title: 'Build Full-Stack Capstone Projects',
    desc: 'Implement production-style applications matching institutional specifications.',
    detail: 'Projects require public GitHub repositories, deployed endpoints, and detailed implementation notes evaluated against 4 standard rubric dimensions.',
  },
  {
    num: '05',
    icon: FileText,
    title: 'Demonstrate via Reviewer Evaluation',
    desc: 'Faculty and accredited institutional reviewers inspect your capstones against standardized rubrics.',
    detail: 'Evaluations require authoritative reviewer Bearer tokens, anti-self-review protection, and strict score boundary enforcement.',
  },
  {
    num: '06',
    icon: Award,
    title: 'Collect Qualifying Evidence in Skill Passport',
    desc: 'Passing project scores and proctored assessment attempts generate cryptographic SHA-256 evidence records.',
    detail: 'Your verifiable Skill Passport becomes an unalterable, shareable portfolio accessible to hiring managers via a single public URL.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 relative overflow-hidden border-b border-milan-600/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 bg-milan-50 border border-milan-600/30 rounded-full text-xs font-bold text-milan-600">
            <Sparkles className="w-3.5 h-3.5 text-milan-600" />
            <span>The SEVA Methodology</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-espresso-900 tracking-tight leading-tight max-w-4xl mx-auto">
            How SEVA <span className="text-milan-600">Skill Passport</span> Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            A comprehensive, connected 6-stage engineering continuum that turns theoretical learning into verified, recruiter-readable proof of ability.
          </p>
        </div>
      </section>

      {/* 6-Stage Timeline */}
      <section className="py-16 sm:py-24 border-b border-milan-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-milan-600/15 shadow-sm hover:border-milan-600/35 transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-center">
                    <span className="w-10 h-10 rounded-2xl bg-milan-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center border border-milan-600/20">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-black text-espresso-900">{step.title}</h2>
                    <p className="text-sm text-espresso-muted leading-relaxed">{step.desc}</p>
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-milan-600/10 text-xs text-espresso-800 leading-relaxed mt-3">
                      <strong className="text-milan-600 font-bold">Verification Detail: </strong>
                      {step.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black text-espresso-900 mb-3">Ready to Start Your Journey?</h2>
          <p className="text-sm text-espresso-muted mb-6">
            Explore our curriculum or create your free account to begin collecting verified competency records.
          </p>
          <div className="flex justify-center gap-4">
            <GlowButton href="/courses" size="md" variant="primary">
              Explore Courses <ArrowRight className="w-4 h-4 ml-1" />
            </GlowButton>
            <GlowButton href="/signup" size="md" variant="glass">
              Get Started Free
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}
