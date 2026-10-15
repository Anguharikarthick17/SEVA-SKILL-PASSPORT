import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/lib/projects/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Authentication Header: Require Bearer Token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Authorization Bearer token.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Bearer token cannot be empty.' },
        { status: 401 }
      );
    }

    const adminClient = getSupabaseServerAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication service is unavailable.' },
        { status: 401 }
      );
    }

    // Verify token with Supabase auth
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired access token.' },
        { status: 401 }
      );
    }

    const authenticatedReviewerId = user.id;

    // 2. Enforce Trusted Reviewer Roles from Supabase Auth app_metadata (server-controlled) or profile
    let reviewerRole = (user.app_metadata as any)?.role;

    if (!reviewerRole) {
      try {
        const { data: profile } = await (adminClient as any)
          .from('profiles')
          .select('*')
          .eq('id', authenticatedReviewerId)
          .maybeSingle();
        reviewerRole = (profile as any)?.role;
      } catch {
        // Safe fallback if column is missing
      }
    }

    const ALLOWED_ROLES = ['reviewer', 'instructor', 'admin'];
    if (!reviewerRole || !ALLOWED_ROLES.includes(reviewerRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient privileges. Only reviewers, instructors, or admins can evaluate projects.' },
        { status: 403 }
      );
    }

    // 3. Parse and Validate Request Payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { submissionId, criteriaScores, reviewerNotes, approve } = body;

    if (!submissionId || typeof submissionId !== 'string' || !submissionId.trim()) {
      return NextResponse.json({ error: 'Missing or invalid required field: submissionId.' }, { status: 400 });
    }

    if (approve !== undefined && typeof approve !== 'boolean') {
      return NextResponse.json({ error: 'Field "approve" must be a boolean.' }, { status: 400 });
    }

    // 4. Retrieve Submission to Prevent Self-Review & Verify Ownership
    let targetSubmission: any = null;
    const { data: dbSub, error: dbSubError } = await (adminClient as any)
      .from('project_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (dbSub && !dbSubError) {
      targetSubmission = {
        id: dbSub.id,
        userId: dbSub.user_id,
        projectId: dbSub.project_id,
        attemptNumber: dbSub.attempt_number || 1,
        repositoryUrl: dbSub.repository_url || '',
        deploymentUrl: dbSub.deployment_url || undefined,
        summary: dbSub.summary || '',
        status: dbSub.status,
      };
    } else {
      // Fallback for mock/test cache
      targetSubmission = await ProjectService.getSubmissionById(submissionId);
    }

    if (!targetSubmission) {
      return NextResponse.json({ error: 'Project submission record not found.' }, { status: 404 });
    }

    // Prohibit self-review
    if (targetSubmission.userId === authenticatedReviewerId) {
      return NextResponse.json(
        { error: 'Forbidden: Submitters cannot evaluate or approve their own capstone projects.' },
        { status: 403 }
      );
    }

    // 5. Server-side Rubric and Score Validation
    const project = ProjectService.getProjectById(targetSubmission.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Associated project configuration not found.' }, { status: 404 });
    }

    if (reviewerNotes !== undefined) {
      if (typeof reviewerNotes !== 'string') {
        return NextResponse.json({ error: 'Reviewer notes must be a string.' }, { status: 400 });
      }
      if (reviewerNotes.length > 2000) {
        return NextResponse.json({ error: 'Reviewer notes exceeds maximum length of 2000 characters.' }, { status: 400 });
      }
    }

    if (criteriaScores !== undefined) {
      if (typeof criteriaScores !== 'object' || criteriaScores === null || Array.isArray(criteriaScores)) {
        return NextResponse.json({ error: 'Invalid criteriaScores format. Must be an object.' }, { status: 400 });
      }

      const validRubricIds = new Set(project.rubric.map((r) => r.id));
      for (const [criterionId, val] of Object.entries(criteriaScores)) {
        if (!validRubricIds.has(criterionId)) {
          return NextResponse.json({ error: `Invalid rubric criterion ID: "${criterionId}".` }, { status: 400 });
        }
        const score = typeof val === 'number' ? val : (typeof val === 'object' && val !== null ? (val as any).score : NaN);
        if (typeof score !== 'number' || isNaN(score) || !Number.isFinite(score)) {
          return NextResponse.json({ error: `Invalid score for criterion "${criterionId}". Must be a number.` }, { status: 400 });
        }
        const rubricItem = project.rubric.find((r) => r.id === criterionId)!;
        if (score < 0 || score > rubricItem.maxScore) {
          return NextResponse.json(
            { error: `Score for criterion "${rubricItem.name}" must be between 0 and ${rubricItem.maxScore}.` },
            { status: 400 }
          );
        }
        if (typeof val === 'object' && val !== null && (val as any).feedback) {
          if (typeof (val as any).feedback !== 'string' || (val as any).feedback.length > 1000) {
            return NextResponse.json({ error: `Criterion feedback exceeds maximum allowed length.` }, { status: 400 });
          }
        }
      }
    }

    // 6. Execute Authorized Evaluation Workflow
    const isApproved = approve !== undefined ? Boolean(approve) : true;
    const result = await ProjectService.evaluateAsReviewer({
      submissionId,
      reviewerId: authenticatedReviewerId,
      reviewerRole,
      reviewerNotes: (typeof reviewerNotes === 'string' ? reviewerNotes.trim() : '') || 'Evaluation approved by authorized institutional reviewer.',
      criteriaScores,
      approve: isApproved,
    });

    // 7. Structured Audit Logging
    console.info('[AUDIT:PROJECT_EVALUATION]', JSON.stringify({
      reviewerId: authenticatedReviewerId,
      submissionId,
      projectId: targetSubmission.projectId,
      action: 'PROJECT_EVALUATION',
      outcome: isApproved ? 'APPROVED' : 'CHANGES_REQUESTED',
      score: result.submission?.score,
      evidenceId: result.evidenceRecord?.id || null,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      submission: result.submission,
      evaluationReport: result.evaluationReport,
      evidenceRecord: result.evidenceRecord,
    });
  } catch (error: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: isProduction ? 'Internal server error: Failed to process reviewer evaluation.' : (error.message || 'Failed to process reviewer evaluation.') },
      { status: 500 }
    );
  }
}
