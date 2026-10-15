import { NextRequest, NextResponse } from 'next/server';
import { COURSES } from '@/data';
import { PaymentService } from '@/lib/payments/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string | null = null;
    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      try {
        const {
          data: { user },
          error: userError,
        } = await adminClient.auth.getUser(token);
        if (!userError && user) {
          userId = user.id;
        }
      } catch {
        // Fall back to body or cookie
      }
    }

    const body = await req.json().catch(() => ({}));
    const finalUserId = userId || body.userId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication is required to choose a course.' },
        { status: 401 }
      );
    }

    const courseId = body.courseId;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Bad Request: courseId is required.' },
        { status: 400 }
      );
    }

    // Validate course exists in catalogue
    const course = COURSES.find((c) => c.id === courseId || c.slug === courseId);
    if (!course) {
      return NextResponse.json(
        { error: `Unknown course ID "${courseId}". Please select a valid course.` },
        { status: 404 }
      );
    }

    // Strictly enforce course availability
    if (course.status !== 'active') {
      return NextResponse.json(
        {
          error: `Course "${course.title}" is currently Coming Soon. Enrollment is not yet active for this curriculum.`,
          isComingSoon: true,
        },
        { status: 400 }
      );
    }

    const mode = body.mode || 'demo';

    if (mode === 'demo') {
      const demoResult = await PaymentService.createDemoAccess(finalUserId, course.id);
      if (!demoResult.success) {
        return NextResponse.json(
          { error: demoResult.error || 'Failed to establish demo access.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        isDemo: true,
        courseId: course.id,
        courseTitle: course.title,
        message: 'Successfully enrolled in course under Demo Mode.',
      });
    }

    return NextResponse.json(
      { error: 'Real payment activation requires standard checkout workflow.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing enrollment.' },
      { status: 500 }
    );
  }
}
