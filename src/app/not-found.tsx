import Link from 'next/link';
import { Compass, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FFFDF7] text-[#1C0D12]">
      <div className="max-w-lg w-full text-center space-y-6 bg-white border border-[#881337]/15 rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(136,19,55,0.06)]">
        <div className="w-16 h-16 rounded-2xl bg-[#FFE4E6] border border-[#881337]/20 mx-auto flex items-center justify-center text-[#881337] shadow-sm">
          <Compass className="w-8 h-8 text-[#881337]" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#881337] tracking-widest uppercase block mb-1">
            404 Error • Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C0D12] tracking-tight">
            Off the Skill Path
          </h1>
          <p className="text-sm text-[#6B4E56] mt-2 leading-relaxed">
            The page, lesson, or credential you are looking for does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#881337] text-[#FFFDF7] font-semibold text-sm hover:bg-[#700F2E] transition-all shadow-[0_4px_16px_rgba(136,19,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#CA8A04]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#881337]/20 bg-[#FFFDF7] text-sm font-semibold text-[#881337] hover:bg-[#FFE4E6]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#881337]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="pt-4 border-t border-[#881337]/10 text-xs text-[#6B4E56]">
          Need help locating a credential? Visit our{' '}
          <Link href="/credentials" className="text-[#881337] font-semibold hover:underline">
            Credentials Registry
          </Link>{' '}
          or contact{' '}
          <a href="mailto:support@seva.gov.in" className="text-[#881337] font-semibold hover:underline">
            support@seva.gov.in
          </a>.
        </div>
      </div>
    </div>
  );
}
