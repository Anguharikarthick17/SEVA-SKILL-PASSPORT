import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search, BarChart3, CheckCircle2 } from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';

export const metadata: Metadata = {
  title: 'For Employers',
  description: 'Discover candidates based on demonstrated ability, not just certificate counts.',
};

const SAMPLE_CANDIDATE = {
  name: 'Sample Candidate',
  role: 'Full Stack Developer',
  overall: 87,
  skills: [
    { name: 'React', score: 88 },
    { name: 'Node.js', score: 84 },
    { name: 'SQL', score: 82 },
    { name: 'Git', score: 90 },
  ],
};

const BENEFITS = [
  {
    title: 'Evidence, Not Claims',
    desc: 'Every competency score is backed by verifiable evidence from challenges, labs, projects, and assessments.',
  },
  {
    title: 'Skill-Level Transparency',
    desc: 'See exactly which skills a candidate has demonstrated capability in, and at what level.',
  },
  {
    title: 'Comparable Profiles',
    desc: 'All Skill Passports use the same competency framework, making candidates genuinely comparable.',
  },
  {
    title: 'Verification Ready',
    desc: 'Each Skill Passport has a unique verification ID that allows you to confirm its authenticity.',
  },
];

export default function EmployersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-saffron-400 uppercase tracking-widest mb-3">For Employers</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Hire for demonstrated ability.
          </h1>
          <p className="mt-5 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Discover candidates based on skill evidence, not just certificate counts.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-medium">
            ⚠ This is a proposed capability — not yet live. Demonstration only.
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Why Skill Passports matter to employers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="gov-card hover:shadow-gov-md transition-all">
                <CheckCircle2 className="w-6 h-6 text-green-500 mb-3" />
                <h3 className="font-bold text-navy-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample candidate card */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-heading">Sample Candidate Profile</h2>
            <p className="section-sub">This is a demonstration of how a Skill Passport appears to employers.</p>
          </div>
          <div className="gov-card shadow-gov-lg max-w-xl mx-auto">
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="demo-label">Demonstration</span>
                </div>
                <h3 className="text-xl font-bold text-navy-900">{SAMPLE_CANDIDATE.name}</h3>
                <p className="text-slate-500">{SAMPLE_CANDIDATE.role}</p>
              </div>
              <div className="text-center bg-navy-50 rounded-xl p-4">
                <p className="text-3xl font-black text-navy-900">{SAMPLE_CANDIDATE.overall}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Overall</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {SAMPLE_CANDIDATE.skills.map((skill) => (
                <SkillBar key={skill.name} name={skill.name} score={skill.score} />
              ))}
            </div>

            <Link
              href="/skill-passport"
              className="w-full btn-primary justify-center"
            >
              View Skill Passport
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-50 rounded-2xl mb-5">
            <Search className="w-7 h-7 text-navy-700" />
          </div>
          <h2 className="section-heading mb-4">Verify a Skill Passport</h2>
          <p className="section-sub mb-8 max-w-xl mx-auto">
            Enter a verification ID to confirm the authenticity of a candidate&apos;s Skill Passport.
          </p>
          <Link href="/verify" className="btn-primary">
            Go to Verification Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-800 text-sm text-center leading-relaxed">
            <strong>Important:</strong> SEVA Skill Passport is a hackathon prototype. Employer integrations
            described above are proposed capabilities. No real employer data or integrations exist at this stage.
            This platform does not claim government endorsement or affiliation.
          </p>
        </div>
      </section>
    </div>
  );
}
