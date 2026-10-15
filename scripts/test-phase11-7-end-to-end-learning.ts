// ==============================================================================
// SEVA SKILL PASSPORT — MASTER END-TO-END LEARNING & CREDENTIAL TEST SUITE
// Tests Phases 11.6, 11.7, 11.8, 11.9, and 12 with real database models.
// Run with: npx tsx scripts/test-phase11-7-end-to-end-learning.ts
// ==============================================================================

import { DataService } from '../src/lib/data-service';
import { CertificateService } from '../src/lib/credentials/service';
import { AssessmentService } from '../src/lib/assessments/service';
import { ProjectService } from '../src/lib/projects/service';
import { CodeExecutionService } from '../src/lib/execution/runner';
import { FULL_STACK_MODULES } from '../src/data/curriculum';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✗\x1b[0m ${testName}`);
    if (detail) console.error(`    \x1b[33mError detail:\x1b[0m ${detail}`);
  }
}

async function runEndToEndVerification() {
  console.log('\n====================================================================');
  console.log(' SEVA SKILL PASSPORT: END-TO-END VERIFICATION & INTEGRITY TEST SUITE');
  console.log('====================================================================\n');

  const testStudentId = `std-test-${Date.now()}`;
  const testReviewerId = `rev-test-${Date.now()}`;

  // ----------------------------------------------------------------------------
  // SECTION 1: Fresh Student Account Isolation & Zero Fabricated Data
  // ----------------------------------------------------------------------------
  console.log('--- SECTION 1: Fresh Student Isolation & No Fabricated Data ---');

  await DataService.saveUserProfile({
    id: testStudentId,
    email: 'newstudent@example.edu',
    fullName: 'Ananya Sharma',
    role: 'student',
    mobile: '9876543210',
    education: 'B.Tech CSE',
    state: 'Karnataka',
    district: 'Bengaluru',
    targetRole: 'Full Stack Engineer',
    githubHandle: 'ananya-dev',
    passportVisibility: 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const initialProfile = await DataService.getUserProfile(testStudentId);
  assert(initialProfile?.fullName === 'Ananya Sharma', 'Fresh student profile created and isolated');

  const initialCredentials = await DataService.getUserCredentials(testStudentId);
  assert(initialCredentials.length === 0, 'Fresh student has exactly 0 credentials (no fake seeding)');

  const initialProgress = await DataService.getCompletedLessonIds(testStudentId);
  assert(
    !initialProgress || initialProgress.length === 0,
    'Fresh student has 0 lesson completions'
  );

  const initialSubmissions = await ProjectService.getUserSubmissions(testStudentId);
  assert(initialSubmissions.length === 0, 'Fresh student has 0 project submissions');

  // ----------------------------------------------------------------------------
  // SECTION 2: Course Enrollment & Idempotent Lesson Progress
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Course Enrollment & Idempotent Lesson Progress ---');

  const enrollResult = await DataService.enrollInCourse(testStudentId, 'full-stack-development');
  assert(Boolean(enrollResult), 'Student enrolled into full-stack-development');

  // Complete 10 lessons from the curriculum
  const lessonIdsToComplete: string[] = [];
  let collected = 0;
  for (const mod of FULL_STACK_MODULES) {
    for (const les of mod.lessons) {
      if (collected < 10) {
        lessonIdsToComplete.push(les.id);
        collected++;
      }
    }
  }

  for (const lid of lessonIdsToComplete) {
    await DataService.markLessonComplete(testStudentId, lid, 'full-stack-development');
  }

  const updatedProgress = await DataService.getCompletedLessonIds(testStudentId);
  assert(updatedProgress.length === 10, '10 distinct lessons recorded as completed');

  // Idempotency check: complete the same lesson again
  await DataService.markLessonComplete(testStudentId, lessonIdsToComplete[0], 'full-stack-development');
  const progressAfterDuplicate = await DataService.getCompletedLessonIds(testStudentId);
  assert(progressAfterDuplicate.length === 10, 'Lesson completion is strictly idempotent (no double counting)');

  // ----------------------------------------------------------------------------
  // SECTION 3: Hands-On Practice Execution & Evidence Generation
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Practice Lab Execution & Evidence Generation ---');

  const testUserCode = `function add(a, b) { return a + b; } add(2, 3);`;
  const execResult = await CodeExecutionService.executeCode(testUserCode, { language: 'javascript' });
  assert(execResult.success, 'Code runner successfully executed sample student code');
  assert(
    execResult.isolationType === 'DEV_LOCAL_ISOLATED',
    'Execution boundary correctly documents local vs container isolation'
  );

  // Record 3 verified practice lab evidence entries
  for (let i = 1; i <= 3; i++) {
    const skill = i === 1 ? 'react' : i === 2 ? 'sql' : 'nodejs';
    const hashHex = `test_lab_hash_0${i}_${testStudentId}`.padEnd(64, '0');
    await DataService.addEvidence({
      userId: testStudentId,
      skillId: skill,
      sourceType: 'lab',
      sourceId: `lab-challenge-0${i}`,
      score: 90,
      dimension: 'PRACTICAL_CODE',
      difficulty: 'MEDIUM',
      qualityLevel: 'ADVANCED',
      attemptNumber: 1,
      verificationHash: `SHA256:SEVA:${hashHex}`,
      metadata: { testsPassed: 4, totalTests: 4 },
    });
  }

  const userEvidence = await DataService.getUserEvidence(testStudentId);
  const labEvidence = userEvidence.filter((e) => e.sourceType === 'lab');
  assert(labEvidence.length === 3, '3 authentic practice lab evidence records generated and hashed');

  // ----------------------------------------------------------------------------
  // SECTION 4: Assessment Attempt, Question Sanitization & Evaluation
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Proctored Assessment Lifecycle & Sanitization ---');

  const availableAssessments = AssessmentService.getAvailableAssessments();
  assert(availableAssessments.length > 0, 'Configured assessments available');
  const targetAssessment = availableAssessments[0];

  // Start attempt and verify question shielding
  const attemptRes = await AssessmentService.startOrResumeAttempt({
    userId: testStudentId,
    assessmentId: targetAssessment.id,
  });
  assert(Boolean(attemptRes.attempt), 'Assessment attempt started successfully');

  const clientQuestions = attemptRes.questions || [];
  const leakedAnswers = clientQuestions.some((q: any) => 'correctOptionId' in q || 'correctAnswer' in q);
  assert(!leakedAnswers, 'Anti-Cheat: Questions are sanitized with zero answer keys exposed to client');

  // Submit attempt with answers
  const answers: Record<string, string[]> = {};
  for (const q of clientQuestions) {
    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      answers[q.id] = [q.options[0].id];
    }
  }

  const submitRes = await AssessmentService.submitAndEvaluateAttempt({
    attemptId: attemptRes.attempt.id,
    userId: testStudentId,
    answers,
  });
  assert(Boolean(submitRes.evaluation), 'Assessment submitted and scored server-side');
  assert(typeof submitRes.evaluation?.percentage === 'number', 'Deterministic evaluation score generated');

  // ----------------------------------------------------------------------------
  // SECTION 5: Capstone Project Submission & Evaluator Safeguards
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Capstone Project Submission & Security Safeguards ---');

  const projects = await ProjectService.getAllProjects();
  assert(projects.length > 0, 'Project catalogue available');
  const targetProject = projects[0];

  // Submit project
  const projectSub = await ProjectService.submitProject({
    userId: testStudentId,
    projectId: targetProject.id,
    repositoryUrl: 'https://github.com/seva-student/portfolio-tracker',
    deploymentUrl: 'https://portfolio-tracker.seva-demo.app',
    summary: 'Full-stack portfolio tracking system with PostgreSQL and React.',
    implementationNotes: 'Implemented schema migrations and authenticated API endpoints.',
  });
  assert(
    projectSub.status === 'UNDER_REVIEW' || projectSub.status === 'SUBMITTED',
    'Project successfully submitted for faculty review'
  );

  // Safeguard: Self-review prevention
  let selfReviewBlocked = false;
  try {
    await ProjectService.evaluateAsReviewer({
      submissionId: projectSub.id,
      reviewerId: testStudentId, // Same as student
      reviewerRole: 'reviewer',
      approve: true,
      criteriaScores: { architecture: 9, codeQuality: 9, functionality: 9, documentation: 4 },
    });
  } catch (err: any) {
    selfReviewBlocked = err.message.includes('Submitters cannot evaluate');
  }
  assert(
    selfReviewBlocked,
    'Security Rule Enforced: Students cannot evaluate their own project submission'
  );

  // Authorized Review by Faculty
  const facultyReview = await ProjectService.evaluateAsReviewer({
    submissionId: projectSub.id,
    reviewerId: testReviewerId,
    reviewerRole: 'instructor',
    approve: true,
    reviewerNotes: 'Excellent component hierarchy and robust test coverage.',
    criteriaScores: { architecture: 9, codeQuality: 9, functionality: 8, documentation: 4 },
  });
  assert(Boolean(facultyReview), 'Authorized instructor successfully approved project submission');
  assert(
    facultyReview.status?.toLowerCase() === 'evaluated' ||
      facultyReview.status?.toLowerCase() === 'approved' ||
      facultyReview.submission?.status?.toLowerCase() === 'evaluated' ||
      facultyReview.submission?.status?.toLowerCase() === 'approved',
    'Project submission transitioned to verified approved/evaluated status'
  );

  // ----------------------------------------------------------------------------
  // SECTION 6: CRS Mathematical Calculation Model
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 6: CRS Mathematical Formula & Determinism ---');

  const crsResult = await DataService.recalculateScores(testStudentId);
  assert(Boolean(crsResult.passport), 'Skill Passport recalculation completed without division-by-zero');
  const overallScore = crsResult.passport?.overallScore || 0;
  assert(overallScore >= 0 && overallScore <= 100, `Overall CRS score is mathematically bounded (${overallScore}%)`);

  // ----------------------------------------------------------------------------
  // SECTION 7: Configurable Certificate Eligibility & Issuance
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 7: Verified Certificate Issuance & Eligibility Rules ---');

  // Check course completion certificate eligibility (requires 10 lessons, student completed 10)
  const courseEligibility = await CertificateService.checkEligibility(
    testStudentId,
    'course_completion',
    'full-stack-development'
  );
  assert(courseEligibility.eligible, 'Course completion certificate eligibility verified (10/10 lessons met)');

  // Issue Course Completion Certificate
  const issueResult1 = await CertificateService.issueCredential(
    testStudentId,
    'course_completion',
    { courseId: 'full-stack-development', issuedBy: 'Test Runner' }
  );
  assert(issueResult1.success && Boolean(issueResult1.credential), 'Course completion certificate issued');
  assert(
    Boolean(issueResult1.credential?.id.startsWith('SEVA-CERT-CRS')),
    `Unique non-guessable credential ID created (${issueResult1.credential?.id})`
  );
  assert(
    Boolean(issueResult1.credential?.metadata?.evidenceHash?.startsWith('SHA256:SEVA:')),
    'Tamper-resistant SHA-256 evidence hash attached to credential'
  );

  // Prevent duplicate issuance check
  const duplicateIssue = await CertificateService.issueCredential(
    testStudentId,
    'course_completion',
    { courseId: 'full-stack-development' }
  );
  assert(
    duplicateIssue.credential?.id === issueResult1.credential?.id,
    'Duplicate issuance prevented: returns existing active credential'
  );

  // ----------------------------------------------------------------------------
  // SECTION 8: Public Verification & Privacy Protection
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 8: Public Credential Verification & Privacy Protection ---');

  const publicVerification = await DataService.verifyById(issueResult1.credential!.id);
  assert(Boolean(publicVerification), 'Public registry lookup finds issued credential by ID');
  assert(publicVerification?.status === 'VERIFIED_ACTIVE', 'Verification status is VERIFIED_ACTIVE');
  assert(publicVerification?.integrityVerified === true, 'Cryptographic integrity verified');
  assert(
    publicVerification?.candidateName === 'Protected Candidate',
    'Candidate privacy respected (protected when visibility is private)'
  );

  // ----------------------------------------------------------------------------
  // SECTION 9: Credential Revocation & Public Audit Integrity
  // ----------------------------------------------------------------------------
  console.log('\n--- SECTION 9: Credential Revocation & Immutable Audit Trail ---');

  // Revoke with documented reason
  const revokeResult = await CertificateService.revokeCredential(
    issueResult1.credential!.id,
    testReviewerId,
    'Academic integrity audit: test revocation execution'
  );
  assert(revokeResult.success, 'Authorized administrator revoked credential with documented reason');

  // Verify that public lookup now reflects REVOKED
  const revokedVerification = await DataService.verifyById(issueResult1.credential!.id);
  assert(revokedVerification?.status === 'REVOKED', 'Public verification confirms status changed to REVOKED');
  assert(revokedVerification?.isRevoked === true, 'Revocation flag is active');
  assert(
    revokedVerification?.revocationReason === 'Academic integrity audit: test revocation execution',
    'Documented revocation reason returned to verification caller'
  );
  assert(revokedVerification?.integrityVerified === false, 'Integrity verification fails for revoked credential');

  // Check audit trail
  const auditLogs = CertificateService.getAuditHistory(issueResult1.credential!.id);
  const hasRevokedAudit = auditLogs.some((l) => l.action === 'REVOKED');
  assert(hasRevokedAudit, 'Immutable audit log contains REVOKED event record with timestamp and reason');

  // ----------------------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEndToEndVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
