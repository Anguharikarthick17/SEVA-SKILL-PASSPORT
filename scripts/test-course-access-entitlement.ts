import { PaymentService } from '../src/lib/payments/service';
import { DataService } from '../src/lib/data-service';

async function runCourseAccessRegressionTests() {
  console.log('\n======================================================');
  console.log('SEVA SKILL PASSPORT — COURSE ACCESS & ENTITLEMENT REGRESSION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, details?: any) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      if (details) console.error('    Details:', details);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUserId = `learner-test-${timestamp}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: User without purchase remains locked
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: Unpaid User Remains Locked ---');
    const unpaidAccess = await PaymentService.hasCourseAccess(testUserId, 'full-stack-development');
    assert(unpaidAccess === false, 'User without purchase or enrollment is strictly denied course access');

    // -------------------------------------------------------------------------
    // TEST 2: Demo Student std-001 (Arjun Sharma) Access
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Pre-seeded Demo Learner Access ---');
    const demoAccess = await PaymentService.hasCourseAccess('std-001', 'full-stack-development');
    assert(demoAccess === true, 'Designated demo learner std-001 has active course access for Full Stack Developer');

    const demoAllCourses = await PaymentService.hasCourseAccess('std-001', 'all_courses');
    assert(demoAllCourses === true, 'std-001 has active entitlement for all_courses');

    // -------------------------------------------------------------------------
    // TEST 3: ₹100 Price Rule and Single Order Amount
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: ₹100 Price Rule ---');
    assert(PaymentService.COURSE_PRICE_INR === 100, 'Course price is strictly ₹100 INR');
    assert(PaymentService.COURSE_PRICE_PAISE === 10000, 'Course price is strictly 10,000 paise');

    // -------------------------------------------------------------------------
    // TEST 4: Verified Payment Unlocks Entire Full Stack Developer Course
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Verified Payment Unlocks Entire Course ---');
    const orderRes = await PaymentService.createOrder(
      testUserId,
      `learner.${timestamp}@example.com`,
      'Test Learner',
      'full-stack-development'
    );
    assert(orderRes.success === true, 'Payment order created successfully');
    assert(orderRes.orderId !== undefined, 'Order received valid unique orderId');

    const orderId = orderRes.orderId!;
    const mockPaymentId = `pay_mock_${timestamp}`;
    const mockSignature = `sig_valid_${timestamp}`;

    // Grant verified entitlement
    const grantRes = await PaymentService.grantCourseEntitlement(
      'full-stack-development',
      testUserId,
      orderId,
      mockPaymentId,
      mockSignature
    );
    assert(grantRes.success === true, 'Course entitlement successfully granted');

    const paidAccess = await PaymentService.hasCourseAccess(testUserId, 'full-stack-development');
    assert(paidAccess === true, 'User now has active course access after verified payment');

    // -------------------------------------------------------------------------
    // TEST 5: Repeated Verification / Duplicate Webhook is Idempotent
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Idempotency of Repeated Verification ---');
    const duplicateGrant = await PaymentService.grantCourseEntitlement(
      'full-stack-development',
      testUserId,
      orderId,
      mockPaymentId,
      mockSignature
    );
    assert(duplicateGrant.success === true, 'Duplicate grant returns success');
    assert(duplicateGrant.alreadyGranted === true, 'Duplicate grant explicitly flags alreadyGranted: true');

    // -------------------------------------------------------------------------
    // TEST 6: Reconciling Existing Purchase Without Charging Again
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Reconcile Purchase Without Charging Again ---');
    const reOrderRes = await PaymentService.createOrder(
      testUserId,
      `learner.${timestamp}@example.com`,
      'Test Learner',
      'full-stack-development'
    );
    assert(reOrderRes.success === true, 'Order query succeeds for existing purchaser');
    assert(reOrderRes.alreadyOwned === true, 'createOrder prevents duplicate charge with alreadyOwned: true');

    // -------------------------------------------------------------------------
    // TEST 7: Cross-User Isolation (Another User Cannot Use Entitlement)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Cross-User Isolation ---');
    const anotherUser = `other-learner-${timestamp}`;
    const otherUserAccess = await PaymentService.hasCourseAccess(anotherUser, 'full-stack-development');
    assert(otherUserAccess === false, 'Different learner cannot access another user’s course entitlement');

    // -------------------------------------------------------------------------
    // TEST 8: Forged Signatures and Tampered Payments Grant No Access
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Security Validation for Forged Signatures ---');
    const forgedUser = `forged-hacker-${timestamp}`;
    const forgedOrder = await PaymentService.createOrder(
      forgedUser,
      'hacker@example.com',
      'Hacker',
      'full-stack-development'
    );
    const forgedVerify = await PaymentService.verifyPayment(forgedUser, {
      orderId: forgedOrder.orderId!,
      paymentId: 'fake_pay_123',
      signature: 'bad_tampered_signature',
    });
    assert(forgedVerify.success === false, 'Forged payment signature is rejected');
    const forgedAccess = await PaymentService.hasCourseAccess(forgedUser, 'full-stack-development');
    assert(forgedAccess === false, 'Forged attempt grants zero course access');

    // -------------------------------------------------------------------------
    // TEST 9: Demo Access Mode is Distinguished
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Demo Access Distinguishes Real Payment ---');
    const demoUser = `demo-student-${timestamp}`;
    const demoPassRes = await PaymentService.createDemoAccess(demoUser, 'full-stack-development');
    assert(demoPassRes.success === true, 'Demo access created successfully');
    assert(demoPassRes.order?.metadata?.isDemo === true, 'Demo order explicitly flags isDemo: true');
    assert(demoPassRes.entitlement?.metadata?.isDemo === true, 'Demo entitlement explicitly flags isDemo: true');
    const demoUserAccess = await PaymentService.hasCourseAccess(demoUser, 'full-stack-development');
    assert(demoUserAccess === true, 'Demo user can access the course for evaluation');

    // -------------------------------------------------------------------------
    // TEST 10: Legacy and All-Courses Entitlements
    // -------------------------------------------------------------------------
    console.log('\n--- Test 10: Legacy All-Courses Pass Compatibility ---');
    const legacyUser = `legacy-user-${timestamp}`;
    await PaymentService.grantCourseEntitlement(
      'all_courses',
      legacyUser,
      `ORD-LEGACY-${timestamp}`,
      'pay_legacy',
      'sig_legacy'
    );
    const legacyFsAccess = await PaymentService.hasCourseAccess(legacyUser, 'full-stack-development');
    assert(legacyFsAccess === true, 'Legacy all-courses entitlement unlocks Full Stack Developer course');

    // -------------------------------------------------------------------------
    // TEST 11: Navigation Between Lessons Creates Zero Additional Orders
    // -------------------------------------------------------------------------
    console.log('\n--- Test 11: Lesson Navigation Incurs Zero Charges ---');
    const { getLocal } = await import('../src/lib/storage');
    const ordersBefore = getLocal<any[]>('seva_db_payment_orders', []);
    
    // User accesses lesson 1, lesson 10, module 5...
    const accessLesson1 = await PaymentService.hasCourseAccess(testUserId, 'full-stack-development');
    const accessLesson2 = await PaymentService.hasCourseAccess(testUserId, 'full-stack-development');
    const ordersAfter = getLocal<any[]>('seva_db_payment_orders', []);
    
    assert(accessLesson1 && accessLesson2, 'Lessons remain accessible without repeat verification');
    assert(ordersBefore.length === ordersAfter.length, 'Zero additional payment orders created on navigation');

  } catch (err: any) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`REGRESSION RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCourseAccessRegressionTests();
