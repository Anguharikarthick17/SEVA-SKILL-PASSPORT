'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Award,
  Clock,
  AlertCircle,
  ArrowRight,
  Shield,
  FileText,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  Calendar,
  Layers
} from 'lucide-react';
import { AssessmentService } from '@/lib/assessments/service';
import { AssessmentConfig, AssessmentAttempt } from '@/types/assessment';
import { DataService, UserProfile } from '@/lib/data-service';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<AssessmentConfig | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraChecked, setCameraChecked] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await DataService.getCurrentUser();
        setUser(currentUser);
        const ass = AssessmentService.getAssessmentById(assessmentId);
        setAssessment(ass);

        if (currentUser && ass) {
          const userAtts = AssessmentService.getUserAttempts(currentUser.id, ass.id);
          setAttempts(userAtts);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#881337]/30 border-t-[#881337] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] p-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-[#FFE4E6] text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#881337] mx-auto" />
          <h2 className="text-xl font-bold text-[#1C0D12]">Assessment Not Found</h2>
          <p className="text-xs text-slate-500">The requested evaluation identifier could not be located in the question registry.</p>
          <Link href="/assessments" className="glow-button text-xs inline-flex items-center gap-1 font-bold">
            <ChevronLeft className="w-4 h-4" /> Back to Assessment Catalog
          </Link>
        </div>
      </div>
    );
  }

  const evaluatedAttempts = attempts.filter((a) => a.status === 'evaluated' || a.status === 'timed_out');
  const bestAttempt = evaluatedAttempts.length > 0
    ? [...evaluatedAttempts].sort((a, b) => b.percentage - a.percentage)[0]
    : null;
  const remainingAttempts = Math.max(0, assessment.maxAttempts - evaluatedAttempts.length);
  
  const activeCooldown = user ? AssessmentService.getActiveCooldown(user.id, assessment.id) : null;
  const canStart = remainingAttempts > 0 && !activeCooldown;

  const testCameraPreview = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraChecked(true);
        setCameraError(null);
        stream.getTracks().forEach((t) => t.stop());
      } else {
        setCameraChecked(true);
      }
    } catch (err: any) {
      setCameraError('Camera access was denied or unavailable. You may proceed with tab/fullscreen monitoring.');
      setCameraChecked(true);
    }
  };

  const handleStartConfirmed = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setStarting(true);
    setErrorMsg(null);
    try {
      // Request Fullscreen as direct user interaction
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      await AssessmentService.startOrResumeAttempt({
        userId: user.id,
        assessmentId: assessment.id,
      });
      router.push(`/assessments/${assessment.id}/take`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start assessment');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <Link
              href="/assessments"
              className="inline-flex items-center gap-1.5 text-xs text-[#FFE4E6] hover:underline font-semibold mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Assessment Catalog
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-[#FFE4E6]">
                    {assessment.skillId.toUpperCase()} EVALUATION
                  </span>
                  <span className="text-xs text-white/50">•</span>
                  <span className="text-xs text-white/90 font-medium">Proctored Competency Test</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{assessment.title}</h1>
                <p className="mt-2 text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  {assessment.description}
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setStartModalOpen(true)}
                  disabled={!canStart}
                  className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                    canStart
                      ? 'glow-button text-white font-black cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {bestAttempt ? <RotateCcw className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                  {canStart ? (bestAttempt ? 'Retake Assessment' : 'Start Assessment') : 'Max Attempts Reached'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Assessment Specs Grid */}
        <div className="bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm">
          <h3 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-4">
            Assessment Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
              <Clock className="w-4 h-4 text-[#881337] mx-auto mb-1" />
              <span className="text-xl font-bold text-[#1C0D12] block">{assessment.durationMinutes} Minutes</span>
              <span className="text-xs text-slate-500">Timed Window</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
              <FileText className="w-4 h-4 text-[#881337] mx-auto mb-1" />
              <span className="text-xl font-bold text-[#1C0D12] block">{assessment.questionCount} Questions</span>
              <span className="text-xs text-slate-500">Technical Items</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
              <Award className="w-4 h-4 text-[#881337] mx-auto mb-1" />
              <span className="text-xl font-bold text-[#1C0D12] block">{assessment.passingThreshold}%</span>
              <span className="text-xs text-slate-500">Passing Threshold</span>
            </div>
            <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
              <RotateCcw className="w-4 h-4 text-[#881337] mx-auto mb-1" />
              <span className="text-xl font-bold text-[#1C0D12] block">{remainingAttempts} / {assessment.maxAttempts}</span>
              <span className="text-xs text-slate-500">Attempts Remaining</span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Instructions & Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1C0D12] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#881337]" />
              Assessment Rules & Integrity Guidelines
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Server-Enforced Timer:</strong> The countdown is synchronized with the server deadline. Answers are auto-evaluated when the time expires.
              </li>
              <li>
                <strong>Safe Disconnect Recovery:</strong> If your browser closes or refreshes during an active test, you can resume your in-progress attempt before the deadline expires.
              </li>
              <li>
                <strong>Question Diversity:</strong> Questions include single choice, multiple-select, code output prediction, syntax debugging, and system architecture trade-offs.
              </li>
              <li>
                <strong>Competency Telemetry:</strong> Completing this assessment adds genuine verified evidence to your Skill Passport with a 20% evidence weight.
              </li>
            </ul>
          </div>

          {/* Competency Dimensions Evaluated */}
          <div className="bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1C0D12] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#881337]" />
              Evaluated Competency Dimensions
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Performance is mapped to specific capability dimensions to diagnose strength areas and growth targets:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {assessment.dimensions.map((dim) => (
                <span
                  key={dim}
                  className="px-2.5 py-1 bg-[#FFE4E6]/40 text-[#1C0D12] border border-[#FECDD3] rounded-lg text-xs font-semibold"
                >
                  {dim}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Previous Attempt History */}
        <div className="bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#FFE4E6]">
            <h3 className="text-sm font-bold text-[#1C0D12] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#881337]" />
              Attempt History ({attempts.length})
            </h3>
            <span className="text-xs text-slate-500">
              Best Score:{' '}
              <strong className="text-[#1C0D12]">
                {bestAttempt ? `${bestAttempt.percentage}%` : 'N/A'}
              </strong>
            </span>
          </div>

          {attempts.length > 0 ? (
            <div className="space-y-3">
              {attempts.map((att) => {
                const isPassed = att.percentage >= assessment.passingThreshold;
                return (
                  <div
                    key={att.id}
                    className="p-3.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C0D12]">Attempt #{att.attemptNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            att.status === 'in_progress'
                              ? 'bg-amber-100 text-[#881337]'
                              : isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-[#881337]'
                          }`}
                        >
                          {att.status === 'in_progress' ? 'In Progress' : isPassed ? 'Passed' : 'Needs Review'}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {att.id}</span>
                      </div>
                      <div className="text-slate-500 mt-1 flex items-center gap-3">
                        <span>Started: {new Date(att.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        {att.timeTakenSeconds > 0 && (
                          <span>Duration: {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {att.status !== 'in_progress' ? (
                        <>
                          <div className="text-right">
                            <span className="text-lg font-black text-[#1C0D12] leading-none block">
                              {att.percentage}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {att.earnedMarks} / {att.totalMarks} Marks
                            </span>
                          </div>
                          <Link
                            href={`/assessments/${assessment.id}/result/${att.id}`}
                            className="px-3 py-1.5 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 rounded-xl font-semibold text-[#1C0D12] text-xs shadow-xs"
                          >
                            View Result & Review
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/assessments/${assessment.id}/take`}
                          className="glow-button text-xs py-1.5 px-3 font-bold"
                        >
                          Resume Exam
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-[#FFFDF7] rounded-xl text-center text-xs text-slate-500 space-y-1 border border-[#FFE4E6]">
              <p>You have not attempted this assessment yet.</p>
              <p className="text-slate-400">Click &ldquo;Start Assessment&rdquo; when you are ready to begin the timed test.</p>
            </div>
          )}
        </div>
      </div>

      {/* START ASSESSMENT CONFIRMATION MODAL */}
      {startModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#FFE4E6] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE4E6] text-[#881337] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C0D12]">Begin Timed Assessment</h3>
                <p className="text-xs text-slate-500">Attempt #{attempts.length + 1} of {assessment.maxAttempts}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFDF7] rounded-xl text-xs text-slate-600 space-y-2 border border-[#FFE4E6]">
              <div className="flex justify-between">
                <span>Assessment:</span>
                <span className="font-bold text-[#1C0D12]">{assessment.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-bold text-[#1C0D12]">{assessment.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-[#1C0D12]">{assessment.questionCount} Questions</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Threshold:</span>
                <span className="font-bold text-[#1C0D12]">{assessment.passingThreshold}%</span>
              </div>
            </div>

            {/* Proctoring & Integrity Disclosure */}
            <div className="p-3.5 bg-amber-50 rounded-xl text-xs text-amber-900 space-y-2 border border-amber-300">
              <div className="font-bold flex items-center gap-1.5 text-milan-600">
                <Shield className="w-4 h-4 text-milan-600" />
                <span>Exam Integrity & Privacy Policy:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1. <strong>Fullscreen & Focus:</strong> Fullscreen is requested. Leaving the exam tab more than 3 times will permanently terminate the exam under our anti-cheat policy.
              </p>
              <p className="text-[11px] leading-relaxed">
                2. <strong>Camera & Privacy:</strong> We test camera accessibility. No continuous video is recorded or stored; only tab focus and integrity events are logged.
              </p>
              <p className="text-[11px] leading-relaxed">
                3. <strong>24-Hour Cooldown:</strong> Attempts terminated for excessive violations incur an authoritative 24-hour cooldown before a retry is permitted.
              </p>

              {!cameraChecked ? (
                <button
                  type="button"
                  onClick={testCameraPreview}
                  className="mt-2 w-full py-1.5 px-3 bg-white text-espresso-900 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-100/60 transition-colors"
                >
                  📷 Run Camera &amp; Browser Pre-Flight Check
                </button>
              ) : (
                <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-300">
                  ✓ Pre-Flight Checks Passed. Fullscreen will activate on launch.
                </div>
              )}

              {cameraError && (
                <div className="text-[11px] text-amber-800 italic">
                  Note: {cameraError}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-[#881337] rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStartModalOpen(false)}
                className="px-4 py-2 border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-slate-700 rounded-xl text-xs font-semibold"
                disabled={starting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartConfirmed}
                className="glow-button text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
                disabled={starting}
              >
                {starting ? 'Starting...' : 'I Am Ready, Start Now'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
