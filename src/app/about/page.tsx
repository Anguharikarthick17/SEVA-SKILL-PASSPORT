import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, BookOpen, Users, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export const metadata: Metadata = {
  title: 'About SEVA Skill Passport — Proof of Course to Proof of Ability',
  description: 'Learn about SEVA Skill Passport — a proposed platform transforming skill learning into evidence-backed competency.',
};

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Structured Engineering Curricula',
    desc: 'Curated pathways built around real-world industry requirements, avoiding disjointed tutorials in favor of coherent conceptual progression.',
  },
  {
    icon: Target,
    title: 'Evidence-Backed Verification',
    desc: 'Every competency score is backed by cryptographic proof — hands-on labs, algorithmic challenges, capstone projects, and proctored exams.',
  },
  {
    icon: Users,
    title: 'Transparent Recruiter Readability',
    desc: 'The Skill Passport communicates demonstrated ability in a standardized format that hiring teams can instantly inspect and verify.',
  },
  {
    icon: ShieldCheck,
    title: 'Tamper-Evident Architecture',
    desc: 'Powered by SHA-256 verification hashes, database RLS policies, and institutional mentor reviews that prevent score fabrication.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 relative overflow-hidden border-b border-milan-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 bg-milan-50 border border-milan-600/30 rounded-full text-xs font-bold text-milan-600">
            <Sparkles className="w-3.5 h-3.5 text-milan-600" />
            <span>Academic Hackathon Prototype · Educational Innovation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-espresso-900 tracking-tight leading-tight max-w-4xl mx-auto">
            About SEVA <span className="text-milan-600">Skill Passport</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            Reimagining how practical engineering ability is structured, validated, and communicated to the modern software industry.
          </p>
        </div>
      </section>

      {/* Purpose & Philosophy Section */}
      <section className="py-16 sm:py-20 border-b border-milan-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-sm sm:text-base text-espresso-muted leading-relaxed">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-milan-600/15 shadow-sm space-y-4">
              <h2 className="text-2xl font-black text-espresso-900">
                The Fundamental Problem with Today&apos;s Credentials
              </h2>
              <p>
                In online education, completing a course typically means letting a video player stream in a background tab and passing trivial multiple-choice quizzes. The learner receives a certificate of completion, but the certificate provides zero signal regarding what code they can write or architectural decisions they can defend.
              </p>
              <p>
                Hiring managers and technical leads cannot trust passive completion certificates. As a consequence, candidates face repetitive, expensive screening processes, while capable learners from non-traditional backgrounds struggle to stand out.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#9F1239] via-[#881337] to-[#4C0519] text-white shadow-md space-y-4 border border-white/20">
              <h2 className="text-2xl font-black text-white">
                The SEVA Solution: Verified Competency &amp; Tamper-Evident Records
              </h2>
              <p className="text-white/90">
                SEVA Skill Passport bridges this trust deficit by tracking verified performance across real development tasks: algorithmic labs with automated unit testing, production-ready capstone repositories, and faculty reviews scored against standardized rubrics.
              </p>
              <p className="text-white/90">
                Each milestone generates a cryptographic SHA-256 evidence record. Employers can verify an applicant&apos;s Skill Passport in seconds, inspecting genuine code samples, test coverage, and evaluator feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="py-16 sm:py-24 border-b border-milan-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-milan-600 uppercase tracking-widest block mb-2">Core Foundation</span>
            <h2 className="text-3xl font-black text-espresso-900 tracking-tight">Four Foundational Pillars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white border border-milan-600/15 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-milan-50 border border-milan-600/25 flex items-center justify-center text-milan-600 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-espresso-900 mb-2">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Academic Prototype Notice */}
      <section className="py-14 sm:py-18">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-300 shadow-sm flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
            <div className="space-y-2 text-xs sm:text-sm text-espresso-muted">
              <h3 className="text-base font-bold text-espresso-900">Prototype Disclaimer &amp; Hackathon Governance</h3>
              <p>
                SEVA Skill Passport is an academic and educational technology demonstration built for competition evaluation. It is not an officially affiliated Government of India agency, nor does it issue statutory licenses.
              </p>
              <p>
                The ₹100 target access fee is a research proposal designed to study sustainable compute economics for affordable higher education across India.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <GlowButton href="/courses" size="lg" variant="primary">
              Explore Our Learning Pathways <ArrowRight className="w-4 h-4 ml-1" />
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}
