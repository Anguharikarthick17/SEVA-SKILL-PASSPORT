'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { COURSES } from '@/data';
import { DataService } from '@/lib/data-service';
import type { UserProfile, UserEnrollment } from '@/lib/data-service';
import { CheckCircle2, Clock, Sparkles, ArrowRight, ShieldCheck, BookOpen, Layers } from 'lucide-react';

export default function ChooseCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [existingEnrollment, setExistingEnrollment] = useState<UserEnrollment | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserState() {
      try {
        const currentUser = await DataService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const active = await DataService.getActiveUserEnrollment(currentUser.id);
          if (active) {
            setExistingEnrollment(active);
            setSelectedCourseId(active.courseId);
          }
        }
      } catch (err) {
        console.warn('Failed to load user state in onboarding:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserState();
  }, []);

  const handleSelectCourse = (courseId: string, status: string) => {
    if (status !== 'active') return;
    setSelectedCourseId(courseId);
  };

  const handleContinue = () => {
    if (!selectedCourseId) return;
    router.push(`/onboarding/checkout?course=${encodeURIComponent(selectedCourseId)}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] flex flex-col selection:bg-[#FFE4E6] selection:text-[#881337]">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#881337]/10 bg-[#FFFDF7]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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

          {/* Stepper */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#881337] bg-[#FFE4E6] px-3 py-1.5 rounded-full border border-[#881337]/20">
              <span className="w-4 h-4 rounded-full bg-[#881337] text-white flex items-center justify-center text-[10px]">1</span>
              Choose Course
            </span>
            <span className="w-6 h-0.5 bg-[#881337]/20"></span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#881337]/60 px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-[#881337]/15 text-[#881337] flex items-center justify-center text-[10px]">2</span>
              Demo Access
            </span>
            <span className="w-6 h-0.5 bg-[#881337]/20"></span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#881337]/60 px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-[#881337]/15 text-[#881337] flex items-center justify-center text-[10px]">3</span>
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="text-right">
                <p className="text-xs font-bold text-[#1C0D12]">{user.fullName}</p>
                <p className="text-[11px] text-[#881337]/70 font-mono truncate max-w-[140px]">{user.email}</p>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-[#881337] hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Hero Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFE4E6] border border-[#881337]/20 text-[#881337] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
            Personalize Your Learning Path
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight leading-tight mb-4">
            Which course are you planning to learn?
          </h1>
          <p className="text-base sm:text-lg text-[#1C0D12]/75 font-normal leading-relaxed">
            Choose your learning path to personalize your Skill Passport and student dashboard.
          </p>
          {existingEnrollment && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#FFE4E6]/60 border border-[#881337]/20 text-[#881337] px-4 py-2 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#881337]" />
              You currently have an active enrollment in{' '}
              <strong className="font-bold underline">{existingEnrollment.courseId}</strong>. You can proceed with your current track or select a new one.
            </div>
          )}
        </div>

        {/* Course Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COURSES.map((course) => {
            const isAvailable = course.status === 'active';
            const isSelected = selectedCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
                  isSelected
                    ? 'bg-white border-[#881337] shadow-xl shadow-[#881337]/15 ring-2 ring-[#881337]'
                    : isAvailable
                    ? 'bg-white/90 border-[#881337]/15 hover:border-[#881337]/40 hover:shadow-lg'
                    : 'bg-white/40 border-stone-200/80 opacity-80'
                }`}
              >
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Available Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      <Clock className="w-3 h-3 text-stone-500" />
                      Coming Soon
                    </span>
                  )}

                  <span className="text-xs font-bold font-mono text-[#881337] bg-[#FFE4E6] px-2.5 py-1 rounded-lg">
                    {course.currency}{course.price}
                  </span>
                </div>

                {/* Course Header */}
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1C0D12] tracking-tight mb-2">
                    {course.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1C0D12]/70 line-clamp-2 leading-relaxed">
                    {course.subtitle || course.description}
                  </p>
                </div>

                {/* Course Meta */}
                <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#881337]/10 my-3 text-[11px] font-medium text-[#1C0D12]/80">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#881337]" />
                    <span>Level: {course.level || 'Beginner → Advanced'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#881337]" />
                    <span>Duration: {course.duration || '6 months'}</span>
                  </div>
                </div>

                {/* Learning Outcomes / Skills */}
                <div className="flex-1 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#881337] mb-2.5">
                    Target Competencies:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {course.skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#FFFDF7] text-[#1C0D12] border border-[#881337]/15"
                      >
                        {skill}
                      </span>
                    ))}
                    {course.skills.length > 6 && (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#FFE4E6]/50 text-[#881337]">
                        +{course.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-2">
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => handleSelectCourse(course.id, course.status)}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-[#881337] text-white shadow-md shadow-[#881337]/30 hover:bg-[#70102d]'
                          : 'bg-white text-[#881337] border-2 border-[#881337] hover:bg-[#FFE4E6]/40'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#CA8A04]" />
                          Course Selected
                        </>
                      ) : (
                        <>
                          Select Course
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-stone-400" />
                      Coming Soon — In Development
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating / Sticky Bottom Action Bar when a course is chosen */}
        <div className="mt-12 max-w-xl mx-auto text-center bg-white rounded-2xl p-6 border border-[#881337]/15 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#881337] mb-2">
            <ShieldCheck className="w-4 h-4 text-[#CA8A04]" />
            Individual Course Access at ₹100
          </div>
          <p className="text-xs text-[#1C0D12]/70 mb-4">
            {selectedCourseId
              ? `You selected ${COURSES.find((c) => c.id === selectedCourseId)?.title}. Each available course is ₹100 individually.`
              : 'Please choose an available course above to continue to student onboarding.'}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCourseId}
            className={`w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-3 ${
              selectedCourseId
                ? 'bg-gradient-to-r from-[#881337] to-[#991B1B] text-white shadow-lg shadow-[#881337]/30 hover:opacity-95 hover:scale-[1.01]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>Continue to Demo Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-[#881337]/10 py-6 text-center text-xs text-[#1C0D12]/60">
        SEVA Skill Passport • Government-Aligned Competency & Evidence Verification System
      </footer>
    </div>
  );
}
