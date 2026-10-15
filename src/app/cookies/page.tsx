import React from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, CheckCircle2, Sliders, Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | SEVA Skill Passport',
  description: 'Learn how SEVA Skill Passport uses cookies and local storage tokens for authentication, session integrity, and user preferences.',
};

export default function CookiePolicyPage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FFE4E6] selection:text-[#881337]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
            <Cookie className="w-3.5 h-3.5 text-[#CA8A04]" />
            Transparency in Tracking & Storage
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-sm text-[#1C0D12]/70 font-medium">
            Last Updated: {lastUpdated} • Version 2.0
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#881337]/15 shadow-xl space-y-10 leading-relaxed text-sm sm:text-base text-[#1C0D12]/85">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              1. What Are Cookies and Storage Technologies?
            </h2>
            <p>
              Cookies are small text files stored on your browser or device by web platforms you visit. Similar technologies include web storage (`localStorage` and `sessionStorage`) in your browser. These tools allow SEVA Skill Passport to recognize you when you log in, maintain your progress across coding exercises, and preserve your customized dashboard settings.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              2. Inventory of Cookies Used on SEVA
            </h2>
            <p>We believe in radical clarity. Below is the complete audit of cookies utilized on our platform:</p>

            <div className="space-y-3">
              {/* Essential Cookies */}
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-[#881337] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#CA8A04]" />
                    Strictly Necessary (Essential) Cookies
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFE4E6] text-[#881337]">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-[#1C0D12]/70 mb-3">
                  These cookies are vital for core functionality like authentication, route security, and session persistence. You cannot disable these through our consent banner.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#881337]/10 text-[#881337] font-bold">
                        <th className="py-1.5 pr-4">Cookie / Key</th>
                        <th className="py-1.5 pr-4">Provider</th>
                        <th className="py-1.5 pr-4">Purpose</th>
                        <th className="py-1.5">Lifespan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#881337]/5 text-[#1C0D12]/80">
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold">seva-auth-token</td>
                        <td className="py-2 pr-4">First-party (SEVA)</td>
                        <td className="py-2 pr-4">Verifies logged-in student session for middleware route guards</td>
                        <td className="py-2 font-mono">7 days</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold">sb-*-auth-token</td>
                        <td className="py-2 pr-4">Supabase Auth</td>
                        <td className="py-2 pr-4">Maintains cryptographic user authentication token</td>
                        <td className="py-2 font-mono">Session / 1 yr</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold">seva_cookie_consent</td>
                        <td className="py-2 pr-4">First-party (SEVA)</td>
                        <td className="py-2 pr-4">Records your cookie preferences and consent choices</td>
                        <td className="py-2 font-mono">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional & Preference Cookies */}
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-[#1C0D12] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#881337]" />
                    Functional & Preference Storage
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-[#1C0D12]/70 mb-3">
                  Remembers your learning UI preferences, code editor draft state, and optional login credentials.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#881337]/10 text-[#881337] font-bold">
                        <th className="py-1.5 pr-4">Storage Key</th>
                        <th className="py-1.5 pr-4">Type</th>
                        <th className="py-1.5 pr-4">Purpose</th>
                        <th className="py-1.5">Lifespan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#881337]/5 text-[#1C0D12]/80">
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold">seva_remember_email</td>
                        <td className="py-2 pr-4">localStorage</td>
                        <td className="py-2 pr-4">Stores email address only when &quot;Remember Me&quot; is checked</td>
                        <td className="py-2 font-mono">Persistent</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono font-semibold">seva_db_*</td>
                        <td className="py-2 pr-4">localStorage</td>
                        <td className="py-2 pr-4">Caches code editor drafts and offline demo evaluation progress</td>
                        <td className="py-2 font-mono">Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              3. Managing Your Cookie Preferences
            </h2>
            <p>
              You can modify or withdraw your cookie consent at any time directly through our cookie banner or by clearing your browser cookies.
            </p>
            <p className="text-xs text-[#1C0D12]/70">
              Most web browsers allow you to manage cookie settings via their preferences menu:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#881337] hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
