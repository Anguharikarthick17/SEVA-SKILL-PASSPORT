import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string | null = null;
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
    }

    const body = await req.json().catch(() => ({}));
    const cookieToken = req.cookies.get('seva-auth-token')?.value;
    const finalUserId = userId || body.userId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication is required for payment verification.' },
        { status: 401 }
      );
    }

    const { orderId, paymentId, signature } = body;
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Bad Request: orderId, paymentId, and signature are required.' },
        { status: 400 }
      );
    }

    const result = await PaymentService.verifyPayment(finalUserId, {
      orderId,
      paymentId,
      signature,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      courseId: result.courseId,
      message: 'Payment successfully verified. Course access unlocked!',
      alreadyGranted: result.alreadyGranted || false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error verifying payment.' },
      { status: 500 }
    );
  }
}
