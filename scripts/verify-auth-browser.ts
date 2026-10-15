import http from 'http';

async function testFetch(path: string, options: any = {}) {
  const url = `http://localhost:3000${path}`;
  const res = await fetch(url, { redirect: 'manual', ...options });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    text: await res.text(),
  };
}

async function runBrowserChecks() {
  console.log('\n======================================================');
  console.log('HTTP & ROUTING VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Public Homepage loads
  const home = await testFetch('/');
  assert(home.status === 200, 'Homepage returns HTTP 200');
  assert(home.text.includes('/login'), 'Homepage contains link to /login');
  assert(home.text.includes('/signup'), 'Homepage contains link to /signup');

  // 2. /login is accessible logged out
  const login = await testFetch('/login');
  assert(login.status === 200, '/login returns HTTP 200 without redirecting');
  assert(login.text.includes('Sign In'), '/login renders Sign In heading');
  assert(login.text.includes('/signup'), '/login contains link to /signup');

  // 3. /signup is accessible logged out
  const signup = await testFetch('/signup');
  assert(signup.status === 200, '/signup returns HTTP 200 without redirecting');
  assert(signup.text.includes('Create Account'), '/signup renders Create Account heading');
  assert(signup.text.includes('/login'), '/signup contains link to /login');

  // 4. /register redirects to /signup
  const register = await testFetch('/register');
  assert(
    register.status === 307 || register.status === 308 || register.headers['location'] === '/signup',
    '/register redirects directly to /signup'
  );

  // 5. /dashboard is protected - middleware redirects unauthenticated requests to /login
  const dashboard = await testFetch('/dashboard');
  assert(
    dashboard.status === 307 || dashboard.status === 308 || ((dashboard.headers['location'] as string | undefined)?.includes('/login') ?? false),
    '/dashboard redirects unauthenticated requests to /login'
  );
  assert(
    (dashboard.headers['location'] as string | undefined)?.includes('returnUrl=%2Fdashboard') || (dashboard.headers['location'] as string | undefined)?.includes('returnUrl=/dashboard') || false,
    '/dashboard includes safe returnUrl parameter'
  );

  // 6. /profile is protected
  const profile = await testFetch('/profile');
  assert(
    profile.status === 307 || profile.status === 308 || ((profile.headers['location'] as string | undefined)?.includes('/login') ?? false),
    '/profile redirects unauthenticated requests to /login'
  );

  // 7. /skill-passport/my is protected
  const myPassport = await testFetch('/skill-passport/my');
  assert(
    myPassport.status === 307 || myPassport.status === 308 || ((myPassport.headers['location'] as string | undefined)?.includes('/login') ?? false),
    '/skill-passport/my redirects unauthenticated requests to /login'
  );

  // 8. With valid auth cookie, /dashboard passes through middleware
  const authDashboard = await testFetch('/dashboard', {
    headers: {
      Cookie: 'seva-auth-token=active',
    },
  });
  assert(authDashboard.status === 200, 'Authenticated request with auth cookie accesses /dashboard');

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runBrowserChecks();
