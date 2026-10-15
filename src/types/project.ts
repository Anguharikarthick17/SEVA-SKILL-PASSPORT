export type ProjectDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'EVALUATED';

export type EvaluationMethod =
  | 'AUTOMATED_VERIFICATION'
  | 'INSPECTOR_RUBRIC_REVIEW'
  | 'HYBRID_VERIFIED_EVALUATION';

export interface RubricCriterion {
  id: string;
  name: string;
  category:
    | 'Functional Correctness'
    | 'Architecture & Code Quality'
    | 'API & Data Design'
    | 'Security & Validation'
    | 'Testing & Coverage'
    | 'Deployment & Git Workflow';
  maxScore: number;
  weight: number; // percentage of total score
  description: string;
  evaluatedDimension: string; // mapped competency dimension
  targetSkill: string; // mapped core skill (e.g. react, nodejs, sql, security, testing, deployment)
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
}

export interface AcceptanceCriterion {
  id: string;
  requirementId: string;
  criterion: string;
  verificationMethod: string;
}

export interface ExpectedDeliverable {
  id: string;
  title: string;
  description: string;
  required: boolean;
  type: 'repository' | 'deployment' | 'documentation' | 'test_report';
}

export interface ProjectConfig {
  id: string;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  courseId: string;
  primarySkill: string;
  skills: string[];
  requiredSkills?: string[];
  dimensions: string[];
  techStack: string[];
  recommendedTechStack?: string[];
  estimatedEffortHours: number;
  estimatedEffort?: string;
  passingScore: number; // e.g. 70
  learningObjectives: string[];
  functionalRequirements: FunctionalRequirement[];
  acceptanceCriteria: AcceptanceCriterion[];
  deliverables: ExpectedDeliverable[];
  submissionInstructions: string;
  rubric: RubricCriterion[];
  status: 'active' | 'archived';
}

export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  category: string;
  maxScore: number;
  earnedScore: number;
  status: 'MET' | 'PARTIAL' | 'NOT_MET';
  dimension: string;
  targetSkill: string;
  feedback: string;
  isAutomated: boolean;
}

export interface AutomatedCheckResult {
  checkName: string;
  passed: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ProjectEvaluationReport {
  id: string;
  submissionId: string;
  projectId: string;
  userId: string;
  attemptNumber: number;
  overallScore: number;
  passed: boolean;
  evaluationMethod: EvaluationMethod;
  status: SubmissionStatus;
  rubricBreakdown?: CriterionEvaluation[];
  criteriaScores: CriterionEvaluation[];
  automatedChecks: AutomatedCheckResult[];
  completedRequirements: string[];
  missingRequirements: string[];
  demonstratedSkills: string[];
  assessedDimensions: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reviewerId?: string;
  reviewerNotes?: string;
  evaluatedAt: string;
  verificationHash?: string;
  evidenceId?: string;
}

export interface ProjectSubmissionHistoryItem {
  attemptNumber: number;
  submittedAt: string;
  repositoryUrl: string;
  deploymentUrl?: string;
  score?: number;
  status: SubmissionStatus;
  summary?: string;
}

export interface ProjectSubmissionRecord {
  id: string;
  userId: string;
  projectId: string;
  attemptNumber: number;
  repositoryUrl: string;
  deploymentUrl?: string;
  summary: string;
  projectSummary?: string;
  implementationNotes: string;
  screenshots: string[];
  completedRequirementIds: string[];
  status: SubmissionStatus;
  isDraft: boolean;
  startedAt: string;
  submittedAt?: string;
  evaluatedAt?: string;
  score?: number;
  evaluationReport?: ProjectEvaluationReport;
  reviewerId?: string;
  reviewerNotes?: string;
  evidenceId?: string;
  verificationHash?: string;
  history?: ProjectSubmissionHistoryItem[];
  syncStatus?: 'synced' | 'local_only' | 'sync_error';
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}
