import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SEVA Skill Passport',
  description: 'Terms and conditions governing course access, individual ₹100 course pricing, demo access, and competency verification.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FFE4E6] selection:text-[#881337]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5 text-[#CA8A04]" />
            Student Agreement & Policies
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-[#1C0D12]/70 font-medium">
            Effective Date: {lastUpdated} • Version 2.0
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#881337]/15 shadow-xl space-y-10 leading-relaxed text-sm sm:text-base text-[#1C0D12]/85">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              1. Acceptance of Terms
            </h2>
            <p>
              By registering an account, selecting a learning path, enrolling in courses, or utilizing the interactive coding environments of SEVA Skill Passport (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the Platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              2. Course Enrollment & Individual Pricing Rules
            </h2>
            <div className="p-4 rounded-2xl bg-[#FFE4E6]/50 border border-[#881337]/20 text-xs sm:text-sm font-semibold text-[#881337] space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-xs">Non-Negotiable Pricing Policy:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Every available course costs <strong>₹100 INR individually</strong>.</li>
                <li>One payment of ₹100 grants lifetime curriculum and lab access to <strong>one specific course only</strong>.</li>
                <li>Enrolling in an additional course requires a <strong>separate ₹100 purchase</strong>.</li>
                <li>There is <strong>no All-Courses Pass</strong> or bundle. Course access is non-transferable between courses.</li>
              </ul>
            </div>
            <p className="text-xs sm:text-sm">
              Available courses can be accessed immediately upon enrollment. Planned courses clearly labeled &quot;Coming Soon&quot; will become available for individual purchase upon curriculum release.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              3. Demo Mode vs. Paid Access
            </h2>
            <p>
              We provide an evaluation <strong>Demo Mode</strong> allowing learners to explore curriculum lessons, interactive AI tutor assistance, and coding labs without making a financial payment:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Demo Mode is free and collects no credit card or UPI information.</li>
              <li>Demo enrollments are explicitly tagged as demo records on the server.</li>
              <li>Demo Mode does not represent a paid financial transaction and cannot generate paid commercial receipts.</li>
              <li>Paid access is activated only via verified server-side payment processing through our authorized gateway.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              4. Code Sandbox & Acceptable Use
            </h2>
            <p>
              The platform provides browser-based runtime environments for coding exercises and automated testing. You agree to use these environments solely for constructive learning:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Do not attempt to execute malicious scripts, malware, denial-of-service tools, or unauthorized network probes.</li>
              <li>Do not attempt to bypass execution timeouts, resource limits, or server-side anti-cheat mechanisms.</li>
              <li>All assessment submissions are automatically hashed and evaluated for authentic personal competence.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              5. Skill Passport Credentials & Verification
            </h2>
            <p>
              SEVA Skill Passport credentials are cryptographic proofs backed by genuine student performance in practical projects and timed assessments. Misrepresenting evidence, sharing accounts, or manipulating verification IDs will result in immediate credential revocation and account termination.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              6. Refund and Cancellation
            </h2>
            <p>
              Refund requests are handled in accordance with our transparent <Link href="/refund" className="text-[#881337] underline font-bold">Refund Policy</Link>. Inquiries regarding billing discrepancies may be submitted to <a href="mailto:support@seva.gov.in" className="text-[#881337] underline font-semibold">support@seva.gov.in</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              7. Governing Law and Disputes
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with the Platform shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>
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
