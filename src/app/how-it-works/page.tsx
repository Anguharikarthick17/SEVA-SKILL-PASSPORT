import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, FlaskConical, Rocket, BarChart3, Shield, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how SEVA Skill Passport transforms learning into evidence-backed competency.',
};

const STEPS = [
  {
    num: '01',
    icon: Shield,
    title: 'Choose a Skill',
    desc: 'Select from available learning pathways. Each pathway is designed around a specific career domain — Full Stack Development, AI/ML, Data Analytics, and more.',
    detail: 'Each pathway has a clear curriculum, defined competency outcomes, and a transparent assessment framework.',
    color: 'bg-blue-600',
  },
  {
    num: '02',
    icon: BookOpen,
    title: 'Learn',
    desc: 'Access structured video lessons, reading materials, and your AI learning assistant.',
    detail: 'The AI Tutor helps clarify concepts, provides examples, and asks practice questions — but operates only in learning mode.',
    color: 'bg-indigo-600',
  },
  {
    num: '03',
    icon: Code2,
    title: 'Practice',
    desc: 'Work through coding labs and practice challenges that reinforce each concept.',
    detail: 'Labs run in a structured environment with immediate feedback. Challenges test applied understanding, not just recall.',
    color: 'bg-violet-600',
  },
  {
    num: '04',
    icon: FlaskConical,
    title: 'Build',
    desc: 'Complete real-world projects that require applying multiple skills together.',
    detail: 'Projects are evaluated across dimensions: requirements implementation, code quality, testing, security, and evidence quality.',
    color: 'bg-purple-600',
  },
  {
    num: '05',
    icon: Rocket,
    title: 'Demonstrate',
    desc: 'Take structured assessments that generate verifiable evidence of your capability.',
    detail: 'Assessments are skill-specific and contribute to your evidence bank. Scores reflect genuine performance, not just completion.',
    color: 'bg-orange-600',
  },
  {
    num: '06',
    icon: Shield,
    title: 'Build Your Skill Passport',
    desc: 'All your evidence aggregates into a transparent, competency-based Skill Passport.',
    detail: 'Employers can view your Skill Passport and understand exactly what you can do — backed by evidence, not just claims.',
    color: 'bg-green-600',
  },
];

const FORMATS = [
  { label: 'Video Lessons', desc: 'Structured, concise lessons with a clear learning objective per video.' },
  { label: 'AI Learning Assistant', desc: 'Ask questions, get explanations, and practice concepts with AI guidance.' },
  { label: 'Coding Labs', desc: 'Hands-on labs in a structured environment with automated feedback.' },
  { label: 'Practice Challenges', desc: 'Timed challenges that test applied skill at increasing difficulty levels.' },
  { label: 'Projects', desc: 'Full project implementations that require multi-skill integration.' },
  { label: 'Assessments', desc: 'Structured evaluations that generate signed evidence for your passport.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">How It Works</h1>
          <p className="mt-5 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            A six-step journey from choosing a skill to holding an evidence-backed Skill Passport.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6">
                {/* Step indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${step.color} shadow-md`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 mt-3" style={{ minHeight: '40px' }} />
                  )}
                </div>
                {/* Content */}
                <div className="gov-card flex-1 mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 tracking-widest">STEP {step.num}</span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h2>
                  <p className="text-slate-700 mb-3">{step.desc}</p>
                  <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Formats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Learning Experience</h2>
            <p className="section-sub">Multiple formats designed for depth, not just breadth.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FORMATS.map((f) => (
              <div key={f.label} className="gov-card hover:shadow-gov-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <h3 className="font-bold text-navy-900 text-sm">{f.label}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-6">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="section-heading mb-4">Ready to start?</h2>
          <p className="section-sub mb-8">Begin your journey with the Full Stack Developer pathway.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/courses/full-stack-development" className="btn-secondary">
              View Full Stack Course
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
