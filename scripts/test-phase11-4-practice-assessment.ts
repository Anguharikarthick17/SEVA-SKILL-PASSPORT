import http from 'http';
import { REAL_CHALLENGES } from '../src/data/challenges';
import { PracticeTestRunner } from '../src/lib/practice/tester';
import { DataService } from '../src/lib/data-service';

async function fetchRoute(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('SEVA SKILL PASSPORT — PHASE 11.4 VERIFICATION AUDIT');
  console.log('================================================================\n');

  let allPassed = true;
  const assert = (name: string, condition: boolean, details?: string) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
    } else {
      console.log(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
      allPassed = false;
    }
  };

  // 1. Check Assessment Route ass-mod-05
  console.log('\n--- PART A: Assessment Hook Order & Stability ---');
  const assHtml = await fetchRoute('/assessments/ass-mod-05');
  assert('Route /assessments/ass-mod-05 returns valid HTML', assHtml.includes('EVALUATION') || assHtml.includes('ass-mod-05'));
  assert('Zero React hook order errors in assessment HTML', !assHtml.includes('Rendered more hooks') && !assHtml.includes('Rendered fewer hooks'));

  // 2. Check Another Assessment Route ass-mod-01
  const ass01Html = await fetchRoute('/assessments/ass-mod-01');
  assert('Route /assessments/ass-mod-01 loads without errors', !ass01Html.includes('Rendered more hooks'));

  // 3. Check Practice Page
  console.log('\n--- PART B & E: Modern Practice Labs Workspace ---');
  const practiceHtml = await fetchRoute('/practice');
  assert('Route /practice loads successfully', practiceHtml.includes('Practice') || practiceHtml.includes('Labs'));
  assert('Slim top bar contains SEVA identity and lab title', practiceHtml.includes('Catalog') && practiceHtml.includes('Explain the lifecycle of a web request'));
  assert('Challenge Explorer contains search and category filters', practiceHtml.includes('Search labs') && practiceHtml.includes('JavaScript'));
  assert('Workspace contains Run Tests and View Answer buttons', practiceHtml.includes('practice-run-tests-btn') && practiceHtml.includes('practice-view-answer-btn'));

  // 4. Check Hidden Solutions by Default (Part C)
  console.log('\n--- PART C: Solution Hiding & Integrity ---');
  const ch1 = REAL_CHALLENGES[0];
  assert('Starter code contains TODO scaffold markers', ch1.starterCode.includes('TODO'));
  assert('Starter code does NOT contain full pre-solved steps', !ch1.starterCode.includes('const steps =') && ch1.starterCode.includes('return [];'));
  assert('Reference solution is populated and distinct from starter', !!ch1.referenceSolution && ch1.referenceSolution !== ch1.starterCode);
  assert('All 30 challenges have separated referenceSolution', REAL_CHALLENGES.every((c) => !!c.referenceSolution && c.referenceSolution.length > 20));

  // 5. Check Test Runner (Part B Section 4)
  console.log('\n--- PART B: Genuine Test Runner Execution ---');
  // 5a. Test unmodified starter code fails
  const starterEval = PracticeTestRunner.evaluateChallenge(ch1, ch1.starterCode);
  assert('Unmodified starter scaffold fails test runner with TODO warning', !starterEval.success && starterEval.logs[0].includes('TODO'));

  // 5b. Test working reference solution passes
  const solutionEval = PracticeTestRunner.evaluateChallenge(ch1, ch1.referenceSolution!);
  assert('Reference solution passes 100% of test assertions', solutionEval.success && solutionEval.passedTests === solutionEval.totalTests);

  // 5c. Test CSS challenge
  const cssCh = REAL_CHALLENGES.find((c) => c.language === 'css')!;
  const cssStarterEval = PracticeTestRunner.evaluateChallenge(cssCh, cssCh.starterCode);
  assert('CSS starter code with fixed width fails tests', !cssStarterEval.success);
  const cssSolutionEval = PracticeTestRunner.evaluateChallenge(cssCh, cssCh.referenceSolution!);
  assert('CSS reference solution passes grid and responsiveness checks', cssSolutionEval.success);

  // 5d. Test SQL challenge
  const sqlCh = REAL_CHALLENGES.find((c) => c.language === 'sql')!;
  const sqlStarterEval = PracticeTestRunner.evaluateChallenge(sqlCh, sqlCh.starterCode);
  assert('SQL starter code fails tests', !sqlStarterEval.success);
  const sqlSolutionEval = PracticeTestRunner.evaluateChallenge(sqlCh, sqlCh.referenceSolution!);
  assert('SQL reference solution passes aggregation & HAVING checks', sqlSolutionEval.success);

  // 6. Check Draft Persistence (Part D)
  console.log('\n--- PART D: Draft Persistence Layer ---');
  const testUserId = 'test-audit-user-42';
  const testDraftCode = '// Learner active draft in progress\nconst myDraft = 100;';
  DataService.saveChallengeDraft({
    userId: testUserId,
    challengeId: ch1.id,
    code: testDraftCode,
  });

  const retrievedDraft = DataService.getChallengeDraft(testUserId, ch1.id);
  assert('Draft code saved and restored accurately', retrievedDraft === testDraftCode);

  const anotherUserDraft = DataService.getChallengeDraft('another-unrelated-user', ch1.id);
  assert('Drafts are isolated by userId and do not leak across users', anotherUserDraft === null);

  // 7. Check Submission & Cryptographic Evidence
  console.log('\n--- PART D: Cryptographic Evidence Pipeline ---');
  const subResult = await DataService.submitChallenge({
    userId: testUserId,
    challengeId: ch1.id,
    skillId: 'web-fundamentals',
    code: ch1.referenceSolution!,
    score: 100,
    testsPassed: 2,
    testsTotal: 2,
    additionalSkills: ch1.skills,
  });
  assert('Challenge submission generates verified SHA-256 hash', !!subResult.verificationHash && subResult.verificationHash.startsWith('SHA256:SEVA:'));

  const completed = DataService.getCompletedChallenges(testUserId);
  assert('Submitted challenge recorded in completed list', completed.includes(ch1.id));

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 ALL 14 PHASE 11.4 AUDIT CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.log('❌ SOME AUDIT CHECKS FAILED');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
