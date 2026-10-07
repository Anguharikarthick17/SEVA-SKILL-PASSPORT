'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Code2, FolderKanban, TrendingUp,
  Shield, Award, User, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Learning', href: '/learning', icon: BookOpen },
  { label: 'Practice', href: '/practice', icon: Code2 },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Skill Growth', href: '/skill-growth', icon: TrendingUp },
  { label: 'Skill Passport', href: '/skill-passport/my', icon: Shield },
  { label: 'Credentials', href: '/credentials', icon: Award },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gov-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 mt-16 lg:mt-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Dashboard navigation"
      >
        {/* Logo area */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-navy-900 rounded-lg">
              <span className="text-white font-bold text-xs">SP</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold text-saffron-600 tracking-widest uppercase">SEVA</span>
              <span className="text-xs font-bold text-navy-900">Skill Passport</span>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
              <span className="text-navy-700 font-bold text-sm">AS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-900 truncate">Arjun Sharma</p>
              <p className="text-xs text-slate-500 truncate">Full Stack Developer</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy-800'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-semibold text-navy-900">Student Portal</span>
        </div>

        <main className="flex-1 overflow-y-auto" id="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
