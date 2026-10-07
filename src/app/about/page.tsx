import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About SEVA Skill Passport',
  description: 'Learn about SEVA Skill Passport — a proposed platform transforming skill learning into evidence-backed competency.',
};

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    desc: 'Curated curriculum built around real-world skill requirements, not just theoretical knowledge.',
  },
  {
    icon: Target,
    title: 'Evidence-Backed',
    desc: 'Every competency score is backed by verifiable evidence — challenges, labs, projects, and assessments.',
  },
  {
    icon: Users,
    title: 'Employer-Readable',
    desc: 'The Skill Passport communicates capability in a format that employers can understand and trust.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification Ready',
    desc: 'Designed for future integration with trusted verification ecosystems, starting with the prototype today.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-white/10 border border-white/20 rounded-full text-xs text-white/80">
            SEVA Hackathon Project · Prototype
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            About SEVA Skill Passport
          </h1>
          <p className="mt-5 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            A platform concept that reimagines how skill development is structured, assessed, and communicated.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-saffron-600 uppercase tracking-widest mb-2">Our Purpose</p>
            <h2 className="section-heading">Proof of Course → Proof of Ability</h2>
          </div>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg space-y-5">
            <p>
              The modern skills economy faces a fundamental challenge: learners complete courses, collect
              certificates, and still struggle to communicate what they can actually do. Employers receive
              stacks of credentials with little insight into the real capabilities behind them.
            </p>
            <p>
              SEVA Skill Passport is a proposed platform that addresses this gap. By combining structured
              learning, hands-on practice, project work, and rigorous assessment, it builds a continuous
              record of evidence — not just completion records.
            </p>
            <p>
              The result is a <strong className="text-navy-900">Skill Passport</strong>: a competency profile
              backed by verifiable evidence that communicates genuine ability to employers, mentors, and
              the broader ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-xl mt-0.5">⚠</span>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Important Notice</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                SEVA Skill Passport is a <strong>prototype developed for the SEVA Hackathon</strong>.
                It is not an official Government of India platform. The ₹100 proposed fee is not a
                government fee. No government certificates are issued. The platform does not claim
                government ownership, certification authority, or examination rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Platform Pillars</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="gov-card text-center hover:shadow-gov-md transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-50 rounded-xl mb-4">
                  <p.icon className="w-6 h-6 text-navy-700" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-heading mb-6">Long-Term Vision</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The long-term vision for SEVA Skill Passport is integration with a government-endorsed
            skill verification ecosystem — where Skill Passports are trusted, portable, and
            recognisable across employers and institutions. This is the direction, not the current state.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/courses" className="btn-primary">
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
