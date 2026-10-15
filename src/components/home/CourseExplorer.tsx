'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { COURSES } from '@/data';
import CourseCard from '@/components/courses/CourseCard';

export default function CourseExplorer() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  const filteredCourses = COURSES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    if (filter === 'active') return matchesSearch && c.status === 'active';
    if (filter === 'upcoming') return matchesSearch && c.status !== 'active';
    return matchesSearch;
  });

  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden" aria-labelledby="pathways-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        {/* Section Header (Matching Visual Reference) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-[10px] font-bold tracking-wider uppercase text-milan-600 mb-3">
              <span>✦ COURSES</span>
            </div>
            <h2 id="pathways-heading" className="text-3xl sm:text-4xl font-black text-espresso-900 tracking-tight">
              Popular Learning Paths
            </h2>
            <p className="text-espresso-muted text-sm sm:text-base max-w-xl mt-1.5 leading-relaxed">
              Industry-relevant curriculum with practical projects and verifiable evidence.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-milan-50 border border-milan-600/25 hover:border-milan-600 text-espresso-900 hover:text-milan-600 text-xs font-bold transition-all whitespace-nowrap self-start md:self-end shadow-sm"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5 text-milan-600" />
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-espresso-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pathways (e.g., Full Stack, React, Python)..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-milan-600/20 rounded-full text-xs font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto bg-white p-1 rounded-full border border-milan-600/20 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-milan-600 text-white shadow-sm'
                  : 'text-espresso-muted hover:text-milan-600'
              }`}
            >
              All ({COURSES.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-milan-600 text-white shadow-sm'
                  : 'text-espresso-muted hover:text-milan-600'
              }`}
            >
              Available Now
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-milan-600 text-white shadow-sm'
                  : 'text-espresso-muted hover:text-milan-600'
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
