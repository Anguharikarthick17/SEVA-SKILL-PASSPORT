// Setup in-memory LocalStorage polyfill for Node.js test environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
};
(global as any).window = { localStorage: (global as any).localStorage };

import { ProjectService } from '../src/lib/projects/service';
import {
  validateRepositoryUrl,
  validateDeploymentUrl,
  evaluateProjectSubmission,
  SKILL_COMPETENCY_MAPPING
} from '../src/lib/projects/engine';
import { DataService } from '../src/lib/data-service';
import { verifyEvidenceHash } from '../src/lib/evidence/hash';
import { calculateSkillScore, getAttemptMultiplier, EvidenceRecord } from '../src/lib/scoring/engine';
import { POST as evaluateRoute } from '../src/app/api/projects/evaluate/route';
import { setMockSupabaseServerAdminClient } from '../src/lib/supabase/server';

async function runProjectEngineTests() {
  console.log('\n======================================================');
  console.log('TESTING COMPLETE PHASE 5: PROJECT VERIFICATION ENGINE');
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

  const testStudentId = `student-p5-${Date.now()}`;
  const otherStudentId = `student-other-${Date.now()}`;

  // 1. Project catalogue retrieval
  const catalogue = await ProjectService.getAllProjects();
  assert(catalogue.length === 5, `1. Catalogue contains 5 complete Full Stack Developer capstone projects (got ${catalogue.length})`);
  const project1 = await ProjectService.getProjectById('proj-frontend-responsive');
  assert(
    Boolean(project1 && project1.rubric.length >= 4 && project1.acceptanceCriteria.length >= 3),
    '1b. Project details include learning objectives, acceptance criteria, deliverables, and rubric'
  );

  // 2. Project ownership & initialization
  const startRec = await ProjectService.startProject(testStudentId, 'proj-frontend-responsive');
  assert(startRec.userId === testStudentId, '2. Started project is properly owned by the initiating student');
  assert(startRec.status === 'IN_PROGRESS', '2b. Project status starts in IN_PROGRESS');

  // 3. Submission URL validation
  const validGit = validateRepositoryUrl('https://github.com/seva-learner/responsive-dashboard');
  const invalidGit = validateRepositoryUrl('ftp://invalidsite.com/repo');
  const emptyGit = validateRepositoryUrl('');
  const validDeploy = validateDeploymentUrl('https://my-dashboard.vercel.app');
  const invalidDeploy = validateDeploymentUrl('javascript:alert(1)');
  assert(validGit.valid === true, '3. Valid GitHub HTTPS repository accepted');
  assert(invalidGit.valid === false, '3b. Non-git/invalid repository URL rejected');
  assert(emptyGit.valid === false, '3c. Empty repository URL rejected');
  assert(validDeploy.valid === true, '3d. Valid deployment HTTPS URL accepted');
  assert(invalidDeploy.valid === false, '3e. Dangerous/invalid deployment URL rejected');

  // 4. Missing required fields rejection
  let missingFieldRejected = false;
  try {
    await ProjectService.submitProject({
      userId: testStudentId,
      projectId: 'proj-frontend-responsive',
      repositoryUrl: '',
      projectSummary: 'Short summary'
    });
  } catch (err: any) {
    missingFieldRejected = true;
  }
  assert(missingFieldRejected, '4. Submitting without repository URL is strictly rejected server-side');

  // 5. Draft saving and submission state
  const draft = await ProjectService.saveDraft({
    userId: testStudentId,
    projectId: 'proj-frontend-responsive',
    repositoryUrl: 'https://github.com/seva-learner/responsive-dashboard',
    deploymentUrl: 'https://preview.vercel.app',
    projectSummary: 'Draft architecture summary of my civic dashboard.',
    implementationNotes: 'Implemented responsive navigation with mobile drawer.'
  });
  assert(draft.status === 'IN_PROGRESS', '5. Saved draft maintains IN_PROGRESS state without triggering grading');
  assert(draft.projectSummary!.includes('Draft architecture'), '5b. Saved draft preserves implementation notes and summary');

  // 6. Submission history preservation and attempt numbering
  const sub1 = await ProjectService.submitProject({
    userId: testStudentId,
    projectId: 'proj-frontend-responsive',
    repositoryUrl: 'https://github.com/seva-learner/responsive-dashboard',
    deploymentUrl: 'https://preview.vercel.app',
    projectSummary: 'Final submission for responsive civic dashboard.',
    implementationNotes: 'All 5 acceptance criteria completed. Added WCAG 2.1 AA checks.'
  });
  assert(sub1.attemptNumber === 1, '6. First formal submission recorded as attempt 1');
  assert(sub1.history!.length === 1, '6b. Submission history logs the first submission action');

  // Resubmit second attempt
  const sub2 = await ProjectService.submitProject({
    userId: testStudentId,
    projectId: 'proj-frontend-responsive',
    repositoryUrl: 'https://github.com/seva-learner/responsive-dashboard-v2',
    deploymentUrl: 'https://preview-v2.vercel.app',
    projectSummary: 'Second submission with improved mobile drawer & touch targets.',
    implementationNotes: 'Fixed contrast ratio issue on alert banners. Comprehensive architecture notes provided.',
    completedRequirementIds: project1!.functionalRequirements.map((r) => r.id)
  });
  assert(sub2.attemptNumber === 2, '6c. Resubmission increments attempt counter to 2');
  assert(sub2.history!.length === 2, '6d. History log preserves prior attempt timestamps and notes');

  // 7. Pending and incomplete evaluations
  assert(sub2.status === 'UNDER_REVIEW' || sub2.status === 'SUBMITTED', '7. Fresh submission enters UNDER_REVIEW without fabricating completed marks');
  assert(sub2.evidenceId === undefined, '7b. Un-evaluated submission does not generate qualifying evidence prematurely');

  // 8. Transparent rubric score calculations
  const sampleRubricScores = {
    'rub-fe-comp': 23,  // max 25
    'rub-fe-state': 22, // max 25
    'rub-fe-a11y': 22,  // max 25
    'rub-fe-git': 23    // max 25
  };
  const evalReport = evaluateProjectSubmission(
    project1!,
    sub2,
    sampleRubricScores,
    'Mentor Lead Evaluator',
    'Demonstrated excellent component modularity and responsive grid layouts. High code quality.'
  );
  assert(evalReport.overallScore === 90, `8. Rubric score correctly calculated at 90% (got ${evalReport.overallScore}%)`);
  assert(evalReport.passed === true, '8b. Score of 90% meets qualifying threshold (>=70%)');
  assert(evalReport.criteriaScores.length === 4, '8c. All rubric criteria transparently detailed in report');

  // 9. Evidence creation after qualifying evaluation
  const approvedReview = await ProjectService.evaluateAsReviewer({
    submissionId: sub2.id,
    reviewerId: 'mentor-eva-01',
    criteriaScores: sampleRubricScores,
    feedback: 'Approved capstone with exemplary component design and clean architecture.',
    approve: true
  });
  assert(approvedReview.status === 'EVALUATED', '9. Submission status transitioned to EVALUATED');
  assert(Boolean(approvedReview.evidenceId), '9b. Qualifying project generated a valid evidence ID');

  const timelineAfterEval = await DataService.getEvidenceTimeline(testStudentId);
  const projectEvidence = timelineAfterEval.find((e) => e.sourceType === 'project');
  assert(Boolean(projectEvidence), '9c. Project evidence successfully recorded in student evidence timeline');
  assert(projectEvidence?.score === 90, `9d. Evidence record carries authentic score of 90% (got ${projectEvidence?.score}%)`);

  // 10. Duplicate evidence prevention
  const priorEvidenceId = approvedReview.evidenceId;
  const reEvaluatedReview = await ProjectService.evaluateAsReviewer({
    submissionId: sub2.id,
    reviewerId: 'mentor-eva-01',
    criteriaScores: sampleRubricScores,
    feedback: 'Calibration update on rubric.',
    approve: true
  });
  assert(reEvaluatedReview.evidenceId === priorEvidenceId, '10. Re-evaluating submission updates existing evidence without creating duplicates');
  const timelineCheck = await DataService.getEvidenceTimeline(testStudentId);
  const projectEvidenceItems = timelineCheck.filter((e) => e.sourceType === 'project');
  assert(projectEvidenceItems.length === 1, `10b. Evidence timeline has exactly 1 project evidence entry (got ${projectEvidenceItems.length})`);

  // 11. Evidence hash validation (SHA-256)
  const isHashValid = await verifyEvidenceHash(projectEvidence!);
  assert(isHashValid.valid === true, '11. Cryptographic SHA-256 evidence integrity hash verifies successfully');

  // 12. Skill-to-competency mapping
  const mappedDims = SKILL_COMPETENCY_MAPPING['react'] || [];
  assert(
    mappedDims.includes('Component Design') && mappedDims.includes('State Management'),
    '12. React project accurately maps to Component Design, State Management, and Hooks'
  );

  // 13. Recalculation through existing Phase 3B scoring engine
  const { calculatedSkills, passport } = await DataService.recalculateScores(testStudentId);
  const reactSkill = calculatedSkills.find((s) => s.skillId.toLowerCase() === 'react');
  assert(Boolean(reactSkill), '13. React skill recalculated through Phase 3B scoring engine');
  assert(reactSkill?.evidenceCount === 1, `13b. React skill reflects 1 project evidence item (got ${reactSkill?.evidenceCount})`);

  // 14. Confidence and evidence diversity requirements
  // In Phase 3B engine, a single project alone is NOT sufficient evidence until minimum diversity/sufficiency requirements are met.
  assert(
    reactSkill?.isSufficientlyEvidenced === false,
    '14. Single project submission alone does NOT mark skill verified (enforces evidence diversity)'
  );
  assert(
    passport.grade === 'Building evidence',
    '14b. Passport status remains honest "Building evidence" when total evidence is insufficient'
  );

  // 15. Repeat-attempt diminishing returns in scoring engine
  const multAttempt1 = getAttemptMultiplier(1);
  const multAttempt3 = getAttemptMultiplier(3);
  assert(
    multAttempt1 > multAttempt3,
    '15. Repeat attempts apply diminishing returns multiplier as defined in Phase 3B engine'
  );

  // 16. Student authorization & cross-student access prevention
  const otherStudentSubs = await ProjectService.getUserSubmissions(otherStudentId);
  assert(otherStudentSubs.length === 0, '16. Cross-student submissions isolated; other student sees 0 submissions');

  // 17. Reviewer authorization & change request workflow
  const subForChanges = await ProjectService.submitProject({
    userId: otherStudentId,
    projectId: 'proj-rest-api',
    repositoryUrl: 'https://github.com/other-learner/api',
    projectSummary: 'Basic express app.'
  });
  const reviewChanges = await ProjectService.evaluateAsReviewer({
    submissionId: subForChanges.id,
    reviewerId: 'mentor-lead',
    criteriaScores: { 'crit-api-routing': 10 },
    feedback: 'Missing rate-limiting and comprehensive error middleware.',
    approve: false
  });
  assert(reviewChanges.status === 'CHANGES_REQUESTED', '17. Reviewer workflow correctly records CHANGES_REQUESTED');
  assert(reviewChanges.evidenceId === undefined, '17b. Project with changes requested does NOT receive evidence');

  // 18. Skill Passport timeline integration
  const studentTimeline = await DataService.getEvidenceTimeline(testStudentId);
  const foundProject = studentTimeline.some((e) => e.sourceType === 'project' && e.score === 90);
  assert(foundProject, '18. Project evidence is visible in the student evidence timeline');

  // 19. Preservation of existing assessment results alongside project evidence
  await DataService.addEvidence({
    userId: testStudentId,
    skillId: 'react',
    sourceType: 'assessment',
    sourceId: 'ass-react-basics',
    score: 85,
    verificationHash: 'hash-assessment-test',
    metadata: { title: 'React Core Assessment' }
  });
  const combinedTimeline = await DataService.getEvidenceTimeline(testStudentId);
  const hasAssessment = combinedTimeline.some((e) => e.sourceType === 'assessment');
  const hasProject = combinedTimeline.some((e) => e.sourceType === 'project');
  assert(hasAssessment && hasProject, '19. Assessment evidence and project evidence coexist harmoniously in timeline');

  // 20. Error handling and retry behavior
  let invalidProjectHandled = false;
  try {
    await ProjectService.startProject(testStudentId, 'non-existent-project-id');
  } catch (err: any) {
    invalidProjectHandled = true;
  }
  assert(invalidProjectHandled, '20. Robust error handling for invalid project identifiers');

  // 21. Reviewer Security: Student self-review prohibition
  let selfReviewBlocked = false;
  try {
    await ProjectService.evaluateAsReviewer({
      submissionId: sub2.id,
      reviewerId: testStudentId, // Student attempting to review their own submission!
      criteriaScores: sampleRubricScores,
      feedback: 'Self-grading 100%',
      approve: true,
    });
  } catch (err: any) {
    selfReviewBlocked = err.message.includes('Submitters cannot evaluate their own project');
  }
  assert(selfReviewBlocked, '21. Reviewer Security: Student self-review is strictly rejected');

  // 22. Reviewer Security: Unauthorized reviewer rejection
  let unauthorizedReviewBlocked = false;
  try {
    await ProjectService.evaluateAsReviewer({
      submissionId: sub2.id,
      reviewerId: 'student-intruder-999', // Unknown / non-reviewer identity
      criteriaScores: sampleRubricScores,
      feedback: 'Intruder evaluation',
      approve: true,
    });
  } catch (err: any) {
    unauthorizedReviewBlocked = err.message.includes('Only authorized mentors, reviewers, or instructors');
  }
  assert(unauthorizedReviewBlocked, '22. Reviewer Security: Unauthorized reviewer identity is rejected');

  // 23. Submission ID Format: Supabase UUID compatibility
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert(uuidRegex.test(sub2.id), `23. Submission ID "${sub2.id}" is a valid UUID for PostgreSQL compatibility`);

  // 24. Durable Synchronization State
  assert(
    sub2.syncStatus === 'local_only' || sub2.syncStatus === 'synced',
    `24. Submission carries explicit syncStatus ("${sub2.syncStatus}") rather than silently assuming success`
  );

  // 25. Idempotent Evidence Persistence
  const timelineBefore = await DataService.getEvidenceTimeline(testStudentId);
  const projectEvidenceBefore = timelineBefore.filter((e) => e.sourceType === 'project');
  // Re-run evaluation with authorized reviewer
  const reEval = await ProjectService.evaluateAsReviewer({
    submissionId: sub2.id,
    reviewerId: 'mentor-eva-01',
    criteriaScores: sampleRubricScores,
    feedback: 'Calibration pass 2',
    approve: true,
  });
  const timelineAfter = await DataService.getEvidenceTimeline(testStudentId);
  const projectEvidenceAfter = timelineAfter.filter((e) => e.sourceType === 'project');
  assert(
    projectEvidenceAfter.length === projectEvidenceBefore.length,
    `25. Evidence creation is strictly idempotent across evaluations (count maintained at ${projectEvidenceAfter.length})`
  );
  assert(
    reEval.evidenceId === priorEvidenceId,
    '25b. Re-evaluation preserves and updates existing evidence ID'
  );

  // ==========================================================================
  // REVIEWER API SECURITY TESTS (src/app/api/projects/evaluate/route.ts)
  // ==========================================================================
  console.log('\n--- REVIEWER API SECURITY TESTS ---');

  function createMockRequest(body: any, authHeader?: string) {
    return {
      json: async () => body,
      headers: {
        get: (h: string) => {
          if (h.toLowerCase() === 'authorization') return authHeader || null;
          return null;
        },
      },
    } as any;
  }

  // Test 26: Missing token is rejected (401)
  const reqMissingToken = createMockRequest({ submissionId: sub2.id });
  const resMissingToken = await evaluateRoute(reqMissingToken);
  assert(resMissingToken.status === 401, '26. Security: Missing Bearer token is rejected with HTTP 401');

  // Test 27: Invalid token is rejected (401)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Invalid token') }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  });
  const reqInvalidToken = createMockRequest({ submissionId: sub2.id }, 'Bearer invalid-token-xyz');
  const resInvalidToken = await evaluateRoute(reqInvalidToken);
  assert(resInvalidToken.status === 401, '27. Security: Invalid Bearer token is rejected with HTTP 401');

  // Test 28: Student role is rejected (403)
  const mockStudentId = 'student-auth-uuid-1111';
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async (token: string) => {
        if (token === 'student-token') return { data: { user: { id: mockStudentId } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      },
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: mockStudentId, role: 'student' }, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqStudentRole = createMockRequest({ submissionId: sub2.id }, 'Bearer student-token');
  const resStudentRole = await evaluateRoute(reqStudentRole);
  assert(resStudentRole.status === 403, '28. Security: Authenticated user with "student" role is rejected with HTTP 403');

  // Test 29: Missing profile is rejected (403)
  const mockUnassignedId = 'unassigned-auth-uuid-2222';
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async (token: string) => {
        if (token === 'unassigned-token') return { data: { user: { id: mockUnassignedId } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      },
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqMissingProfile = createMockRequest({ submissionId: sub2.id }, 'Bearer unassigned-token');
  const resMissingProfile = await evaluateRoute(reqMissingProfile);
  assert(resMissingProfile.status === 403, '29. Security: Authenticated user with missing profile is rejected with HTTP 403');

  // Test 30: Fake reviewer IDs are rejected (body impersonation ignored)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async (token: string) => {
        if (token === 'student-token') return { data: { user: { id: mockStudentId } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      },
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: mockStudentId, role: 'student' }, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqFakeReviewerId = createMockRequest(
    {
      submissionId: sub2.id,
      reviewerId: 'reviewer-admin-01',
      criteriaScores: sampleRubricScores,
    },
    'Bearer student-token'
  );
  const resFakeReviewerId = await evaluateRoute(reqFakeReviewerId);
  assert(resFakeReviewerId.status === 403, '30. Security: Fake reviewerId in body is ignored; unprivileged student is rejected with HTTP 403');

  // Test 31: Authorized reviewer can evaluate another student's submission (200)
  const mockReviewerId = 'reviewer-auth-uuid-9999';
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async (token: string) => {
        if (token === 'valid-reviewer-token') return { data: { user: { id: mockReviewerId } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      },
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: mockReviewerId, role: 'reviewer' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'project_submissions') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              maybeSingle: async () => {
                const sub = (await ProjectService.getUserSubmissions('', '')).find((s) => s.id === val);
                if (sub) {
                  return {
                    data: {
                      id: sub.id,
                      user_id: sub.userId,
                      project_id: sub.projectId,
                      status: sub.status,
                    },
                    error: null,
                  };
                }
                return { data: null, error: null };
              },
            }),
          }),
          update: () => ({ eq: async () => ({ error: null }) }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null }), limit: () => ({ data: [] }) }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'ev-test-authorized', created_at: new Date().toISOString() }, error: null }),
          }),
        }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
    },
  });
  const reqAuthorizedReview = createMockRequest(
    {
      submissionId: sub2.id,
      criteriaScores: sampleRubricScores,
      reviewerNotes: 'Official evaluation by authorized institutional reviewer.',
      approve: true,
    },
    'Bearer valid-reviewer-token'
  );
  const resAuthorizedReview = await evaluateRoute(reqAuthorizedReview);
  const dataAuthorized = await resAuthorizedReview.json();
  assert(resAuthorizedReview.status === 200 && dataAuthorized.success === true, '31. Security: Authorized reviewer evaluates student submission with HTTP 200');
  assert(dataAuthorized.submission.score === 90, '31b. Authentic rubric score recorded');
  assert(Boolean(dataAuthorized.evidenceRecord), '31c. Qualifying evaluation generates verified evidence');

  // Test 32: A reviewer cannot evaluate their own submission (403)
  const reviewerSelfSub = await ProjectService.submitProject({
    userId: mockReviewerId,
    projectId: 'proj-rest-api',
    repositoryUrl: 'https://github.com/reviewer-dev/my-api',
    projectSummary: 'API project submitted by reviewer as learner',
  });
  const reqSelfReview = createMockRequest(
    {
      submissionId: reviewerSelfSub.id,
      criteriaScores: { 'crit-api-routing': 25 },
      reviewerNotes: 'Self-approval attempt',
      approve: true,
    },
    'Bearer valid-reviewer-token'
  );
  const resSelfReview = await evaluateRoute(reqSelfReview);
  assert(resSelfReview.status === 403, '32. Security: Reviewer attempting self-review of own submission is rejected with HTTP 403');

  // Test 33: Student requests cannot change evaluation scores or create verified evidence
  const studentDraftAttempt = await ProjectService.saveDraft({
    userId: testStudentId,
    projectId: 'proj-db-auth',
    repositoryUrl: 'https://github.com/student/db',
    projectSummary: 'Student draft attempt',
  });
  assert(studentDraftAttempt.score === undefined || studentDraftAttempt.score === null, '33. Security: Student draft cannot assign evaluation scores');
  assert(studentDraftAttempt.evidenceId === undefined, '33b. Student draft cannot self-issue verified evidence');

  const studentFormalAttempt = await ProjectService.submitProject({
    userId: testStudentId,
    projectId: 'proj-db-auth',
    repositoryUrl: 'https://github.com/student/db',
    projectSummary: 'Formal student submission for evaluation',
  });
  assert(studentFormalAttempt.status === 'UNDER_REVIEW', '33c. Student submission enters UNDER_REVIEW without fabricated completion marks');
  assert(studentFormalAttempt.evidenceId === undefined, '33d. Student submission cannot self-issue verified evidence prior to authorized review');

  // Test 34: Expired token is rejected (401)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('JWT expired') }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  });
  const reqExpiredToken = createMockRequest({ submissionId: sub2.id }, 'Bearer expired-jwt-token');
  const resExpiredToken = await evaluateRoute(reqExpiredToken);
  assert(resExpiredToken.status === 401, '34. Security: Expired Bearer token is rejected with HTTP 401');

  // Test 35: Profile lookup database error causes safe failure without privilege grant (403)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async () => ({ data: { user: { id: 'some-user-id' } }, error: null }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: new Error('Database connection failed') }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqDbError = createMockRequest({ submissionId: sub2.id }, 'Bearer token-with-db-error');
  const resDbError = await evaluateRoute(reqDbError);
  assert(resDbError.status === 403, '35. Security: Profile lookup database error fails safe with HTTP 403');

  // Test 36: Unsupported role is rejected (403)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async () => ({ data: { user: { id: 'auditor-user-id' } }, error: null }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: 'auditor-user-id', role: 'auditor' }, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqUnsupportedRole = createMockRequest({ submissionId: sub2.id }, 'Bearer auditor-token');
  const resUnsupportedRole = await evaluateRoute(reqUnsupportedRole);
  assert(resUnsupportedRole.status === 403, '36. Security: Unsupported role ("auditor") is rejected with HTTP 403');

  // Test 37: Role inferred only from email domain or metadata without profile role is rejected (403)
  setMockSupabaseServerAdminClient({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'meta-user-id',
            email: 'admin@sevapassport.in',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              // Profile in database has no role assigned
              maybeSingle: async () => ({ data: { id: 'meta-user-id', role: null }, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    },
  });
  const reqMetaRole = createMockRequest({ submissionId: sub2.id }, 'Bearer email-domain-user-token');
  const resMetaRole = await evaluateRoute(reqMetaRole);
  assert(resMetaRole.status === 403, '37. Security: Email domain or user_metadata alone cannot grant reviewer authorization (HTTP 403)');

  // Configure authorized reviewer mock for input validation tests
  const setupAuthorizedReviewerMock = () => {
    setMockSupabaseServerAdminClient({
      auth: {
        getUser: async () => ({ data: { user: { id: mockReviewerId } }, error: null }),
      },
      from: (table: string) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { id: mockReviewerId, role: 'reviewer' }, error: null }),
              }),
            }),
          };
        }
        if (table === 'project_submissions') {
          return {
            select: () => ({
              eq: (col: string, val: string) => ({
                maybeSingle: async () => {
                  const sub = (await ProjectService.getUserSubmissions('', '')).find((s) => s.id === val);
                  if (sub) {
                    return {
                      data: {
                        id: sub.id,
                        user_id: sub.userId,
                        project_id: sub.projectId,
                        status: sub.status,
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
              }),
            }),
            update: () => ({ eq: async () => ({ error: null }) }),
          };
        }
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: null }), limit: () => ({ data: [] }) }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({ data: { id: 'ev-test-authorized', created_at: new Date().toISOString() }, error: null }),
            }),
          }),
          update: () => ({ eq: async () => ({ error: null }) }),
        };
      },
    });
  };

  // Test 38: Unknown rubric criterion ID is rejected (400)
  setupAuthorizedReviewerMock();
  const reqUnknownCriterion = createMockRequest(
    {
      submissionId: sub2.id,
      criteriaScores: { 'crit-nonexistent-criterion-xyz': 25 },
    },
    'Bearer valid-reviewer-token'
  );
  const resUnknownCriterion = await evaluateRoute(reqUnknownCriterion);
  assert(resUnknownCriterion.status === 400, '38. Validation: Unknown rubric criterion ID is rejected with HTTP 400');

  // Test 39: Negative criterion score is rejected (400)
  setupAuthorizedReviewerMock();
  const reqNegativeScore = createMockRequest(
    {
      submissionId: sub2.id,
      criteriaScores: { 'crit-ecommerce-core-features': -10 },
    },
    'Bearer valid-reviewer-token'
  );
  const resNegativeScore = await evaluateRoute(reqNegativeScore);
  assert(resNegativeScore.status === 400, '39. Validation: Negative rubric criterion score is rejected with HTTP 400');

  // Test 40: Criterion score exceeding maximum allowed score is rejected (400)
  setupAuthorizedReviewerMock();
  const reqExcessiveScore = createMockRequest(
    {
      submissionId: sub2.id,
      criteriaScores: { 'crit-ecommerce-core-features': 999 },
    },
    'Bearer valid-reviewer-token'
  );
  const resExcessiveScore = await evaluateRoute(reqExcessiveScore);
  assert(resExcessiveScore.status === 400, '40. Validation: Rubric score exceeding criterion maxScore is rejected with HTTP 400');

  // Test 41: Unknown submission ID returns HTTP 404
  setupAuthorizedReviewerMock();
  const reqUnknownSub = createMockRequest(
    {
      submissionId: 'nonexistent-submission-uuid-0000',
      criteriaScores: sampleRubricScores,
    },
    'Bearer valid-reviewer-token'
  );
  const resUnknownSub = await evaluateRoute(reqUnknownSub);
  assert(resUnknownSub.status === 404, '41. Validation: Nonexistent submission ID returns HTTP 404');

  // Test 42: Changes Requested (approve: false) does not generate qualifying evidence
  setupAuthorizedReviewerMock();
  const reqChangesRequested = createMockRequest(
    {
      submissionId: sub2.id,
      criteriaScores: sampleRubricScores,
      reviewerNotes: 'Need additional test coverage before approval.',
      approve: false,
    },
    'Bearer valid-reviewer-token'
  );
  const resChangesRequested = await evaluateRoute(reqChangesRequested);
  const dataChanges = await resChangesRequested.json();
  assert(resChangesRequested.status === 200, '42. Reviewer can record CHANGES_REQUESTED with HTTP 200');
  assert(dataChanges.submission.status === 'CHANGES_REQUESTED', '42b. Submission status set to CHANGES_REQUESTED');
  assert(dataChanges.evidenceRecord === undefined || dataChanges.evidenceRecord === null, '42c. CHANGES_REQUESTED does not generate qualifying evidence');

  // Test 43: Mock client injection is strictly disabled in production
  const originalNodeEnv = process.env.NODE_ENV;
  try {
    (process.env as any).NODE_ENV = 'production';
    let injectionBlocked = false;
    try {
      setMockSupabaseServerAdminClient({ mock: 'intruder' });
    } catch (err: any) {
      injectionBlocked = err.message.includes('Security violation');
    }
    assert(injectionBlocked, '43. Operational Safety: setMockSupabaseServerAdminClient is strictly rejected in production');
  } finally {
    (process.env as any).NODE_ENV = originalNodeEnv;
  }

  // Test 44: Direct client generation of project evidence is blocked
  let clientProjectEvidenceBlocked = false;
  try {
    (global as any).window = { localStorage: (global as any).localStorage, fetch: () => {} }; // Simulate browser client context
    await DataService.addEvidence({
      userId: testStudentId,
      skillId: 'react',
      sourceType: 'project',
      sourceId: 'proj-ecommerce-fullstack',
      score: 100,
      difficulty: 'HARD',
      qualityLevel: 'ADVANCED',
      dimension: 'Architecture',
      attemptNumber: 1,
      lastDemonstratedAt: new Date().toISOString(),
      verificationHash: 'SHA256:SEVA:fakehash',
      metadata: {},
    });
  } catch (err: any) {
    clientProjectEvidenceBlocked = err.message.includes('Security violation: Project evidence cannot be issued directly');
  } finally {
    (global as any).window = { localStorage: (global as any).localStorage };
  }
  assert(clientProjectEvidenceBlocked, '44. Defense-in-Depth: Direct client issuance of project evidence is strictly prohibited');

  // Reset mock admin client
  setMockSupabaseServerAdminClient(null);

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProjectEngineTests();
