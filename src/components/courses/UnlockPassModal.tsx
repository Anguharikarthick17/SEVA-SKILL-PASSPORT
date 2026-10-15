'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  X,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Code2,
  Cpu,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { UserProfile } from '@/lib/data-service';

interface UnlockPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSuccess?: () => void;
  courseTitle?: string;
  courseSlug?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UnlockPassModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  courseTitle,
  courseSlug,
}: UnlockPassModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gatewayUnconfigured, setGatewayUnconfigured] = useState(false);

  if (!isOpen) return null;

  const handleUnlockClick = async () => {
    if (!currentUser) {
      const redirectUrl = courseSlug ? `/courses/${courseSlug}` : '/courses';
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setGatewayUnconfigured(false);

    try {
      // 1. Call server to create payment order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          courseId: courseSlug || 'full-stack-development',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        setErrorMessage(data.error || 'Failed to initialize checkout.');
        return;
      }

      if (data.alreadyOwned) {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
        return;
      }

      // If Razorpay gateway is configured, load real Razorpay checkout modal
      if (data.configured && data.keyId) {
        const loadScript = () => {
          return new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadScript();
        if (!loaded) {
          setLoading(false);
          setErrorMessage('Failed to load secure payment gateway. Please check your network.');
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount, // 10000 paise
          currency: data.currency,
          name: 'SEVA Skill Passport',
          description: 'One-time ₹100 pass for all eligible courses',
          order_id: data.orderId,
          prefill: {
            name: currentUser.fullName,
            email: currentUser.email,
            contact: currentUser.mobile || '',
          },
          theme: {
            color: '#881337',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: currentUser.id,
                  orderId: response.razorpay_order_id || data.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              setLoading(false);

              if (verifyRes.ok && verifyData.success) {
                setSuccess(true);
                setTimeout(() => {
                  if (onSuccess) onSuccess();
                  onClose();
                  window.location.reload();
                }, 1500);
              } else {
                setErrorMessage(verifyData.error || 'Payment verification could not be validated.');
              }
            } catch (err: any) {
              setLoading(false);
              setErrorMessage('Verification network error: ' + err.message);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Gateway keys are not yet configured in environment variables
        setLoading(false);
        setGatewayUnconfigured(true);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Payment initiation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#881337]/20 shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1C0D12]">
        {/* Subtle Brand Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#881337] via-[#CA8A04] to-[#881337]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6B4E56] hover:text-[#881337] hover:bg-[#FFE4E6]/50 rounded-full transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#1C0D12]">Access Granted!</h3>
            <p className="text-sm text-[#6B4E56] max-w-sm mx-auto">
              Your ₹100 enrollment for {courseTitle || 'this course'} is verified. You now have full access to this curriculum and practice environment.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE4E6] text-[#881337] text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-[#881337]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
                Individual Course Access
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C0D12] tracking-tight">
                Unlock {courseTitle || 'Your Course'}
              </h2>
              <p className="text-sm text-[#6B4E56] mt-1.5 leading-relaxed">
                One payment of ₹100 for lifetime access to this course.
              </p>
            </div>

            {/* Offer Value Card */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-3">
              <div className="flex items-baseline justify-between border-b border-[#881337]/10 pb-3">
                <span className="text-xs font-bold text-[#6B4E56] uppercase tracking-wider">
                  Individual Enrollment
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#881337]">₹100</span>
                  <span className="text-xs text-[#6B4E56] font-semibold">INR per course</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-medium text-[#1C0D12]/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Full {courseTitle || 'curriculum'} access (145 lessons, 16 modules)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Hands-on practice labs & code runner evaluations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Capstone projects, skill assessments & verified evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Each additional course requires a separate ₹100 purchase</span>
                </li>
              </ul>
            </div>

            {/* Honest Disclosure Note */}
            <p className="text-[11px] text-[#6B4E56] leading-relaxed bg-[#FFE4E6]/40 p-3 rounded-xl border border-[#881337]/10">
              <span className="font-bold text-[#881337]">Course Pricing Policy: </span>
              Every available course costs ₹100 individually. One ₹100 payment grants access to one specific course only. Additional courses require a separate ₹100 purchase.
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {gatewayUnconfigured && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Payment Gateway Configuration Required</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  In accordance with production security standards, unverified client bypass is disabled. To process live ₹100 payments, please provide your Razorpay credentials in server environment variables:
                </p>
                <div className="font-mono text-[10px] bg-white p-2 rounded border border-amber-200 text-amber-950">
                  RAZORPAY_KEY_ID=rzp_live_...<br />
                  RAZORPAY_KEY_SECRET=...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <GlowButton
                onClick={handleUnlockClick}
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full flex-1"
              >
                {loading ? 'Processing Order...' : 'Unlock All Courses — ₹100'}
                {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
              </GlowButton>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-[#6B4E56] hover:text-[#1C0D12] hover:bg-[#FFFDF7] rounded-full border border-transparent hover:border-[#881337]/20 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
