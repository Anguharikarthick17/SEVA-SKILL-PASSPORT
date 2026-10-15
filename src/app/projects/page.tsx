'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectConfig, ProjectSubmissionRecord, SubmissionStatus } from '@/types/project';
import { ProjectService } from '@/lib/projects/service';
import { DataService } from '@/lib/data-service';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  ArrowRight,
  Search,
  Award
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmissionRecord[]>([]);
  const [, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const user = await DataService.getCurrentUser();
        setCurrentUser(user);
        const userId = user ? user.id : 'std-001';

        const [projs, subs] = await Promise.all([
          ProjectService.getAllProjects(),
          ProjectService.getUserSubmissions(userId)
        ]);
        setProjects(projs);
        setSubmissions(subs);
      } catch (err) {
        console.error('Failed to load project hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSubmissionForProject = (projectId: string): ProjectSubmissionRecord | undefined => {
    return submissions.find((s) => s.projectId === projectId);
  };

  const getStatusBadge = (status?: SubmissionStatus) => {
    switch (status) {
      case 'EVALUATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Evaluated
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#881337] border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-[#881337]" />
            Changes Requested
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-300">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE4E6]/60 text-slate-600 border border-[#FECDD3]">
            Not Started
          </span>
        );
    }
  };

  // Metrics calculation
  const evaluatedCount = submissions.filter((s) => s.status === 'EVALUATED').length;
  const inProgressCount = submissions.filter((s) => s.status === 'IN_PROGRESS' || s.status === 'SUBMITTED').length;
  const evaluatedSubmissions = submissions.filter((s) => s.status === 'EVALUATED' && s.evaluationReport?.overallScore !== undefined);
  const avgScore = evaluatedSubmissions.length > 0
    ? Math.round(evaluatedSubmissions.reduce((acc, s) => acc + (s.evaluationReport?.overallScore || 0), 0) / evaluatedSubmissions.length)
    : 0;

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    const stack = project.techStack || project.recommendedTechStack || [];
    const skillsList = project.skills || project.requiredSkills || [];

    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;

    const matchesSkill =
      selectedSkill === 'all' || skillsList.includes(selectedSkill);

    const sub = getSubmissionForProject(project.id);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'not_started' && (!sub || sub.status === 'NOT_STARTED')) ||
      (statusFilter === 'in_progress' && (sub?.status === 'IN_PROGRESS' || sub?.status === 'CHANGES_REQUESTED')) ||
      (statusFilter === 'submitted' && (sub?.status === 'SUBMITTED' || sub?.status === 'UNDER_REVIEW')) ||
      (statusFilter === 'evaluated' && sub?.status === 'EVALUATED');

    return matchesSearch && matchesDifficulty && matchesSkill && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <FolderKanban className="w-4 h-4 text-[#FFE4E6]" />
                Proof of Ability — Project Verification Engine
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Capstone Project Catalogue</h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">
                Demonstrate hands-on engineering competence through complete full-stack capstone projects. 
                Submissions undergo transparent rubric scoring and cryptographic SHA-256 evidence generation for your Skill Passport.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center flex items-center justify-around gap-6 shadow-md">
              <div>
                <span className="block text-2xl font-black text-[#FFE4E6]">{projects.length}</span>
                <span className="text-xs text-white/80">Total Projects</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-black text-white">{inProgressCount}</span>
                <span className="text-xs text-white/80">Active</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-black text-emerald-300">{evaluatedCount}</span>
                <span className="text-xs text-white/80">Evaluated</span>
              </div>
              {avgScore > 0 && (
                <>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <span className="block text-2xl font-black text-[#FFE4E6]">{avgScore}%</span>
                    <span className="text-xs text-white/80">Avg Score</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter and Search Controls */}
        <div className="bg-white rounded-2xl border border-[#FFE4E6] p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, technologies, or keywords..."
              className="w-full pl-9 pr-4 py-2 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-bold text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-bold text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
            >
              <option value="all">All Skills</option>
              <option value="react">React / Frontend</option>
              <option value="nodejs">Node.js / Backend</option>
              <option value="sql">SQL / Database</option>
              <option value="security">Security &amp; Auth</option>
              <option value="testing">Testing</option>
              <option value="deployment">DevOps / Deployment</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-bold text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Under Review</option>
              <option value="evaluated">Evaluated</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#FFE4E6] shadow-sm">
            <div className="w-10 h-10 border-4 border-[#881337]/30 border-t-[#881337] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">Loading project catalogue and submissions...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#FFE4E6] p-8 shadow-sm">
            <FolderKanban className="w-12 h-12 text-[#881337]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1C0D12]">No matching projects found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
                setSelectedSkill('all');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold bg-[#FFE4E6] text-[#881337] border border-[#FECDD3] rounded-xl hover:bg-[#FFE4E6]/80 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const sub = getSubmissionForProject(project.id);
              const score = sub?.evaluationReport?.overallScore;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-[#FFE4E6] shadow-sm hover:border-[#881337]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#881337] border border-[#FECDD3]">
                        {project.difficulty}
                      </span>
                      {getStatusBadge(sub?.status)}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-[#1C0D12] group-hover:text-[#881337] transition">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(project.techStack || project.recommendedTechStack || []).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-[#FFE4E6]/50 text-slate-700 border border-[#FECDD3] rounded text-[10px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Effort & Rubric Criteria Preview */}
                    <div className="mt-5 pt-4 border-t border-[#FFE4E6] flex items-center justify-between text-xs text-slate-500">
                      <span>Est. Effort: <strong className="text-[#1C0D12]">{project.estimatedEffortHours || 20} hrs</strong></span>
                      <span>Rubric: <strong className="text-[#1C0D12]">{project.rubric.length} Criteria</strong></span>
                    </div>

                    {/* If evaluated, show overall score */}
                    {sub?.status === 'EVALUATED' && score !== undefined && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-[#1C0D12]">Evaluation Score:</span>
                        </div>
                        <span className="text-sm font-black text-emerald-700">{score}%</span>
                      </div>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="p-4 bg-[#FFFDF7] border-t border-[#FFE4E6] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">
                      {sub?.status === 'EVALUATED'
                        ? 'Evidence Recorded'
                        : sub?.status === 'SUBMITTED'
                        ? 'Awaiting Review'
                        : sub?.status === 'IN_PROGRESS'
                        ? 'Workspace Active'
                        : 'Available to Start'}
                    </span>

                    <Link
                      href={`/projects/${project.id}`}
                      className="glow-button text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 font-bold"
                    >
                      {sub?.status === 'EVALUATED'
                        ? 'View Report'
                        : sub?.status === 'IN_PROGRESS'
                        ? 'Continue Project'
                        : sub?.status === 'SUBMITTED'
                        ? 'View Status'
                        : 'Open Project'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informational Guidance Banner */}
        <div className="mt-12 bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-[#881337] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1C0D12]">Evidence-Backed Project Verification Standards</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Project submissions require an accessible Git repository URL and comprehensive implementation notes.
                Qualifying evaluations carry a 1.35x weight in the SEVA Skill Passport competency scoring engine,
                providing verifiable proof of engineering abilities.
              </p>
            </div>
          </div>
          <Link
            href="/skill-passport"
            className="glow-button text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            View My Skill Passport
          </Link>
        </div>
      </div>
    </div>
  );
}
