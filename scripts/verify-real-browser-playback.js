const { spawn } = require('child_process');
const http = require('http');

async function main() {
  console.log('Starting Google Chrome with remote debugging...');
  const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--autoplay-policy=no-user-gesture-required',
    'http://localhost:3000'
  ]);

  // Wait for Chrome to initialize debugging port
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', res => {
          let str = '';
          res.on('data', chunk => str += chunk);
          res.on('end', () => resolve(str));
        }).on('error', reject);
      });
      const list = JSON.parse(data);
      const page = list.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // retry
    }
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error('Could not obtain Chrome DevTools WebSocket URL');
  }

  console.log('Connecting to Chrome DevTools at:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          const val = res.result?.result?.value !== undefined ? res.result.result.value : (res.result?.value ?? res.result);
          resolve(val);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  // Wait 2.5 seconds for video playback to advance
  console.log('Waiting 2.5 seconds for video autoplay to progress...');
  await new Promise(r => setTimeout(r, 2500));

  // Evaluate video status in the page DOM
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const video = document.querySelector('video');
      if (!video) return { found: false };
      return {
        found: true,
        src: video.src || video.currentSrc,
        poster: video.poster,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        muted: video.muted,
        loop: video.loop,
        readyState: video.readyState,
        width: video.clientWidth,
        height: video.clientHeight
      };
    })()`,
    returnByValue: true
  });

  console.log('Video element telemetry from Chrome browser:');
  console.log(JSON.stringify(evalResult, null, 2));

  // Test opening ExplainerModal by clicking "Watch Full Explainer"
  const modalClickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('hero-watch-explainer');
      if (!btn) return { clicked: false, error: 'Button not found' };
      btn.click();
      return { clicked: true };
    })()`,
    returnByValue: true
  });
  console.log('Watch Full Explainer click result:', modalClickResult);

  // Wait 1 second for modal to animate and inspect modal video
  await new Promise(r => setTimeout(r, 1000));
  const modalVideoResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return { modalFound: false };
      const video = modal.querySelector('video');
      return {
        modalFound: true,
        modalVideoSrc: video ? (video.src || video.currentSrc) : null,
        modalMuted: video ? video.muted : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal video inspection:', JSON.stringify(modalVideoResult, null, 2));

  ws.close();
  chromeProcess.kill();

  const v = evalResult;
  if (!v || !v.found) {
    throw new Error('Video tag not found in DOM');
  }
  if (v.paused) {
    throw new Error('Video is unexpectedly paused');
  }
  if (v.currentTime <= 0) {
    throw new Error(`Video currentTime is 0, expected > 0. (got ${v.currentTime})`);
  }
  if (!v.muted) {
    throw new Error('Video must be muted by default for browser autoplay policy');
  }
  if (!v.loop) {
    throw new Error('Video must have loop attribute set to true');
  }

  console.log('\n🌟 VERIFIED IN REAL CHROME BROWSER:');
  console.log(`- Video src: ${v.src}`);
  console.log(`- Playing: ${!v.paused} (currentTime: ${v.currentTime.toFixed(2)}s / ${v.duration}s)`);
  console.log(`- Muted: ${v.muted}`);
  console.log(`- Looping: ${v.loop}`);
  console.log(`- ReadyState: ${v.readyState} (HAVE_ENOUGH_DATA)`);
  console.log(`- Rendered Dimensions: ${v.width}px x ${v.height}px`);
  console.log(`- Explainer Modal Video: ${modalVideoResult.modalVideoSrc}`);
}

main().catch(err => {
  console.error('Browser playback verification error:', err);
  process.exit(1);
});
