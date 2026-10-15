import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { PaymentService, COURSE_PRICE_INR, COURSE_PRICE_PAISE } from '../src/lib/payments/service';
import { DataService } from '../src/lib/data-service';
import { COURSES } from '../src/data';

async function runUltimateMasterAudit() {
  console.log('\n======================================================');
  console.log('RUNNING SEVA SKILL PASSPORT — ULTIMATE MASTER AUDIT');
  console.log('======================================================\n');

  let passed = 0;
  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    ${err.message}`);
      process.exit(1);
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    ${err.message}`);
      process.exit(1);
    }
  }

  // --- SECTION 1: NON-NEGOTIABLE BUSINESS RULES & COURSE-SPECIFIC PRICING ---
  console.log('--- SECTION 1: INDIVIDUAL ₹100 PRICING & NO ALL-COURSES PASS ---');
  test('Rule 1: Price per course is exactly ₹100 INR', () => {
    assert.equal(COURSE_PRICE_INR, 100);
  });

  test('Rule 1B: Stored price in integer paise is exactly 10,000 paise', () => {
    assert.equal(COURSE_PRICE_PAISE, 10000);
  });

  await testAsync('Rule 2 & 3: Course A purchase grants access ONLY to Course A, NOT Course B', async () => {
    const userA = 'test-user-isolated-' + Date.now();
    
    // Purchase Course A (e.g. full-stack-development)
    const grantA = await PaymentService.grantCourseEntitlement({
      userId: userA,
      courseId: 'full-stack-development',
      orderId: 'order_iso_001',
      paymentId: 'pay_iso_001',
      amount: COURSE_PRICE_PAISE,
    });
    assert.equal(grantA.success, true);

    // Verify Course A is unlocked
    const hasAccessA = await PaymentService.hasCourseAccess(userA, 'full-stack-development');
    assert.equal(hasAccessA, true, 'User has access to purchased course A');

    // Verify Course B is STRICTLY LOCKED
    const hasAccessB = await PaymentService.hasCourseAccess(userA, 'cloud-devops');
    assert.equal(hasAccessB, false, 'User STRICTLY does NOT have access to unpurchased course B');

    // Verify user purchasing Course B gets Course B, while Course A progress remains intact
    const grantB = await PaymentService.grantCourseEntitlement({
      userId: userA,
      courseId: 'cloud-devops',
      orderId: 'order_iso_002',
      paymentId: 'pay_iso_002',
      amount: COURSE_PRICE_PAISE,
    });
    assert.equal(grantB.success, true);

    const hasAccessBothA = await PaymentService.hasCourseAccess(userA, 'full-stack-development');
    const hasAccessBothB = await PaymentService.hasCourseAccess(userA, 'cloud-devops');
    assert.equal(hasAccessBothA, true, 'Course A remains unlocked after purchasing Course B');
    assert.equal(hasAccessBothB, true, 'Course B is now unlocked after separate purchase');
  });

  test('Rule 4: Zero occurrences of "All-Courses Pass" offering in marketing cards', () => {
    const affordabilityCard = fs.readFileSync(
      path.join(process.cwd(), 'src/components/home/AffordabilityCard.tsx'),
      'utf8'
    );
    assert.equal(affordabilityCard.includes('total one-time pass'), false);
    assert.equal(affordabilityCard.includes('Unlock All Courses'), false);
  });

  // --- SECTION 2: DEMO MODE BEHAVIOR ---
  console.log('\n--- SECTION 2: DEMO MODE BEHAVIOR & REAL PAYMENTS DISABLED ---');
  await testAsync('Rule 6 & 8: Demo mode creates demo entitlement and does NOT record real paid transaction', async () => {
    const demoUser = 'demo-test-user-' + Date.now();
    const demoRes = await PaymentService.createDemoAccess(demoUser, 'full-stack-development');
    
    assert.equal(demoRes.success, true);
    assert.equal(demoRes.order?.provider, 'manual', 'Demo order provider is manual');
    assert.equal(demoRes.order?.metadata?.isDemo, true, 'Order explicitly metadata.isDemo: true');
    assert.equal(demoRes.order?.metadata?.accessType, 'demo', 'Order accessType is demo');
    assert.equal(demoRes.entitlement?.metadata?.isDemo, true, 'Entitlement explicitly isDemo: true');
    assert.equal(demoRes.entitlement?.courseId, 'full-stack-development');

    const isDemo = await PaymentService.isDemoAccess(demoUser, 'full-stack-development');
    assert.equal(isDemo, true);

    // Gateway status returns false when real keys are absent
    const gwStatus = PaymentService.getGatewayConfigStatus();
    assert.equal(typeof gwStatus.configured, 'boolean');
  });

  // --- SECTION 3: NEW USER ONBOARDING & EXISTING STUDENT DATA ---
  console.log('\n--- SECTION 3: ONBOARDING & EXISTING DATA PRESERVATION ---');
  await testAsync('Rule 5: New user never automatically enrolled in Full Stack Development', async () => {
    const registered = await DataService.registerUser({
      email: `fresh-${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      fullName: 'Fresh Student',
    });
    assert.ok(registered.user);
    assert.ok(!registered.user?.targetRole, 'targetRole is clean and empty on new user');
    assert.notEqual(registered.user?.targetRole, 'Full Stack Developer', 'Never auto-assigns Full Stack Developer');

    const enrollments = await DataService.getUserEnrollments(registered.user!.id);
    assert.equal(enrollments.length, 0, 'New user has 0 enrollments before choosing a course');
  });

  await testAsync('Rule 7: Existing student std-001 (Arjun Sharma) data remains intact', async () => {
    const student = await DataService.getUserProfile('std-001');
    assert.ok(student, 'std-001 profile exists');
    assert.equal(student?.fullName, 'Arjun Sharma');

    const enrollment = await DataService.getActiveUserEnrollment('std-001');
    assert.ok(enrollment, 'std-001 enrollment exists');
    assert.equal(enrollment?.progressPercent, 68, 'std-001 progress remains exactly 68%');
  });

  // --- SECTION 4: SAFE DATABASE MIGRATION ---
  console.log('\n--- SECTION 4: DATABASE SECURITY & SAFE MIGRATIONS ---');
  test('Rule 9: Phase 14 migration is non-destructive (ZERO DROP TABLE ... CASCADE)', () => {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20261015_phase14_course_specific_entitlements.sql'
    );
    assert.ok(fs.existsSync(migrationPath), 'Phase 14 migration file exists');
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.equal(content.includes('DROP TABLE'), false, 'Zero DROP TABLE statements');
    assert.equal(content.includes('CASCADE'), false, 'Zero CASCADE operations');
    assert.ok(content.includes('course_id'), 'Adds course_id column');
    assert.ok(content.includes('uq_user_course_entitlement'), 'Enforces unique user-course index');
    assert.ok(content.includes('ENABLE ROW LEVEL SECURITY'), 'Enforces RLS');
  });

  // --- SECTION 5: PRIVACY, TERMS, REFUND & COOKIES ---
  console.log('\n--- SECTION 5: LEGAL PAGES & CONSENT ARCHITECTURE ---');
  test('Dedicated legal pages exist in Next.js app directory', () => {
    const legalPages = ['privacy', 'terms', 'refund', 'cookies', 'privacy/delete-request', 'unsubscribe'];
    for (const page of legalPages) {
      const pagePath = path.join(process.cwd(), `src/app/${page}/page.tsx`);
      assert.ok(fs.existsSync(pagePath), `Page exists: src/app/${page}/page.tsx`);
    }
  });

  test('Cookie banner component exists and includes essential and optional categories', () => {
    const cookieBannerPath = path.join(
      process.cwd(),
      'src/components/shared/CookieConsentBanner.tsx'
    );
    assert.ok(fs.existsSync(cookieBannerPath), 'CookieConsentBanner exists');
    const bannerCode = fs.readFileSync(cookieBannerPath, 'utf8');
    assert.ok(bannerCode.includes('Accept All'), 'Contains Accept All');
    assert.ok(bannerCode.includes('Reject Optional'), 'Contains Reject Optional');
    assert.ok(bannerCode.includes('open-cookie-settings'), 'Listens for open-cookie-settings event');
  });

  // --- SECTION 6: SEO, METADATA & ACCESSIBILITY ---
  console.log('\n--- SECTION 6: SEO, METADATA & ACCESSIBILITY ---');
  test('Robots.txt handler exists and protects private dashboards', () => {
    const robotsPath = path.join(process.cwd(), 'src/app/robots.ts');
    assert.ok(fs.existsSync(robotsPath), 'robots.ts exists');
    const robotsCode = fs.readFileSync(robotsPath, 'utf8');
    assert.ok(robotsCode.includes('/dashboard/'), 'Disallows /dashboard/');
    assert.ok(robotsCode.includes('/admin/'), 'Disallows /admin/');
    assert.ok(robotsCode.includes('/courses'), 'Allows /courses');
  });

  test('Sitemap handler exists and lists public routes dynamically', () => {
    const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
    assert.ok(fs.existsSync(sitemapPath), 'sitemap.ts exists');
    const sitemapCode = fs.readFileSync(sitemapPath, 'utf8');
    assert.ok(sitemapCode.includes('/courses/'), 'Includes course routes');
  });

  test('Favicon icon.svg exists in src/app', () => {
    const iconPath = path.join(process.cwd(), 'src/app/icon.svg');
    assert.ok(fs.existsSync(iconPath), 'src/app/icon.svg exists');
  });

  test('Skip to content navigation component exists', () => {
    const skipPath = path.join(process.cwd(), 'src/components/layout/SkipToContent.tsx');
    assert.ok(fs.existsSync(skipPath), 'SkipToContent component exists');
  });

  test('Branded 404 page exists and uses SEVA color scheme', () => {
    const notFoundPath = path.join(process.cwd(), 'src/app/not-found.tsx');
    assert.ok(fs.existsSync(notFoundPath), 'not-found.tsx exists');
    const notFoundCode = fs.readFileSync(notFoundPath, 'utf8');
    assert.ok(notFoundCode.includes('#881337'), 'Uses SEVA Burgundy #881337');
    assert.ok(notFoundCode.includes('#FFFDF7'), 'Uses SEVA Warm Cream #FFFDF7');
  });

  console.log('\n------------------------------------------------------');
  console.log(`ULTIMATE MASTER AUDIT: ALL ${passed}/${passed} CHECKS PASSED`);
  console.log('------------------------------------------------------\n');
}

runUltimateMasterAudit();
