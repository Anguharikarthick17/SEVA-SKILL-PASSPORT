'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { COURSES } from '@/data';
import { DataService } from '@/lib/data-service';
import type { UserProfile, UserEnrollment } from '@/lib/data-service';
import { PaymentService } from '@/lib/payments/service';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Layers,
  GraduationCap,
  Award,
} from 'lucide-react';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course') || 'full-stack-development';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [course, setCourse] = useState(
    COURSES.find((c) => c.id === courseParam || c.slug === courseParam) || COURSES[0]
  );
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyEnrollment() {
      try {
        const currentUser = await DataService.getCurrentUser();
        if (!currentUser) {
          router.replace('/login');
          return;
        }
        setUser(currentUser);

        const currentEnrollment = await DataService.getActiveUserEnrollment(currentUser.id);
        if (!currentEnrollment) {
          // If no enrollment exists, redirect to course selection
          router.replace('/onboarding/choose-course');
          return;
        }
        setEnrollment(currentEnrollment);

        const foundCourse = COURSES.find(
          (c) => c.id === currentEnrollment.courseId || c.slug === currentEnrollment.courseId
        );
        if (foundCourse) {
          setCourse(foundCourse);
        }

        const isDemoMode = await PaymentService.isDemoAccess(currentUser.id);
        setIsDemo(isDemoMode);
      } catch (err) {
        console.warn('Confirmation verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyEnrollment();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#881337] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-[#881337]">Verifying enrollment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] flex flex-col selection:bg-[#FFE4E6] selection:text-[#881337]">
      {/* Top Header */}
      <header className="border-b border-[#881337]/10 bg-[#FFFDF7]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-block group focus:outline-none focus:ring-2 focus:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]">
            <Image
              src="/images/seva-skill-passport-logo-cropped-transparent.png"
              alt="SEVA Skill Passport — Powered by Team OG"
              width={220}
              height={78}
              priority
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active Enrollment
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#881337]/15 shadow-2xl text-center">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
            Learning Journey Activated
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1C0D12] tracking-tight mb-2">
            Enrollment Confirmed!
          </h1>
          <p className="text-sm text-[#1C0D12]/75 max-w-md mx-auto mb-8">
            Congratulations, {user?.fullName}! Your learning path and Skill Passport dashboard are now initialized.
          </p>

          {/* Details Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
              <span className="text-xs font-semibold text-[#1C0D12]/70">Selected Course</span>
              <span className="text-sm font-black text-[#1C0D12]">{course.title}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
              <span className="text-xs font-semibold text-[#1C0D12]/70">Access Tier</span>
              <span className="text-xs font-bold text-[#881337] bg-[#FFE4E6] px-2.5 py-1 rounded-md">
                Full Course Access (₹100)
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
              <span className="text-xs font-semibold text-[#1C0D12]/70">Access Mode</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
                {isDemo ? 'Demo Mode (Full Evaluation Access)' : 'Standard Access'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C0D12]/70">Enrollment Status</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active (0% Completed)
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <Link
            href="/dashboard"
            className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide uppercase transition-all bg-gradient-to-r from-[#881337] to-[#991B1B] text-white shadow-lg shadow-[#881337]/30 hover:opacity-95 hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Go to Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#881337]/10 py-6 text-center text-xs text-[#1C0D12]/60">
        SEVA Skill Passport • Government-Aligned Competency & Evidence Verification System
      </footer>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#881337] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
