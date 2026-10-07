import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
      <body className="min-h-screen flex flex-col bg-gov-bg">
        <Navbar />
        <main className="flex-1" id="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
