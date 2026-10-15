'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Search,
  ExternalLink,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

const SAMPLE_CANDIDATE = {
  name: 'Sample Candidate',
  role: 'Full Stack Developer',
  overall: 88,
  skills: [
    { name: 'React & Component Architecture', score: 92 },
    { name: 'Node.js & Express REST APIs', score: 89 },
    { name: 'PostgreSQL Schema & RLS', score: 84 },
    { name: 'Application Security & Auth', score: 87 },
  ],
};

const BENEFITS = [
  {
    title: 'Code Evidence, Not Claims',
    desc: 'Inspect real GitHub repositories, deployed web applications, and proctored exam telemetry before making interview decisions.',
  },
  {
    title: 'Standardized Faculty Rubrics',
    desc: 'Each capstone project is evaluated across 4 standardized dimensions by accredited institutional reviewers, removing resume bias.',
  },
  {
    title: 'Comparable Competency Profiles',
    desc: 'All candidates are evaluated under the same rigorous testing benchmarks, giving you calibrated signals across colleges.',
  },
  {
    title: 'Instant Cryptographic Verification',
    desc: 'Sealed with SHA-256 hashes for instantaneous authenticity verification with zero third-party administrative delays.',
  },
];

export default function EmployersPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 relative overflow-hidden border-b border-milan-600/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 bg-milan-50 border border-milan-600/30 rounded-full text-xs font-bold text-milan-600">
            <Briefcase className="w-3.5 h-3.5 text-milan-600" />
            <span>For Technical Recruiters &amp; Engineering Leaders</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-espresso-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Hire for Demonstrated Ability,
            <br />
            <span className="text-milan-600">Not Inflated Resumes</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            SEVA Skill Passport provides hiring teams with pre-validated, tamper-evident engineering telemetry before the first interview.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <GlowButton href="/verify" size="md" variant="primary">
              Verify a Passport <Search className="w-4 h-4 ml-1" />
            </GlowButton>
            <GlowButton href="/contact" size="md" variant="glass">
              Partner with SEVA
            </GlowButton>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 sm:py-20 border-b border-milan-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-milan-600 uppercase tracking-widest block mb-1">Recruiter Advantages</span>
            <h2 className="text-3xl font-black text-espresso-900">Why Technical Teams Rely on SEVA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-milan-600/15 shadow-sm space-y-3">
                <div className="w-8 h-8 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-espresso-900">{benefit.title}</h3>
                <p className="text-xs text-espresso-muted leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Candidate Inspection Card */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-milan-600/20 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-milan-600/10 gap-4">
              <div>
                <span className="text-xs font-bold text-milan-600 uppercase tracking-wider block">Candidate Inspection Preview</span>
                <h3 className="text-2xl font-black text-espresso-900 mt-1">{SAMPLE_CANDIDATE.name}</h3>
                <p className="text-xs text-espresso-muted">{SAMPLE_CANDIDATE.role}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold">
                  VERIFIED PROFILE
                </span>
                <span className="text-2xl font-black text-milan-600 font-mono">{SAMPLE_CANDIDATE.overall}%</span>
              </div>
            </div>

            {/* Competency Bars */}
            <div className="space-y-4">
              {SAMPLE_CANDIDATE.skills.map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-espresso-900">{s.name}</span>
                    <span className="font-black text-milan-600 font-mono">{s.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFFDF7] border border-milan-600/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#9F1239] to-[#881337] rounded-full"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-milan-600/10 flex items-center justify-between text-xs text-espresso-muted">
              <span className="font-mono text-milan-600 font-bold">SHA256:SEVA:9e21bf44...</span>
              <Link href="/verify?id=GSP-DEMO-001" className="text-milan-600 font-bold hover:underline inline-flex items-center gap-1">
                View Full Live Telemetry <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
