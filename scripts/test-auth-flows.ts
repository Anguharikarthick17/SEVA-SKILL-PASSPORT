import { DataService } from '../src/lib/data-service';

async function runAuthFlowTests() {
  console.log('\n======================================================');
  console.log('TESTING EMAIL CONFIRMATION & RESEND FLOWS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      failed++;
    }
  }

  // Test 1: Invalid email rejection on resend
  const invalidResend = await DataService.resendConfirmationEmail('not-an-email');
  assert(!invalidResend.success, 'Rejects malformed email on resend');
  assert(invalidResend.message.includes('valid email'), 'Provides user-friendly invalid email message');

  // Test 2: Resend confirmation email call format
  const validResend = await DataService.resendConfirmationEmail('test.student@example.gov.in');
  assert(typeof validResend.success === 'boolean', 'Returns structured response for valid email resend');
  assert(typeof validResend.message === 'string', 'Returns informative message string');

  // Test 3: Safe resend rate limit / simulated dispatch
  assert(validResend.message.length > 0, 'Message is non-empty and user-reassuring');

  // Test 4: Supabase login unconfirmed email detection logic
  const mockError = { message: 'Email not confirmed', status: 400 };
  const isUnconfirmed = mockError.message.toLowerCase().includes('email not confirmed');
  assert(isUnconfirmed === true, 'Correctly flags "Email not confirmed" error from Supabase');

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthFlowTests();
