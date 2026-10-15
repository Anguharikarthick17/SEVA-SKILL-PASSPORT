'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Database, Cpu, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const isActive = course.status === 'active';
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  // Determine icon based on course slug or category
  const renderIcon = () => {
    if (course.slug.includes('data')) return <Database className="w-5 h-5 text-[#881337]" />;
    if (course.slug.includes('ai') || course.slug.includes('machine')) return <Cpu className="w-5 h-5 text-[#881337]" />;
    if (course.slug.includes('cyber') || course.slug.includes('security')) return <ShieldCheck className="w-5 h-5 text-[#881337]" />;
    return <Code2 className="w-5 h-5 text-[#881337]" />;
  };

  return (
    <article
      className={cn(
        'rounded-3xl flex flex-col justify-between p-6 sm:p-7 bg-white border border-[#881337]/15 shadow-[0_10px_30px_-10px_rgba(136,19,55,0.06)] hover:border-[#881337] hover:shadow-[0_20px_45px_-10px_rgba(136,19,55,0.14)] transition-all duration-300 relative group overflow-hidden',
        !isActive && 'bg-[#FFFDF7]',
        className
      )}
    >
      <div>
        {/* Top Icon & Tag */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FFE4E6] border border-[#881337]/20 flex items-center justify-center shadow-2xs">
            {renderIcon()}
          </div>

          {course.slug === 'full-stack-development' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#CA8A04] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
              ✦ Popular
            </span>
          ) : !isActive ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#881337]/20 text-[10px] font-bold tracking-wider uppercase">
              Coming Soon
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#881337] border border-[#881337]/30 text-[10px] font-bold tracking-wider uppercase">
              Available
            </span>
          )}
        </div>

        {/* Course Title & Module Count */}
        <h3 className="text-lg font-black text-[#1C0D12] tracking-tight group-hover:text-[#881337] transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-[#881337] font-bold mt-1">
          {isActive ? (
            <>
              <span>{course.modules?.length || 0} Modules</span>
              <span className="text-[#6B4E56]">•</span>
              <span className="text-[#6B4E56] font-medium">{totalLessons} Lessons</span>
            </>
          ) : (
            <span className="text-[#6B4E56] font-medium">Planned Curriculum • Coming Soon</span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#6B4E56] mt-2.5 line-clamp-2 leading-relaxed">
          {course.subtitle || 'Learn industry-relevant engineering skills with real projects and practical tools.'}
        </p>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 my-4">
          {course.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 bg-[#FFFDF7] text-[#1C0D12] text-[11px] font-semibold rounded-lg border border-[#881337]/10"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Meta Level & Burgundy Action Button */}
      <div className="pt-4 border-t border-[#881337]/10 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full bg-[#FFE4E6] text-[10px] font-bold text-[#881337] border border-[#881337]/20">
          {course.level || 'Beginner to Advanced'}
        </span>

        <Link
          href={`/courses/${course.slug}`}
          className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shadow-xs hover:bg-[#700F2E] hover:scale-105 active:scale-95 transition-all group-hover:shadow-[0_4px_12px_rgba(136,19,55,0.3)]"
          aria-label={`View ${course.title}`}
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
