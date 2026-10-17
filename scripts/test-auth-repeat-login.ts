import { DataService } from '../src/lib/data-service';

async function runComprehensiveAuthTests() {
  console.log('\n======================================================');
  console.log('SEVA SKILL PASSPORT — COMPREHENSIVE AUTH & REPEAT LOGIN TEST SUITE');
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

  try {
    // Clean up any previous session
    await DataService.logoutUser();

    // ----------------------------------------------------
    // TEST 1: Unknown Account Rejection
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Unknown Account Rejection ---');
    const unknownRes = await DataService.loginUser('nonexistent.user.999@example.com', 'SomePassword123!');
    assert(unknownRes.user === null, 'Rejects non-existent email credentials');
    assert(unknownRes.error !== null && unknownRes.error.includes('Invalid login credentials'), 
      'Returns standard security-compliant invalid login message', unknownRes);

    // ----------------------------------------------------
    // TEST 2: Demo Account Pre-seeded Login
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Pre-seeded Demo Learner Login (Arjun Sharma) ---');
    const demoLogin = await DataService.loginUser('arjun.sharma@example.gov.in', 'Password123!');
    assert(demoLogin.user !== null && demoLogin.error === null, 'Pre-seeded demo user logs in successfully', demoLogin);
    assert(demoLogin.user?.id === 'std-001', 'Demo user has stable ID std-001', demoLogin.user);
    assert(demoLogin.user?.fullName === 'Arjun Sharma', 'Demo user full name matches Arjun Sharma');

    // Verify Demo User Entitlements and Records
    const demoCourses = await DataService.getCourses();
    const demoEnrollments = await DataService.getUserEnrollments('std-001');
    const demoPassport = await DataService.getUserSkillPassport('std-001');
    const demoCredentials = await DataService.getUserCredentials('std-001');
    const demoCompletedLessons = await DataService.getCompletedLessonIds('std-001');

    assert(demoCourses.length > 0, 'Courses retrieved successfully');
    assert(demoEnrollments.length > 0, 'Enrollments exist for std-001');
    assert(demoPassport !== null, 'Skill Passport exists for std-001');
    assert(demoCredentials.length > 0, 'Credentials exist for std-001');
    assert(demoCompletedLessons.length > 0, 'Lesson progress exists for std-001');

    console.log(`    Learner: ${demoLogin.user?.fullName}, Enrolled: ${demoEnrollments.length}, Passport: ${demoPassport?.verificationId}, Lessons Completed: ${demoCompletedLessons.length}`);

    // Logout Demo User
    await DataService.logoutUser();
    const sessionAfterLogout = await DataService.getCurrentUser();
    assert(sessionAfterLogout === null, 'User session cleared after logout');

    // ----------------------------------------------------
    // TEST 3: New Learner Registration
    // ----------------------------------------------------
    console.log('\n--- 3. Testing New Learner Registration ---');
    const timestamp = Date.now();
    const testEmail = `learner.${timestamp}@example.com`;
    const testPassword = 'SecurePassword2026!';
    const testFullName = `Priya Patel ${timestamp}`;

    const regRes = await DataService.registerUser({
      fullName: testFullName,
      email: testEmail,
      password: testPassword,
      education: 'B.Tech Computer Science',
      state: 'Tamil Nadu',
      district: 'Chennai',
    });

    assert(regRes.user !== null && regRes.error === null, 'New learner registers successfully', regRes);
    assert(!!regRes.user?.id, 'New learner gets a valid user ID', regRes.user);
    assert(regRes.user?.email === testEmail, 'Email matches registration input');
    assert(regRes.user?.fullName === testFullName, 'Full name matches registration input');
    assert(regRes.needsEmailConfirmation === false, 'Learner is ready for immediate dashboard entry');

    const newUserId = regRes.user!.id;

    // ----------------------------------------------------
    // TEST 4: Session Persistence After Registration
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Session Persistence After Registration ---');
    const currentSession = await DataService.getCurrentUser();
    assert(currentSession !== null, 'Session is active after registration');
    assert(currentSession?.id === newUserId, 'Active session matches registered user ID');
    assert(currentSession?.email === testEmail, 'Active session email matches registered user');

    // ----------------------------------------------------
    // TEST 5: Duplicate Email Registration Prevention
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Duplicate Email Registration Prevention ---');
    const dupRes = await DataService.registerUser({
      fullName: 'Duplicate Attempt',
      email: testEmail,
      password: 'AnotherPass123!',
    });
    assert(dupRes.user === null && dupRes.error !== null, 'Duplicate registration with same email is rejected', dupRes);
    assert(dupRes.error!.toLowerCase().includes('already registered') || dupRes.error!.toLowerCase().includes('already'), 
      'Returns duplicate email warning message', dupRes);

    // ----------------------------------------------------
    // TEST 6: Logout
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Logout ---');
    await DataService.logoutUser();
    const clearedSession = await DataService.getCurrentUser();
    assert(clearedSession === null, 'Session is null after logout');

    // ----------------------------------------------------
    // TEST 7: Invalid Password Rejection on Registered Account
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Invalid Password Rejection ---');
    const badPassRes = await DataService.loginUser(testEmail, 'WrongPassword123!');
    assert(badPassRes.user === null && badPassRes.error !== null, 'Rejects incorrect password for registered account', badPassRes);
    assert(badPassRes.error!.includes('Invalid login credentials'), 'Displays safe generic error message', badPassRes);

    // ----------------------------------------------------
    // TEST 8: Repeat Login with Same Registered Email & Password
    // ----------------------------------------------------
    console.log('\n--- 8. Testing Repeat Login with Registered Credentials ---');
    const repeatLoginRes = await DataService.loginUser(testEmail, testPassword);
    assert(repeatLoginRes.user !== null && repeatLoginRes.error === null, 'Repeat login succeeds with identical credentials', repeatLoginRes);
    assert(repeatLoginRes.user?.id === newUserId, 'Stable user ID is preserved across logins');
    assert(repeatLoginRes.user?.email === testEmail, 'User email matches');
    assert(repeatLoginRes.user?.fullName === testFullName, 'User profile data is preserved');

    // ----------------------------------------------------
    // TEST 9: Cross-User Data Isolation
    // ----------------------------------------------------
    console.log('\n--- 9. Testing Cross-User Data Isolation ---');
    // New learner Priya Patel should have clean enrollments, not Arjun Sharma's records
    const priyaEnrollments = await DataService.getUserEnrollments(newUserId);
    const priyaCompletedLessons = await DataService.getCompletedLessonIds(newUserId);
    assert(priyaEnrollments.length === 0, 'New learner starts with 0 enrollments (cross-user isolation)');
    assert(priyaCompletedLessons.length === 0, 'New learner starts with 0 completed lessons');

    // ----------------------------------------------------
    // TEST 10: Preserving Existing Learner Data (Arjun Sharma std-001)
    // ----------------------------------------------------
    console.log('\n--- 10. Testing Preservation of Existing Learner Data ---');
    await DataService.logoutUser();
    const arjunRelogin = await DataService.loginUser('arjun.sharma@example.gov.in', 'Password123!');
    assert(arjunRelogin.user !== null, 'Arjun Sharma logs back in seamlessly');
    const arjunEnrollments = await DataService.getUserEnrollments('std-001');
    const arjunCompleted = await DataService.getCompletedLessonIds('std-001');
    assert(arjunEnrollments.length > 0, 'Arjun Sharma enrollments preserved');
    assert(arjunCompleted.length >= 2, 'Arjun Sharma completed lesson progress preserved');

    // ----------------------------------------------------
    // TEST 11: Course Entitlement & ₹100 Price Rule Verification
    // ----------------------------------------------------
    console.log('\n--- 11. Testing Course Entitlement & ₹100 Price Rule ---');
    const fsCourse = demoCourses.find(c => c.id === 'full-stack-development');
    assert(fsCourse !== undefined, 'Full Stack Development course found in catalogue');
    assert(fsCourse?.price === 100, 'Full Stack Developer price is exactly ₹100 INR');
    assert(fsCourse?.currency === '₹', 'Full Stack Developer currency is INR (₹)');
    
    // Verify Arjun Sharma has active full-stack enrollment
    const isEnrolled = arjunEnrollments.some(c => c.courseId === 'full-stack-development');
    assert(isEnrolled === true, 'Arjun Sharma has active enrollment for full-stack-development');

  } catch (err: any) {
    console.error('\nUnexpected exception during test run:', err);
    failed++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveAuthTests();
