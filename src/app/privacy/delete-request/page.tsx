'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, ArrowLeft, Send, AlertTriangle, Lock, FileText } from 'lucide-react';

export default function PrivacyDeleteRequestPage() {
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState<'delete_account' | 'export_data' | 'anonymize_profile'>('delete_account');
  const [reason, setReason] = useState('');
  const [acknowledgement, setAcknowledgement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusResponse, setStatusResponse] = useState<{
    success: boolean;
    requestId?: string;
    message?: string;
    legalRetentionNotice?: string;
    timeline?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledgement) return;

    setIsSubmitting(true);
    setStatusResponse(null);

    try {
      const res = await fetch('/api/privacy/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scope, reason, acknowledgement }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusResponse({ success: false, error: data.error || 'Failed to submit request' });
      } else {
        setStatusResponse({
          success: true,
          requestId: data.requestId,
          message: data.message,
          legalRetentionNotice: data.legalRetentionNotice,
          timeline: data.timeline,
        });
      }
    } catch {
      setStatusResponse({
        success: false,
        error: 'Network connectivity error. Please try again or email support@seva.gov.in directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <Link
          href="/privacy"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#881337] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Privacy Policy</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] border border-[#881337]/20 text-[#881337] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Rights Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1C0D12] tracking-tight">
            Data Deletion & Privacy Request
          </h1>
          <p className="text-sm text-[#6B4E56] leading-relaxed">
            Exercise your rights regarding personal data collected by SEVA Skill Passport. Submit an account deletion, data export, or profile anonymization request below.
          </p>
        </div>

        {/* Legal Retention Warning Card */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold">Statutory Retention Requirements:</p>
            <p>
              In accordance with financial and educational auditing obligations, payment records (Razorpay order references), cryptographically issued credentials on the public registry, and immutable security audit logs cannot be erased. Account deletion removes learning progress, sandbox code, and personal contact details from active databases.
            </p>
          </div>
        </div>

        {/* Status Response Display */}
        {statusResponse && (
          <div
            className={`p-6 rounded-2xl border ${
              statusResponse.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            {statusResponse.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Request Successfully Registered</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {statusResponse.message}
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1 font-mono">
                  <div><strong>Tracking Reference:</strong> {statusResponse.requestId}</div>
                  <div><strong>Timeline:</strong> {statusResponse.timeline}</div>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {statusResponse.legalRetentionNotice}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="block font-bold">Submission Error:</strong>
                  {statusResponse.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request Form */}
        {!statusResponse?.success && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#881337]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                Registered Account Email <span className="text-rose-600">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#881337]/20 bg-[#FFFDF7] text-sm text-[#1C0D12] placeholder:text-[#6B4E56]/50 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
              <p className="text-[11px] text-[#6B4E56] mt-1">
                Must match the email address associated with your SEVA Skill Passport account.
              </p>
            </div>

            <div>
              <label htmlFor="scope" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                Request Type <span className="text-rose-600">*</span>
              </label>
              <select
                id="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-[#881337]/20 bg-[#FFFDF7] text-sm text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
              >
                <option value="delete_account">Delete Account & Personal Data (Permanent)</option>
                <option value="export_data">Export Account Data (Machine-readable JSON/CSV)</option>
                <option value="anonymize_profile">Anonymize Profile (Remove identifying public name)</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                Reason for Request (Optional)
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you wish to delete your account or how we can improve..."
                className="w-full px-4 py-3 rounded-xl border border-[#881337]/20 bg-[#FFFDF7] text-sm text-[#1C0D12] placeholder:text-[#6B4E56]/50 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            {/* Required Consent Acknowledgment */}
            <div className="pt-2 border-t border-[#881337]/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acknowledgement}
                  onChange={(e) => setAcknowledgement(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#881337] focus:ring-[#881337] border-gray-300"
                />
                <span className="text-xs text-[#6B4E56] leading-relaxed">
                  I understand that submitting this request initiates an administrative verification procedure. I acknowledge that statutory payment receipts and verified cryptographic credentials already recorded in public registries cannot be deleted.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !acknowledgement}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#881337] text-white text-sm font-bold hover:bg-[#700F2E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(136,19,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#CA8A04]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Submit Privacy Request'}</span>
            </button>
          </form>
        )}

        {/* Additional Contact Information */}
        <div className="text-center text-xs text-[#6B4E56]">
          Have questions regarding data privacy or security? Contact our Data Privacy Officer at{' '}
          <a href="mailto:support@seva.gov.in" className="text-[#881337] font-semibold underline">
            support@seva.gov.in
          </a>.
        </div>
      </div>
    </div>
  );
}
