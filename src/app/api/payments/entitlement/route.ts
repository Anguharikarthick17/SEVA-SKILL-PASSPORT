import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId: string | null = req.nextUrl.searchParams.get('userId');
    const adminClient = getSupabaseServerAdminClient();

    if (token && adminClient) {
      const { data: { user } } = await adminClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({
        hasAccess: false,
        entitlement: null,
      });
    }

    const courseId = req.nextUrl.searchParams.get('courseId') || 'full-stack-development';
    const hasAccess = await PaymentService.hasCourseAccess(userId, courseId);

    return NextResponse.json({
      hasAccess,
      courseId,
      price: PaymentService.COURSE_PRICE_INR,
      currency: '₹',
      entitlementType: 'course_access',
      gatewayConfigured: PaymentService.isGatewayConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error checking entitlement.' },
      { status: 500 }
    );
  }
}
