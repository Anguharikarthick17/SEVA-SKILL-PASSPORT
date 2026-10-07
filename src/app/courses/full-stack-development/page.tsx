import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Users, BookOpen, Code2, FlaskConical, Rocket, Shield, ChevronRight, Lock } from 'lucide-react';
import { COURSES } from '@/data';

export const metadata: Metadata = {
  title: 'Full Stack Developer Course',
  description: 'A comprehensive programme building genuine full stack capability through structured learning, hands-on labs, real projects, and evidence-backed assessment.',
};

const WHAT_YOU_LEARN = [
  'Build responsive, accessible web interfaces with HTML, CSS, and JavaScript',
  'Develop dynamic applications with React and modern frontend tooling',
  'Build RESTful APIs with Node.js and Express',
  'Design and query relational databases with SQL and PostgreSQL',
  'Implement secure authentication and authorisation',
  'Use Git and GitHub for version control and collaboration',
  'Write tests and practice test-driven development',
  'Deploy applications to production environments',
];

const FAQ_ITEMS = [
  { q: 'Is this a government-recognised course?', a: 'No. SEVA Skill Passport is a prototype platform. The course and certificate are not government-recognised at this stage.' },
  { q: 'What is the ₹100 fee?', a: 'It is a proposed learning access fee for the prototype platform. It is not a government fee.' },
  { q: 'How long does the course take?', a: 'The proposed duration is 6 months at a recommended pace. Self-paced learning is supported.' },
  { q: 'What happens after completing the course?', a: 'You receive a course completion credential and your Skill Passport is generated based on your evidence across all modules.' },
];

export default function FullStackCoursePage() {
  const course = COURSES.find((c) => c.slug === 'full-stack-development')!;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link href="/courses" className="text-blue-300 text-sm hover:text-white transition-colors">Courses</Link>
                <ChevronRight className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Full Stack Development</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Full Stack Developer
              </h1>
              <p className="mt-4 text-xl text-blue-100 leading-relaxed">{course.subtitle}</p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-blue-200">
                  <BookOpen className="w-4 h-4" />
                  {course.level}
                </span>
                <span className="flex items-center gap-1.5 text-blue-200">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5 text-blue-200">
                  <Users className="w-4 h-4" />
                  {course.enrolled.toLocaleString('en-IN')} enrolled
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {course.format.map((f) => (
                  <span key={f} className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="bg-white rounded-2xl shadow-passport p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-black text-navy-900">₹{course.price}</p>
                <p className="text-slate-500 text-sm mt-1">Proposed learning access price</p>
                <p className="text-xs text-slate-400 mt-0.5">Not a government fee</p>
              </div>
              <Link
                href="/register"
                className="w-full btn-primary justify-center text-base py-3.5"
                id="course-enroll-btn"
              >
                Enroll Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                {[
                  'Full access to 12 modules',
                  'AI Learning Assistant',
                  'Coding labs & challenges',
                  'Project workspace',
                  'Skill Passport generation',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-8">What You&apos;ll Learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_YOU_LEARN.map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-8">Curriculum</h2>
          <div className="space-y-3">
            {course.modules.map((mod) => (
              <div key={mod.id} className="gov-card flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
                  mod.status === 'completed' ? 'bg-green-100' :
                  mod.status === 'current' ? 'bg-navy-100' : 'bg-slate-100'
                }`}>
                  {mod.status === 'locked' ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : mod.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-navy-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">MODULE {mod.number}</span>
                  </div>
                  <p className="font-semibold text-navy-900 text-sm">{mod.title}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  mod.status === 'completed' ? 'bg-green-100 text-green-700' :
                  mod.status === 'current' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {mod.status === 'completed' ? '✓ Completed' :
                   mod.status === 'current' ? '→ Current' : 'Locked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill tags */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-navy-900 mb-5">Skills in This Pathway</h2>
          <div className="flex flex-wrap gap-2">
            {course.skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 bg-navy-50 text-navy-700 text-sm font-medium rounded-lg border border-navy-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="gov-card">
                <h3 className="font-bold text-navy-900 mb-2">{item.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-hero-gradient">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build your skills?</h2>
          <p className="text-blue-100 mb-8">Enrol in the Full Stack Developer pathway and start building evidence-backed ability.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-bold rounded-lg hover:bg-blue-50 transition-all text-lg" id="course-bottom-enroll">
            Enroll Now — ₹100
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
