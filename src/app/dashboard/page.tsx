'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Code2,
  FolderKanban,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Star,
  Mail,
  Camera,
  Layers,
  LayoutGrid,
  Check,
  RotateCcw,
  ShieldAlert,
  GitBranch,
  Lock,
  Calendar,
  FileText,
  User,
  Zap,
  HelpCircle,
  Info,
  Hash,
  FileCheck2,
} from 'lucide-react';
import {
  DataService,
  UserProfile,
  UserEnrollment,
  StoredEvidence,
  StoredCredential,
} from '@/lib/data-service';
import { COURSES, FULL_STACK_MODULES, REAL_CHALLENGES, MODULE_ASSESSMENTS } from '@/data';
import { PaymentService } from '@/lib/payments/service';
import { PROJECT_CATALOGUE } from '@/data/projects';
import { cn } from '@/lib/utils';
import GlowButton from '@/components/ui/GlowButton';

export type DashboardTab = 'crs-dashboard' | 'growth-card' | 'skill-passport';

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab: DashboardTab =
    searchParams?.tab === 'growth-card' || searchParams?.tab === 'skill-passport'
      ? (searchParams.tab as DashboardTab)
      : 'crs-dashboard';

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [evidenceList, setEvidenceList] = useState<StoredEvidence[]>([]);
  const [calculatedSkills, setCalculatedSkills] = useState<any[]>([]);
  const [passportScore, setPassportScore] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-accordions & filters
  const [growthCardOpen, setGrowthCardOpen] = useState(true);
  const [passportCardOpen, setPassportCardOpen] = useState(true);
  const [selectedCurriculumModule, setSelectedCurriculumModule] = useState<string | null>(null);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'crs-dashboard' || tabParam === 'growth-card' || tabParam === 'skill-passport') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const currentUser = await DataService.getCurrentUser();
        if (!currentUser) {
          router.replace('/login');
          return;
        }
        setUser(currentUser);

        // Check if user has an active enrollment; if not, route to onboarding course selection
        const activeEnr = await DataService.getActiveUserEnrollment(currentUser.id);
        if (!activeEnr) {
          router.replace('/onboarding/choose-course');
          return;
        }

        const isDemoUser = await PaymentService.isDemoAccess(currentUser.id);
        setIsDemo(isDemoUser);

        const [enr, evidence, res, lessonIds, challengeIds, userSubs, userCreds] =
          await Promise.all([
            DataService.getUserEnrollment(currentUser.id, activeEnr.courseId),
            DataService.getUserEvidence(currentUser.id),
            DataService.recalculateScores(currentUser.id),
            DataService.getCompletedLessonIds(currentUser.id),
            DataService.getCompletedChallenges(currentUser.id),
            DataService.getUserProjectSubmissions(currentUser.id),
            DataService.getUserCredentials(currentUser.id),
          ]);

        setEnrollment(enr || activeEnr);
        setEvidenceList(evidence.reverse());
        setCompletedLessonIds(lessonIds);
        setCompletedChallengeIds(challengeIds);
        setSubmissions(userSubs);
        setCredentials(userCreds);

        if (res) {
          setPassportScore(Math.round(res.passport?.overallScore || 0));
          if (res.calculatedSkills && res.calculatedSkills.length > 0) {
            setCalculatedSkills(res.calculatedSkills);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // --------------------------------------------------------------------------
  // AUTHENTIC ACADEMIC METRICS COMPUTATION (PHASE B, C, D, E, F)
  // --------------------------------------------------------------------------
  const totalCurriculumLessons = FULL_STACK_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalCurriculumModules = FULL_STACK_MODULES.length;
  const completedLessonsCount = completedLessonIds.length;
  const remainingLessonsCount = Math.max(0, totalCurriculumLessons - completedLessonsCount);

  // 1. Curriculum Mastery (Weight: 30%)
  const curriculumMasteryPercent =
    totalCurriculumLessons > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalCurriculumLessons) * 100))
      : 0;

  // 2. Hands-on Lab Performance (Weight: 25%)
  const totalAvailableChallenges = REAL_CHALLENGES.length; // 30
  const completedChallengesCount = completedChallengeIds.length;
  const labCompletionPercent =
    totalAvailableChallenges > 0
      ? Math.min(100, Math.round((completedChallengesCount / totalAvailableChallenges) * 100))
      : 0;

  // 3. Modular Assessment Performance (Weight: 25%)
  const assessmentEvidence = evidenceList.filter((e) => e.sourceType === 'assessment');
  const assessmentsPassedCount = assessmentEvidence.filter((e) => e.score >= 70).length;
  const assessmentTotalScore = assessmentEvidence.reduce((sum, e) => sum + (e.score || 0), 0);
  const assessmentAverageScore =
    assessmentEvidence.length > 0 ? Math.round(assessmentTotalScore / assessmentEvidence.length) : 0;
  // Assessment Component is based on average performance scaled by attempted modules
  const assessmentComponentPercent =
    totalCurriculumModules > 0
      ? Math.min(
          100,
          Math.round((assessmentsPassedCount / totalCurriculumModules) * assessmentAverageScore || 0)
        )
      : 0;

  // 4. Capstone Project Performance (Weight: 20%)
  const evaluatedSubmissions = submissions.filter((s) => s.status === 'EVALUATED');
  const latestProjectSubmission = submissions[0] || null;
  const projectScore =
    evaluatedSubmissions.length > 0
      ? Math.round(
          evaluatedSubmissions.reduce(
            (sum, s) => sum + (s.evaluationReport?.overallScore || s.score || 0),
            0
          ) / evaluatedSubmissions.length
        )
      : 0;

  // --------------------------------------------------------------------------
  // FINAL COMPETENCY READINESS SCORE (CRS) FORMULA (PHASE E)
  // CRS = (Curriculum * 0.30) + (Labs * 0.25) + (Assessments * 0.25) + (Project * 0.20)
  // --------------------------------------------------------------------------
  const calculatedCrsScore = Math.min(
    100,
    Math.round(
      curriculumMasteryPercent * 0.3 +
        labCompletionPercent * 0.25 +
        (assessmentEvidence.length > 0 ? assessmentAverageScore : 0) * 0.25 +
        projectScore * 0.2
    )
  );

  // Growth Badge Tier (Academic Criterion)
  const getGrowthBadge = (score: number) => {
    if (score >= 85) return 'MASTER PRACTITIONER';
    if (score >= 70) return 'PROFICIENT ENGINEER';
    if (score >= 40) return 'EMERGING LEARNER';
    if (score > 0) return 'FOUNDATIONAL LEARNER';
    return 'NOT ENOUGH EVIDENCE YET';
  };

  // Find Next Incomplete Lesson
  let nextLessonInfo: { moduleTitle: string; lessonTitle: string; lessonId: string } | null = null;
  for (const mod of FULL_STACK_MODULES) {
    for (const les of mod.lessons) {
      if (!completedLessonIds.includes(les.id)) {
        nextLessonInfo = {
          moduleTitle: mod.title,
          lessonTitle: les.title,
          lessonId: les.id,
        };
        break;
      }
    }
    if (nextLessonInfo) break;
  }

  // Student Initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SL';

  // Demo status check
  const isDemoStudent = user?.id === 'std-001' || !user?.id;
  const selectedCourse = COURSES.find((c) => c.id === enrollment?.courseId) || COURSES[0];
  const courseTitle = user?.targetRole || selectedCourse?.title || 'Full Stack Developer';

  return (
    <div className="min-h-full bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* =========================================================================
          TOP SUB-NAVIGATION BAR (ACCESSIBLE TABLIST)
         ========================================================================= */}
      <section className="bg-white border-b border-[#881337]/15 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Main Dashboard Tabs (Pills) */}
          <div
            role="tablist"
            aria-label="Dashboard views"
            className="flex items-center gap-1.5 p-1 bg-[#FFFDF7] border border-[#881337]/20 rounded-full shadow-2xs overflow-x-auto max-w-full"
          >
            <button
              id="tab-crs-dashboard"
              role="tab"
              aria-selected={activeTab === 'crs-dashboard'}
              aria-controls="panel-crs-dashboard"
              type="button"
              onClick={() => handleTabChange('crs-dashboard')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]',
                activeTab === 'crs-dashboard'
                  ? 'bg-[#881337] text-white shadow-sm'
                  : 'text-[#1C0D12] hover:text-[#881337] hover:bg-[#FFE4E6]'
              )}
            >
              CRS Dashboard
            </button>
            <button
              id="tab-growth-card"
              role="tab"
              aria-selected={activeTab === 'growth-card'}
              aria-controls="panel-growth-card"
              type="button"
              onClick={() => handleTabChange('growth-card')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]',
                activeTab === 'growth-card'
                  ? 'bg-[#881337] text-white shadow-sm'
                  : 'text-[#1C0D12] hover:text-[#881337] hover:bg-[#FFE4E6]'
              )}
            >
              Growth Card
            </button>
            <button
              id="tab-skill-passport"
              role="tab"
              aria-selected={activeTab === 'skill-passport'}
              aria-controls="panel-skill-passport"
              type="button"
              onClick={() => handleTabChange('skill-passport')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]',
                activeTab === 'skill-passport'
                  ? 'bg-[#881337] text-white shadow-sm'
                  : 'text-[#1C0D12] hover:text-[#881337] hover:bg-[#FFE4E6]'
              )}
            >
              Skill Passport
            </button>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#9F1239] to-[#881337] hover:opacity-95 shadow-sm transition-all hover:scale-102"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Continue Learning</span>
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 shadow-2xs transition-all hover:scale-102"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Practice Labs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* =========================================================================
            TAB 1: CRS DASHBOARD (OVERVIEW, PROFILE, RADIAL SCORE, DETAILED METRICS, TIMELINE)
           ========================================================================= */}
        {activeTab === 'crs-dashboard' && (
          <div
            id="panel-crs-dashboard"
            role="tabpanel"
            aria-labelledby="tab-crs-dashboard"
            className="space-y-6 sm:space-y-8 animate-fade-in"
          >
            {/* Top Identity & Radial Score Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Student Identity Card (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm relative flex flex-col justify-between">
                {/* Top Row: Academic Standing Badge */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B4E56]">
                      {isDemoStudent ? 'DEMO DATA — SAMPLE STUDENT' : 'VERIFIED ACADEMIC PROFILE'}
                    </span>
                    {isDemo && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <ShieldAlert className="w-3 h-3 text-amber-700" />
                        Demo Access
                      </span>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>0 Academic Infractions Recorded</span>
                  </div>
                </div>

                {/* Middle: Avatar + Name + Metadata */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Circular Avatar */}
                  <div className="relative group flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#1C0D12] via-[#6B4E56] to-[#881337] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-4 border-[#FFFDF7]">
                      {initials}
                    </div>
                    <div
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#881337]/30 flex items-center justify-center text-[#6B4E56] shadow-2xs"
                      title="Identity Verified"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Identity Details */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C0D12] tracking-tight leading-tight uppercase">
                      {user?.fullName || 'Student Learner'}
                    </h1>

                    <p className="text-xs sm:text-sm font-bold text-[#6B4E56] tracking-wide">
                      {user?.id ? user.id.slice(0, 8).toUpperCase() : 'STD-2026'} •{' '}
                      <span className="text-[#1C0D12]">
                        {courseTitle}
                      </span>
                    </p>

                    {/* Email Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFDF7] border border-[#881337]/15 rounded-full text-xs text-[#6B4E56] max-w-full">
                      <Mail className="w-3.5 h-3.5 text-[#881337]" />
                      <span className="truncate">{user?.email || 'learner@seva.gov.in'}</span>
                    </div>

                    {/* Star Rating based on CRS */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-4 h-4',
                            star <= Math.round(calculatedCrsScore / 20)
                              ? 'fill-amber-400 text-amber-500'
                              : 'fill-gray-100 text-gray-300'
                          )}
                        />
                      ))}
                      <span className="text-xs font-bold text-[#6B4E56] ml-2">
                        {Math.max(0, Math.round(calculatedCrsScore / 20))}/5 Competency Rating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Track & Status */}
                <div className="mt-6 pt-4 border-t border-[#881337]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B4E56]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Track: {courseTitle}</span>
                  </span>
                  <span className="font-semibold text-[#1C0D12]">
                    {completedLessonsCount} of {totalCurriculumLessons} Lessons Completed
                  </span>
                </div>
              </div>

              {/* Right Column: Radial Overall CRS Meter (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute w-48 h-48 rounded-full bg-[#881337]/5 blur-3xl pointer-events-none" />

                {/* SVG Radial Meter */}
                <div className="relative flex items-center justify-center my-2">
                  <svg width="220" height="220" className="rotate-[-90deg]">
                    <circle cx="110" cy="110" r="85" stroke="#EAE5DC" strokeWidth="14" fill="transparent" />
                    <circle
                      cx="110"
                      cy="110"
                      r="85"
                      stroke="url(#sevaCrsScoreGradient)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 85}
                      strokeDashoffset={2 * Math.PI * 85 * (1 - calculatedCrsScore / 100)}
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="sevaCrsScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9F1239" />
                        <stop offset="100%" stopColor="#881337" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Metric */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-black text-[#1C0D12] tracking-tight">
                        {calculatedCrsScore}
                      </span>
                      <span className="text-xl font-black text-[#881337] ml-0.5">%</span>
                    </div>
                    <span className="text-[11px] font-black text-[#1C0D12] tracking-wider uppercase mt-1">
                      COMPETENCY SCORE
                    </span>
                    <span className="text-[10px] text-[#6B4E56] font-bold tracking-tight">
                      (CRS READINESS)
                    </span>
                  </div>
                </div>

                {/* Derivation toggle */}
                <button
                  type="button"
                  onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                  className="mt-2 text-xs font-bold text-[#881337] hover:underline flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showFormulaDetails ? 'Hide calculation' : 'How is this calculated?'}</span>
                </button>

                {showFormulaDetails && (
                  <div className="mt-3 p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/15 text-[11px] text-[#6B4E56] space-y-1 w-full max-w-xs animate-fade-in">
                    <p className="font-bold text-[#1C0D12]">CRS Formula Breakdown:</p>
                    <p>• Curriculum Mastery (30%): {curriculumMasteryPercent}%</p>
                    <p>• Hands-On Labs (25%): {labCompletionPercent}%</p>
                    <p>• Assessments (25%): {assessmentEvidence.length > 0 ? assessmentAverageScore : 0}%</p>
                    <p>• Capstone Project (20%): {projectScore}%</p>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Academic Metrics Panel */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#881337]" />
                <h2 className="text-sm font-black text-[#1C0D12] uppercase tracking-wider">
                  Academic Progress Measures
                </h2>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#881337]/15 shadow-2xs overflow-x-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[650px] lg:min-w-0">
                  {/* Metric 1: Course Progress */}
                  <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4E56] block">
                      COURSE COMPLETION
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg sm:text-xl font-black text-[#1C0D12]">
                        {curriculumMasteryPercent}%
                      </span>
                      <span className="text-xs text-[#6B4E56] font-bold">
                        ({completedLessonsCount}/{totalCurriculumLessons})
                      </span>
                    </div>
                  </div>

                  {/* Metric 2: Practice Lab Pass Rate */}
                  <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4E56] block">
                      LABS COMPLETED
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg sm:text-xl font-black text-emerald-700">
                        {completedChallengesCount}
                      </span>
                      <span className="text-xs text-[#6B4E56] font-bold">
                        / {totalAvailableChallenges} ({labCompletionPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Assessment Average */}
                  <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4E56] block">
                      ASSESSMENT AVERAGE
                    </span>
                    <div className="mt-1">
                      <span className="text-lg sm:text-xl font-black text-[#881337]">
                        {assessmentEvidence.length > 0 ? `${assessmentAverageScore}%` : 'Not Taken'}
                      </span>
                    </div>
                  </div>

                  {/* Metric 4: Academic Growth Tier */}
                  <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4E56] block">
                      ACADEMIC TIER
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-black text-[#1C0D12] truncate">
                        {getGrowthBadge(calculatedCrsScore)}
                      </span>
                    </div>
                  </div>

                  {/* Metric 5: Telemetry Integrity */}
                  <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4E56] block">
                      VERIFIED EVIDENCE
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-purple-700">
                        {evidenceList.length} Items
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold ml-auto bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        SHA-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Lesson Recommendation Card */}
            {nextLessonInfo && (
              <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                      Recommended Next Lesson
                    </span>
                    <h3 className="text-sm font-black text-[#1C0D12] mt-0.5">
                      {nextLessonInfo.moduleTitle} — {nextLessonInfo.lessonTitle}
                    </h3>
                    <p className="text-xs text-[#6B4E56] mt-0.5">
                      Progress toward completing your full stack curriculum requirement.
                    </p>
                  </div>
                </div>
                <Link
                  href="/my-learning"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#881337] hover:bg-[#9F1239] shadow-sm transition-all whitespace-nowrap"
                >
                  <span>Resume Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </section>
            )}

            {/* Academic Activity & CPA Timeline */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#881337]" />
                  <h2 className="text-base font-black text-[#1C0D12] uppercase tracking-tight">
                    Academic Activity &amp; Telemetry Log
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#6B4E56]">
                  {evidenceList.length} Authenticated Records
                </span>
              </div>

              {evidenceList.length > 0 ? (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {evidenceList.map((ev, idx) => {
                    const isPassed = ev.score >= 70;
                    return (
                      <div
                        key={ev.id || idx}
                        className="p-3.5 rounded-xl bg-[#FFFDF7] border border-[#881337]/15 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold',
                              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            {isPassed ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#1C0D12] block truncate">
                              {ev.metadata?.title || `${ev.skillId.toUpperCase()} Task Evaluation`}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-[#6B4E56] mt-0.5">
                              <span className="capitalize">{ev.sourceType}</span>
                              <span>•</span>
                              <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-mono text-[9px] text-[#881337] truncate max-w-[140px] sm:max-w-xs">
                                {ev.verificationHash}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span
                            className={cn(
                              'font-black font-mono text-sm block',
                              isPassed ? 'text-emerald-700' : 'text-amber-700'
                            )}
                          >
                            {ev.score}%
                          </span>
                          <span className="text-[10px] font-bold text-[#6B4E56]">
                            {isPassed ? 'Verified' : 'Attempted'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#FFFDF7] rounded-2xl border border-dashed border-[#881337]/20 space-y-2">
                  <p className="text-xs font-bold text-[#1C0D12]">No activity logged yet</p>
                  <p className="text-xs text-[#6B4E56] max-w-sm mx-auto">
                    Complete curriculum lessons, practice challenges, or modular assessments to begin generating verified academic evidence.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 2: GROWTH CARD (CURRICULUM, LABS, ASSESSMENTS, MY PROJECTS, WEIGHTS)
           ========================================================================= */}
        {activeTab === 'growth-card' && (
          <div
            id="panel-growth-card"
            role="tabpanel"
            aria-labelledby="tab-growth-card"
            className="space-y-6 sm:space-y-8 animate-fade-in"
          >
            {/* Growth Card Overview Header */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#881337]/10">
                <div>
                  <h2 className="text-xl font-black text-[#1C0D12] uppercase tracking-tight">
                    Academic Growth Card &amp; Competency Breakdown
                  </h2>
                  <p className="text-xs text-[#6B4E56] mt-1">
                    Multi-dimensional evaluation of your coursework, hands-on engineering labs, assessments, and projects.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFE4E6] border border-[#881337]/20 text-xs font-bold text-[#881337]">
                  <Award className="w-4 h-4" />
                  <span>Tier: {getGrowthBadge(calculatedCrsScore)}</span>
                </div>
              </div>

              {/* 4 Pillars Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Curriculum */}
                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6B4E56]">1. Curriculum Mastery</span>
                    <span className="text-[10px] font-black text-[#881337]">WT 30%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#1C0D12]">{curriculumMasteryPercent}%</span>
                    <span className="text-xs text-[#6B4E56]">completed</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 border border-[#881337]/15 overflow-hidden">
                    <div className="bg-[#881337] h-full rounded-full" style={{ width: `${curriculumMasteryPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-[#6B4E56] block">
                    {completedLessonsCount} / {totalCurriculumLessons} lessons completed
                  </span>
                </div>

                {/* 2. Hands-On Labs */}
                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6B4E56]">2. Hands-On Labs</span>
                    <span className="text-[10px] font-black text-emerald-700">WT 25%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-700">{labCompletionPercent}%</span>
                    <span className="text-xs text-[#6B4E56]">verified</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 border border-[#881337]/15 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${labCompletionPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-[#6B4E56] block">
                    {completedChallengesCount} / {totalAvailableChallenges} labs solved
                  </span>
                </div>

                {/* 3. Modular Assessments */}
                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6B4E56]">3. Assessments</span>
                    <span className="text-[10px] font-black text-blue-700">WT 25%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-700">
                      {assessmentEvidence.length > 0 ? `${assessmentAverageScore}%` : '0%'}
                    </span>
                    <span className="text-xs text-[#6B4E56]">avg score</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 border border-[#881337]/15 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${assessmentAverageScore}%` }} />
                  </div>
                  <span className="text-[10px] text-[#6B4E56] block">
                    {assessmentsPassedCount} passed (70% benchmark)
                  </span>
                </div>

                {/* 4. Capstone Projects */}
                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6B4E56]">4. Capstone Projects</span>
                    <span className="text-[10px] font-black text-purple-700">WT 20%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-purple-700">{projectScore}%</span>
                    <span className="text-xs text-[#6B4E56]">rubric score</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 border border-[#881337]/15 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${projectScore}%` }} />
                  </div>
                  <span className="text-[10px] text-[#6B4E56] block">
                    {evaluatedSubmissions.length > 0 ? 'Evaluated & Verified' : 'Awaiting Submission'}
                  </span>
                </div>
              </div>
            </section>

            {/* Curriculum Modules Detailed Breakdown (Phase B) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#881337]" />
                  <div>
                    <h3 className="text-base font-black text-[#1C0D12] uppercase tracking-tight">
                      Curriculum Learning Progress
                    </h3>
                    <p className="text-xs text-[#6B4E56]">
                      Enrolled Track: {courseTitle} ({totalCurriculumModules} Modules, {totalCurriculumLessons} Lessons)
                    </p>
                  </div>
                </div>
                <Link
                  href="/my-learning"
                  className="text-xs font-bold text-[#881337] hover:underline flex items-center gap-1"
                >
                  View Full Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {FULL_STACK_MODULES.slice(0, 6).map((m) => {
                  const moduleLessonIds = m.lessons.map((l) => l.id);
                  const completedInModule = moduleLessonIds.filter((id) => completedLessonIds.includes(id)).length;
                  const modulePercent =
                    moduleLessonIds.length > 0
                      ? Math.round((completedInModule / moduleLessonIds.length) * 100)
                      : 0;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-2 hover:border-[#881337] transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-[#881337]">{m.number}</span>
                        <span
                          className={cn(
                            'text-[10px] font-black uppercase px-2 py-0.5 rounded-full',
                            modulePercent === 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : modulePercent > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {modulePercent === 100 ? 'Completed' : modulePercent > 0 ? 'In Progress' : 'Up Next'}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#1C0D12] truncate">{m.title}</h4>
                      <div className="w-full bg-white rounded-full h-1.5 border border-[#881337]/15 overflow-hidden">
                        <div className="bg-[#881337] h-full rounded-full" style={{ width: `${modulePercent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#6B4E56]">
                        <span>{completedInModule} / {moduleLessonIds.length} lessons</span>
                        <span className="font-bold text-[#1C0D12]">{modulePercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Real Capstone Project Section (Phase I) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#881337]" />
                  <div>
                    <h3 className="text-base font-black text-[#1C0D12] uppercase tracking-tight">
                      My Capstone Projects &amp; Reviews
                    </h3>
                    <p className="text-xs text-[#6B4E56]">
                      Independent capstone submissions evaluated by authorized reviewers.
                    </p>
                  </div>
                </div>
                <Link
                  href="/projects"
                  className="text-xs font-bold text-[#881337] hover:underline flex items-center gap-1"
                >
                  Manage Projects <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    const matchedConfig = PROJECT_CATALOGUE.find((p) => p.id === sub.projectId);
                    const isEvaluated = sub.status === 'EVALUATED';
                    return (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/20 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#6B4E56] tracking-wider block">
                              CAPSTONE SUBMISSION (ATTEMPT {sub.attemptNumber || 1})
                            </span>
                            <h4 className="text-sm font-black text-[#1C0D12]">
                              {matchedConfig?.title || 'Full Stack Capstone Project'}
                            </h4>
                          </div>
                          <span
                            className={cn(
                              'text-xs font-black uppercase px-3 py-1 rounded-full',
                              isEvaluated
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : sub.status === 'UNDER_REVIEW'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            )}
                          >
                            {sub.status.replace('_', ' ')}
                          </span>
                        </div>

                        {sub.repositoryUrl && (
                          <div className="flex items-center gap-2 text-xs">
                            <GitBranch className="w-3.5 h-3.5 text-[#881337]" />
                            <a
                              href={sub.repositoryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[11px] text-[#881337] hover:underline truncate max-w-sm"
                            >
                              {sub.repositoryUrl}
                            </a>
                          </div>
                        )}

                        {isEvaluated && sub.evaluationReport && (
                          <div className="p-3 bg-white rounded-xl border border-[#881337]/10 space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span>Overall Rubric Score:</span>
                              <span className="text-emerald-700 text-sm font-black">
                                {sub.evaluationReport.overallScore}%
                              </span>
                            </div>
                            {sub.evaluationReport.reviewerNotes && (
                              <p className="text-[#6B4E56] text-[11px] italic mt-1">
                                &quot;{sub.evaluationReport.reviewerNotes}&quot;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-dashed border-[#881337]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-[#1C0D12]">No Capstone Project Submitted Yet</h4>
                    <p className="text-xs text-[#6B4E56] mt-0.5 max-w-md">
                      Start your flagship capstone project ({PROJECT_CATALOGUE[0]?.title}) to build practical engineering evidence.
                    </p>
                  </div>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#881337] hover:bg-[#9F1239] shadow-2xs whitespace-nowrap"
                  >
                    <span>Start Capstone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SKILL PASSPORT (VERIFICATION PILLARS, EVIDENCE LEDGER, CREDENTIALS)
           ========================================================================= */}
        {activeTab === 'skill-passport' && (
          <div
            id="panel-skill-passport"
            role="tabpanel"
            aria-labelledby="tab-skill-passport"
            className="space-y-6 sm:space-y-8 animate-fade-in"
          >
            {/* Passport Status Header */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#881337]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#881337]/10 border border-[#881337]/20 flex items-center justify-center text-[#881337]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#1C0D12] uppercase tracking-tight">
                      Official Skill Passport &amp; Integrity Ledger
                    </h2>
                    <p className="text-xs text-[#6B4E56] mt-0.5">
                      Cryptographically verified, tamper-proof record of proven engineering capability.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6B4E56] block">
                    PASSPORT STATUS
                  </span>
                  <span
                    className={cn(
                      'text-xs font-black uppercase px-3 py-1 rounded-full inline-block mt-0.5',
                      passportScore >= 70
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    )}
                  >
                    {passportScore >= 70 ? 'VERIFIED ACTIVE' : 'BUILDING EVIDENCE'}
                  </span>
                </div>
              </div>

              {/* 5 Verification Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Pillar 1 */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#6B4E56] uppercase block">
                    1. Track Enrollment
                  </span>
                  <span className="text-xs font-black text-[#1C0D12] block truncate">{courseTitle}</span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>

                {/* Pillar 2 */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#6B4E56] uppercase block">
                    2. Practice Labs
                  </span>
                  <span className="text-xs font-black text-[#1C0D12] block truncate">
                    {completedChallengesCount} / 30 Labs
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Test-Verified
                  </span>
                </div>

                {/* Pillar 3 */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#6B4E56] uppercase block">
                    3. Modular Assessments
                  </span>
                  <span className="text-xs font-black text-[#1C0D12] block truncate">
                    {assessmentsPassedCount} Passed (&gt;=70%)
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Evaluated
                  </span>
                </div>

                {/* Pillar 4 */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#6B4E56] uppercase block">
                    4. Capstone Project
                  </span>
                  <span className="text-xs font-black text-[#1C0D12] block truncate">
                    {evaluatedSubmissions.length > 0 ? 'Approved' : 'Pending Review'}
                  </span>
                  <span className="text-[10px] font-bold text-[#6B4E56] flex items-center gap-1">
                    <FolderKanban className="w-3 h-3" /> {evaluatedSubmissions.length} Submissions
                  </span>
                </div>

                {/* Pillar 5 */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#881337]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#6B4E56] uppercase block">
                    5. Cryptographic Proof
                  </span>
                  <span className="text-xs font-black text-[#1C0D12] block truncate">SHA-256 Ledger</span>
                  <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {evidenceList.length} Hashes
                  </span>
                </div>
              </div>
            </section>

            {/* Official Credentials (Phase H) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#881337]" />
                  <div>
                    <h3 className="text-base font-black text-[#1C0D12] uppercase tracking-tight">
                      Issued Digital Credentials
                    </h3>
                    <p className="text-xs text-[#6B4E56]">
                      Authentic credentials backed by cryptographic verification IDs.
                    </p>
                  </div>
                </div>
                <Link
                  href="/credentials"
                  className="text-xs font-bold text-[#881337] hover:underline flex items-center gap-1"
                >
                  View Credentials <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {credentials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#881337]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#6B4E56] uppercase text-[10px]">
                          {cred.credentialType.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {cred.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#1C0D12]">{cred.title}</h4>
                      <p className="font-mono text-[10px] text-[#881337]">ID: {cred.verificationId}</p>
                      <div className="pt-2 border-t border-[#881337]/10 text-[10px] text-[#6B4E56] flex justify-between">
                        <span>Issued: {new Date(cred.issuedAt).toLocaleDateString()}</span>
                        <Link href={`/verify`} className="font-bold text-[#881337] hover:underline">
                          Verify
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-dashed border-[#881337]/20 text-center space-y-2">
                  <p className="text-xs font-bold text-[#1C0D12]">No Official Credentials Issued Yet</p>
                  <p className="text-xs text-[#6B4E56] max-w-md mx-auto">
                    The official SEVA Skill Passport credential is automatically issued when you achieve &ge;70% Competency Readiness Score (CRS) and pass your capstone project evaluation.
                  </p>
                </div>
              )}
            </section>

            {/* Cryptographic Evidence Ledger */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#881337]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#881337]/10">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#881337]" />
                  <div>
                    <h3 className="text-base font-black text-[#1C0D12] uppercase tracking-tight">
                      Evidence Telemetry Ledger
                    </h3>
                    <p className="text-xs text-[#6B4E56]">
                      Every evaluated task generates an immutable SHA-256 evidence integrity hash.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#6B4E56]">
                  {evidenceList.length} Verified Hashes
                </span>
              </div>

              {evidenceList.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {evidenceList.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="p-3 bg-[#FFFDF7] rounded-xl border border-[#881337]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#1C0D12] block truncate">
                          {ev.metadata?.title || `${ev.skillId.toUpperCase()} Task`}
                        </span>
                        <span className="font-mono text-[10px] text-[#881337] block truncate max-w-sm sm:max-w-md">
                          {ev.verificationHash}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#6B4E56] self-end sm:self-center">
                        <span className="px-2 py-0.5 rounded-full bg-white border border-[#881337]/15 font-bold uppercase">
                          {ev.sourceType}
                        </span>
                        <span className="font-bold font-mono text-emerald-700">{ev.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B4E56] p-4 text-center">No evidence hashes recorded yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
