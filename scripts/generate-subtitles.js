/**
 * generate-subtitles.js
 * Generates an accurate, synchronized SRT subtitle file for the complete 179-second film.
 */
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../video-production/audio/scenes_manifest.json'), 'utf8')
);

function formatSrtTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

const subtitleEvents = [
  // Scene 1: 0.0 - 15.5
  { start: 0.5, end: 5.8, text: "Learning is fundamental.\nBut how do we prove what we can actually build and do?" },
  { start: 6.2, end: 11.2, text: "Welcome to SEVA Skill Passport.\nProof of Course → Proof of Ability." },
  { start: 11.5, end: 15.0, text: "Powered by Team OG — Opportunity & Growth" },

  // Scene 2: 15.5 - 39.5
  { start: 16.0, end: 22.5, text: "Every year, millions of students complete online courses\nand receive completion certificates." },
  { start: 23.0, end: 29.8, text: "But a certificate only confirms attendance.\nIt cannot show architectural decisions made in code," },
  { start: 30.2, end: 35.0, text: "the edge cases tested, or practical problem-solving\ndemonstrated during real development." },
  { start: 35.5, end: 39.2, text: "There is a missing link between passive study\nand verified competency." },

  // Scene 3: 39.5 - 64.0
  { start: 40.5, end: 47.0, text: "Our team explored the challenges of demonstrating practical skills\nbeyond course-completion certificates." },
  { start: 47.5, end: 55.0, text: "Through our case-study investigation and consultation,\nwe sought perspectives and suggestions to better understand the problem." },
  { start: 55.5, end: 61.5, text: "This informed our goal: to connect learning\nwith clearer evidence of practical ability." },

  // Scene 4: 64.0 - 80.0
  { start: 64.5, end: 70.0, text: "Introducing SEVA Skill Passport:\na unified digital learning and capability verification framework." },
  { start: 70.5, end: 75.8, text: "Moving learners from basic course completion\nto tangible, cryptographic skill evidence" },
  { start: 76.2, end: 79.5, text: "that can be independently inspected by educators and hiring teams." },

  // Scene 5: 80.0 - 107.0
  { start: 80.5, end: 85.0, text: "Here is our live working prototype, running locally.\nBeginning with our full-screen branded welcome intro," },
  { start: 85.5, end: 90.0, text: "learners explore structured tracks like Full Stack Development.\nOur zero-friction onboarding includes one-click demo access." },
  { start: 90.5, end: 95.5, text: "Inside the dashboard, student progress is tracked\nwith active lesson milestones." },
  { start: 96.0, end: 101.5, text: "Every challenge and code submission is linked to verifiable cryptographic proof," },
  { start: 102.0, end: 106.5, text: "providing an authentic evidence portfolio." },

  // Scene 6: 107.0 - 130.0
  { start: 107.5, end: 113.0, text: "Existing platforms—from traditional learning management systems\nto portfolio websites—solve individual pieces of the puzzle." },
  { start: 113.5, end: 121.0, text: "SEVA Skill Passport connects them into a continuous journey:\nCourse Learning → Practical Sandboxes → Project Assessments → Skill Passport." },
  { start: 121.5, end: 129.5, text: "A unified continuum from curriculum to cryptographic proof." },

  // Scene 7: 130.0 - 151.5
  { start: 130.5, end: 136.5, text: "Built on modern production technologies: Next.js App Router,\nReact, and TypeScript for responsive interfaces," },
  { start: 137.0, end: 142.0, text: "styled with Tailwind CSS, backed by Supabase and PostgreSQL," },
  { start: 142.5, end: 147.0, text: "and secured with SHA-256 cryptographic evidence hashing." },
  { start: 147.5, end: 151.0, text: "Developed iteratively as a working prototype with modular services." },

  // Scene 8: 151.5 - 170.5
  { start: 152.0, end: 157.0, text: "Our intended benefits focus on transparent skill representation,\nempowering learners and simplifying evaluation." },
  { start: 157.5, end: 164.0, text: "Our roadmap advances from prototype validation to student testing,\nricher assessment rubrics, and institutional integration." },
  { start: 164.5, end: 170.0, text: "Driven by Team OG — Opportunity & Growth." },

  // Scene 9: 170.5 - 179.0
  { start: 171.0, end: 175.5, text: "SEVA Skill Passport.\nProof of Course → Proof of Ability." },
  { start: 176.0, end: 178.8, text: "Building a clearer bridge between learning and demonstrated ability." }
];

let srtContent = '';
subtitleEvents.forEach((ev, idx) => {
  srtContent += `${idx + 1}\n`;
  srtContent += `${formatSrtTime(ev.start)} --> ${formatSrtTime(ev.end)}\n`;
  srtContent += `${ev.text}\n\n`;
});

const outPath = path.resolve(__dirname, '../video-production/seva_skill_passport.srt');
fs.writeFileSync(outPath, srtContent.trim() + '\n');
console.log(`Saved synchronized subtitles to ${outPath}`);
