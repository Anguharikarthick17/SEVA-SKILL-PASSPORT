'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Code2,
  FolderKanban,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DataService, UserProfile, UserEnrollment, StoredEvidence } from '@/lib/data-service';
import { DEMO_STUDENT } from '@/data';

const QUICK_LINKS = [
  { label: 'Continue Learning', href: '/learning', icon: BookOpen, color: 'bg-blue-600' },
  { label: 'Practice Lab', href: '/practice', icon: Code2, color: 'bg-indigo-600' },
  { label: 'My Projects', href: '/projects', icon: FolderKanban, color: 'bg-violet-600' },
  { label: 'Skill Growth', href: '/skill-growth', icon: TrendingUp, color: 'bg-green-600' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [recentEvidence, setRecentEvidence] = useState<StoredEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await DataService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const enr = await DataService.getUserEnrollment(currentUser.id, 'full-stack-development');
          setEnrollment(enr);
          const evidenceList = await DataService.getUserEvidence(currentUser.id);
          setRecentEvidence(evidenceList.slice(-4).reverse());
        }
      } catch (e) {
        console.error('Failed loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const displayName = user ? user.fullName.split(' ')[0] : 'Learner';
  const courseTitle = 'Full Stack Developer';
  const progressPercent = enrollment ? enrollment.progressPercent : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, {displayName} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Continue where you left off in your skill pathway.</p>
        </div>
        {enrollment ? (
          <Link href="/learning" className="btn-primary whitespace-nowrap" id="dashboard-continue">
            Continue Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link href="/courses" className="btn-primary whitespace-nowrap" id="dashboard-enroll">
            Browse Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Current Course Card or Empty Enrollment Banner */}
      {enrollment ? (
        <div className="bg-passport-gradient rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 hero-pattern pointer-events-none" />
          <div className="relative">
            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Current Course</p>
            <h2 className="text-xl font-bold mb-4">{courseTitle}</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-white/20 rounded-full">
                <div
                  className="h-full bg-saffron-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-saffron-300 font-bold text-sm whitespace-nowrap">{progressPercent}%</span>
            </div>
            <p className="text-blue-200 text-xs">Currently on: Advanced JavaScript (Promises &amp; Event Loop)</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-900">Start your learning journey</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You are not currently enrolled in any active courses. Enroll in our flagship Full Stack Developer programme to begin generating verifiable Skill Passport evidence.
          </p>
          <div className="pt-2">
            <Link href="/courses" className="btn-primary inline-flex items-center gap-2 text-xs">
              Explore Available Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="gov-card flex flex-col items-center text-center gap-3 hover:shadow-gov-md transition-all group"
          >
            <div className={`p-3 rounded-xl ${link.color} group-hover:scale-110 transition-transform duration-200`}>
              <link.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-navy-900">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Skills + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Overview */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-navy-900">Skill Overview</h2>
            <Link href="/skill-growth" className="text-xs text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {DEMO_STUDENT.skills.map((skill) => (
              <SkillBar key={skill.name} name={skill.name} score={skill.score} category={skill.category} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gov-card">
          <h2 className="font-bold text-navy-900 mb-5">Recent Evidence &amp; Activity</h2>
          <div className="space-y-3 mb-6">
            {recentEvidence.length > 0 ? (
              recentEvidence.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-1 rounded bg-slate-100 flex-shrink-0">
                    {a.sourceType === 'challenge' && <Code2 className="w-4 h-4 text-orange-500" />}
                    {a.sourceType === 'lesson' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {a.sourceType === 'project' && <FolderKanban className="w-4 h-4 text-violet-500" />}
                    {a.sourceType === 'assessment' && <Award className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {a.metadata?.title || `${a.skillId.toUpperCase()} ${a.sourceType}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Verified Score: {a.score}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              DEMO_STUDENT.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 flex-1">{a.description}</span>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming Targets</h3>
            {DEMO_STUDENT.upcoming.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100 mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy-900">{u.title}</p>
                  <p className="text-xs text-slate-500">Due: {u.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
