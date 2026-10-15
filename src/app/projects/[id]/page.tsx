'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProjectService } from '@/lib/projects/service';
import { DataService } from '@/lib/data-service';
import {
  ProjectConfig,
  ProjectSubmissionRecord,
  SubmissionStatus,
} from '@/types/project';
import {
  FolderKanban,
  Github,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  Send,
  Save,
  RotateCcw,
  Sparkles,
  FileCheck,
  BookOpen,
  UserCheck,
  HelpCircle,
  FileText,
  Database,
  AlertTriangle
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = (params?.id as string) || '';

  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<ProjectSubmissionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'rubric' | 'workspace' | 'report' | 'history'>('overview');
  
  // Workspace Form State
  const [repoUrl, setRepoUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Reviewer inspector state
  const [isReviewerMode, setIsReviewerMode] = useState(false);
  const [reviewerScores, setReviewerScores] = useState<Record<string, { score: number; feedback?: string }>>({});
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const u = await DataService.getCurrentUser();
      setUser(u);
      const uid = u ? u.id : 'std-001';

      const projConfig = ProjectService.getProjectById(projectId);
      setProject(projConfig);

      if (projConfig) {
        const userSubs = await ProjectService.getUserSubmissions(uid, projConfig.id);
        setSubmissions(userSubs);

        const latest = userSubs[0];
        if (latest) {
          setRepoUrl(latest.repositoryUrl || '');
          setDeployUrl(latest.deploymentUrl || '');
          setSummary(latest.summary || '');
          setNotes(latest.implementationNotes || '');
          setSelectedReqs(latest.completedRequirementIds || []);

          if (latest.status === 'EVALUATED' || latest.status === 'CHANGES_REQUESTED') {
            setActiveTab('report');
          } else if (latest.status === 'IN_PROGRESS' || latest.status === 'SUBMITTED') {
            setActiveTab('workspace');
          }
        }
      }
    }
    loadData();
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center py-16 px-4">
        <div className="bg-white border border-[#FFE4E6] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <FolderKanban className="w-12 h-12 text-[#881337]/40 mx-auto" />
          <h2 className="text-xl font-bold text-[#1C0D12]">Project Not Found</h2>
          <p className="text-xs text-slate-500">The requested capstone project could not be found in the catalogue.</p>
          <Link href="/projects" className="glow-button text-xs inline-flex items-center gap-2">
            Return to Project Hub
          </Link>
        </div>
      </div>
    );
  }

  const latestSubmission = submissions[0] || null;
  const currentStatus: SubmissionStatus = latestSubmission ? latestSubmission.status : 'NOT_STARTED';

  const handleStartProject = async () => {
    if (!user) return;
    try {
      const newSub = await ProjectService.startProject(user.id, project.id);
      setSubmissions([newSub]);
      setActiveTab('workspace');
      setActionSuccessMsg('Project started! Your workspace is ready.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Unable to start project.');
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSavingDraft(true);
    setFormError(null);
    try {
      const updated = await ProjectService.saveDraft({
        userId: user.id,
        projectId: project.id,
        repositoryUrl: repoUrl,
        deploymentUrl: deployUrl,
        summary,
        implementationNotes: notes,
        completedRequirementIds: selectedReqs,
      });
      setSubmissions((prev) => [updated, ...prev.slice(1)]);
      setActionSuccessMsg('Workspace draft saved successfully.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitForEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await ProjectService.submitProject({
        userId: user.id,
        projectId: project.id,
        repositoryUrl: repoUrl,
        deploymentUrl: deployUrl,
        summary,
        implementationNotes: notes,
        completedRequirementIds: selectedReqs,
      });

      setSubmissions((prev) => [res.submission, ...prev]);
      setActiveTab('report');
      setActionSuccessMsg(
        res.evaluationReport.passed
          ? 'Project submitted & verified! Evidence hash recorded on your Skill Passport.'
          : 'Project submitted. Evaluation review completed with revision recommendations.'
      );
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please check form inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewerSubmit = async () => {
    if (!latestSubmission) return;
    if (user && latestSubmission.userId === user.id) {
      alert('Security violation: Submitters cannot evaluate their own project submissions. An authorized mentor or reviewer must evaluate this project.');
      return;
    }
    setIsReviewing(true);
    try {
      const res = await ProjectService.evaluateAsReviewer({
        submissionId: latestSubmission.id,
        reviewerId: user?.id || '',
        reviewerNotes: reviewerNotes || 'Evaluation verified against institutional benchmark rubric.',
        reviewerScores,
      });

      setSubmissions((prev) => [res.submission, ...prev.slice(1)]);
      setActiveTab('report');
      setIsReviewerMode(false);
      setActionSuccessMsg('Reviewer evaluation recorded and competency scores updated!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Reviewer evaluation failed.');
    } finally {
      setIsReviewing(false);
    }
  };

  const toggleReq = (reqId: string) => {
    setSelectedReqs((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Link
                  href="/projects"
                  className="text-xs text-[#FFE4E6] hover:underline flex items-center gap-1 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5" /> Project Hub
                </Link>
                <span className="text-xs text-white/50">/</span>
                <span className="text-xs text-[#FFE4E6] font-bold uppercase tracking-wider">{project.primarySkill} Capstone</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">{project.title}</h1>
              <p className="mt-2 text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-6 flex-shrink-0 self-start md:self-center shadow-md">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block">Status</span>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full mt-1 inline-block ${
                    currentStatus === 'EVALUATED'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-300/40'
                      : currentStatus === 'SUBMITTED'
                      ? 'bg-amber-500/30 text-[#FFE4E6] border border-amber-300/40'
                      : currentStatus === 'CHANGES_REQUESTED'
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-300/40'
                      : currentStatus === 'IN_PROGRESS'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/10 text-white/80'
                  }`}
                >
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
              {latestSubmission && (
                <>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block">Durable Sync</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1 ${
                        latestSubmission.syncStatus === 'synced'
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-300/40'
                          : latestSubmission.syncStatus === 'sync_error'
                          ? 'bg-amber-500/30 text-[#FFE4E6] border border-amber-300/40'
                          : 'bg-white/10 text-white/70'
                      }`}
                      title={latestSubmission.syncError || undefined}
                    >
                      <Database className="w-3 h-3" />
                      {latestSubmission.syncStatus === 'synced'
                        ? 'Supabase Synced'
                        : latestSubmission.syncStatus === 'sync_error'
                        ? 'Saved Locally (Sync Warning)'
                        : 'Saved Locally'}
                    </span>
                  </div>
                </>
              )}
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block">Passing Threshold</span>
                <span className="text-lg font-black text-[#FFE4E6] leading-none block mt-1">
                  {project.passingScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between border-b border-[#FFE4E6] pb-px overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'overview', label: 'Overview & Specs', icon: BookOpen },
              { id: 'requirements', label: 'Requirements', icon: CheckCircle2 },
              { id: 'rubric', label: 'Evaluation Rubric', icon: Layers },
              { id: 'workspace', label: 'Workspace & Submission', icon: Code2 },
              { id: 'report', label: 'Evaluation Report', icon: FileCheck },
              { id: 'history', label: `Attempts (${submissions.length})`, icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'border-[#881337] text-[#881337] bg-[#FFE4E6]/40 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-[#1C0D12]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#881337]' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Reviewer / Inspector toggle button */}
          <button
            type="button"
            onClick={() => setIsReviewerMode(!isReviewerMode)}
            className="text-[11px] font-semibold text-slate-700 hover:text-[#881337] flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/50 rounded-xl transition-colors ml-4 whitespace-nowrap"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#881337]" />
            {isReviewerMode ? 'Close Inspector' : 'Reviewer Evaluation Tool'}
          </button>
        </div>

        {/* Action notifications */}
        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
        {formError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-[#881337] text-xs">
            <AlertCircle className="w-4 h-4 text-[#881337] flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#881337]" />
                  Learning Objectives & Competency Goals
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {project.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#881337]" />
                  Assessed Competency Dimensions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.dimensions.map((dim) => (
                    <div key={dim} className="p-3 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl text-xs">
                      <span className="font-bold text-[#1C0D12] block">{dim}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Mapped to core {project.primarySkill.toUpperCase()} skill index</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#881337]" />
                  Submission Instructions
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.submissionInstructions}
                </p>
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="space-y-6">
              <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">Project Specification</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#FFE4E6]">
                    <span className="text-slate-500">Difficulty:</span>
                    <span className="font-bold text-[#1C0D12]">{project.difficulty}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#FFE4E6]">
                    <span className="text-slate-500">Estimated Effort:</span>
                    <span className="font-bold text-[#1C0D12]">{project.estimatedEffortHours} Hours</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#FFE4E6]">
                    <span className="text-slate-500">Passing Score:</span>
                    <span className="font-bold text-emerald-700">{project.passingScore}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#FFE4E6]">
                    <span className="text-slate-500">Competency Weight:</span>
                    <span className="font-bold text-[#881337]">1.35x Evidence Weight</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">Recommended Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="px-2 py-0.5 bg-[#FFE4E6]/50 text-slate-700 border border-[#FECDD3] rounded text-[11px] font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#FFE4E6]">
                  {currentStatus === 'NOT_STARTED' ? (
                    <button
                      type="button"
                      onClick={handleStartProject}
                      className="w-full glow-button justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5"
                    >
                      Start Project Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('workspace')}
                      className="w-full glow-button justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5"
                    >
                      Open Workspace <Code2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-2xl space-y-2 text-xs text-[#1C0D12]">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-[#881337]" />
                  Proof of Ability Guarantee
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Capstone submissions generate verifiable evidence with a SHA-256 integrity hash that employers can inspect on your public Skill Passport.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REQUIREMENTS & ACCEPTANCE */}
        {activeTab === 'requirements' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#FFE4E6]">
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Functional Requirements
                </h3>
                <span className="text-xs text-slate-500">{project.functionalRequirements.length} Deliverable Specifications</span>
              </div>

              <div className="space-y-3">
                {project.functionalRequirements.map((req) => (
                  <div key={req.id} className="p-4 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C0D12] text-xs sm:text-sm">{req.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.mandatory ? 'bg-rose-100 text-[#881337]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {req.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#881337]" />
                Acceptance Criteria & Verification Methods
              </h3>
              <div className="space-y-3">
                {project.acceptanceCriteria.map((ac) => (
                  <div key={ac.id} className="p-3.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-[#1C0D12] block">{ac.criterion}</span>
                    <span className="text-[11px] text-slate-400 block">Method: {ac.verificationMethod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVALUATION RUBRIC */}
        {activeTab === 'rubric' && (
          <div className="mt-6 bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#FFE4E6]">
              <div>
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#881337]" />
                  Transparent Evaluation Rubric
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every submission is evaluated against this weighted rubric. Score of ≥{project.passingScore}% required for verification.
                </p>
              </div>
              <span className="text-xs font-bold text-[#881337] bg-[#FFE4E6] border border-[#FECDD3] px-3 py-1 rounded-lg self-start">
                Total: 100 Points
              </span>
            </div>

            <div className="space-y-4">
              {project.rubric.map((criterion) => (
                <div key={criterion.id} className="p-4 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-bold text-[#1C0D12] text-xs sm:text-sm">{criterion.name}</span>
                      <span className="text-[11px] text-slate-500 block sm:inline sm:ml-2">({criterion.category})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1C0D12] bg-white border border-[#FFE4E6] px-2 py-0.5 rounded">
                        Max: {criterion.maxScore} Pts
                      </span>
                      <span className="text-[10px] text-[#881337] font-bold bg-[#FFE4E6] px-2 py-0.5 rounded">
                        Weight: {criterion.weight}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{criterion.description}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span>Evaluates Dimension:</span>
                    <span className="font-semibold text-[#1C0D12]">{criterion.evaluatedDimension}</span>
                    <span>•</span>
                    <span>Target Skill:</span>
                    <span className="font-semibold text-[#1C0D12] uppercase">{criterion.targetSkill}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORKSPACE & SUBMISSION FORM */}
        {activeTab === 'workspace' && (
          <div className="mt-6 bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#FFE4E6]">
              <div>
                <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#881337]" />
                  Student Project Workspace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepare your repository deliverables and submit for automated and peer evaluation.
                </p>
              </div>
              <span className="text-xs font-bold text-[#1C0D12] bg-[#FFE4E6] border border-[#FECDD3] px-2.5 py-1 rounded-lg">
                Attempt #{latestSubmission?.attemptNumber || 1}
              </span>
            </div>

            <form onSubmit={handleSubmitForEvaluation} className="space-y-5">
              {/* Repository URL */}
              <div>
                <label htmlFor="proj-repo" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                  GitHub / Git Repository URL *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    id="proj-repo"
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFE4E6]/20 border border-[#FECDD3] rounded-xl text-xs sm:text-sm text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Must be public on GitHub, GitLab, or Bitbucket. Never commit secrets or tokens.
                </p>
              </div>

              {/* Live Deployment URL */}
              <div>
                <label htmlFor="proj-deploy" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                  Live Deployment URL {project.primarySkill === 'react' ? '*' : '(Optional for Backend APIs)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    id="proj-deploy"
                    type="url"
                    value={deployUrl}
                    onChange={(e) => setDeployUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFE4E6]/20 border border-[#FECDD3] rounded-xl text-xs sm:text-sm text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
                  />
                </div>
              </div>

              {/* Project Summary */}
              <div>
                <label htmlFor="proj-summary" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                  Project Summary & Overview *
                </label>
                <input
                  id="proj-summary"
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="E.g., Complete full-stack task manager implementing JWT auth, PostgreSQL migrations, and responsive dashboard"
                  className="w-full px-4 py-2.5 bg-[#FFE4E6]/20 border border-[#FECDD3] rounded-xl text-xs sm:text-sm text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
                />
              </div>

              {/* Implementation & Architecture Notes */}
              <div>
                <label htmlFor="proj-notes" className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-1.5">
                  Implementation Notes & Architecture Highlights *
                </label>
                <textarea
                  id="proj-notes"
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail your component architecture, database modeling choices, testing strategy, and steps required to run your project locally..."
                  className="w-full px-4 py-2.5 bg-[#FFE4E6]/20 border border-[#FECDD3] rounded-xl text-xs sm:text-sm font-mono text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
                />
              </div>

              {/* Requirement Checklist */}
              <div>
                <span className="block text-xs font-bold text-[#1C0D12] uppercase tracking-wider mb-2">
                  Completed Functional Deliverables Checklist
                </span>
                <div className="space-y-2 p-4 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl">
                  {project.functionalRequirements.map((req) => (
                    <label key={req.id} className="flex items-start gap-2.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedReqs.includes(req.id)}
                        onChange={() => toggleReq(req.id)}
                        className="mt-0.5 rounded border-[#FECDD3] text-[#881337] focus:ring-[#881337]"
                      />
                      <div>
                        <span className="font-semibold text-[#1C0D12] block">{req.title}</span>
                        <span className="text-[11px] text-slate-500">{req.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submission Buttons */}
              <div className="pt-4 border-t border-[#FFE4E6] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingDraft ? 'Saving Draft…' : 'Save Draft'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isSavingDraft}
                  className="w-full sm:w-auto glow-button justify-center py-2.5 px-6 text-xs font-bold shadow-md disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Evaluating & Verifying…' : 'Submit for Evaluation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: EVALUATION REPORT */}
        {activeTab === 'report' && (
          <div className="mt-6 space-y-6">
            {latestSubmission?.evaluationReport ? (
              <>
                {/* Result Header Banner */}
                <div className="bg-white border border-[#FFE4E6] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#FFE4E6]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 ${
                        latestSubmission.evaluationReport.passed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-rose-50 text-[#881337] border border-rose-200'
                      }`}>
                        {latestSubmission.evaluationReport.passed ? '✓' : '!'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-[#1C0D12]">
                            {latestSubmission.evaluationReport.passed ? 'Capstone Evaluation Verified' : 'Revisions Recommended'}
                          </h2>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            latestSubmission.evaluationReport.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-[#881337]'
                          }`}>
                            {latestSubmission.evaluationReport.passed ? 'PASSED' : 'ACTION REQUIRED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Evaluated on {new Date(latestSubmission.evaluationReport.evaluatedAt).toLocaleDateString()} · Method: {latestSubmission.evaluationReport.evaluationMethod.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-[#1C0D12] block">
                        {latestSubmission.evaluationReport.overallScore}%
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Passing Threshold: {project.passingScore}%
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Audit Hash Banner */}
                  {latestSubmission.evaluationReport.verificationHash && (
                    <div className="p-4 bg-[#1C0D12] text-white rounded-xl font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#FFE4E6]">
                        <span>Cryptographic Evidence Audit Hash</span>
                        <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Evidence Landed in Skill Passport
                        </span>
                      </div>
                      <p className="break-all text-emerald-300 text-[11px] select-all">
                        {latestSubmission.evaluationReport.verificationHash}
                      </p>
                    </div>
                  )}

                  {/* Automated Pre-Flight Checks */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">
                      Automated Pre-Flight & Deliverables Verification
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {latestSubmission.evaluationReport.automatedChecks.map((chk, i) => (
                        <div key={i} className="p-3 rounded-xl border border-[#FFE4E6] bg-[#FFFDF7] flex items-start gap-2.5 text-xs">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-[#1C0D12] block">{chk.checkName}</span>
                            <span className="text-[11px] text-slate-600">{chk.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Rubric Breakdown */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-[#1C0D12] uppercase tracking-wider">
                      Rubric Criteria Breakdown
                    </h4>
                    <div className="space-y-3">
                      {latestSubmission.evaluationReport.criteriaScores.map((c) => (
                        <div key={c.criterionId} className="p-4 rounded-xl border border-[#FFE4E6] bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-[#1C0D12] text-xs sm:text-sm">{c.criterionName}</span>
                              <span className="text-[11px] text-slate-500 ml-2">({c.category})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1C0D12] text-xs">
                                {c.earnedScore} / {c.maxScore} Pts
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.status === 'MET' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-[#881337]'
                              }`}>
                                {c.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{c.feedback}</p>
                          <div className="text-[10px] text-slate-400">
                            Evaluated Dimension: <span className="text-[#1C0D12] font-semibold">{c.dimension}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Identified Strengths
                      </span>
                      <ul className="space-y-1.5 text-emerald-800">
                        {latestSubmission.evaluationReport.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#FFE4E6]/40 border border-[#FECDD3] rounded-xl text-xs space-y-2">
                      <span className="font-bold text-[#1C0D12] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-[#881337]" />
                        Recommendations for Mastery
                      </span>
                      <ul className="space-y-1.5 text-slate-700">
                        {latestSubmission.evaluationReport.recommendations.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Actions */}
                  <div className="pt-4 border-t border-[#FFE4E6] flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href="/skill-passport/my"
                      className="glow-button text-xs inline-flex items-center gap-1.5 font-bold"
                    >
                      <Shield className="w-3.5 h-3.5" /> View in Skill Passport
                    </Link>

                    <button
                      type="button"
                      onClick={() => setActiveTab('workspace')}
                      className="px-4 py-2 bg-white border border-[#FECDD3] hover:bg-[#FFE4E6]/40 text-[#1C0D12] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Submit Improved Revision
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-[#FFE4E6] rounded-2xl text-center py-12 space-y-3 shadow-sm">
                <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#1C0D12]">No Evaluation Report Available Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit your project from the Workspace tab to trigger the automated evaluation suite and rubric report.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('workspace')}
                  className="glow-button text-xs inline-flex items-center gap-1.5 font-bold"
                >
                  Go to Workspace
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SUBMISSION HISTORY */}
        {activeTab === 'history' && (
          <div className="mt-6 bg-white border border-[#FFE4E6] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1C0D12] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#FFE4E6]">
              <Clock className="w-4 h-4 text-slate-500" />
              Submission Attempt Log ({submissions.length})
            </h3>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No submissions recorded yet for this project.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C0D12]">Attempt #{sub.attemptNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sub.status === 'EVALUATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleString()} · Score: {sub.score !== undefined ? `${sub.score}%` : 'Pending'}
                      </p>
                      {sub.repositoryUrl && (
                        <a
                          href={sub.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#881337] hover:underline flex items-center gap-1 mt-1 font-mono"
                        >
                          <Github className="w-3 h-3" /> {sub.repositoryUrl}
                        </a>
                      )}
                    </div>

                    <div className="text-right">
                      {sub.verificationHash && (
                        <span className="font-mono text-[10px] text-emerald-600 block truncate max-w-xs">
                          {sub.verificationHash}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWER INSPECTOR MODAL */}
        {isReviewerMode && (
          <div className="mt-6 p-6 bg-[#1C0D12] text-white rounded-3xl space-y-4 border border-[#881337]/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#FFE4E6]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFE4E6]">Authorized Reviewer Inspector Tool</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewerMode(false)}
                className="text-xs text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-white/80">
              Reviewer tool to calibrate rubric scores, verify student code architecture, and approve or request revisions.
            </p>

            <div className="space-y-3">
              {project.rubric.map((criterion) => (
                <div key={criterion.id} className="p-3 bg-white/10 rounded-xl space-y-2 border border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{criterion.name}</span>
                    <span className="text-[#FFE4E6]">Max: {criterion.maxScore} Pts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={criterion.maxScore}
                      placeholder={`Score (0-${criterion.maxScore})`}
                      onChange={(e) =>
                        setReviewerScores({
                          ...reviewerScores,
                          [criterion.id]: {
                            score: Number(e.target.value),
                            feedback: reviewerScores[criterion.id]?.feedback,
                          },
                        })
                      }
                      className="w-28 px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Reviewer qualitative notes for this criterion..."
                      onChange={(e) =>
                        setReviewerScores({
                          ...reviewerScores,
                          [criterion.id]: {
                            score: reviewerScores[criterion.id]?.score || 0,
                            feedback: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Overall Reviewer Feedback:</label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Institutional mentor notes and approval comments..."
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs text-white"
              />
            </div>

            {user && latestSubmission && latestSubmission.userId === user.id && (
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-[#FFE4E6] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FFE4E6] flex-shrink-0" />
                <span>Security Notice: Submitters cannot evaluate their own projects. Evaluations must be performed and signed by an authorized mentor or institutional reviewer.</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReviewerSubmit}
                disabled={isReviewing || !latestSubmission || Boolean(user && latestSubmission.userId === user.id)}
                className="glow-button py-2 px-4 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isReviewing ? 'Recording Evaluation…' : 'Save Reviewer Evaluation & Update Passport'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
