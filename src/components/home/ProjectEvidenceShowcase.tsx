'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Layers,
  Award,
} from 'lucide-react';
import { PROJECT_CATALOGUE } from '@/data/projects';
import GlowButton from '@/components/ui/GlowButton';

export default function ProjectEvidenceShowcase() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECT_CATALOGUE[0]?.id || 'proj-frontend-responsive');
  const activeProject = PROJECT_CATALOGUE.find((p) => p.id === selectedProjectId) || PROJECT_CATALOGUE[0];

  return (
    <section className="py-16 sm:py-24 bg-[#FFFDF7] text-espresso-900 relative overflow-hidden border-b border-milan-600/10" aria-labelledby="project-showcase-heading">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-milan-50 border border-milan-600/30 text-milan-600 text-[10px] font-bold tracking-wider uppercase mb-3">
            <FolderGit2 className="w-3.5 h-3.5 text-milan-600" />
            <span>Capstone Engineering Evidence</span>
          </div>
          <h2 id="project-showcase-heading" className="text-3xl sm:text-4xl font-black text-espresso-900 tracking-tight">
            How Projects Prove <span className="text-milan-600">Real Ability</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-espresso-muted leading-relaxed">
            In SEVA, code is evaluated against rigorous multi-criterion rubrics. Explore the difference between raw submission attempts and qualifying evidence.
          </p>
        </div>

        {/* 3-State Evidence Lifecycle Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-6xl xl:max-w-[1360px] mx-auto">
          <div className="p-5 rounded-2xl bg-white border border-milan-600/15 shadow-sm">
            <span className="text-[10px] font-mono uppercase font-bold text-espresso-muted tracking-wider block mb-1">
              Phase 1 · Submission
            </span>
            <h4 className="text-sm font-bold text-espresso-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-milan-500" />
              Locked Repo & Deployment
            </h4>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
              Student submits public GitHub repository and live application URL. Code is frozen for evaluator review.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-milan-600/15 shadow-sm">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-600 tracking-wider block mb-1">
              Phase 2 · Review
            </span>
            <h4 className="text-sm font-bold text-espresso-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              4-Criterion Rubric Scoring
            </h4>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
              Authorized reviewers inspect code cleanliness, documentation, core requirements, and production quality.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-milan-600/15 shadow-sm">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 tracking-wider block mb-1">
              Phase 3 · Evidence
            </span>
            <h4 className="text-sm font-bold text-espresso-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Cryptographic SHA-256 Ledger
            </h4>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
              Scores ≥70% lock into the learner&apos;s Skill Passport as qualifying proof. Tampering changes the verification hash.
            </p>
          </div>
        </div>

        {/* Interactive Project Inspector */}
        <div className="max-w-6xl xl:max-w-[1360px] mx-auto rounded-3xl bg-white border border-milan-600/20 p-6 sm:p-8 lg:p-10 shadow-[0_15px_40px_-10px_rgba(136, 19, 55,0.1)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Project Picker List */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-muted block mb-2">
                Sample Capstone Projects
              </span>
              {PROJECT_CATALOGUE.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between border ${
                    selectedProjectId === project.id
                      ? 'bg-milan-50 border-milan-600 shadow-sm text-milan-600'
                      : 'bg-[#FFFDF7] border-milan-600/10 hover:border-milan-600/30 text-espresso-900'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold">{project.title}</h5>
                    <p className="text-[10px] text-espresso-muted mt-0.5">
                      {project.difficulty} · {project.primarySkill.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-milan-600/20">
                    {project.rubric.length} Criteria
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Project Details */}
            {activeProject && (
              <div className="lg:col-span-7 bg-[#FFFDF7] border border-milan-600/15 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-milan-600 uppercase tracking-wider block">
                      {activeProject.primarySkill.toUpperCase()} · {activeProject.difficulty}
                    </span>
                    <h4 className="text-base font-extrabold text-espresso-900 mt-1">
                      {activeProject.title}
                    </h4>
                    <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
                      {activeProject.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold flex-shrink-0">
                    70% To Qualify
                  </span>
                </div>

                {/* Rubric Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-milan-600/10">
                  <span className="text-xs font-bold text-espresso-900 block">
                    Authoritative Evaluation Rubric:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeProject.rubric.map((r) => (
                      <div key={r.id} className="p-2.5 rounded-xl bg-white border border-milan-600/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-espresso-900 text-[11px]">{r.name}</span>
                          <span className="text-[10px] font-bold text-milan-600">{r.maxScore} pts</span>
                        </div>
                        <p className="text-[10px] text-espresso-muted line-clamp-1">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <GlowButton href={`/projects/${activeProject.id}`} size="sm" variant="primary">
                    View Project Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </GlowButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
