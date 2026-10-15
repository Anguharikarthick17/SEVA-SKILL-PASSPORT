import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import SkipToContent from '@/components/layout/SkipToContent';
import CookieConsentBanner from '@/components/shared/CookieConsentBanner';
import WelcomeIntro from '@/components/shared/WelcomeIntro';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SEVA Skill Passport — Learn. Practice. Build. Prove.',
    template: '%s | SEVA Skill Passport',
  },
  description:
    'SEVA Skill Passport is a proposed skill-development platform that transforms learning into measurable, evidence-backed ability. Build your competency profile through structured courses, labs, projects, and assessments.',
  keywords: ['skill development', 'online learning', 'skill passport', 'competency', 'full stack development', 'SEVA'],
  openGraph: {
    title: 'SEVA Skill Passport — Learn. Practice. Build. Prove.',
    description:
      'A proposed skill-development platform that transforms learning into evidence-backed ability.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] overflow-x-hidden w-full">
        <WelcomeIntro />
        <SkipToContent />
        <AppShell>{children}</AppShell>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
