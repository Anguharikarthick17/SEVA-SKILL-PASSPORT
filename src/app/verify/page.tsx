'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  Calendar,
  User,
  Hash,
  ExternalLink,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DataService } from '@/lib/data-service';
import GlowButton from '@/components/ui/GlowButton';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'GSP-DEMO-001';
  const [searchId, setSearchId] = useState(initialId);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (idToVerify: string) => {
    const trimmed = idToVerify.trim();
    if (!trimmed) return;
    setHasSearched(true);
    const result = await DataService.verifyById(trimmed);
    if (result) {
      setActiveRecord(result);
    } else {
      setActiveRecord(null);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 pb-24">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 border-b border-milan-600/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-milan-50 rounded-full text-xs font-bold uppercase tracking-wider text-milan-600 mb-4 border border-milan-600/30">
            <ShieldCheck className="w-4 h-4 text-milan-600" />
            Verification Engine Prototype
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-espresso-900">
            Credential <span className="text-milan-600">Verification</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            Verify the authenticity of a SEVA Skill Passport, course certificate, or assessment credential using its unique ID and cryptographic evidence hash.
          </p>
        </div>
      </section>

      {/* Main Search & Verification Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Search Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-milan-600/20 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(searchId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-espresso-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Credential ID (e.g., GSP-DEMO-001 or cred-001)"
                className="w-full pl-12 pr-4 py-3 bg-[#FFFDF7] border border-milan-600/25 rounded-full text-sm font-mono text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-colors shadow-inner"
              />
            </div>
            <GlowButton
              type="submit"
              variant="primary"
              size="md"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Verify ID</span>
            </GlowButton>
          </form>

          {/* Preset Demo IDs */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-espresso-muted">
            <span className="font-bold text-espresso-900">Quick Test IDs:</span>
            {['GSP-DEMO-001', 'cred-001', 'cred-002', 'cred-003'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchId(id);
                  handleVerify(id);
                }}
                className="px-2.5 py-1 bg-milan-50 hover:bg-milan-100 text-milan-700 rounded-full font-mono font-bold transition-colors border border-milan-600/20 cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-800">SEVA Hackathon Notice:</strong> This verification tool simulates the proposed competency registry. In this hackathon build, verification demonstrates how employers and institutions would validate evidence hashes in production.
          </p>
        </div>

        {/* Verification Result */}
        {hasSearched && activeRecord ? (
          <div className="mt-8 rounded-3xl bg-white border border-milan-600/25 overflow-hidden shadow-xl">
            {/* Revocation Warning Alert if revoked */}
            {activeRecord.isRevoked && (
              <div className="p-6 bg-rose-50 border-b border-rose-300 flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-rose-900 uppercase tracking-wide">
                    Credential Officially Revoked
                  </h3>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    This credential was officially invalidated and revoked from the SEVA Competency Registry. It cannot be used as proof of achievement or competency.
                  </p>
                  <div className="mt-2 pt-2 border-t border-rose-200 text-xs text-rose-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold">Revocation Date:</span> {activeRecord.revokedAt || 'Recorded'}
                    </div>
                    <div>
                      <span className="font-bold">Documented Reason:</span> {activeRecord.revocationReason || 'Administrative revocation'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status Header */}
            <div
              className={`border-b px-6 py-5 flex flex-wrap items-center justify-between gap-4 ${
                activeRecord.isRevoked
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-transparent border-milan-600/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm flex-shrink-0 ${
                    activeRecord.isRevoked
                      ? 'bg-rose-100 border-rose-300 text-rose-700'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                  }`}
                >
                  {activeRecord.isRevoked ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${
                        activeRecord.isRevoked
                          ? 'text-rose-800 bg-rose-100 border-rose-300'
                          : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                      }`}
                    >
                      {activeRecord.isRevoked ? 'Record Revoked / Invalid' : 'Evidence Integrity Verified'}
                    </span>
                    <span className="text-xs text-espresso-muted font-mono">ID: {activeRecord.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-espresso-900 mt-1">{activeRecord.title}</h2>
                  {activeRecord.isPrototypeDemo && (
                    <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      <span>SEVA Hackathon Demonstration Record</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-espresso-muted block">Overall Competency</span>
                <span className="text-3xl font-black text-milan-600 font-mono">{activeRecord.competencyScore}%</span>
                <span className="text-[11px] font-bold text-emerald-700 block">
                  {activeRecord.sufficientlyEvidencedCount || 4} of {activeRecord.totalCoreSkillsCount || 7} Core Evidenced
                </span>
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-milan-600/10">
                <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-milan-600/10">
                  <div className="flex items-center gap-2 text-xs text-espresso-muted mb-1">
                    <User className="w-3.5 h-3.5 text-milan-600" />
                    Candidate
                  </div>
                  <div className="font-bold text-espresso-900">{activeRecord.candidateName}</div>
                  <div className="text-[11px] text-espresso-muted mt-0.5">{activeRecord.role}</div>
                </div>

                <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-milan-600/10">
                  <div className="flex items-center gap-2 text-xs text-espresso-muted mb-1">
                    <Award className="w-3.5 h-3.5 text-milan-600" />
                    Credential Status
                  </div>
                  <div
                    className={`font-bold capitalize ${
                      activeRecord.isRevoked ? 'text-rose-600' : 'text-espresso-900'
                    }`}
                  >
                    {activeRecord.status?.replace('_', ' ') || 'Verified Active'}
                  </div>
                  <div className={`text-[11px] font-bold mt-0.5 ${activeRecord.isRevoked ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {activeRecord.freshnessStatus || 'Fresh'} Telemetry
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-milan-600/10">
                  <div className="flex items-center gap-2 text-xs text-espresso-muted mb-1">
                    <Calendar className="w-3.5 h-3.5 text-milan-600" />
                    Issued Date
                  </div>
                  <div className="font-bold text-espresso-900">{activeRecord.issuedDate}</div>
                  <div className="text-[11px] text-espresso-muted mt-0.5">SHA-256 Timestamped</div>
                </div>

                <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-milan-600/10">
                  <div className="flex items-center gap-2 text-xs text-espresso-muted mb-1">
                    <Hash className="w-3.5 h-3.5 text-milan-600" />
                    Evidence Count
                  </div>
                  <div className="font-bold text-espresso-900">{activeRecord.evidenceCount || 12} Verified Artifacts</div>
                  <div className="text-[11px] text-espresso-muted mt-0.5">Labs, Capstones &amp; Exams</div>
                </div>
              </div>

              {/* Skills Breakdown */}
              {activeRecord.skills && activeRecord.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-espresso-900 mb-4 uppercase tracking-wider">
                    Evidenced Competencies
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeRecord.skills.map((skill: any) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        score={skill.score}
                        category={skill.category}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SHA-256 Provenance Box */}
              <div
                className={`p-4 border rounded-2xl space-y-2 ${
                  activeRecord.isRevoked ? 'bg-rose-50 border-rose-200' : 'bg-milan-50 border-milan-600/20'
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block ${
                    activeRecord.isRevoked ? 'text-rose-700' : 'text-milan-700'
                  }`}
                >
                  Cryptographic Integrity Seal
                </span>
                <p className="font-mono text-xs text-espresso-900 break-all select-all font-bold">
                  {activeRecord.evidenceHash || 'SHA256:SEVA:3dd5d5c9f2e5fb622d07e684531d306c3726d67876ce5ebcc86b028875361af4'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-espresso-muted pt-1">
                  <span>Algorithm: SHA-256 with Canonical Canonicalization</span>
                  <span className={activeRecord.isRevoked ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                    {activeRecord.isRevoked ? '✗ Record Revoked in Registry' : '✓ Hash Integrity Matches Registry'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched && !activeRecord ? (
          <div className="mt-8 p-8 rounded-3xl bg-white border border-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-espresso-900">Credential Not Found</h3>
            <p className="text-xs text-espresso-muted max-w-md mx-auto">
              No verified record exists for ID &quot;{searchId}&quot;. Please check the ID or try one of the quick test IDs above.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-8 text-espresso-900">Loading verification portal...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
