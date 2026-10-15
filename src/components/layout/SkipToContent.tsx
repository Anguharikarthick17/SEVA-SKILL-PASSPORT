'use client';

import React from 'react';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        // Fallback to student-main-content if main-content is not on the page
        if (!document.getElementById('main-content') && document.getElementById('student-main-content')) {
          e.preventDefault();
          const target = document.getElementById('student-main-content');
          target?.focus();
          target?.scrollIntoView({ behavior: 'smooth' });
        }
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#881337] focus:text-[#FFFDF7] focus:font-semibold focus:rounded-xl focus:shadow-[0_8px_24px_rgba(136,19,55,0.35)] focus:ring-2 focus:ring-[#CA8A04] focus:outline-none transition-all duration-200"
    >
      Skip to main content
    </a>
  );
}
