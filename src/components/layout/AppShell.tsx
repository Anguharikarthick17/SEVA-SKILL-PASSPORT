'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudentHeader from '@/components/layout/StudentHeader';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { DataService, UserProfile } from '@/lib/data-service';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that form the authenticated student application workspace
const STUDENT_ROUTES_REGEX =
  /^\/(dashboard|my-learning|learning|practice|assessments|projects|skill-growth|skill-passport\/my|passport|credentials|profile|admin)(\/.*)?$/;

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const isStudentWorkspace = STUDENT_ROUTES_REGEX.test(pathname || '');

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isStudentWorkspace) {
        setIsLoadingUser(false);
        return;
      }

      try {
        const currentUser = await DataService.getCurrentUser();
        if (!isMounted) return;

        if (!currentUser) {
          // If accessing student workspace without an authenticated session, redirect to login
          const returnUrl = encodeURIComponent(pathname || '/dashboard');
          router.replace(`/login?returnUrl=${returnUrl}`);
          return;
        }

        setUser(currentUser);
      } catch (err) {
        console.warn('AppShell auth resolution notice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isStudentWorkspace, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // If in student workspace:
  if (isStudentWorkspace) {
    return (
      <div className="h-screen flex flex-col bg-[#FFFDF7] overflow-hidden">
        {/* Dedicated Authenticated Header */}
        <StudentHeader
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Authenticated Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Persistent Student Sidebar */}
          <StudentSidebar
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Student Content Surface */}
          <main
            className="flex-1 overflow-y-auto bg-[#FFFDF7] relative focus:outline-none"
            id="student-main-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Otherwise: Public Marketing Website Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 w-full" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
