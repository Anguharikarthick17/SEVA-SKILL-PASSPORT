'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  FlaskConical,
  Rocket,
  Shield,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { COURSES } from '@/data';
import { DataService, UserProfile } from '@/lib/data-service';
import GlowButton from '@/components/ui/GlowButton';
import UnlockPassModal from '@/components/courses/UnlockPassModal';

const FAQ_ITEMS = [
  {
    q: 'How does the ₹100 learning access fee work?',
    a: 'One payment of ₹100 grants you full access to all eligible courses. Full Stack Development is available immediately, and upcoming tracks unlock automatically upon release.',
  },
  {
    q: 'What is the Skill Passport and how is it generated?',
    a: 'As you complete labs, solve practice challenges, and submit capstone projects, your performance generates verified evidence. This evidence continuously builds your competency score and Skill Passport.',
  },
  {
    q: 'How long do I have access to the course?',
    a: 'Your ₹100 pass gives you full access to the curriculum modules, practice labs, and your personal Skill Passport at your own pace.',
  },
];

export default function CourseDetailPage() {
  const course = COURSES[0];
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    DataService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user has active pass
        fetch(`/api/payments/entitlement?userId=${encodeURIComponent(user.id)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.hasAccess) {
              setIsEnrolled(true);
            }
          })
          .catch(() => {});

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
    setShowUnlockModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12]">
      {/* Real ₹100 Unlock Pass Modal */}
      <UnlockPassModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        currentUser={currentUser}
        courseTitle={course.title}
        courseSlug={course.slug}
        onSuccess={() => setIsEnrolled(true)}
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#700F2E] to-[#4C0519] text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/courses" className="text-[#FFE4E6] text-sm hover:underline transition-colors">Courses</Link>
                <ChevronRight className="w-4 h-4 text-white/50" />
                <span className="text-white text-sm font-semibold">Full Stack Development</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Full Stack Developer
              </h1>
              <p className="mt-4 text-lg md:text-xl text-white/90 leading-relaxed">{course.subtitle}</p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-[#FFE4E6]">
                  <BookOpen className="w-4 h-4" />
                  {course.modules.length} Modules ({course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons)
                </span>
                <span className="flex items-center gap-1.5 text-[#FFE4E6]">
                  <Clock className="w-4 h-4" />
                  {course.duration} (Self-paced)
                </span>
                <span className="flex items-center gap-1.5 text-[#CA8A04] font-bold">
                  <Sparkles className="w-4 h-4" />
                  Skill Passport Evidence Track
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white text-[#1C0D12] p-6 rounded-2xl shadow-xl border border-[#881337]/15">
              <div className="text-center pb-4 border-b border-[#881337]/10">
                <span className="text-xs uppercase tracking-wider text-[#6B4E56] font-bold">All-Inclusive Pass</span>
                <div className="text-4xl font-black text-[#881337] mt-1">₹100</div>
                <span className="text-xs text-[#6B4E56] font-medium">One-time payment for all eligible courses</span>
              </div>

              <div className="mt-4 space-y-2 text-xs font-medium text-[#1C0D12]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Full Stack track available immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Hands-on labs & in-browser code runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Capstone projects & verified evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automatic unlock for upcoming courses</span>
                </div>
              </div>

              <div className="mt-6">
                {isEnrolled ? (
                  <GlowButton href="/learning" variant="primary" size="md" className="w-full">
                    Continue Learning <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                ) : (
                  <GlowButton onClick={handleEnrollClick} variant="primary" size="md" className="w-full">
                    Unlock All Courses — ₹100 <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-[#1C0D12] tracking-tight">Curriculum Structure</h2>
        <p className="mt-2 text-sm text-[#6B4E56]">
          12 comprehensive modules structured to build industry-proven competence.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {course.modules.map((m, idx) => (
            <div key={m.id} className="p-6 rounded-2xl bg-white border border-[#881337]/15 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E6] text-[#881337] text-xs font-bold">
                  Module {idx + 1}
                </span>
                <span className="text-xs text-[#6B4E56] font-medium">{m.lessons.length} Lessons</span>
              </div>
              <h3 className="text-base font-bold text-[#1C0D12]">{m.title}</h3>
              <ul className="space-y-1.5 text-xs text-[#6B4E56]">
                {m.lessons.slice(0, 3).map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{l.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-black text-[#1C0D12] tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-4">
          {FAQ_ITEMS.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#881337]/15 shadow-2xs space-y-2">
              <h3 className="text-sm font-bold text-[#1C0D12]">{faq.q}</h3>
              <p className="text-xs text-[#6B4E56] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
