'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
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
  Calendar,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Check,
  Bell,
} from 'lucide-react';
import { COURSES } from '@/data';
import { DataService, UserProfile } from '@/lib/data-service';
import GlowButton from '@/components/ui/GlowButton';
import UnlockPassModal from '@/components/courses/UnlockPassModal';

const FAQ_ITEMS = [
  {
    q: 'How does the ₹100 learning access offer work?',
    a: 'One single payment of ₹100 grants you access to all eligible courses on SEVA. Active courses are available immediately; upcoming courses automatically unlock for you upon official release with no extra charge.',
  },
  {
    q: 'What is the Skill Passport and how is it generated?',
    a: 'As you complete labs, solve practice challenges, and submit capstone projects, your performance generates cryptographically hashed evidence. This builds your verifiable competency score and digital passport.',
  },
  {
    q: 'How long do I have access to the courses?',
    a: 'Your ₹100 pass gives you full access to all curriculum modules, lab runners, and assessments at your own pace.',
  },
];

export default function CourseSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // 1. Locate course in real catalog
  const course = COURSES.find((c) => c.slug === slug);

  // Genuinely invalid slug -> 404
  if (!course) {
    notFound();
  }

  const isActive = course.status === 'active';
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasPass, setHasPass] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [notified, setNotified] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  useEffect(() => {
    DataService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user has active pass or enrollment
        fetch(`/api/payments/entitlement?userId=${encodeURIComponent(user.id)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.hasAccess) {
              setHasPass(true);
            }
          })
          .catch(() => {});

        DataService.getUserEnrollment(user.id, course.id).then((enr) => {
          if (enr && enr.status === 'active') {
            setHasPass(true);
          }
        });
      }
    });
  }, [course.id]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      setNotified(true);
    }
  };

  const getCourseIcon = () => {
    if (course.slug.includes('data')) return <Database className="w-8 h-8 text-[#881337]" />;
    if (course.slug.includes('ai') || course.slug.includes('machine')) return <Cpu className="w-8 h-8 text-[#881337]" />;
    if (course.slug.includes('cyber') || course.slug.includes('security')) return <ShieldCheck className="w-8 h-8 text-[#881337]" />;
    return <Code2 className="w-8 h-8 text-[#881337]" />;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12]">
      {/* ₹100 Unlock Pass Modal */}
      <UnlockPassModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        currentUser={currentUser}
        courseTitle={course.title}
        courseSlug={course.slug}
        onSuccess={() => setHasPass(true)}
      />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-[#881337]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-[#6B4E56]">
          <Link href="/courses" className="hover:text-[#881337] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B4E56]/40" />
          <span className="text-[#1C0D12] font-bold truncate max-w-xs">{course.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFE4E6]/25 to-[#FFFDF7] py-12 sm:py-16 border-b border-[#881337]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-center">
            {/* Left 2 Cols: Course Overview */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#881337]/20 text-xs font-bold uppercase tracking-wider">
                  {course.level || 'Engineering Pathway'}
                </span>

                {isActive ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available Now
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#881337]/30 text-xs font-bold uppercase tracking-wider">
                    ✦ Coming Soon
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-white text-[#6B4E56] border border-[#881337]/15 text-xs font-semibold">
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C0D12] tracking-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-[#6B4E56] max-w-2xl leading-relaxed">
                {course.subtitle}
              </p>

              {/* Skills covered */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B4E56]">
                  {isActive ? 'Verified Competencies Covered:' : 'Planned Competencies:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-white border border-[#881337]/15 text-xs font-semibold text-[#1C0D12] shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Access & Pricing Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-[#881337]/20 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#881337]/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] border border-[#881337]/20 flex items-center justify-center">
                  {getCourseIcon()}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#6B4E56] uppercase tracking-wider block">
                    All-Inclusive Access
                  </span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-black text-[#881337]">₹100</span>
                    <span className="text-xs text-[#6B4E56] font-bold">INR</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#1C0D12]">
                <div className="flex items-center justify-between py-1 border-b border-[#881337]/5">
                  <span className="text-[#6B4E56]">Estimated Duration:</span>
                  <span className="font-bold">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#881337]/5">
                  <span className="text-[#6B4E56]">Status:</span>
                  <span className="font-bold text-[#881337]">
                    {isActive ? 'Active Curriculum' : 'In Curriculum Development'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#881337]/5">
                  <span className="text-[#6B4E56]">Eligible Courses Included:</span>
                  <span className="font-bold">All 6 Tracks</span>
                </div>
              </div>

              {isActive ? (
                hasPass ? (
                  <GlowButton href="/learning" variant="primary" size="md" className="w-full">
                    Enter Classroom <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                ) : (
                  <GlowButton
                    onClick={() => setShowUnlockModal(true)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Unlock All Courses — ₹100 <ArrowRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                )
              ) : (
                <div className="space-y-3">
                  <GlowButton
                    onClick={() => setShowUnlockModal(true)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Unlock All Courses — ₹100
                  </GlowButton>
                  <p className="text-[10px] text-[#6B4E56] text-center leading-tight">
                    Pre-unlocks this course. Immediate access granted to Full Stack Development today.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {isActive ? (
          /* Available Course: Curriculum & Modules */
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-black text-[#1C0D12] tracking-tight">
                Curriculum Structure
              </h2>
              <p className="text-sm text-[#6B4E56] mt-1">
                {course.modules?.length || 0} rigorous modules designed for competency-driven skill verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.modules?.map((module, idx) => (
                <div
                  key={module.id}
                  className="p-5 rounded-2xl bg-white border border-[#881337]/15 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E6] text-[#881337] text-[10px] font-bold">
                      Module {idx + 1}
                    </span>
                    <span className="text-xs text-[#6B4E56] font-medium">
                      {module.lessons?.length || 0} Lessons
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1C0D12]">
                    {module.title}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#6B4E56]">
                    {module.lessons?.slice(0, 3).map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Coming Soon Course Detail State */
          <div className="space-y-12">
            {/* Branded Coming Soon Notice Card */}
            <div className="rounded-3xl bg-white p-8 sm:p-10 border border-[#881337]/20 shadow-lg text-center space-y-6 max-w-3xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFE4E6] border border-[#881337]/20 flex items-center justify-center">
                {getCourseIcon()}
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#881337]/30 text-xs font-bold uppercase tracking-wider">
                  ✦ In Production
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1C0D12] tracking-tight">
                  {course.title} is Coming Soon
                </h2>
                <p className="text-sm sm:text-base text-[#6B4E56] max-w-xl mx-auto leading-relaxed">
                  Our curriculum committee and engineering mentors are currently authoring the hands-on lab challenges, code runner test suites, and capstone project rubrics for this track.
                </p>
              </div>

              {/* Planned Learning Outcomes */}
              <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 text-left space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#881337]">
                  Planned Learning Outcomes & Core Skills:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#1C0D12]">
                  {course.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#CA8A04] flex-shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest Notify Me Registration */}
              <div className="pt-2 max-w-md mx-auto">
                {notified ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Thank you! We have registered your notification request.
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-2">
                    <p className="text-xs font-semibold text-[#6B4E56]">
                      Want an alert when the {course.title} labs go live?
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#FFFDF7] border border-[#881337]/20 rounded-full text-xs text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
                      />
                      <GlowButton type="submit" variant="primary" size="sm">
                        <Bell className="w-3.5 h-3.5 mr-1" />
                        Notify Me
                      </GlowButton>
                    </div>
                  </form>
                )}
              </div>

              {/* Action: Explore Available Courses */}
              <div className="pt-4 border-t border-[#881337]/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <GlowButton href="/courses" variant="glass" size="md">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Explore Available Courses
                </GlowButton>
                <GlowButton
                  onClick={() => setShowUnlockModal(true)}
                  variant="primary"
                  size="md"
                >
                  Unlock All Courses — ₹100
                </GlowButton>
              </div>
            </div>
          </div>
        )}

        {/* Common Course FAQ Section */}
        <section className="mt-16 pt-12 border-t border-[#881337]/15">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#1C0D12] tracking-tight text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#881337]/15 shadow-2xs space-y-2"
                >
                  <h3 className="text-sm font-bold text-[#1C0D12]">{item.q}</h3>
                  <p className="text-xs text-[#6B4E56] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
