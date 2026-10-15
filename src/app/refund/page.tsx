import React from 'react';
import Link from 'next/link';
import { RefreshCw, CheckCircle2, AlertCircle, HelpCircle, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | SEVA Skill Passport',
  description: 'Understand SEVA Skill Passport refund request procedures, review timelines, and payment resolution guidelines for ₹100 individual course enrollments.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FFE4E6] selection:text-[#881337]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold uppercase tracking-wider mb-3">
            <RefreshCw className="w-3.5 h-3.5 text-[#CA8A04]" />
            Fair Student Protection
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight mb-3">
            Refund & Cancellation Policy
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
              1. Our Commitment to Fair Education
            </h2>
            <p>
              SEVA Skill Passport provides high-quality, government-aligned technical curricula at a subsidized, accessible cost of <strong>₹100 INR per individual course</strong>. We believe in complete transparency and ensure every student has a smooth, risk-free learning experience.
            </p>
            <p>
              Before purchasing, learners are encouraged to try our <strong>Demo Mode</strong>, which allows full exploration of course modules, coding environments, and learning materials without any financial transaction.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              2. Eligible Refund Conditions
            </h2>
            <p>You are eligible for a full refund of your ₹100 course purchase under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Duplicate Charges:</strong> If you were accidentally charged more than once for the same course due to a network glitch or payment gateway timeout.
              </li>
              <li>
                <strong>Technical Access Failure:</strong> If verified payment was completed, but our platform servers failed to grant curriculum access and our engineering support could not resolve the issue within 48 hours.
              </li>
              <li>
                <strong>Cancellation Request within 7 Days:</strong> If submitted within 7 calendar days from the transaction timestamp, provided you have not completed more than 10% of the lessons or obtained a certified Skill Passport credential.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              3. Information Required for Refund Processing
            </h2>
            <p>To expedite verification, please email <a href="mailto:support@seva.gov.in" className="text-[#881337] font-semibold underline">support@seva.gov.in</a> with the following details:</p>
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 text-xs space-y-1.5 font-mono">
              <p>• Student Name & Registered Email Address</p>
              <p>• SEVA Order ID (e.g., SEVA-ORD-XXXXXXXX)</p>
              <p>• Payment Gateway Reference ID (e.g., pay_XXXXXXXXXXXX)</p>
              <p>• Course Name for which refund is requested</p>
              <p>• Brief explanation of the issue encountered</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              4. Review Timeline and Reimbursement
            </h2>
            <p>
              Our support team reviews refund requests within <strong>3 to 5 business days</strong>. Upon approval:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>The refund is initiated directly via our payment processing partner (Razorpay).</li>
              <li>Refunded funds typically reflect in your original payment method (Bank Account, UPI, or Card) within <strong>5 to 7 business days</strong>, depending on your bank&apos;s settlement schedule.</li>
              <li>Access to the refunded course will be deactivated once the reimbursement is initiated.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#881337] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#881337] rounded-full inline-block"></span>
              5. Non-Refundable Scenarios
            </h2>
            <p>Refunds cannot be issued for:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Courses where a formal Skill Passport certification has already been cryptographically issued.</li>
              <li>Requests submitted after 7 days from payment completion.</li>
              <li>Accounts terminated due to academic misconduct, plagiarism, or malicious code injection in violation of our Terms of Service.</li>
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
