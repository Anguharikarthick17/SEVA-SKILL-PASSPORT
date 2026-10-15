/**
 * recapture-clean-screens.js
 * Authenticates as std-001 (Arjun Sharma) and captures exact 1920x1080 clean screenshots.
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
  console.log('Starting headless Chrome for clean re-capture...');
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
    const version = await fetchJson('http://localhost:9222/json/version');
    const browserClient = new CDPClient(version.webSocketDebuggerUrl);
    await browserClient.connect();
    const { targetId } = await browserClient.send('Target.createTarget', {
      url: 'about:blank',
      width: 1920,
      height: 1080,
    });
    browserClient.close();

    const pageTargets = await fetchJson('http://localhost:9222/json/list');
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

    async function captureFrame(filename, clip = { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }) {
      const { data } = await client.send('Page.captureScreenshot', {
        format: 'png',
        clip,
      });
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
      console.log(`  ✓ Saved ${filename} (${fs.statSync(filepath).size} bytes)`);
    }

    // 1. Capture 00: Welcome Intro (Clear session storage, reload root, capture at 1.0s)
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await wait(1500);
    await client.send('Runtime.evaluate', { expression: 'sessionStorage.clear(); location.reload();' });
    await wait(1000);
    await captureFrame('00_welcome_intro.png');

    // 2. Wait for intro to dismiss into Homepage Hero
    await wait(3200);
    await captureFrame('01_homepage_hero.png');

    // 3. Scroll to methodology / proof continuum on homepage
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 920, behavior: "instant" });' });
    await wait(800);
    await captureFrame('02_homepage_proof_continuum.png');

    // 4. Capture Full Course Catalog
    await client.send('Page.navigate', { url: 'http://localhost:3000/courses' });
    await wait(2500);
    await captureFrame('04_course_catalog.png');

    // 5. Capture Course Details (Full Stack Development)
    await client.send('Page.navigate', { url: 'http://localhost:3000/courses/full-stack-development' });
    await wait(2500);
    await captureFrame('05_course_detail.png');

    // Setup authenticated session for protected routes (std-001)
    await client.send('Network.setCookie', {
      name: 'seva-auth-token',
      value: 'std-001',
      domain: 'localhost',
      path: '/',
    });
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await wait(1000);
    await client.send('Runtime.evaluate', {
      expression: 'localStorage.setItem("seva_db_current_user", JSON.stringify("std-001"));',
    });

    // 6. Capture Learner Onboarding (Course Choice) with auth
    await client.send('Page.navigate', { url: 'http://localhost:3000/onboarding/choose-course' });
    await wait(2500);
    await captureFrame('06_onboarding_choose.png');

    // 7. Capture Student Dashboard with Arjun Sharma (68% progress)
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await wait(2800);
    await captureFrame('07_student_dashboard.png');
    // Also save as 09_student_dashboard.png
    fs.copyFileSync(path.join(OUTPUT_DIR, '07_student_dashboard.png'), path.join(OUTPUT_DIR, '09_student_dashboard.png'));

    // 8. Capture Student Learning Sandbox
    await client.send('Page.navigate', { url: 'http://localhost:3000/learning' });
    await wait(2800);
    await captureFrame('10_student_learning.png');

    // 9. Capture Public Verification Portal with SHA-256 evidence record
    await client.send('Page.navigate', { url: 'http://localhost:3000/verify?id=GSP-DEMO-001' });
    await wait(2800);
    await captureFrame('12_verification_portal.png');

    client.close();
    console.log('Clean re-capture completed successfully!');
  } finally {
    chromeProc.kill();
  }
}

main().catch(console.error);
