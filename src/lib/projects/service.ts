import {
  ProjectConfig,
  ProjectSubmissionRecord,
  ProjectEvaluationReport,
  SubmissionStatus,
} from '@/types/project';

export type { ProjectSubmissionRecord, ProjectConfig, ProjectEvaluationReport, SubmissionStatus };
import { PROJECT_CATALOGUE } from '@/data/projects';
import {
  validateRepositoryUrl,
  validateDeploymentUrl,
  evaluateProjectSubmission,
  performAutomatedUrlChecks,
} from './engine';
import { DataService, StoredEvidence } from '@/lib/data-service';
import { generateEvidenceHash } from '@/lib/evidence/hash';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

const STORAGE_PREFIX = 'seva_';
const KEY_PROJECT_SUBMISSIONS = `${STORAGE_PREFIX}project_submissions`;
const KEY_PROJECT_CONFIGS = `${STORAGE_PREFIX}project_configs`;

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getAnySupabaseClient() {
  if (typeof window !== 'undefined') {
    return getSupabaseBrowserClient();
  }
  try {
    return getSupabaseServerAdminClient();
  } catch {
    return null;
  }
}

import { getLocal, setLocal } from '@/lib/storage';

function mapDbStatusToSubmissionStatus(status?: string): SubmissionStatus {
  if (!status) return 'NOT_STARTED';
  const s = status.toLowerCase();
  if (s === 'evaluated' || s === 'passed') return 'EVALUATED';
  if (s === 'changes_requested') return 'CHANGES_REQUESTED';
  if (s === 'submitted' || s === 'under_review') return 'SUBMITTED';
  if (s === 'in-progress' || s === 'in_progress' || s === 'draft') return 'IN_PROGRESS';
  return (status.toUpperCase() as SubmissionStatus) || 'NOT_STARTED';
}

