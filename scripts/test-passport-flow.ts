// Setup in-memory LocalStorage polyfill for Node.js test environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
};
(global as any).window = { localStorage: (global as any).localStorage };

import { AssessmentService } from '../src/lib/assessments/service';
import { DataService } from '../src/lib/data-service';
import { QUESTION_BANK } from '../src/data/question-bank';

async function testFullPassportFlow() {
  console.log('\n======================================================');
  console.log('TESTING COMPLETE FLOW: ASSESSMENT -> RESULT -> PASSPORT');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      failed++;
    }
  }

  const testUserId = `test-learner-${Date.now()}`;

  // 1. Initialize attempt for React / Fullstack assessment
  const initResult = await AssessmentService.startOrResumeAttempt({
    userId: testUserId,
    assessmentId: 'ass-fullstack-core',
  });

  assert(Boolean(initResult.attempt.id), 'Assessment attempt successfully initialized');
  assert(initResult.questions.length === 10, '10 questions assigned to candidate');

  // 2. Answer with answers yielding ~20% score (2 correct out of 10)
  const answers: Record<string, string[]> = {};
  initResult.questions.forEach((q, idx) => {
    const bankItem = QUESTION_BANK.find((item) => item.id === q.id);
    if (idx < 2 && bankItem) {
      // 2 correct answers
      answers[q.id] = bankItem.correctAnswers;
    } else {
      // Intentional wrong answer for other questions
      answers[q.id] = ['wrong-opt-99'];
    }
  });

  // 3. Submit assessment
  const submitResult = await AssessmentService.submitAndEvaluateAttempt({
    userId: testUserId,
    attemptId: initResult.attempt.id,
    answers,
  });

  assert(submitResult.attempt.status === 'evaluated', 'Assessment evaluated server-side');
  assert(submitResult.evaluation.percentage === 20, `Score is accurately evaluated at 20% (got ${submitResult.evaluation.percentage}%)`);
  assert(submitResult.evaluation.passed === false, 'Score below 70% threshold is marked needs reinforcement');
  assert(Boolean(submitResult.evaluation.verificationHash), 'Cryptographic evidence hash created for the 20% attempt');

  // 4. Verify user's evidence timeline in DataService
  const timeline = await DataService.getEvidenceTimeline(testUserId);
  assert(timeline.length === 1, `Timeline contains exactly 1 real evidence item (got ${timeline.length})`);
  assert(timeline[0].sourceType === 'assessment', 'Timeline item is of type assessment');
  assert(timeline[0].score === 20, `Timeline item records authentic score of 20% (got ${timeline[0].score}%)`);

  // 5. Verify Skill Passport calculation for this learner
  const { calculatedSkills, passport } = await DataService.recalculateScores(testUserId);
  assert(passport.overallScore === 0, 'Overall score is 0 due to insufficient evidence (no fabricated 85%)');
  assert(passport.grade === 'Building evidence', 'Grade is "Building evidence"');
  assert(passport.sufficientlyEvidencedCount === 0, 'Reports 0 sufficiently evidenced core domains');
  assert(passport.totalEvidenceCount === 1, 'Total evidence count accurately reflects 1 item (no fabricated 15)');

  // 6. Inspect the React skill score specifically
  const reactSkill = calculatedSkills.find((s) => s.skillId.toLowerCase() === 'react');
  assert(Boolean(reactSkill), 'React skill found in evaluated index');
  assert(reactSkill?.evidenceCount === 1, 'React skill reflects 1 logged assessment');
  assert(reactSkill?.isSufficientlyEvidenced === false, 'React skill is not marked verified on a single attempt');
  assert(reactSkill?.score === 0, 'Displayed score is clamped to 0 until sufficiency criteria are met');
  assert(Boolean(reactSkill?.explanation.includes('Building evidence')), 'Explanation instructs learner to build evidence across multiple practical tasks');

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testFullPassportFlow();
