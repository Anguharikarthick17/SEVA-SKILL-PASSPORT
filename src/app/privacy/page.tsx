import React from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, UserCheck, Trash2, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SEVA Skill Passport',
  description: 'Understand how SEVA Skill Passport collects, protects, and handles your personal data, course progress, and competency evidence.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FFE4E6] selection:text-[#881337]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5 text-[#CA8A04]" />
            Data Protection & Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#1C0D12]/70 font-medium">
            Last Updated: {lastUpdated} • Version 2.0 (Government-Aligned Privacy Standards)
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#881337]/15 shadow-xl space-y-10 leading-relaxed text-sm sm:text-base text-[#1C0D12]/85">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              1. Overview and Scope
            </h2>
            <p>
              SEVA Skill Passport (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) is a competency-based technical skilling and credential verification system. We are committed to processing your personal data transparently, securely, and in strict adherence to data protection principles.
            </p>
            <p>
              This Privacy Policy explains what information we collect when you register, browse courses, practice coding in our browser sandboxes, complete assessments, and verify technical credentials.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              2. Personal Data We Collect
            </h2>
            <p>We adhere strictly to the principle of data minimization and collect only the data necessary to provide authentic education and certification:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Registration & Profile Data:</strong> Full name, verified email address, mobile number, educational level, state, and district. This information identifies the learner on certified Skill Passports.
              </li>
              <li>
                <strong>Academic & Learning Data:</strong> Course enrollments, lesson completion status, code submissions, interactive sandbox executions, assessment attempts, and challenge scores.
              </li>
              <li>
                <strong>Cryptographic Evidence:</strong> SHA-256 evidence digests linking demonstrated competency artifacts (code diffs, lab validations) to your anonymous or public Skill Passport ID.
              </li>
              <li>
                <strong>Transaction & Enrollment Records:</strong> Payment order identifiers, payment status, transaction amounts (₹100 per course), currency (INR), and entitlement records. <em>Note: We never process or store raw payment card numbers or bank credentials directly; these are handled securely by RBI-compliant payment gateways.</em>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              3. Purpose and Legal Basis for Processing
            </h2>
            <p>Your data is processed strictly for the following purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <h3 className="font-bold text-[#1C0D12] text-sm mb-1">Service Delivery</h3>
                <p className="text-[#1C0D12]/70">Authenticating sessions, delivering course curricula, running code evaluations, and tracking academic progress.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <h3 className="font-bold text-[#1C0D12] text-sm mb-1">Evidence & Verification</h3>
                <p className="text-[#1C0D12]/70">Generating tamper-evident cryptographic proofs of student competence for prospective employers and academic audits.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <h3 className="font-bold text-[#1C0D12] text-sm mb-1">Security & Anti-Cheat</h3>
                <p className="text-[#1C0D12]/70">Enforcing timed assessment limits, sandbox timeouts, and cooldown periods to ensure fair examination conditions.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
                <h3 className="font-bold text-[#1C0D12] text-sm mb-1">Compliance & Audit</h3>
                <p className="text-[#1C0D12]/70">Maintaining financial records, transaction receipts, and tamper-resistant audit logs as required by law.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              4. Third-Party Service Providers
            </h2>
            <p>We partner only with vetted infrastructure providers who adhere to strict data security standards:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Database & Authentication:</strong> Supabase / PostgreSQL (hosted securely with encrypted storage at rest and in transit).</li>
              <li><strong>Payment Processing:</strong> Razorpay Software Private Limited (PCI-DSS Level 1 compliant gateway).</li>
              <li><strong>Hosting & Edge Delivery:</strong> Vercel Inc. (TLS 1.3 encrypted edge network).</li>
            </ul>
            <p className="text-xs text-[#1C0D12]/60">We never sell, rent, or monetize your personal data to marketing third parties or data brokers.</p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              5. Data Retention, Portability & Deletion
            </h2>
            <p>
              We retain student profiles and evidence records as long as your account remains active. Because Skill Passport credentials represent permanent proof of achievement, public credentials remain verifiable unless explicitly revoked or deleted.
            </p>
            <div className="p-5 rounded-2xl bg-[#FFE4E6]/40 border border-[#881337]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-[#881337] text-sm">Right to Erasure (Data Deletion)</h4>
                <p className="text-xs text-[#1C0D12]/70 mt-0.5">
                  You have the right to request the permanent deletion or anonymization of your personal profile and account.
                </p>
              </div>
              <Link
                href="/privacy/delete-request"
                className="px-4 py-2 rounded-xl bg-[#881337] text-white font-bold text-xs hover:bg-[#70102d] transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Submit Deletion Request
              </Link>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              6. Cookies and Consent
            </h2>
            <p>
              Our platform uses essential session cookies for authentication, and optional preferences cookies only upon your explicit consent. Detailed information regarding cookie names, purposes, and controls is available in our dedicated <Link href="/cookies" className="text-[#881337] underline font-bold">Cookie Policy</Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              7. Contact Our Privacy Officer
            </h2>
            <p>
              For privacy inquiries, rights enforcement requests, or grievance redressal, please contact:
            </p>
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 text-xs space-y-1">
              <p className="font-bold text-[#1C0D12]">SEVA Skill Passport — Data Governance Cell</p>
              <p>Email: <a href="mailto:support@seva.gov.in" className="text-[#881337] font-semibold underline">support@seva.gov.in</a></p>
              <p className="text-[#1C0D12]/60">Physical Address: Data Protection Division, SEVA Technical Skilling Platform, New Delhi, India</p>
            </div>
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
