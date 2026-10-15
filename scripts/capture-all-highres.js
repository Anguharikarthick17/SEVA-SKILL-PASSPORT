/**
 * capture-all-highres.js
 * Uses Chrome DevTools Protocol (CDP) via native Node.js WebSocket to automate
 * live browser navigation, scrolling, and capturing 1920x1080 frames.
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../video-production/raw-captures');
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
    this.ws.close();
  }
}

async function main() {
  console.log('Starting headless Chrome with CDP on port 9222...');
  const chromeProc = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1920,1080',
      '--hide-scrollbars',
    ]
  );

  await wait(2000);

  try {
    // 1. Get browser target
    const version = await fetchJson('http://localhost:9222/json/version');
    const browserWs = version.webSocketDebuggerUrl;
    console.log('Connected to Chrome:', version.Browser);

    // 2. Create new target page
    const browserClient = new CDPClient(browserWs);
    await browserClient.connect();
    const { targetId } = await browserClient.send('Target.createTarget', {
      url: 'about:blank',
      width: 1920,
      height: 1080,
    });
    browserClient.close();

    // 3. Connect to target page
    const pageTargets = await fetchJson('http://localhost:9222/json/list');
    const target = pageTargets.find((t) => t.id === targetId) || pageTargets[0];
    const pageClient = new CDPClient(target.webSocketDebuggerUrl);
    await pageClient.connect();

    await pageClient.send('Page.enable');
    await pageClient.send('Runtime.enable');
    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    async function navigateAndCapture(url, filename, options = {}) {
      console.log(`Navigating to ${url}...`);
      await pageClient.send('Page.navigate', { url });
      await wait(options.waitBefore || 2500);

      if (options.eval) {
        await pageClient.send('Runtime.evaluate', { expression: options.eval });
        await wait(options.waitAfterEval || 500);
      }

      const { data } = await pageClient.send('Page.captureScreenshot', {
        format: 'png',
      });
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
      console.log(`  ✓ Saved ${filename} (${fs.statSync(filepath).size} bytes)`);
    }

    // Capture 00: Welcome Intro (reset session storage and visit root)
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000' });
    await pageClient.send('Runtime.evaluate', { expression: 'sessionStorage.clear(); location.reload();' });
    await wait(800);
    const { data: d0 } = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUTPUT_DIR, '00_welcome_intro.png'), Buffer.from(d0, 'base64'));
    console.log('  ✓ Saved 00_welcome_intro.png');

    // Wait for intro transition to finish and capture Homepage Hero
    await wait(3500);
    const { data: d1 } = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUTPUT_DIR, '01_homepage_hero.png'), Buffer.from(d1, 'base64'));
    console.log('  ✓ Saved 01_homepage_hero.png');

    // Capture 02: Homepage Proof Continuum / Methodology
    await navigateAndCapture('http://localhost:3000', '02_homepage_proof_continuum.png', {
      waitBefore: 1000,
      eval: 'window.scrollTo({ top: 920, behavior: "instant" });',
      waitAfterEval: 600,
    });

    // Capture 03: Homepage Course Cards
    await navigateAndCapture('http://localhost:3000', '03_homepage_courses.png', {
      waitBefore: 1000,
      eval: 'window.scrollTo({ top: 1850, behavior: "instant" });',
      waitAfterEval: 600,
    });

    // Capture 04: Full Course Catalog
    await navigateAndCapture('http://localhost:3000/courses', '04_course_catalog.png');

    // Capture 05: Course Details (Full Stack Development)
    await navigateAndCapture('http://localhost:3000/courses/full-stack-development', '05_course_detail.png');

    // Capture 06: Learner Onboarding (Choose Course)
    await navigateAndCapture('http://localhost:3000/onboarding/choose-course', '06_onboarding_choose.png');

    // Capture 07: Login Screen
    await navigateAndCapture('http://localhost:3000/login', '07_login_page.png');

    // Capture 08: Signup Screen
    await navigateAndCapture('http://localhost:3000/signup', '08_signup_page.png');

    // Capture 09: Student Dashboard
    await navigateAndCapture('http://localhost:3000/dashboard', '09_student_dashboard.png');

    // Capture 10: Student Learning & Curriculum Modules
    await navigateAndCapture('http://localhost:3000/learning', '10_student_learning.png');

    // Capture 11: Credentials Portfolio
    await navigateAndCapture('http://localhost:3000/credentials', '11_credentials_portfolio.png');

    // Capture 12: Public Verification Portal with Evidence Hash
    await navigateAndCapture('http://localhost:3000/verify?id=GSP-DEMO-001', '12_verification_portal.png');

    pageClient.close();
    console.log('High-res website capture pipeline completed successfully!');
  } finally {
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('Capture pipeline error:', err);
  process.exit(1);
});
