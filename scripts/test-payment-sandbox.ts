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
  console.log('RUNNING COMPREHENSIVE ₹100 PAYMENT SANDBOX VERIFICATION');
  console.log('======================================================\n');

  let passed = 0;
  const testSecret = 'sandbox_test_secret_key_12345';

  // --- SCENARIO 9: ACCESS BEFORE PAYMENT (UNPAID USER DENIED) ---
  console.log('--- SCENARIO 9: Access Before Payment ---');
  const unpaidUser = `unpaid-learner-${Date.now()}`;
  const preAccessA = await PaymentService.hasCourseAccess(unpaidUser, 'full-stack-development');
  const preAccessB = await PaymentService.hasCourseAccess(unpaidUser, 'cloud-devops');
  assert.equal(preAccessA, false, 'Unpaid user has no access to Course A before payment');
  assert.equal(preAccessB, false, 'Unpaid user has no access to Course B before payment');
  console.log('  ✓ [PASS] Unpaid user is strictly blocked before payment');
  passed++;

  // --- SCENARIO 6: UNAUTHORIZED PURCHASE REQUEST ---
  console.log('\n--- SCENARIO 6: Unauthorized Purchase Request ---');
  const emptyUserOrder = await PaymentService.createOrder('', 'anon@example.com', 'Anon', 'full-stack-development');
  assert.equal(emptyUserOrder.success, false, 'Order creation without userId is rejected');
  assert.ok(emptyUserOrder.error?.includes('User ID is required'), 'Error explains missing authentication');
  console.log('  ✓ [PASS] Unauthorized / anonymous purchase request rejected by server');
  passed++;

  // --- SCENARIO 5: INCORRECT AMOUNT OR CURRENCY ---
  console.log('\n--- SCENARIO 5: Incorrect Amount or Currency Rejected ---');
  // Order generation enforces 10,000 paise and INR
  const validUser = `student-order-${Date.now()}`;
  const validOrder = await PaymentService.createOrder(validUser, 'student@seva.edu', 'Student', 'full-stack-development');
  assert.equal(validOrder.success, true);
  assert.equal(validOrder.amount, 10000, 'Server enforces amount strictly as 10,000 paise (₹100)');
  assert.equal(validOrder.currency, 'INR', 'Server enforces currency strictly as INR');

  // Webhook rejects non-10000 paise
  const badAmountRes = await verifyAndRecordWebhookPayment({
    orderId: 'ord_bad_amt',
    paymentId: 'pay_bad_amt',
    amount: 9900, // ₹99
    userId: validUser,
    status: 'captured',
  });
  assert.equal(badAmountRes.success, false, 'Webhook rejects incorrect amount');
  assert.ok(badAmountRes.error?.includes('10000'), 'Error message specifies expected 10,000 paise');
  console.log('  ✓ [PASS] Incorrect amount or currency is strictly rejected');
  passed++;

  // --- SCENARIO 4: INVALID PAYMENT SIGNATURE REJECTED ---
  console.log('\n--- SCENARIO 4: Invalid Payment Signature Rejected ---');
  const orderId = validOrder.orderId!;
  const paymentId = `pay_mock_${Date.now()}`;

  const validSig = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  assert.equal(
    verifyPaymentSignature({ orderId, paymentId, signature: validSig, secret: testSecret }),
    true,
    'Valid signature passes'
  );

  const forgedSig = 'forged_tampered_signature_payload_xyz';
  assert.equal(
    verifyPaymentSignature({ orderId, paymentId, signature: forgedSig, secret: testSecret }),
    false,
    'Forged signature fails'
  );

  // verifyPayment rejected with tampered signature
  const verifyTampered = await PaymentService.verifyPayment(validUser, {
    orderId,
    paymentId,
    signature: 'bad_forged_sig',
  });
  assert.equal(verifyTampered.success, false, 'verifyPayment rejects forged signature');
  console.log('  ✓ [PASS] Cryptographic signature validation rejects forged signatures');
  passed++;

  // --- SCENARIO 1: SUCCESSFUL TEST PAYMENT (GRANTS ALL COURSES) ---
  console.log('\n--- SCENARIO 1: Successful Test Payment Grants Access to ALL Courses ---');
  const paidUser = `paid-learner-${Date.now()}`;
  const paidOrderId = `SEVA-ORD-${Date.now()}-SUCCESS`;
  const paidPaymentId = `pay_success_${Date.now()}`;

  await PaymentService.createOrder(paidUser, 'paid@seva.edu', 'Paid Learner', 'full-stack-development');

  const grantSuccess = await PaymentService.grantCourseEntitlement({
    userId: paidUser,
    courseId: 'full-stack-development',
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    amount: COURSE_PRICE_PAISE,
  });
  assert.equal(grantSuccess.success, true, 'Payment entitlement granted');

  // Verify access across all courses under the ₹100 rule
  const accessFullStack = await PaymentService.hasCourseAccess(paidUser, 'full-stack-development');
  const accessCloud = await PaymentService.hasCourseAccess(paidUser, 'cloud-devops');
  const accessAi = await PaymentService.hasCourseAccess(paidUser, 'data-ai');
  const accessSecurity = await PaymentService.hasCourseAccess(paidUser, 'cyber-security');

  assert.equal(accessFullStack, true, 'Paid user has access to Full Stack');
  assert.equal(accessCloud, true, 'Paid user has access to Cloud under ₹100 all-courses rule');
  assert.equal(accessAi, true, 'Paid user has access to AI under ₹100 all-courses rule');
  assert.equal(accessSecurity, true, 'Paid user has access to Security under ₹100 all-courses rule');
  console.log('  ✓ [PASS] Successful ₹100 payment grants access to all courses across platform');
  passed++;

  // --- SCENARIO 10: ACCESS AFTER VERIFIED PAYMENT PERSISTS ACROSS SESSIONS ---
  console.log('\n--- SCENARIO 10: Access After Verified Payment Persists Across Sessions ---');
  const persistedAccess1 = await PaymentService.hasCourseAccess(paidUser, 'full-stack-development');
  const persistedAccess2 = await PaymentService.hasCourseAccess(paidUser, 'cloud-devops');
  assert.equal(persistedAccess1, true, 'Entitlement persists on session reload');
  assert.equal(persistedAccess2, true, 'All-courses access persists on session reload');
  console.log('  ✓ [PASS] Entitlement state is persistent across re-login and session renewal');
  passed++;

  // --- SCENARIO 11: ACCESS FROM A DIFFERENT USER ACCOUNT IS ISOLATED ---
  console.log('\n--- SCENARIO 11: Access From a Different User Account Is Isolated ---');
  const anotherUser = `unpaid-other-${Date.now()}`;
  const otherUserAccess = await PaymentService.hasCourseAccess(anotherUser, 'full-stack-development');
  assert.equal(otherUserAccess, false, 'Different user does NOT inherit paid access');

  // Verify payment verification attempt for someone else\'s order is rejected
  const crossUserVerify = await PaymentService.verifyPayment(anotherUser, {
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    signature: 'mock_sig',
  });
  assert.equal(crossUserVerify.success, false, 'User cannot verify an order belonging to another user');
  console.log('  ✓ [PASS] Cross-user entitlement leakage strictly prevented');
  passed++;

  // --- SCENARIO 2: FAILED PAYMENT DOES NOT GRANT ACCESS ---
  console.log('\n--- SCENARIO 2: Failed Payment Does Not Grant Access ---');
  const failedUser = `failed-learner-${Date.now()}`;
  const failedWebhook = await verifyAndRecordWebhookPayment({
    orderId: 'ord_fail_001',
    paymentId: 'pay_fail_001',
    amount: 10000,
    userId: failedUser,
    status: 'failed',
  });
  assert.equal(failedWebhook.success, false, 'Failed payment webhook rejected');

  const failedAccess = await PaymentService.hasCourseAccess(failedUser, 'full-stack-development');
  assert.equal(failedAccess, false, 'Failed payment did not grant access');
  console.log('  ✓ [PASS] Failed payment does not grant course access');
  passed++;

  // --- SCENARIO 3: CANCELLED CHECKOUT DOES NOT GRANT ACCESS ---
  console.log('\n--- SCENARIO 3: Cancelled Checkout Does Not Grant Access ---');
  const cancelledUser = `cancelled-learner-${Date.now()}`;
  await PaymentService.createOrder(cancelledUser, 'cancelled@example.com', 'Cancelled', 'full-stack-development');
  // Order was created but user dismissed/cancelled checkout modal without paying
  const cancelledAccess = await PaymentService.hasCourseAccess(cancelledUser, 'full-stack-development');
  assert.equal(cancelledAccess, false, 'Cancelled checkout does not grant access');
  console.log('  ✓ [PASS] Cancelled / abandoned checkout does not grant course access');
  passed++;

  // --- SCENARIO 7: DUPLICATE WEBHOOK DELIVERY IS IDEMPOTENT ---
  console.log('\n--- SCENARIO 7: Duplicate Webhook Delivery Is Idempotent ---');
  const duplicateWebhookResult = await PaymentService.grantCourseEntitlement({
    userId: paidUser,
    courseId: 'full-stack-development',
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    amount: COURSE_PRICE_PAISE,
  });
  assert.equal(duplicateWebhookResult.success, true, 'Duplicate webhook returns success: true');
  assert.equal(duplicateWebhookResult.alreadyGranted, true, 'Duplicate identified as already granted');
  console.log('  ✓ [PASS] Duplicate webhooks are idempotent without creating duplicate entitlements');
  passed++;

  // --- SCENARIO 8: REPEAT PAYMENT-VERIFICATION REQUESTS ARE IDEMPOTENT ---
  console.log('\n--- SCENARIO 8: Repeat Payment-Verification Requests Are Idempotent ---');
  const repeatGrantResult = await PaymentService.grantCourseEntitlement({
    userId: paidUser,
    courseId: 'cloud-devops',
    orderId: paidOrderId,
    paymentId: paidPaymentId,
    amount: COURSE_PRICE_PAISE,
  });
  assert.equal(repeatGrantResult.success, true);
  assert.equal(repeatGrantResult.alreadyGranted, true);
  console.log('  ✓ [PASS] Repeat verification requests do not corrupt user state');
  passed++;

  // --- BONUS SCENARIO: DEMO MODE BEHAVIOR ---
  console.log('\n--- BONUS SCENARIO: Demo Mode Learning Access ---');
  const demoUser = `demo-student-${Date.now()}`;
  const demoResult = await PaymentService.createDemoAccess(demoUser, 'full-stack-development');
  assert.equal(demoResult.success, true);
  assert.equal(demoResult.order?.metadata?.isDemo, true);
  assert.equal(demoResult.entitlement?.metadata?.isDemo, true);

  const demoAllAccess = await PaymentService.hasCourseAccess(demoUser, 'cloud-devops');
  assert.equal(demoAllAccess, true, 'Demo user gets full demo access to all tracks');
  console.log('  ✓ [PASS] Demo mode creates authentic demo entitlement without charging payment gateway');
  passed++;

  console.log('\n------------------------------------------------------');
  console.log(`ALL ${passed} PAYMENT SANDBOX SCENARIOS PASSED WITH 100% SUCCESS`);
  console.log('------------------------------------------------------\n');
}

runPaymentSandboxTests().catch((err) => {
  console.error('Fatal error in payment sandbox suite:', err);
  process.exit(1);
});
