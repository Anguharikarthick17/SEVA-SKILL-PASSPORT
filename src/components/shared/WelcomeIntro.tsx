'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'seva_welcome_intro_seen';

export default function WelcomeIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const dismissIntro = useCallback(() => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, []);

  useEffect(() => {
    // Check if session storage indicates the intro was already seen in this session
    try {
      const alreadySeen = sessionStorage.getItem(STORAGE_KEY);
      if (alreadySeen === 'true') {
        return;
      }
    } catch {
      // If sessionStorage is disabled or unavailable, fail safely and do not block the site
      return;
    }

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setPrefersReducedMotion(true);
      }
    }

    // Show intro and prevent background scrolling
    setIsVisible(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Automatically transition to the website after the sequence finishes (2.8 seconds)
    const timer = setTimeout(() => {
      dismissIntro();
    }, 2900);

    // Keyboard support: Escape key skips intro immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [dismissIntro]);

  // If not visible, return null
  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }}>
      {isVisible && (
        <motion.div
          key="welcome-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFDF7] text-[#1C0D12] select-none px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to SEVA Skill Passport"
        >
          {/* Subtle Ambient Background Warmth */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(255,228,230,0.5)_0%,_rgba(255,253,247,0)_70%)]"
            aria-hidden="true"
          />

          {/* Discreet Accessible Skip Button */}
          <button
            type="button"
            onClick={dismissIntro}
            className="absolute top-6 right-6 z-10 px-3.5 py-1.5 text-xs font-semibold text-[#881337] bg-white/80 hover:bg-white border border-[#881337]/20 hover:border-[#881337]/40 rounded-full shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#881337]"
            aria-label="Skip welcome introduction"
          >
            Skip Intro
          </button>

          {/* Main Content Composition */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-6">
            {/* Stage A: Official Logo Reveal */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <Image
                src="/images/seva-skill-passport-logo-transparent.png"
                alt="SEVA Skill Passport Logo"
                width={480}
                height={160}
                priority
                className="w-[280px] sm:w-[360px] md:w-[440px] h-auto object-contain"
              />
            </motion.div>

            {/* Stage B: Welcome Headline & Team OG Attribution */}
            <div className="space-y-2">
              <motion.h1
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#1C0D12]"
              >
                Welcome to{' '}
                <span className="text-[#881337]">SEVA Skill Passport</span>
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-base font-semibold text-[#6B4E56] tracking-wide"
              >
                Powered by{' '}
                <span className="font-extrabold text-[#CA8A04] tracking-normal">Team OG</span>{' '}
                <span className="text-[#881337]/40">—</span>{' '}
                <span className="text-[#881337] font-medium">Opportunity &amp; Growth</span>
              </motion.p>
            </div>

            {/* Stage B Accent: Subtle Animated Golden Line */}
            <motion.div
              initial={prefersReducedMotion ? { width: '80px', opacity: 1 } : { width: '0px', opacity: 0 }}
              animate={{ width: '96px', opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5, ease: 'easeOut' }}
              className="h-[2px] bg-gradient-to-r from-transparent via-[#CA8A04] to-transparent rounded-full"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
