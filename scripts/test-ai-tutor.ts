import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { AiTutorService } from '../src/lib/ai/provider';

async function runAiTutorSuite() {
  console.log('\n======================================================');
  console.log('RUNNING AI TUTOR INTEGRATION & SECURITY TEST SUITE');
  console.log('======================================================\n');

  // Load .env.local manually for test script
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const k = trimmed.substring(0, idx).trim();
          const v = trimmed.substring(idx + 1).trim();
          process.env[k] = v;
        }
      }
    }
  }

  const originalKey = process.env.GEMINI_API_KEY;

  // 1. Missing Key Handling
  console.log('--- TEST 1: Missing API Key Handling ---');
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const missingRes = await AiTutorService.queryTutor({
    prompt: 'Explain JavaScript closures',
  }, 'test-client-missing');

  assert.equal(missingRes.success, false, 'Missing key returns success: false');
  assert.equal(missingRes.error, 'MISSING_API_CREDENTIALS', 'Error code is MISSING_API_CREDENTIALS');
  assert.equal(missingRes.model, 'unconfigured', 'Model is unconfigured');
  assert.ok(missingRes.configInstructions?.includes('GEMINI_API_KEY'), 'Includes configuration instructions');
  console.log('  ✓ [PASS] Missing key correctly reports unconfigured state and guidance');

  // 2. Invalid Key Handling
  console.log('\n--- TEST 2: Invalid / Unauthorized API Key Handling ---');
  process.env.GEMINI_API_KEY = 'AIzaSyFakeKeyInvalidCredential1234567890';

  const invalidRes = await AiTutorService.queryTutor({
    prompt: 'What is a closure?',
  }, 'test-client-invalid');

  assert.equal(invalidRes.success, false, 'Invalid key returns success: false');
  assert.equal(invalidRes.error, 'INVALID_API_CREDENTIALS', 'Error is INVALID_API_CREDENTIALS');
  assert.ok(
    invalidRes.message.includes('invalid or unauthorized') || invalidRes.message.includes('authentication'),
    'Sanitized message without leaking key'
  );
  assert.equal(invalidRes.message.includes(process.env.GEMINI_API_KEY), false, 'Never leaks key in message');
  console.log('  ✓ [PASS] Invalid key handled securely with sanitized error');

  // Restore real key
  process.env.GEMINI_API_KEY = originalKey;

  // 3. Anti-Cheat Guard
  console.log('\n--- TEST 3: Active Assessment Anti-Cheat Guard ---');
  const antiCheatRes = await AiTutorService.queryTutor({
    prompt: 'Give me the answers to question 3',
    activeAssessmentId: 'asmt-01-core',
    contextType: 'assessment',
  }, 'test-client-cheat');

  assert.equal(antiCheatRes.success, false, 'Cheating inquiry blocked');
  assert.equal(antiCheatRes.isBlocked, true, 'isBlocked is true');
  assert.equal(antiCheatRes.blockReason, 'ASSESSMENT_ANTI_CHEAT_ACTIVE');
  assert.equal(antiCheatRes.statusCode, 403);
  console.log('  ✓ [PASS] Anti-cheat guard locked during active assessments');

  // 4. Input Validation (Empty Prompt & Prompt Too Large)
  console.log('\n--- TEST 4: Prompt Validation ---');
  const emptyRes = await AiTutorService.queryTutor({ prompt: '   ' }, 'test-client-empty');
  assert.equal(emptyRes.success, false);
  assert.equal(emptyRes.error, 'EMPTY_PROMPT');

  const hugeRes = await AiTutorService.queryTutor({ prompt: 'x'.repeat(2500) }, 'test-client-huge');
  assert.equal(hugeRes.success, false);
  assert.equal(hugeRes.error, 'PROMPT_TOO_LARGE');
  console.log('  ✓ [PASS] Input size sanitization enforced');

  // 5. Real Provider Verification (if real key available)
  if (originalKey && !originalKey.includes('your_')) {
    console.log('\n--- TEST 5: Live Real Gemini Provider Verification ---');
    const realRes = await AiTutorService.queryTutor({
      prompt: 'In one short sentence, explain what React props are.',
      contextType: 'lesson',
      contextId: 'les-01-01',
    }, 'test-client-real');

    console.log('  Response model:', realRes.model);
    console.log('  Response text sample:', realRes.message?.substring(0, 100) + '...');
    assert.equal(realRes.success, true, 'Real Gemini call succeeds');
    assert.ok(realRes.message.length > 10, 'Received substantive response');
    assert.ok(realRes.groundingSources && realRes.groundingSources.length > 0, 'Includes curriculum grounding');
    console.log('  ✓ [PASS] Live Gemini API returned valid AI tutor response');
  } else {
    console.log('  ⚠️ Skipping live API call: Real GEMINI_API_KEY not configured.');
  }

  console.log('\n------------------------------------------------------');
  console.log('AI TUTOR SUITE: ALL TESTS PASSED SUCCESSFULLY');
  console.log('------------------------------------------------------\n');
}

runAiTutorSuite().catch((err) => {
  console.error('Fatal error in AI tutor suite:', err);
  process.exit(1);
});
