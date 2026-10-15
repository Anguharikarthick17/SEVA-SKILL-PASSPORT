'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Browse Courses', href: '/courses' },
    { label: 'Skill Passport', href: '/skill-passport' },
    { label: 'For Employers', href: '/employers' },
    { label: 'How It Works', href: '/how-it-works' },
  ],
  Resources: [
    { label: 'About SEVA', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Help & Contact', href: '/contact' },
    { label: 'Credentials Registry', href: '/credentials' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Data Deletion Request', href: '/privacy/delete-request' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleOpenCookieSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
    }
  };

  return (
    <footer className="bg-[#FFFDF7] text-[#1C0D12] border-t border-[#881337]/15" role="contentinfo">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-block group focus:outline-none focus:ring-2 focus:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]"
              aria-label="SEVA Skill Passport Home"
            >
              <Image
                src="/images/seva-skill-passport-logo-cropped-transparent.png"
                alt="SEVA Skill Passport — Powered by Team OG"
                width={240}
                height={85}
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-[#6B4E56] text-xs sm:text-sm leading-relaxed max-w-sm">
              An educational technology framework transforming self-paced courses into measurable, evidence-backed engineering ability.
              Learn. Practice. Build. Prove.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#6B4E56]">
              <Mail className="w-4 h-4 text-[#881337] shrink-0" />
              <span>Support inquiries: </span>
              <a
                href="mailto:support@seva.gov.in"
                className="text-[#881337] hover:underline font-semibold focus:outline-none focus:ring-1 focus:ring-[#881337] rounded"
              >
                support@seva.gov.in
              </a>
            </div>

            <div className="p-3.5 bg-white border border-[#881337]/15 rounded-2xl max-w-sm shadow-xs">
              <p className="text-xs text-[#881337] font-bold mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Academic Hackathon Prototype
              </p>
              <p className="text-[11px] text-[#6B4E56] leading-relaxed">
                SEVA Skill Passport is an educational prototype developed for the SEVA Hackathon.
                Not an official Government of India portal or certified agency.
              </p>
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-[#1C0D12] mb-4 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={`${category}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-[#6B4E56] hover:text-[#881337] transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-150 focus:outline-none focus:ring-1 focus:ring-[#881337] rounded px-0.5"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar with Socials, Copyright, and Cookie Trigger */}
        <div className="mt-12 pt-6 border-t border-[#881337]/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6B4E56]">
          <p>© {currentYear} SEVA Skill Passport. An academic prototype. Not a government website.</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleOpenCookieSettings}
              className="text-xs text-[#6B4E56] hover:text-[#881337] underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#881337] rounded py-0.5 px-1"
            >
              Cookie Preferences
            </button>
            <span className="text-[#881337]/30">|</span>
            <Link
              href="/privacy/delete-request"
              className="text-xs text-[#6B4E56] hover:text-[#881337] underline focus:outline-none focus:ring-1 focus:ring-[#881337] rounded py-0.5 px-1"
            >
              Privacy Request
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
