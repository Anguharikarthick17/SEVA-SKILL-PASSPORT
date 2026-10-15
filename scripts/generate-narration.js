/**
 * generate-narration.js
 * Generates high-quality 48kHz WAV audio for each of the 9 scenes.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.resolve(__dirname, '../video-production/audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const scenes = [
  {
    id: 1,
    targetDuration: 12.0,
    text: "Learning is fundamental. But in a competitive, technology-driven world, how do we prove what we can actually build and do? Welcome to SEVA Skill Passport. Proof of Course to Proof of Ability. Powered by Team OG — Opportunity and Growth.",
  },
  {
    id: 2,
    targetDuration: 26.0,
    text: "Every year, millions of students complete online courses and receive completion certificates. But a certificate only confirms attendance. It cannot show the architectural decisions made in code, the edge cases tested, or the practical problem-solving demonstrated during real development. For both learners and evaluators, there is a missing link between passive study and verified competency.",
  },
  {
    id: 3,
    targetDuration: 22.0,
    text: "To ground this platform in real-world reality, our team conducted field investigations. During direct consultative discussions in administrative offices, officers and academic mentors emphasized the critical need for transparent, tamper-proof evidence. The key insight was clear: stakeholders don't just want test scores—they want verifiable artifacts of genuine engineering execution.",
  },
  {
    id: 4,
    targetDuration: 20.0,
    text: "Introducing SEVA Skill Passport: a unified digital learning and capability verification framework. Moving learners from basic course completion to tangible, cryptographic skill evidence that can be independently inspected by educators and hiring teams.",
  },
  {
    id: 5,
    targetDuration: 32.0,
    text: "Here is our live working prototype, running locally. Beginning with our full-screen branded welcome intro, learners explore structured tracks like Full Stack Development. Our zero-friction onboarding includes one-click demo access. Inside the dashboard, student progress is tracked with active lesson milestones. Every challenge and code submission is linked to verifiable cryptographic proof, providing an authentic evidence portfolio.",
  },
  {
    id: 6,
    targetDuration: 24.0,
    text: "Existing platforms—from traditional learning management systems to portfolio websites—solve individual pieces of the puzzle. SEVA Skill Passport connects them into a continuous journey: Course Learning leads to Practical Sandboxes, leading to Project Assessments, resulting in an immutable Skill Passport. A unified continuum from curriculum to cryptographic proof.",
  },
  {
    id: 7,
    targetDuration: 20.0,
    text: "Built on modern production technologies: Next.js App Router, React, and TypeScript for responsive interfaces, styled with Tailwind CSS, backed by Supabase and PostgreSQL, and secured with SHA-256 cryptographic evidence hashing. Developed iteratively as a working prototype with modular services.",
  },
  {
    id: 8,
    targetDuration: 16.0,
    text: "Our intended benefits focus on transparent skill representation, empowering learners and simplifying evaluation. Our roadmap advances from prototype validation to student testing, richer assessment rubrics, and institutional integration. Driven by Team OG — Opportunity and Growth.",
  },
  {
    id: 9,
    targetDuration: 8.0,
    text: "SEVA Skill Passport. Proof of Course to Proof of Ability. Building a clearer bridge between learning and demonstrated ability.",
  },
];

console.log('Generating high-fidelity narration audio for all 9 scenes...');

const manifest = [];

for (const scene of scenes) {
  const aiffPath = path.join(AUDIO_DIR, `scene_${scene.id}.aiff`);
  const wavPath = path.join(AUDIO_DIR, `scene_${scene.id}.wav`);

  // Use Daniel voice with moderate documentary cadence (rate 175)
  const escapedText = scene.text.replace(/"/g, '\\"');
  execSync(`say -v "Daniel" -r 175 -o "${aiffPath}" "${escapedText}"`);

  // Convert to 48kHz mono WAV with ffmpeg
  execSync(`ffmpeg -y -i "${aiffPath}" -ar 48000 -c:a pcm_s16le "${wavPath}" 2>/dev/null`);
  fs.unlinkSync(aiffPath);

  // Measure audio duration using ffprobe
  const durationStr = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`
  ).toString().trim();
  const actualDuration = parseFloat(durationStr);

  console.log(`Scene ${scene.id}: Actual voice duration = ${actualDuration.toFixed(2)}s (Target Scene = ${scene.targetDuration}s)`);

  manifest.push({
    ...scene,
    wavPath,
    voiceDuration: actualDuration,
  });
}

fs.writeFileSync(path.join(AUDIO_DIR, 'narration-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Narration generated successfully!');
