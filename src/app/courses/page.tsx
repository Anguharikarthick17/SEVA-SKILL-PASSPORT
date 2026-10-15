'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/courses/CourseCard';
import { COURSES } from '@/data';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import UnlockPassModal from '@/components/courses/UnlockPassModal';
import { DataService, UserProfile } from '@/lib/data-service';

export default function CoursesPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasPass, setHasPass] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    DataService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        fetch(`/api/payments/entitlement?userId=${encodeURIComponent(user.id)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.hasAccess) setHasPass(true);
          })
          .catch(() => {});
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12]">
      {/* ₹100 Unlock Pass Modal */}
      <UnlockPassModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        currentUser={currentUser}
        onSuccess={() => setHasPass(true)}
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/25 to-[#FFFDF7] py-14 sm:py-20 relative overflow-hidden border-b border-[#881337]/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 bg-[#FFE4E6] border border-[#881337]/20 rounded-full text-xs font-bold text-[#881337]">
            <Sparkles className="w-3.5 h-3.5 text-[#CA8A04]" />
            <span>Comprehensive Engineering Pathways</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1C0D12] tracking-tight leading-tight max-w-4xl mx-auto">
            Skill-Building <span className="text-[#881337]">Pathways</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#6B4E56] max-w-2xl mx-auto leading-relaxed">
            Structured engineering programs designed around practical mastery, real coding labs, and production capstone projects.
          </p>

          {/* Pricing Highlight Card */}
          <div className="mt-8 max-w-2xl mx-auto rounded-3xl p-6 sm:p-7 bg-white border border-[#881337]/20 shadow-lg text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#881337]/10 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CA8A04] block">
                  ✦ Featured Student Access Offer
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1C0D12] mt-0.5">
                  Unlock Your Learning Journey
                </h3>
                <p className="text-xs text-[#6B4E56] mt-1">
                  One payment of ₹100 for access to all eligible courses.
                </p>
              </div>

              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#881337]">₹100</span>
                  <span className="text-xs text-[#6B4E56] font-semibold">INR</span>
                </div>
                <span className="text-[10px] text-[#6B4E56] block">One-time payment</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-[#6B4E56] leading-relaxed max-w-md">
                Learn at your own pace. Practise your skills. Build real project evidence.
              </p>

              {hasPass ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All Courses Unlocked
                </div>
              ) : (
                <GlowButton
                  onClick={() => setShowUnlockModal(true)}
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Unlock All Courses — ₹100 <ArrowRight className="w-4 h-4 ml-1" />
                </GlowButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Honest Track Status Banner */}
      <section className="py-3 bg-[#FFE4E6]/40 border-b border-[#881337]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-[#1C0D12]">
              <strong className="text-[#881337]">Full Stack Developer</strong> pathway is active with 111 lessons and interactive code runner. Other engineering tracks are in curriculum production.
            </p>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Academic Consultation Callout */}
          <div className="mt-16 rounded-3xl p-8 bg-white border border-[#881337]/20 shadow-xs max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-xl font-bold text-[#1C0D12]">
              Need a Custom Academic Pathway for Your College or Institution?
            </h3>
            <p className="text-sm text-[#6B4E56] max-w-xl mx-auto leading-relaxed">
              We partner with university faculties to align custom lab rubrics, assessment timers, and verified credential formats.
            </p>
            <div className="pt-2">
              <GlowButton href="/contact" size="md" variant="primary">
                Contact Academic Partnerships <ArrowRight className="w-4 h-4 ml-1" />
              </GlowButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
