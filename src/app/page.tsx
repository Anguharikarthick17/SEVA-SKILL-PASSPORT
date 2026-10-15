import type { Metadata } from 'next';
import HeroCinematic from '@/components/home/HeroCinematic';
import ProblemComparison from '@/components/home/ProblemComparison';
import CourseExplorer from '@/components/home/CourseExplorer';
import ProcessVisualization from '@/components/home/ProcessVisualization';
import InteractivePassportDemo from '@/components/home/InteractivePassportDemo';
import ProjectEvidenceShowcase from '@/components/home/ProjectEvidenceShowcase';
import AffordabilityCard from '@/components/home/AffordabilityCard';
import EmployerEvidencePreview from '@/components/home/EmployerEvidencePreview';
import ClosingCTA from '@/components/home/ClosingCTA';

export const metadata: Metadata = {
  title: 'SEVA Skill Passport — Learn Skills. Build Ability. Prove What You Can Do.',
  description:
    'Turn affordable learning into practical skills, real project evidence, and a shareable Skill Passport. A proposed platform transforming education into verified engineering capability.',
};

export default function HomePage() {
  return (
    <div className="w-full bg-[#FFFDF7] text-espresso-900 selection:bg-milan-600/20 selection:text-milan-800">
      {/* ── SECTION B: HERO SECTION (Matching Visual Reference) ───────── */}
      <HeroCinematic />

      {/* ── SECTION C: CERTIFICATES VS EVIDENCE SPLIT COMPARISON ──────── */}
      <ProblemComparison />

      {/* ── SECTION E: POPULAR LEARNING PATHS CARDS ───────────────────── */}
      <CourseExplorer />

      {/* ── SECTION D: 6-STEP CONNECTED LEARNING JOURNEY ─────────────── */}
      <ProcessVisualization />

      {/* ── SECTION F & H: SKILL PASSPORT & EMPLOYER VERIFICATION ──────── */}
      <InteractivePassportDemo />

      {/* ── CAPSTONE PROJECT EVIDENCE LIFECYCLE ──────────────────────── */}
      <ProjectEvidenceShowcase />

      {/* ── RECRUITER TELEMETRY & HIRING SUITE ────────────────────────── */}
      <EmployerEvidencePreview />

      {/* ── MISSION AFFORDABILITY CARD (PROPOSED ₹100 ACCESS MODEL) ───── */}
      <AffordabilityCard />

      {/* ── SECTION I: FINAL CONVERSION CALL TO ACTION ───────────────── */}
      <ClosingCTA />
    </div>
  );
}
