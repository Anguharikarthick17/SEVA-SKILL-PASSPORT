'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { DEMO_PASSPORT } from '@/data';

export default function CredentialsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const credentials = [
    {
      id: 'cred-001',
      title: 'Full Stack Development',
      subtitle: 'Complete Programme Certificate',
      type: 'Course Completion',
      issuedDate: 'October 1, 2024',
      validUntil: 'Lifetime',
      status: 'Active',
      competencyScore: 84,
      verificationUrl: '/verify?id=cred-001',
    },
    {
      id: 'cred-002',
      title: 'Full Stack Practical Assessment',
      subtitle: 'Proctored Technical Evaluation',
      type: 'Competency Assessment',
      issuedDate: 'October 1, 2024',
      validUntil: 'October 1, 2026',
      status: 'Active',
      competencyScore: 88,
      verificationUrl: '/verify?id=cred-002',
    },
    {
      id: 'cred-003',
      title: 'SEVA Skill Passport',
      subtitle: 'Comprehensive Competency Record',
      type: 'Verified Skill Passport',
      issuedDate: 'October 1, 2024',
      validUntil: 'October 1, 2026',
      status: 'Active',
      competencyScore: 87,
      verificationUrl: '/verify?id=cred-003',
    },
  ];

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

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <Award className="w-4 h-4" />
              Verifiable Credentials
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Earned Credentials & Certificates</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Digital certificates and skill passports backed by verifiable evidence. Each credential has a unique ID and tamper-resistant cryptographic audit record.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6">
            <div>
              <span className="block text-2xl font-black text-saffron-400">3</span>
              <span className="text-xs text-blue-100">Credentials Active</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black text-white">100%</span>
              <span className="text-xs text-blue-100">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Prototype Disclaimer Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>SEVA Hackathon Demonstration:</strong> These credentials showcase the design for instant verification. In this first build, no government endorsement or legal certificate authority is claimed.
          </p>
        </div>

        {/* Download Toast */}
        {downloadToast && (
          <div className="p-3 bg-navy-900 text-white rounded-xl text-xs flex items-center gap-2">
            <Download className="w-4 h-4 text-saffron-400 animate-bounce" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Credentials Grid */}
        <div className="space-y-6">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              {/* Card Header Stripe */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
                    SP
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-widest block">
                      SEVA Verified Credential
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {cred.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {cred.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Details (8 cols) */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      {cred.type}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-0.5">
                      {cred.title}
                    </h2>
                    <p className="text-sm text-slate-600">{cred.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate</span>
                      <span className="font-semibold text-navy-900">Arjun Sharma</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Date</span>
                      <span className="font-semibold text-navy-900">{cred.issuedDate}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Competency Score</span>
                      <span className="font-bold text-navy-900">{cred.competencyScore}%</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Simulation & Quick Actions (4 cols) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl text-center space-y-3">
                  <div className="w-24 h-24 bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-center shadow-xs">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Scan for Instant Validation</span>

                  <div className="w-full flex flex-col gap-2 pt-1">
                    <Link
                      href={cred.verificationUrl}
                      className="btn-primary text-xs py-2 justify-center flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Record
                    </Link>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(cred.title)}
                        className="flex-1 btn-outline text-xs py-1.5 justify-center flex items-center gap-1"
                        title="Print / Save PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleCopyLink(cred.id)}
                        className="flex-1 btn-outline text-xs py-1.5 justify-center flex items-center gap-1"
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
      </div>
    </div>
  );
}
