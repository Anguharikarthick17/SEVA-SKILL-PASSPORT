'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService, StoredEvidence } from '@/lib/data-service';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GROWTH_CATEGORIES } from '@/data';

const SKILL_METADATA: Record<string, { name: string; category: string; tip: string; challengeId: string }> = {
  javascript: {
    name: 'JavaScript',
    category: 'Frontend',
    tip: 'Complete the Async/Await & Event Loop challenges to strengthen asynchronous mastery.',
    challengeId: 'ch-advjs-01',
  },
  react: {
    name: 'React',
    category: 'Frontend',
    tip: 'Complete the React state-management challenge to strengthen this competency.',
    challengeId: 'ch-react-02',
  },
  'html-css': {
    name: 'HTML & CSS',
    category: 'Frontend',
    tip: 'Fix responsive layout breakpoints and accessibility landmarks in the CSS arena.',
    challengeId: 'ch-css-01',
  },
  nodejs: {
    name: 'Node.js',
    category: 'Backend',
    tip: 'Implement centralized error handling and custom Express middleware.',
    challengeId: 'ch-node-03',
  },
  'rest-api': {
    name: 'REST APIs',
    category: 'Backend',
    tip: 'Design full CRUD endpoints and enforce request schema validation.',
    challengeId: 'ch-rest-01',
  },
  sql: {
    name: 'PostgreSQL & SQL',
    category: 'Database',
    tip: 'Design normalized relational schemas and optimize queries using B-Tree indexes.',
    challengeId: 'ch-db-03',
  },
  security: {
    name: 'Authentication & Security',
    category: 'Security',
    tip: 'Implement protected API routes with JWT and sanitize inputs against XSS.',
    challengeId: 'ch-sec-01',
  },
  git: {
    name: 'Git & Version Control',
    category: 'Engineering',
    tip: 'Practice resolving 3-way merge conflicts and opening production pull requests.',
    challengeId: 'ch-git-01',
  },
  testing: {
    name: 'Testing & Diagnostics',
    category: 'Engineering',
    tip: 'Write automated unit tests with Vitest and test Express endpoints with Supertest.',
    challengeId: 'ch-test-01',
  },
  deployment: {
    name: 'Deployment & DevOps',
    category: 'Engineering',
    tip: 'Prepare a production pre-flight audit checklist and configure multi-stage Docker builds.',
    challengeId: 'ch-deploy-01',
  },
  'web-fundamentals': {
    name: 'Web Fundamentals',
    category: 'Frontend',
    tip: 'Inspect raw HTTP requests and understand browser critical rendering paths.',
    challengeId: 'ch-web-01',
  },
};

