/**
 * SEVA Skill Passport — Assessment Lifecycle & Evaluation Service (Phase 4)
 * 
 * Manages assessment attempts, server-enforced time limits, safe refresh recovery,
 * answer key shielding, server-side evaluation, and idempotent evidence generation.
 */

import {
  AssessmentConfig,
  AssessmentAttempt,
  QuestionBankItem,
  ClientAssessmentQuestion,
  AttemptEvaluationSummary,
  AssessmentAuditEvent,
  AssessmentCooldown,
} from '@/types/assessment';
import { QUESTION_BANK, SEED_ASSESSMENTS } from '@/data/question-bank';
import {
  selectQuestionsForAttempt,
  sanitizeQuestionsForClient,
  evaluateAssessmentAttempt,
} from './engine';
import { DataService, StoredEvidence } from '@/lib/data-service';
import { generateEvidenceHash } from '@/lib/evidence/hash';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

const STORAGE_PREFIX = 'seva_db_';
const KEY_ASSESSMENT_ATTEMPTS = `${STORAGE_PREFIX}assessment_attempts`;
const KEY_ASSESSMENT_CONFIGS = `${STORAGE_PREFIX}assessment_configs`;
const KEY_ASSESSMENT_AUDIT = `${STORAGE_PREFIX}assessment_audit`;
const KEY_ASSESSMENT_COOLDOWNS = `${STORAGE_PREFIX}assessment_cooldowns`;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return getSupabaseServerAdminClient() || getSupabaseBrowserClient();
  }
  return getSupabaseBrowserClient();
}

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

import { getLocal, setLocal } from '@/lib/storage';

