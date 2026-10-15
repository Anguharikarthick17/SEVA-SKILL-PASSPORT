/**
 * SEVA Skill Passport — Assessment Evaluation & Lifecycle Engine (Phase 4)
 * 
 * CORE PRINCIPLES:
 * 1. Strict server-side evaluation.
 * 2. Answer keys and explanations are never sent to clients prior to submission.
 * 3. Server enforces deadline (`expiresAt`), not just client timer.
 * 4. Generates idempotent assessment evidence integrated into Phase 3B engine.
 */

import {
  AssessmentConfig,
  QuestionBankItem,
  ClientAssessmentQuestion,
  QuestionEvaluationResult,
  AttemptEvaluationSummary,
  QuestionDifficulty,
} from '@/types/assessment';

/**
 * Sanitizes a list of question definitions for safe delivery to a student during an active exam.
 * Strips `correctAnswers` and `explanation` completely.
 */
export function sanitizeQuestionsForClient(questions: QuestionBankItem[]): ClientAssessmentQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    codeSnippet: q.codeSnippet,
    options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
    difficulty: q.difficulty,
    skillId: q.skillId,
    dimension: q.dimension,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
  }));
}

/**
 * Selects and randomizes eligible questions for an assessment attempt from the question pool.
 */
export function selectQuestionsForAttempt(
  assessment: AssessmentConfig,
  pool: QuestionBankItem[]
): QuestionBankItem[] {
  // 1. Filter pool by eligible skills
  const targetSkills = assessment.skills.map((s) => s.toLowerCase());
  const eligibleQuestions = pool.filter(
    (q) => q.status === 'active' && (targetSkills.includes(q.skillId.toLowerCase()) || targetSkills.includes('full-stack'))
  );

  // If pool is smaller than questionCount, return all eligible
  if (eligibleQuestions.length <= assessment.questionCount) {
    return eligibleQuestions;
  }

  // 2. Select according to difficulty distribution if specified
  const selected: QuestionBankItem[] = [];
  const dist = assessment.difficultyDistribution || { EASY: 3, MEDIUM: 5, HARD: 2 };
  const difficulties: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

  difficulties.forEach((diff) => {
    const desiredCount = dist[diff] || 0;
    const diffPool = eligibleQuestions.filter((q) => q.difficulty === diff);
    
    // Shuffle
    const shuffled = [...diffPool].sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, desiredCount));
  });

  // 3. Fill any remainder up to questionCount
  if (selected.length < assessment.questionCount) {
    const remaining = eligibleQuestions.filter((q) => !selected.some((s) => s.id === q.id));
    const shuffledRem = [...remaining].sort(() => 0.5 - Math.random());
    selected.push(...shuffledRem.slice(0, assessment.questionCount - selected.length));
  }

  // 4. Randomize overall question order if configured
  if (assessment.randomizeQuestions) {
    return selected.sort(() => 0.5 - Math.random());
  }

  return selected;
}

/**
 * Evaluates a single question against submitted answers.
 */
export function evaluateQuestion(
  question: QuestionBankItem,
  submittedAnswers: string[] = []
): QuestionEvaluationResult {
  const normUserAnswers = submittedAnswers.map((a) => a.trim()).sort();
  const normCorrectAnswers = question.correctAnswers.map((a) => a.trim()).sort();

  let isCorrect = false;
  let isPartiallyCorrect = false;
  let earnedMarks = 0;

  if (question.type === 'multiple-select') {
    // Multi-select evaluation:
    // Full credit if exact match of all required options.
    const allCorrectSelected = normCorrectAnswers.every((ca) => normUserAnswers.includes(ca));
    const noIncorrectSelected = normUserAnswers.every((ua) => normCorrectAnswers.includes(ua));

    if (allCorrectSelected && noIncorrectSelected) {
      isCorrect = true;
      earnedMarks = question.marks;
    } else if (noIncorrectSelected && normUserAnswers.length > 0) {
      // Partial credit if only correct options chosen but missing some
      isPartiallyCorrect = true;
      const ratio = normUserAnswers.length / normCorrectAnswers.length;
      earnedMarks = Math.round(question.marks * ratio);
    } else {
      isCorrect = false;
      earnedMarks = 0;
    }
  } else {
    // Single choice MCQ, Output prediction, Debugging, SQL, Architecture, Scenario:
    // Exact match of single chosen option
    if (normUserAnswers.length > 0 && normCorrectAnswers.length > 0) {
      if (normUserAnswers[0] === normCorrectAnswers[0]) {
        isCorrect = true;
        earnedMarks = question.marks;
      }
    }
  }

  return {
    questionId: question.id,
    type: question.type,
    skillId: question.skillId,
    dimension: question.dimension,
    maxMarks: question.marks,
    earnedMarks,
    isCorrect,
    isPartiallyCorrect,
    userAnswers: submittedAnswers,
    correctAnswers: question.correctAnswers,
    explanation: question.explanation,
  };
}

