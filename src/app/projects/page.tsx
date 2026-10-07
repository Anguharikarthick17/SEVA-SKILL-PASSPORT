'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Github,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  Send,
  Star
} from 'lucide-react';
import { DEMO_PROJECTS } from '@/data';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEMO_PROJECTS[0].id);
  const [repoUrl, setRepoUrl] = useState('https://github.com/arjunsharma/seva-task-manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleSubmitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionFeedback(
        'Project milestone submitted for automated code review and evidence telemetry calculation! Feedback ready within minutes.'
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <FolderKanban className="w-4 h-4" />
              Real-World Capstone Projects
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Capstone Project Hub</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Employers value what you build. Capstone projects validate architectural thinking, code quality, security posture, and test coverage for your Skill Passport.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6">
            <div>
              <span className="block text-2xl font-black text-saffron-400">2</span>
              <span className="text-xs text-blue-100">Active Projects</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black text-white">72%</span>
              <span className="text-xs text-blue-100">Avg Completion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Projects Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-sm font-bold text-navy-900 mb-3">Enrolled Projects</h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setSubmissionFeedback(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-navy-900 bg-navy-50/50 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-bold ${isSelected ? 'text-navy-900' : 'text-slate-800'}`}>
                        {proj.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 uppercase">
                        {proj.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Milestone Progress:</span>
                        <span className="font-bold text-navy-900">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-navy-900 h-1.5 rounded-full transition-all"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {proj.tech.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evaluation Rubric Explainer */}
          <div className="bg-navy-900 text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" />
              Skill Passport Evidence Rubric
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every project is evaluated across 6 strict dimensions: Requirements Fulfilment, Architecture & Clean Code, Unit & Integration Tests, Security Best Practices, and Documentation.
            </p>
          </div>
        </div>

        {/* Right Side: Selected Project Detail & Rubric (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Project Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">
                  Full Stack Capstone Spec
                </span>
                <h2 className="text-xl font-bold text-navy-900">{selectedProject.title}</h2>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">{selectedProject.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Progress</span>
                <span className="text-2xl font-black text-navy-900">{selectedProject.progress}%</span>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Technologies:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tech.map((tech) => (
                  <span key={tech} className="px-2.5 py-1 bg-slate-100 text-navy-900 font-mono text-xs font-medium rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Feedback Toast */}
          {submissionFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p>{submissionFeedback}</p>
            </div>
          )}

          {/* Milestones & Rubric Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-navy-700" />
              Rubric Milestones & Evaluation Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedProject.sections.map((sec) => (
                <div
                  key={sec.name}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-navy-900">{sec.name}</div>
                    <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                      {sec.status === 'complete' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : sec.status === 'in-progress' ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{sec.status}</span>
                    </div>
                  </div>

                  {sec.score ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-navy-900">{sec.score}%</span>
                      <span className="block text-[10px] text-emerald-600 font-medium">Scored</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      In Queue
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
              <Github className="w-4 h-4" />
              Submit Repository for Telemetry Review
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your public Git repository URL. Our automated evaluation engine tests linting, test suites, commit messages, and API security.
            </p>

            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Repository Link
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                    placeholder="https://github.com/username/project-repo"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-navy-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-[11px] text-slate-400">
                  Last commit analyzed: 2 hours ago
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Evaluating...' : 'Submit Repository Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
