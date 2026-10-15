'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Award,
  Terminal,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Save,
  Check,
  Layers,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { REAL_CHALLENGES, ChallengeDefinition } from '@/data/challenges';
import { DataService, UserProfile } from '@/lib/data-service';
import { PracticeTestRunner, ChallengeEvaluation } from '@/lib/practice/tester';
import PracticeEditor from '@/components/practice/PracticeEditor';
import ViewAnswerModal from '@/components/practice/ViewAnswerModal';
import GlowButton from '@/components/ui/GlowButton';

export default function PracticePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDefinition>(REAL_CHALLENGES[0]);
  const [code, setCode] = useState<string>(REAL_CHALLENGES[0].starterCode);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  // Layout panel toggles
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'instructions' | 'results' | 'criteria'>('instructions');
  const [mobileTab, setMobileTab] = useState<'editor' | 'explorer' | 'info'>('editor');

  // Execution & Testing State
  const [isRunning, setIsRunning] = useState(false);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [evidenceRecorded, setEvidenceRecorded] = useState(false);
  const [recordedHash, setRecordedHash] = useState<string>('');
  const [completedChallengeIds, setCompletedChallengeIds] = useState<Set<string>>(new Set());

  // Draft Persistence State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeDefinition | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial User & Completed Challenge Loading
  useEffect(() => {
    async function initUser() {
      const currentUser = await DataService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const completed = DataService.getCompletedChallenges(currentUser.id);
        setCompletedChallengeIds(new Set(completed));

        // Load saved draft if present for initial challenge
        const initialDraft = DataService.getChallengeDraft(currentUser.id, REAL_CHALLENGES[0].id);
        if (initialDraft) {
          setCode(initialDraft);
        }
      }
    }
    initUser();
  }, []);

  // 2. Debounced Draft Auto-save
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (user) {
        setSaveStatus('saving');
        DataService.saveChallengeDraft({
          userId: user.id,
          challengeId: selectedChallenge.id,
          code: newCode,
        });
        setTimeout(() => setSaveStatus('saved'), 400);
      }
    }, 800);
  };

  // 3. Challenge Switching with Draft Restoration & Unsaved Warning
  const handleSelectChallenge = (ch: ChallengeDefinition) => {
    if (ch.id === selectedChallenge.id) return;

    // Check if current code has meaningful unsaved changes compared to starter or saved draft
    const isUnsavedModified = saveStatus === 'unsaved' && code !== selectedChallenge.starterCode;
    if (isUnsavedModified) {
      setPendingChallenge(ch);
      setDiscardConfirmOpen(true);
      return;
    }

    switchChallengeDirectly(ch);
  };

  const switchChallengeDirectly = (ch: ChallengeDefinition) => {
    setSelectedChallenge(ch);
    setEvaluation(null);
    setEvidenceRecorded(false);
    setActiveTab('instructions');

    // Restore draft or starter code
    const userId = user?.id || 'demo-student-001';
    const draft = DataService.getChallengeDraft(userId, ch.id);
    if (draft) {
      setCode(draft);
    } else {
      setCode(ch.starterCode);
    }
    setSaveStatus('saved');
    setMobileTab('editor');
  };

  const confirmSwitchChallenge = () => {
    if (pendingChallenge) {
      switchChallengeDirectly(pendingChallenge);
      setPendingChallenge(null);
    }
    setDiscardConfirmOpen(false);
  };

  // 4. Reset to Starter Scaffold
  const handleResetStarter = () => {
    if (window.confirm('Reset code to initial starter template? This will clear current edits in this challenge.')) {
      setCode(selectedChallenge.starterCode);
      if (user) {
        DataService.saveChallengeDraft({
          userId: user.id,
          challengeId: selectedChallenge.id,
          code: selectedChallenge.starterCode,
        });
      }
      setSaveStatus('saved');
      setEvaluation(null);
    }
  };

  // 5. Run Automated Tests using PracticeTestRunner
  const handleRunTests = () => {
    setIsRunning(true);
    setEvidenceRecorded(false);

    setTimeout(() => {
      const result = PracticeTestRunner.evaluateChallenge(selectedChallenge, code);
      setEvaluation(result);
      setIsRunning(false);
      setActiveTab('results');
      setMobileTab('info');
      if (!infoPanelOpen) {
        setInfoPanelOpen(true);
      }
    }, 600);
  };

  // 6. Submit for Cryptographic Evidence
  const handleSubmitEvidence = async () => {
    if (!evaluation || !evaluation.success) return;

    try {
      const candidateId = user?.id || 'demo-student-001';
      const record = await DataService.submitChallenge({
        userId: candidateId,
        challengeId: selectedChallenge.id,
        skillId: selectedChallenge.skills[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: code,
        score: 100,
        testsPassed: evaluation.passedTests,
        testsTotal: evaluation.totalTests,
        additionalSkills: selectedChallenge.skills,
      });

      setRecordedHash(record.verificationHash);
      setEvidenceRecorded(true);
      setCompletedChallengeIds((prev) => new Set(prev).add(selectedChallenge.id));
    } catch (e) {
      console.error('Error submitting practice evidence:', e);
    }
  };

  // 7. Filtering & Categories
  const categories = useMemo(() => [
    'All',
    'JavaScript',
    'HTML/CSS',
    'React',
    'Node.js',
    'REST API',
    'SQL',
    'Security',
    'Git',
    'Testing',
  ], []);

  const filteredChallenges = useMemo(() => {
    return REAL_CHALLENGES.filter((c) => {
      const matchesFilter =
        activeFilter === 'All' ||
        c.skill.toLowerCase() === activeFilter.toLowerCase() ||
        c.skills.some((s) => s.toLowerCase() === activeFilter.toLowerCase()) ||
        (activeFilter === 'HTML/CSS' && (c.language === 'css' || c.skill.includes('CSS')));

      const matchesSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skill.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const isCompleted = completedChallengeIds.has(selectedChallenge.id) || selectedChallenge.completed;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 flex flex-col">
      {/* ── TOP SLIM WORKSPACE BAR ────────────────────────────────────── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-milan-600/15 px-3 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs text-espresso-muted hover:text-milan-600 transition-colors font-bold flex-shrink-0"
            title="Back to Catalog"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>

          <div className="h-4 w-px bg-milan-600/20 flex-shrink-0" />

          {/* Toggle Explorer Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 ${
              sidebarOpen
                ? 'bg-milan-50 border-milan-600/30 text-milan-700'
                : 'bg-white border-milan-600/15 text-espresso-700 hover:bg-cream-100'
            }`}
            title={sidebarOpen ? 'Collapse Explorer' : 'Expand Explorer'}
            aria-label="Toggle Challenge Explorer"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="text-[11px] hidden md:inline">Labs ({REAL_CHALLENGES.length})</span>
          </button>

          {/* Challenge Title & Badges */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <h1 className="text-xs sm:text-sm font-extrabold text-espresso-900 truncate">
              {selectedChallenge.title}
            </h1>

            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-[#1C0D12] text-amber-200 flex-shrink-0">
              {selectedChallenge.language}
            </span>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 hidden sm:inline-block ${
                selectedChallenge.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : selectedChallenge.difficulty === 'Medium'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {selectedChallenge.difficulty}
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Draft Save Status Indicator */}
          <div className="items-center gap-1.5 text-[11px] text-espresso-muted hidden lg:flex font-mono pr-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-600 animate-pulse">
                <Save className="w-3.5 h-3.5" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-700">
                <Check className="w-3.5 h-3.5" /> Draft Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-espresso-muted">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Unsaved
              </span>
            )}
          </div>

          {/* Reset Starter Code */}
          <button
            onClick={handleResetStarter}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-milan-600/20 bg-white hover:bg-cream-100 text-espresso-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-milan-600" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* View Answer Button (Hidden by default, reveals modal on click) */}
          <button
            onClick={() => setIsAnswerModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-milan-600/25 bg-white hover:bg-milan-50 text-xs font-bold text-espresso-900 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="View standard reference solution"
            id="practice-view-answer-btn"
          >
            <Eye className="w-3.5 h-3.5 text-milan-600" />
            <span className="hidden sm:inline">View Answer</span>
          </button>

          {/* Run Automated Tests */}
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="glow-button text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold rounded-xl cursor-pointer shadow-sm"
            id="practice-run-tests-btn"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'Testing...' : 'Run Tests'}</span>
          </button>

          {/* Submit for Evidence (Enabled when tests pass) */}
          {evaluation?.success && !evidenceRecorded && (
            <button
              onClick={handleSubmitEvidence}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all animate-bounce"
              id="practice-submit-evidence-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Evidence</span>
            </button>
          )}

          {/* Toggle Instructions/Results Panel */}
          <button
            onClick={() => setInfoPanelOpen(!infoPanelOpen)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors hidden sm:flex items-center gap-1 ${
              infoPanelOpen
                ? 'bg-milan-50 border-milan-600/30 text-milan-700'
                : 'bg-white border-milan-600/15 text-espresso-700 hover:bg-cream-100'
            }`}
            title={infoPanelOpen ? 'Collapse Instructions Panel' : 'Expand Instructions Panel'}
            aria-label="Toggle Instructions Panel"
          >
            {infoPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER ─────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT PANEL: CHALLENGE EXPLORER ─────────────────────────── */}
        <aside
          className={`w-full sm:w-80 md:w-88 xl:w-96 bg-white border-r border-milan-600/15 flex flex-col flex-shrink-0 z-20 ${
            sidebarOpen ? 'sm:flex' : 'sm:hidden'
          } ${mobileTab === 'explorer' ? 'flex' : 'hidden sm:flex'}`}
        >
            {/* Search & Filter Header */}
            <div className="p-3.5 border-b border-milan-600/10 space-y-2.5 bg-cream-50/50">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-espresso-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search labs, topics, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-milan-600/20 rounded-xl text-xs text-espresso-900 placeholder:text-espresso-muted/60 focus:outline-none focus:border-milan-600"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter === cat
                        ? 'bg-milan-600 text-white shadow-2xs'
                        : 'bg-white text-espresso-700 border border-milan-600/15 hover:border-milan-600/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Challenge List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((ch) => {
                  const isSelected = selectedChallenge.id === ch.id;
                  const chCompleted = completedChallengeIds.has(ch.id) || ch.completed;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChallenge(ch)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-milan-600 bg-milan-50/80 shadow-xs'
                          : 'border-milan-600/10 bg-white hover:border-milan-600/30 hover:bg-cream-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-milan-700' : 'text-espresso-900'}`}>
                          {ch.title}
                        </span>
                        {chCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-[#1C0D12] text-amber-200">
                          {ch.language}
                        </span>
                        <span className="text-espresso-muted truncate font-medium">
                          {ch.skill}
                        </span>
                        <span className="ml-auto font-bold text-slate-400">
                          {ch.difficulty}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-espresso-muted">
                  No labs match the filter &ldquo;{searchQuery || activeFilter}&rdquo;.
                </div>
              )}
            </div>

            {/* Footer Stats Strip */}
            <div className="p-3 bg-cream-100/60 border-t border-milan-600/10 flex items-center justify-between text-[11px] text-espresso-muted font-mono">
              <span>Completed: {completedChallengeIds.size} / {REAL_CHALLENGES.length}</span>
              <span className="text-milan-700 font-bold">30% Evidence Weight</span>
            </div>
          </aside>

        {/* ── CENTER PANEL: MODERN CODE EDITOR (VISUAL CENTERPIECE) ─── */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-[#1C0D12] relative ${
            mobileTab === 'editor' ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {/* Evidence Success Banner */}
          {evidenceRecorded && (
            <div className="bg-emerald-900/90 text-white p-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/40 z-10 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <strong className="block text-emerald-200">Evidence Sealed &amp; Stored to Skill Passport!</strong>
                  <span className="font-mono text-[11px] text-emerald-300 truncate max-w-md block">
                    SHA-256 Hash: {recordedHash}
                  </span>
                </div>
              </div>
              <Link
                href="/skill-growth"
                className="px-3 py-1 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Passport Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="flex-1 relative">
            <PracticeEditor
              value={code}
              language={selectedChallenge.language}
              onChange={handleCodeChange}
            />
          </div>
        </main>

        {/* ── RIGHT PANEL: INSTRUCTIONS & TEST SUITE RESULTS ─────────── */}
        <aside
          className={`w-full sm:w-96 md:w-[420px] xl:w-[460px] bg-white border-l border-milan-600/15 flex flex-col flex-shrink-0 z-20 shadow-xs ${
            infoPanelOpen ? 'sm:flex' : 'sm:hidden'
          } ${mobileTab === 'info' ? 'flex' : 'hidden sm:flex'}`}
        >
            {/* Panel Tabs Header */}
            <div className="flex items-center border-b border-milan-600/15 bg-cream-50/60 px-3 pt-2">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'instructions'
                    ? 'border-milan-600 text-milan-700 bg-white rounded-t-lg'
                    : 'border-transparent text-espresso-muted hover:text-espresso-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Instructions</span>
              </button>

              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  activeTab === 'results'
                    ? 'border-milan-600 text-milan-700 bg-white rounded-t-lg'
                    : 'border-transparent text-espresso-muted hover:text-espresso-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Test Suite</span>
                {evaluation && (
                  <span
                    className={`w-2 h-2 rounded-full ml-0.5 ${
                      evaluation.success ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('criteria')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'criteria'
                    ? 'border-milan-600 text-milan-700 bg-white rounded-t-lg'
                    : 'border-transparent text-espresso-muted hover:text-espresso-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Evaluation</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-milan-600 block mb-1">
                      {selectedChallenge.skill} Challenge
                    </span>
                    <h2 className="text-base font-extrabold text-espresso-900 leading-tight">
                      {selectedChallenge.title}
                    </h2>
                    <p className="text-xs text-espresso-muted mt-2 leading-relaxed">
                      {selectedChallenge.description}
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="p-3.5 bg-cream-50 rounded-2xl border border-milan-600/15 space-y-2">
                    <h3 className="text-xs font-extrabold text-espresso-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-milan-600" />
                      Engineering Requirements:
                    </h3>
                    <ul className="space-y-1.5 text-xs text-espresso-muted">
                      {selectedChallenge.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-milan-600 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Behavior */}
                  <div className="p-3.5 bg-white rounded-2xl border border-milan-600/15 text-xs space-y-1">
                    <span className="font-bold text-espresso-900 block">Expected System Behavior:</span>
                    <p className="text-espresso-muted leading-relaxed">
                      {selectedChallenge.expectedBehavior}
                    </p>
                  </div>

                  {/* Starter code guidance */}
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                    <strong>Getting Started:</strong> Implement the required function or styles in the center code editor. The starter code contains scaffolding and TODO markers. When ready, click &ldquo;Run Tests&rdquo; above.
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-4 font-mono">
                  {evaluation ? (
                    <div className="space-y-3">
                      {/* Overall Status Card */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between ${
                          evaluation.success
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {evaluation.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                          )}
                          <div>
                            <span className="text-xs font-bold block">
                              {evaluation.success ? 'All Assertion Tests Passed!' : 'Tests Incomplete or Failing'}
                            </span>
                            <span className="text-[11px]">
                              {evaluation.passedTests} of {evaluation.totalTests} tests passed ({evaluation.percentage}%)
                            </span>
                          </div>
                        </div>

                        {evaluation.success && !evidenceRecorded && (
                          <button
                            onClick={handleSubmitEvidence}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
                          >
                            Submit
                          </button>
                        )}
                      </div>

                      {/* Individual Test Cases */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-espresso-900 font-sans block">
                          Automated Assertion Results:
                        </span>

                        {evaluation.results.map((r) => (
                          <div
                            key={r.testNumber}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              r.passed
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-rose-50/50 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-espresso-900">
                                Test #{r.testNumber}: {r.passed ? '✓ Passed' : '❌ Failed'}
                              </span>
                              <span className="text-[10px] text-slate-400">{selectedChallenge.language}</span>
                            </div>

                            <p className="text-[11px] text-espresso-muted">
                              <strong>Input:</strong> {r.description}
                            </p>
                            <p className="text-[11px] text-espresso-muted">
                              <strong>Expected:</strong> {r.expected}
                            </p>
                            {r.actual && (
                              <p className={`text-[11px] ${r.passed ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                                <strong>Actual:</strong> {r.actual}
                              </p>
                            )}
                            {r.error && (
                              <p className="text-[10px] text-rose-600 bg-rose-100/60 p-1.5 rounded mt-1">
                                {r.error}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Execution Console Output */}
                      <div className="border border-milan-600/15 rounded-2xl bg-[#1C0D12] p-3 text-[11px] text-amber-200 overflow-x-auto">
                        <span className="text-slate-400 block mb-1 font-bold">Execution Telemetry Console:</span>
                        {evaluation.logs.map((log, idx) => (
                          <div key={idx} className="whitespace-pre-wrap">{log}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-espresso-muted space-y-2 font-sans">
                      <Terminal className="w-8 h-8 text-milan-600 mx-auto" />
                      <p className="font-bold text-espresso-900">No Tests Executed Yet</p>
                      <p>Click &ldquo;Run Tests&rdquo; in the top bar to run automated test assertions on your code.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'criteria' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-espresso-900 uppercase tracking-wider mb-2">
                      Formal Rubric &amp; Evaluation Dimensions
                    </h3>
                    <p className="text-xs text-espresso-muted leading-relaxed">
                      Submissions are verified against three engineering dimensions to ensure production readiness:
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-cream-50 rounded-2xl border border-milan-600/15 space-y-1">
                      <strong className="text-espresso-900 block">1. Correctness:</strong>
                      <p className="text-espresso-muted">{selectedChallenge.evaluationCriteria.correctness}</p>
                    </div>

                    <div className="p-3 bg-cream-50 rounded-2xl border border-milan-600/15 space-y-1">
                      <strong className="text-espresso-900 block">2. Edge Case Handling:</strong>
                      <p className="text-espresso-muted">{selectedChallenge.evaluationCriteria.edgeCases}</p>
                    </div>

                    <div className="p-3 bg-cream-50 rounded-2xl border border-milan-600/15 space-y-1">
                      <strong className="text-espresso-900 block">3. Code Quality:</strong>
                      <p className="text-espresso-muted">{selectedChallenge.evaluationCriteria.codeQuality}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-milan-600/15 text-xs text-espresso-muted space-y-1.5">
                    <span className="font-bold text-espresso-900 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-milan-600" />
                      Mapped Passport Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedChallenge.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-cream-100 text-espresso-800 font-semibold border border-milan-600/15 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
      </div>

      {/* ── MOBILE WORKSPACE BOTTOM BAR ───────────────────────────── */}
      <nav
        className="sm:hidden h-12 bg-white border-t border-milan-600/15 flex items-center justify-around px-2 z-30 flex-shrink-0 shadow-xs"
        aria-label="Mobile workspace view tabs"
      >
        <button
          type="button"
          onClick={() => setMobileTab('explorer')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold gap-0.5 ${
            mobileTab === 'explorer' ? 'text-milan-600' : 'text-espresso-muted'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Labs ({REAL_CHALLENGES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold gap-0.5 ${
            mobileTab === 'editor' ? 'text-milan-600' : 'text-espresso-muted'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Code Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('info')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold gap-0.5 relative ${
            mobileTab === 'info' ? 'text-milan-600' : 'text-espresso-muted'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Tests &amp; Info</span>
          {evaluation && (
            <span
              className={`w-2 h-2 rounded-full absolute top-1.5 right-6 ${
                evaluation.success ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          )}
        </button>
      </nav>

      {/* ── MODALS ───────────────────────────────────────────────────── */}
      {/* 1. View Answer Modal (Hidden until learner clicks 'View Answer') */}
      <ViewAnswerModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        challenge={selectedChallenge}
      />

      {/* 2. Discard Unsaved Changes Confirmation Dialog */}
      {discardConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-milan-600/30 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-espresso-900">Unsaved Changes</h3>
                <p className="text-xs text-espresso-muted">You have modified this lab.</p>
              </div>
            </div>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Switching to <strong>{pendingChallenge?.title}</strong> now will discard your unsaved edits. Would you like to proceed?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDiscardConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-milan-600/20 text-xs font-semibold text-espresso-700 hover:bg-cream-100"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmSwitchChallenge}
                className="px-3.5 py-1.5 rounded-xl bg-milan-600 hover:bg-milan-700 text-white text-xs font-bold"
              >
                Switch Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