/**
 * Performs complete server-side evaluation of an assessment attempt.
 */
export function evaluateAssessmentAttempt(params: {
  attemptId: string;
  userId: string;
  assessment: AssessmentConfig;
  assignedQuestions: QuestionBankItem[];
  submittedAnswers: Record<string, string[]>;
  startedAt: string;
  expiresAt: string;
  submittedAt: string;
}): AttemptEvaluationSummary {
  const {
    attemptId,
    userId,
    assessment,
    assignedQuestions,
    submittedAnswers,
    startedAt,
    expiresAt,
    submittedAt,
  } = params;

  // 1. Evaluate every assigned question
  const questionResults = assignedQuestions.map((q) => {
    const userAnswersForQ = submittedAnswers[q.id] || [];
    return evaluateQuestion(q, userAnswersForQ);
  });

  // 2. Tally marks & percentage
  const totalMarks = questionResults.reduce((acc, r) => acc + r.maxMarks, 0);
  const earnedMarks = questionResults.reduce((acc, r) => acc + r.earnedMarks, 0);
  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  const passed = percentage >= assessment.passingThreshold;

  // 3. Compute time taken
  const startTimeMs = new Date(startedAt).getTime();
  const submitTimeMs = new Date(submittedAt).getTime();
  const timeTakenSeconds = Math.max(0, Math.floor((submitTimeMs - startTimeMs) / 1000));

  // 4. Breakdown by Skill
  const skillBreakdown: Record<string, { totalMarks: number; earnedMarks: number; percentage: number }> = {};
  questionResults.forEach((r) => {
    if (!skillBreakdown[r.skillId]) {
      skillBreakdown[r.skillId] = { totalMarks: 0, earnedMarks: 0, percentage: 0 };
    }
    skillBreakdown[r.skillId].totalMarks += r.maxMarks;
    skillBreakdown[r.skillId].earnedMarks += r.earnedMarks;
  });

  Object.keys(skillBreakdown).forEach((s) => {
    const item = skillBreakdown[s];
    item.percentage = item.totalMarks > 0 ? Math.round((item.earnedMarks / item.totalMarks) * 100) : 0;
  });

  // 5. Breakdown by Competency Dimension
  const dimensionBreakdown: Record<string, { totalMarks: number; earnedMarks: number; percentage: number }> = {};
  questionResults.forEach((r) => {
    if (!dimensionBreakdown[r.dimension]) {
      dimensionBreakdown[r.dimension] = { totalMarks: 0, earnedMarks: 0, percentage: 0 };
    }
    dimensionBreakdown[r.dimension].totalMarks += r.maxMarks;
    dimensionBreakdown[r.dimension].earnedMarks += r.earnedMarks;
  });

  Object.keys(dimensionBreakdown).forEach((d) => {
    const item = dimensionBreakdown[d];
    item.percentage = item.totalMarks > 0 ? Math.round((item.earnedMarks / item.totalMarks) * 100) : 0;
  });

  // 6. Identify Weak Areas (< 75% score)
  const weakAreas: Array<{ dimension: string; skillId: string; score: number; recommendation: string }> = [];
  Object.entries(dimensionBreakdown).forEach(([dimension, data]) => {
    if (data.percentage < 75) {
      // Find matching skillId
      const qMatch = questionResults.find((q) => q.dimension === dimension);
      const skillId = qMatch ? qMatch.skillId : assessment.skillId;
      weakAreas.push({
        dimension,
        skillId,
        score: data.percentage,
        recommendation: `Complete targeted ${skillId.toUpperCase()} ${dimension} challenges in the Practice Arena to strengthen this competency.`,
      });
    }
  });

  return {
    attemptId,
    assessmentId: assessment.id,
    userId,
    totalMarks,
    earnedMarks,
    percentage,
    passed,
    passingThreshold: assessment.passingThreshold,
    timeTakenSeconds,
    submittedAt,
    questionResults,
    skillBreakdown,
    dimensionBreakdown,
    weakAreas,
  };
}
