import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string | null = null;
    let userEmail = 'student@seva.edu';
    let userName = 'Student';

    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized: Valid authentication token is required.' },
          { status: 401 }
        );
      }
      userId = user.id;
      userEmail = user.email || userEmail;
      userName = (user.user_metadata as any)?.full_name || userName;
    }

    const body = await req.json().catch(() => ({}));
    const cookieToken = req.cookies.get('seva-auth-token')?.value;
    const finalUserId = userId || body.userId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication is required to access ₹100 course unlock.' },
        { status: 401 }
      );
    }

    const courseId = body.courseId || 'full-stack-development';

    const result = await PaymentService.createOrder(
      finalUserId,
      body.userEmail || userEmail,
      body.userName || userName,
      courseId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initialize payment order.' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error creating payment order.' },
      { status: 500 }
    );
  }
}
