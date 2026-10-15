'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function AffordabilityCard() {
  return (
    <section className="py-16 sm:py-20 bg-[#FFFDF7] text-[#1C0D12] relative overflow-hidden" aria-labelledby="affordability-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#881337] via-[#700F2E] to-[#4C0519] text-white shadow-[0_20px_50px_-10px_rgba(136,19,55,0.35)] relative overflow-hidden border border-white/15">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Mission Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-white border border-white/20">
                <HeartHandshake className="w-3.5 h-3.5 text-[#CA8A04]" />
                <span>Mission-Driven Access</span>
              </div>

              <h2 id="affordability-heading" className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Democratizing Practical Ability.
                <br />
                <span className="text-[#FACC15]">Accessible by Architecture.</span>
              </h2>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                High-quality software engineering education has historically been gated behind expensive commercial bootcamps.
                SEVA proposes a sustainable community model designed to make practical skill verification accessible to every aspiring engineer across India.
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-[#FACC15] font-bold text-xs mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FACC15]" />
                    <span>Open Learning Core</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Leveraging open educational standards, open-source tooling, and automated browser test runners.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-[#FACC15] font-bold text-xs mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
                    <span>Standardized Rubrics</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Clear assessment rubrics and faculty evaluation queues enable cost-effective, high-integrity verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Offer Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl p-6 sm:p-8 bg-white text-[#1C0D12] border border-[#881337]/15 shadow-2xl relative space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE4E6] text-[#881337] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#CA8A04]" />
                  <span>Student Access Offer</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#1C0D12]">Affordable Individual Learning</h3>
                  <p className="text-xs text-[#6B4E56] mt-1">₹100 per course. Pay only for the specific curriculum you choose.</p>
                </div>

                <div className="flex items-baseline gap-2 py-2 border-y border-[#881337]/10">
                  <span className="text-4xl sm:text-5xl font-black text-[#881337] leading-none">₹100</span>
                  <span className="text-xs text-[#6B4E56] font-semibold">INR per course</span>
                </div>

                <p className="text-xs text-[#6B4E56] leading-relaxed">
                  Learn at your own pace. Practice your skills with automated browser feedback. Build verifiable project evidence.
                </p>

                <div className="pt-2">
                  <GlowButton
                    href="/courses"
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                  >
                    <span>Browse Courses — ₹100 each</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
