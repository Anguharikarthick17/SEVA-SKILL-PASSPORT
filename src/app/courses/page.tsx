import type { Metadata } from 'next';
import CourseCard from '@/components/courses/CourseCard';
import { COURSES } from '@/data';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Browse skill-building courses on SEVA Skill Passport. Currently offering Full Stack Development.',
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">Skill-Building Courses</h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
            Structured pathways that build genuine capability — not just course completion records.
          </p>
        </div>
      </section>

      {/* Active Course highlight */}
      <section className="py-8 bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-semibold text-green-800">
              Full Stack Development is currently available. Other pathways are in development.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
