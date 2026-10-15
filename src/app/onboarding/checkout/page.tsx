'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { COURSES } from '@/data';
import { DataService } from '@/lib/data-service';
import type { UserProfile } from '@/lib/data-service';
import { PaymentService } from '@/lib/payments/service';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Lock,
  ChevronLeft,
  AlertCircle,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course') || 'full-stack-development';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [course, setCourse] = useState(
    COURSES.find((c) => c.id === courseParam || c.slug === courseParam) || COURSES[0]
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await DataService.getCurrentUser();
        if (!currentUser) {
          router.replace(`/login?returnUrl=${encodeURIComponent(`/onboarding/checkout?course=${courseParam}`)}`);
          return;
        }
        setUser(currentUser);

        const found = COURSES.find((c) => c.id === courseParam || c.slug === courseParam);
        if (found) {
          if (found.status !== 'active') {
            router.replace('/onboarding/choose-course');
            return;
          }
          setCourse(found);
        } else {
          router.replace('/onboarding/choose-course');
          return;
        }
      } catch (err) {
        console.warn('Checkout initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [courseParam, router]);

  const handleContinueInDemoMode = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Call server API to create demo enrollment and server-side entitlement
      const response = await fetch('/api/onboarding/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          mode: 'demo',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize demo enrollment.');
      }

      // 2. Synchronize client-side local cache for seamless state persistence
      await PaymentService.createDemoAccess(user.id, course.id);
      await DataService.enrollInCourse(user.id, course.id, { isDemo: true, accessType: 'demo' });
      await DataService.updateUserProfile(user.id, { targetRole: course.title });

      // 3. Navigate to confirmation screen
      router.push(`/onboarding/confirmation?course=${encodeURIComponent(course.id)}&mode=demo`);
    } catch (err: any) {
      console.error('Demo enrollment failed:', err);
      setErrorMsg(err?.message || 'Failed to complete demo enrollment. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#881337] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-[#881337]">Preparing checkout experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] flex flex-col selection:bg-[#FFE4E6] selection:text-[#881337]">
      {/* Header */}
      <header className="border-b border-[#881337]/10 bg-[#FFFDF7]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/onboarding/choose-course" className="flex items-center gap-2 text-xs font-bold text-[#881337] hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Back to Course Selection
          </Link>

          {/* Stepper */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#881337]/70 px-2 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Course Chosen
            </span>
            <span className="w-6 h-0.5 bg-[#881337]/20"></span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#881337] bg-[#FFE4E6] px-3 py-1.5 rounded-full border border-[#881337]/20">
              <span className="w-4 h-4 rounded-full bg-[#881337] text-white flex items-center justify-center text-[10px]">2</span>
              Demo Checkout
            </span>
            <span className="w-6 h-0.5 bg-[#881337]/20"></span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#881337]/60 px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-[#881337]/15 text-[#881337] flex items-center justify-center text-[10px]">3</span>
              Confirmation
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#1C0D12]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Access</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* Prominent Demo Mode Banner */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-md">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  DEMO MODE
                </span>
                <span className="text-xs font-bold text-amber-800">No real payment will be collected</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                This environment is currently configured in <strong>Demo & Evaluation Mode</strong>. No real financial payment, credit card, or UPI transaction will be processed. Continuing will immediately create an authenticated Demo Enrollment with full curriculum and Skill Passport access.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Summary Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-xl space-y-6">
            <div className="border-b border-[#881337]/10 pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
                Selected Learning Path
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1C0D12] tracking-tight">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#1C0D12]/70 mt-1">
                {course.subtitle || course.description}
              </p>
            </div>

            {/* Plan Details */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C0D12]">Individual Course Access</h3>
                  <p className="text-[11px] text-[#1C0D12]/60">Full lifetime access to {course.title}. Additional courses require a separate ₹100 enrollment.</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#881337] font-mono">₹100</span>
                  <span className="text-[10px] block text-[#1C0D12]/50 line-through">₹4,999</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#881337]/10 grid grid-cols-2 gap-2 text-[11px] text-[#1C0D12]/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>145 Structured Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30 Hands-on Code Labs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Interactive AI Tutor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Skill Passport</span>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="pt-2 text-xs space-y-2">
              <p className="font-bold text-[#1C0D12]">Enrolling Learner:</p>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1C0D12]">{user?.fullName}</p>
                  <p className="text-[#1C0D12]/60 font-mono text-[11px]">{user?.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FFE4E6] text-[#881337] font-bold text-[10px]">
                  Verified Account
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Action Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#881337]/15 shadow-xl space-y-5">
              <h2 className="text-base font-black text-[#1C0D12] uppercase tracking-wide">
                Payment Summary
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#1C0D12]/75">
                  <span>Course Access (Standard Price)</span>
                  <span className="font-mono line-through">₹4,999</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Digital India Subsidy Discount</span>
                  <span className="font-mono">-₹4,899</span>
                </div>
                <div className="flex justify-between text-[#1C0D12]/75">
                  <span>Individual Course Enrollment</span>
                  <span className="font-mono">₹100</span>
                </div>
                <div className="pt-3 border-t border-[#881337]/10 flex justify-between items-baseline font-black">
                  <span className="text-sm text-[#1C0D12]">Payable Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#881337] font-mono">₹100</span>
                    <span className="block text-[10px] text-amber-700 font-bold">Waived in Demo Mode (₹0)</span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3.5 rounded-xl bg-[#FFE4E6]/50 border border-[#881337]/20 text-[11px] text-[#881337] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-[#881337] mt-0.5" />
                <span>
                  Demo Access will immediately authorize your account without charging payment methods.
                </span>
              </div>

              {/* Continue in Demo Mode Button */}
              <button
                type="button"
                onClick={handleContinueInDemoMode}
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide uppercase transition-all bg-gradient-to-r from-[#881337] to-[#991B1B] text-white shadow-lg shadow-[#881337]/30 hover:opacity-95 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Activating Demo Access...</span>
                  </>
                ) : (
                  <>
                    <span>Continue in Demo Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#1C0D12]/50">
                By continuing, your profile will be enrolled in {course.title} under Demo Access.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/10 space-y-2 text-xs text-[#1C0D12]/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CA8A04]" />
                <span className="font-semibold">Cryptographically Verified Skill Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#881337]" />
                <span className="font-semibold">National Curriculum Framework Aligned</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#881337] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
