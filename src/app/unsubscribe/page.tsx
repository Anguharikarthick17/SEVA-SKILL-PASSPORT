'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    note?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, error: data.error || 'Failed to unsubscribe' });
      } else {
        setResult({
          success: true,
          message: data.message,
          note: data.note,
        });
      }
    } catch {
      setResult({
        success: false,
        error: 'Network connectivity error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#881337] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </Link>

      <div className="bg-white border border-[#881337]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] border border-[#881337]/20 flex items-center justify-center text-[#881337]">
          <MailCheck className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C0D12] tracking-tight">
            Email Notification Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4E56] mt-2 leading-relaxed">
            Manage your marketing subscriptions. You can opt out of promotional announcements and newsletter emails anytime.
          </p>
        </div>

        {result ? (
          <div
            className={`p-5 rounded-2xl border ${
              result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unsubscribe Confirmed</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">{result.message}</p>
                <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60 leading-relaxed">
                  {result.note}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Error: </strong> {result.error}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                Your Email Address
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
            </div>

            <div className="p-3.5 bg-[#FFFDF7] border border-[#881337]/15 rounded-xl text-xs text-[#6B4E56] space-y-1">
              <div className="font-semibold text-[#881337] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Transactional Email Policy
              </div>
              <p className="text-[11px] leading-relaxed">
                Transactional notifications—including password resets, account security alerts, and payment receipts—are necessary for system integrity and are not affected by this unsubscribe request.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#881337] text-white text-sm font-bold hover:bg-[#700F2E] transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(136,19,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#CA8A04]"
            >
              {isSubmitting ? 'Processing...' : 'Unsubscribe from Marketing'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-14 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="max-w-xl mx-auto text-center py-12 text-sm text-[#6B4E56]">Loading preferences...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