export default function SkillGrowthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [user, setUser] = useState<any>(null);
  const [, setEvidenceItems] = useState<StoredEvidence[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([
    { id: 'javascript', name: 'JavaScript', score: 88, category: 'Frontend', evidenceCount: 18, confidence: 'HIGH', tip: SKILL_METADATA.javascript.tip },
    { id: 'react', name: 'React', score: 76, category: 'Frontend', evidenceCount: 12, confidence: 'MEDIUM', tip: SKILL_METADATA.react.tip },
    { id: 'html-css', name: 'HTML & CSS', score: 92, category: 'Frontend', evidenceCount: 14, confidence: 'HIGH', tip: SKILL_METADATA['html-css'].tip },
    { id: 'nodejs', name: 'Node.js', score: 82, category: 'Backend', evidenceCount: 11, confidence: 'HIGH', tip: SKILL_METADATA.nodejs.tip },
    { id: 'rest-api', name: 'REST APIs', score: 84, category: 'Backend', evidenceCount: 10, confidence: 'MEDIUM', tip: SKILL_METADATA['rest-api'].tip },
    { id: 'sql', name: 'PostgreSQL & SQL', score: 79, category: 'Database', evidenceCount: 12, confidence: 'MEDIUM', tip: SKILL_METADATA.sql.tip },
    { id: 'security', name: 'Authentication & Security', score: 71, category: 'Security', evidenceCount: 8, confidence: 'LOW', tip: SKILL_METADATA.security.tip },
    { id: 'git', name: 'Git & Version Control', score: 90, category: 'Engineering', evidenceCount: 15, confidence: 'HIGH', tip: SKILL_METADATA.git.tip },
    { id: 'testing', name: 'Testing & Diagnostics', score: 74, category: 'Engineering', evidenceCount: 7, confidence: 'LOW', tip: SKILL_METADATA.testing.tip },
  ]);

  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    DataService.getCurrentUser().then(async (u) => {
      setUser(u);
      const uid = u ? u.id : 'std-001';
      const evList = await DataService.getUserEvidence(uid);
      setEvidenceItems(evList);

      const recs = await DataService.getRecommendedActions(uid);
      setRecommendations(recs);

      const res = await DataService.recalculateScores(uid);
      if (res.calculatedSkills && res.calculatedSkills.length > 0) {
        const updated = res.calculatedSkills.map((cs) => {
          const skillKey = cs.skillId.toLowerCase();
          const meta = SKILL_METADATA[skillKey] || {
            name: cs.skillId.toUpperCase(),
            category: 'Engineering',
            tip: `Complete practical ${cs.skillId} challenges to strengthen this competency.`,
            challengeId: 'ch-01',
          };

          return {
            id: skillKey,
            name: meta.name,
            score: cs.isSufficientlyEvidenced ? cs.score : 0,
            isSufficientlyEvidenced: cs.isSufficientlyEvidenced,
            category: meta.category,
            evidenceCount: cs.evidenceCount,
            confidence: cs.confidence,
            tip: cs.explanation || meta.tip,
            challengeId: meta.challengeId,
            weakestDimension: cs.weakestDimension,
          };
        });

        // Sort descending by score for main list
        updated.sort((a, b) => b.score - a.score);
        setCompetencies(updated);
      }
    });
  }, []);

  const filtered = selectedCategory === 'All'
    ? competencies
    : competencies.filter((c) => c.category === selectedCategory);

  // Weakest skills (lowest scores) for adaptive recommendations
  const weakAreas = [...competencies].sort((a, b) => a.score - b.score).slice(0, 3);

  // Overall average
  const overallAvg = competencies.length
    ? Math.round(competencies.reduce((acc, c) => acc + c.score, 0) / competencies.length)
    : 84;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <TrendingUp className="w-4 h-4 text-[#FFE4E6]" />
                Competency Analytics &amp; Telemetry
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Skill Growth &amp; Competency Velocity</h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                Track how your hands-on coding, labs, and projects translate into measurable competency growth. Course progress is strictly separated from verified competency.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6 shadow-md">
              <div>
                <span className="block text-2xl font-black text-[#FFE4E6]">{overallAvg}%</span>
                <span className="text-xs text-white/80">Overall Competency</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-black text-white">{competencies.length}</span>
                <span className="text-xs text-white/80">Tracked Skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Domain Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GROWTH_CATEGORIES.slice(0, 4).map((cat) => (
            <div key={cat.name} className="bg-white rounded-2xl border border-[#FFE4E6] p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {cat.name}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#1C0D12]">{cat.score}%</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <div className="w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#881337] to-[#9F1239] h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Growth Velocity & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Skill Breakdown (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#FFE4E6]">
              <div>
                <h2 className="text-base font-bold text-[#1C0D12]">Competency Scores &amp; Evidence Audit</h2>
                <p className="text-xs text-slate-500">Every score is calculated strictly from verified hands-on submissions.</p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Frontend', 'Backend', 'Database', 'Security', 'Engineering'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#881337] text-white shadow-sm'
                        : 'bg-[#FFFDF7] text-slate-700 border border-[#FECDD3] hover:text-[#881337] hover:bg-[#FFE4E6]/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((skill) => (
                <div key={skill.name} className="p-4 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1C0D12] text-sm">{skill.name}</span>
                      <span className="text-[10px] bg-white border border-[#FECDD3] px-2 py-0.5 rounded-full text-slate-600">
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          skill.confidence === 'HIGH'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : skill.confidence === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-rose-50 text-[#881337] border border-rose-300'
                        }`}
                        title="Confidence level based on diversity and volume of evidence"
                      >
                        {skill.confidence} CONFIDENCE
                      </span>
                      <span className="font-black text-[#881337] text-base">{skill.score}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#FFE4E6]/60 border border-[#FECDD3] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        skill.score >= 85
                          ? 'bg-emerald-600'
                          : skill.score >= 75
                          ? 'bg-gradient-to-r from-[#881337] to-[#9F1239]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Backing Evidence: <strong className="text-[#1C0D12]">{skill.evidenceCount}</strong> verified records</span>
                    <Link
                      href="/practice"
                      className="text-[#881337] hover:underline font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      Boost Competency <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Actions Based on Weak Areas (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#FFE4E6] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1C0D12] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#881337]" />
                Adaptive Growth Recommendations
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Dynamically generated based on your lowest-scoring competencies to maximize overall Skill Passport grade velocity.
              </p>

              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#881337] block">{rec.skillName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.priority === 'HIGH' ? 'bg-rose-100 text-[#881337]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.priority} PRIORITY
                        </span>
                      </div>
                      <p className="text-[#1C0D12] font-medium text-[11px] leading-tight">
                        {rec.recommendation}
                      </p>
                      <p className="text-slate-500 text-[10px] leading-relaxed">
                        {rec.reason}
                      </p>
                      <Link
                        href="/practice"
                        className="inline-flex items-center gap-1 text-[#881337] font-bold hover:underline pt-1 text-xs transition-colors"
                      >
                        Start Recommended Challenge <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                ) : (
                  weakAreas.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-3.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#881337] block">{skill.name}</span>
                        <span className="font-bold text-[#1C0D12] bg-white border border-[#FECDD3] px-2 py-0.5 rounded text-[10px]">
                          Current: {skill.score}%
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {skill.tip}
                      </p>
                      <Link
                        href="/practice"
                        className="inline-flex items-center gap-1 text-[#881337] font-bold hover:underline pt-1 text-xs transition-colors"
                      >
                        Start Recommended Challenge <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Evidence Sync Status */}
            <div className="bg-white border border-[#FFE4E6] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#881337] font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Evidence Sync Status
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Telemetry is cryptographically signed and synchronized with candidate ID:{' '}
                <strong className="text-[#1C0D12]">{user?.id ? `GSP-${user.id.substring(0, 8).toUpperCase()}` : 'GSP-DEMO-001'}</strong>.
              </p>
              <Link
                href="/skill-passport"
                className="w-full glow-button text-xs py-2.5 justify-center flex items-center gap-2 font-bold"
              >
                View Public Skill Passport
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
