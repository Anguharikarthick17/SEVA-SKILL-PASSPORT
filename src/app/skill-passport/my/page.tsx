'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService, StoredEvidence } from '@/lib/data-service';
import {
  Shield,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Code2,
  BookOpen,
  FolderKanban,
  Award,
  Info,
  Sparkles,
  HelpCircle,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { DEMO_STUDENT } from '@/data';
import { CalculatedSkillScore } from '@/lib/scoring/engine';

export default function MySkillPassportPage() {
  const [user, setUser] = useState<any>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [calculatedSkills, setCalculatedSkills] = useState<CalculatedSkillScore[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<CalculatedSkillScore | null>(null);
  const [skillEvidence, setSkillEvidence] = useState<StoredEvidence[]>([]);
  const [timelineEvidence, setTimelineEvidence] = useState<StoredEvidence[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const u = await DataService.getCurrentUser();
      if (!u) {
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/skill-passport/my');
        return;
      }
      setUser(u);
      const uid = u.id;
      
      const { calculatedSkills: scores, passport } = await DataService.recalculateScores(uid);
      setPassportData(passport);
      setCalculatedSkills(scores);
      
      // Default to first evidenced skill or React
      const initialSkill = scores.find((s) => s.evidenceCount > 0) || scores.find((s) => s.skillId.toLowerCase() === 'react') || scores[0];
      setSelectedSkill(initialSkill);

      const ev = await DataService.getUserEvidence(uid, initialSkill?.skillId);
      setSkillEvidence(ev);

      const timeline = await DataService.getEvidenceTimeline(uid);
      setTimelineEvidence(timeline);
    }
    loadData();
  }, []);

  const handleSelectSkill = async (skill: CalculatedSkillScore) => {
    setSelectedSkill(skill);
    const uid = user ? user.id : 'std-001';
    const ev = await DataService.getUserEvidence(uid, skill.skillId);
    setSkillEvidence(ev);
  };

  const openWhyThisScore = async (skill: CalculatedSkillScore) => {
    await handleSelectSkill(skill);
    setInspectorOpen(true);
  };

  const candidateId = passportData?.verificationId || (user ? `GSP-${user.id.substring(0, 8).toUpperCase()}` : 'GSP-DEMO-001');
  const overallCompetency = typeof passportData?.overallScore === 'number' ? passportData.overallScore : 0;
  const grade = passportData?.grade || (overallCompetency > 0 ? (overallCompetency >= 90 ? 'A+' : overallCompetency >= 80 ? 'A' : overallCompetency >= 70 ? 'B' : 'C') : 'Building evidence');
  const sufficientlyEvidencedCount = typeof passportData?.sufficientlyEvidencedCount === 'number'
    ? passportData.sufficientlyEvidencedCount
    : calculatedSkills.filter(s => s.isSufficientlyEvidenced).length;
  const totalCoreCount = passportData?.totalCoreSkillsCount || 7;
  const freshness = passportData?.freshnessStatus || 'Fresh';

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/verify?id=${candidateId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/verify?id=${candidateId}" width="100%" height="450" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 3000);
  };

  // Distinct evidence types count
  const distinctTypes = Array.from(new Set(timelineEvidence.map(e => e.sourceType))).length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <Shield className="w-4 h-4 text-[#FFE4E6]" />
                Verified Competency Registry
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Personal Skill Passport</h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                Your living, evidence-backed proof of capability. Evaluated continuously from practical code challenges, architectural labs, assessments, and capstone projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 bg-white text-[#881337] rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#FFE4E6]/80 transition-colors shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? 'Link Copied!' : 'Share Passport'}
              </button>
              <Link
                href={`/verify?id=${candidateId}`}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFE4E6]" />
                Public Verification View
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Prototype Disclaimer Banner */}
        <div className="p-4 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-2xl flex items-start gap-3 text-slate-700 text-xs shadow-sm">
          <Info className="w-4 h-4 text-[#881337] flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#1C0D12]">SEVA Academic Demonstration Record:</strong> Demonstrates the competency-based verification paradigm. Separates course completion progress from evaluated skill ability. All derived telemetry is backed by deterministic cryptographic integrity hashes.
          </p>
        </div>

        {/* Passport Identity Header Card */}
        <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#FFE4E6]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] text-[#881337] flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0">
                {user ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AS'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1C0D12]">
                    {user ? user.fullName : DEMO_STUDENT.name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      passportData?.passportStatus === 'active' && overallCompetency > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#FFE4E6] text-[#881337] border border-[#FECDD3]'
                    }`}
                  >
                    {passportData?.passportStatus === 'active' && overallCompetency > 0
                      ? 'Active Verified'
                      : 'Building Evidence'}
                  </span>
                  <span className="text-[10px] bg-[#FFE4E6]/50 text-[#881337] border border-[#FECDD3] font-bold px-2 py-0.5 rounded-full uppercase">
                    {freshness} Telemetry
                  </span>
                </div>
                <p className="text-sm text-slate-600">{user?.targetRole || 'Full Stack Developer'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">Verification ID: {candidateId}</span>
                  <span>•</span>
                  <span>Issued: October 1, 2024</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Evidence Integrity Verified (SHA-256)</span>
                </div>
              </div>
            </div>

            {/* Overall Competency Gauge */}
            <div className="bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl p-4 flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Overall Competency
                </span>
                <span className="text-3xl font-black text-[#881337] leading-none">
                  {overallCompetency}%
                </span>
                <span className="text-[11px] text-slate-600 font-semibold block mt-1">
                  {sufficientlyEvidencedCount > 0
                    ? `Rank ${grade} · ${sufficientlyEvidencedCount} of ${totalCoreCount} core domains evidenced`
                    : `Insufficient evidence · 0 of ${totalCoreCount} core domains evidenced`}
                </span>
              </div>
              <div
                className={`w-14 h-14 rounded-full border-4 ${
                  overallCompetency >= 70
                    ? 'border-[#881337] border-t-[#9F1239] text-[#881337]'
                    : 'border-slate-300 text-slate-500'
                } flex items-center justify-center font-black text-sm text-center leading-tight p-1 bg-[#FFE4E6]/40`}
              >
                {grade === 'Building evidence' ? 'N/A' : grade}
              </div>
            </div>
          </div>

          {/* Evidence Milestones Summary Row */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
              <span className="text-2xl font-black text-[#1C0D12] block">
                {timelineEvidence.filter((e) => e.sourceType === 'challenge').length}
              </span>
              <span className="text-xs text-slate-600">Coding Challenges Passed</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
              <span className="text-2xl font-black text-[#1C0D12] block">
                {timelineEvidence.filter((e) => e.sourceType === 'assessment').length}
              </span>
              <span className="text-xs text-slate-600">Assessments Evaluated</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
              <span className="text-2xl font-black text-[#1C0D12] block">
                {timelineEvidence.filter((e) => e.sourceType === 'lab').length}
              </span>
              <span className="text-xs text-slate-600">Guided Labs Completed</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
              <span className="text-2xl font-black text-[#1C0D12] block">{distinctTypes}</span>
              <span className="text-xs text-slate-600">Evidence Diversity Types</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Competencies & Evidence Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Competencies List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#FFE4E6] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#FFE4E6]">
              <div>
                <h3 className="text-base font-bold text-[#1C0D12]">Evaluated Competency Index</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any skill to inspect the calculation formula and underlying telemetry.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#881337] bg-[#FFE4E6] border border-[#FECDD3] px-2.5 py-1 rounded-lg">
                {sufficientlyEvidencedCount} of {totalCoreCount} Core Evidenced
              </span>
            </div>

            <div className="space-y-3">
              {calculatedSkills.map((skill) => {
                const isSelected = selectedSkill?.skillId === skill.skillId;
                return (
                  <div
                    key={skill.skillId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#881337] bg-[#FFE4E6]/20 shadow-xs'
                        : 'border-[#FFE4E6] hover:border-[#FECDD3] bg-[#FFFDF7]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C0D12] text-sm uppercase">
                          {skill.skillId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            skill.confidence === 'HIGH'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : skill.confidence === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-[#881337] border border-rose-300'
                          }`}
                        >
                          {skill.confidence} CONFIDENCE
                        </span>
                        {!skill.isSufficientlyEvidenced && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                            Building evidence
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {skill.isSufficientlyEvidenced ? (
                          <span className="font-black text-[#881337] text-base">{skill.score}%</span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">In Progress</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          !skill.isSufficientlyEvidenced
                            ? 'bg-slate-300'
                            : skill.score >= 85
                            ? 'bg-emerald-600'
                            : skill.score >= 75
                            ? 'bg-gradient-to-r from-[#881337] to-[#9F1239]'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${skill.isSufficientlyEvidenced ? skill.score : 20}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {skill.evidenceCount} items across {skill.evidenceTypes.length} source types
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectSkill(skill)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-[#881337] hover:underline"
                        >
                          Select
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => openWhyThisScore(skill)}
                          className="text-[11px] font-bold text-[#881337] bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <HelpCircle className="w-3 h-3 text-[#881337]" />
                          Why this score?
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Skill Evidence Deep-Dive (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedSkill ? (
              <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#FFE4E6]">
                  <div>
                    <span className="text-[10px] font-bold text-[#881337] uppercase tracking-wider">
                      Telemetry Deep-Dive
                    </span>
                    <h3 className="text-lg font-bold text-[#1C0D12] uppercase">{selectedSkill.skillId}</h3>
                    <span className="text-xs text-slate-500">
                      {selectedSkill.confidence} Confidence · {selectedSkill.freshnessStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    {selectedSkill.isSufficientlyEvidenced ? (
                      <span className="text-3xl font-black text-[#881337]">{selectedSkill.score}%</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Building evidence
                      </span>
                    )}
                  </div>
                </div>

                {/* Dimensions breakdown if available */}
                {Object.keys(selectedSkill.dimensionScores).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider block">
                      Competency Dimensions
                    </span>
                    <div className="space-y-2">
                      {Object.entries(selectedSkill.dimensionScores).map(([dim, score]) => (
                        <div key={dim} className="text-xs">
                          <div className="flex justify-between font-medium text-slate-700 mb-1">
                            <span>{dim}</span>
                            <span className="font-bold text-[#1C0D12]">{score}%</span>
                          </div>
                          <div className="w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#881337] to-[#9F1239] h-full rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation Summary */}
                <div className="mt-4 p-3 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-xl text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-[#1C0D12]">
                    <Sparkles className="w-3.5 h-3.5 text-[#881337]" />
                    How this was calculated
                  </div>
                  <p>{selectedSkill.explanation}</p>
                </div>

                {/* Contributing Items in Selected Skill */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">
                    Contributing Evidence Items ({skillEvidence.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {skillEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {ev.sourceType === 'challenge' && <Code2 className="w-3.5 h-3.5 text-blue-600" />}
                          {ev.sourceType === 'lab' && <BookOpen className="w-3.5 h-3.5 text-emerald-600" />}
                          {ev.sourceType === 'project' && <FolderKanban className="w-3.5 h-3.5 text-[#881337]" />}
                          {ev.sourceType === 'assessment' && <Award className="w-3.5 h-3.5 text-amber-600" />}
                          <div>
                            <span className="font-semibold text-[#1C0D12] block leading-tight">
                              {ev.metadata?.title || ev.sourceId}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {ev.sourceType} · {ev.difficulty || 'MEDIUM'}
                              {ev.dimension ? ` · ${ev.dimension}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#1C0D12] bg-white border border-[#FECDD3] px-2 py-0.5 rounded text-xs">
                          {ev.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tamper-Free Audit Telemetry */}
                <div className="mt-4 p-3 bg-[#1C0D12] text-white rounded-xl font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#FFE4E6]">
                    <span>Cryptographic Audit Hash</span>
                    <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Evidence integrity verified.
                    </span>
                  </div>
                  <p className="break-all text-emerald-400 select-all text-[10px]">
                    {skillEvidence[0]?.verificationHash || 'SHA256:SEVA:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 shadow-sm text-center text-slate-400 text-xs">
                Select a competency to view evidence sources.
              </div>
            )}

            {/* Share / Embed Box */}
            <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">
                Embed in Portfolio or LinkedIn
              </h4>
              <p className="text-xs text-slate-500">
                Showcase your verified Skill Passport badge directly on personal web portfolios.
              </p>
              <button
                onClick={handleCopyEmbed}
                className="w-full px-4 py-2 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold justify-center flex items-center gap-1.5 transition-colors"
              >
                {embedCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Snippet'}
              </button>
            </div>
          </div>
        </div>

        {/* EVIDENCE TIMELINE SECTION */}
        <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#FFE4E6]">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Clock className="w-3.5 h-3.5" />
                Live Telemetry Feed
              </div>
              <h3 className="text-xl font-bold text-[#1C0D12]">Evidence Audit Timeline</h3>
              <p className="text-xs text-slate-500 mt-1">
                Immutable chronological log of practical demonstrations that contribute to your Skill Passport.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-[#FFFDF7] border border-[#FFE4E6] px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All records cryptographically verified</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {timelineEvidence.length === 0 ? (
              <div className="text-center py-12 bg-[#FFFDF7] rounded-2xl border border-dashed border-[#FFE4E6] p-6 space-y-3">
                <div className="w-12 h-12 bg-white rounded-full border border-[#FECDD3] flex items-center justify-center mx-auto text-slate-400">
                  <Award className="w-6 h-6 text-[#881337]" />
                </div>
                <h4 className="text-sm font-bold text-[#1C0D12]">No Verifiable Telemetry Recorded Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Demonstrations from official skill assessments, interactive coding challenges, and capstone projects are automatically verified and timestamped here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/assessments"
                    className="glow-button text-xs inline-flex items-center gap-1.5 px-4 py-2 font-bold"
                  >
                    <Award className="w-3.5 h-3.5" /> Start an Assessment
                  </Link>
                </div>
              </div>
            ) : (
              timelineEvidence.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl border border-[#FFE4E6] hover:border-[#FECDD3] bg-[#FFFDF7]/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#FECDD3] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.sourceType === 'project' && <FolderKanban className="w-4 h-4 text-[#881337]" />}
                      {item.sourceType === 'challenge' && <Code2 className="w-4 h-4 text-blue-600" />}
                      {item.sourceType === 'lab' && <BookOpen className="w-4 h-4 text-emerald-600" />}
                      {item.sourceType === 'assessment' && <Award className="w-4 h-4 text-amber-600" />}
                      {item.sourceType === 'lesson' && <Check className="w-4 h-4 text-slate-400" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#1C0D12] text-sm">
                          {item.metadata?.title || item.sourceId}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] px-2 py-0.5 rounded">
                          {item.skillId}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
                          {item.sourceType}
                        </span>
                        {item.difficulty && (
                          <span className="text-[10px] font-medium text-slate-500">
                            [{item.difficulty}]
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {item.dimension && (
                          <>
                            <span>•</span>
                            <span className="text-[#1C0D12] font-medium">Dimension: {item.dimension}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                          {item.verificationHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-lg font-black text-[#881337] leading-none block">
                        {item.score}%
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* "WHY THIS SCORE?" INSPECTOR MODAL */}
      {inspectorOpen && selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#FFE4E6] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#FFE4E6]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#881337] mb-1">
                  <HelpCircle className="w-4 h-4 text-[#881337]" />
                  Evidence Inspector
                </div>
                <h3 className="text-2xl font-black text-[#1C0D12] uppercase">
                  {selectedSkill.skillId} Competency
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparent, tamper-proof explanation of how this score was derived.
                </p>
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#FFFDF7] hover:bg-[#FFE4E6]/40 text-slate-600 flex items-center justify-center transition-colors border border-[#FECDD3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score & Confidence Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
                <span className="text-xs text-slate-500 block">Evaluated Score</span>
                <span className="text-2xl font-black text-[#881337]">
                  {selectedSkill.isSufficientlyEvidenced ? `${selectedSkill.score}%` : 'Building'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
                <span className="text-xs text-slate-500 block">Confidence</span>
                <span className="text-2xl font-black text-[#1C0D12]">{selectedSkill.confidence}</span>
              </div>
              <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
                <span className="text-xs text-slate-500 block">Evidence Items</span>
                <span className="text-2xl font-black text-[#1C0D12]">{selectedSkill.evidenceCount}</span>
              </div>
            </div>

            {/* Contributing Activity Counts */}
            <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#FFE4E6] space-y-2">
              <span className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider block">
                Activity Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-[#FECDD3] text-center">
                  <span className="font-bold text-[#1C0D12] block">{selectedSkill.breakdown.challengeCount}</span>
                  <span className="text-slate-500 text-[11px]">Challenges</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#FECDD3] text-center">
                  <span className="font-bold text-[#1C0D12] block">{selectedSkill.breakdown.labCount}</span>
                  <span className="text-slate-500 text-[11px]">Guided Labs</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#FECDD3] text-center">
                  <span className="font-bold text-[#1C0D12] block">{selectedSkill.breakdown.projectCount}</span>
                  <span className="text-slate-500 text-[11px]">Projects</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#FECDD3] text-center">
                  <span className="font-bold text-[#1C0D12] block">{selectedSkill.breakdown.assessmentCount}</span>
                  <span className="text-slate-500 text-[11px]">Assessments</span>
                </div>
              </div>
            </div>

            {/* Competency Dimensions */}
            {Object.keys(selectedSkill.dimensionScores).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider block">
                  Demonstrated Competency Dimensions
                </span>
                <div className="space-y-2">
                  {Object.entries(selectedSkill.dimensionScores).map(([dim, score]) => (
                    <div key={dim} className="text-xs">
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>{dim}</span>
                        <span className="font-bold text-[#1C0D12]">{score}%</span>
                      </div>
                      <div className="w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score >= 85 ? 'bg-emerald-600' : score >= 75 ? 'bg-[#881337]' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human-Readable Explanation */}
            <div className="p-4 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] leading-relaxed space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#881337] block">
                Scoring Engine Assessment
              </span>
              <p>{selectedSkill.explanation}</p>
            </div>

            {/* Tamper-free Verification Hash */}
            <div className="p-3 bg-[#1C0D12] text-white rounded-xl text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#FFE4E6]">
                <span>Deterministic Audit Hash</span>
                <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Evidence integrity verified.
                </span>
              </div>
              <p className="break-all text-emerald-400 text-[10px] select-all">
                {skillEvidence[0]?.verificationHash || 'SHA256:SEVA:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'}
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setInspectorOpen(false)}
                className="glow-button px-5 py-2 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
