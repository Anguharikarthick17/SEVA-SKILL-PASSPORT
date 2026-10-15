'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlowButton from '@/components/ui/GlowButton';
import { DataService } from '@/lib/data-service';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Courses', href: '/courses' },
  { label: 'Skill Passport', href: '/skill-passport' },
  { label: 'For Employers', href: '/employers' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check user authentication
    DataService.getCurrentUser().then((u) => {
      setCurrentUser(u);
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    await DataService.logoutUser();
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#FFFDF7]/95 backdrop-blur-xl border-b border-[#881337]/15 shadow-[0_4px_20px_rgba(136,19,55,0.06)]'
          : 'bg-[#FFFDF7]/85 backdrop-blur-md border-b border-[#881337]/10'
      )}
      role="banner"
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-[68px] lg:h-[72px]">
          {/* Official SEVA Skill Passport Logo */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]"
            aria-label="SEVA Skill Passport Home"
          >
            <Image
              src="/images/seva-skill-passport-logo-cropped-transparent.png"
              alt="SEVA Skill Passport — Powered by Team OG"
              width={220}
              height={78}
              priority
              className="h-10 sm:h-11 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5 2xl:gap-3" aria-label="Primary Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]',
                    isActive
                      ? 'text-[#881337] bg-[#FFE4E6] font-bold shadow-xs'
                      : 'text-[#1C0D12]/80 hover:text-[#881337] hover:bg-[#FFE4E6]/50'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#881337] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs xl:text-sm font-bold text-[#881337] bg-[#FFE4E6] border border-[#881337]/20 hover:bg-[#FECDD3] transition-all rounded-full shadow-xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs xl:text-sm font-semibold text-[#1C0D12] hover:text-[#881337] bg-white border border-[#881337]/20 hover:border-[#881337] transition-all rounded-full shadow-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-xs xl:text-sm font-bold text-[#1C0D12] hover:text-[#881337] bg-white border border-[#881337]/20 hover:border-[#881337] transition-all rounded-full shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]"
                >
                  Login
                </Link>

                <GlowButton href="/signup" size="sm" variant="primary">
                  Get Started <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </GlowButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl bg-white border border-[#881337]/20 text-[#1C0D12] hover:text-[#881337] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337] shadow-xs"
              aria-expanded={mobileOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-[#881337]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#881337]/20 bg-[#FFFDF7]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between',
                    isActive
                      ? 'bg-[#FFE4E6] text-[#881337] font-bold border border-[#881337]/30'
                      : 'text-[#1C0D12] hover:bg-[#FFE4E6]/50'
                  )}
                >
                  {link.label}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#881337]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#881337]/15 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#881337] rounded-full shadow-xs hover:bg-[#700F2E] flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-[#1C0D12] bg-white border border-[#881337]/20 rounded-full shadow-xs hover:border-[#881337] flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#1C0D12] bg-white border border-[#881337]/20 rounded-full shadow-xs hover:border-[#881337]"
                >
                  Login to Account
                </Link>
                <GlowButton
                  href="/signup"
                  size="md"
                  variant="primary"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                </GlowButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
