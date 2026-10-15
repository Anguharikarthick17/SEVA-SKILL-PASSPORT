'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import ExplainerModal from '@/components/home/ExplainerModal';

export default function HeroCinematic() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Respect prefers-reduced-motion and tab visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotion = (matches: boolean) => {
      if (matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    handleMotion(mediaQuery.matches);

    const onMediaChange = (e: MediaQueryListEvent) => {
      handleMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange);
    } else {
      mediaQuery.addListener(onMediaChange);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (!mediaQuery.matches) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      } else {
        mediaQuery.removeListener(onMediaChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-[#FFFDF7] text-[#1C0D12] border-b border-[#881337]/10 w-full flex flex-col justify-center min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-68px)] lg:min-h-[calc(100svh-72px)] py-8 sm:py-10 lg:py-12"
      style={{ minHeight: 'calc(100svh - var(--navbar-height, 72px))' }}
      aria-label="Hero Introduction"
    >
      {/* ── CINEMATIC FULL-WIDTH BACKGROUND VIDEO ── */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src="/videos/seva-hero-bg.mp4"
          poster="/videos/seva-hero-bg-poster.webp"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-center"
          tabIndex={-1}
        />

        {/* Directional Cream Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/90 to-[#FFFDF7]/40 lg:via-[#FFFDF7]/80 lg:to-[#FFFDF7]/30 pointer-events-none" />

        {/* Vertical edge blends */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FFFDF7] via-[#FFFDF7]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/80 to-transparent pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.20] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #881337 0.75px, transparent 0.75px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── FOREGROUND CONTENT ── */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10 w-full my-auto">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-[820px] space-y-5 sm:space-y-6">
          {/* Innovation Platform Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#881337]/25 text-xs font-bold text-[#881337] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#881337] animate-pulse" />
            <span>Academic Innovation Platform</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] xl:text-[3.5rem] 2xl:text-6xl font-black text-[#1C0D12] tracking-tight leading-[1.08]">
              Learn Skills.
              <br />
              Build Ability.
              <br />
              <span className="text-[#881337]">Prove What You Can Do.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-[17px] text-[#6B4E56] leading-relaxed max-w-2xl font-normal pt-1">
              Turn affordable learning into practical skills, real project evidence, and a shareable Skill Passport.
              Bridging the gap between completing courses and proving real engineering capability.
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <GlowButton href="/courses" variant="primary" size="lg" id="hero-explore-courses">
              <span>Explore Learning Paths</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </GlowButton>

            <button
              onClick={() => setIsModalOpen(true)}
              className="glow-button-cream inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-extrabold text-[#1C0D12] border border-[#881337]/25 hover:border-[#881337] bg-white/90 backdrop-blur-xs shadow-xs transition-all hover:scale-102 group"
              id="hero-watch-explainer"
              aria-label="Watch Full Explainer - 30 second video with audio narration"
            >
              <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Watch Full Explainer</span>
              <span className="text-[11px] font-semibold text-[#881337] bg-[#FFE4E6] px-2 py-0.5 rounded-full border border-[#881337]/20">
                0:30
              </span>
            </button>
          </div>

          {/* Credibility Platform Stats Strip */}
          <div className="pt-3 sm:pt-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#881337]/15 p-4 sm:p-5 shadow-xs max-w-2xl xl:max-w-3xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs">
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-black text-[#1C0D12]">12</p>
                  <p className="text-xs font-bold text-[#1C0D12]">Modules</p>
                  <p className="text-[11px] text-[#6B4E56]">Full Stack Curriculum</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-black text-[#881337]">₹100</p>
                  <p className="text-xs font-bold text-[#1C0D12]">Course Pass</p>
                  <p className="text-[11px] text-[#6B4E56]">All Eligible Courses</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-black text-[#1C0D12]">SHA-256</p>
                  <p className="text-xs font-bold text-[#1C0D12]">Verified Evidence</p>
                  <p className="text-[11px] text-[#6B4E56]">Tamper-Proof</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-black text-[#1C0D12]">100%</p>
                  <p className="text-xs font-bold text-[#1C0D12]">Practical Learning</p>
                  <p className="text-[11px] text-[#6B4E56]">Labs + Capstones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainer Modal */}
      <ExplainerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
