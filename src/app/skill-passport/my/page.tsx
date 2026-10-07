'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Share2,
  Download,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Code2,
  BookOpen,
  FolderKanban,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight
} from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_PASSPORT, DEMO_STUDENT } from '@/data';

export default function MySkillPassportPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(DEMO_PASSPORT.skills[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const passport = DEMO_PASSPORT;

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/verify?id=${passport.candidateId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/verify?id=${passport.candidateId}" width="100%" height="450" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 3000);
  };

  const filteredSkills = activeCategory === 'All'
    ? passport.skills
    : passport.skills.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <Shield className="w-4 h-4" />
              My Official Skill Passport
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Personal Competency Passport</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Your living, evidence-backed proof of capability. Continuously updated as you solve labs, commit capstone projects, and clear assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2 bg-white text-navy-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Link Copied!' : 'Share Passport'}
            </button>
            <Link
              href={`/verify?id=${passport.candidateId}`}
              className="px-4 py-2 bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-navy-700 transition-colors border border-white/20"
            >
              <ShieldCheck className="w-4 h-4 text-saffron-400" />
              Public Verification View
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Prototype Disclaimer Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>SEVA Hackathon Notice:</strong> This Skill Passport represents the proposed evidence-based verification paradigm. In this prototype, evidence telemetry is simulated for demonstration purposes.
          </p>
        </div>

        {/* Passport Identity Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                    {DEMO_STUDENT.name}
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-600">{passport.role}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">ID: {passport.candidateId}</span>
                  <span>•</span>
                  <span>Issued: {passport.issueDate}</span>
                  <span>•</span>
                  <span>Valid until: {passport.validUntil}</span>
                </div>
              </div>
            </div>

            {/* Overall Competency Gauge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Overall Competency
                </span>
                <span className="text-3xl font-black text-navy-900 leading-none">
                  {passport.overallCompetency}%
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                  High Confidence (Rank A)
                </span>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-navy-900 border-t-saffron-500 flex items-center justify-center font-bold text-navy-900 text-xs">
                A+
              </div>
            </div>
          </div>

          {/* Evidence Milestones Summary Row */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl font-bold text-navy-900 block">15</span>
              <span className="text-xs text-slate-600">Coding Challenges Passed</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl font-bold text-navy-900 block">9</span>
              <span className="text-xs text-slate-600">Hands-on Labs Completed</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl font-bold text-navy-900 block">2</span>
              <span className="text-xs text-slate-600">Capstone Projects Built</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl font-bold text-navy-900 block">3</span>
              <span className="text-xs text-slate-600">Evaluated Assessments</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Competencies & Evidence Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Competencies List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy-900">Evaluated Competency Index</h3>

              {/* Filters */}
              <div className="flex items-center gap-1">
                {['All', 'Frontend', 'Backend', 'Database', 'Engineering'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? 'bg-navy-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkill?.name === skill.name;
                return (
                  <button
                    key={skill.name}
                    onClick={() => setSelectedSkill(skill)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-navy-900 bg-navy-50/40 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <SkillBar name={skill.name} score={skill.score} category={skill.category} />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Click to inspect audit trail</span>
                      <span className="font-semibold text-navy-700">
                        {skill.evidence ? `${skill.evidence.length} evidence sources` : 'Verified'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Evidence Inspector Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedSkill ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider">
                      Evidence Deep-Dive
                    </span>
                    <h3 className="text-lg font-bold text-navy-900">{selectedSkill.name}</h3>
                    <span className="text-xs text-slate-500">{selectedSkill.category} Domain</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-navy-900">{selectedSkill.score}%</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Verified</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                    Contributing Telemetry
                  </h4>

                  {selectedSkill.evidence && selectedSkill.evidence.length > 0 ? (
                    selectedSkill.evidence.map((ev: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {ev.type === 'challenge' && <Code2 className="w-4 h-4 text-blue-600" />}
                          {ev.type === 'lab' && <BookOpen className="w-4 h-4 text-emerald-600" />}
                          {ev.type === 'project' && <FolderKanban className="w-4 h-4 text-purple-600" />}
                          {ev.type === 'assessment' && <Award className="w-4 h-4 text-amber-600" />}
                          <span className="font-semibold text-slate-800">{ev.label}</span>
                        </div>
                        <span className="font-bold text-navy-900 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {ev.count} completed
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                      Automated code challenge and capstone project submissions contributed to this score.
                    </div>
                  )}
                </div>

                {/* Audit Hash */}
                <div className="mt-4 p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] space-y-1">
                  <span className="text-slate-400 block text-[10px]">Tamper-Proof Audit Telemetry</span>
                  <p className="break-all text-emerald-400 select-all">
                    sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center text-slate-400 text-xs">
                Select a competency to view evidence sources.
              </div>
            )}

            {/* Share / Embed Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Embed in Portfolio or LinkedIn
              </h4>
              <p className="text-xs text-slate-500">
                Showcase your verified Skill Passport badge directly on personal web portfolios.
              </p>
              <button
                onClick={handleCopyEmbed}
                className="w-full btn-outline text-xs py-2 justify-center flex items-center gap-1.5"
              >
                {embedCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Snippet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
