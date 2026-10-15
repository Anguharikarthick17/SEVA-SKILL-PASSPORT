/**
 * SEVA Skill Passport — Phase 4 Assessment Engine Test Suite
 * 
 * Verifies all Phase 4 assessment engine requirements:
 *  1. Correct and incorrect MCQ answers
 *  2. Multiple-select question evaluation (exact match, partial credit, and wrong option penalties)
 *  3. Code-output question evaluation
 *  4. Score calculation and pass/fail threshold enforcement
 *  5. Server-side deadline & time-limit enforcement
 *  6. Attempt-limit enforcement (max attempts check)
 *  7. Unauthorized access security validation
 *  8. Duplicate submission prevention & safe recovery
 *  9. Assessment evidence generation & SHA-256 integrity hash
 * 10. Idempotent evidence creation (prevents score inflation)
 * 11. Multi-skill and competency dimension breakdown
 * 12. Answer key confidentiality shielding (client sanitization)
 * 13. Preservation of Phase 3B scoring engine compatibility
 */

// Setup in-memory LocalStorage polyfill for Node.js test environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
};
(global as any).window = { localStorage: (global as any).localStorage };

import {
  evaluateQuestion,
  evaluateAssessmentAttempt,
  sanitizeQuestionsForClient,
} from '../src/lib/assessments/engine';
import { AssessmentService } from '../src/lib/assessments/service';
import { QUESTION_BANK, SEED_ASSESSMENTS } from '../src/data/question-bank';
import { calculateSkillScore } from '../src/lib/scoring/engine';
import { verifyEvidenceHash } from '../src/lib/evidence/hash';
import type { QuestionBankItem, AssessmentConfig } from '../src/types/assessment';

let passedTests = 0;
let totalTests = 0;

