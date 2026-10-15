import http from 'http';

async function fetchRoute(path: string, cookie: string = 'seva-auth-token=active'): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, { headers: { Cookie: cookie } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 200, body: data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runAcademicAnalyticsAudit() {
  console.log('================================================================');
  console.log('SEVA SKILL PASSPORT — PHASE 11.6 ACADEMIC ANALYTICS & TAB AUDIT');
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

  // 1. Tab 1: CRS Dashboard
  console.log('--- 1. Testing Tab 1: CRS Dashboard Content ---');
  const crsRes = await fetchRoute('/dashboard?tab=crs-dashboard');
  assert('CRS Dashboard returns HTTP 200', crsRes.status === 200);
  assert('Renders panel-crs-dashboard', crsRes.body.includes('id="panel-crs-dashboard"'));
  assert('Contains CRS circular progress score meter', crsRes.body.includes('CRS SCORE') || crsRes.body.includes('COMPETENCY SCORE'));
  assert('Contains Academic Progress Measures panel', crsRes.body.includes('Academic Progress Measures'));
  assert('Contains Telemetry Activity Log', crsRes.body.includes('Academic Activity &amp; Telemetry Log') || crsRes.body.includes('Academic Activity'));
  assert('Does NOT render Growth Card panel content', !crsRes.body.includes('id="panel-growth-card"'));
  assert('Does NOT render Skill Passport panel content', !crsRes.body.includes('id="panel-skill-passport"'));

  // 2. Tab 2: Growth Card
  console.log('\n--- 2. Testing Tab 2: Growth Card Content ---');
  const growthRes = await fetchRoute('/dashboard?tab=growth-card');
  assert('Growth Card returns HTTP 200', growthRes.status === 200);
  assert('Renders panel-growth-card', growthRes.body.includes('id="panel-growth-card"'));
  assert('Contains 4-pillar breakdown with authentic weights (30%, 25%, 25%, 20%)',
    growthRes.body.includes('WT 30%') && growthRes.body.includes('WT 25%') && growthRes.body.includes('WT 20%')
  );
  assert('Contains Curriculum Learning Progress section', growthRes.body.includes('Curriculum Learning Progress'));
  assert('Contains My Capstone Projects section', growthRes.body.includes('My Capstone Projects &amp; Reviews') || growthRes.body.includes('My Capstone Projects'));
  assert('Does NOT render CRS Dashboard panel content', !growthRes.body.includes('id="panel-crs-dashboard"'));
  assert('Does NOT render Skill Passport panel content', !growthRes.body.includes('id="panel-skill-passport"'));

  // 3. Tab 3: Skill Passport
  console.log('\n--- 3. Testing Tab 3: Skill Passport Content ---');
  const passportRes = await fetchRoute('/dashboard?tab=skill-passport');
  assert('Skill Passport returns HTTP 200', passportRes.status === 200);
  assert('Renders panel-skill-passport', passportRes.body.includes('id="panel-skill-passport"'));
  assert('Contains Official Skill Passport header', passportRes.body.includes('Official Skill Passport &amp; Integrity Ledger'));
  assert('Contains 5 Verification Pillars', passportRes.body.includes('1. Track Enrollment') && passportRes.body.includes('5. Cryptographic Proof'));
  assert('Contains Issued Digital Credentials section', passportRes.body.includes('Issued Digital Credentials'));
  assert('Contains Evidence Telemetry Ledger', passportRes.body.includes('Evidence Telemetry Ledger'));
  assert('Does NOT render CRS Dashboard panel content', !passportRes.body.includes('id="panel-crs-dashboard"'));
  assert('Does NOT render Growth Card panel content', !passportRes.body.includes('id="panel-growth-card"'));

  // 4. Coin Economy & Mock Purge Audit (Phase F & I)
  console.log('\n--- 4. Purge Audit: Elimination of Coins & Irrelevant Reviews ---');
  const fullHtml = crsRes.body + growthRes.body + passportRes.body;
  assert('Zero coin metrics in dashboard', !fullHtml.toLowerCase().includes('coin') && !fullHtml.toLowerCase().includes('coins'));
  assert('Zero power saving mode references', !fullHtml.toLowerCase().includes('power saving mode'));
  assert('Zero extra lives references', !fullHtml.toLowerCase().includes('extra lives') && !fullHtml.toLowerCase().includes('extra life'));
  assert('Zero hardcoded EcoRoute repo', !fullHtml.includes('github.com/Anguharikarthick17/EcoRoute'));
  assert('Zero hardcoded Qbee AI review text', !fullHtml.includes('Qbee AI Review'));
  assert('Zero hardcoded 30.1 / 35 marks', !fullHtml.includes('30.1 / 35'));

  // 5. Accessibility Audit (Phase 4)
  console.log('\n--- 5. Accessibility Audit ---');
  assert('Tablist has role="tablist"', crsRes.body.includes('role="tablist"'));
  assert('Tabs have role="tab"', crsRes.body.includes('role="tab"'));
  assert('Panels have role="tabpanel"', crsRes.body.includes('role="tabpanel"'));

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 ALL PHASE 11.6 ACADEMIC ANALYTICS & TAB AUDIT CHECKS PASSED!');
  } else {
    console.log('❌ SOME AUDIT CHECKS FAILED');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runAcademicAnalyticsAudit();
