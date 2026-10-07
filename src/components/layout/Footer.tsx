import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'About SEVA', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Courses', href: '/courses' },
    { label: 'Skill Passport', href: '/skill-passport' },
  ],
  Learners: [
    { label: 'Get Started', href: '/register' },
    { label: 'Login', href: '/login' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  Employers: [
    { label: 'For Employers', href: '/employers' },
    { label: 'Verify Credential', href: '/verify' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-white" role="contentinfo">
      {/* Top strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-lg">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-semibold text-saffron-400 tracking-widest uppercase">SEVA</span>
                  <span className="text-sm font-bold text-white tracking-tight">Skill Passport</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                A proposed platform that transforms learning into measurable, evidence-backed ability. Learn. Practice. Build. Prove.
              </p>
              <div className="mt-5 flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                <span className="mt-0.5">⚠</span>
                <span>This is a prototype. Not an official Government of India platform.</span>
              </div>
            </div>

            {/* Link Groups */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">{group}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {currentYear} SEVA Skill Passport. A Hackathon Prototype. All rights reserved.</p>
          <p className="text-center">
            Built for the SEVA Hackathon · Not affiliated with any government body
          </p>
        </div>
      </div>
    </footer>
  );
}
