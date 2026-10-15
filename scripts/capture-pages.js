/**
 * capture-pages.js
 * Automates Google Chrome headless to capture 1920x1080 full screenshots of all working routes.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '../video-production/raw-captures');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const routes = [
  { name: '01_homepage_hero', url: 'http://localhost:3000' },
  { name: '02_course_catalog', url: 'http://localhost:3000/courses' },
  { name: '03_course_detail', url: 'http://localhost:3000/courses/full-stack-development' },
  { name: '04_login_page', url: 'http://localhost:3000/login' },
  { name: '05_signup_page', url: 'http://localhost:3000/signup' },
  { name: '06_onboarding_choose', url: 'http://localhost:3000/onboarding/choose-course' },
  { name: '07_student_dashboard', url: 'http://localhost:3000/dashboard' },
  { name: '08_student_learning', url: 'http://localhost:3000/learning' },
  { name: '09_credentials_portfolio', url: 'http://localhost:3000/credentials' },
  { name: '10_verification_portal', url: 'http://localhost:3000/verify' },
];

console.log('Capturing live website screens at 1920x1080...');

for (const { name, url } of routes) {
  const outFile = path.join(OUTPUT_DIR, `${name}.png`);
  console.log(`Capturing ${name} from ${url}...`);
  try {
    const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1920,1080 --screenshot="${outFile}" "${url}"`;
    execSync(cmd, { stdio: 'ignore', timeout: 15000 });
    const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
    console.log(`  ✓ Captured ${name}.png (${size} bytes)`);
  } catch (err) {
    console.error(`  ✗ Error capturing ${name}:`, err.message);
  }
}

console.log('Finished capturing website pages.');
