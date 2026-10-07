'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  Lock,
  BookOpen,
  Code2,
  Sparkles,
  Send,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Terminal,
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import { COURSES } from '@/data';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'lab' | 'quiz';
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  number: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  lessons: Lesson[];
}

const MODULES_DATA: Module[] = [
  {
    id: 'm1',
    number: '01',
    title: 'Web Fundamentals & Architecture',
    status: 'completed',
    lessons: [
      { id: 'l1-1', title: 'How the Web Works: DNS, HTTP, Client-Server', type: 'video', duration: '18 min', completed: true },
      { id: 'l1-2', title: 'Browser Rendering Engine & DOM Tree', type: 'video', duration: '22 min', completed: true },
      { id: 'l1-3', title: 'Web Architecture Knowledge Check', type: 'quiz', duration: '15 min', completed: true },
    ],
  },
  {
    id: 'm2',
    number: '02',
    title: 'Semantic HTML & Modern CSS',
    status: 'completed',
    lessons: [
      { id: 'l2-1', title: 'Semantic HTML5 Elements & Accessibility', type: 'video', duration: '24 min', completed: true },
      { id: 'l2-2', title: 'CSS Flexbox & Grid Masterclass', type: 'video', duration: '35 min', completed: true },
      { id: 'l2-3', title: 'Responsive Layout Challenge', type: 'lab', duration: '45 min', completed: true },
    ],
  },
  {
    id: 'm3',
    number: '03',
    title: 'JavaScript Core Principles',
    status: 'completed',
    lessons: [
      { id: 'l3-1', title: 'Data Types, Scope & Execution Context', type: 'video', duration: '28 min', completed: true },
      { id: 'l3-2', title: 'Functions, Hoisting & Closures', type: 'video', duration: '30 min', completed: true },
      { id: 'l3-3', title: 'DOM Manipulation & Event Listeners', type: 'lab', duration: '40 min', completed: true },
    ],
  },
  {
    id: 'm4',
    number: '04',
    title: 'Advanced JavaScript & Async Programming',
    status: 'current',
    lessons: [
      { id: 'l4-1', title: 'Prototypes, Classes & OOP in JS', type: 'video', duration: '26 min', completed: true },
      { id: 'l4-2', title: 'Promises, Async/Await & Event Loop', type: 'video', duration: '34 min', completed: false },
      { id: 'l4-3', title: 'API Fetching & Error Handling Lab', type: 'lab', duration: '50 min', completed: false },
    ],
  },
  {
    id: 'm5',
    number: '05',
    title: 'React Fundamentals & Component Architecture',
    status: 'locked',
    lessons: [
      { id: 'l5-1', title: 'JSX, Props and Virtual DOM', type: 'video', duration: '30 min', completed: false },
      { id: 'l5-2', title: 'Hooks: useState and useEffect', type: 'video', duration: '38 min', completed: false },
      { id: 'l5-3', title: 'Interactive Dashboard Component Lab', type: 'lab', duration: '60 min', completed: false },
    ],
  },
  {
    id: 'm6',
    number: '06',
    title: 'Backend with Node.js & Express',
    status: 'locked',
    lessons: [
      { id: 'l6-1', title: 'Node.js Runtime & NPM Packages', type: 'video', duration: '28 min', completed: false },
      { id: 'l6-2', title: 'RESTful API Design with Express', type: 'video', duration: '40 min', completed: false },
    ],
  },
];

