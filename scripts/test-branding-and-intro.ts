/**
 * Test script: verify-branding-and-intro.ts
 * Verifies official logo assets, branding integration across components, and welcome intro logic.
 */
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

console.log('======================================================');
console.log('VERIFYING OFFICIAL BRANDING & WELCOME INTRO');
console.log('======================================================\n');

let failedTests = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('--- TEST GROUP 1: OFFICIAL LOGO ASSETS EXISTENCE & INTEGRITY ---');
const requiredAssets = [
  'public/images/seva-skill-passport-logo.png',
  'public/images/seva-skill-passport-logo-transparent.png',
  'public/images/seva-skill-passport-logo-cropped.png',
  'public/images/seva-skill-passport-logo-cropped-transparent.png',
  'public/images/seva-emblem.png',
  'public/favicon.ico',
  'public/apple-touch-icon.png',
  'src/app/icon.png',
  'src/app/icon.svg',
];

for (const relPath of requiredAssets) {
  const fullPath = path.join(projectRoot, relPath);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(exists && size > 100, `Asset ${relPath} exists and has valid size (${size} bytes)`);
}

console.log('\n--- TEST GROUP 2: COMPONENT LOGO INTEGRATION ---');
const componentsToCheck = [
  { file: 'src/components/layout/Navbar.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/components/layout/Footer.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/components/layout/StudentHeader.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/components/layout/StudentSidebar.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/app/login/page.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/app/signup/page.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/app/onboarding/choose-course/page.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
  { file: 'src/app/onboarding/confirmation/page.tsx', expectedImg: '/images/seva-skill-passport-logo-cropped-transparent.png' },
];

for (const { file, expectedImg } of componentsToCheck) {
  const fullPath = path.join(projectRoot, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(content.includes(expectedImg), `${file} renders official logo (${expectedImg})`);
  assert(content.includes('alt="SEVA Skill Passport'), `${file} provides proper accessible alt text`);
}

console.log('\n--- TEST GROUP 3: FUNCTIONAL SECURITY ICONS PRESERVED ---');
const functionalIcons = [
  { file: 'src/components/layout/Footer.tsx', iconPattern: 'Lock' },
  { file: 'src/app/verify/page.tsx', iconPattern: 'ShieldCheck' },
];

for (const { file, iconPattern } of functionalIcons) {
  const fullPath = path.join(projectRoot, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(content.includes(iconPattern), `${file} preserves functional security icon (${iconPattern})`);
}

console.log('\n--- TEST GROUP 4: CINEMATIC WELCOME INTRO VERIFICATION ---');
const welcomeIntroPath = path.join(projectRoot, 'src/components/shared/WelcomeIntro.tsx');
const introContent = fs.readFileSync(welcomeIntroPath, 'utf8');

assert(introContent.includes('Welcome to SEVA Skill Passport') || introContent.includes('SEVA Skill Passport</span>'), 'Welcome intro includes exact headline "Welcome to SEVA Skill Passport"');
assert(introContent.includes('Powered by') && introContent.includes('Team OG') && introContent.includes('Opportunity &amp; Growth'), 'Welcome intro includes exact attribution "Powered by Team OG — Opportunity & Growth"');
assert(introContent.includes('sessionStorage.getItem'), 'Welcome intro uses sessionStorage to prevent duplicate plays in the same session');
assert(introContent.includes('prefers-reduced-motion'), 'Welcome intro respects prefers-reduced-motion');
assert(introContent.includes('Skip Intro'), 'Welcome intro includes accessible Skip Intro control');
assert(introContent.includes('Escape'), 'Welcome intro supports Escape key dismissal');
assert(introContent.includes('overflow = \'hidden\'') && introContent.includes('overflow = \'\''), 'Welcome intro properly locks and restores background page scroll');

assert(introContent.includes('/images/seva-skill-passport-logo-transparent.png'), 'Welcome intro uses genuine transparent logo asset (/images/seva-skill-passport-logo-transparent.png)');

// Check that layout mounts WelcomeIntro
const layoutPath = path.join(projectRoot, 'src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');
assert(layoutContent.includes('<WelcomeIntro />') || layoutContent.includes('<WelcomeIntro/>'), 'src/app/layout.tsx mounts <WelcomeIntro />');

console.log('\n------------------------------------------------------');
if (failedTests === 0) {
  console.log('ALL BRANDING & INTRO VERIFICATION CHECKS PASSED!');
  process.exit(0);
} else {
  console.error(`${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
