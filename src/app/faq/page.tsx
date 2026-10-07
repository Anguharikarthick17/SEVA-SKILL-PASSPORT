'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ_ITEMS } from '@/data';

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  const categories = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="mt-4 text-xl text-blue-100 max-w-xl mx-auto">
            Everything you need to know about SEVA Skill Passport.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gov-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="text-sm font-bold text-saffron-600 uppercase tracking-widest mb-5">{cat}</h2>
              <div className="space-y-3">
                {FAQ_ITEMS.filter((f) => f.category === cat).map((item, i) => {
                  const idx = FAQ_ITEMS.indexOf(item);
                  return (
                    <div key={idx} className="gov-card">
                      <button
                        className="w-full flex items-start justify-between gap-4 text-left"
                        onClick={() => setOpen(open === idx ? null : idx)}
                        aria-expanded={open === idx}
                      >
                        <span className="font-semibold text-navy-900 text-sm leading-relaxed">{item.question}</span>
                        {open === idx ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                      {open === idx && (
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
