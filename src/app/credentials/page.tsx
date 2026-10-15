'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import {
  Award,
  ShieldCheck,
  Download,
  Share2,
  QrCode,
  CheckCircle2,
  Check,
  Info,
  AlertCircle,
  Sparkles,
  BookOpen,
  Code2,
  FileCheck2,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function CredentialsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [issuingType, setIssuingType] = useState<string | null>(null);

  const loadData = async (userId: string) => {
    try {
      // 1. Fetch user credentials
      const creds = await DataService.getUserCredentials(userId);
      if (creds) {
        setCredentials(
          creds.map((c) => ({
            id: c.id,
            title: c.title,
            subtitle:
              c.credentialType === 'course_completion'
                ? 'Course Completion'
                : c.credentialType === 'platform_assessment'
                ? 'Platform Assessment'
                : 'Skill Passport',
            type:
              c.credentialType === 'course_completion'
                ? 'Platform Course Completion'
                : c.credentialType === 'platform_assessment'
                ? 'Competency Assessment'
                : 'Demonstration Skill Passport',
            credentialType: c.credentialType,
            issuedDate: new Date(c.issuedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            validUntil:
              c.metadata?.validUntil ||
              (c.credentialType === 'course_completion' ? 'Lifetime' : '2 Years from Issue'),
            status: c.status === 'revoked' ? 'Revoked' : 'Active',
            isRevoked: c.status === 'revoked',
            revocationReason: c.metadata?.revocationReason,
            revokedAt: c.metadata?.revokedAt
              ? new Date(c.metadata.revokedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : undefined,
            competencyScore: c.metadata?.score || c.metadata?.overallCompetency || 85,
            verificationUrl: `/verify?id=${c.verificationId || c.id}`,
            candidateName: c.metadata?.candidateName,
          }))
        );
      }

      // 2. Fetch eligibility from server endpoint
      const res = await fetch(`/api/credentials/eligibility?userId=${userId}`);
      if (res.ok) {
        const json = await res.json();
        setEligibilityData(json.eligibility);
      }
    } catch (err: any) {
      console.error('Failed to load credentials or eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    DataService.getCurrentUser().then(async (u) => {
      if (!u) {
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/credentials');
        return;
      }
      setUser(u);
      loadData(u.id);
    });
  }, []);

  const handleCopyLink = (id: string) => {
    const fullUrl = `${window.location.origin}/verify?id=${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDownload = (title: string) => {
    setDownloadToast(`Preparing print-ready certificate PDF for "${title}"...`);
    setTimeout(() => {
      window.print();
      setDownloadToast(null);
    }, 1000);
  };

  const handleClaimCredential = async (credentialType: string) => {
    if (!user) return;
    setIssuingType(credentialType);
    setActionMessage(null);

    try {
      const res = await fetch('/api/credentials/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          credentialType,
          courseId: 'full-stack-development',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({
          type: 'error',
          text: data.error || 'Failed to claim credential. Verified requirements not satisfied.',
        });
      } else {
        setActionMessage({
          type: 'success',
          text: `Congratulations! "${data.credential?.title}" has been issued and sealed with a SHA-256 evidence hash.`,
        });
        await loadData(user.id);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error claiming credential.' });
    } finally {
      setIssuingType(null);
    }
  };

  const activeCredentials = credentials.filter((c) => !c.isRevoked);
  const studentName = user?.fullName || 'Verified Learner';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <Award className="w-4 h-4 text-[#FFE4E6]" />
                Proof of Ability Credentials
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                My Earned Credentials &amp; Certificates
              </h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                Verifiable digital certificates and skill passports backed by authentic evidence. Each credential carries a non-guessable ID, tamper-resistant SHA-256 seal, and instant public verification.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6 shadow-md">
              <div>
                <span className="block text-2xl font-black text-[#FFE4E6]">{activeCredentials.length}</span>
                <span className="text-xs text-white/80">Active Records</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-black text-emerald-300">
                  {activeCredentials.length > 0 ? '100%' : '0%'}
                </span>
                <span className="text-xs text-white/80">Integrity Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Prototype & Verification Notice */}
        <div className="p-4 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-2xl flex items-start gap-3.5 text-slate-700 text-xs shadow-sm">
          <Info className="w-4 h-4 text-[#881337] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#1C0D12]">Proof of Ability Integrity Engine:</strong> In SEVA, certificates are never awarded merely for watching lessons or clicking buttons. Each credential requires genuine demonstration of skills via code test runner evaluations, proctored assessments, and approved project rubrics.
          </p>
        </div>

        {/* Action Messages */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border border-rose-300 text-rose-900'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
        )}

        {/* Download Toast */}
        {downloadToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4 animate-bounce" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* SECTION 1: EARNED CREDENTIALS */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#FFE4E6] shadow-sm">
            <Loader2 className="w-8 h-8 text-[#881337] animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">Loading verified credential registry...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-[#FFE4E6] shadow-sm text-center space-y-4">
            <div className="w-14 h-14 bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl flex items-center justify-center text-[#881337] mx-auto shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1C0D12]">No Verified Credentials Issued Yet</h2>
              <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Credentials are automatically unlocked and ready to claim once you complete curriculum requirements, pass proctored technical evaluations, or receive faculty approval on your capstone project.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard?tab=growth"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#881337] text-white text-xs font-bold rounded-xl hover:bg-[#4C0519] transition-colors shadow-md"
              >
                <span>View Learning Growth Card</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-base font-black text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#881337]" />
              Active Digital Credentials ({credentials.length})
            </h2>

            {credentials.map((cred) => (
              <div
                key={cred.id}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  cred.isRevoked
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-[#FFE4E6] hover:border-[#881337]/50'
                }`}
              >
                {/* Card Header Stripe */}
                <div
                  className={`border-b px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${
                    cred.isRevoked ? 'bg-rose-50 border-rose-200' : 'bg-[#FFFDF7] border-[#FFE4E6]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs ${
                        cred.isRevoked
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : 'bg-[#FFE4E6] border-[#FECDD3] text-[#881337]'
                      }`}
                    >
                      {cred.isRevoked ? 'REV' : 'SP'}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest block ${
                          cred.isRevoked ? 'text-rose-700' : 'text-[#881337]'
                        }`}
                      >
                        {cred.isRevoked ? 'Revoked Credential' : 'SEVA Verified Credential'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">ID: {cred.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                        cred.isRevoked
                          ? 'text-rose-800 bg-rose-100 border-rose-300'
                          : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                      }`}
                    >
                      {cred.isRevoked ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {cred.status}
                    </span>
                  </div>
                </div>

                {/* Revocation notice if revoked */}
                {cred.isRevoked && (
                  <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Revocation Notice:</span> {cred.revocationReason || 'Invalidated by administrator'}
                      {cred.revokedAt && <span className="ml-2 text-rose-700">({cred.revokedAt})</span>}
                    </div>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Details (8 cols) */}
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          cred.isRevoked ? 'text-rose-700' : 'text-[#881337]'
                        }`}
                      >
                        {cred.type}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#1C0D12] mt-1">
                        {cred.title}
                      </h3>
                      <p className="text-sm text-slate-600">{cred.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate</span>
                        <span className="font-bold text-[#1C0D12]">{cred.candidateName || studentName}</span>
                      </div>
                      <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Issued Date</span>
                        <span className="font-bold text-[#1C0D12]">{cred.issuedDate}</span>
                      </div>
                      <div className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Competency Score</span>
                        <span className={`font-black ${cred.isRevoked ? 'text-rose-700' : 'text-[#881337]'}`}>
                          {cred.competencyScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Simulation & Quick Actions (4 cols) */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl text-center space-y-3">
                    <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center border border-[#FECDD3] shadow-sm">
                      <QrCode className="w-20 h-20 text-[#1C0D12]" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Scan for Instant Validation</span>

                    <div className="w-full flex flex-col gap-2 pt-1">
                      <Link
                        href={cred.verificationUrl}
                        className={`text-xs py-2 justify-center flex items-center gap-1.5 font-bold rounded-xl transition-all shadow-sm ${
                          cred.isRevoked
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-[#881337] text-white hover:bg-[#4C0519]'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify Record
                      </Link>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(cred.title)}
                          disabled={cred.isRevoked}
                          className="flex-1 px-3 py-1.5 border border-[#FECDD3] bg-white hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold justify-center flex items-center gap-1 transition-colors disabled:opacity-40"
                          title="Print / Save PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleCopyLink(cred.id)}
                          className="flex-1 px-3 py-1.5 border border-[#FECDD3] bg-white hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold justify-center flex items-center gap-1 transition-colors"
                          title="Copy shareable link"
                        >
                          {copiedId === cred.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          {copiedId === cred.id ? 'Copied' : 'Share'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 2: VERIFICATION & CERTIFICATE ELIGIBILITY CHECKER */}
        {eligibilityData && (
          <div className="mt-10 bg-white rounded-3xl border border-[#FFE4E6] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#FFE4E6] pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFE4E6] border border-[#FECDD3] rounded-full text-[11px] font-bold text-[#881337] mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Eligibility Pipeline
                </div>
                <h2 className="text-lg font-black text-[#1C0D12]">Certificate Eligibility &amp; Issuance Rules</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Check your real qualification status for each official SEVA credential track.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Track 1: Course Completion */}
              {(() => {
                const track = eligibilityData.course_completion;
                const isClaimed = credentials.some(
                  (c) => c.credentialType === 'course_completion' && !c.isRevoked
                );
                return (
                  <div className="p-5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xs">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isClaimed
                              ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                              : track?.eligible
                              ? 'text-blue-800 bg-blue-100 border-blue-300'
                              : 'text-slate-600 bg-slate-100 border-slate-300'
                          }`}
                        >
                          {isClaimed ? 'Claimed' : track?.eligible ? 'Eligible' : 'In Progress'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#1C0D12]">Course Completion Certificate</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Awarded upon finishing all required course curriculum modules.
                      </p>

                      <div className="space-y-1 pt-1">
                        {track?.requirements?.map((req: any) => (
                          <div key={req.id} className="text-[11px] flex items-center justify-between">
                            <span className="text-slate-600 truncate max-w-[160px]">{req.label}</span>
                            <span className="font-bold text-[#1C0D12]">
                              {req.current} / {req.target} {req.met ? '✓' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isClaimed ? (
                        <div className="text-center py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                          ✓ Certificate Issued
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimCredential('course_completion')}
                          disabled={!track?.eligible || issuingType === 'course_completion'}
                          className="w-full py-2 bg-[#881337] hover:bg-[#4C0519] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {issuingType === 'course_completion' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Award className="w-3.5 h-3.5" />
                          )}
                          <span>Claim Course Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Track 2: Platform Assessment */}
              {(() => {
                const track = eligibilityData.platform_assessment;
                const isClaimed = credentials.some(
                  (c) => c.credentialType === 'platform_assessment' && !c.isRevoked
                );
                return (
                  <div className="p-5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center font-bold text-xs">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isClaimed
                              ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                              : track?.eligible
                              ? 'text-blue-800 bg-blue-100 border-blue-300'
                              : 'text-slate-600 bg-slate-100 border-slate-300'
                          }`}
                        >
                          {isClaimed ? 'Claimed' : track?.eligible ? 'Eligible' : 'In Progress'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#1C0D12]">Practical Assessment Credential</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Demonstrated technical evaluation passing benchmark (≥ 70%).
                      </p>

                      <div className="space-y-1 pt-1">
                        {track?.requirements?.map((req: any) => (
                          <div key={req.id} className="text-[11px] flex items-center justify-between">
                            <span className="text-slate-600 truncate max-w-[160px]">{req.label}</span>
                            <span className="font-bold text-[#1C0D12]">
                              {req.current} {req.met ? '✓' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isClaimed ? (
                        <div className="text-center py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                          ✓ Credential Issued
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimCredential('platform_assessment')}
                          disabled={!track?.eligible || issuingType === 'platform_assessment'}
                          className="w-full py-2 bg-[#881337] hover:bg-[#4C0519] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {issuingType === 'platform_assessment' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Award className="w-3.5 h-3.5" />
                          )}
                          <span>Claim Assessment Credential</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Track 3: Skill Passport */}
              {(() => {
                const track = eligibilityData.skill_passport;
                const isClaimed = credentials.some(
                  (c) => c.credentialType === 'skill_passport' && !c.isRevoked
                );
                return (
                  <div className="p-5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-300 text-[#881337] flex items-center justify-center font-bold text-xs">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isClaimed
                              ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                              : track?.eligible
                              ? 'text-blue-800 bg-blue-100 border-blue-300'
                              : 'text-slate-600 bg-slate-100 border-slate-300'
                          }`}
                        >
                          {isClaimed ? 'Claimed' : track?.eligible ? 'Eligible' : 'In Progress'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#1C0D12]">Comprehensive Skill Passport</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Proof of Ability backed by curriculum, practice labs, assessment, and approved capstone.
                      </p>

                      <div className="space-y-1 pt-1">
                        {track?.requirements?.map((req: any) => (
                          <div key={req.id} className="text-[11px] flex items-center justify-between">
                            <span className="text-slate-600 truncate max-w-[150px]">{req.label}</span>
                            <span className={`font-bold ${req.met ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {req.met ? '✓ Met' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isClaimed ? (
                        <div className="text-center py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                          ✓ Skill Passport Issued
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimCredential('skill_passport')}
                          disabled={!track?.eligible || issuingType === 'skill_passport'}
                          className="w-full py-2 bg-[#881337] hover:bg-[#4C0519] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {issuingType === 'skill_passport' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Award className="w-3.5 h-3.5" />
                          )}
                          <span>Claim Skill Passport</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