export default function LearningPage() {
  const [activeModuleIndex, setActiveModuleIndex] = useState(3); // Module 4
  const [activeLessonId, setActiveLessonId] = useState('l4-2');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    'l1-1', 'l1-2', 'l1-3', 'l2-1', 'l2-2', 'l2-3', 'l3-1', 'l3-2', 'l3-3', 'l4-1'
  ]);
  const [activeTab, setActiveTab] = useState<'notes' | 'sandbox' | 'takeaways'>('notes');
  const [showCompletionSuccess, setShowCompletionSuccess] = useState(false);

  // AI Tutor State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Namaste Arjun! I am your SEVA AI Learning Assistant. We are currently exploring Promises, Async/Await and the JS Event Loop. How can I help clarify anything today?',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Sandbox Code State
  const [codeContent, setCodeContent] = useState(`// Try running this async demonstration
async function fetchUserSkillPassport(candidateId) {
  console.log("Connecting to SEVA Competency Registry...");
  
  // Simulate network latency
  const response = await new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: candidateId,
        name: "Arjun Sharma",
        competencyScore: 87,
        status: "Active"
      });
    }, 600);
  });
  
  return response;
}

fetchUserSkillPassport("GSP-DEMO-001")
  .then(data => console.log("Evidence fetched:", data))
  .catch(err => console.error("Error:", err));`);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);

  const handleRunCode = () => {
    setSandboxOutput(
      `> Connecting to SEVA Competency Registry...\n> Evidence fetched: {\n    id: 'GSP-DEMO-001',\n    name: 'Arjun Sharma',\n    competencyScore: 87,\n    status: 'Active'\n  }\n> Execution completed in 612ms with 0 errors.`
    );
  };

  const handleAskAI = (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInputQuestion('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();
      if (lower.includes('event loop') || lower.includes('loop')) {
        reply =
          'The JavaScript Event Loop manages asynchronous execution. JS has a single call stack. When an async task (like setTimeout or fetch) completes, its callback sits in the Macro/Microtask Queue. Once the call stack is empty, the Event Loop pushes the callback onto the stack!';
      } else if (lower.includes('async') || lower.includes('await') || lower.includes('promise')) {
        reply =
          'A Promise represents a future value with 3 states: Pending, Fulfilled, or Rejected. "async/await" is syntactic sugar on top of Promises, allowing you to write asynchronous code that reads like synchronous procedural code without callback hell.';
      } else if (lower.includes('evidence') || lower.includes('passport')) {
        reply =
          'When you complete this lesson and pass the associated lab challenge, your performance generates verified telemetry that updates your Skill Passport JavaScript score!';
      } else {
        reply =
          `Great question regarding "${q}". In production web engineering, mastering asynchronous data flow ensures responsive user interfaces without blocking the browser main thread. Would you like a code snippet example?`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsAiTyping(false);
    }, 600);
  };

  const handleMarkComplete = () => {
    if (!completedLessonIds.includes(activeLessonId)) {
      setCompletedLessonIds((prev) => [...prev, activeLessonId]);
      setShowCompletionSuccess(true);
      setTimeout(() => setShowCompletionSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Learning Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">Module 04</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Full Stack Developer Programme</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-navy-900 leading-tight">
                Promises, Async/Await & Event Loop
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-slate-500">Course Progress:</span>
              <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
              <span className="font-bold text-navy-900">68%</span>
            </div>

            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                completedLessonIds.includes(activeLessonId)
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedLessonIds.includes(activeLessonId) ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </header>

      {/* Completion Toast Banner */}
      {showCompletionSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2 transition-all">
          <Award className="w-4 h-4" />
          Lesson completed! +10 XP awarded towards your JavaScript Skill Passport evidence.
        </div>
      )}

      {/* Main Grid: Sidebar + Content Player + AI Tutor */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Modules & Lessons Navigator (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center justify-between">
              <span>Curriculum Outline</span>
              <span className="text-xs font-normal text-slate-500">12 Modules</span>
            </h2>

            <div className="space-y-2 text-sm">
              {MODULES_DATA.map((mod, idx) => {
                const isOpen = activeModuleIndex === idx;
                return (
                  <div key={mod.id} className="border border-slate-200/80 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setActiveModuleIndex(isOpen ? -1 : idx)}
                      className={`w-full p-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                        isOpen ? 'bg-navy-50/60 font-semibold text-navy-900' : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-mono font-bold text-slate-400">{mod.number}</span>
                        <span className="text-xs truncate">{mod.title}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="bg-slate-50/50 p-2 space-y-1 border-t border-slate-100">
                        {mod.lessons.map((lesson) => {
                          const isDone = completedLessonIds.includes(lesson.id);
                          const isCurrent = activeLessonId === lesson.id;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLessonId(lesson.id)}
                              className={`w-full text-left p-2 rounded-md flex items-center gap-2 text-xs transition-colors ${
                                isCurrent
                                  ? 'bg-navy-900 text-white font-medium shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-300' : 'text-emerald-500'} flex-shrink-0`} />
                              ) : lesson.type === 'lab' ? (
                                <Code2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              )}
                              <span className="truncate flex-1">{lesson.title}</span>
                              <span className={`text-[10px] ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                                {lesson.duration}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick link to practice */}
          <div className="bg-navy-900 text-white rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-saffron-400 mb-1">
              Ready to code?
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              Put this lesson into practice in our interactive coding labs.
            </p>
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Open Coding Labs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Center Column: Video Player & Tabs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Video Player Mockup */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-800 text-white aspect-video relative flex flex-col justify-between p-4 group">
            {/* Top controls preview */}
            <div className="flex items-center justify-between text-xs text-slate-300 z-10">
              <span className="bg-black/50 px-2 py-0.5 rounded font-mono">1080p HD</span>
              <span className="bg-black/50 px-2 py-0.5 rounded">Module 4 • Lesson 2</span>
            </div>

            {/* Big center play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-navy-600/90 group-hover:bg-navy-600 flex items-center justify-center text-white cursor-pointer transition-transform group-hover:scale-105 shadow-xl">
                <Play className="w-7 h-7 ml-1" />
              </div>
            </div>

            {/* Bottom playback bar */}
            <div className="space-y-2 z-10 bg-gradient-to-t from-black/80 to-transparent p-2 -mx-2 -mb-2">
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                <div className="bg-saffron-500 h-full w-2/5" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px]">13:45 / 34:10</span>
                  <span className="text-[11px] text-slate-400">Promises & Event Loop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/10 cursor-pointer">1.0x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Lesson Workspace Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 flex">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'border-navy-900 text-navy-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Lesson Notes & Concepts
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sandbox'
                    ? 'border-navy-900 text-navy-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Interactive Code Sandbox
              </button>
              <button
                onClick={() => setActiveTab('takeaways')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'takeaways'
                    ? 'border-navy-900 text-navy-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Key Competencies
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <h3 className="font-bold text-navy-900 text-base">
                    Understanding Asynchronous Execution in JavaScript
                  </h3>
                  <p>
                    JavaScript is inherently single-threaded, running on a single call stack. However, browser environments provide Web APIs (like Fetch, Timers, and DOM Events) that operate concurrently.
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                    <p className="font-semibold">Key Rule of Promises:</p>
                    <p>
                      Promises transition from <strong>Pending</strong> to either <strong>Fulfilled</strong> (with value) or <strong>Rejected</strong> (with error). They are settled only once.
                    </p>
                  </div>
                  <h4 className="font-bold text-navy-900 pt-2">Why Async/Await Matters</h4>
                  <p>
                    Async functions return a Promise implicitly. Using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">await</code> pauses the execution inside the async function without blocking the main browser thread, simplifying complex nested chains.
                  </p>
                </div>
              )}

              {activeTab === 'sandbox' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" /> async-sandbox.js
                    </span>
                    <button
                      onClick={handleRunCode}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Run Code
                    </button>
                  </div>

                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    rows={8}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-600 leading-relaxed resize-none"
                  />

                  {sandboxOutput && (
                    <div className="p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg whitespace-pre-wrap border border-slate-800">
                      {sandboxOutput}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'takeaways' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-navy-900 block mb-1">1. Event Loop Mechanics</span>
                    <p className="text-slate-600">
                      Call Stack executes synchronous frames. Microtasks (Promise handlers) are flushed immediately after each task before Macrotasks (setTimeout).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-navy-900 block mb-1">2. Error Handling Best Practice</span>
                    <p className="text-slate-600">
                      Always wrap <code className="font-mono">await</code> calls inside <code className="font-mono">try...catch</code> blocks to prevent uncaught runtime rejections.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-navy-900 block mb-1">3. Skill Passport Telemetry</span>
                    <p className="text-slate-600">
                      This unit maps directly to the &ldquo;Asynchronous JS & APIs&rdquo; sub-competency on your official Skill Passport.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SEVA AI Tutor (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-[560px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* AI Header */}
          <div className="p-3.5 bg-navy-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-saffron-500 flex items-center justify-center text-navy-950">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">SEVA AI Tutor</h3>
                <span className="text-[10px] text-saffron-300">Contextual Learning Assistant</span>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1 text-[11px]">
            <button
              onClick={() => handleAskAI('Explain Event Loop in simple terms')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition-colors"
            >
              Event Loop?
            </button>
            <button
              onClick={() => handleAskAI('Why use async/await over promises?')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition-colors"
            >
              Async/await vs Promise?
            </button>
            <button
              onClick={() => handleAskAI('How does this affect my Skill Passport score?')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition-colors"
            >
              Passport score impact?
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg max-w-[90%] leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-navy-900 text-white'
                    : 'mr-auto bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isAiTyping && (
              <div className="p-2.5 rounded-lg max-w-[80%] bg-slate-100 text-slate-500 text-xs italic">
                SEVA AI Tutor is thinking...
              </div>
            )}
          </div>

          {/* AI Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI();
            }}
            className="p-2.5 border-t border-slate-200 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-navy-600"
            />
            <button
              type="submit"
              className="p-2 bg-navy-900 text-white rounded-lg hover:bg-navy-950 transition-colors"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