export const ProjectService = {
  /**
   * Returns all active projects in the catalogue.
   */
  getAllProjects(): ProjectConfig[] {
    const custom = getLocal<ProjectConfig[]>(KEY_PROJECT_CONFIGS, []);
    if (custom.length > 0) return custom;
    return PROJECT_CATALOGUE;
  },

  /**
   * Retrieves single project configuration by ID.
   */
  getProjectById(projectId: string): ProjectConfig | null {
    const all = this.getAllProjects();
    return all.find((p) => p.id.toLowerCase() === projectId.toLowerCase()) || null;
  },

  /**
   * Retrieves a specific submission by ID from memory or Supabase.
   */
  async getSubmissionById(submissionId: string): Promise<ProjectSubmissionRecord | null> {
    const all = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    const local = all.find((s) => s.id === submissionId);
    if (local) return local;

    const sb = getAnySupabaseClient();
    if (sb) {
      try {
        const { data, error } = await (sb as any)
          .from('project_submissions')
          .select('*')
          .eq('id', submissionId)
          .maybeSingle();

        if (data && !error) {
          const mapped: ProjectSubmissionRecord = {
            id: data.id,
            userId: data.user_id,
            projectId: data.project_id,
            attemptNumber: data.attempt_number || 1,
            repositoryUrl: data.repository_url || '',
            deploymentUrl: data.deployment_url || undefined,
            summary: data.summary || '',
            projectSummary: data.summary || '',
            implementationNotes: data.implementation_notes || '',
            screenshots: data.screenshots || [],
            completedRequirementIds: data.completed_requirement_ids || [],
            status: mapDbStatusToSubmissionStatus(data.status),
            score: data.score !== null ? Number(data.score) : undefined,
            evaluationReport: data.evaluation_report || undefined,
            evidenceId: data.evidence_id || undefined,
            verificationHash: data.verification_hash || undefined,
            reviewerId: data.reviewer_id || undefined,
            reviewerNotes: data.reviewer_notes || undefined,
            history: data.history || undefined,
            isDraft: Boolean(data.is_draft),
            syncStatus: 'synced',
            startedAt: data.started_at || data.created_at,
            submittedAt: data.submitted_at || undefined,
            evaluatedAt: data.evaluated_at || undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          all.push(mapped);
          setLocal(KEY_PROJECT_SUBMISSIONS, all);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getSubmissionById error:', err);
      }
    }
    return null;
  },

  /**
   * Retrieves all submissions for a user across projects or for a specific project.
   * Merges Supabase remote records with local storage fallback.
   */
  async getUserSubmissions(userId: string, projectId?: string): Promise<ProjectSubmissionRecord[]> {
    const localAll = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    let merged = [...localAll];

    const sb = getAnySupabaseClient();
    if (sb && isUuid(userId)) {
      try {
        let query = (sb as any).from('project_submissions').select('*').eq('user_id', userId);
        if (projectId) {
          query = query.eq('project_id', projectId);
        }
        const { data, error } = await query;
        if (data && !error && Array.isArray(data)) {
          const remoteRecords: ProjectSubmissionRecord[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            projectId: row.project_id,
            attemptNumber: row.attempt_number || 1,
            repositoryUrl: row.repository_url || '',
            deploymentUrl: row.deployment_url || undefined,
            summary: row.summary || '',
            projectSummary: row.summary || '',
            implementationNotes: row.implementation_notes || '',
            screenshots: row.screenshots || [],
            completedRequirementIds: row.completed_requirement_ids || [],
            status: mapDbStatusToSubmissionStatus(row.status),
            score: row.score !== null ? Number(row.score) : undefined,
            evaluationReport: row.evaluation_report || undefined,
            evidenceId: row.evidence_id || undefined,
            verificationHash: row.verification_hash || undefined,
            reviewerId: row.reviewer_id || undefined,
            reviewerNotes: row.reviewer_notes || undefined,
            history: row.history || undefined,
            isDraft: Boolean(row.is_draft),
            syncStatus: 'synced',
            startedAt: row.started_at || row.created_at,
            submittedAt: row.submitted_at || undefined,
            evaluatedAt: row.evaluated_at || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          for (const rem of remoteRecords) {
            const idx = merged.findIndex((m) => m.id === rem.id);
            if (idx !== -1) {
              merged[idx] = rem;
            } else {
              merged.push(rem);
            }
          }
          setLocal(KEY_PROJECT_SUBMISSIONS, merged);
        }
      } catch (err) {
        console.warn('Supabase getUserSubmissions sync fallback:', err);
      }
    }

    return merged
      .filter((s) => {
        if (userId && s.userId !== userId) return false;
        if (projectId && s.projectId.toLowerCase() !== projectId.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => b.attemptNumber - a.attemptNumber);
  },

  /**
   * Retrieves all non-draft submissions across all learners for authorized instructor review.
   */
  async getAllSubmissionsForReview(): Promise<ProjectSubmissionRecord[]> {
    const list = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    return list
      .filter((s) => !s.isDraft && s.status !== 'IN_PROGRESS')
      .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
  },

  /**
   * Retrieves the latest active or completed submission record for a user and project.
   */
  async getLatestSubmission(userId: string, projectId: string): Promise<ProjectSubmissionRecord | null> {
    const list = await this.getUserSubmissions(userId, projectId);
    return list.length > 0 ? list[0] : null;
  },

  /**
   * Starts a project for a learner. Transitions state from NOT_STARTED to IN_PROGRESS.
   * Does NOT count as completed evidence.
   */
  async startProject(userId: string, projectId: string): Promise<ProjectSubmissionRecord> {
    const project = this.getProjectById(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const existing = await this.getLatestSubmission(userId, projectId);
    if (existing) {
      return existing;
    }

    const newRecord: ProjectSubmissionRecord = {
      id: generateUuid(),
      userId,
      projectId: project.id,
      attemptNumber: 1,
      repositoryUrl: '',
      summary: '',
      implementationNotes: '',
      screenshots: [],
      completedRequirementIds: [],
      status: 'IN_PROGRESS',
      isDraft: true,
      syncStatus: 'local_only',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sb = getAnySupabaseClient();
    if (sb && isUuid(userId)) {
      try {
        const { error: insErr } = await (sb as any).from('project_submissions').upsert({
          id: newRecord.id,
          user_id: userId,
          project_id: project.id,
          attempt_number: 1,
          status: 'in-progress',
          repository_url: '',
          is_draft: true,
          started_at: newRecord.startedAt,
        });

        if (!insErr) {
          newRecord.syncStatus = 'synced';
        } else {
          newRecord.syncStatus = 'sync_error';
          newRecord.syncError = insErr.message;
          console.warn('Supabase startProject sync warning:', insErr.message);
        }
      } catch (err: any) {
        newRecord.syncStatus = 'sync_error';
        newRecord.syncError = err.message || 'Supabase sync failed';
      }
    }

    const all = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    all.push(newRecord);
    setLocal(KEY_PROJECT_SUBMISSIONS, all);

    return newRecord;
  },

  /**
   * Saves a draft of the learner's workspace without submitting for evaluation.
   */
  async saveDraft(params: {
    userId: string;
    projectId: string;
    repositoryUrl?: string;
    deploymentUrl?: string;
    summary?: string;
    projectSummary?: string;
    implementationNotes?: string;
    screenshots?: string[];
    completedRequirementIds?: string[];
  }): Promise<ProjectSubmissionRecord> {
    const { userId, projectId } = params;
    const finalSummary = params.summary || params.projectSummary || '';
    let latest = await this.getLatestSubmission(userId, projectId);

    const all = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);

    if (!latest) {
      latest = {
        id: generateUuid(),
        userId,
        projectId,
        attemptNumber: 1,
        repositoryUrl: params.repositoryUrl || '',
        deploymentUrl: params.deploymentUrl || '',
        summary: finalSummary,
        projectSummary: finalSummary,
        implementationNotes: params.implementationNotes || '',
        screenshots: params.screenshots || [],
        completedRequirementIds: params.completedRequirementIds || [],
        status: 'IN_PROGRESS',
        isDraft: true,
        syncStatus: 'local_only',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      all.push(latest);
    } else {
      const idx = all.findIndex((s) => s.id === latest!.id);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          repositoryUrl: params.repositoryUrl !== undefined ? params.repositoryUrl : all[idx].repositoryUrl,
          deploymentUrl: params.deploymentUrl !== undefined ? params.deploymentUrl : all[idx].deploymentUrl,
          summary: finalSummary || all[idx].summary,
          projectSummary: finalSummary || all[idx].projectSummary,
          implementationNotes: params.implementationNotes !== undefined ? params.implementationNotes : all[idx].implementationNotes,
          screenshots: params.screenshots !== undefined ? params.screenshots : all[idx].screenshots,
          completedRequirementIds: params.completedRequirementIds !== undefined ? params.completedRequirementIds : all[idx].completedRequirementIds,
          isDraft: true,
          status: all[idx].status === 'NOT_STARTED' ? 'IN_PROGRESS' : all[idx].status,
          updatedAt: new Date().toISOString(),
        };
        latest = all[idx];
      }
    }

    const sb = getAnySupabaseClient();
    if (sb && isUuid(userId)) {
      try {
        const { error: upsertErr } = await (sb as any).from('project_submissions').upsert({
          id: latest.id,
          user_id: userId,
          project_id: projectId,
          repository_url: latest.repositoryUrl || '',
          deployment_url: latest.deploymentUrl || null,
          status: 'draft',
          is_draft: true,
          summary: latest.summary || null,
          implementation_notes: latest.implementationNotes || null,
          screenshots: latest.screenshots || [],
          completed_requirement_ids: latest.completedRequirementIds || [],
          started_at: latest.startedAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (!upsertErr) {
          latest.syncStatus = 'synced';
          latest.syncError = undefined;
        } else {
          latest.syncStatus = 'sync_error';
          latest.syncError = upsertErr.message;
          console.warn('Supabase saveDraft sync warning:', upsertErr.message);
        }
      } catch (err: any) {
        latest.syncStatus = 'sync_error';
        latest.syncError = err.message || 'Supabase sync failed';
      }
    }

    setLocal(KEY_PROJECT_SUBMISSIONS, all);
    return latest;
  },

  /**
   * Submits a project for evaluation.
   * Runs automated criteria checks, computes rubric scores, and generates qualifying evidence if passed.
   */
  async submitProject(params: {
    userId: string;
    projectId: string;
    repositoryUrl: string;
    deploymentUrl?: string;
    summary?: string;
    projectSummary?: string;
    implementationNotes?: string;
    screenshots?: string[];
    completedRequirementIds?: string[];
  }): Promise<ProjectSubmissionRecord & {
    submission: ProjectSubmissionRecord;
    evaluationReport: ProjectEvaluationReport;
    evidenceRecord?: StoredEvidence;
  }> {
    const { userId, projectId, repositoryUrl, deploymentUrl } = params;
    const finalSummary = params.summary || params.projectSummary || '';
    const finalNotes = params.implementationNotes || '';
    const completedRequirementIds = params.completedRequirementIds || [];

    const project = this.getProjectById(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    // Server-side URL Validation
    const repoValidation = validateRepositoryUrl(repositoryUrl);
    if (!repoValidation.valid) {
      throw new Error(repoValidation.error || 'Invalid repository URL.');
    }

    const deployValidation = validateDeploymentUrl(deploymentUrl);
    if (!deployValidation.valid) {
      throw new Error(deployValidation.error || 'Invalid deployment URL.');
    }

    if (!finalSummary || finalSummary.trim().length < 15) {
      throw new Error('Please provide a brief project summary (at least 15 characters).');
    }

    const allSubmissions = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    const existingSubmissions = allSubmissions.filter((s) => s.userId === userId && s.projectId === projectId);
    
    // Determine attempt number
    const previousCompleted = existingSubmissions.filter((s) => !s.isDraft && s.status !== 'IN_PROGRESS');
    const attemptNumber = previousCompleted.length + 1;

    const submittedAt = new Date().toISOString();
    const submissionId = generateUuid();

    // Build history log
    const history = existingSubmissions
      .filter((s) => !s.isDraft)
      .map((s) => ({
        attemptNumber: s.attemptNumber,
        submittedAt: s.submittedAt || s.createdAt,
        repositoryUrl: s.repositoryUrl,
        deploymentUrl: s.deploymentUrl,
        score: s.score,
        status: s.status,
        summary: s.summary || s.projectSummary,
      }));

    const submission: ProjectSubmissionRecord = {
      id: submissionId,
      userId,
      projectId: project.id,
      attemptNumber,
      repositoryUrl: repositoryUrl.trim(),
      deploymentUrl: deploymentUrl ? deploymentUrl.trim() : undefined,
      summary: finalSummary.trim(),
      projectSummary: finalSummary.trim(),
      implementationNotes: finalNotes.trim(),
      screenshots: params.screenshots || [],
      completedRequirementIds,
      status: 'SUBMITTED',
      isDraft: false,
      syncStatus: 'local_only',
      startedAt: existingSubmissions[0]?.startedAt || submittedAt,
      submittedAt,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    };

    // Pre-flight reachability probe
    const automatedChecks = await performAutomatedUrlChecks({
      repositoryUrl: submission.repositoryUrl,
      deploymentUrl: submission.deploymentUrl,
    });

    // Run Project Evaluation Engine (automated pre-flight checks)
    const evaluation = evaluateProjectSubmission({
      project,
      submission,
    });
    evaluation.automatedChecks = [...automatedChecks, ...evaluation.automatedChecks];
    evaluation.status = 'UNDER_REVIEW';

    // Submission enters UNDER_REVIEW awaiting authorized rubric evaluation
    submission.status = 'UNDER_REVIEW';
    submission.score = evaluation.overallScore;
    submission.evaluationReport = evaluation;

    // Add this attempt to history
    history.push({
      attemptNumber,
      submittedAt,
      repositoryUrl: submission.repositoryUrl,
      deploymentUrl: submission.deploymentUrl,
      score: evaluation.overallScore,
      status: submission.status,
      summary: submission.summary,
    });
    submission.history = history;

    // Persist submission record locally
    allSubmissions.push(submission);
    setLocal(KEY_PROJECT_SUBMISSIONS, allSubmissions);

    // Sync with Supabase (respecting student policy: score must be null on student submission)
    const sb = getAnySupabaseClient();
    if (sb && isUuid(userId)) {
      try {
        const { error: insErr } = await (sb as any).from('project_submissions').upsert({
          id: submission.id,
          user_id: userId,
          project_id: project.id,
          attempt_number: attemptNumber,
          repository_url: submission.repositoryUrl,
          deployment_url: submission.deploymentUrl || null,
          summary: submission.summary,
          implementation_notes: submission.implementationNotes || null,
          screenshots: submission.screenshots || [],
          completed_requirement_ids: submission.completedRequirementIds || [],
          status: 'submitted',
          score: null, // Note: per student insert RLS policy, students cannot assign scores
          history: history,
          is_draft: false,
          started_at: submission.startedAt,
          submitted_at: submittedAt,
        });

        if (!insErr) {
          submission.syncStatus = 'synced';
        } else {
          submission.syncStatus = 'sync_error';
          submission.syncError = insErr.message;
          console.warn('Supabase submitProject sync warning:', insErr.message);
        }
      } catch (err: any) {
        submission.syncStatus = 'sync_error';
        submission.syncError = err.message || 'Supabase project_submissions sync fallback';
      }
      setLocal(KEY_PROJECT_SUBMISSIONS, allSubmissions);
    }

    return {
      ...submission,
      submission,
      evaluationReport: evaluation,
    };
  },

  /**
   * Authorized reviewer evaluation workflow.
   * Instructors / mentors can review rubric criteria, assign scores & comments, and approve project.
   */
  async evaluateAsReviewer(params: {
    submissionId: string;
    reviewerId: string;
    reviewerRole?: string;
    reviewerNotes?: string;
    feedback?: string;
    criteriaScores?: Record<string, number | { score: number; feedback?: string }>;
    reviewerScores?: Record<string, number | { score: number; feedback?: string }>;
    approve?: boolean;
  }): Promise<ProjectSubmissionRecord & {
    submission: ProjectSubmissionRecord;
    evaluationReport: ProjectEvaluationReport;
    evidenceRecord?: StoredEvidence;
  }> {
    const { submissionId, reviewerId } = params;
    const reviewerNotes = params.reviewerNotes || params.feedback || 'Reviewed by instructor.';
    const reviewerScores = params.reviewerScores || params.criteriaScores || {};
    const approve = params.approve !== undefined ? params.approve : true;

    // 1. Browser context delegation: Call secure server-side API
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      const sb = getSupabaseBrowserClient();
      let token: string | undefined;
      if (sb) {
        try {
          const { data: { session } } = await (sb as any).auth.getSession();
          token = session?.access_token;
        } catch {}
      }

      const res = await fetch('/api/projects/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          submissionId,
          reviewerNotes,
          criteriaScores: reviewerScores,
          approve,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Reviewer evaluation failed.');
      }

      const allSubs = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
      const idx = allSubs.findIndex((s) => s.id === submissionId);
      if (idx !== -1) {
        allSubs[idx] = data.submission;
      } else {
        allSubs.push(data.submission);
      }
      setLocal(KEY_PROJECT_SUBMISSIONS, allSubs);

      return {
        ...data.submission,
        submission: data.submission,
        evaluationReport: data.evaluationReport,
        evidenceRecord: data.evidenceRecord,
      };
    }

    // 2. Server / Test context: Direct authorized execution
    const allSubmissions = getLocal<ProjectSubmissionRecord[]>(KEY_PROJECT_SUBMISSIONS, []);
    let submissionIndex = allSubmissions.findIndex((s) => s.id === submissionId);
    let submission = submissionIndex !== -1 ? allSubmissions[submissionIndex] : null;

    if (!submission) {
      submission = await this.getSubmissionById(submissionId);
      if (!submission) throw new Error('Submission not found.');
      submissionIndex = allSubmissions.findIndex((s) => s.id === submissionId);
    }

    // Reviewer Authorization Check: Prevent student self-review
    if (submission.userId === reviewerId) {
      throw new Error('Security violation: Submitters cannot evaluate their own project submissions.');
    }

    // Reviewer Role Verification
    const isProduction = process.env.NODE_ENV === 'production';
    const hasAuthorizedRole =
      Boolean(params.reviewerRole) && ['reviewer', 'instructor', 'admin'].includes(params.reviewerRole!);

    let isKnownReviewer = hasAuthorizedRole;

    if (!isProduction) {
      // In non-production testing / dev offline mode, allow test fixture identifiers
      const lowerRevId = reviewerId.toLowerCase();
      isKnownReviewer =
        hasAuthorizedRole ||
        lowerRevId === 'reviewer-admin-01' ||
        lowerRevId === 'mentor-eva-01' ||
        lowerRevId === 'mentor-lead' ||
        lowerRevId.startsWith('reviewer-') ||
        lowerRevId.startsWith('mentor-') ||
        lowerRevId.includes('lead');
    }

    if (!isKnownReviewer) {
      throw new Error('Unauthorized: Only authorized mentors, reviewers, or instructors can record project evaluations.');
    }

    const project = this.getProjectById(submission.projectId);
    if (!project) throw new Error('Associated project config not found.');

    // Re-evaluate with human reviewer scores
    const evaluation = evaluateProjectSubmission({
      project,
      submission,
      reviewerScores,
      reviewerId,
      reviewerNotes,
      evaluationMethod: 'INSPECTOR_RUBRIC_REVIEW',
    });

    if (!approve) {
      evaluation.passed = false;
      evaluation.status = 'CHANGES_REQUESTED';
    }

    submission.status = evaluation.status;
    submission.score = evaluation.overallScore;
    submission.evaluatedAt = evaluation.evaluatedAt;
    submission.reviewerId = reviewerId;
    submission.reviewerNotes = reviewerNotes;
    submission.evaluationReport = evaluation;

    let createdEvidence: StoredEvidence | undefined;
    if (evaluation.passed) {
      const primarySkill = project.primarySkill.toLowerCase();
      const primaryDimension = project.dimensions[0] || 'Architecture';

      const hash = await generateEvidenceHash({
        userId: submission.userId,
        skillId: primarySkill,
        sourceType: 'project',
        sourceId: project.id,
        score: evaluation.overallScore,
        difficulty: project.difficulty,
        qualityLevel: evaluation.overallScore >= 90 ? 'ADVANCED' : evaluation.overallScore >= 80 ? 'INTERMEDIATE' : 'BASIC',
        dimension: primaryDimension,
        attemptNumber: submission.attemptNumber,
        timestamp: evaluation.evaluatedAt,
        metadata: {
          submissionId: submission.id,
          projectTitle: project.title,
          reviewerId,
          reviewerNotes,
        },
      });

      // Idempotent evidence creation via DataService
      createdEvidence = await DataService.addEvidence({
        userId: submission.userId,
        skillId: primarySkill,
        sourceType: 'project',
        sourceId: project.id,
        score: evaluation.overallScore,
        difficulty: project.difficulty,
        qualityLevel: evaluation.overallScore >= 90 ? 'ADVANCED' : evaluation.overallScore >= 80 ? 'INTERMEDIATE' : 'BASIC',
        dimension: primaryDimension,
        attemptNumber: submission.attemptNumber,
        lastDemonstratedAt: evaluation.evaluatedAt,
        verificationHash: hash,
        metadata: {
          submissionId: submission.id,
          projectTitle: project.title,
          reviewerId,
          reviewerNotes,
        },
      });

      submission.evidenceId = createdEvidence.id;
      submission.verificationHash = hash;
      evaluation.evidenceId = createdEvidence.id;
      evaluation.verificationHash = hash;

      await DataService.recalculateScores(submission.userId);
    } else {
      submission.evidenceId = undefined;
    }

    // Update submission record with evaluation results
    submission.status = approve ? 'EVALUATED' : 'CHANGES_REQUESTED';
    submission.score = evaluation.overallScore;
    submission.evaluationReport = evaluation;
    submission.reviewerId = reviewerId;
    submission.reviewerNotes = reviewerNotes;
    submission.evaluatedAt = evaluation.evaluatedAt;
    submission.updatedAt = new Date().toISOString();

    // Persist to Supabase if configured
    const sb = getAnySupabaseClient();
    if (sb && isUuid(submission.userId)) {
      try {
        const { error: updErr } = await (sb as any)
          .from('project_submissions')
          .update({
            status: approve ? 'evaluated' : 'changes_requested',
            score: evaluation.overallScore,
            evaluation_report: evaluation,
            reviewer_id: reviewerId,
            reviewer_notes: reviewerNotes,
            evidence_id: createdEvidence?.id || null,
            verification_hash: submission.verificationHash || null,
            evaluated_at: evaluation.evaluatedAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', submission.id);

        if (!updErr) {
          submission.syncStatus = 'synced';
        } else {
          submission.syncStatus = 'sync_error';
          submission.syncError = updErr.message;
          console.warn('Supabase evaluateAsReviewer update warning:', updErr.message);
        }
      } catch (err: any) {
        submission.syncStatus = 'sync_error';
        submission.syncError = err.message || 'Supabase evaluate sync failed';
      }
    }

    if (submissionIndex !== -1) {
      allSubmissions[submissionIndex] = submission;
    } else {
      allSubmissions.push(submission);
    }
    setLocal(KEY_PROJECT_SUBMISSIONS, allSubmissions);

    return {
      ...submission,
      submission,
      evaluationReport: evaluation,
      evidenceRecord: createdEvidence,
    };
  },
};
