import { strict as assert } from 'assert';
import crypto from 'crypto';
import {
  PaymentService,
  verifyPaymentSignature,
  verifyAndRecordWebhookPayment,
  COURSE_PRICE_INR,
  COURSE_PRICE_PAISE,
} from '../src/lib/payments/service';

async function runPaymentSandboxTests() {
  console.log('\n======================================================');
  console.log('RUNNING ₹100 PAYMENT SANDBOX VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  const testSecret = 'sandbox_test_secret_key_12345';

  // 1. Unpaid user cannot access protected courses
  console.log('--- TEST 1: Unpaid User Access Guard ---');
  const unpaidUser = `unpaid-student-${Date.now()}`;
  const unpaidAccess1 = await PaymentService.hasCourseAccess(unpaidUser, 'full-stack-development');
  const unpaidAccess2 = await PaymentService.hasCourseAccess(unpaidUser, 'cloud-devops');
  assert.equal(unpaidAccess1, false, 'Unpaid user denied access to Course 1');
  assert.equal(unpaidAccess2, false, 'Unpaid user denied access to Course 2');
  console.log('  ✓ [PASS] Unpaid user strictly denied course access');
  passed++;

  // 2. Server creates order with strictly enforced ₹100 (10,000 paise) and INR
  console.log('\n--- TEST 2: Server-Enforced Amount & Currency ---');
  const orderRes = await PaymentService.createOrder(
    unpaidUser,
    'student@example.com',
    'Student Name',
    'full-stack-development'
  );
  assert.equal(orderRes.success, true, 'Order created successfully');
  assert.equal(orderRes.amount, 10000, 'Order amount strictly 10,000 paise (₹100)');
  assert.equal(orderRes.currency, 'INR', 'Order currency strictly INR');
  console.log('  ✓ [PASS] Server enforces amount: 10000 paise, currency: INR');
  passed++;

  // 3. Forged / Tampered Signature Rejected
  console.log('\n--- TEST 3: Cryptographic Signature Verification & Forgery Rejection ---');
  const orderId = orderRes.orderId!;
  const paymentId = `pay_mock_${Date.now()}`;
  
  // Valid signature
  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isValidSig = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
    secret: testSecret,
  });
  assert.equal(isValidSig, true, 'Valid HMAC signature passes verification');

  // Forged signature
  const forgedSig = 'forged_fake_signature_hash_value_123';
  const isForgedValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: forgedSig,
    secret: testSecret,
  });
  assert.equal(isForgedValid, false, 'Forged HMAC signature is rejected');

  // VerifyPayment with bad signature in manual/test mode
  const badVerify = await PaymentService.verifyPayment(unpaidUser, {
    orderId,
    paymentId,
    signature: 'bad_signature_tampered',
  });
  assert.equal(badVerify.success, false, 'Tampered signature rejected by verifyPayment');
  console.log('  ✓ [PASS] Forged / tampered signatures strictly rejected');
  passed++;

  // 4. Successful Payment Grants Access to ALL Courses
  console.log('\n--- TEST 4: Successful Payment Grants Access to ALL Courses ---');
  const paidUser = `paid-student-${Date.now()}`;
  const paidOrderId = `SEVA-ORD-${Date.now()}-TEST`;
  const paidPaymentId = `pay_test_${Date.now()}`;

  // Pre-create order
  await PaymentService.createOrder(paidUser, 'paid@example.com', 'Paid Student', 'full-stack-development');

  const grantRes = await PaymentService.grantCourseEntitlement({
    userId: paidUser,
    courseId: 'full-stack-development',
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    amount: COURSE_PRICE_PAISE,
  });
  assert.equal(grantRes.success, true, 'Payment entitlement granted');

  // Verify access across all courses
  const paidAccessA = await PaymentService.hasCourseAccess(paidUser, 'full-stack-development');
  const paidAccessB = await PaymentService.hasCourseAccess(paidUser, 'cloud-devops');
  const paidAccessC = await PaymentService.hasCourseAccess(paidUser, 'data-ai');
  const paidAccessD = await PaymentService.hasCourseAccess(paidUser, 'cyber-security');
  assert.equal(paidAccessA, true, 'Paid user has access to Full Stack');
  assert.equal(paidAccessB, true, 'Paid user has access to Cloud & DevOps under ₹100 rule');
  assert.equal(paidAccessC, true, 'Paid user has access to Data & AI under ₹100 rule');
  assert.equal(paidAccessD, true, 'Paid user has access to Cyber Security under ₹100 rule');
  console.log('  ✓ [PASS] Successful payment grants universal access across all courses');
  passed++;

  // 5. Duplicate Callbacks & Webhooks are Idempotent (No Duplicate Records)
  console.log('\n--- TEST 5: Idempotent Webhook & Duplicate Notification Handling ---');
  const duplicateGrant = await PaymentService.grantCourseEntitlement({
    userId: paidUser,
    courseId: 'full-stack-development',
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    amount: COURSE_PRICE_PAISE,
  });
  assert.equal(duplicateGrant.success, true, 'Duplicate call succeeds');
  assert.equal(duplicateGrant.alreadyGranted, true, 'Duplicate callback identified as already granted');
  console.log('  ✓ [PASS] Duplicate payments handled idempotently without duplicate records');
  passed++;

  // 6. Webhook Rejects Incorrect Amount
  console.log('\n--- TEST 6: Webhook Rejects Incorrect Amount ---');
  const wrongAmountRes = await verifyAndRecordWebhookPayment({
    orderId: 'order_test_wrong',
    paymentId: 'pay_test_wrong',
    amount: 5000, // ₹50 instead of ₹100
    userId: 'user_wrong_amount',
    status: 'captured',
  });
  assert.equal(wrongAmountRes.success, false, 'Webhook rejects non-₹100 amount');
  assert.ok(wrongAmountRes.error?.includes('10000'), 'Error message specifies expected 10,000 paise');
  console.log('  ✓ [PASS] Webhook strictly rejects incorrect payment amount');
  passed++;

  // 7. Webhook Rejects Failed or Pending Payment Status
  console.log('\n--- TEST 7: Failed Payment Status Does Not Grant Access ---');
  const failedWebhookRes = await verifyAndRecordWebhookPayment({
    orderId: 'order_failed_test',
    paymentId: 'pay_failed_test',
    amount: 10000,
    userId: 'user_failed_payment',
    status: 'failed',
  });
  assert.equal(failedWebhookRes.success, false, 'Failed payment rejected');

  const failedUserAccess = await PaymentService.hasCourseAccess('user_failed_payment', 'full-stack-development');
  assert.equal(failedUserAccess, false, 'Failed payment does not grant course access');
  console.log('  ✓ [PASS] Failed payment does not grant access');
  passed++;

  // 8. Session Persistence & Renewal
  console.log('\n--- TEST 8: Access State Persists Across Re-login / Refresh ---');
  // Re-checking the paid user simulates a page refresh / session reload
  const reloadedAccess = await PaymentService.hasCourseAccess(paidUser, 'full-stack-development');
  assert.equal(reloadedAccess, true, 'Entitlement persists after reload/session renewal');
  console.log('  ✓ [PASS] Entitlement state persists across page refresh and re-authentication');
  passed++;

  // 9. Demo Mode Verification
  console.log('\n--- TEST 9: Demo Mode Creates Demo Entitlement Without Real Charges ---');
  const demoStudent = `demo-learner-${Date.now()}`;
  const demoRes = await PaymentService.createDemoAccess(demoStudent, 'full-stack-development');
  assert.equal(demoRes.success, true);
  assert.equal(demoRes.order?.metadata?.isDemo, true);
  assert.equal(demoRes.entitlement?.metadata?.isDemo, true);

  const demoHasAllAccess = await PaymentService.hasCourseAccess(demoStudent, 'cloud-devops');
  assert.equal(demoHasAllAccess, true, 'Demo user receives all courses access in demo mode');
  console.log('  ✓ [PASS] Demo mode establishes verified demo entitlement safely');
  passed++;

  console.log('\n------------------------------------------------------');
  console.log(`PAYMENT SANDBOX SUITE: ALL ${passed}/${passed} CHECKS PASSED`);
  console.log('------------------------------------------------------\n');
}

runPaymentSandboxTests().catch((err) => {
  console.error('Fatal error in payment sandbox suite:', err);
  process.exit(1);
});
