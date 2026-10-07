import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2, AlertCircle, BookOpen, Code2, FolderKanban, TrendingUp } from 'lucide-react';
import SkillBar from '@/components/shared/SkillBar';
import { DEMO_STUDENT } from '@/data';

const QUICK_LINKS = [
  { label: 'Continue Learning', href: '/learning', icon: BookOpen, color: 'bg-blue-600' },
  { label: 'Practice Lab', href: '/practice', icon: Code2, color: 'bg-indigo-600' },
  { label: 'My Projects', href: '/projects', icon: FolderKanban, color: 'bg-violet-600' },
  { label: 'Skill Growth', href: '/skill-growth', icon: TrendingUp, color: 'bg-green-600' },
];

const ACTIVITY_ICON = {
  lesson: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  lab: <Code2 className="w-4 h-4 text-blue-500" />,
  challenge: <AlertCircle className="w-4 h-4 text-orange-500" />,
  project: <FolderKanban className="w-4 h-4 text-violet-500" />,
};

export default function DashboardPage() {
  const student = DEMO_STUDENT;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, {student.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Continue where you left off.</p>
        </div>
        <Link href="/learning" className="btn-primary whitespace-nowrap" id="dashboard-continue">
          Continue Learning
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Current Course Card */}
      <div className="bg-passport-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern pointer-events-none" />
        <div className="relative">
          <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Current Course</p>
          <h2 className="text-xl font-bold mb-4">{student.currentCourse}</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full">
              <div
                className="h-full bg-saffron-400 rounded-full transition-all duration-700"
                style={{ width: `${student.progress}%` }}
              />
            </div>
            <span className="text-saffron-300 font-bold text-sm whitespace-nowrap">{student.progress}%</span>
          </div>
          <p className="text-blue-200 text-xs">Currently on: Advanced JavaScript</p>
        </div>
      </div>

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
            {student.skills.map((skill) => (
              <SkillBar key={skill.name} name={skill.name} score={skill.score} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gov-card">
          <h2 className="font-bold text-navy-900 mb-5">Recent Activity</h2>
          <div className="space-y-3 mb-6">
            {student.recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                {ACTIVITY_ICON[a.type]}
                <span className="text-sm text-slate-700 flex-1">{a.description}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming</h3>
            {student.upcoming.map((u) => (
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
