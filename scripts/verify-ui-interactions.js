const { spawn } = require('child_process');
const http = require('http');

async function testUIInteractions() {
  console.log('Launching Chrome to test View Answer modal and Test Runner...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9224',
    'http://localhost:3000/practice'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9224/json', res => {
          let str = '';
          res.on('data', chunk => str += chunk);
          res.on('end', () => resolve(str));
        }).on('error', reject);
      });
      const list = JSON.parse(data);
      const page = list.find(p => p.type === 'page' && p.url.includes('practice'));
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('No WebSocket URL for practice page');
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

  // Wait 2.5s for initial page load
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify View Answer Modal opens on click
  console.log('Testing View Answer button click...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('practice-view-answer-btn');
      if (btn) btn.click();
    })()`,
  });

  await new Promise(r => setTimeout(r, 800));

  const modalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return { open: false };
      const codeBlock = modal.querySelector('pre');
      return {
        open: true,
        title: modal.querySelector('h3')?.innerText,
        solutionPreview: codeBlock?.innerText?.slice(0, 100),
      };
    })()`,
  });
  console.log('View Answer Modal Telemetry:', modalState);

  // Take screenshot of modal
  const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const fs = require('fs');
  fs.writeFileSync('/Users/angu/.gemini/antigravity-ide/brain/6dbcd9eb-33ec-4a04-8faa-93e9f901f6eb/practice_view_answer_modal.png', Buffer.from(modalScreenshot.data, 'base64'));
  console.log('Saved practice_view_answer_modal.png');

  // Close modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('[aria-label="Close solution modal"]');
      if (closeBtn) closeBtn.click();
    })()`,
  });

  await new Promise(r => setTimeout(r, 600));

  // 2. Click "Run Tests" with starter code to verify failure output
  console.log('Testing Run Tests button with starter code...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const runBtn = document.getElementById('practice-run-tests-btn');
      if (runBtn) runBtn.click();
    })()`,
  });

  await new Promise(r => setTimeout(r, 1200));

  const testOutputState = await send('Runtime.evaluate', {
    expression: `(() => {
      const suiteTab = document.querySelector('aside [class*="font-mono"]');
      return {
        text: suiteTab?.innerText?.slice(0, 200),
      };
    })()`,
  });
  console.log('Test Execution Output:', testOutputState);

  // Take screenshot of test results tab
  const testResultsScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/angu/.gemini/antigravity-ide/brain/6dbcd9eb-33ec-4a04-8faa-93e9f901f6eb/practice_test_results.png', Buffer.from(testResultsScreenshot.data, 'base64'));
  console.log('Saved practice_test_results.png');

  ws.close();
  chrome.kill();
  console.log('✅ UI interactions tested successfully!');
}

testUIInteractions().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
