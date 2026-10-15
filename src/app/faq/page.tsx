'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { FAQ_ITEMS } from '@/data';
import GlowButton from '@/components/ui/GlowButton';

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  const categories = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 border-b border-milan-600/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-milan-50 rounded-full text-xs font-bold uppercase tracking-wider text-milan-600 mb-4 border border-milan-600/30">
            <HelpCircle className="w-4 h-4 text-milan-600" />
            Knowledge Base &amp; Answers
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-espresso-900">
            Frequently Asked <span className="text-milan-600">Questions</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about the SEVA Skill Passport, practical evidence aggregation, verification, and affordable learning models.
          </p>
        </div>
      </section>

      {/* Accordions */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-milan-600/15">
                <span className="w-2 h-2 rounded-full bg-milan-600" />
                <h2 className="text-xs font-bold text-milan-600 uppercase tracking-widest">{cat}</h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.filter((f) => f.category === cat).map((item) => {
                  const idx = FAQ_ITEMS.indexOf(item);
                  const isOpen = open === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl transition-all duration-200 border ${
                        isOpen
                          ? 'bg-white border-milan-600 shadow-md'
                          : 'bg-white/80 border-milan-600/15 hover:border-milan-600/30'
                      }`}
                    >
                      <button
                        className="w-full p-5 flex items-start justify-between gap-4 text-left transition-colors cursor-pointer"
                        onClick={() => setOpen(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="font-bold text-sm text-espresso-900 leading-snug">
                          {item.question}
                        </span>
                        <span className="p-1 rounded-lg bg-milan-50 text-milan-600 flex-shrink-0 mt-0.5">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-xs text-espresso-muted leading-relaxed border-t border-milan-600/10 pt-3 animate-fade-in">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Need help box */}
          <div className="mt-14 p-8 rounded-3xl bg-white border border-milan-600/20 shadow-sm text-center space-y-3">
            <h3 className="text-lg font-bold text-espresso-900">Have a Question Not Listed Here?</h3>
            <p className="text-xs text-espresso-muted max-w-md mx-auto">
              Our academic team is happy to answer technical questions regarding rubrics, evidence hashing, or platform integration.
            </p>
            <div className="pt-2">
              <GlowButton href="/contact" size="sm" variant="primary">
                Reach Out to Support <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </GlowButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
