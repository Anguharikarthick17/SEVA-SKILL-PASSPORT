import Link from 'next/link';
import { ArrowRight, Clock, Users, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const isActive = course.status === 'active';

  return (
    <article
      className={cn(
        'gov-card flex flex-col gap-4 hover:shadow-gov-md transition-all duration-200 relative overflow-hidden',
        !isActive && 'opacity-80',
        className
      )}
    >
      {/* Status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy-900 leading-tight">{course.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.subtitle}</p>
        </div>
        {!isActive ? (
          <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            Coming Soon
          </span>
        ) : (
          <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Available
          </span>
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {course.skills.slice(0, 6).map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-navy-50 text-navy-700 text-xs font-medium rounded-md border border-navy-100"
          >
            {skill}
          </span>
        ))}
        {course.skills.length > 6 && (
          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-md">
            +{course.skills.length - 6} more
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          {course.level}
        </span>
        {isActive && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.enrolled.toLocaleString('en-IN')} enrolled
          </span>
        )}
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-2">
        {isActive ? (
          <>
            <div>
              <p className="text-2xl font-bold text-navy-900">₹{course.price}</p>
              <p className="text-xs text-slate-400">Proposed learning access price</p>
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-950 transition-all"
              aria-label={`View ${course.title} course`}
            >
              View Course
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <div className="w-full">
            <p className="text-sm text-slate-400 text-center py-2">Notify me when available</p>
          </div>
        )}
      </div>
    </article>
  );
}
