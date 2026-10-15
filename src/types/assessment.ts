/**
 * SEVA Skill Passport — Phase 4 Assessment Engine Type Definitions
 */

export type QuestionType =
  | 'mcq'
  | 'multiple-select'
  | 'output-prediction'
  | 'debugging'
  | 'scenario'
  | 'architecture'
  | 'sql';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionOption {
  id: string;
  text: string;
}

/**
 * Full Question Definition stored securely on server/database.
 * `correctAnswers` and `explanation` must NEVER be leaked to student before submission!
 */
export interface QuestionBankItem {
  id: string;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctAnswers: string[]; // Option IDs for MCQs/Multiple-select, or normalized output string
  explanation: string;
  difficulty: QuestionDifficulty;
  skillId: string;
  dimension: string; // e.g. 'State Management', 'Routing', 'Querying'
  marks: number;
  negativeMarks?: number;
  status: 'active' | 'inactive';
  version?: number;
}

/**
 * Sanitized Question passed to the student's browser during an active assessment attempt.
 */
export interface ClientAssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options: QuestionOption[];
  difficulty: QuestionDifficulty;
  skillId: string;
  dimension: string;
  marks: number;
  negativeMarks?: number;
}

export interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  courseId: string;
  skillId: string; // Primary skill
  skills: string[]; // Multi-skill targets
  dimensions: string[]; // Competency dimensions covered
  durationMinutes: number;
  passingThreshold: number; // Percentage, e.g. 70
  maxAttempts: number; // e.g. 3
  totalMarks: number;
  questionCount: number;
  difficultyDistribution: Record<QuestionDifficulty, number>; // e.g. { EASY: 3, MEDIUM: 5, HARD: 2 }
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  status: 'active' | 'draft';
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'evaluated' | 'timed_out' | 'abandoned' | 'terminated';

export interface QuestionEvaluationResult {
  questionId: string;
  type: QuestionType;
  skillId: string;
  dimension: string;
  maxMarks: number;
  earnedMarks: number;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  userAnswers: string[];
  correctAnswers: string[];
  explanation: string;
}

export interface AttemptEvaluationSummary {
  attemptId: string;
  assessmentId: string;
  userId: string;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
  timeTakenSeconds: number;
  submittedAt: string;
  questionResults: QuestionEvaluationResult[];
  skillBreakdown: Record<string, { totalMarks: number; earnedMarks: number; percentage: number }>;
  dimensionBreakdown: Record<string, { totalMarks: number; earnedMarks: number; percentage: number }>;
  weakAreas: Array<{ dimension: string; skillId: string; score: number; recommendation: string }>;
  evidenceId?: string;
  verificationHash?: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string;
  submittedAt?: string | null;
  timeTakenSeconds: number;
  status: AttemptStatus;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  answers: Record<string, string[]>; // questionId -> array of chosen optionIds
  markedForReview: string[]; // list of questionIds flagged by learner
  questionIds: string[]; // ordered list of questionIds assigned to this attempt
  evaluationResults?: AttemptEvaluationSummary | null;
  evidenceId?: string | null;
  terminatedAt?: string | null;
  terminationReason?: string | null;
  cooldownUntil?: string | null;
  violationCount?: number;
  lastViolationAt?: string | null;
}

export interface AssessmentAuditEvent {
  id: string;
  attemptId: string;
  userId: string;
  eventType:
    | 'start'
    | 'answer_save'
    | 'mark_review'
    | 'tab_blur'
    | 'tab_focus'
    | 'submit'
    | 'timeout'
    | 'fullscreen_enter'
    | 'fullscreen_exit'
    | 'visibility_lost'
    | 'visibility_restored'
    | 'camera_interrupted'
    | 'clipboard_attempt'
    | 'warning_issued'
    | 'terminated';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AssessmentCooldown {
  id: string;
  userId: string;
  assessmentId: string;
  attemptId: string;
  reason: string;
  violationCount: number;
  lockedAt: string;
  unlockAt: string;
  status: 'active' | 'appealed' | 'waived' | 'expired';
  appealNotes?: string;
  appealedAt?: string;
}
