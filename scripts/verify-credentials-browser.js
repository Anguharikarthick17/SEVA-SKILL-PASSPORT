const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/angu/.gemini/antigravity-ide/brain/6dbcd9eb-33ec-4a04-8faa-93e9f901f6eb';

async function verifyScreenshots() {
  console.log('Launching Chrome CDP to capture visual screenshots for Credentials, Verification & Admin...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9227',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9227/json', (res) => {
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
    throw new Error('Could not connect to Chrome port 9227');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      const onMsg = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', onMsg);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const capture = async (name) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const localPath = path.join(__dirname, '..', name);
    const artifactPath = path.join(ARTIFACT_DIR, name);
    fs.writeFileSync(localPath, buffer);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`Saved screenshot: ${name}`);
  };

  try {
    // 1. Credentials Page
    console.log('Navigating to /credentials ...');
    await send('Page.navigate', { url: 'http://localhost:3000/credentials' });
    await new Promise((r) => setTimeout(r, 2500));
    await capture('credentials_portal.png');

    // 2. Public Verification Page
    console.log('Navigating to /verify?id=GSP-DEMO-001 ...');
    await send('Page.navigate', { url: 'http://localhost:3000/verify?id=GSP-DEMO-001' });
    await new Promise((r) => setTimeout(r, 2500));
    await capture('verify_active_credential.png');

    // 3. Admin Access Control Page
    console.log('Navigating to /admin ...');
    await send('Page.navigate', { url: 'http://localhost:3000/admin' });
    await new Promise((r) => setTimeout(r, 2500));
    await capture('admin_access_control.png');

    console.log('Visual CDP verification completed successfully!');
  } finally {
    ws.close();
    chrome.kill();
  }
}

verifyScreenshots().catch((err) => {
  console.error('CDP screenshot capture error:', err);
  process.exit(1);
});
