const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/angu/.gemini/antigravity-ide/brain/6dbcd9eb-33ec-4a04-8faa-93e9f901f6eb';

async function captureScreenshots() {
  console.log('Launching Chrome to capture responsive dashboard screenshots...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9225',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9225/json', res => {
          let str = '';
          res.on('data', chunk => str += chunk);
          res.on('end', () => resolve(str));
        }).on('error', reject);
      });
      const list = JSON.parse(data);
      const page = list.find(p => p.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chrome debugging port 9225');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

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

  // Enable Network and Page
  await send('Network.enable');
  await send('Page.enable');

  // Set auth cookie for localhost
  await send('Network.setCookie', {
    name: 'seva-auth-token',
    value: 'active',
    domain: 'localhost',
    path: '/'
  });

  // Also set mock current user in localStorage so client-side profile resolves immediately
  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await new Promise(r => setTimeout(r, 1000));
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

  // Viewports to test
  const viewports = [
    { name: 'dashboard_desktop_1440', width: 1440, height: 900, url: 'http://localhost:3000/dashboard' },
    { name: 'dashboard_tablet_768', width: 768, height: 1024, url: 'http://localhost:3000/dashboard' },
    { name: 'dashboard_mobile_390', width: 390, height: 844, url: 'http://localhost:3000/dashboard' },
    { name: 'homepage_public_1440', width: 1440, height: 900, url: 'http://localhost:3000/' }
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.width}x${vp.height} for ${vp.name}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768
    });

    await send('Page.navigate', { url: vp.url });
    await new Promise(r => setTimeout(r, 2000));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      const filePath = path.join(ARTIFACT_DIR, `${vp.name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot to: ${filePath}`);
    }
  }

  ws.close();
  chrome.kill();
  console.log('Finished capturing all verification screenshots successfully!');
}

captureScreenshots().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
