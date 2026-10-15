import Link from 'next/link';
import { BookX, ArrowLeft, Search } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function CourseNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FFFDF7] px-4 py-16 text-[#1C0D12]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFE4E6] border border-[#881337]/20 flex items-center justify-center text-[#881337] shadow-xs">
          <BookX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#881337] uppercase tracking-wider bg-[#FFE4E6] px-3 py-1 rounded-full border border-[#881337]/20">
            Course Not Found
          </span>
          <h1 className="text-3xl font-black text-[#1C0D12] tracking-tight">
            Programme Unavailable
          </h1>
          <p className="text-sm text-[#6B4E56] leading-relaxed">
            The course identifier you requested does not exist in our curriculum catalogue. Please browse our active and upcoming engineering tracks below.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <GlowButton href="/courses" variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Explore Course Catalogue
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
