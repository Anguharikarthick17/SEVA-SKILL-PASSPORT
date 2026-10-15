'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Award,
  FolderKanban,
  TrendingUp,
  Shield,
  FileCheck2,
  User,
  LogOut,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile, DataService } from '@/lib/data-service';

export interface StudentSidebarProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const STUDENT_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
    isMatch: (p: string) => p === '/dashboard' || p === '/dashboard/',
  },
  {
    id: 'my-learning',
    label: 'My Learning',
    href: '/my-learning',
    icon: BookOpen,
    badge: null,
    isMatch: (p: string) =>
      p === '/my-learning' ||
      p.startsWith('/my-learning/') ||
      p === '/learning' ||
      p.startsWith('/learning/'),
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/practice',
    icon: Code2,
    badge: 'Labs',
    isMatch: (p: string) => p === '/practice' || p.startsWith('/practice/'),
  },
  {
    id: 'assessments',
    label: 'Assessments',
    href: '/assessments',
    icon: Award,
    badge: null,
    isMatch: (p: string) => p === '/assessments' || p.startsWith('/assessments/'),
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    badge: null,
    isMatch: (p: string) => p === '/projects' || p.startsWith('/projects/'),
  },
  {
    id: 'skill-growth',
    label: 'Skill Growth',
    href: '/skill-growth',
    icon: TrendingUp,
    badge: null,
    isMatch: (p: string) => p === '/skill-growth' || p.startsWith('/skill-growth/'),
  },
  {
    id: 'skill-passport',
    label: 'Skill Passport',
    href: '/skill-passport/my',
    icon: Shield,
    badge: 'Official',
    isMatch: (p: string) =>
      p === '/skill-passport/my' ||
      p.startsWith('/skill-passport/my/') ||
      p === '/passport' ||
      p.startsWith('/passport/'),
  },
  {
    id: 'credentials',
    label: 'Credentials',
    href: '/credentials',
    icon: FileCheck2,
    badge: null,
    isMatch: (p: string) => p === '/credentials' || p.startsWith('/credentials/'),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: User,
    badge: null,
    isMatch: (p: string) => p === '/profile' || p.startsWith('/profile/'),
  },
];

export default function StudentSidebar({ user, isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
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

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AM';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="student-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-white border-r border-[#881337]/15 flex flex-col transition-transform duration-300 ease-in-out shadow-sm lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Student Navigation Sidebar"
      >
        {/* Top Header / Mobile Close */}
        <div className="flex items-center justify-between p-4 border-b border-[#881337]/10 lg:hidden">
          <Link href="/dashboard" onClick={onClose} className="inline-block">
            <Image
              src="/images/seva-skill-passport-logo-cropped-transparent.png"
              alt="SEVA Skill Passport"
              width={160}
              height={55}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B4E56] hover:bg-[#881337]/10 hover:text-[#881337]"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Mini Profile Summary Card */}
        <div className="p-3.5 mx-3 mt-3.5 mb-2 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1C0D12] to-[#881337] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1C0D12] truncate">
                {user?.fullName || 'Student'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-[#6B4E56] truncate font-medium">
                  {user?.targetRole || 'Full Stack Track'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-2 space-y-1 focus:outline-none"
          aria-label="Student Application Sections"
        >
          {STUDENT_NAV_ITEMS.map((item) => {
            const isActive = item.isMatch(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]',
                  isActive
                    ? 'bg-[#881337] text-white shadow-[0_2px_10px_rgba(136,19,55,0.35)] translate-x-0.5'
                    : 'text-[#1C0D12] hover:bg-[#881337]/10 hover:text-[#881337]'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-transform duration-150',
                      isActive
                        ? 'text-white'
                        : 'text-[#6B4E56] group-hover:text-[#881337] group-hover:scale-110'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider transition-colors',
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[#FFE4E6] text-[#881337] border border-[#881337]/20'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Workspace Status & Sign Out */}
        <div className="p-3 border-t border-[#881337]/10 bg-white">
          <div className="px-3 py-2 mb-2 rounded-xl bg-[#FFFDF7] border border-[#881337]/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#6B4E56]">SEVA Integrity</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
              </span>
            </div>
            <p className="text-[9px] text-[#6B4E56]/80 mt-0.5">SHA-256 Telemetry v2.4</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            id="sidebar-signout-action"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#6B4E56] hover:bg-[#FFE4E6] hover:text-[#881337] transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#881337]"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
