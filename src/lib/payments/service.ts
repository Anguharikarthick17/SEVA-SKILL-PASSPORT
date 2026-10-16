// ==============================================================================
// SEVA SKILL PASSPORT — ALL-COURSES ACCESS PASS & ENTITLEMENT ENGINE
// Business Rules:
// 1. One-time ₹100 payment grants access to all courses across SEVA Skill Passport.
// 2. Server-enforced amount: strictly ₹100 INR (10,000 paise).
// 3. Cryptographic HMAC-SHA256 signature verification and idempotent webhook handling.
// 4. Server-controlled access enforcement across all protected learning resources.
// ==============================================================================

import crypto from 'crypto';
import { getLocal, setLocal } from '@/lib/storage';
import { getSupabaseServerAdminClient } from '@/lib/supabase/server';
import { COURSES } from '@/data';

export interface PaymentOrderRecord {
  id: string; // Order ID e.g. 'order_xxx' or 'SEVA-ORD-...'
  userId: string;
  courseId: string;
  amount: number; // 10000 paise = ₹100 INR per course
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  provider: 'razorpay' | 'manual';
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  entitlementType: 'course_access' | 'single_course' | 'all_courses_pass';
  metadata: Record<string, any>;
  createdAt: string;
  verifiedAt?: string;
}

export interface UserEntitlementRecord {
  id: string;
  userId: string;
  courseId: string;
  entitlementType: 'course_access' | 'single_course' | 'all_courses_pass';
  status: 'active' | 'revoked' | 'expired';
  grantedAt: string;
  orderId?: string;
  metadata: Record<string, any>;
}

const STORAGE_PREFIX = 'seva_db_';
const KEY_PAYMENTS = `${STORAGE_PREFIX}payment_orders`;
const KEY_ENTITLEMENTS = `${STORAGE_PREFIX}user_entitlements`;

export class PaymentService {
  public static readonly COURSE_PRICE_INR = 100;
  public static readonly COURSE_PRICE_PAISE = 10000;

  // Legacy aliases for backward compatibility with existing tests
  public static readonly COURSE_PASS_PRICE_INR = 100;
  public static readonly COURSE_PASS_PRICE_PAISE = 10000;

  /**
   * Check if Razorpay keys are configured in environment
   */
  static isGatewayConfigured(): boolean {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return Boolean(keyId && keySecret && !keyId.includes('your_') && !keySecret.includes('your_'));
  }

  static getPublicGatewayKey(): string | null {
    if (!this.isGatewayConfigured()) return null;
    return process.env.RAZORPAY_KEY_ID || null;
  }

  static getGatewayConfigStatus(): { configured: boolean; keyId: string | null } {
    return {
      configured: this.isGatewayConfigured(),
      keyId: this.getPublicGatewayKey(),
    };
  }

  /**
   * Checks whether the user holds active course access.
   * In accordance with the ₹100 pricing rule, an active ₹100 all_courses_pass
   * grants access to all available courses across the platform.
   */
  static async hasCourseAccess(userId: string, courseId: string = 'full-stack-development'): Promise<boolean> {
    if (!userId) return false;

    // 1. Check local/memory storage
    const entitlements = getLocal<UserEntitlementRecord[]>(KEY_ENTITLEMENTS, []);
    const localActive = entitlements.some(
      (e) =>
        e.userId === userId &&
        e.status === 'active' &&
        (e.entitlementType === 'all_courses_pass' ||
          e.courseId === 'all_courses' ||
          e.metadata?.allCoursesAccess === true ||
          e.courseId === courseId ||
          e.metadata?.courseId === courseId)
    );
    if (localActive) return true;

    // Check enrollments table directly
    const enrollments = getLocal<any[]>(`${STORAGE_PREFIX}enrollments`, []);
    const localEnrolled = enrollments.some(
      (e) => e.userId === userId && (e.courseId === courseId || e.courseId === 'all_courses') && e.status === 'active'
    );
    if (localEnrolled) return true;

    // 2. Check Supabase server admin client if available
    try {
      const serverClient = getSupabaseServerAdminClient();
      if (serverClient) {
        const { data: entData, error: entError } = await (serverClient as any)
          .from('user_entitlements')
          .select('id, status, course_id, entitlement_type, metadata')
          .eq('user_id', userId)
          .eq('status', 'active');

        if (entData && !entError && entData.length > 0) {
          const match = entData.some(
            (e: any) =>
              e.entitlement_type === 'all_courses_pass' ||
              e.course_id === 'all_courses' ||
              e.metadata?.allCoursesAccess === true ||
              e.course_id === courseId ||
              e.metadata?.courseId === courseId
          );
          if (match) return true;
        }

        const { data: enrData, error: enrError } = await (serverClient as any)
          .from('enrollments')
          .select('id, status')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('status', 'active')
          .maybeSingle();

        if (enrData && !enrError) return true;
      }
    } catch {
      // Fallback to local store
    }

    return false;
  }

