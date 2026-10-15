'use client';

import { useState } from 'react';
import { Mail, MapPin, CheckCircle2, MessageSquare, Send, Building2 } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/30 to-[#FFFDF7] py-16 sm:py-24 border-b border-milan-600/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-milan-50 rounded-full text-xs font-bold uppercase tracking-wider text-milan-600 mb-4 border border-milan-600/30">
            <MessageSquare className="w-4 h-4 text-milan-600" />
            Connect &amp; Collaborate
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-espresso-900">
            Get in <span className="text-milan-600">Touch</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-muted max-w-xl mx-auto leading-relaxed">
            Have questions about SEVA Skill Passport, partner integrations, or our evidence-backed architecture? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form */}
            <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white border border-milan-600/20 shadow-md">
              <h2 className="text-xl font-bold text-espresso-900 mb-1">Send a Message</h2>
              <p className="text-xs text-espresso-muted mb-6">Inquiries regarding institutional pilots, course authoring, and verification.</p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-espresso-900">Message Received!</h3>
                  <p className="text-xs text-espresso-muted max-w-sm mx-auto">
                    Thank you for reaching out. This is a SEVA hackathon prototype demonstration.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 border border-milan-600/30 bg-white text-espresso-900 font-semibold rounded-full text-xs hover:border-milan-600 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-espresso-800 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-espresso-800 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="you@institution.edu"
                        className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-bold text-espresso-800 mb-1.5">
                      Inquiry Category *
                    </label>
                    <select
                      id="contact-subject"
                      className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs font-medium text-espresso-900 focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Academic Partnership</option>
                      <option value="employer">Recruiter Solutions</option>
                      <option value="technical">Technical Verification Architecture</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold text-espresso-800 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Tell us about your organization or question..."
                      className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-colors resize-none"
                    />
                  </div>

                  <GlowButton type="submit" variant="primary" size="md" className="w-full">
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </GlowButton>

                  <p className="text-[11px] text-[#6B4E56] text-center pt-2 leading-relaxed">
                    By submitting this form, you agree that SEVA Skill Passport may process your message to respond to your inquiry in accordance with our{' '}
                    <a href="/privacy" target="_blank" className="text-[#881337] underline font-medium">
                      Privacy Policy
                    </a>.
                  </p>
                </form>
              )}
            </div>

            {/* Sidebar Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-milan-600/20 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-espresso-900">Project Operations</h3>
                <div className="space-y-3 text-xs text-espresso-muted">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-milan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-espresso-900">Support Inquiries</p>
                      <a href="mailto:support@seva.gov.in" className="text-[#881337] underline font-medium">
                        support@seva.gov.in
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-milan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-espresso-900">Academic Project Secretariat</p>
                      <p>SEVA Hackathon Innovation Cell, New Delhi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-milan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-espresso-900">Status</p>
                      <p>Prototype Stage · Not an official Government agency</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-milan-50 border border-milan-600/25 space-y-2">
                <h4 className="text-xs font-bold text-milan-700 uppercase tracking-wider">Fast Turnaround for Recruiters</h4>
                <p className="text-xs text-espresso-muted leading-relaxed">
                  Need an API key to test bulk candidate verification for your campus drive? Drop us a note with your team size.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