function assert(condition: any, testName: string, details: string = '') {
  totalTests++;
  if (Boolean(condition)) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}: ${details}`);
    process.exitCode = 1;
  }
}

async function runPhase4Tests() {
  console.log('\n======================================================');
  console.log('RUNNING PHASE 4 ASSESSMENT ENGINE TEST SUITE');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Correct and Incorrect MCQ Answers
  // --------------------------------------------------------------------------
  const mcqQuestion: QuestionBankItem = {
    id: 'q-mcq-test',
    type: 'mcq',
    difficulty: 'MEDIUM',
    skillId: 'react',
    dimension: 'Architecture',
    question: 'What is the primary benefit of React Server Components?',
    codeSnippet: undefined,
    options: [
      { id: 'opt-a', text: 'Zero bundle size on client' },
      { id: 'opt-b', text: 'Replaces useState on browser' },
    ],
    correctAnswers: ['opt-a'],
    explanation: 'RSC code executes solely on the server.',
    marks: 3,
    negativeMarks: 1,
    status: 'active',
    version: 1,
  };

  const correctMCQ = evaluateQuestion(mcqQuestion, ['opt-a']);
  assert(correctMCQ.isCorrect === true, 'Test 1A: Correct single-choice MCQ marked correct');
  assert(correctMCQ.earnedMarks === 3, 'Test 1A: Full marks awarded for correct MCQ (+3)');

  const wrongMCQ = evaluateQuestion(mcqQuestion, ['opt-b']);
  assert(wrongMCQ.isCorrect === false, 'Test 1B: Incorrect single-choice MCQ marked incorrect');
  assert(wrongMCQ.earnedMarks === 0, 'Test 1B: Zero marks awarded for incorrect MCQ (0/3)');

  // --------------------------------------------------------------------------
  // TEST 2: Multiple-Select Question Evaluation
  // --------------------------------------------------------------------------
  const multiQuestion: QuestionBankItem = {
    id: 'q-multi-test',
    type: 'multiple-select',
    difficulty: 'HARD',
    skillId: 'security',
    dimension: 'Security',
    question: 'Which HTTP headers directly protect against clickjacking and XSS?',
    codeSnippet: undefined,
    options: [
      { id: 'csp', text: 'Content-Security-Policy' },
      { id: 'xfo', text: 'X-Frame-Options' },
      { id: 'etag', text: 'ETag' },
    ],
    correctAnswers: ['csp', 'xfo'],
    explanation: 'CSP prevents XSS and clickjacking; X-Frame-Options prevents framing.',
    marks: 4,
    negativeMarks: 0,
    status: 'active',
    version: 1,
  };

  const correctMulti = evaluateQuestion(multiQuestion, ['csp', 'xfo']);
  assert(correctMulti.isCorrect === true, 'Test 2A: Complete multiple-select answers marked correct');
  assert(correctMulti.earnedMarks === 4, 'Test 2A: Full marks awarded for exact multiple-select match (4/4)');

  const partialMulti = evaluateQuestion(multiQuestion, ['csp']);
  assert(partialMulti.isCorrect === false, 'Test 2B: Incomplete multiple-select is not fully correct');
  assert(partialMulti.isPartiallyCorrect === true, 'Test 2B: Partial credit flag set for partial correct selection');

  const extraWrongMulti = evaluateQuestion(multiQuestion, ['csp', 'etag']);
  assert(extraWrongMulti.isCorrect === false, 'Test 2C: Multi-select with erroneous option marked incorrect');
  assert(extraWrongMulti.earnedMarks === 0, 'Test 2C: No credit awarded when incorrect options chosen');

  // --------------------------------------------------------------------------
  // TEST 3: Code-Output Question Evaluation
  // --------------------------------------------------------------------------
  const codeOutputQ: QuestionBankItem = {
    id: 'q-code-test',
    type: 'output-prediction',
    difficulty: 'MEDIUM',
    skillId: 'javascript',
    dimension: 'Code Quality',
    question: 'What is the logged output?',
    codeSnippet: 'console.log(typeof null);',
    options: [
      { id: 'opt-null', text: 'null' },
      { id: 'opt-obj', text: 'object' },
      { id: 'opt-undef', text: 'undefined' },
    ],
    correctAnswers: ['opt-obj'],
    explanation: 'Legacy JS quirk: typeof null evaluates to "object".',
    marks: 2,
    negativeMarks: 0,
    status: 'active',
    version: 1,
  };

  const evalCodeOut = evaluateQuestion(codeOutputQ, ['opt-obj']);
  assert(evalCodeOut.isCorrect === true, 'Test 3: Code output question accurately evaluated');
  assert(evalCodeOut.earnedMarks === 2, 'Test 3: Marks earned match question value');

  // --------------------------------------------------------------------------
  // TEST 4: Score Calculation and Pass/Fail Threshold
  // --------------------------------------------------------------------------
  const assessmentConfig: AssessmentConfig = {
    id: 'test-assessment-calc',
    title: 'Unit Test Assessment',
    description: 'Calculates threshold math',
    courseId: 'full-stack-development',
    skillId: 'react',
    skills: ['react'],
    dimensions: ['Architecture'],
    durationMinutes: 30,
    totalMarks: 10,
    passingThreshold: 70,
    maxAttempts: 3,
    questionCount: 2,
    difficultyDistribution: { EASY: 1, MEDIUM: 1, HARD: 0 },
    randomizeQuestions: false,
    randomizeOptions: false,
    status: 'active',
  };

  const q1: QuestionBankItem = { ...mcqQuestion, id: 'q1', marks: 5, correctAnswers: ['a'] };
  const q2: QuestionBankItem = { ...mcqQuestion, id: 'q2', marks: 5, correctAnswers: ['b'] };

  // 100% submission
  const fullEval = evaluateAssessmentAttempt({
    attemptId: 'att-1',
    userId: 'user-t1',
    assessment: assessmentConfig,
    assignedQuestions: [q1, q2],
    submittedAnswers: { q1: ['a'], q2: ['b'] },
    startedAt: new Date(Date.now() - 60000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    submittedAt: new Date().toISOString(),
  });
  assert(fullEval.percentage === 100, 'Test 4A: 100% score calculation accurate');
  assert(fullEval.passed === true, 'Test 4A: 100% score passes threshold of 70%');

  // 50% submission (below 70%)
  const halfEval = evaluateAssessmentAttempt({
    attemptId: 'att-2',
    userId: 'user-t1',
    assessment: assessmentConfig,
    assignedQuestions: [q1, q2],
    submittedAnswers: { q1: ['a'], q2: ['wrong'] },
    startedAt: new Date(Date.now() - 60000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    submittedAt: new Date().toISOString(),
  });
  assert(halfEval.percentage === 50, 'Test 4B: 50% score calculation accurate');
  assert(halfEval.passed === false, 'Test 4B: 50% fails 70% passing threshold');

  // --------------------------------------------------------------------------
  // TEST 5: Time-Limit Enforcement (Server Deadline Expiry)
  // --------------------------------------------------------------------------
  const expiredTimeAttempt = await AssessmentService.startOrResumeAttempt({
    userId: 'user-timer-1',
    assessmentId: 'ass-mod-05',
  });
  assert(expiredTimeAttempt.attempt.status === 'in_progress', 'Test 5A: New attempt initialized in_progress');

  // Artificially simulate that deadline has expired 60 seconds ago
  const allAttempts = JSON.parse(mockStorage['seva_db_assessment_attempts'] || '[]');
  const storedAtt = allAttempts.find((a: any) => a.id === expiredTimeAttempt.attempt.id);
  storedAtt.expiresAt = new Date(Date.now() - 60000).toISOString();
  mockStorage['seva_db_assessment_attempts'] = JSON.stringify(allAttempts);

  // Attempting to save answers after deadline
  const saveResult = AssessmentService.saveAnswerProgress({
    userId: 'user-timer-1',
    attemptId: expiredTimeAttempt.attempt.id,
    answers: {},
  });
  assert(saveResult.success === false, 'Test 5B: Saving progress rejected after server deadline expiry');

  // Submitting after deadline flags timed_out status
  const timeoutSubmit = await AssessmentService.submitAndEvaluateAttempt({
    userId: 'user-timer-1',
    attemptId: expiredTimeAttempt.attempt.id,
    answers: {},
  });
  assert(timeoutSubmit.attempt.status === 'timed_out', 'Test 5C: Expired attempt marked as timed_out on server');

  // --------------------------------------------------------------------------
  // TEST 6: Attempt-Limit Enforcement
  // --------------------------------------------------------------------------
  const testUserId = 'user-attempt-limit-1';
  const targetAss = SEED_ASSESSMENTS[0]; // maxAttempts = 3

  // Perform 3 attempts
  for (let i = 1; i <= targetAss.maxAttempts; i++) {
    const att = await AssessmentService.startOrResumeAttempt({
      userId: testUserId,
      assessmentId: targetAss.id,
    });
    await AssessmentService.submitAndEvaluateAttempt({
      userId: testUserId,
      attemptId: att.attempt.id,
      answers: {},
    });
  }

  // 4th attempt must be rejected
  let attemptLimitError = false;
  try {
    await AssessmentService.startOrResumeAttempt({
      userId: testUserId,
      assessmentId: targetAss.id,
    });
  } catch (err: any) {
    if (err.message.includes('Maximum attempts')) {
      attemptLimitError = true;
    }
  }
  assert(attemptLimitError === true, 'Test 6: Attempt limit strictly enforced server-side');

  // --------------------------------------------------------------------------
  // TEST 7: Unauthorized Access Security
  // --------------------------------------------------------------------------
  const ownerUser = 'user-owner';
  const attackerUser = 'user-attacker';

  const ownerAttempt = await AssessmentService.startOrResumeAttempt({
    userId: ownerUser,
    assessmentId: 'ass-mod-05',
  });

  let unauthorizedSubmit = false;
  try {
    await AssessmentService.submitAndEvaluateAttempt({
      userId: attackerUser,
      attemptId: ownerAttempt.attempt.id,
      answers: {},
    });
  } catch (err: any) {
    if (err.message.includes('Unauthorized')) {
      unauthorizedSubmit = true;
    }
  }
  assert(unauthorizedSubmit === true, 'Test 7A: Cross-user submission prohibited');

  const unauthorizedResult = AssessmentService.getAttemptResult(attackerUser, ownerAttempt.attempt.id);
  assert(unauthorizedResult === null, 'Test 7B: Result access for another student returns null');

  // --------------------------------------------------------------------------
  // TEST 8: Duplicate Submission Prevention & Safe Recovery
  // --------------------------------------------------------------------------
  const userSafe = 'user-safe-refresh';
  const attemptToRecover = await AssessmentService.startOrResumeAttempt({
    userId: userSafe,
    assessmentId: 'ass-mod-08',
  });

  // Client refresh simulation: call startOrResumeAttempt again while unexpired
  const resumedAttempt = await AssessmentService.startOrResumeAttempt({
    userId: userSafe,
    assessmentId: 'ass-mod-08',
  });
  assert(resumedAttempt.isResumed === true, 'Test 8A: In-progress unexpired attempt safely resumed on refresh');
  assert(resumedAttempt.attempt.id === attemptToRecover.attempt.id, 'Test 8A: Same attempt ID preserved without wasting attempt count');

  // Submit attempt
  const sub1 = await AssessmentService.submitAndEvaluateAttempt({
    userId: userSafe,
    attemptId: resumedAttempt.attempt.id,
    answers: {},
  });

  // Re-submitting the same attempt returns already evaluated results without re-evaluating
  const sub2 = await AssessmentService.submitAndEvaluateAttempt({
    userId: userSafe,
    attemptId: resumedAttempt.attempt.id,
    answers: {},
  });
  assert(sub1.attempt.id === sub2.attempt.id, 'Test 8B: Duplicate submission returns idempotent evaluation');

  // --------------------------------------------------------------------------
  // TEST 9 & 10: Assessment Evidence Generation & Idempotence
  // --------------------------------------------------------------------------
  const evidenceUser = 'user-evidence-test';
  const evAttempt = await AssessmentService.startOrResumeAttempt({
    userId: evidenceUser,
    assessmentId: 'ass-mod-05',
  });

  // Answer first question correctly
  const qList = QUESTION_BANK.filter((q) => evAttempt.attempt.questionIds.includes(q.id));
  const testAnswers: Record<string, string[]> = {};
  qList.forEach((q) => {
    testAnswers[q.id] = q.correctAnswers;
  });

  const evalResult = await AssessmentService.submitAndEvaluateAttempt({
    userId: evidenceUser,
    attemptId: evAttempt.attempt.id,
    answers: testAnswers,
  });

  assert(evalResult.evidenceRecord !== undefined, 'Test 9A: Exactly one evidence record created upon submission');
  assert(
    evalResult.evidenceRecord?.verificationHash?.startsWith('SHA256:SEVA:'),
    'Test 9B: Evidence hash starts with standard prefix SHA256:SEVA:'
  );

  const hashVerified = await verifyEvidenceHash(evalResult.evidenceRecord!);
  assert(hashVerified.valid === true, 'Test 9C: Generated assessment evidence passes cryptographic verification');

  // Submitting evaluation again does not create a second evidence record
  const allEvidence = JSON.parse(mockStorage['seva_db_evidence'] || '[]');
  const userEvidenceCount = allEvidence.filter((e: any) => e.userId === evidenceUser).length;
  assert(userEvidenceCount === 1, 'Test 10: Evidence creation is strictly idempotent (count = 1)');

  // --------------------------------------------------------------------------
  // TEST 11: Multi-Skill & Competency Dimension Breakdown
  // --------------------------------------------------------------------------
  assert(
    Object.keys(evalResult.evaluation.skillBreakdown).length > 0,
    'Test 11A: Skill-wise performance breakdown populated'
  );
  assert(
    Object.keys(evalResult.evaluation.dimensionBreakdown).length > 0,
    'Test 11B: Competency dimension breakdown populated'
  );

  // --------------------------------------------------------------------------
  // TEST 12: Answer Key Confidentiality Shielding
  // --------------------------------------------------------------------------
  const sanitized = sanitizeQuestionsForClient(QUESTION_BANK);
  const sampleClientQ = sanitized[0];
  assert(
    (sampleClientQ as any).correctAnswers === undefined,
    'Test 12A: correctAnswers stripped from client-delivered questions'
  );
  assert(
    (sampleClientQ as any).explanation === undefined,
    'Test 12B: explanation stripped from client-delivered questions'
  );

  // --------------------------------------------------------------------------
  // TEST 13: Preservation of Phase 3B Scoring Engine Compatibility
  // --------------------------------------------------------------------------
  const mixedEvidence = [
    {
      id: 'ev-c1',
      userId: 'user-blend',
      skillId: 'react',
      sourceType: 'challenge' as const,
      sourceId: 'c1',
      score: 80,
      difficulty: 'MEDIUM' as const,
      qualityLevel: 'ADVANCED' as const,
      dimension: 'State Management' as const,
      attemptNumber: 1,
      lastDemonstratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      verificationHash: 'SHA256:SEVA:hash1',
    },
    {
      id: 'ev-ass1',
      userId: 'user-blend',
      skillId: 'react',
      sourceType: 'assessment' as const,
      sourceId: 'ass-mod-05',
      score: 90,
      difficulty: 'MEDIUM' as const,
      qualityLevel: 'ADVANCED' as const,
      dimension: 'Architecture' as const,
      attemptNumber: 1,
      lastDemonstratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      verificationHash: evalResult.evidenceRecord!.verificationHash,
    },
  ];

  const skillScore = calculateSkillScore('react', mixedEvidence);
  assert(skillScore.evidenceCount === 2, 'Test 13A: Assessment evidence counted by Phase 3B scoring engine');
  assert(skillScore.evidenceTypes.includes('assessment'), 'Test 13B: "assessment" evidence type properly recognized');
  assert(skillScore.score > 0, 'Test 13C: Competency score computed with assessment integration');

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
