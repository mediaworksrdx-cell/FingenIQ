async function testRoutes() {
  const routes = [
    { path: '/', type: 'OPEN' },
    { path: '/about', type: 'OPEN' },
    { path: '/contact', type: 'OPEN' },
    { path: '/community', type: 'OPEN' },
    { path: '/login', type: 'OPEN' },
    { path: '/certification-roadmap', type: 'OPEN' },
    { path: '/certification/verify/FGIQ-2026-AM001', type: 'OPEN' },
    { path: '/dashboard', type: 'LOCKED' },
    { path: '/lessons', type: 'LOCKED' },
    { path: '/lesson-player', type: 'LOCKED' },
    { path: '/assessments', type: 'LOCKED' },
    { path: '/capstone', type: 'LOCKED' },
    { path: '/certification', type: 'LOCKED' },
    { path: '/marketplace', type: 'LOCKED' },
    { path: '/admin/credentials', type: 'LOCKED' }
  ];

  console.log('Testing Route Access Policy:\n');
  let allPassed = true;

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r.path}`, { redirect: 'manual' });
      const status = res.status;
      const isLockedExpected = r.type === 'LOCKED';
      const isRedirect = status === 307 || status === 302 || status === 303;
      const isOk = status === 200;
      
      const pass = (isLockedExpected && isRedirect) || (!isLockedExpected && isOk);
      if (!pass) allPassed = false;

      const icon = pass ? '✓' : '✗';
      const redirectLoc = res.headers.get('location') ? ` (Redirected to ${res.headers.get('location')})` : '';
      console.log(`${icon} [${r.type.padEnd(6)}] ${r.path.padEnd(45)} -> Status ${status}${redirectLoc}`);
    } catch (e) {
      console.error(`✗ [ERROR]  ${r.path}:`, e.message);
      allPassed = false;
    }
  }

  console.log('\nResult: ' + (allPassed ? 'ALL ACCESS POLICIES ENFORCED PERFECTLY' : 'SOME POLICIES FAILED'));
}

testRoutes();
