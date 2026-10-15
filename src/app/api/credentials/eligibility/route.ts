import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/credentials/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { searchParams } = new URL(req.url);

    let userId: string | null = null;
    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      const { data: { user } } = await adminClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const requestedUserId = searchParams.get('userId');
    const finalUserId = userId || requestedUserId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication token or user ID is required.' },
        { status: 401 }
      );
    }

    const courseId = searchParams.get('courseId') || 'full-stack-development';

    const [courseCompletion, assessment, skillPassport] = await Promise.all([
      CertificateService.checkEligibility(finalUserId, 'course_completion', courseId),
      CertificateService.checkEligibility(finalUserId, 'platform_assessment', courseId),
      CertificateService.checkEligibility(finalUserId, 'skill_passport', courseId),
    ]);

    return NextResponse.json({
      success: true,
      userId: finalUserId,
      eligibility: {
        course_completion: courseCompletion,
        platform_assessment: assessment,
        skill_passport: skillPassport,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error checking credential eligibility.' },
      { status: 500 }
    );
  }
}
