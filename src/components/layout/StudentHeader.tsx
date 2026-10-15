'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  Code2,
  HelpCircle,
  Printer,
  RotateCw,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, DataService } from '@/lib/data-service';
import { useState } from 'react';

interface StudentHeaderProps {
  user: UserProfile | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefreshData?: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; category: string }> = {
  '/dashboard': { title: 'Student Dashboard', category: 'Overview' },
  '/my-learning': { title: 'My Learning Curriculum', category: 'Academics' },
  '/learning': { title: 'My Learning Curriculum', category: 'Academics' },
  '/practice': { title: 'Hands-On Practice Labs', category: 'Engineering' },
  '/assessments': { title: 'Modular Skill Assessments', category: 'Evaluation' },
  '/projects': { title: 'Capstone Engineering Projects', category: 'Engineering' },
  '/skill-growth': { title: 'Competency Growth & Analytics', category: 'Analytics' },
  '/skill-passport/my': { title: 'My Verified Skill Passport', category: 'Credentials' },
  '/passport': { title: 'My Verified Skill Passport', category: 'Credentials' },
  '/credentials': { title: 'Official Digital Credentials', category: 'Credentials' },
  '/profile': { title: 'Student Profile & Settings', category: 'Account' },
};

export default function StudentHeader({
  user,
  sidebarOpen,
  onToggleSidebar,
  onRefreshData,
}: StudentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Find matching route meta
  const matchedRoute =
    Object.entries(ROUTE_TITLES).find(([path]) =>
      pathname === path || pathname.startsWith(`${path}/`)
    )?.[1] || { title: 'Student Workspace', category: 'SEVA' };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await DataService.logoutUser();
      if (typeof document !== 'undefined') {
        document.cookie = 'seva-auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      onRefreshData();
    } else {
      router.refresh();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AM';

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#881337]/15 shadow-[0_2px_12px_rgba(28,13,18,0.03)]"
      role="banner"
    >
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Left: Mobile hamburger & SEVA Branding */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-[#1C0D12] hover:bg-[#881337]/10 hover:text-[#881337] transition-colors focus-visible:ring-2 focus-visible:ring-[#881337]"
              aria-label={sidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5 text-[#881337]" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Official Logo */}
            <Link
              href="/dashboard"
              className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]"
              aria-label="SEVA Skill Passport Student Dashboard"
            >
              <Image
                src="/images/seva-skill-passport-logo-cropped-transparent.png"
                alt="SEVA Skill Passport"
                width={190}
                height={68}
                priority
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>

            {/* Breadcrumb Separator on desktop */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#881337]/15">
              <span className="text-[11px] font-semibold text-[#6B4E56] uppercase tracking-wider">
                {matchedRoute.category}
              </span>
              <ChevronRight className="w-3 h-3 text-[#6B4E56]/50" />
              <span className="text-xs font-bold text-[#1C0D12] truncate max-w-[200px] lg:max-w-xs">
                {matchedRoute.title}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Pills & Student Profile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Actions */}
            <div className="hidden xl:flex items-center gap-1.5 pr-2 border-r border-[#881337]/15">
              <Link
                href="/my-learning"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C0D12] bg-[#FFFDF7] hover:bg-[#FFE4E6] border border-[#881337]/15 rounded-full shadow-2xs transition-all hover:scale-102"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#881337]" />
                <span>myLearn</span>
              </Link>

              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C0D12] bg-[#FFFDF7] hover:bg-[#FFE4E6] border border-[#881337]/15 rounded-full shadow-2xs transition-all hover:scale-102"
              >
                <Code2 className="w-3.5 h-3.5 text-[#881337]" />
                <span>Practice Labs</span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C0D12] bg-[#FFFDF7] hover:bg-[#FFE4E6] border border-[#881337]/15 rounded-full shadow-2xs transition-all hover:scale-102"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#6B4E56]" />
                <span>Support</span>
              </Link>
            </div>

            {/* Utility actions: Print & Refresh */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrint}
                title="Print Dashboard"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#6B4E56] hover:text-[#881337] hover:bg-[#881337]/10 rounded-lg transition-colors border border-transparent hover:border-[#881337]/20"
                aria-label="Print Current View"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Metrics"
                disabled={isRefreshing}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-[#6B4E56] hover:text-[#881337] hover:bg-[#881337]/10 rounded-lg transition-colors border border-transparent hover:border-[#881337]/20 disabled:opacity-50"
                aria-label="Refresh Data"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#881337]' : ''}`} />
              </button>
            </div>

            {/* Faculty Portal Link if authorized */}
            {user?.role && ['admin', 'instructor', 'reviewer'].includes(user.role) && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#CA8A04] bg-[#FFE4E6]/60 hover:bg-[#FFE4E6] border border-[#CA8A04]/30 rounded-full transition-colors shadow-2xs"
                title="Academic Administration Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#CA8A04]" />
                <span className="capitalize">{user.role} Portal</span>
              </Link>
            )}

            {/* Student Profile Pill */}
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#FFFDF7] hover:bg-[#FFE4E6] border border-[#881337]/20 transition-all shadow-2xs group focus-visible:ring-2 focus-visible:ring-[#881337]"
              aria-label="Student Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#881337] to-[#1C0D12] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#881337]/20 group-hover:ring-[#881337]">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none max-w-[120px] md:max-w-[150px]">
                <span className="text-xs font-bold text-[#1C0D12] truncate group-hover:text-[#881337]">
                  {user?.fullName || 'Student'}
                </span>
                <span className="text-[10px] text-[#6B4E56] truncate mt-0.5">
                  {user?.targetRole || 'Full Stack Track'}
                </span>
              </div>
            </Link>

            {/* Real Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              id="student-header-signout-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#881337] bg-[#881337]/5 hover:bg-[#881337] hover:text-white border border-[#881337]/25 hover:border-[#881337] rounded-full transition-all shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#881337]"
              title="Sign Out of SEVA Skill Passport"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
