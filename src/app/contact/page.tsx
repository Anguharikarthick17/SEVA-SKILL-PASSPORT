'use client';

import { useState } from 'react';
import { Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
          <p className="mt-4 text-xl text-blue-100 max-w-xl mx-auto">
            Have questions about SEVA Skill Passport? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="gov-card">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Send a Message</h2>
              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-navy-900">Message Received!</h3>
                  <p className="text-sm text-slate-600">
                    Thank you for reaching out. This is a hackathon prototype demonstration.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline text-xs mt-2"
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
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="What is your message about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary justify-center"
                    id="contact-submit"
                  >
                    Send Message
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    This is a prototype — messages are not actually sent.
                  </p>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="gov-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-navy-50 rounded-lg">
                    <Mail className="w-5 h-5 text-navy-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Email</h3>
                    <p className="text-sm text-slate-600">hello@seva-skillpassport.in</p>
                    <p className="text-xs text-slate-400 mt-1">Prototype contact — not monitored</p>
                  </div>
                </div>
              </div>
              <div className="gov-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-navy-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-navy-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Project</h3>
                    <p className="text-sm text-slate-600">SEVA Hackathon Submission</p>
                    <p className="text-xs text-slate-400 mt-1">Not an official government address</p>
                  </div>
                </div>
              </div>
              <div className="gov-card bg-amber-50 border-amber-100">
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Note:</strong> SEVA Skill Passport is a hackathon prototype. This contact
                  form is for demonstration purposes only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
