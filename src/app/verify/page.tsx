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
  Info
} from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_PASSPORT } from '@/data';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'GSP-DEMO-001';
  const [searchId, setSearchId] = useState(initialId);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const demoRecords: Record<string, any> = {
    'GSP-DEMO-001': {
      id: 'GSP-DEMO-001',
      title: 'Full Stack Developer Skill Passport',
      candidateName: 'Sample Candidate',
      issueDate: 'October 1, 2024',
      validUntil: 'October 1, 2026',
      status: 'VERIFIED_ACTIVE',
      competencyScore: 87,
      type: 'Competency Passport',
      evidenceHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      evidenceSummary: {
        challenges: 15,
        labs: 9,
        projects: 2,
        assessments: 3,
      },
      skills: DEMO_PASSPORT.skills.slice(0, 5),
    },
    'cred-001': {
      id: 'cred-001',
      title: 'Full Stack Development Course Completion',
      candidateName: 'Arjun Sharma',
      issueDate: 'October 1, 2024',
      validUntil: 'Lifetime',
      status: 'VERIFIED_ACTIVE',
      competencyScore: 84,
      type: 'Course Completion Certificate',
      evidenceHash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      evidenceSummary: {
        challenges: 12,
        labs: 8,
        projects: 2,
        assessments: 2,
      },
      skills: DEMO_PASSPORT.skills.slice(0, 4),
    },
    'cred-002': {
      id: 'cred-002',
      title: 'Full Stack Practical Assessment',
      candidateName: 'Arjun Sharma',
      issueDate: 'October 1, 2024',
      validUntil: 'October 1, 2026',
      status: 'VERIFIED_ACTIVE',
      competencyScore: 88,
      type: 'Proctored Skill Assessment',
      evidenceHash: 'sha256-ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      evidenceSummary: {
        challenges: 8,
        labs: 6,
        projects: 1,
        assessments: 1,
      },
      skills: DEMO_PASSPORT.skills.slice(0, 3),
    },
    'cred-003': {
      id: 'cred-003',
      title: 'SEVA Verified Skill Passport',
      candidateName: 'Arjun Sharma',
      issueDate: 'October 1, 2024',
      validUntil: 'October 1, 2026',
      status: 'VERIFIED_ACTIVE',
      competencyScore: 87,
      type: 'Comprehensive Skill Passport',
      evidenceHash: 'sha256-7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      evidenceSummary: {
        challenges: 15,
        labs: 9,
        projects: 2,
        assessments: 3,
      },
      skills: DEMO_PASSPORT.skills.slice(0, 5),
    },
  };

  const handleVerify = (idToVerify: string) => {
    const trimmed = idToVerify.trim();
    setHasSearched(true);
    if (demoRecords[trimmed]) {
      setActiveRecord(demoRecords[trimmed]);
    } else {
      // Create a simulated record if non-empty, else null
      if (trimmed.length > 3) {
        setActiveRecord({
          id: trimmed.toUpperCase(),
          title: 'Registered Candidate Competency Record',
          candidateName: 'Verified Student',
          issueDate: 'October 2024',
          validUntil: 'October 2026',
          status: 'VERIFIED_ACTIVE',
          competencyScore: 82,
          type: 'Simulated Prototype Record',
          evidenceHash: `sha256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          evidenceSummary: { challenges: 10, labs: 6, projects: 1, assessments: 2 },
          skills: DEMO_PASSPORT.skills.slice(0, 4),
        });
      } else {
        setActiveRecord(null);
      }
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  return (
    <div className="min-h-screen bg-gov-bg pb-20">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-4">
            <ShieldCheck className="w-4 h-4" />
            Verification Engine Prototype
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Credential Verification</h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
            Verify the authenticity of a SEVA Skill Passport, course certificate, or assessment credential using its unique ID.
          </p>
        </div>
      </section>

      {/* Main Search & Verification Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(searchId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Credential ID (e.g., GSP-DEMO-001 or cred-001)"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-950 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify ID
            </button>
          </form>

          {/* Preset Demo IDs */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Quick Test IDs:</span>
            {['GSP-DEMO-001', 'cred-001', 'cred-002', 'cred-003'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchId(id);
                  handleVerify(id);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>SEVA Hackathon Notice:</strong> This verification tool simulates the proposed competency registry. In this hackathon build, verification demonstrates how employers and institutions would validate evidence hashes in production. No government entity currently issues or verifies these records.
          </p>
        </div>

        {/* Verification Result */}
        {hasSearched && activeRecord ? (
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            {/* Verification Status Header */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                      Verified Prototype Credential
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {activeRecord.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 mt-0.5">{activeRecord.title}</h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Overall Competency</span>
                <span className="text-2xl font-black text-navy-900">{activeRecord.competencyScore}%</span>
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <User className="w-3.5 h-3.5" />
                    Candidate
                  </div>
                  <div className="font-semibold text-navy-900">{activeRecord.candidateName}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Award className="w-3.5 h-3.5" />
                    Record Type
                  </div>
                  <div className="font-semibold text-navy-900">{activeRecord.type}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Issued Date
                  </div>
                  <div className="font-semibold text-navy-900">{activeRecord.issueDate}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Valid Until
                  </div>
                  <div className="font-semibold text-navy-900">{activeRecord.validUntil}</div>
                </div>
              </div>

              {/* Evidence Backing */}
              <div>
                <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-navy-700" />
                  Verified Evidence Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-2xl font-bold text-navy-900 block">{activeRecord.evidenceSummary.challenges}</span>
                    <span className="text-xs text-slate-600">Coding Challenges</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-2xl font-bold text-navy-900 block">{activeRecord.evidenceSummary.labs}</span>
                    <span className="text-xs text-slate-600">Hands-on Labs</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-2xl font-bold text-navy-900 block">{activeRecord.evidenceSummary.projects}</span>
                    <span className="text-xs text-slate-600">Capstone Projects</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-2xl font-bold text-navy-900 block">{activeRecord.evidenceSummary.assessments}</span>
                    <span className="text-xs text-slate-600">Assessments</span>
                  </div>
                </div>
              </div>

              {/* Evaluated Competency Scores */}
              <div>
                <h3 className="text-sm font-bold text-navy-900 mb-3">Evaluated Core Competencies</h3>
                <div className="space-y-2.5">
                  {activeRecord.skills.map((skill: any) => (
                    <div key={skill.name} className="p-3 bg-slate-50 rounded-xl">
                      <SkillBar name={skill.name} score={skill.score} category={skill.category} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Hash Demo */}
              <div className="p-4 bg-slate-900 rounded-xl text-slate-300 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Hash className="w-3.5 h-3.5" />
                  Evidence Integrity Hash (Simulated Tamper-Proof Audit Trail)
                </div>
                <div className="break-all text-emerald-400 select-all font-semibold">
                  {activeRecord.evidenceHash}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <Link
                  href="/skill-passport"
                  className="text-sm font-semibold text-navy-800 hover:text-navy-950 flex items-center gap-1.5"
                >
                  View Interactive Skill Passport Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/employers"
                  className="btn-outline text-xs"
                >
                  Employer Integration Info
                </Link>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Credential Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              We could not locate any credential matching ID &ldquo;{searchId}&rdquo;. Please verify the identifier or test with one of the quick test IDs above.
            </p>
            <button
              onClick={() => {
                setSearchId('GSP-DEMO-001');
                handleVerify('GSP-DEMO-001');
              }}
              className="btn-primary text-xs"
            >
              Try ID: GSP-DEMO-001
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading verification portal...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
