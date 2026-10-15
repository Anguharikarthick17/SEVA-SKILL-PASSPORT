'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X, Check, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export interface CookiePreferences {
  essential: true;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'seva_cookie_consent';

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [preferences, setPreferences] = useState<{ functional: boolean; analytics: boolean }>({
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so page loads smoothly first
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        setPreferences({
          functional: Boolean(parsed.functional),
          analytics: Boolean(parsed.analytics),
        });
      }
    } catch {}

    // Listen to custom event to reopen preferences anytime
    const handleReopen = () => {
      setIsOpen(true);
      setShowCustomizer(true);
    };
    window.addEventListener('open-cookie-settings', handleReopen);
    return () => window.removeEventListener('open-cookie-settings', handleReopen);
  }, []);

  const saveConsent = (functional: boolean, analytics: boolean) => {
    const consentPayload: CookiePreferences = {
      essential: true,
      functional,
      analytics,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentPayload));
    } catch {}
    setPreferences({ functional, analytics });
    setIsOpen(false);
    setShowCustomizer(false);
  };

  const handleAcceptAll = () => saveConsent(true, true);
  const handleRejectOptional = () => saveConsent(false, false);
  const handleSaveCustom = () => saveConsent(preferences.functional, preferences.analytics);

  if (!mounted || !isOpen) return null;

  return (
    <aside
      aria-label="Cookie Consent Preferences"
      role="region"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-[#FFFDF7]/95 backdrop-blur-md border-t-2 border-[#881337]/20 shadow-2xl text-[#1C0D12] transition-all animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Text Description */}
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFE4E6] text-[#881337] flex items-center justify-center">
                <Cookie className="w-4 h-4 text-[#881337]" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#1C0D12]">
                Your Privacy & Cookie Choices
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#1C0D12]/80 leading-relaxed">
              We use strictly necessary cookies for student authentication and session security. Optional functional cookies help remember your preferences. We never sell your personal data. Read our{' '}
              <Link href="/cookies" className="text-[#881337] font-bold underline hover:text-[#70102d]">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#881337] font-bold underline hover:text-[#70102d]">
                Privacy Policy
              </Link>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleRejectOptional}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-[#881337]/20 bg-white text-xs font-bold text-[#881337] hover:bg-[#FFE4E6]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-[#881337]/20 bg-white text-xs font-bold text-[#1C0D12] hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]"
            >
              <Sliders className="w-3.5 h-3.5 text-[#881337]" />
              <span>Customize</span>
              {showCustomizer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#881337] text-white text-xs font-bold shadow-md shadow-[#881337]/20 hover:bg-[#70102d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Customizer Drawer */}
        {showCustomizer && (
          <div className="mt-4 pt-4 border-t border-[#881337]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* Essential */}
            <div className="p-3 rounded-xl bg-white border border-[#881337]/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1C0D12]">Essential Security</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFE4E6] text-[#881337]">Required</span>
                </div>
                <p className="text-[11px] text-[#1C0D12]/70 leading-normal">
                  Authenticates student sessions, protects CSRF tokens, and enforces route guards.
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Always Enabled
              </div>
            </div>

            {/* Functional */}
            <div className="p-3 rounded-xl bg-white border border-[#881337]/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1C0D12]">Functional Preferences</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#881337]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#1C0D12]/70 leading-normal">
                  Remembers editor layout, active curriculum module tab, and optional saved email.
                </p>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-[#1C0D12]/60">
                {preferences.functional ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Analytics */}
            <div className="p-3 rounded-xl bg-white border border-[#881337]/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1C0D12]">Anonymous Diagnostics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#881337]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#1C0D12]/70 leading-normal">
                  Measures page loading performance and aggregates anonymous error rates.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-[#881337] text-white text-[11px] font-bold hover:bg-[#70102d] transition-colors"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
