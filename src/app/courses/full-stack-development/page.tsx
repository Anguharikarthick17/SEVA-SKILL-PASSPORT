'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  Code2,
  FlaskConical,
  Rocket,
  Shield,
  ChevronRight,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { COURSES } from '@/data';
import { DataService } from '@/lib/data-service';

const FAQ_ITEMS = [
  {
    q: 'How does the ₹100 learning access fee work?',
    a: 'The ₹100 is a proposed platform learning access fee. In this prototype phase, it is a simulation of the payment process. No real money is collected.',
  },
  {
    q: 'What is the Skill Passport and how is it generated?',
    a: 'As you complete labs, solve practice challenges, and submit projects, your performance generates evidence. This evidence continuously builds your competency score and Skill Passport.',
  },
  {
    q: 'Is this an official government course or exam?',
    a: 'No. SEVA Skill Passport is a proposed platform for the SEVA Hackathon. It is not an official government platform and does not administer government examinations.',
  },
  {
    q: 'How long do I have access to the course?',
    a: 'Once enrolled in the proposed platform, learners have lifetime access to the curriculum and their personal Skill Passport.',
  },
];

export default function CourseDetailPage() {
  const course = COURSES[0];
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    DataService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        DataService.getUserEnrollment(user.id, course.id).then((enr) => {
          if (enr && enr.status === 'active') {
            setIsEnrolled(true);
          }
        });
      }
    });
  }, [course.id]);

  const handleEnrollClick = () => {
    if (!currentUser) {
      window.location.href = `/login?redirect=/courses/${course.slug}`;
      return;
    }
    if (isEnrolled) {
      window.location.href = '/learning';
      return;
    }
    setShowEnrollModal(true);
  };

  const handleConfirmEnrollment = async () => {
    if (!currentUser) return;
    setEnrolling(true);
    try {
      await DataService.enrollInCourse(currentUser.id, course.id);
      setIsEnrolled(true);
      setShowEnrollModal(false);
      window.location.href = '/learning';
    } catch (e) {
      console.error(e);
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Demo Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-navy-900">
              <Shield className="w-6 h-6 text-saffron-600" />
              <h3 className="text-lg font-bold">Prototype Course Enrollment</h3>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Prototype Learning Access — ₹100
              </span>
              <p>
                In this SEVA Hackathon demonstration, enrollment is simulated. No actual financial transaction will take place.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Programme:</span>
                <span className="font-bold text-navy-900">{course.title}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Access Fee:</span>
                <span className="font-bold text-navy-900">₹{course.price}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Enrolling Candidate:</span>
                <span className="font-bold text-navy-900">{currentUser?.fullName}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="flex-1 btn-outline text-xs justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnrollment}
                disabled={enrolling}
                className="flex-1 btn-primary text-xs justify-center"
              >
                {enrolling ? 'Confirming…' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
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

              <button
                onClick={handleEnrollClick}
                className="w-full btn-primary justify-center text-base py-3.5 flex items-center gap-2"
                id="course-enroll-btn"
              >
                {isEnrolled ? (
                  <>
                    <span>Go to My Learning</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Enroll Now — ₹100</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

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

              <p className="text-xs text-slate-400 text-center mt-5">
                Demonstration platform · Simulated access fee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you will learn */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-4">What You Will Learn &amp; Build</h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">
            This programme is structured around active competency development. You don&apos;t just watch lectures — you write code, solve challenges, complete labs, and build production-style projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Structured Learning',
                desc: '12 progressive modules covering web fundamentals through deployment, with video lessons and AI-assisted clarification.',
              },
              {
                icon: FlaskConical,
                title: 'Hands-on Labs',
                desc: 'Guided practical exercises where you apply what you have learned in controlled coding environments.',
              },
              {
                icon: Code2,
                title: 'Practice Challenges',
                desc: 'Graded coding challenges that test specific skills and generate verifiable evidence for your passport.',
              },
              {
                icon: Rocket,
                title: 'Capstone Projects',
                desc: 'Multi-feature full stack applications reviewed against production rubrics including code quality and security.',
              },
              {
                icon: Shield,
                title: 'Competency Scoring',
                desc: 'Evidence from all activities feeds into an ongoing competency score that employers can verify.',
              },
              {
                icon: CheckCircle2,
                title: 'Skill Passport',
                desc: 'A permanent digital record of what you can actually do, backed by auditable evidence.',
              },
            ].map((f) => (
              <div key={f.title} className="gov-card flex items-start gap-4">
                <div className="p-2.5 bg-navy-50 rounded-xl flex-shrink-0">
                  <f.icon className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-1">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 bg-gov-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-4">Course Curriculum</h2>
          <p className="text-slate-600 mb-8">12 comprehensive modules designed to take you from fundamentals to production readiness.</p>
          <div className="space-y-3">
            {course.modules.map((m) => (
              <div key={m.id} className="gov-card flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-slate-400 w-8">{m.number}</span>
                  <span className="font-semibold text-navy-900">{m.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {m.status === 'completed' && (
                    <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                  {m.status === 'current' && (
                    <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                      In Progress
                    </span>
                  )}
                  {m.status === 'locked' && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>
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
          <button
            onClick={handleEnrollClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-bold rounded-lg hover:bg-blue-50 transition-all text-lg"
            id="course-bottom-enroll"
          >
            {isEnrolled ? 'Go to My Learning' : 'Enroll Now — ₹100'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
