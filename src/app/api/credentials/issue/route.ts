import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/credentials/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string | null = null;
    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      const { data: { user } } = await adminClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const body = await req.json().catch(() => ({}));
    const requestedUserId = body.userId;

    // Use token user ID, or in development/local mode allow explicitly provided userId
    const finalUserId = userId || requestedUserId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication token or user ID is required.' },
        { status: 401 }
      );
    }

    const { credentialType, courseId } = body;
    if (!credentialType || !['course_completion', 'platform_assessment', 'skill_passport'].includes(credentialType)) {
      return NextResponse.json(
        { error: 'Invalid credentialType. Must be course_completion, platform_assessment, or skill_passport.' },
        { status: 400 }
      );
    }

    const result = await CertificateService.issueCredential(finalUserId, credentialType, {
      courseId: courseId || 'full-stack-development',
      issuedBy: 'SEVA Server-side Certification Engine',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to issue credential.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      credential: result.credential,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error during credential issuance.' },
      { status: 500 }
    );
  }
}
