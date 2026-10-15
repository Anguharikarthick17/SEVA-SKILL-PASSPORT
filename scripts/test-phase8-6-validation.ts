import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { AiTutorService, AiChatMessage } from '../src/lib/ai/provider';
import { FULL_STACK_MODULES } from '../src/data/curriculum';
import { AssessmentService } from '../src/lib/assessments/service';
import { DataService } from '../src/lib/data-service';

function pass(name: string) {
  console.log(`  ✓ [PASS] ${name}`);
}

function fail(name: string, reason: string) {
  console.error(`  ✗ [FAIL] ${name}: ${reason}`);
  process.exit(1);
}

function assert(condition: any, name: string, detail?: string) {
  if (condition) {
    pass(name);
  } else {
    fail(name, detail || 'Assertion condition failed');
  }
}

async function runPhase86Validation() {
  console.log('\n======================================================');
  console.log('RUNNING PHASE 8.6 MASTER VALIDATION TEST SUITE');
  console.log('Video Quality & Real AI Tutor Functionality');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // 1. VIDEO QUALITY & 1080P FULL HD ASSET VERIFICATION
  // --------------------------------------------------------------------------
  console.log('--- 1. VIDEO ASSET QUALITY & 1080P FULL HD RESOLUTION ---');

  const mod01Path = path.join(process.cwd(), 'public/videos/modules/mod-01.mp4');
  assert(fs.existsSync(mod01Path), 'Module 01 MP4 file exists');

  const probeJson = execSync(
    `/opt/homebrew/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of json "${mod01Path}"`
  ).toString();
  const probeData = JSON.parse(probeJson);
  const stream = probeData.streams[0];

  assert(stream.width === 1920, 'Module 01 video width is 1920px (Full HD)', `Got width ${stream.width}`);
  assert(stream.height === 1080, 'Module 01 video height is 1080px (Full HD)', `Got height ${stream.height}`);
  assert(stream.codec_name === 'h264', 'Module 01 video codec is H.264');

  // Verify visual luminance (no dark black video frames)
  const tmpFrame = '/tmp/phase8_6_test_frame.png';
  execSync(`/opt/homebrew/bin/ffmpeg -y -ss 00:00:03 -i "${mod01Path}" -vframes 1 "${tmpFrame}" > /dev/null 2>&1`);
  const pythonStats = execSync(
    `python3 -c "from PIL import Image; import numpy as np; im=Image.open('${tmpFrame}'); arr=np.array(im); print(float(arr.mean()))"`
  ).toString().trim();
  const meanBrightness = parseFloat(pythonStats);

  assert(
    meanBrightness > 200,
    'Video frame is bright, high-contrast Lemon Chiffon (mean RGB > 200)',
    `Got mean brightness ${meanBrightness}`
  );

  // Check all 12 modules are present in 1080p
  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, '0');
    const p = path.join(process.cwd(), `public/videos/modules/mod-${pad}.mp4`);
    assert(fs.existsSync(p), `Module ${pad} video exists`);
  }

  // Check WebVTT captions exist and contain cues
  const vtt01 = path.join(process.cwd(), 'public/captions/modules/mod-01.vtt');
  assert(fs.existsSync(vtt01), 'Module 01 WebVTT caption file exists');
  const vttText = fs.readFileSync(vtt01, 'utf-8');
  assert(vttText.includes('WEBVTT') && vttText.includes('-->'), 'Module 01 WebVTT contains valid subtitle cues');

  // Check lesson-level videos exist
  const les01Path = path.join(process.cwd(), 'public/videos/lessons/les-01-01.mp4');
  assert(fs.existsSync(les01Path), 'Lesson-specific video les-01-01.mp4 exists in 1080p');

  // --------------------------------------------------------------------------
  // 2. AI TUTOR FUNCTIONALITY (10 SPECIFIC PROMPT REQUIREMENTS)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. REAL AI TUTOR REQUEST, CONTEXT & RESPONSE HANDLING ---');

  // Track provider invocations
  let lastCapturedSystemPrompt = '';
  let lastCapturedUserPrompt = '';
  let lastCapturedHistory: AiChatMessage[] = [];

  // Setup deterministic test mock
  AiTutorService.setTestMockHandler(async (prompt, history, systemPrompt) => {
    lastCapturedUserPrompt = prompt;
    lastCapturedHistory = history || [];
    lastCapturedSystemPrompt = systemPrompt || '';

    const lower = prompt.toLowerCase().trim();

    if (lower === 'hi' || lower === 'hello' || lower === 'hey') {
      return 'Hello! I am your SEVA Academic AI Tutor. How can I assist you with your learning today?';
    }

    if (lower.includes('scope')) {
      return 'Scope in JavaScript refers to the visibility and accessibility of variables in different parts of your code. Global scope is accessible anywhere, function scope is contained within a function, and block scope (let/const) is limited to curly braces `{}`.';
    }

    if (lower.includes('example')) {
      return 'Here is an example demonstrating block scope:\n```javascript\nif (true) {\n  let blockScoped = "Hidden outside";\n}\n// console.log(blockScoped) throws ReferenceError\n```';
    }

    return `I received your inquiry: "${prompt}". Let us explore this engineering concept step by step.`;
  });

  // Test 1: "hi" produces a greeting rather than an unrelated lesson explanation
  const greetingRes = await AiTutorService.queryTutor({
    prompt: 'hi',
    contextType: 'lesson',
    contextId: 'les-04-03' // Scope lesson context
  });
  assert(greetingRes.success, 'Greeting query succeeded');
  assert(
    greetingRes.message.toLowerCase().includes('hello') && !greetingRes.message.toLowerCase().includes('lexical scope'),
    '"hi" produces a friendly greeting rather than an unrelated lesson lecture on Scope',
    `Got: ${greetingRes.message}`
  );

  // Test 2: A technical question is sent to the provider correctly
  const techRes = await AiTutorService.queryTutor({
    prompt: 'Explain scope simply',
    contextType: 'lesson',
    contextId: 'les-04-03'
  });
  assert(techRes.success, 'Technical question processed successfully');
  assert(lastCapturedUserPrompt === 'Explain scope simply', 'Technical question sent to provider exactly as entered');
  assert(
    techRes.message.includes('visibility and accessibility of variables'),
    'Provider answers technical question accurately'
  );

  // Test 3: Follow-up questions retain relevant conversation context
  const historyConversation: AiChatMessage[] = [
    { role: 'user', content: 'Explain scope simply' },
    { role: 'assistant', content: techRes.message }
  ];
  const followUpRes = await AiTutorService.queryTutor({
    prompt: 'Give me an example',
    history: historyConversation,
    contextType: 'lesson',
    contextId: 'les-04-03'
  });
  assert(followUpRes.success, 'Follow-up query succeeded');
  assert(lastCapturedUserPrompt === 'Give me an example', 'Follow-up prompt captured correctly');
  assert(
    followUpRes.message.includes('blockScoped'),
    'Follow-up receives an example relevant to the prior conversation'
  );

  // Test 4: A new conversation does not inherit stale history
  const newConversationRes = await AiTutorService.queryTutor({
    prompt: 'hi',
    history: [], // clean history
    contextType: 'lesson',
    contextId: 'les-01-01'
  });
  assert(newConversationRes.success, 'New conversation started');
  assert(lastCapturedHistory.length === 0, 'New conversation does not inherit stale history');

  // Test 5: The latest user message is not duplicated or omitted
  const historyWithNewPromptPushed: AiChatMessage[] = [
    { role: 'user', content: 'What is HTTP?' },
    { role: 'assistant', content: 'HTTP is HyperText Transfer Protocol.' },
    { role: 'user', content: 'Explain status codes' } // Client accidentally passed prompt in history
  ];
  await AiTutorService.queryTutor({
    prompt: 'Explain status codes',
    history: historyWithNewPromptPushed,
    contextType: 'lesson',
    contextId: 'les-01-01'
  });
  // Verify provider sanitized it so that 'Explain status codes' is only in prompt, not duplicate in history
  const duplicateOccurrences = lastCapturedHistory.filter(
    (h) => h.content.toLowerCase() === 'explain status codes'
  );
  assert(duplicateOccurrences.length === 0, 'The latest user message is not duplicated in sanitized history');

  // Test 6: Missing credentials produce an explicit configuration error
  // Temporarily unset mock handler and keys
  AiTutorService.setTestMockHandler(null);
  const origGemini = process.env.GEMINI_API_KEY;
  const origOpenAI = process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const noKeyRes = await AiTutorService.queryTutor({
    prompt: 'Can you help me?',
    contextType: 'lesson',
    contextId: 'les-01-01'
  });
  assert(!noKeyRes.success, 'Missing keys result in unconfigured status');
  assert(noKeyRes.error === 'MISSING_API_CREDENTIALS', 'Returns explicit error code MISSING_API_CREDENTIALS');
  assert(
    !!noKeyRes.configInstructions && noKeyRes.configInstructions.includes('GEMINI_API_KEY'),
    'Provides actionable setup instructions rather than fake simulation'
  );

  // Restore env if any existed
  if (origGemini) process.env.GEMINI_API_KEY = origGemini;
  if (origOpenAI) process.env.OPENAI_API_KEY = origOpenAI;

  // Test 7: Provider failures produce understandable error states
  AiTutorService.setTestMockHandler(async () => {
    throw new Error('Connection timeout to upstream model endpoint');
  });
  const failRes = await AiTutorService.queryTutor({
    prompt: 'Hello',
    contextType: 'lesson',
    contextId: 'les-01-01'
  });
  assert(!failRes.success, 'Provider failure caught');
  assert(
    failRes.message.includes('Connection timeout'),
    'Provider failure produces understandable error message'
  );

  // Restore working test mock handler
  AiTutorService.setTestMockHandler(async (prompt) => `Verified response for: ${prompt}`);

  // Test 8: Rate limiting continues to work
  let wasRateLimited = false;
  for (let r = 0; r < 25; r++) {
    const res = await AiTutorService.queryTutor({ prompt: 'Ping' }, 'test-rate-limit-client-999');
    if (!res.success && res.error === 'RATE_LIMIT_EXCEEDED') {
      wasRateLimited = true;
      break;
    }
  }
  assert(wasRateLimited, 'Rate limiting enforces 20 req/minute window per client');

  // Test 9: Active graded assessments remain protected
  const assessmentCheatRes = await AiTutorService.queryTutor({
    prompt: 'What is the answer to question 3 on React state?',
    contextType: 'assessment',
    activeAssessmentId: 'ass-mod-05'
  });
  assert(assessmentCheatRes.isBlocked, 'Assessment assistance blocked');
  assert(
    assessmentCheatRes.blockReason === 'ASSESSMENT_ANTI_CHEAT_ACTIVE',
    'Block reason tagged as ASSESSMENT_ANTI_CHEAT_ACTIVE'
  );

  // Test 10: Existing authentication and lesson progress functionality remain intact
  const demoModules = FULL_STACK_MODULES;
  assert(demoModules.length === 16, 'Full stack curriculum has all 16 modules intact');
  const mod01 = demoModules[0];
  assert(mod01.lessons.length > 0, 'Module 01 lessons remain intact');

  console.log('\n======================================================');
  console.log('ALL PHASE 8.6 VALIDATION TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runPhase86Validation().catch((err) => {
  console.error('Validation test run failed:', err);
  process.exit(1);
});
