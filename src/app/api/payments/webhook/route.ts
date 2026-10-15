import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/lib/payments/service';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing x-razorpay-signature header.' },
          { status: 400 }
        );
      }
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { error: 'Invalid webhook signature.' },
          { status: 400 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Webhook secret is not configured in production.' },
        { status: 500 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Idempotently process payment captured
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
      const notes = paymentEntity?.notes || {};
      const userId = notes.userId;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount;
      const currency = paymentEntity?.currency;

      // Strict price and currency verification: 10000 paise (₹100 INR)
      if (amount && amount !== PaymentService.COURSE_PASS_PRICE_PAISE) {
        return NextResponse.json(
          { error: `Invalid payment amount: ${amount}. Expected ${PaymentService.COURSE_PASS_PRICE_PAISE} paise.` },
          { status: 400 }
        );
      }

      if (currency && currency.toUpperCase() !== 'INR') {
        return NextResponse.json(
          { error: `Invalid currency: ${currency}. Expected INR.` },
          { status: 400 }
        );
      }

      if (userId && orderId) {
        const courseId = notes.courseId || 'full-stack-development';
        await PaymentService.grantCourseEntitlement(courseId, userId, orderId, paymentId, signature || 'webhook');
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
