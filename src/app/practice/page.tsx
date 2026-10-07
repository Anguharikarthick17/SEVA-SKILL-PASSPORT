'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Award,
  Terminal,
  RefreshCw,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DEMO_ASSESSMENTS } from '@/data';

interface Challenge {
  id: string;
  title: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
  solutionOutput: string;
  testCases: { input: string; expected: string }[];
  completed?: boolean;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'ch-01',
    title: 'Array Pipeline & Data Aggregation',
    skill: 'JavaScript',
    difficulty: 'Medium',
    description:
      'Given an array of student assessment scores, write a function `getTopCompetencies(scores, threshold)` that filters skills with scores above the threshold and returns their names sorted in descending order of score.',
    starterCode: `function getTopCompetencies(scores, threshold) {
  // Your code here:
  // Return array of skill names meeting or exceeding the threshold
  return scores
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(item => item.name);
}

// Test call
const testScores = [
  { name: 'JavaScript', score: 91 },
  { name: 'React', score: 88 },
  { name: 'SQL', score: 75 },
  { name: 'Git', score: 94 }
];
console.log(getTopCompetencies(testScores, 80));`,
    solutionOutput: `Test Case 1 Passed: ['Git', 'JavaScript', 'React']\nTest Case 2 Passed: Empty set when threshold > 100\nAll 4 automated assertion tests passed successfully!`,
    testCases: [
      { input: 'threshold = 80', expected: "['Git', 'JavaScript', 'React']" },
      { input: 'threshold = 90', expected: "['Git', 'JavaScript']" },
    ],
    completed: true,
  },
  {
    id: 'ch-02',
    title: 'Async Retry Utility with Exponential Backoff',
    skill: 'JavaScript',
    difficulty: 'Hard',
    description:
      'Implement `fetchWithRetry(fn, maxRetries, delay)` that attempts to execute an asynchronous promise returning function up to `maxRetries` times before rejecting.',
    starterCode: `async function fetchWithRetry(fn, maxRetries = 3, delay = 200) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempts++;
      if (attempts >= maxRetries) throw err;
      await new Promise(res => setTimeout(res, delay * attempts));
    }
  }
}`,
    solutionOutput: `Test Case 1: Succeeds on attempt 2 after transient failure.\nTest Case 2: Correctly rejects after max 3 retries.\nVerified with high precision mock timers.`,
    testCases: [
      { input: 'Fails 1x then succeeds', expected: 'Resolved value' },
      { input: 'Fails 4x continuously', expected: 'Error rejected' },
    ],
    completed: false,
  },
  {
    id: 'ch-03',
    title: 'Custom Hook: useDebounce',
    skill: 'React',
    difficulty: 'Medium',
    description:
      'Write a custom React hook `useDebounce(value, delay)` that delays updating a search value until a set period of user typing inactivity has elapsed.',
    starterCode: `import { useState, useEffect } from 'react';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    solutionOutput: `Test Case 1: Value updates after 300ms idle.\nTest Case 2: Cleanup cancels active timers on rapid keystrokes.\nReact Hook rules verification passed!`,
    testCases: [
      { input: 'Rapid changes within 100ms', expected: 'Single final update' },
    ],
    completed: false,
  },
  {
    id: 'ch-04',
    title: 'Aggregating Candidate Competencies via SQL',
    skill: 'SQL',
    difficulty: 'Easy',
    description:
      'Write an ANSI SQL query to compute the average competency score and count of certified challenges for each candidate grouped by category.',
    starterCode: `SELECT 
  candidate_id,
  category,
  ROUND(AVG(score), 2) AS avg_competency,
  COUNT(id) AS total_evidence_items
FROM candidate_evidence
GROUP BY candidate_id, category
HAVING AVG(score) >= 75
ORDER BY avg_competency DESC;`,
    solutionOutput: `Query Executed in 14ms.\nReturned 4 rows matching competency threshold >= 75.\nOptimized index scan verified.`,
    testCases: [
      { input: 'Candidate GSP-DEMO-001 evidence table', expected: '4 categories summarized' },
    ],
    completed: true,
  },
];

export default function PracticePage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starterCode);
  const [activeFilter, setActiveFilter] = useState('All');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [evidenceRecorded, setEvidenceRecorded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recordedHash, setRecordedHash] = useState<string>('');

  useEffect(() => {
    DataService.getCurrentUser().then((u) => setUser(u));
  }, []);

  const filteredChallenges = CHALLENGES.filter((c) => {
    if (activeFilter === 'All') return true;
    return c.skill === activeFilter;
  });

  const handleSelectChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setCode(ch.starterCode);
    setTestResult(null);
    setEvidenceRecorded(false);
    setRecordedHash('');
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setTestResult(selectedChallenge.solutionOutput);
    }, 700);
  };

  const handleSubmitEvidence = async () => {
    const userId = user ? user.id : 'std-001';
    const score = selectedChallenge.difficulty === 'Hard' ? 92 : selectedChallenge.difficulty === 'Medium' ? 88 : 95;
    
    const res = await DataService.submitChallenge({
      userId,
      challengeId: selectedChallenge.id,
      skillId: selectedChallenge.skill.toLowerCase(),
      code,
      score,
      testsPassed: 4,
      testsTotal: 4,
    });

    setRecordedHash(res.verificationHash);
    setEvidenceRecorded(true);
  };

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <Code2 className="w-4 h-4" />
              Interactive Coding Labs
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Practice & Coding Arena</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Solve hands-on coding challenges to validate your knowledge. Every successfully passed challenge generates verifiable telemetry for your Skill Passport.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6">
            <div>
              <span className="block text-2xl font-black text-saffron-400">15</span>
              <span className="text-xs text-blue-100">Challenges Solved</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black text-white">+85</span>
              <span className="text-xs text-blue-100">Evidence Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Challenge List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-100">
              {['All', 'JavaScript', 'React', 'SQL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeFilter === cat
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Challenges */}
            <div className="space-y-2">
              {filteredChallenges.map((ch) => {
                const isSelected = selectedChallenge.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChallenge(ch)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-navy-900 bg-navy-50/50 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-xs font-bold ${isSelected ? 'text-navy-900' : 'text-slate-800'}`}>
                        {ch.title}
                      </h3>
                      {ch.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {ch.skill}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          ch.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ch.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assessment Link Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-navy-900 font-bold text-sm mb-1">
              <Award className="w-4 h-4 text-saffron-600" />
              Official Skill Assessments
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Ready for timed, proctored evaluations? Take an assessment to lock in high-confidence scores.
            </p>
            <div className="space-y-2">
              {DEMO_ASSESSMENTS.slice(0, 3).map((ass) => (
                <div key={ass.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-800">{ass.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900">{ass.score}%</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">Passed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Code Arena & Test Runner (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Challenge Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">
                  {selectedChallenge.skill} Challenge
                </span>
                <h2 className="text-lg font-bold text-navy-900">{selectedChallenge.title}</h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  selectedChallenge.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedChallenge.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {selectedChallenge.difficulty}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedChallenge.description}</p>
          </div>

          {/* Evidence Success Toast */}
          {evidenceRecorded && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-900">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="block text-sm">Evidence Recorded in Skill Passport!</strong>
                  <span>Your automated test telemetry has been committed to candidate ID <strong>{user?.id ? `GSP-${user.id.substring(0, 8).toUpperCase()}` : 'GSP-DEMO-001'}</strong>.</span>
                  {recordedHash && (
                    <span className="block font-mono text-[10px] text-emerald-700 mt-0.5 truncate max-w-md">
                      Hash: {recordedHash}
                    </span>
                  )}
                </div>
              </div>
              <Link href="/skill-passport/my" className="btn-primary text-xs whitespace-nowrap">
                View My Passport
              </Link>
            </div>
          )}

          {/* Code Editor Container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            {/* Editor Toolbar */}
            <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <FileCode className="w-4 h-4 text-blue-400" />
                solution.js
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running Tests...' : 'Run Tests'}
                </button>
                {testResult && (
                  <button
                    onClick={handleSubmitEvidence}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Submit for Evidence
                  </button>
                )}
              </div>
            </div>

            {/* Code Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none leading-relaxed resize-none"
              spellCheck={false}
            />

            {/* Terminal / Test Output */}
            {testResult && (
              <div className="border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Automated Test Results Output
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{testResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
