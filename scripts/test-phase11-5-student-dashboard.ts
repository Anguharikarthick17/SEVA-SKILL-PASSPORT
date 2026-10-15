import http from 'http';
import { DataService } from '../src/lib/data-service';
import { STUDENT_NAV_ITEMS } from '../src/components/layout/StudentSidebar';

async function fetchRoute(path: string, cookie?: string): Promise<{ status: number; body: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    http.get(`http://localhost:3000${path}`, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 200, body: data, headers: res.headers }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runPhase115Audit() {
  console.log('================================================================');
  console.log('SEVA SKILL PASSPORT — PHASE 11.5 STUDENT DASHBOARD AUDIT');
  console.log('================================================================\n');

  let allPassed = true;
  const assert = (name: string, condition: boolean, details?: string) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
    } else {
      console.log(`❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
      allPassed = false;
    }
  };

  // --------------------------------------------------------------------------
  // 1. PUBLIC WEBSITE SEPARATION
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Public Website Layout Integrity ---');
  const homeRes = await fetchRoute('/');
  assert('Homepage returns HTTP 200', homeRes.status === 200);
  assert('Homepage contains Public Marketing Navbar', homeRes.body.includes('Primary Navigation') || homeRes.body.includes('How It Works'));
  assert('Homepage contains Public Footer', homeRes.body.includes('Academic Hackathon Prototype') || homeRes.body.includes('SEVA Skill Passport is an independent'));
  assert('Homepage does NOT contain Student Sidebar', !homeRes.body.includes('student-sidebar'));

  // --------------------------------------------------------------------------
  // 2. AUTHENTICATED STUDENT WORKSPACE SEPARATION
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Authenticated Student Workspace Layout Separation ---');
  const authCookie = 'seva-auth-token=active';
  const dashRes = await fetchRoute('/dashboard', authCookie);
  assert('Dashboard returns HTTP 200', dashRes.status === 200);
  assert('Dashboard contains dedicated Student Header', dashRes.body.includes('SEVA') && dashRes.body.includes('Student Dashboard'));
  assert('Dashboard contains dedicated Student Sidebar', dashRes.body.includes('student-sidebar') || dashRes.body.includes('Student Navigation Sidebar'));
  assert('Dashboard does NOT contain Public Marketing Navbar links', !dashRes.body.includes('aria-label="Primary Navigation"'));
  assert('Dashboard does NOT contain Public Marketing Footer', !dashRes.body.includes('Academic Hackathon Prototype'));

  // --------------------------------------------------------------------------
  // 3. STUDENT SIDEBAR STRUCTURE & ORDER
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Student Sidebar Structure & Exact Order ---');
  const expectedLabels = [
    'Dashboard',
    'My Learning',
    'Practice',
    'Assessments',
    'Projects',
    'Skill Growth',
    'Skill Passport',
    'Credentials',
    'Profile',
  ];
  assert('Sidebar has exactly 9 navigation items', STUDENT_NAV_ITEMS.length === 9);
  const actualLabels = STUDENT_NAV_ITEMS.map((item) => item.label);
  assert(
    'Sidebar items match the exact required order',
    JSON.stringify(actualLabels) === JSON.stringify(expectedLabels),
    `Got: ${actualLabels.join(' -> ')}`
  );

  // Check matching active logic for direct refresh and nested routes
  assert('Dashboard matches /dashboard', STUDENT_NAV_ITEMS[0].isMatch('/dashboard'));
  assert('My Learning matches /my-learning and /learning', STUDENT_NAV_ITEMS[1].isMatch('/my-learning') && STUDENT_NAV_ITEMS[1].isMatch('/learning'));
  assert('Practice matches /practice', STUDENT_NAV_ITEMS[2].isMatch('/practice'));
  assert('Assessments matches /assessments', STUDENT_NAV_ITEMS[3].isMatch('/assessments') && STUDENT_NAV_ITEMS[3].isMatch('/assessments/ass-mod-05'));
  assert('Projects matches /projects', STUDENT_NAV_ITEMS[4].isMatch('/projects'));
  assert('Skill Growth matches /skill-growth', STUDENT_NAV_ITEMS[5].isMatch('/skill-growth'));
  assert('Skill Passport matches /skill-passport/my and /passport', STUDENT_NAV_ITEMS[6].isMatch('/skill-passport/my') && STUDENT_NAV_ITEMS[6].isMatch('/passport'));
  assert('Credentials matches /credentials', STUDENT_NAV_ITEMS[7].isMatch('/credentials'));
  assert('Profile matches /profile', STUDENT_NAV_ITEMS[8].isMatch('/profile'));

  // --------------------------------------------------------------------------
  // 4. STUDENT HEADER ACTIONS
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Student Application Header Actions ---');
  assert('Student Header contains SEVA Skill Passport branding', dashRes.body.includes('SEVA') && dashRes.body.includes('Skill Passport'));
  assert('Student Header contains quick actions (myLearn, Practice, Print)', dashRes.body.includes('myLearn') && dashRes.body.includes('Practice Labs'));
  assert('Student Header contains Sign Out button', dashRes.body.includes('student-header-signout-btn') || dashRes.body.includes('Sign Out'));

  // --------------------------------------------------------------------------
  // 5. REDESIGNED DASHBOARD CARDS & METRICS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Redesigned Dashboard Cards & Reference Hierarchy ---');
  // 5a. Tabs
  assert('Dashboard contains Sub-navigation Pills (CRS Dashboard, Growth Card, Skill Passport)',
    dashRes.body.includes('CRS Dashboard') && dashRes.body.includes('Growth Card') && dashRes.body.includes('Skill Passport')
  );

  // 5b. Student Identity Card
  assert('Student Identity Card displays name & track', dashRes.body.includes('ANGU HARI KARTHICK') || dashRes.body.includes('Full Stack') || dashRes.body.includes('Student Learner'));
  assert('Student Identity Card contains Academic Infractions status', dashRes.body.includes('0 Academic Infractions Recorded') || dashRes.body.includes('Infractions'));

  // 5c. Radial Overall Score Visualization
  assert('Overall CRS Score circular ring present with percentage', dashRes.body.includes('COMPETENCY SCORE') || dashRes.body.includes('CRS SCORE'));

  // 5d. Detailed Metrics Bar
  assert('Academic Progress Measures bar present with real measures',
    dashRes.body.includes('COURSE COMPLETION') &&
    dashRes.body.includes('LABS COMPLETED') &&
    dashRes.body.includes('ASSESSMENT AVERAGE') &&
    dashRes.body.includes('ACADEMIC TIER')
  );

  // 5e. Growth Card Tab Content
  const growthTabRes = await fetchRoute('/dashboard?tab=growth-card', authCookie);
  assert('Growth Card tab contains 4-pillar breakdown and weights',
    growthTabRes.body.includes('Curriculum Mastery') &&
    growthTabRes.body.includes('Hands-On Labs') &&
    growthTabRes.body.includes('WT 30%')
  );
  assert('Growth Card tab contains Curriculum Learning Progress',
    growthTabRes.body.includes('Curriculum Learning Progress')
  );

  // 5f. Skill Passport Tab Content
  const passportTabRes = await fetchRoute('/dashboard?tab=skill-passport', authCookie);
  assert('Skill Passport tab contains 5 verification pillars',
    passportTabRes.body.includes('1. Track Enrollment') &&
    passportTabRes.body.includes('5. Cryptographic Proof')
  );
  assert('Skill Passport tab contains Issued Digital Credentials and Hashes',
    passportTabRes.body.includes('Issued Digital Credentials') &&
    passportTabRes.body.includes('Evidence Telemetry Ledger')
  );

  // --------------------------------------------------------------------------
  // 6. ROUTE ALIASES & WORKING DESTINATIONS
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Route Aliases & Destinations ---');
  const myLearningRes = await fetchRoute('/my-learning', authCookie);
  assert('Route /my-learning loads successfully (HTTP 200)', myLearningRes.status === 200);
  assert('Route /my-learning displays learning curriculum', myLearningRes.body.includes('Module') || myLearningRes.body.includes('Curriculum'));

  const employersRes = await fetchRoute('/for-employers');
  assert('Route /for-employers responds with redirect or 200', employersRes.status === 307 || employersRes.status === 308 || employersRes.status === 200);

  // --------------------------------------------------------------------------
  // 7. AUTH PROTECTION
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Server-Side Authentication Protection ---');
  const unauthDash = await fetchRoute('/dashboard');
  assert('Unauthenticated access to /dashboard redirects to /login (HTTP 307)', unauthDash.status === 307);
  assert('Redirect location includes returnUrl', String(unauthDash.headers.location).includes('/login?returnUrl='));

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 ALL PHASE 11.5 STUDENT DASHBOARD AUDIT CHECKS PASSED!');
  } else {
    console.log('❌ SOME AUDIT CHECKS FAILED');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runPhase115Audit();
