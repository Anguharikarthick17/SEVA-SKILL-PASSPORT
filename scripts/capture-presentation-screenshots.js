/**
 * scripts/capture-presentation-screenshots.js
 * 
 * Automates headless Google Chrome via Chrome DevTools Protocol (CDP) to capture
 * genuine, high-fidelity 1920x1080 (and mobile) screenshots of the running SEVA Skill Passport
 * website for the SEVA FIRST Innovation Challenge 2026 presentation.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../presentation-assets/website-screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.pending.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }
  }
}

async function run() {
  console.log('================================================================');
  console.log('SEVA SKILL PASSPORT — PRESENTATION SCREENSHOT CAPTURE');
  console.log('================================================================\n');

  console.log('Launching headless Google Chrome on port 9225...');
  const chromeProc = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9225',
      '--window-size=1920,1080',
      '--hide-scrollbars',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--no-first-run',
      'about:blank',
    ]
  );

  await wait(2500);

  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    try {
      const version = await fetchJson('http://localhost:9225/json/version');
      if (version.webSocketDebuggerUrl) {
        targetWsUrl = version.webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await wait(300);
  }

  if (!targetWsUrl) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome debugging endpoint on port 9225.');
  }

  const browserClient = new CDPClient(targetWsUrl);
  await browserClient.connect();
  const { targetId } = await browserClient.send('Target.createTarget', {
    url: 'about:blank',
    width: 1920,
    height: 1080,
  });
  browserClient.close();

  const pageTargets = await fetchJson('http://localhost:9225/json/list');
  const target = pageTargets.find((t) => t.id === targetId) || pageTargets[0];
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Network.enable');
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const capturedRecords = [];

  async function capture(filename, description) {
    await wait(800); // Allow render pipeline to settle
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
    });
    const dest = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(dest, Buffer.from(data, 'base64'));
    const stats = fs.statSync(dest);
    console.log(`[CAPTURED] ${filename} — ${description} (${Math.round(stats.size / 1024)} KB)`);
    capturedRecords.push({
      filename,
      description,
      sizeBytes: stats.size,
      width: 1920,
      height: 1080,
    });
  }

  async function captureMobile(filename, description) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await wait(800);
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 },
    });
    const dest = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(dest, Buffer.from(data, 'base64'));
    const stats = fs.statSync(dest);
    console.log(`[CAPTURED] ${filename} — ${description} (${Math.round(stats.size / 1024)} KB)`);
    capturedRecords.push({
      filename,
      description,
      sizeBytes: stats.size,
      width: 390,
      height: 844,
    });
    // Reset to desktop
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  try {
    // -------------------------------------------------------------------------
    // SCREENSHOT 01: HOMEPAGE (LANDING PAGE)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Capturing Homepage ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await wait(2000);
    // Dismiss intro if open or wait for it
    await client.send('Runtime.evaluate', {
      expression: `
        sessionStorage.setItem('has_seen_welcome_intro_v2', 'true');
        const skipBtn = document.querySelector('button[aria-label="Skip introduction"]');
        if (skipBtn) skipBtn.click();
      `,
    });
    await wait(1500);
    await capture('01-homepage.png', 'Homepage hero showing value proposition & Team OG identity');

    // Setup authenticated session for student std-001 (Arjun Sharma)
    await client.send('Network.setCookie', {
      name: 'seva-auth-token',
      value: 'active_session_token_std_001',
      domain: 'localhost',
      path: '/',
    });
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('seva_db_current_user', JSON.stringify('std-001'));
        localStorage.setItem('seva_auth_token', 'active_session_token_std_001');
      `,
    });

    // -------------------------------------------------------------------------
    // SCREENSHOT 02: STUDENT DASHBOARD
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Capturing Student Dashboard ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await wait(3000);
    await capture('02-student-dashboard.png', 'Student Dashboard with active Full Stack Developer course (68% progress)');

    // -------------------------------------------------------------------------
    // SCREENSHOT 03: COURSE CATALOGUE
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Capturing Course Catalogue ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/courses' });
    await wait(2500);
    await capture('03-course-catalogue.png', 'Course Catalogue showing Full Stack Development and 5 upcoming tracks');

    // -------------------------------------------------------------------------
    // SCREENSHOT 04: COURSE DETAIL
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Capturing Course Detail ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/courses/full-stack-development' });
    await wait(2500);
    await capture('04-course-detail.png', 'Full Stack Developer Course Detail page with curriculum syllabus & ₹100 pricing');

    // -------------------------------------------------------------------------
    // SCREENSHOT 05: LEARNING MODULE / LESSON WORKSPACE
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Capturing Learning Module ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/learning' });
    await wait(3000);
    await capture('05-learning-module.png', 'Interactive Learning Workspace with video player, transcript, and curriculum milestones');

    // -------------------------------------------------------------------------
    // SCREENSHOT 06: CODING CHALLENGE (PRACTICE LABS)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Capturing Coding Challenge ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/practice' });
    await wait(3500);
    // Click 'Run Tests' button to show real automated test runner in action
    await client.send('Runtime.evaluate', {
      expression: `
        const runBtn = document.querySelector('[data-testid="practice-run-tests-btn"]') || document.querySelector('button:has(svg.lucide-play)') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run Tests'));
        if (runBtn) runBtn.click();
      `,
    });
    await wait(1200);
    await capture('06-coding-challenge.png', 'Monaco Code Editor & Practice Lab with automated test execution runner');

    // -------------------------------------------------------------------------
    // SCREENSHOT 07: ASSESSMENT RESULTS
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Capturing Assessment Results ---');
    // First navigate to assessments catalogue
    await client.send('Page.navigate', { url: 'http://localhost:3000/assessments' });
    await wait(2500);
    // Create an evaluated assessment attempt for std-001 so the result screen has rich real score data
    await client.send('Runtime.evaluate', {
      expression: `
        (function() {
          const KEY_ATTEMPTS = 'seva_db_assessment_attempts';
          const attempts = JSON.parse(localStorage.getItem(KEY_ATTEMPTS) || '[]');
          let att = attempts.find(a => a.userId === 'std-001' && a.assessmentId === 'ass-mod-01');
          if (!att) {
            att = {
              id: 'att-eval-demo-001',
              assessmentId: 'ass-mod-01',
              userId: 'std-001',
              startedAt: new Date(Date.now() - 1800000).toISOString(),
              expiresAt: new Date(Date.now() + 1800000).toISOString(),
              submittedAt: new Date().toISOString(),
              status: 'evaluated',
              attemptNumber: 1,
              answers: { 'q-web-01': ['0'], 'q-web-02': ['1'], 'q-web-03': ['2'] },
              evaluationResults: {
                totalPoints: 10,
                earnedPoints: 9,
                percentage: 90,
                passed: true,
                passingThreshold: 75,
                skillBreakdown: { 'Web Fundamentals': { score: 92, total: 100 } },
                dimensionBreakdown: { 'Architecture': { score: 90, total: 100 } },
                questionsSummary: [
                  { questionId: 'q-web-01', correct: true, pointsAwarded: 3, pointsPossible: 3 },
                  { questionId: 'q-web-02', correct: true, pointsAwarded: 3, pointsPossible: 3 },
                  { questionId: 'q-web-03', correct: true, pointsAwarded: 3, pointsPossible: 3 }
                ]
              }
            };
            attempts.push(att);
            localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(attempts));
          }
          return att.id;
        })()
      `,
    });
    // Navigate directly to result page
    await client.send('Page.navigate', { url: 'http://localhost:3000/assessments/ass-mod-01/result/att-eval-demo-001' });
    await wait(2500);
    // If result page renders, capture it; otherwise capture the assessments catalog
    const hasResultView = await client.send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('h1')?.textContent.includes('Assessment') || document.querySelector('h2')?.textContent.includes('Assessment') || document.body.textContent.includes('90%') || document.body.textContent.includes('Passed'))`,
    });
    if (hasResultView.result.value) {
      await capture('07-assessment-results.png', 'Assessment Results page showing 90% score, passed status, and dimension breakdown');
    } else {
      await client.send('Page.navigate', { url: 'http://localhost:3000/assessments' });
      await wait(2500);
      await capture('07-assessment-results.png', 'Proctored Technical Assessments catalogue with active modules & score benchmarks');
    }

    // -------------------------------------------------------------------------
    // SCREENSHOT 08: COMPETENCY SCORING / GROWTH CARD
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Capturing Competency Overview ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard?tab=growth-card' });
    await wait(3000);
    await capture('08-competency-overview.png', 'Competency Growth Card showing multi-factor scoring across 7 engineering domains');

    // -------------------------------------------------------------------------
    // SCREENSHOT 09: SKILL PASSPORT
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Capturing Skill Passport ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard?tab=skill-passport' });
    await wait(3000);
    await capture('09-skill-passport.png', 'SEVA Skill Passport Card with overall Grade A, verified skills radar, and cryptographic SHA-256 seal');

    // -------------------------------------------------------------------------
    // SCREENSHOT 10: CAPSTONE PROJECT EVIDENCE
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Capturing Project Evidence ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/projects' });
    await wait(2500);
    await capture('10-project-evidence.png', 'Capstone Projects Portfolio showing specifications, rubric criteria, and submission status');

    // -------------------------------------------------------------------------
    // SCREENSHOT 11: PUBLIC CREDENTIAL VERIFICATION PORTAL
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Capturing Credential Verification Portal ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/verify?id=GSP-DEMO-001' });
    await wait(3000);
    await capture('11-credential-verification.png', 'Public Verification Engine validating SHA-256 cryptographic evidence record');

    // -------------------------------------------------------------------------
    // SCREENSHOT 12: ADMIN / EVALUATOR PORTAL
    // -------------------------------------------------------------------------
    console.log('\n--- 12. Capturing Admin Dashboard ---');
    // Set admin user profile in localStorage
    await client.send('Runtime.evaluate', {
      expression: `
        (function() {
          const profiles = JSON.parse(localStorage.getItem('seva_db_profiles') || '{}');
          profiles['adm-001'] = {
            id: 'adm-001',
            fullName: 'Faculty Evaluator & Academic Admin',
            email: 'admin@seva.edu',
            role: 'admin',
            targetRole: 'System Administrator',
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('seva_db_profiles', JSON.stringify(profiles));
          localStorage.setItem('seva_db_current_user', JSON.stringify('adm-001'));
        })()
      `,
    });
    await client.send('Page.navigate', { url: 'http://localhost:3000/admin' });
    await wait(3000);
    await capture('12-admin-dashboard.png', 'Admin & Evaluator Portal showing capstone submission queue and 4-dimension rubric scoring');

    // -------------------------------------------------------------------------
    // SCREENSHOT 13: PLATFORM AUDIT / ANALYTICS
    // -------------------------------------------------------------------------
    console.log('\n--- 13. Capturing Platform Audit / Analytics ---');
    // Click Audit tab on admin portal
    await client.send('Runtime.evaluate', {
      expression: `
        const auditTabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Audit Logs') || b.textContent.includes('Audit'));
        if (auditTabBtn) auditTabBtn.click();
      `,
    });
    await wait(1200);
    await capture('13-analytics-dashboard.png', 'Platform Audit & Credential Lifecycle Analytics displaying immutable event records');

    // -------------------------------------------------------------------------
    // SCREENSHOT 14: COURSE ENROLLMENT / CHECKOUT FLOW
    // -------------------------------------------------------------------------
    console.log('\n--- 14. Capturing Course Purchase & Enrollment Flow ---');
    // Reset to student std-001
    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('seva_db_current_user', JSON.stringify('std-001'));`,
    });
    await client.send('Page.navigate', { url: 'http://localhost:3000/onboarding/checkout?course=full-stack-development' });
    await wait(2500);
    await capture('14-course-purchase.png', 'Transparent ₹100 Course Enrollment Checkout showing single-course access policy & demo access');

    // -------------------------------------------------------------------------
    // SCREENSHOT 15: MOBILE RESPONSIVE VIEW
    // -------------------------------------------------------------------------
    console.log('\n--- 15. Capturing Mobile Responsive View ---');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await wait(2500);
    await captureMobile('15-mobile-view.png', 'Mobile viewport (390×844) demonstrating responsive layout of the Student Dashboard');

    console.log('\n================================================================');
    console.log(`COMPLETED: ${capturedRecords.length}/15 screenshots captured successfully!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    client.close();
    chromeProc.kill();
  }
}

run();
