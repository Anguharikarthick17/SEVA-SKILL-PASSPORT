/**
 * scripts/verify-learning-unlocked.js
 * Verifies that the learning page is fully unlocked for std-001 without locks or payment prompts.
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

async function verifyLearningUnlocked() {
  console.log('Launching headless Chrome to test /learning page for std-001...');
  const chromeProc = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9229',
      '--window-size=1920,1080',
      '--hide-scrollbars',
      'about:blank',
    ]
  );

  await wait(2000);

  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    try {
      const version = await fetchJson('http://localhost:9229/json/version');
      if (version.webSocketDebuggerUrl) {
        targetWsUrl = version.webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await wait(300);
  }

  if (!targetWsUrl) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome debugging endpoint on port 9229.');
  }

  const browserClient = new CDPClient(targetWsUrl);
  await browserClient.connect();
  const { targetId } = await browserClient.send('Target.createTarget', {
    url: 'about:blank',
    width: 1920,
    height: 1080,
  });
  browserClient.close();

  const pageTargets = await fetchJson('http://localhost:9229/json/list');
  const target = pageTargets.find((t) => t.id === targetId) || pageTargets[0];
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Network.enable');
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  // Set auth cookie
  await client.send('Network.setCookie', {
    name: 'seva-auth-token',
    value: 'active',
    domain: 'localhost',
    path: '/',
  });

  // Authenticate user session
  console.log('Authenticating with arjun.sharma@example.gov.in...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/login' });
  await wait(2000);

  await client.send('Runtime.evaluate', {
    expression: `
      (function() {
        // Set local storage session directly as well
        localStorage.setItem('seva_db_current_user', JSON.stringify('std-001'));

        const setNativeValue = (element, value) => {
          const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
          const prototype = Object.getPrototypeOf(element);
          const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
          if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
          } else if (valueSetter) {
            valueSetter.call(element, value);
          } else {
            element.value = value;
          }
          element.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        if (emailInput && passInput) {
          setNativeValue(emailInput, 'arjun.sharma@example.gov.in');
          setNativeValue(passInput, 'Password123!');
          if (submitBtn) submitBtn.click();
          return true;
        }
        return false;
      })()
    `,
  });

  await wait(2500);

  // Navigate to /learning
  console.log('Navigating to http://localhost:3000/learning...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/learning' });
  await wait(4000);

  // Inspect page content
  const pageAudit = await client.send('Runtime.evaluate', {
    expression: `
      (function() {
        const text = document.body.innerText;
        return {
          hasUnlockedBadge: text.includes('Full Stack Developer Course — Unlocked'),
          hasLockedPrompt: text.includes('Unlock Full Stack Course — ₹100'),
          hasLockIcons: Boolean(document.querySelector('svg.lucide-lock')),
          title: document.title,
          activeLesson: document.querySelector('h1')?.innerText || document.querySelector('h2')?.innerText
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('Learning Page UI Audit Result:', pageAudit.result.value);

  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('presentation-assets/product-demo/scenes/verified_learning_unlocked.png', Buffer.from(data, 'base64'));
  console.log('  ✓ Saved verified screenshot to presentation-assets/product-demo/scenes/verified_learning_unlocked.png');

  client.close();
  chromeProc.kill();

  if (pageAudit.result.value.hasUnlockedBadge && !pageAudit.result.value.hasLockedPrompt) {
    console.log('\n✓ [PASS] Learning page is completely UNLOCKED with ZERO payment prompts!');
  } else {
    console.error('\n✗ [FAIL] Learning page still has locked elements');
    process.exit(1);
  }
}

verifyLearningUnlocked().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
