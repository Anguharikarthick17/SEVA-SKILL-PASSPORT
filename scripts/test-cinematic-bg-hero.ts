import http from 'http';

async function testCinematicHero() {
  console.log('Testing Cinematic Hero Background Video on http://localhost:3000...');

  const html = await new Promise<string>((resolve, reject) => {
    http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });

  const tests = [
    {
      name: 'HTML <video> tag present for hero background',
      pass: html.includes('<video') && html.includes('/videos/seva-hero-bg.mp4'),
    },
    {
      name: 'Video has poster image set to /videos/seva-hero-bg-poster.webp',
      pass: html.includes('poster="/videos/seva-hero-bg-poster.webp"'),
    },
    {
      name: 'Video has autoplay, loop, muted, playsinline attributes',
      pass:
        /autoplay/i.test(html) &&
        /loop/i.test(html) &&
        /muted/i.test(html) &&
        /playsinline/i.test(html),
    },
    {
      name: 'Video positioned absolute inset-0 with object-cover',
      pass:
        html.includes('absolute inset-0') &&
        html.includes('object-cover'),
    },
    {
      name: 'Directional readability gradient present',
      pass:
        html.includes('bg-gradient-to-r') &&
        html.includes('from-[#FFFDF0]'),
    },
    {
      name: 'Redundant right-side preview card removed from hero',
      pass: !html.includes('previewVideoRef') && !html.includes('HeroExplainerVideo'),
    },
    {
      name: 'Preserves Headline "Learn Skills. Build Ability. Prove What You Can Do."',
      pass:
        html.includes('Learn Skills.') &&
        html.includes('Build Ability.') &&
        html.includes('Prove What You Can Do.'),
    },
    {
      name: 'Preserves Watch Full Explainer CTA button',
      pass:
        html.includes('hero-watch-explainer') &&
        html.includes('Watch Full Explainer'),
    },
    {
      name: 'Preserves 4 Statistics metrics (12, ₹100, SHA-256, 100% Practical Learning)',
      pass:
        html.includes('12') &&
        html.includes('₹100') &&
        html.includes('SHA-256') &&
        html.includes('Practical Learning'),
    },
    {
      name: 'Next Section "Certificates show completion. Skills need evidence." is present',
      pass:
        html.includes('Certificates show completion') &&
        html.includes('Skills need evidence'),
    },
  ];

  let allPassed = true;
  for (const t of tests) {
    if (t.pass) {
      console.log(`✅ PASS: ${t.name}`);
    } else {
      console.log(`❌ FAIL: ${t.name}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    process.exit(1);
  }
  console.log('\n🎉 ALL CINEMATIC BACKGROUND VIDEO AUDIT CHECKS PASSED!');
}

testCinematicHero().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
