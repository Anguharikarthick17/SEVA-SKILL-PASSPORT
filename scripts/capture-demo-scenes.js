/**
 * capture-demo-scenes.js
 * Captures fresh 1920x1080 live screenshots for the 8 real product demo scenes.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '../presentation-assets/product-demo/scenes');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const scenes = [
  { name: 'scene1_01_homepage', url: 'http://localhost:3000' },
  { name: 'scene1_02_courses', url: 'http://localhost:3000/courses' },
  { name: 'scene2_01_login', url: 'http://localhost:3000/login' },
  { name: 'scene3_01_unlock_pricing', url: 'http://localhost:3000/courses/full-stack-development' },
  { name: 'scene4_01_curriculum', url: 'http://localhost:3000/learning' },
  { name: 'scene5_01_practice_lab', url: 'http://localhost:3000/practice' },
  { name: 'scene6_01_assessments', url: 'http://localhost:3000/assessments' },
  { name: 'scene7_01_dashboard', url: 'http://localhost:3000/dashboard' },
  { name: 'scene7_02_credentials', url: 'http://localhost:3000/credentials' },
  { name: 'scene8_01_passport', url: 'http://localhost:3000/verify' },
];

console.log('Capturing live product demo scene frames at 1920x1080 from http://localhost:3000...');

for (const { name, url } of scenes) {
  const outFile = path.join(OUTPUT_DIR, `${name}.png`);
  console.log(`Capturing ${name} from ${url}...`);
  try {
    const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --virtual-time-budget=4000 --window-size=1920,1080 --screenshot="${outFile}" "${url}"`;
    execSync(cmd, { stdio: 'ignore', timeout: 20000 });
    const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
    console.log(`  ✓ Captured ${name}.png (${size} bytes)`);
  } catch (err) {
    console.error(`  ✗ Error capturing ${name}:`, err.message);
  }
}

console.log('Live scene captures complete!');
