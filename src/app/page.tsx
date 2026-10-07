import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, BookOpen, Code2, FlaskConical, Rocket, Award, Shield } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';
import { COURSES } from '@/data';

export const metadata: Metadata = {
  title: 'SEVA Skill Passport — Learn. Practice. Build. Prove.',
  description:
    'A proposed skill-development platform that transforms learning into measurable, evidence-backed ability.',
};

const JOURNEY_STEPS = [
  { label: 'LEARN', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { label: 'PRACTICE', icon: Code2, color: 'bg-indigo-100 text-indigo-700' },
  { label: 'BUILD', icon: FlaskConical, color: 'bg-violet-100 text-violet-700' },
  { label: 'DEMONSTRATE', icon: Rocket, color: 'bg-orange-100 text-orange-700' },
  { label: 'SKILL PASSPORT', icon: Shield, color: 'bg-green-100 text-green-700' },
];

const HOW_STEPS = [
  { num: '01', title: 'Choose a Skill', desc: 'Select a structured learning pathway aligned to your career goals.' },
  { num: '02', title: 'Learn', desc: 'Study through curated videos, reading materials, and an AI learning assistant.' },
  { num: '03', title: 'Practice', desc: 'Apply concepts in hands-on coding labs and challenge exercises.' },
  { num: '04', title: 'Build', desc: 'Work on real-world projects that demonstrate your capability end-to-end.' },
  { num: '05', title: 'Demonstrate', desc: 'Complete assessments that generate verifiable evidence of your skills.' },
  { num: '06', title: 'Build Your Skill Passport', desc: 'Your evidence aggregates into a competency-based Skill Passport.' },
];

const TRUST_ITEMS = [
  { stat: '12', label: 'Curriculum Modules', sub: 'Full Stack pathway' },
  { stat: '₹100', label: 'Proposed Access', sub: 'Not a government fee' },
  { stat: '6+', label: 'Skill Domains', sub: 'Planned pathways' },
  { stat: '100%', label: 'Evidence-Backed', sub: 'Not just certificates' },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient hero-pattern" aria-label="Hero">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-saffron-500/10 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          {/* Prototype notice */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron-400 animate-pulse" />
            SEVA Hackathon Prototype · Not an official government platform
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Learn Skills.
              <br />
              Build Ability.
              <br />
              <span className="text-saffron-400">Prove What You Can Do.</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed max-w-2xl">
              SEVA Skill Passport is a proposed skill-development platform that transforms learning
              into measurable, evidence-backed ability — going beyond course certificates.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-navy-900 font-bold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                id="hero-explore-courses"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/25 hover:bg-white/20 transition-all duration-200"
                id="hero-how-it-works"
              >
                How It Works
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOURNEY STRIP ─────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-8" aria-label="Learning journey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-0">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${step.color}`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-navy-900 tracking-wide">{step.label}</span>
                </div>
                {i < JOURNEY_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 mx-1 hidden md:block" />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Every step generates evidence → Your Skill Passport
          </p>
        </div>
      </section>

      {/* ── PROBLEM SECTION ───────────────────────── */}
      <section className="py-20 bg-gov-bg" aria-labelledby="problem-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="problem-heading" className="section-heading">
              Certificates show completion.
              <br />
              <span className="gradient-text">Skills show capability.</span>
            </h2>
            <p className="section-sub max-w-2xl mx-auto">
              Many learners collect course certificates, but employers still need to understand
              what a candidate can actually do. SEVA bridges that gap.
            </p>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Traditional */}
            <div className="gov-card border-red-100">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wider">Traditional Approach</h3>
              </div>
              <div className="flex flex-col items-center gap-3">
                {['Course', 'Quiz', 'Certificate'].map((step, i, arr) => (
                  <div key={step} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full py-3 px-4 bg-red-50 border border-red-100 rounded-lg text-center text-sm font-medium text-red-700">
                      {step}
                    </div>
                    {i < arr.length - 1 && <div className="text-red-300 text-lg">↓</div>}
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center mt-2">Completion ≠ Capability</p>
              </div>
            </div>

            {/* SEVA */}
            <div className="gov-card border-green-100">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wider">SEVA Approach</h3>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                {['Learn', 'Practice', 'Build', 'Assess', 'Evidence', 'Skill Passport'].map((step, i, arr) => (
                  <div key={step} className="flex flex-col items-center gap-1.5 w-full">
                    <div className={`w-full py-2.5 px-4 rounded-lg text-center text-sm font-semibold ${
                      step === 'Skill Passport'
                        ? 'bg-navy-900 text-white'
                        : 'bg-green-50 border border-green-100 text-green-800'
                    }`}>
                      {step}
                    </div>
                    {i < arr.length - 1 && <div className="text-green-400 text-sm">↓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="py-20 bg-white" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-saffron-600 uppercase tracking-widest mb-2">The Process</p>
            <h2 id="how-heading" className="section-heading">How It Works</h2>
            <p className="section-sub max-w-xl mx-auto">
              A structured journey from learning to a verified evidence-backed Skill Passport.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_STEPS.map((step) => (
              <div key={step.num} className="gov-card hover:shadow-gov-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-black text-navy-100 leading-none">{step.num}</span>
                  <h3 className="text-base font-bold text-navy-900">{step.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works" className="btn-primary">
              Learn More About the Process
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COURSES ───────────────────────────────── */}
      <section className="py-20 bg-gov-bg" aria-labelledby="courses-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-saffron-600 uppercase tracking-widest mb-2">Learning Pathways</p>
              <h2 id="courses-heading" className="section-heading">Skill-Building Courses</h2>
              <p className="section-sub max-w-xl">
                Structured pathways designed for real capability — not just certification.
              </p>
            </div>
            <Link href="/courses" className="btn-secondary whitespace-nowrap">
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILL PASSPORT TEASER ─────────────────── */}
      <section className="py-20 bg-passport-gradient overflow-hidden relative" aria-labelledby="passport-teaser-heading">
        <div className="absolute inset-0 hero-pattern pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-saffron-400 uppercase tracking-widest mb-3">Skill Passport</p>
              <h2 id="passport-teaser-heading" className="text-3xl md:text-4xl font-bold text-white leading-tight">
                From Proof of Course to
                <br />
                Proof of Ability.
              </h2>
              <p className="mt-5 text-blue-200 text-lg leading-relaxed">
                Your Skill Passport aggregates evidence from every challenge, lab, project, and
                assessment into a transparent competency profile.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/skill-passport" className="btn-primary bg-white text-navy-900 hover:bg-blue-50">
                  See a Sample Passport
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/employers" className="btn-secondary border-white/30 text-white hover:bg-white/10">
                  For Employers
                </Link>
              </div>
            </div>

            {/* Mini passport preview */}
            <div className="passport-glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Demonstration Profile</p>
                  <p className="text-white font-bold text-lg mt-0.5">Sample Candidate</p>
                  <p className="text-blue-300 text-sm">Full Stack Developer</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-saffron-400">87</p>
                  <p className="text-white/60 text-xs">/ 100</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'JavaScript', score: 91 },
                  { name: 'React', score: 88 },
                  { name: 'Node.js', score: 84 },
                  { name: 'REST APIs', score: 89 },
                  { name: 'SQL', score: 82 },
                ].map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3">
                    <span className="text-white/80 text-xs w-20 flex-shrink-0">{skill.name}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-saffron-400 rounded-full"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                    <span className="text-saffron-300 text-xs font-semibold w-8 text-right">{skill.score}%</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-white/40 mt-4">Sample data only — for demonstration</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ───────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100" aria-label="Platform stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-black text-navy-900">{item.stat}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-20 bg-gov-bg" aria-label="Call to action">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-heading">Start building your Skill Passport today.</h2>
          <p className="section-sub">
            Join the waitlist for the Full Stack Developer pathway and be among the first to build
            a competency profile backed by real evidence.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary" id="cta-get-started">
              Get Started — ₹100
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/courses/full-stack-development" className="btn-secondary" id="cta-view-course">
              Explore Full Stack Course
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Proposed learning access price · Not a government fee</p>
        </div>
      </section>
    </>
  );
}