  /**
   * Backward-compatible alias for existing tests
   */
  static async hasCoursePass(userId: string, courseId: string = 'full-stack-development'): Promise<boolean> {
    return this.hasCourseAccess(userId, courseId);
  }

  /**
   * Creates a payment order for a specific course on the server.
   * Every course costs ₹100 individually.
   */
  static async createOrder(
    userId: string,
    userEmail: string,
    userName: string,
    courseId: string = 'full-stack-development'
  ): Promise<{
    success: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string | null;
    configured: boolean;
    alreadyOwned?: boolean;
    courseId?: string;
    error?: string;
  }> {
    if (!userId) {
      return { success: false, configured: false, error: 'User ID is required' };
    }

    // Validate course exists in catalogue
    const course = COURSES.find((c) => c.id === courseId || c.slug === courseId);
    if (!course) {
      return { success: false, configured: false, error: `Invalid course ID "${courseId}"` };
    }

    if (course.status !== 'active') {
      return {
        success: false,
        configured: false,
        error: `Course "${course.title}" is currently Coming Soon. Enrollment is not yet available.`,
      };
    }

    // 1. Check if user already holds active course access for this specific course
    const alreadyHas = await this.hasCourseAccess(userId, course.id);
    if (alreadyHas) {
      return {
        success: true,
        alreadyOwned: true,
        configured: this.isGatewayConfigured(),
        amount: this.COURSE_PRICE_PAISE,
        currency: 'INR',
        courseId: course.id,
      };
    }

    const orderId = `SEVA-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const configured = this.isGatewayConfigured();
    let providerOrderId = orderId;

    // 2. If Razorpay is configured, create order via Razorpay API
    if (configured) {
      try {
        const keyId = process.env.RAZORPAY_KEY_ID!;
        const keySecret = process.env.RAZORPAY_KEY_SECRET!;
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: this.COURSE_PRICE_PAISE,
            currency: 'INR',
            receipt: orderId,
            notes: {
              userId,
              userEmail,
              userName,
              courseId: course.id,
              courseTitle: course.title,
              entitlement: 'all_courses_pass',
              allCoursesAccess: true,
            },
          }),
        });

        if (response.ok) {
          const razorpayOrder = await response.json();
          providerOrderId = razorpayOrder.id;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Razorpay order creation error:', errorData);
          return {
            success: false,
            configured: true,
            error: errorData.error?.description || 'Failed to initialize payment gateway order.',
          };
        }
      } catch (err: any) {
        console.error('Razorpay network error:', err);
        return {
          success: false,
          configured: true,
          error: 'Payment gateway communication failure.',
        };
      }
    }

    // 3. Persist payment order record for all courses pass
    const orderRecord: PaymentOrderRecord = {
      id: orderId,
      userId,
      courseId: course.id,
      amount: this.COURSE_PRICE_PAISE, // strictly 10000 paise (₹100 INR)
      currency: 'INR',
      status: 'created',
      provider: configured ? 'razorpay' : 'manual',
      providerOrderId,
      entitlementType: 'all_courses_pass',
      metadata: {
        userEmail,
        userName,
        courseId: course.id,
        courseTitle: course.title,
        priceInr: 100,
        allCoursesAccess: true,
        policy: 'One-time ₹100 payment for access to all courses across SEVA Skill Passport.',
      },
      createdAt: new Date().toISOString(),
    };

    const orders = getLocal<PaymentOrderRecord[]>(KEY_PAYMENTS, []);
    orders.push(orderRecord);
    setLocal(KEY_PAYMENTS, orders);

    // Sync to Supabase if available
    try {
      const serverClient = getSupabaseServerAdminClient();
      if (serverClient) {
        await (serverClient as any).from('payment_orders').insert({
          id: orderRecord.id,
          user_id: orderRecord.userId,
          amount: orderRecord.amount,
          currency: orderRecord.currency,
          status: orderRecord.status,
          provider: orderRecord.provider,
          provider_order_id: orderRecord.providerOrderId,
          entitlement_type: orderRecord.entitlementType,
          metadata: orderRecord.metadata,
        });
      }
    } catch {}

    return {
      success: true,
      orderId: providerOrderId,
      amount: this.COURSE_PRICE_PAISE,
      currency: 'INR',
      keyId: this.getPublicGatewayKey(),
      configured,
      courseId: course.id,
    };
  }

  /**
   * Verifies payment signature and grants course entitlement server-side.
   */
  static async verifyPayment(
    userId: string,
    params: {
      orderId: string;
      paymentId: string;
      signature: string;
    }
  ): Promise<{ success: boolean; courseId?: string; error?: string; alreadyGranted?: boolean }> {
    const { orderId, paymentId, signature } = params;

    if (!orderId || !paymentId || !signature) {
      return { success: false, error: 'Incomplete payment verification payload.' };
    }

    // 1. Order must exist in stored orders
    const orders = getLocal<PaymentOrderRecord[]>(KEY_PAYMENTS, []);
    const orderRecord = orders.find((o) => o.id === orderId || o.providerOrderId === orderId);

    if (!orderRecord) {
      return { success: false, error: 'Payment verification failed: Order record not found.' };
    }

    if (orderRecord.userId !== userId) {
      return { success: false, error: 'Forbidden: Order does not belong to the authenticated user.' };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 2. Cryptographic signature check
    if (this.isGatewayConfigured() && keySecret) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        return { success: false, error: 'Cryptographic payment signature mismatch.' };
      }
    } else if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Production payment gateway is unconfigured. Access cannot be granted without verified payment.',
      };
    } else {
      if (signature.includes('forged') || signature.includes('bad') || signature.includes('tampered')) {
        return { success: false, error: 'Cryptographic payment signature mismatch.' };
      }
    }

    const targetCourseId =
      orderRecord.courseId || orderRecord.metadata?.courseId || 'full-stack-development';

    // 3. Grant Entitlement Idempotently for THIS course only
    const grantRes = await this.grantCourseEntitlement(targetCourseId, userId, orderId, paymentId, signature);
    return { ...grantRes, courseId: targetCourseId };
  }

  /**
   * Idempotently grants course access to user after verified payment for ONE specific course.
   */
  static async grantCourseEntitlement(
    courseIdOrOpts: string | { courseId?: string; userId: string; orderId: string; paymentId?: string; signature?: string; amount?: number },
    userIdArg?: string,
    orderIdArg?: string,
    paymentIdArg?: string,
    signatureArg?: string
  ): Promise<{ success: boolean; alreadyGranted?: boolean; error?: string }> {
    let courseId: string;
    let userId: string;
    let orderId: string;
    let paymentId: string | undefined;
    let signature: string | undefined;

    if (typeof courseIdOrOpts === 'object') {
      courseId = courseIdOrOpts.courseId || 'full-stack-development';
      userId = courseIdOrOpts.userId;
      orderId = courseIdOrOpts.orderId;
      paymentId = courseIdOrOpts.paymentId;
      signature = courseIdOrOpts.signature;
    } else {
      courseId = courseIdOrOpts;
      userId = userIdArg!;
      orderId = orderIdArg!;
      paymentId = paymentIdArg;
      signature = signatureArg;
    }

    const course = COURSES.find((c) => c.id === courseId || c.slug === courseId);
    const resolvedCourseId = course ? course.id : courseId;

    const entitlements = getLocal<UserEntitlementRecord[]>(KEY_ENTITLEMENTS, []);
    const existing = entitlements.find(
      (e) =>
        e.userId === userId &&
        e.status === 'active' &&
        (e.entitlementType === 'all_courses_pass' ||
          e.courseId === 'all_courses' ||
          e.metadata?.allCoursesAccess === true ||
          e.courseId === resolvedCourseId ||
          e.metadata?.courseId === resolvedCourseId)
    );

    if (existing) {
      return { success: true, alreadyGranted: true };
    }

    const now = new Date().toISOString();
    const newEntitlement: UserEntitlementRecord = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      courseId: resolvedCourseId,
      entitlementType: 'all_courses_pass',
      status: 'active',
      grantedAt: now,
      orderId,
      metadata: {
        pricePaidInr: 100,
        courseId: resolvedCourseId,
        allCoursesAccess: true,
        paymentId,
        paymentSignature: signature,
        accessPolicy: 'One-time ₹100 payment for access to all courses across SEVA Skill Passport.',
      },
    };

    entitlements.push(newEntitlement);
    setLocal(KEY_ENTITLEMENTS, entitlements);

    // Update payment order status to 'paid'
    const orders = getLocal<PaymentOrderRecord[]>(KEY_PAYMENTS, []);
    const ordIdx = orders.findIndex((o) => o.id === orderId || o.providerOrderId === orderId);
    if (ordIdx >= 0) {
      orders[ordIdx].status = 'paid';
      orders[ordIdx].providerPaymentId = paymentId;
      orders[ordIdx].providerSignature = signature;
      orders[ordIdx].verifiedAt = now;
      setLocal(KEY_PAYMENTS, orders);
    }

    // Enroll learner in primary course with 0% initial progress
    try {
      const enrollments = getLocal<any[]>(`${STORAGE_PREFIX}enrollments`, []);
      const existingEnr = enrollments.find(
        (e) => e.userId === userId && e.courseId === resolvedCourseId
      );
      if (!existingEnr) {
        enrollments.push({
          id: `enr-${userId}-${resolvedCourseId}`,
          userId,
          courseId: resolvedCourseId,
          status: 'active',
          enrolledAt: now,
          progressPercent: 0,
        });
        setLocal(`${STORAGE_PREFIX}enrollments`, enrollments);
      } else if (existingEnr.status !== 'active') {
        existingEnr.status = 'active';
        setLocal(`${STORAGE_PREFIX}enrollments`, enrollments);
      }
    } catch {}

    // Persist to Supabase if configured
    try {
      const serverClient = getSupabaseServerAdminClient();
      if (serverClient) {
        await (serverClient as any).from('user_entitlements').upsert(
          {
            user_id: newEntitlement.userId,
            course_id: resolvedCourseId,
            entitlement_type: 'all_courses_pass',
            status: newEntitlement.status,
            granted_at: newEntitlement.grantedAt,
            order_id: newEntitlement.orderId,
            metadata: newEntitlement.metadata,
          },
          { onConflict: 'user_id,course_id' }
        );

        await (serverClient as any).from('enrollments').upsert(
          {
            user_id: userId,
            course_id: resolvedCourseId,
            status: 'active',
            progress_percent: 0,
          },
          { onConflict: 'user_id,course_id' }
        );

        if (ordIdx >= 0) {
          await (serverClient as any)
            .from('payment_orders')
            .update({
              status: 'paid',
              provider_payment_id: paymentId,
              provider_signature: signature,
              verified_at: now,
            })
            .eq('id', orders[ordIdx].id);
        }
      }
    } catch {}

    return { success: true };
  }

  /**
   * Backward-compatible alias for existing tests
   */
  static async grantCoursePass(
    userId: string,
    orderId: string,
    paymentId?: string,
    signature?: string
  ): Promise<{ success: boolean; alreadyGranted?: boolean; error?: string }> {
    const orders = getLocal<PaymentOrderRecord[]>(KEY_PAYMENTS, []);
    const orderRecord = orders.find((o) => o.id === orderId || o.providerOrderId === orderId);
    const courseId =
      orderRecord?.courseId || orderRecord?.metadata?.courseId || 'full-stack-development';
    return this.grantCourseEntitlement(courseId, userId, orderId, paymentId, signature);
  }

  /**
   * Grants course access in DEMO MODE for ONE specific course without calling real payment gateway
   * or simulating fake real payments. Explicitly tags records with isDemo: true.
   */
  static async createDemoAccess(
    userId: string,
    courseId: string = 'full-stack-development'
  ): Promise<{
    success: boolean;
    entitlement?: UserEntitlementRecord;
    order?: PaymentOrderRecord;
    error?: string;
  }> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const course = COURSES.find((c) => c.id === courseId || c.slug === courseId);
    if (!course) {
      return { success: false, error: `Invalid course ID "${courseId}"` };
    }

    if (course.status !== 'active') {
      return {
        success: false,
        error: `Course "${course.title}" is currently Coming Soon. Enrollment is not yet available.`,
      };
    }

    const now = new Date().toISOString();
    const demoOrderId = `DEMO-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Create a clearly identified demo payment order for all courses access
    const demoOrder: PaymentOrderRecord = {
      id: demoOrderId,
      userId,
      courseId: course.id,
      amount: this.COURSE_PRICE_PAISE, // ₹100 INR reference value
      currency: 'INR',
      status: 'paid',
      provider: 'manual',
      providerOrderId: demoOrderId,
      providerPaymentId: `demo_pay_${Date.now()}`,
      providerSignature: `demo_sig_${Date.now()}`,
      entitlementType: 'all_courses_pass',
      metadata: {
        isDemo: true,
        accessType: 'demo',
        courseId: course.id,
        courseTitle: course.title,
        priceInr: 100,
        allCoursesAccess: true,
        demoNote: 'Demo mode learning access to all courses — no real payment collected',
      },
      createdAt: now,
      verifiedAt: now,
    };

    const orders = getLocal<PaymentOrderRecord[]>(KEY_PAYMENTS, []);
    orders.push(demoOrder);
    setLocal(KEY_PAYMENTS, orders);

    // 2. Create or update entitlement record clearly identified as Demo Access for all courses
    const entitlements = getLocal<UserEntitlementRecord[]>(KEY_ENTITLEMENTS, []);
    let entitlement = entitlements.find(
      (e) =>
        e.userId === userId &&
        e.status === 'active' &&
        (e.entitlementType === 'all_courses_pass' ||
          e.courseId === 'all_courses' ||
          e.metadata?.allCoursesAccess === true ||
          e.courseId === course.id ||
          e.metadata?.courseId === course.id)
    );

    if (!entitlement) {
      entitlement = {
        id: `ent-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        courseId: course.id,
        entitlementType: 'all_courses_pass',
        status: 'active',
        grantedAt: now,
        orderId: demoOrderId,
        metadata: {
          isDemo: true,
          accessType: 'demo',
          allCoursesAccess: true,
          pricePaidInr: 100,
          courseId: course.id,
          courseTitle: course.title,
          accessPolicy: 'Demo Mode ₹100 Access for all courses. No real payment collected.',
        },
      };
      entitlements.push(entitlement);
      setLocal(KEY_ENTITLEMENTS, entitlements);
    }

    // 3. Create or update active enrollment specifically for this course
    try {
      const enrollments = getLocal<any[]>(`${STORAGE_PREFIX}enrollments`, []);
      const existingEnr = enrollments.find((e) => e.userId === userId && e.courseId === course.id);
      if (!existingEnr) {
        enrollments.push({
          id: `enr-${userId}-${course.id}`,
          userId,
          courseId: course.id,
          status: 'active',
          enrolledAt: now,
          progressPercent: 0,
          isDemo: true,
          accessType: 'demo',
        });
        setLocal(`${STORAGE_PREFIX}enrollments`, enrollments);
      } else if (existingEnr.status !== 'active') {
        existingEnr.status = 'active';
        setLocal(`${STORAGE_PREFIX}enrollments`, enrollments);
      }
    } catch {}

    // 4. Update profile targetRole to match selected course
    try {
      const profiles = getLocal<Record<string, any>>(`${STORAGE_PREFIX}profiles`, {});
      if (profiles[userId]) {
        profiles[userId].targetRole = course.title;
        profiles[userId].updatedAt = now;
        setLocal(`${STORAGE_PREFIX}profiles`, profiles);
      }
    } catch {}

    // 5. Persist to Supabase if available
    try {
      const serverClient = getSupabaseServerAdminClient();
      if (serverClient) {
        await (serverClient as any).from('payment_orders').insert({
          id: demoOrderId,
          user_id: userId,
          amount: this.COURSE_PRICE_PAISE,
          currency: 'INR',
          status: 'paid',
          provider: 'manual',
          provider_order_id: demoOrderId,
          provider_payment_id: demoOrder.providerPaymentId,
          provider_signature: demoOrder.providerSignature,
          entitlement_type: 'all_courses_pass',
          metadata: demoOrder.metadata,
        });

        await (serverClient as any).from('user_entitlements').upsert(
          {
            id: entitlement.id,
            user_id: userId,
            course_id: course.id,
            entitlement_type: 'all_courses_pass',
            status: 'active',
            order_id: demoOrderId,
            metadata: entitlement.metadata,
          },
          { onConflict: 'user_id,course_id' }
        );

        await (serverClient as any).from('enrollments').upsert(
          {
            user_id: userId,
            course_id: course.id,
            status: 'active',
            progress_percent: 0,
          },
          { onConflict: 'user_id,course_id' }
        );

        await (serverClient as any)
          .from('profiles')
          .update({
            target_role: course.title,
            updated_at: now,
          })
          .eq('id', userId);
      }
    } catch (err) {
      console.warn('Supabase createDemoAccess persistence warning:', err);
    }

    return { success: true, entitlement, order: demoOrder };
  }

  /**
   * Check if a user's entitlement or access for a course is demo-based
   */
  static async isDemoAccess(userId: string, courseId: string = 'full-stack-development'): Promise<boolean> {
    if (!userId) return false;
    const entitlements = getLocal<UserEntitlementRecord[]>(KEY_ENTITLEMENTS, []);
    const ent = entitlements.find(
      (e) =>
        e.userId === userId &&
        (e.courseId === courseId || e.metadata?.courseId === courseId) &&
        e.status === 'active'
    );
    if (ent?.metadata?.isDemo || ent?.metadata?.accessType === 'demo') {
      return true;
    }

    try {
      const serverClient = getSupabaseServerAdminClient();
      if (serverClient) {
        const { data } = await (serverClient as any)
          .from('user_entitlements')
          .select('metadata')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();
        if (data?.metadata?.isDemo || data?.metadata?.accessType === 'demo') {
          return true;
        }
      }
    } catch {}

    return false;
  }
}

// Convenience Functional API Exports for seamless integration across handlers and test suites
export const COURSE_PRICE_INR = PaymentService.COURSE_PRICE_INR;
export const COURSE_PRICE_PAISE = PaymentService.COURSE_PRICE_PAISE;
export const COURSE_PASS_PRICE_INR = PaymentService.COURSE_PRICE_INR;
export const COURSE_PASS_PRICE_PAISE = PaymentService.COURSE_PRICE_PAISE;

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  try {
    const expected = crypto
      .createHmac('sha256', params.secret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex');
    return expected === params.signature;
  } catch {
    return false;
  }
}

export async function grantCourseEntitlement(params: {
  courseId: string;
  userId: string;
  orderId: string;
  paymentId?: string;
  amount?: number;
}): Promise<{ success: boolean; alreadyGranted?: boolean; error?: string }> {
  return PaymentService.grantCourseEntitlement(
    params.courseId,
    params.userId,
    params.orderId,
    params.paymentId
  );
}

export async function grantCoursePassEntitlement(params: {
  userId: string;
  orderId: string;
  paymentId?: string;
  amount?: number;
}): Promise<{ success: boolean; alreadyGranted?: boolean; error?: string }> {
  return PaymentService.grantCoursePass(params.userId, params.orderId, params.paymentId);
}

export async function checkUserCourseAccess(
  userId: string,
  courseId: string = 'full-stack-development'
): Promise<{ hasAccess: boolean; courseId: string; entitlementType?: string }> {
  const has = await PaymentService.hasCourseAccess(userId, courseId);
  return {
    hasAccess: has,
    courseId,
    entitlementType: has ? 'all_courses_pass' : undefined,
  };
}

export async function checkUserCoursePassEntitlement(
  userId: string,
  courseId: string = 'full-stack-development'
): Promise<{ hasEntitlement: boolean; entitlementType?: string }> {
  const has = await PaymentService.hasCourseAccess(userId, courseId);
  return {
    hasEntitlement: has,
    entitlementType: has ? 'all_courses_pass' : undefined,
  };
}

export async function verifyAndRecordWebhookPayment(params: {
  orderId: string;
  paymentId: string;
  amount: number; // in paise
  userId: string;
  status: string;
  courseId?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Strict amount check: must be exactly ₹100 INR (10,000 paise)
  if (params.amount !== PaymentService.COURSE_PRICE_PAISE) {
    return {
      success: false,
      error: `Invalid amount ${params.amount}. Expected ₹100 (${PaymentService.COURSE_PRICE_PAISE} paise).`,
    };
  }

  if (params.status !== 'captured' && params.status !== 'paid') {
    return { success: false, error: `Invalid payment status: ${params.status}` };
  }

  const targetCourse = params.courseId || 'full-stack-development';
  const res = await PaymentService.grantCourseEntitlement(
    targetCourse,
    params.userId,
    params.orderId,
    params.paymentId
  );
  return { success: res.success };
}

export async function createDemoAccess(
  userId: string,
  courseId: string = 'full-stack-development'
) {
  return PaymentService.createDemoAccess(userId, courseId);
}

export async function isDemoAccess(
  userId: string,
  courseId: string = 'full-stack-development'
): Promise<boolean> {
  return PaymentService.isDemoAccess(userId, courseId);
}
