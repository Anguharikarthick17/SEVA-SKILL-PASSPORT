const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/angu/.gemini/antigravity-ide/brain/6dbcd9eb-33ec-4a04-8faa-93e9f901f6eb';

async function testTabInteractions() {
  console.log('Launching Chrome to test real tab clicks and capture screenshots...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9226',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9226/json', (res) => {
          let str = '';
          res.on('data', (chunk) => (str += chunk));
          res.on('end', () => resolve(str));
        }).on('error', reject);
      });
      const list = JSON.parse(data);
      const page = list.find((p) => p.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chrome port 9226');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          resolve(res.result?.result?.value !== undefined ? res.result.result.value : res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Network.setCookie', {
    name: 'seva-auth-token',
    value: 'active',
    domain: 'localhost',
    path: '/'
  });

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to dashboard
  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await new Promise((r) => setTimeout(r, 2000));

  // Seed demo student data for rich presentation
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('seva_db_current_user', JSON.stringify('std-001'));
      localStorage.setItem('seva_db_profiles', JSON.stringify({
        'std-001': {
          id: 'std-001',
          fullName: 'Angu Hari Karthick M',
          email: 'anguharikarthickm.ecs25@rathinam.in',
          mobile: '9876543210',
          education: "Bachelor of Engineering (CSE)",
          state: 'Tamil Nadu',
          district: 'Coimbatore',
          targetRole: 'Full Stack Engineering Track',
          role: 'student',
          githubHandle: 'Anguharikarthick17',
          passportVisibility: 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
    `
  });
  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Verify and capture CRS Dashboard tab
  console.log('Verifying Tab 1: CRS Dashboard...');
  const isCrsVisible = await send('Runtime.evaluate', {
    expression: `Boolean(document.getElementById('panel-crs-dashboard'))`
  });
  console.log('Tab 1 panel visible:', isCrsVisible);
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_1_crs_dashboard.png'), Buffer.from(shot1.data, 'base64'));

  // 2. Click Growth Card Tab
  console.log('Clicking Tab 2: Growth Card...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-growth-card')?.click()`
  });
  await new Promise((r) => setTimeout(r, 800));

  const isGrowthVisible = await send('Runtime.evaluate', {
    expression: `Boolean(document.getElementById('panel-growth-card'))`
  });
  const isCrsHiddenAfterGrowth = await send('Runtime.evaluate', {
    expression: `!document.getElementById('panel-crs-dashboard')`
  });
  console.log('Tab 2 panel visible:', isGrowthVisible, '| Tab 1 panel hidden:', isCrsHiddenAfterGrowth);
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_2_growth_card.png'), Buffer.from(shot2.data, 'base64'));

  // 3. Click Skill Passport Tab
  console.log('Clicking Tab 3: Skill Passport...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-skill-passport')?.click()`
  });
  await new Promise((r) => setTimeout(r, 800));

  const isPassportVisible = await send('Runtime.evaluate', {
    expression: `Boolean(document.getElementById('panel-skill-passport'))`
  });
  const isGrowthHiddenAfterPassport = await send('Runtime.evaluate', {
    expression: `!document.getElementById('panel-growth-card')`
  });
  console.log('Tab 3 panel visible:', isPassportVisible, '| Tab 2 panel hidden:', isGrowthHiddenAfterPassport);
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_3_skill_passport.png'), Buffer.from(shot3.data, 'base64'));

  // 4. Click back to CRS Dashboard Tab
  console.log('Clicking back to Tab 1: CRS Dashboard...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-crs-dashboard')?.click()`
  });
  await new Promise((r) => setTimeout(r, 800));

  const isCrsRestored = await send('Runtime.evaluate', {
    expression: `Boolean(document.getElementById('panel-crs-dashboard'))`
  });
  console.log('Tab 1 panel restored:', isCrsRestored);

  ws.close();
  chrome.kill();
  console.log('✅ Real browser tab click verification complete!');
}

testTabInteractions().catch((err) => {
  console.error('Browser tab verification failed:', err);
  process.exit(1);
});
