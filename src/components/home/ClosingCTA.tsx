'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgePercent, Laptop, ShieldCheck, Briefcase } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function ClosingCTA() {
  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden" aria-label="Final Call to Action">
      {/* Background Red Ribbon Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-milan-600/15 via-[#FFE4E6]/30 to-transparent pointer-events-none" />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left CTA Text & Buttons */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-[10px] font-bold tracking-wider uppercase text-milan-600">
              <span>✦ GET STARTED</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-espresso-900 tracking-tight leading-tight">
              Start Your Journey Today.
            </h2>

            <p className="text-sm sm:text-base text-espresso-muted max-w-xl leading-relaxed">
              Learn new skills, build real projects, and create a Skill Passport that proves what you can do.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <GlowButton href="/signup" variant="primary" size="lg" id="cta-start-journey">
                <span>Create Your Account</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </GlowButton>

              <GlowButton href="/courses" variant="glass" size="lg" id="cta-explore-courses">
                <span>Explore Courses</span>
              </GlowButton>
            </div>
          </div>

          {/* Right Value Grid (Matching Visual Reference) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-milan-600/15 shadow-sm text-center">
              <div className="w-9 h-9 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center mx-auto mb-2">
                <BadgePercent className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-espresso-900">Affordable Access</p>
              <p className="text-[10px] text-espresso-muted mt-0.5">₹100 model (proposed)</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-milan-600/15 shadow-sm text-center">
              <div className="w-9 h-9 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center mx-auto mb-2">
                <Laptop className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-espresso-900">Practical Learning</p>
              <p className="text-[10px] text-espresso-muted mt-0.5">Projects + Assessments</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-milan-600/15 shadow-sm text-center">
              <div className="w-9 h-9 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-espresso-900">Verifiable Evidence</p>
              <p className="text-[10px] text-espresso-muted mt-0.5">SHA-256 Secured</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-milan-600/15 shadow-sm text-center">
              <div className="w-9 h-9 rounded-xl bg-milan-50 text-milan-600 flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-espresso-900">Career Ready</p>
              <p className="text-[10px] text-espresso-muted mt-0.5">Showcase to Employers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