export const AssessmentService = {
  /**
   * Returns all active assessments configured on the platform.
   */
  getAvailableAssessments(): AssessmentConfig[] {
    const stored = getLocal<AssessmentConfig[]>(KEY_ASSESSMENT_CONFIGS, []);
    if (stored.length > 0) return stored;
    return SEED_ASSESSMENTS;
  },

  /**
   * Retrieves configuration for a specific assessment.
   */
  getAssessmentById(assessmentId: string): AssessmentConfig | null {
    const all = this.getAvailableAssessments();
    return all.find((a) => a.id.toLowerCase() === assessmentId.toLowerCase()) || null;
  },

  /**
   * Retrieves all attempts by a user for a specific assessment.
   */
  getUserAttempts(userId: string, assessmentId?: string): AssessmentAttempt[] {
    const attempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    return attempts.filter((att) => {
      if (att.userId !== userId) return false;
      if (assessmentId && att.assessmentId.toLowerCase() !== assessmentId.toLowerCase()) return false;
      return true;
    }).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  /**
   * Starts a new attempt or safely resumes an active in-progress attempt (refresh recovery).
   */
  async startOrResumeAttempt(params: {
    userId: string;
    assessmentId: string;
  }): Promise<{
    attempt: AssessmentAttempt;
    questions: ClientAssessmentQuestion[];
    isResumed: boolean;
    error?: string;
  }> {
    const { userId, assessmentId } = params;
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const allAttempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    const userPriorAttempts = allAttempts.filter(
      (a) => a.userId === userId && a.assessmentId === assessmentId
    );

    // 0. Check for Server-Enforced 24-Hour Cooldown
    const activeCooldown = this.getActiveCooldown(userId, assessmentId);
    if (activeCooldown && new Date(activeCooldown.unlockAt).getTime() > Date.now()) {
      const remainingMs = new Date(activeCooldown.unlockAt).getTime() - Date.now();
      const remainingHours = (remainingMs / (3600 * 1000)).toFixed(1);
      throw new Error(
        `Assessment is locked under 24-hour security cooldown. Unlock time: ${new Date(
          activeCooldown.unlockAt
        ).toLocaleString()} (~${remainingHours} hours remaining). Reason: ${activeCooldown.reason}`
      );
    }

    // 1. Check for an active in-progress attempt that has not expired
    const now = new Date().getTime();
    const activeAttempt = userPriorAttempts.find(
      (a) => a.status === 'in_progress' && new Date(a.expiresAt).getTime() > now
    );

    if (activeAttempt) {
      // Refresh Recovery: Return active attempt and sanitized assigned questions
      const assignedQuestions = QUESTION_BANK.filter((q) => activeAttempt.questionIds.includes(q.id));
      // Preserve assigned order
      const orderedQuestions = activeAttempt.questionIds
        .map((qid) => assignedQuestions.find((q) => q.id === qid))
        .filter(Boolean) as QuestionBankItem[];

      return {
        attempt: activeAttempt,
        questions: sanitizeQuestionsForClient(orderedQuestions),
        isResumed: true,
      };
    }

    // 2. Expire any stale in-progress attempts whose deadline has elapsed
    userPriorAttempts.forEach((a) => {
      if (a.status === 'in_progress' && new Date(a.expiresAt).getTime() <= now) {
        a.status = 'timed_out';
      }
    });

    // 3. Enforce maximum attempts limit server-side
    const completedAttemptsCount = userPriorAttempts.filter(
      (a) => a.status === 'evaluated' || a.status === 'submitted' || a.status === 'timed_out'
    ).length;

    if (completedAttemptsCount >= assessment.maxAttempts) {
      throw new Error(`Maximum attempts (${assessment.maxAttempts}) reached for this assessment.`);
    }

    // 4. Select questions from the pool according to difficulty distribution
    const selected = selectQuestionsForAttempt(assessment, QUESTION_BANK);
    const questionIds = selected.map((q) => q.id);

    const attemptNumber = completedAttemptsCount + 1;
    const startedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + assessment.durationMinutes * 60 * 1000).toISOString();

    const attemptId = isUuid(userId)
      ? generateAttemptId()
      : `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      userId,
      assessmentId,
      attemptNumber,
      startedAt,
      expiresAt,
      submittedAt: null,
      timeTakenSeconds: 0,
      status: 'in_progress',
      totalMarks: assessment.totalMarks,
      earnedMarks: 0,
      percentage: 0,
      answers: {},
      markedForReview: [],
      questionIds,
      evaluationResults: null,
      evidenceId: null,
    };

    allAttempts.push(newAttempt);
    setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);

    const sb = getSupabaseClient();
    if (sb && isUuid(userId) && isUuid(newAttempt.id)) {
      try {
        await (sb as any).from('assessment_attempts').insert({
          id: newAttempt.id,
          user_id: newAttempt.userId,
          assessment_id: newAttempt.assessmentId,
          attempt_number: newAttempt.attemptNumber,
          started_at: newAttempt.startedAt,
          expires_at: newAttempt.expiresAt,
          status: 'in_progress',
          total_marks: newAttempt.totalMarks,
          earned_marks: 0,
          percentage: 0,
          answers: {},
          marked_for_review: [],
          question_ids: newAttempt.questionIds,
        });
      } catch (err) {
        console.warn('Supabase assessment_attempts insert fallback:', err);
      }
    }

    // Log start audit event
    this.logAuditEvent({
      attemptId: newAttempt.id,
      userId,
      eventType: 'start',
      metadata: { assessmentId, attemptNumber, questionCount: questionIds.length },
    });

    return {
      attempt: newAttempt,
      questions: sanitizeQuestionsForClient(selected),
      isResumed: false,
    };
  },

  /**
   * Saves student answer progress periodically during the test.
   */
  saveAnswerProgress(params: {
    userId: string;
    attemptId: string;
    answers: Record<string, string[]>;
    markedForReview?: string[];
  }): { success: boolean; error?: string } {
    const { userId, attemptId, answers, markedForReview } = params;
    const allAttempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    const attempt = allAttempts.find((a) => a.id === attemptId);

    if (!attempt) return { success: false, error: 'Attempt not found' };
    if (attempt.userId !== userId) return { success: false, error: 'Unauthorized attempt access' };
    if (attempt.status !== 'in_progress') return { success: false, error: 'Attempt is no longer active' };

    // Enforce server deadline with 30s network grace period
    const now = Date.now();
    const expiry = new Date(attempt.expiresAt).getTime();
    if (now > expiry + 30000) {
      attempt.status = 'timed_out';
      setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);
      return { success: false, error: 'Assessment deadline has expired.' };
    }

    attempt.answers = answers;
    if (markedForReview) {
      attempt.markedForReview = markedForReview;
    }

    setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);

    const sb = getSupabaseClient();
    if (sb && isUuid(userId) && isUuid(attemptId)) {
      try {
        (sb as any)
          .from('assessment_attempts')
          .update({
            answers,
            marked_for_review: markedForReview || [],
            status: attempt.status,
          })
          .eq('id', attemptId)
          .eq('user_id', userId)
          .then();
      } catch (err) {
        console.warn('Supabase assessment_attempts save fallback:', err);
      }
    }

    return { success: true };
  },

  /**
   * Submits and evaluates an assessment attempt server-side.
   * Generates verifiable assessment evidence and recalculates competency.
   */
  async submitAndEvaluateAttempt(params: {
    userId: string;
    attemptId: string;
    answers: Record<string, string[]>;
  }): Promise<{
    evaluation: AttemptEvaluationSummary;
    attempt: AssessmentAttempt;
    evidenceRecord?: StoredEvidence;
  }> {
    const { userId, attemptId, answers } = params;
    const allAttempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    const attempt = allAttempts.find((a) => a.id === attemptId);

    if (!attempt) throw new Error('Attempt record not found');
    if (attempt.userId !== userId) throw new Error('Unauthorized attempt submission');
    
    // Check duplicate submission prevention
    if (attempt.status === 'evaluated') {
      if (attempt.evaluationResults) {
        return { evaluation: attempt.evaluationResults, attempt };
      }
    }

    const assessment = this.getAssessmentById(attempt.assessmentId);
    if (!assessment) throw new Error('Associated assessment config not found');

    const submittedAt = new Date().toISOString();
    const now = Date.now();
    const expiry = new Date(attempt.expiresAt).getTime();

    // Check timeout condition
    let finalStatus: 'evaluated' | 'timed_out' = 'evaluated';
    if (now > expiry + 30000) {
      finalStatus = 'timed_out';
    }

    // Retrieve original assigned questions from question bank with answer keys
    const assignedQuestions = attempt.questionIds
      .map((qid) => QUESTION_BANK.find((q) => q.id === qid))
      .filter(Boolean) as QuestionBankItem[];

    // Server-Side Evaluation
    const evaluation = evaluateAssessmentAttempt({
      attemptId,
      userId,
      assessment,
      assignedQuestions,
      submittedAnswers: answers,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      submittedAt,
    });

    attempt.answers = answers;
    attempt.submittedAt = submittedAt;
    attempt.timeTakenSeconds = evaluation.timeTakenSeconds;
    attempt.status = finalStatus;
    attempt.earnedMarks = evaluation.earnedMarks;
    attempt.totalMarks = evaluation.totalMarks;
    attempt.percentage = evaluation.percentage;

    // Connect to Evidence Engine (IDEMPOTENT CREATION)
    let createdEvidence: StoredEvidence | undefined;
    if (!attempt.evidenceId) {
      const primarySkill = assessment.skillId === 'full-stack' ? 'react' : assessment.skillId;
      const primaryDimension = evaluation.weakAreas.length > 0
        ? evaluation.weakAreas[0].dimension
        : 'Architecture';

      const hash = await generateEvidenceHash({
        userId,
        skillId: primarySkill,
        sourceType: 'assessment',
        sourceId: assessment.id,
        score: evaluation.percentage,
        difficulty: assessment.difficultyDistribution.HARD > 0 ? 'HARD' : 'MEDIUM',
        qualityLevel: 'ADVANCED',
        dimension: primaryDimension,
        attemptNumber: attempt.attemptNumber,
        timestamp: submittedAt,
        metadata: {
          attemptId,
          assessmentTitle: assessment.title,
          passed: evaluation.passed,
          earnedMarks: evaluation.earnedMarks,
          totalMarks: evaluation.totalMarks,
          skillBreakdown: evaluation.skillBreakdown,
        },
      });

      createdEvidence = await DataService.addEvidence({
        userId,
        skillId: primarySkill,
        sourceType: 'assessment',
        sourceId: assessment.id,
        score: evaluation.percentage,
        difficulty: assessment.difficultyDistribution.HARD > 0 ? 'HARD' : 'MEDIUM',
        qualityLevel: 'ADVANCED',
        dimension: primaryDimension,
        attemptNumber: attempt.attemptNumber,
        lastDemonstratedAt: submittedAt,
        verificationHash: hash,
        metadata: {
          attemptId,
          assessmentTitle: assessment.title,
          passed: evaluation.passed,
          earnedMarks: evaluation.earnedMarks,
          totalMarks: evaluation.totalMarks,
          skillBreakdown: evaluation.skillBreakdown,
        },
      });

      attempt.evidenceId = createdEvidence.id;
      evaluation.evidenceId = createdEvidence.id;
      evaluation.verificationHash = hash;
    }

    attempt.evaluationResults = evaluation;
    setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);

    const sb = getSupabaseClient();
    if (sb && isUuid(userId) && isUuid(attemptId)) {
      try {
        await (sb as any)
          .from('assessment_attempts')
          .update({
            submitted_at: submittedAt,
            time_taken_seconds: evaluation.timeTakenSeconds,
            status: finalStatus,
            score: evaluation.percentage,
            earned_marks: evaluation.earnedMarks,
            total_marks: evaluation.totalMarks,
            percentage: evaluation.percentage,
            answers,
            evaluation_results: evaluation,
            skill_breakdown: evaluation.skillBreakdown,
            dimension_breakdown: evaluation.dimensionBreakdown,
            weak_areas: evaluation.weakAreas,
            evidence_id: attempt.evidenceId,
          })
          .eq('id', attemptId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase submit assessment_attempts update fallback:', err);
      }
    }

    // Log submit audit event
    this.logAuditEvent({
      attemptId,
      userId,
      eventType: finalStatus === 'timed_out' ? 'timeout' : 'submit',
      metadata: {
        score: evaluation.percentage,
        passed: evaluation.passed,
        earnedMarks: evaluation.earnedMarks,
      },
    });

    return {
      evaluation,
      attempt,
      evidenceRecord: createdEvidence,
    };
  },

  /**
   * Retrieves evaluated results for an attempt with explanations.
   */
  getAttemptResult(userId: string, attemptId: string): {
    attempt: AssessmentAttempt;
    evaluation: AttemptEvaluationSummary;
    assessment: AssessmentConfig;
  } | null {
    const allAttempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    const attempt = allAttempts.find((a) => a.id === attemptId);
    if (!attempt || attempt.userId !== userId) return null;
    if (!attempt.evaluationResults) return null;

    const assessment = this.getAssessmentById(attempt.assessmentId);
    if (!assessment) return null;

    return {
      attempt,
      evaluation: attempt.evaluationResults,
      assessment,
    };
  },

  /**
   * Logs assessment telemetry audit events.
   */
  logAuditEvent(event: Omit<AssessmentAuditEvent, 'id' | 'createdAt'>): void {
    const sb = getSupabaseClient();
    if (sb && isUuid(event.userId) && isUuid(event.attemptId)) {
      try {
        (sb as any)
          .from('assessment_audit_events')
          .insert({
            attempt_id: event.attemptId,
            user_id: event.userId,
            event_type: event.eventType,
            metadata: event.metadata || {},
          })
          .then();
      } catch (err) {
        console.warn('Supabase audit log fallback:', err);
      }
    }

    const events = getLocal<AssessmentAuditEvent[]>(KEY_ASSESSMENT_AUDIT, []);
    events.push({
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
    setLocal(KEY_ASSESSMENT_AUDIT, events);
  },

  /**
   * Records a security violation event, evaluates threshold (3 violations),
   * and terminates attempt with a 24-hour cooldown if threshold is breached.
   */
  async recordSecurityEvent(params: {
    attemptId: string;
    userId: string;
    eventType: AssessmentAuditEvent['eventType'];
    metadata?: Record<string, any>;
  }): Promise<{
    recorded: boolean;
    violationCount: number;
    terminated: boolean;
    cooldownUntil?: string;
    reason?: string;
  }> {
    const { attemptId, userId, eventType, metadata = {} } = params;
    const allAttempts = getLocal<AssessmentAttempt[]>(KEY_ASSESSMENT_ATTEMPTS, []);
    const attempt = allAttempts.find((a) => a.id === attemptId);

    // Log the audit event
    this.logAuditEvent({
      attemptId,
      userId,
      eventType,
      metadata,
    });

    if (!attempt || attempt.status !== 'in_progress') {
      return { recorded: true, violationCount: 0, terminated: false };
    }

    const isViolation =
      eventType === 'visibility_lost' ||
      eventType === 'fullscreen_exit' ||
      eventType === 'camera_interrupted';

    if (isViolation) {
      attempt.violationCount = (attempt.violationCount || 0) + 1;
      attempt.lastViolationAt = new Date().toISOString();

      if (attempt.violationCount >= 3) {
        attempt.status = 'terminated';
        attempt.terminatedAt = new Date().toISOString();
        attempt.terminationReason = 'violation_limit_exceeded';
        attempt.cooldownUntil = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

        // Register cooldown in persistent store
        const cooldowns = getLocal<AssessmentCooldown[]>(KEY_ASSESSMENT_COOLDOWNS, []);
        cooldowns.push({
          id: generateAttemptId(),
          userId,
          assessmentId: attempt.assessmentId,
          attemptId: attempt.id,
          reason: 'violation_limit_exceeded (Exceeded 3 visibility-loss / fullscreen-exit events)',
          violationCount: attempt.violationCount,
          lockedAt: new Date().toISOString(),
          unlockAt: attempt.cooldownUntil,
          status: 'active',
        });
        setLocal(KEY_ASSESSMENT_COOLDOWNS, cooldowns);
        setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);

        return {
          recorded: true,
          violationCount: attempt.violationCount,
          terminated: true,
          cooldownUntil: attempt.cooldownUntil,
          reason: attempt.terminationReason,
        };
      }

      setLocal(KEY_ASSESSMENT_ATTEMPTS, allAttempts);
      return {
        recorded: true,
        violationCount: attempt.violationCount,
        terminated: false,
      };
    }

    return { recorded: true, violationCount: attempt.violationCount || 0, terminated: false };
  },

  /**
   * Retrieves active security cooldown for a learner on an assessment.
   */
  getActiveCooldown(userId: string, assessmentId: string): AssessmentCooldown | null {
    const cooldowns = getLocal<AssessmentCooldown[]>(KEY_ASSESSMENT_COOLDOWNS, []);
    const now = Date.now();
    return (
      cooldowns.find(
        (c) =>
          c.userId === userId &&
          c.assessmentId.toLowerCase() === assessmentId.toLowerCase() &&
          c.status === 'active' &&
          new Date(c.unlockAt).getTime() > now
      ) || null
    );
  },

  /**
   * Submits an administrative appeal for an active cooldown.
   */
  submitCooldownAppeal(cooldownId: string, userId: string, notes: string): boolean {
    const cooldowns = getLocal<AssessmentCooldown[]>(KEY_ASSESSMENT_COOLDOWNS, []);
    const cd = cooldowns.find((c) => c.id === cooldownId && c.userId === userId);
    if (!cd) return false;
    cd.status = 'appealed';
    cd.appealNotes = notes;
    cd.appealedAt = new Date().toISOString();
    setLocal(KEY_ASSESSMENT_COOLDOWNS, cooldowns);
    return true;
  },
};
