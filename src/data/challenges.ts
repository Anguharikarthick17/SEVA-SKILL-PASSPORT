export interface TestCase {
  id?: string;
  input: string;
  expected: string;
  description?: string;
}

export interface ChallengeDefinition {
  id: string;
  moduleId: string;
  title: string;
  skill: string;
  skills: string[]; // Multi-skill mapping
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'javascript' | 'typescript' | 'sql' | 'css' | 'bash';
  description: string;
  requirements: string[];
  expectedBehavior: string;
  starterCode: string;
  referenceSolution?: string;
  solutionOutput: string;
  testCases: TestCase[];
  evaluationCriteria: {
    correctness: string;
    edgeCases: string;
    codeQuality: string;
  };
  completed?: boolean;
}

export const REAL_CHALLENGES: ChallengeDefinition[] = [
  // -------------------------------------------------------------------------
  // MODULE 01: WEB FUNDAMENTALS
  // -------------------------------------------------------------------------
  {
    id: 'ch-web-01',
    moduleId: 'mod-01',
    title: 'Explain the lifecycle of a web request',
    skill: 'Web Fundamentals',
    skills: ['Web Fundamentals', 'HTTP', 'Networking'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement a request lifecycle simulator function traceRequestLifecycle(url) that outputs the sequential milestones of an HTTP request: DNS lookup, TCP handshake, TLS negotiation, HTTP request transmission, server processing, and browser DOM rendering.',
    requirements: [
      'Parse the protocol and hostname from the provided URL.',
      'Return an ordered array of lifecycle stages with timing estimates.',
      'Include TLS handshake stage only if protocol is https.',
      'Flag whether compression (gzip/brotli) was negotiated via headers.'
    ],
    expectedBehavior: 'Returns an array of strings representing the chronologically ordered stages of the web request lifecycle.',
    starterCode: "function traceRequestLifecycle(url, options = {}) {\n  // TODO: Implement the request lifecycle simulator\n  // 1. Parse the protocol and hostname from url using new URL(url)\n  // 2. Return an array of ordered milestones:\n  //    - 'DNS resolution for ' + hostname\n  //    - 'TCP 3-way handshake (SYN, SYN-ACK, ACK)'\n  //    - 'TLS 1.3 cryptographic handshake' (ONLY if protocol is 'https:')\n  //    - 'HTTP ' + (options.method || 'GET') + ' request dispatched'\n  //    - 'Server executes business logic & database query'\n  //    - 'HTTP response stream received (Status 200)'\n  //    - 'Browser Critical Rendering Path: DOM -> CSSOM -> Render Tree -> Paint'\n\n  return [];\n}",
    referenceSolution: `function traceRequestLifecycle(url, options = {}) {
  // Your code here:
  // Parse url and return array of lifecycle steps
  const parsed = new URL(url);
  const steps = [
    'DNS resolution for ' + parsed.hostname,
    'TCP 3-way handshake (SYN, SYN-ACK, ACK)'
  ];

  if (parsed.protocol === 'https:') {
    steps.push('TLS 1.3 cryptographic handshake');
  }

  steps.push('HTTP ' + (options.method || 'GET') + ' request dispatched');
  steps.push('Server executes business logic & database query');
  steps.push('HTTP response stream received (Status 200)');
  steps.push('Browser Critical Rendering Path: DOM -> CSSOM -> Render Tree -> Paint');

  return steps;
}`,
    solutionOutput: `Step 1: DNS resolution\nStep 2: TCP handshake\nStep 3: TLS 1.3 handshake\nStep 4: HTTP GET dispatched\nStep 5: Server processing\nStep 6: Response stream received\nStep 7: Browser render complete.\nAll 3 assertion tests passed!`,
    testCases: [
      { input: "traceRequestLifecycle('https://seva.skillpassport.in')", expected: '7 stages including TLS handshake' },
      { input: "traceRequestLifecycle('http://insecure.local')", expected: '6 stages without TLS handshake' }
    ],
    evaluationCriteria: {
      correctness: 'Correct sequence of networking and browser rendering stages.',
      edgeCases: 'Handles both http and https protocols properly.',
      codeQuality: 'Modular and clean array transformation.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 02: HTML & CSS
  // -------------------------------------------------------------------------
  {
    id: 'ch-css-01',
    moduleId: 'mod-02',
    title: 'Fix a Broken Responsive Layout',
    skill: 'HTML/CSS',
    skills: ['HTML/CSS', 'Responsive Design', 'Accessibility'],
    difficulty: 'Medium',
    language: 'css',
    description: 'A student portfolio card grid has hardcoded fixed widths causing horizontal scrollbars on mobile viewports. Refactor the CSS stylesheet using CSS Grid with auto-fit and minmax to ensure fluid responsiveness without media queries.',
    requirements: [
      'Eliminate fixed width: 1200px and float layouts.',
      'Use display: grid with repeat(auto-fit, minmax(260px, 1fr)).',
      'Add gap: 1.5rem between cards.',
      'Ensure cards do not overflow the viewport boundary.'
    ],
    expectedBehavior: 'Grid adjusts dynamically from 1 column on mobile (320px) up to 4 columns on large monitors with zero overflow.',
    starterCode: "/* Refactor this broken stylesheet to make it responsive */\n.card-grid {\n  /* BUG: Fixed width causing horizontal overflow on mobile viewports */\n  width: 1200px;\n  float: left;\n  margin: 0 auto;\n\n  /* TODO: Replace with modern responsive CSS Grid:\n   * 1. display: grid;\n   * 2. grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n   * 3. gap: 1.5rem;\n   * 4. width: 100%; max-width: 1200px; box-sizing: border-box;\n   */\n}\n\n.card {\n  width: 100%;\n  box-sizing: border-box;\n}",
    referenceSolution: `/* Refactor this broken stylesheet */
.card-grid {
  /* Replace these legacy styles: */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.card {
  width: 100%;
  box-sizing: border-box;
}`,
    solutionOutput: `Layout Verified:\n- 360px Viewport: 1 Column (320px max card width)\n- 768px Viewport: 2 Columns\n- 1200px Viewport: 4 Columns\n- Horizontal overflow: 0px\nAll responsiveness criteria satisfied!`,
    testCases: [
      { input: 'Viewport width = 360px', expected: '1 column fluid card layout' },
      { input: 'Viewport width = 1024px', expected: '3-4 column fluid grid' }
    ],
    evaluationCriteria: {
      correctness: 'Fluid columns adapt across standard device breakpoints.',
      edgeCases: 'Narrow mobile screens (320px) render without horizontal scrollbar.',
      codeQuality: 'Utilizes modern CSS Grid auto-fit and minmax patterns.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 03: JAVASCRIPT FUNDAMENTALS
  // -------------------------------------------------------------------------
  {
    id: 'ch-js-01',
    moduleId: 'mod-03',
    title: 'Array Data Transformation',
    skill: 'JavaScript',
    skills: ['JavaScript'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Given an array of student skill records, write a pure function processScores(scores, boostThreshold) that doubles scores below the threshold (capped at 100), filters out scores below 50, and returns the sorted scores in descending order.',
    requirements: [
      'Never mutate the original input array.',
      'Cap boosted scores at maximum 100.',
      'Filter out items with resulting score < 50.',
      'Sort resulting array in descending order.'
    ],
    expectedBehavior: 'Returns a new array of modified, filtered, and sorted numbers.',
    starterCode: "function processScores(scores, boostThreshold = 40) {\n  // TODO: Implement processScores\n  // 1. Never mutate original input array\n  // 2. Double scores below boostThreshold (capped at maximum 100)\n  // 3. Filter out items with resulting score < 50\n  // 4. Sort resulting array in descending order\n\n  return [];\n}",
    referenceSolution: `function processScores(scores, boostThreshold = 40) {
  // Your code here
  return scores
    .map(score => score < boostThreshold ? Math.min(100, score * 2) : score)
    .filter(score => score >= 50)
    .sort((a, b) => b - a);
}`,
    solutionOutput: `Input: [30, 85, 45, 20, 95]\nBoosted: [60, 85, 45, 40, 95]\nFiltered & Sorted: [95, 85, 60]\nAll 4 automated assertion tests passed!`,
    testCases: [
      { input: '[30, 85, 45, 20, 95], threshold=40', expected: '[95, 85, 60]' },
      { input: '[20, 15, 10], threshold=40', expected: '[]' }
    ],
    evaluationCriteria: {
      correctness: 'Produces mathematically accurate boosted and sorted array.',
      edgeCases: 'Handles empty array and boundary threshold values.',
      codeQuality: 'Functional purity with map, filter, and sort chaining.'
    },
    completed: true
  },
  {
    id: 'ch-js-02',
    moduleId: 'mod-03',
    title: 'Object Processing',
    skill: 'JavaScript',
    skills: ['JavaScript'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement aggregateCompetencies(evidenceList) that groups student evidence by skill category and computes the average score and count for each category.',
    requirements: [
      'Accept an array of objects: { skill: string, category: string, score: number }.',
      'Group entries by category (e.g. Frontend, Backend, Database).',
      'Compute average score rounded to 1 decimal place and count of evidence items.',
      'Return a summary dictionary object.'
    ],
    expectedBehavior: 'Returns a mapped object: { [category]: { averageScore: number, count: number } }.',
    starterCode: "function aggregateCompetencies(evidenceList) {\n  // TODO: Group student evidence by category and calculate statistics\n  // Input: array of { skill: string, category: string, score: number }\n  // Return format: { [category]: { averageScore: number, count: number } }\n  // Note: averageScore must be rounded to 1 decimal place\n\n  return {};\n}",
    referenceSolution: `function aggregateCompetencies(evidenceList) {
  // Your code here
  const result = {};
  
  for (const item of evidenceList) {
    if (!result[item.category]) {
      result[item.category] = { total: 0, count: 0 };
    }
    result[item.category].total += item.score;
    result[item.category].count += 1;
  }

  const finalOutput = {};
  for (const [cat, data] of Object.entries(result)) {
    finalOutput[cat] = {
      averageScore: Math.round((data.total / data.count) * 10) / 10,
      count: data.count
    };
  }

  return finalOutput;
}`,
    solutionOutput: `Category Summary:\n- Frontend: { averageScore: 89.5, count: 4 }\n- Backend: { averageScore: 82.0, count: 2 }\nAll assertion test cases passed!`,
    testCases: [
      { input: '[{category: "Frontend", score: 90}, {category: "Frontend", score: 80}]', expected: 'Frontend: { averageScore: 85, count: 2 }' }
    ],
    evaluationCriteria: {
      correctness: 'Correct grouped counts and averages.',
      edgeCases: 'Handles empty evidence lists cleanly.',
      codeQuality: 'Uses clean Object.entries / reduce methods.'
    },
    completed: false
  },
  {
    id: 'ch-js-03',
    moduleId: 'mod-03',
    title: 'Debug the Broken Function',
    skill: 'JavaScript',
    skills: ['JavaScript', 'Debugging'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'A discount calculator function computeFinalPrice(items, discountStr) produces NaN and returns incorrect totals due to string concatenation and unhandled null items. Debug and fix the function.',
    requirements: [
      'Parse discount percentage safely from strings like "15%".',
      'Filter out null or undefined items in the items array.',
      'Multiply price by quantity for each item before applying discount.',
      'Return rounded number to 2 decimal places.'
    ],
    expectedBehavior: 'Returns correct numerical final price without NaN errors.',
    starterCode: "function computeFinalPrice(items, discountStr) {\n  // TODO: Fix the bugs below in this discount calculator:\n  // 1. Parse discount percentage safely from strings like \"15%\"\n  // 2. Safely filter out null or undefined items in the items array\n  // 3. Multiply price by quantity (default 1) for each item before discount\n  // 4. Return rounded number to 2 decimal places\n\n  var discount = discountStr;\n  var total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total - discount;\n}",
    referenceSolution: `function computeFinalPrice(items, discountStr) {
  // BUGGY CODE TO FIX:
  const discountRate = parseFloat(discountStr) / 100 || 0;
  
  const subtotal = items
    .filter(item => item && typeof item.price === 'number')
    .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const finalTotal = subtotal * (1 - discountRate);
  return Math.round(finalTotal * 100) / 100;
}`,
    solutionOutput: `Test 1: Items with valid prices & '10%' discount -> Correctly calculates $45.00\nTest 2: Array containing null and undefined items -> Safely filters without crashing\nTests passed!`,
    testCases: [
      { input: '[{price: 25, quantity: 2}], discount="10%"', expected: '45' }
    ],
    evaluationCriteria: {
      correctness: 'No NaN results and accurate discount math.',
      edgeCases: 'Defensive handling against null items and missing quantities.',
      codeQuality: 'Clean immutable reduce pipeline.'
    },
    completed: false
  },

  // -------------------------------------------------------------------------
  // MODULE 04: ADVANCED JAVASCRIPT
  // -------------------------------------------------------------------------
  {
    id: 'ch-advjs-01',
    moduleId: 'mod-04',
    title: 'Convert Promise Chain to Async/Await',
    skill: 'JavaScript',
    skills: ['JavaScript', 'Async Programming'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Refactor an unreadable nested .then().catch() promise chain into a clean, modern async/await function with comprehensive try/catch error handling.',
    requirements: [
      'Convert all promise chains to await expressions.',
      'Handle API errors gracefully using try/catch.',
      'Return structured object { data, error }.'
    ],
    expectedBehavior: 'Asynchronously fetches student and evidence sequentially and returns combined payload or error.',
    starterCode: "async function fetchStudentSummary(studentId, api) {\n  // TODO: Convert Promise chain to clean async/await\n  // 1. Fetch student profile using: await api.getProfile(studentId)\n  // 2. In parallel using Promise.all:\n  //    - api.getScores(studentId)\n  //    - api.getBadges(studentId)\n  // 3. Handle errors gracefully: return { error: 'Student not found', fallback: true }\n\n  // Replace with async/await implementation:\n}",
    referenceSolution: `async function fetchStudentSummary(studentId, api) {
  try {
    const student = await api.getStudent(studentId);
    const evidence = await api.getEvidence(student.id);
    return { data: { student, evidence }, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to fetch summary' };
  }
}`,
    solutionOutput: `Refactored async/await executes cleanly:\n- Success scenario resolves combined object\n- Network failure returns graceful error wrapper\nAssertions passed!`,
    testCases: [
      { input: 'studentId="std-01", mockApi', expected: '{ data: { student, evidence }, error: null }' }
    ],
    evaluationCriteria: {
      correctness: 'Correct async/await syntax and error capture.',
      edgeCases: 'Returns error wrapper on rejection instead of unhandled promise rejection.',
      codeQuality: 'Concise, clean code structure.'
    },
    completed: false
  },
  {
    id: 'ch-advjs-02',
    moduleId: 'mod-04',
    title: 'Debug Async Code',
    skill: 'JavaScript',
    skills: ['JavaScript', 'Debugging', 'Async Programming'],
    difficulty: 'Hard',
    language: 'javascript',
    description: 'Fix a race condition in a multi-step search function where slower network responses from older queries overwrite newer search results on screen.',
    requirements: [
      'Maintain an active query version counter or use AbortController.',
      'Discard responses if a newer search query was initiated before this response returned.',
      'Prevent stale data from overwriting current state.'
    ],
    expectedBehavior: 'Only the latest search request updates the final result state.',
    starterCode: "class AsyncSearchEngine {\n  constructor(fetcher) {\n    this.fetcher = fetcher;\n    this.latestQueryId = 0;\n  }\n\n  async search(query) {\n    // TODO: Fix the race condition in async search\n    // Fast keystrokes can cause earlier slow requests to resolve AFTER later fast requests.\n    // Ensure only results from the most recent search query are returned or updated.\n\n    return [];\n  }\n}",
    referenceSolution: `class AsyncSearchEngine {
  constructor(fetcher) {
    this.fetcher = fetcher;
    this.currentQueryId = 0;
    this.latestResult = null;
  }

  async search(searchTerm) {
    const queryId = ++this.currentQueryId;
    const result = await this.fetcher(searchTerm);

    // Guard against stale response race conditions
    if (queryId === this.currentQueryId) {
      this.latestResult = result;
      return result;
    }
    return null; // Discard stale response
  }
}`,
    solutionOutput: `Race Condition Test:\n- Query 1 dispatched (delayed 300ms)\n- Query 2 dispatched (delayed 100ms)\n- Query 2 completes first -> State updated\n- Query 1 completes later -> Safely ignored!\nVerified zero stale state overwrites.`,
    testCases: [
      { input: 'Out-of-order async resolutions', expected: 'Only latest query updates engine' }
    ],
    evaluationCriteria: {
      correctness: 'Eliminates race condition through query ID version tagging.',
      edgeCases: 'Handles rapidly typed queries without memory leaks.',
      codeQuality: 'Encapsulated class design with clean state management.'
    },
    completed: false
  },
  {
    id: 'ch-advjs-03',
    moduleId: 'mod-04',
    title: 'Implement Debounced Search',
    skill: 'JavaScript',
    skills: ['JavaScript', 'Async Programming'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement a reusable debounce(fn, delay) utility that delays invoking the callback until after the specified delay has passed since the last invocation.',
    requirements: [
      'Return a wrapped function that resets the internal timer on each call.',
      'Execute the callback with latest arguments once the timer expires.',
      'Support cancellation via debounced.cancel() method.'
    ],
    expectedBehavior: 'Rapid calls within delay window execute only once at the end.',
    starterCode: "function debounce(fn, delay = 300) {\n  // TODO: Implement debounce higher-order function\n  // 1. Return a wrapper function that delays execution of fn\n  // 2. Reset timer if called again within delay window\n  // 3. Preserve 'this' context and forward all arguments\n  // 4. Provide a .cancel() method on the returned function\n\n  return function (...args) {};\n}",
    referenceSolution: `function debounce(fn, delay = 300) {
  let timerId = null;

  const debounced = function(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}`,
    solutionOutput: `Debounce Test:\n- 10 rapid keystrokes fired in 150ms\n- Handler fired exactly 1 time after 300ms idle period.\n- Cancel method verified.\nAll test cases passed!`,
    testCases: [
      { input: '10 calls in 100ms, delay=300ms', expected: 'Callback called 1 time' }
    ],
    evaluationCriteria: {
      correctness: 'Correct timer clearing and delayed callback execution.',
      edgeCases: 'Cancels cleanly when cancel() is called.',
      codeQuality: 'Preserves this context and arguments via apply.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 05: REACT
  // -------------------------------------------------------------------------
  {
    id: 'ch-react-01',
    moduleId: 'mod-05',
    title: 'Build a reusable React component',
    skill: 'React',
    skills: ['React', 'Frontend'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Create a reusable Badge component supporting variant styles (success, warning, danger, neutral), an optional leading icon, and accessible screen-reader labels.',
    requirements: [
      'Accept props: label, variant, icon, and ariaLabel.',
      'Apply appropriate tailwind or CSS class maps based on variant.',
      'Render icon cleanly with aria-hidden="true".'
    ],
    expectedBehavior: 'Renders accessible, styled badge component with flexible variant coloring.',
    starterCode: "import React from 'react';\n\nfunction Badge({ label, variant = 'neutral', icon = null, ariaLabel }) {\n  // TODO: Build an accessible, reusable Badge component\n  // 1. Support variants: 'neutral', 'success', 'warning', 'danger'\n  // 2. Apply appropriate styling and contrast\n  // 3. Render icon if provided\n  // 4. Ensure proper accessibility attributes (role=\"status\", aria-label)\n\n  return (\n    <div>{/* Badge markup */}</div>\n  );\n}",
    referenceSolution: `function Badge({ label, variant = 'neutral', icon = null, ariaLabel }) {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  return (
    <span 
      className={\`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border \${variantStyles[variant] || variantStyles.neutral}\`}
      aria-label={ariaLabel || label}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}`,
    solutionOutput: `Rendered Component Verification:\n- variant="success" -> Emerald badge with icon\n- Accessibility check: Passes WCAG contrast ratio (5.2:1)\nComponent rendered cleanly with 0 console warnings.`,
    testCases: [
      { input: 'label="Verified", variant="success"', expected: 'Emerald badge element' }
    ],
    evaluationCriteria: {
      correctness: 'Applies correct styling for all variant props.',
      edgeCases: 'Defaults gracefully to neutral when variant is unknown.',
      codeQuality: 'Semantic HTML markup and accessible attributes.'
    },
    completed: true
  },
  {
    id: 'ch-react-02',
    moduleId: 'mod-05',
    title: 'Manage form state',
    skill: 'React',
    skills: ['React', 'Frontend'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Build a controlled React form component managing title, priority, and due date with client-side validation rules and submit disable states.',
    requirements: [
      'Use useState to manage single form state object.',
      'Validate that title is at least 3 characters and due date is in the future.',
      'Disable submit button until form is valid.',
      'Display inline validation error messages.'
    ],
    expectedBehavior: 'Controlled form updates dynamically and blocks invalid submissions.',
    starterCode: "import { useState } from 'react';\n\nfunction TaskForm({ onSubmit }) {\n  // TODO: Implement controlled form with validation\n  // 1. Track title (string), priority ('low' | 'medium' | 'high'), and due date\n  // 2. Validate title: min 3 chars, required\n  // 3. Display error message if invalid\n  // 4. Call onSubmit({ title, priority, dueDate }) on valid submit and reset form\n\n  return (\n    <form>{/* Form controls */}</form>\n  );\n}",
    referenceSolution: `import { useState } from 'react';

function TaskForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Inputs with value and onChange handlers */}
    </form>
  );
}`,
    solutionOutput: `Form Validation Test:\n- Empty title -> Displays validation message\n- Valid form submission -> Invokes onSubmit with payload\nForm state validated successfully.`,
    testCases: [
      { input: 'title="ab"', expected: 'Validation error: Title must be at least 3 characters' }
    ],
    evaluationCriteria: {
      correctness: 'Controlled input values and validation logic.',
      edgeCases: 'Prevents empty or whitespace-only submissions.',
      codeQuality: 'Clean state separation and event handlers.'
    },
    completed: false
  },
  {
    id: 'ch-react-03',
    moduleId: 'mod-05',
    title: 'Fetch and display API data',
    skill: 'React',
    skills: ['React', 'Async Programming'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement a React component StudentPassportView that fetches candidate evidence on mount, handling loading skeletons, error banners, and success renders cleanly.',
    requirements: [
      'Use useEffect with empty dependency array.',
      'Use AbortController to cancel in-flight request if unmounted.',
      'Render Loading indicator while fetching.',
      'Render friendly error alert if request fails.'
    ],
    expectedBehavior: 'Displays loading skeleton, then transitions to rendered passport cards upon fetch resolution.',
    starterCode: "import { useState, useEffect } from 'react';\n\nfunction StudentPassportView({ studentId, fetcher }) {\n  // TODO: Implement resilient API data fetching\n  // 1. Maintain state: data (null), loading (true), error (null)\n  // 2. Fetch data inside useEffect when studentId changes\n  // 3. Handle cleanup / abort controller if component unmounts\n  // 4. Render loading spinner, error alert, or passport details accordingly\n\n  return (\n    <div>{/* Render state */}</div>\n  );\n}",
    referenceSolution: `import { useState, useEffect } from 'react';

function StudentPassportView({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(\`/api/v1/students/\${studentId}\`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(d => { setData(d); setError(null); })
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [studentId]);

  if (loading) return <div>Loading Skill Passport...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Candidate: {data?.name}</div>;
}`,
    solutionOutput: `Component Lifecycle Verified:\n- Initial mount: Shows Loading state\n- On resolve: Displays Candidate card\n- On unmount before resolve: AbortController cancels network fetch cleanly\nZero memory leaks detected.`,
    testCases: [
      { input: 'studentId="std-01"', expected: 'Transitions Loading -> Data card' }
    ],
    evaluationCriteria: {
      correctness: 'Proper loading, error, and success state branching.',
      edgeCases: 'AbortController prevents setState on unmounted component.',
      codeQuality: 'Follows React hook best practices.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 06: NODE.JS
  // -------------------------------------------------------------------------
  {
    id: 'ch-node-01',
    moduleId: 'mod-06',
    title: 'Create an Express endpoint',
    skill: 'Node.js',
    skills: ['Node.js', 'REST API', 'Backend Development'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Implement a GET /api/v1/health endpoint in Express that returns system uptime, timestamp, and memory usage metrics.',
    requirements: [
      'Route handler for GET /api/v1/health.',
      'Return 200 OK status code with JSON body.',
      'Include uptime in seconds and current ISO timestamp.'
    ],
    expectedBehavior: 'Returns JSON object: { status: "OK", uptime: number, timestamp: string }.',
    starterCode: "const express = require('express');\nconst router = express.Router();\n\n// TODO: Implement POST /api/evidence endpoint\n// 1. Validate request body has: { skillId, score, candidateId }\n// 2. Return 400 Bad Request if missing required fields\n// 3. On success, generate verification hash and return 201 Created with JSON:\n//    { success: true, evidenceId, hash, timestamp }\n\nmodule.exports = router;",
    referenceSolution: `const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

module.exports = router;`,
    solutionOutput: `HTTP/1.1 200 OK\nContent-Type: application/json\n{\n  "status": "OK",\n  "uptime": 142,\n  "timestamp": "2026-10-07T10:00:00.000Z",\n  "memoryMb": 28\n}`,
    testCases: [
      { input: 'GET /health', expected: '200 OK with uptime and status' }
    ],
    evaluationCriteria: {
      correctness: 'Responds with accurate status code and metrics.',
      edgeCases: 'Non-blocking execution.',
      codeQuality: 'Modular router export.'
    },
    completed: true
  },
  {
    id: 'ch-node-02',
    moduleId: 'mod-06',
    title: 'Implement middleware',
    skill: 'Node.js',
    skills: ['Node.js', 'Authentication', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Write an apiKeyAuth middleware that checks for the x-api-key header. If valid, attach client details to req.client and call next(); otherwise reject with 401 Unauthorized.',
    requirements: [
      'Inspect req.headers["x-api-key"].',
      'If key matches valid set, attach req.client = { id: ... } and invoke next().',
      'If key is missing or invalid, return 401 Unauthorized with JSON error.'
    ],
    expectedBehavior: 'Secures downstream route handlers by verifying API keys.',
    starterCode: "function apiKeyAuth(validKeys) {\n  // TODO: Implement API key authentication middleware\n  // 1. Check for 'x-api-key' in request headers\n  // 2. If missing, return 401 Unauthorized: { error: 'API key is required' }\n  // 3. If invalid key, return 403 Forbidden: { error: 'Invalid API credentials' }\n  // 4. If valid, attach req.clientKey and call next()\n\n  return (req, res, next) => {};\n}",
    referenceSolution: `function apiKeyAuth(validKeys) {
  return (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key || !validKeys[key]) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing API key'
      });
    }
    req.client = validKeys[key];
    next();
  };
}`,
    solutionOutput: `Middleware Verification:\n- Request with valid key -> Passes to next() with req.client set\n- Request without key -> Rejects with 401 Unauthorized\nAll test cases passed!`,
    testCases: [
      { input: 'x-api-key: "valid-123"', expected: 'next() called' },
      { input: 'No header', expected: '401 Unauthorized' }
    ],
    evaluationCriteria: {
      correctness: 'Validates header and controls next() execution flow.',
      edgeCases: 'Handles missing or malformed header gracefully.',
      codeQuality: 'Higher-order middleware factory.'
    },
    completed: false
  },
  {
    id: 'ch-node-03',
    moduleId: 'mod-06',
    title: 'Add centralized error handling',
    skill: 'Node.js',
    skills: ['Node.js', 'Debugging', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement a centralized 4-parameter Express error handling middleware that captures operational errors, formats standardized RFC 7807 responses, and logs unhandled exceptions.',
    requirements: [
      'Middleware function with signature (err, req, res, next).',
      'Use err.statusCode or default to 500.',
      'Hide internal stack traces in production environment.',
      'Log error stack to stderr for monitoring.'
    ],
    expectedBehavior: 'Catches all synchronous and asynchronous route errors without crashing the process.',
    starterCode: "function errorHandler(err, req, res, next) {\n  // TODO: Implement centralized Express error-handling middleware\n  // 1. Determine statusCode: err.statusCode || err.status || 500\n  // 2. Format JSON response: { error: err.name || 'ServerError', message: err.message }\n  // 3. Hide internal stack traces in production (NODE_ENV === 'production')\n  // 4. Log error details with request method and path\n\n}",
    referenceSolution: `function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  console.error('[SERVER ERROR]:', err);

  res.status(statusCode).json({
    error: {
      message: err.isOperational ? err.message : 'Internal Server Error',
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
}`,
    solutionOutput: `Error Middleware Test:\n- Operational 404 error -> Formatted JSON 404 response\n- Unhandled 500 error -> Generic 500 response without stack trace leak\nProcess remained healthy and running.`,
    testCases: [
      { input: 'CustomError(404, "Student not found")', expected: '404 status code' }
    ],
    evaluationCriteria: {
      correctness: 'Accurate 4-parameter Express signature and status mapping.',
      edgeCases: 'Protects against stack trace leaks in production.',
      codeQuality: 'Follows standardized error envelope structure.'
    },
    completed: false
  },

  // -------------------------------------------------------------------------
  // MODULE 07: REST APIs
  // -------------------------------------------------------------------------
  {
    id: 'ch-rest-01',
    moduleId: 'mod-07',
    title: 'Design CRUD endpoints',
    skill: 'REST API',
    skills: ['REST API', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Design and implement RESTful routing for a student evidence resource in Express: GET (list), POST (create), GET /:id (detail), and DELETE /:id (remove).',
    requirements: [
      'GET /api/v1/evidence (return collection with 200).',
      'POST /api/v1/evidence (create and return 201 with Location header).',
      'GET /api/v1/evidence/:id (return single item or 404).',
      'DELETE /api/v1/evidence/:id (remove and return 204 No Content).'
    ],
    expectedBehavior: 'Complies with standard REST verbs, resource nouns, and HTTP status codes.',
    starterCode: "const express = require('express');\nconst router = express.Router();\n\n// In-memory collection for practice:\nlet skills = [];\n\n// TODO: Implement clean RESTful CRUD routes:\n// 1. GET /skills -> List all skills (200)\n// 2. GET /skills/:id -> Get skill by id (200 or 404)\n// 3. POST /skills -> Create new skill (201)\n// 4. PUT /skills/:id -> Update skill (200 or 404)\n// 5. DELETE /skills/:id -> Delete skill (204 or 404)\n\nmodule.exports = router;",
    referenceSolution: `const express = require('express');
const router = express.Router();

let evidenceDb = new Map();

router.get('/', (req, res) => {
  res.json(Array.from(evidenceDb.values()));
});

router.post('/', (req, res) => {
  const id = 'ev-' + Date.now();
  const record = { id, ...req.body };
  evidenceDb.set(id, record);
  res.status(201).location('/api/v1/evidence/' + id).json(record);
});

router.get('/:id', (req, res) => {
  const item = evidenceDb.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Evidence record not found' });
  res.json(item);
});

router.delete('/:id', (req, res) => {
  if (!evidenceDb.has(req.params.id)) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }
  evidenceDb.delete(req.params.id);
  res.status(204).send();
});

module.exports = router;`,
    solutionOutput: `CRUD Validation:\n- POST / -> 201 Created with Location header\n- GET /:id -> 200 OK\n- DELETE /:id -> 204 No Content\n- GET /:id (after delete) -> 404 Not Found\nAll RESTful assertions verified!`,
    testCases: [
      { input: 'POST /api/v1/evidence', expected: '201 Created' },
      { input: 'DELETE /api/v1/evidence/ev-123', expected: '204 No Content' }
    ],
    evaluationCriteria: {
      correctness: 'Correct status codes and route structures.',
      edgeCases: 'Returns 404 on missing item deletes or lookups.',
      codeQuality: 'Adheres to RESTful resource-oriented architectural patterns.'
    },
    completed: true
  },
  {
    id: 'ch-rest-02',
    moduleId: 'mod-07',
    title: 'Implement request validation',
    skill: 'REST API',
    skills: ['REST API', 'Security', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement a validation middleware validateScoreSubmission that rejects invalid evidence submission payloads with 422 Unprocessable Entity and detailed error messages.',
    requirements: [
      'Reject missing candidateId or skillId.',
      'Ensure score is a numeric value between 0 and 100.',
      'Return 422 with array of validation error messages.'
    ],
    expectedBehavior: 'Filters invalid request bodies before reaching controller.',
    starterCode: "function validateScoreSubmission(req, res, next) {\n  // TODO: Implement request validation middleware\n  // Required body fields:\n  // - candidateId: non-empty string\n  // - skillId: non-empty string\n  // - score: integer between 0 and 100\n  // Return 422 Unprocessable Entity with array of specific validation errors if invalid.\n  // Call next() if valid.\n\n}",
    referenceSolution: `function validateScoreSubmission(req, res, next) {
  const { candidateId, skillId, score } = req.body || {};
  const errors = [];

  if (!candidateId || typeof candidateId !== 'string') {
    errors.push({ field: 'candidateId', message: 'Candidate ID is required' });
  }
  if (!skillId || typeof skillId !== 'string') {
    errors.push({ field: 'skillId', message: 'Skill ID is required' });
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    errors.push({ field: 'score', message: 'Score must be a number between 0 and 100' });
  }

  if (errors.length > 0) {
    return res.status(422).json({ error: 'Validation Failed', errors });
  }
  next();
}`,
    solutionOutput: `Validation Pipeline Test:\n- Payload with score 120 -> 422 Unprocessable Entity (Score out of range)\n- Payload missing candidateId -> 422 with field errors\n- Valid payload -> Successfully calls next()\nValidation checks passed!`,
    testCases: [
      { input: '{ score: 120 }', expected: '422 Unprocessable Entity' }
    ],
    evaluationCriteria: {
      correctness: 'Thorough field validation and correct 422 status code.',
      edgeCases: 'Handles missing or non-object bodies safely.',
      codeQuality: 'Clear, structured error feedback.'
    },
    completed: false
  },
  {
    id: 'ch-rest-03',
    moduleId: 'mod-07',
    title: 'Return correct HTTP status codes',
    skill: 'REST API',
    skills: ['REST API', 'Backend Development'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Refactor an anti-pattern API handler that returns 200 OK for every scenario (including errors like not found or forbidden) to use accurate HTTP status codes.',
    requirements: [
      'Replace 200 { error: "Not found" } with 404.',
      'Replace 200 { error: "Unauthorized" } with 401.',
      'Replace 200 { error: "Forbidden" } with 403.',
      'Return 200 OK only for successful operations.'
    ],
    expectedBehavior: 'API returns standard HTTP status codes indicating outcome.',
    starterCode: "function handleRequest(req, res, service) {\n  // TODO: Return correct HTTP status codes for each scenario:\n  // - Resource successfully created: 201 Created\n  // - Resource retrieved: 200 OK\n  // - Resource not found: 404 Not Found\n  // - Validation error: 422 Unprocessable Entity\n  // - Unauthorized access: 401 Unauthorized\n  // - Rate limit exceeded: 429 Too Many Requests\n\n}",
    referenceSolution: `function handleRequest(req, res, service) {
  try {
    const item = service.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (item.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}`,
    solutionOutput: `Status Code Audit Passed:\n- Missing resource: 404 Not Found\n- Unauthenticated: 401 Unauthorized\n- Forbidden: 403 Forbidden\n- Success: 200 OK\nAPI conforms to HTTP/1.1 specifications.`,
    testCases: [
      { input: 'Item not found', expected: 'Status 404' }
    ],
    evaluationCriteria: {
      correctness: 'Correct assignment of 401, 403, 404, 500 codes.',
      edgeCases: 'Catches exceptions and maps to 500.',
      codeQuality: 'Clean guard clause structure.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 08: DATABASES
  // -------------------------------------------------------------------------
  {
    id: 'ch-db-01',
    moduleId: 'mod-08',
    title: 'Write SQL queries',
    skill: 'SQL',
    skills: ['SQL', 'PostgreSQL'],
    difficulty: 'Easy',
    language: 'sql',
    description: 'Write an ANSI SQL query to compute the average competency score and count of verified evidence records for each candidate, returning only candidates with overall score >= 75 sorted in descending order.',
    requirements: [
      'Use GROUP BY on candidate_id.',
      'Filter grouped results using HAVING AVG(score) >= 75.',
      'Order results by average score descending.'
    ],
    expectedBehavior: 'Returns tabular results: candidate_id, avg_score, evidence_count.',
    starterCode: "-- TODO: Write SQL query to calculate average scores by candidate\n-- 1. Select candidate_id and average score rounded to 2 decimal places as avg_score\n-- 2. Count total evidence records as evidence_count\n-- 3. Group by candidate_id\n-- 4. Filter only candidates with evidence_count >= 3 using HAVING\n-- 5. Order by avg_score DESC\n\n-- Write your SELECT query here:\n",
    referenceSolution: `SELECT 
  candidate_id, 
  ROUND(AVG(score), 2) AS avg_score, 
  COUNT(id) AS evidence_count 
FROM candidate_evidence 
GROUP BY candidate_id 
HAVING AVG(score) >= 75 
ORDER BY avg_score DESC;`,
    solutionOutput: `Query Executed:\n candidate_id | avg_score | evidence_count\n--------------+-----------+----------------\n GSP-DEMO-001 |     87.20 |             29\n GSP-DEMO-002 |     81.50 |             18\n(2 rows retrieved in 1.4ms)`,
    testCases: [
      { input: 'Sample evidence table', expected: 'Grouped and filtered candidate summaries' }
    ],
    evaluationCriteria: {
      correctness: 'Accurate aggregation, GROUP BY, and HAVING clauses.',
      edgeCases: 'Handles rounding to 2 decimals.',
      codeQuality: 'ANSI SQL standards compliant.'
    },
    completed: true
  },
  {
    id: 'ch-db-02',
    moduleId: 'mod-08',
    title: 'Design relational tables',
    skill: 'SQL',
    skills: ['SQL', 'Database Design', 'PostgreSQL'],
    difficulty: 'Medium',
    language: 'sql',
    description: 'Write DDL CREATE TABLE statements for a normalized task management database modeling projects and tasks with primary keys, foreign key constraints, and cascade delete rules.',
    requirements: [
      'Create projects table with UUID primary key and title.',
      'Create tasks table with project_id foreign key referencing projects(id).',
      'Configure ON DELETE CASCADE on the foreign key.',
      'Add status column with CHECK constraint (status IN (\'todo\', \'in_progress\', \'completed\')).'
    ],
    expectedBehavior: 'Creates normalized tables with integrity constraints.',
    starterCode: "-- TODO: Design the relational tables schema for Capstone Projects\n-- 1. Create 'projects' table with: id (UUID PK), title (VARCHAR(200)), candidate_id (UUID FK), created_at (TIMESTAMP)\n-- 2. Create 'project_files' table with: id (UUID PK), project_id (UUID FK), filename (VARCHAR(255)), size_bytes (INT)\n-- 3. Define foreign keys with ON DELETE CASCADE\n-- 4. Create an index on project_files(project_id)\n\n-- Write your DDL statements here:\n",
    referenceSolution: `CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`,
    solutionOutput: `DDL Execution Successful:\n- Table projects created (PK: id)\n- Table tasks created (FK: project_id -> projects.id CASCADE)\n- Check constraint verified on status column.\nSchema successfully validated in PostgreSQL.`,
    testCases: [
      { input: 'DDL script execution', expected: 'Tables created with referential constraints' }
    ],
    evaluationCriteria: {
      correctness: 'Valid SQL DDL with constraint definitions.',
      edgeCases: 'Cascading delete prevents orphaned tasks.',
      codeQuality: 'Appropriate data types and timestamps.'
    },
    completed: false
  },
  {
    id: 'ch-db-03',
    moduleId: 'mod-08',
    title: 'Optimize a query',
    skill: 'SQL',
    skills: ['SQL', 'PostgreSQL', 'Database Design'],
    difficulty: 'Hard',
    language: 'sql',
    description: 'A query filtering candidate evidence records by skill_id and ordering by created_at DESC runs slow on large datasets. Create an optimal composite B-Tree index to eliminate the sequential scan.',
    requirements: [
      'Analyze query: SELECT * FROM evidence WHERE skill_id = $1 ORDER BY created_at DESC LIMIT 10.',
      'Create a composite index on (skill_id, created_at DESC).',
      'Verify query uses Index Scan instead of Seq Scan.'
    ],
    expectedBehavior: 'Creates composite index reducing query execution time from 250ms to <1ms.',
    starterCode: "-- High-traffic query currently performing slow sequential table scans:\n-- SELECT * FROM evidence WHERE user_id = 'usr_123' AND skill_id = 'sk_react' ORDER BY created_at DESC;\n\n-- TODO: Write the optimal composite CREATE INDEX statement to speed up this query:\n\n",
    referenceSolution: `-- Write the CREATE INDEX statement:
CREATE INDEX idx_evidence_skill_created 
ON candidate_evidence (skill_id, created_at DESC);`,
    solutionOutput: `EXPLAIN ANALYZE Comparison:\n- Before Index: Seq Scan on candidate_evidence (Cost: 1250.00, Time: 218.4ms)\n- After Index: Index Scan using idx_evidence_skill_created (Cost: 0.42..8.44, Time: 0.38ms)\nQuery optimized by 570x!`,
    testCases: [
      { input: 'Query with composite index', expected: 'Uses Index Scan' }
    ],
    evaluationCriteria: {
      correctness: 'Correct composite index column ordering.',
      edgeCases: 'Sort direction aligns with index definition.',
      codeQuality: 'Appropriate naming convention.'
    },
    completed: false
  },

  // -------------------------------------------------------------------------
  // MODULE 09: AUTHENTICATION & SECURITY
  // -------------------------------------------------------------------------
  {
    id: 'ch-sec-01',
    moduleId: 'mod-09',
    title: 'Implement protected API route',
    skill: 'Authentication',
    skills: ['Authentication', 'Security', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Implement an authentication guard middleware authenticateToken that verifies Bearer JWT tokens from the Authorization header using jsonwebtoken, attaching req.user or rejecting with 401/403.',
    requirements: [
      'Extract token from Authorization: Bearer <token>.',
      'Verify token with jwt.verify().',
      'Return 401 if header is missing, 403 if token is expired or invalid.',
      'Attach decoded payload to req.user.'
    ],
    expectedBehavior: 'Guards route handlers from unauthenticated access.',
    starterCode: "const jwt = require('jsonwebtoken');\n\nfunction authenticateToken(secretKey) {\n  // TODO: Implement JWT authorization middleware\n  // 1. Extract Bearer token from 'Authorization' header: 'Bearer <token>'\n  // 2. If header is missing, return 401 Unauthorized: { error: 'Token required' }\n  // 3. Verify token with jwt.verify(token, secretKey)\n  // 4. If invalid or expired, return 403 Forbidden: { error: 'Invalid or expired token' }\n  // 5. If valid, set req.user = decodedPayload and call next()\n\n  return (req, res, next) => {};\n}",
    referenceSolution: `const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
}`,
    solutionOutput: `Auth Guard Test:\n- Missing token -> 401 Unauthorized\n- Expired token -> 403 Forbidden\n- Valid token -> next() called, req.user populated\nSecurity assertions passed!`,
    testCases: [
      { input: 'Valid Bearer token', expected: 'req.user attached, next() called' },
      { input: 'Missing header', expected: '401 Unauthorized' }
    ],
    evaluationCriteria: {
      correctness: 'Correct Bearer extraction and jwt verification.',
      edgeCases: 'Differentiates 401 (unauthenticated) from 403 (invalid token).',
      codeQuality: 'Express middleware standard conformance.'
    },
    completed: true
  },
  {
    id: 'ch-sec-02',
    moduleId: 'mod-09',
    title: 'Validate user input',
    skill: 'Security',
    skills: ['Security', 'REST API'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Write an input sanitizer sanitizeUserBio(input) that strips dangerous script tags, html entities, and caps length at 500 characters to prevent Stored Cross-Site Scripting (XSS).',
    requirements: [
      'Escape or strip <script> tags and javascript: protocol URIs.',
      'Trim whitespace and truncate strings longer than 500 characters.',
      'Return safe string.'
    ],
    expectedBehavior: 'Neutralizes XSS payloads before database insertion.',
    starterCode: "function sanitizeUserBio(input) {\n  // TODO: Prevent XSS and malicious input injection in user profile bio\n  // 1. Reject non-string inputs\n  // 2. Escape HTML special characters: <, >, &, \", '\n  // 3. Strip script tags and event handler attributes\n  // 4. Enforce max length of 500 characters\n  // 5. Trim leading and trailing whitespace\n\n  return '';\n}",
    referenceSolution: `function sanitizeUserBio(input) {
  if (typeof input !== 'string') return '';
  
  // Strip malicious tags and encode entities
  const safe = input
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();

  return safe.substring(0, 500);
}`,
    solutionOutput: `XSS Sanitization Test:\n- Input: "<script>alert(1)</script>Hello" -> "&lt;script&gt; stripped, renders 'Hello'\n- Input exceeding 500 chars -> Truncated cleanly\nXSS vulnerability mitigated.`,
    testCases: [
      { input: '<script>stealCookies()</script>Developer', expected: 'Developer' }
    ],
    evaluationCriteria: {
      correctness: 'Neutralizes script execution.',
      edgeCases: 'Handles non-string inputs safely without crashing.',
      codeQuality: 'Deterministic sanitization logic.'
    },
    completed: false
  },
  {
    id: 'ch-sec-03',
    moduleId: 'mod-09',
    title: 'Identify security vulnerabilities',
    skill: 'Security',
    skills: ['Security', 'SQL', 'Debugging'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Audit and rewrite a vulnerable authentication query that uses string concatenation: db.query(`SELECT * FROM users WHERE email = \'${email}\' AND password = \'${password}\'`).',
    requirements: [
      'Identify the SQL injection vulnerability.',
      'Rewrite using parameterized placeholders ($1, $2).',
      'Replace plain-text password comparison with bcrypt hashing.'
    ],
    expectedBehavior: 'Eliminates SQL injection and implements secure password verification.',
    starterCode: "const bcrypt = require('bcrypt');\n\nasync function loginCandidate(email, providedPassword, userDb) {\n  // BUGGY / INSECURE CODE TO REMEDIATE:\n  // Vulnerabilities present:\n  // 1. Plaintext password comparison\n  // 2. Timing attack / username enumeration leakage\n  // 3. Missing rate limiting & salt hashing\n\n  // TODO: Remediate this function using bcrypt.compare and secure practices\n  \n}",
    referenceSolution: `const bcrypt = require('bcrypt');

async function loginCandidate(db, email, plainPassword) {
  // SECURE IMPLEMENTATION:
  const query = 'SELECT id, email, password_hash, role FROM users WHERE email = $1';
  const result = await db.query(query, [email]); // Parameterized query

  if (result.rows.length === 0) {
    return null; // User not found
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(plainPassword, user.password_hash);
  if (!isMatch) return null;

  return { id: user.id, email: user.email, role: user.role };
}`,
    solutionOutput: `Security Audit Verified:\n- SQL Injection Attack Payload: "' OR 1=1 --" -> Safely treated as string literal without breach\n- Bcrypt timing comparison active\nVulnerabilities patched successfully.`,
    testCases: [
      { input: 'email="\' OR 1=1 --"', expected: 'Returns null (attack neutralized)' }
    ],
    evaluationCriteria: {
      correctness: 'Uses parameterized query and bcrypt compare.',
      edgeCases: 'Returns null consistently without leaking whether email exists.',
      codeQuality: 'Follows secure coding standards.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 10: GIT & GITHUB
  // -------------------------------------------------------------------------
  {
    id: 'ch-git-01',
    moduleId: 'mod-10',
    title: 'Resolve a merge conflict',
    skill: 'Git',
    skills: ['Git', 'Debugging'],
    difficulty: 'Medium',
    language: 'bash',
    description: 'Given a Git conflict in src/config.ts with conflicting port settings on main and feature branches, provide the sequence of commands to inspect, edit, stage, and finalize the merge commit.',
    requirements: [
      'Inspect conflicting files using git status.',
      'Resolve the conflict in code and remove conflict markers.',
      'Stage resolved file with git add.',
      'Finalize merge using git commit.'
    ],
    expectedBehavior: 'Produces a resolved merge commit without conflict markers.',
    starterCode: "# Conflict in src/config.js:\n# <<<<<<< HEAD\n# const API_URL = 'https://api.v2.seva.in';\n# =======\n# const API_URL = 'https://staging.api.seva.in';\n# >>>>>>> feat/staging-migration\n\n# TODO: Write the Git command sequence to:\n# 1. Inspect status\n# 2. Resolve conflict in favor of https://api.v2.seva.in\n# 3. Stage the resolved file\n# 4. Finalize the merge commit with a standard message\n\n",
    referenceSolution: `# Command sequence to resolve merge conflict:
git status
# (Manually edit file to unify conflicting lines)
git add src/config.ts
git commit -m "chore: resolve merge conflict in application config"`,
    solutionOutput: `Merge Conflict Simulation:\n- Conflicting file: src/config.ts\n- Markers removed, unified port set to 3000\n- git add executed\n- git commit created merge commit hash 8fa2e01\nRepository clean!`,
    testCases: [
      { input: 'Merge conflict present', expected: 'Clean merge commit created' }
    ],
    evaluationCriteria: {
      correctness: 'Accurate command sequence for conflict resolution.',
      edgeCases: 'Ensures git add is called before commit.',
      codeQuality: 'Descriptive commit message.'
    },
    completed: true
  },
  {
    id: 'ch-git-02',
    moduleId: 'mod-10',
    title: 'Create a feature branch',
    skill: 'Git',
    skills: ['Git'],
    difficulty: 'Easy',
    language: 'bash',
    description: 'Write the command sequence to update local main branch from origin, create a new branch named feat/evidence-hash, and push it with upstream tracking.',
    requirements: [
      'Update main: git checkout main && git pull origin main.',
      'Create and switch to new branch: git switch -c feat/evidence-hash.',
      'Push with upstream tracking: git push -u origin feat/evidence-hash.'
    ],
    expectedBehavior: 'Local and remote feature branch created and linked.',
    starterCode: "# TODO: Write the Git command sequence to:\n# 1. Ensure you are on the latest 'main' branch\n# 2. Pull remote updates\n# 3. Create and switch to a new feature branch named 'feat/evidence-export'\n# 4. Verify the active branch name\n\n",
    referenceSolution: `git checkout main
git pull origin main
git switch -c feat/evidence-hash
git push -u origin feat/evidence-hash`,
    solutionOutput: `Branch creation sequence executed:\n- Checked out and updated main\n- Switched to new branch 'feat/evidence-hash'\n- Branch pushed to origin with upstream tracking configured.`,
    testCases: [
      { input: 'Branch creation workflow', expected: 'feat/evidence-hash tracking origin' }
    ],
    evaluationCriteria: {
      correctness: 'Correct git pull, switch -c, and push -u syntax.',
      edgeCases: 'Pulls latest main before branching.',
      codeQuality: 'Standard branch naming convention.'
    },
    completed: false
  },
  {
    id: 'ch-git-03',
    moduleId: 'mod-10',
    title: 'Prepare a professional pull request',
    skill: 'Git',
    skills: ['Git', 'Engineering'],
    difficulty: 'Medium',
    language: 'bash',
    description: 'Draft a pull request checklist script and template verifying that tests pass, linter passes, and build succeeds prior to opening a PR.',
    requirements: [
      'Run npm run lint and npm test.',
      'Run npm run build to verify zero compile errors.',
      'Generate summary of commits using git log origin/main..HEAD --oneline.'
    ],
    expectedBehavior: 'Automated pre-flight check confirms PR readiness.',
    starterCode: "#!/bin/bash\nset -e\n\n# TODO: Automate pre-PR readiness checks:\n# 1. Run type check: npm run typecheck (or tsc --noEmit)\n# 2. Run test suite\n# 3. Run linter\n# 4. Ensure working directory is clean (git diff --exit-code)\n\necho \"Ready to submit Pull Request!\"\n",
    referenceSolution: `#!/bin/bash
set -e

echo "Running Pre-PR Verification..."
npm run lint
npm test
npm run build

echo "Pre-PR checks passed successfully! Ready to submit pull request."
git log origin/main..HEAD --oneline`,
    solutionOutput: `Verification Suite Results:\n- Lint: 0 errors\n- Tests: 14 passed\n- Build: 0 errors\nPR readiness confirmed.`,
    testCases: [
      { input: 'Pre-flight check execution', expected: 'All quality gates pass' }
    ],
    evaluationCriteria: {
      correctness: 'Includes lint, test, and build validation.',
      edgeCases: 'Halts on error via set -e.',
      codeQuality: 'Clear status output.'
    },
    completed: false
  },

  // -------------------------------------------------------------------------
  // MODULE 11: TESTING
  // -------------------------------------------------------------------------
  {
    id: 'ch-test-01',
    moduleId: 'mod-11',
    title: 'Write unit tests',
    skill: 'Testing',
    skills: ['Testing'],
    difficulty: 'Easy',
    language: 'javascript',
    description: 'Write a unit test suite using Vitest for calculateOverallPassport(skillScores) testing full competency scores, boundary zero cases, and grade assignments.',
    requirements: [
      'Test that average >= 90 returns grade "A+".',
      'Test that scores below threshold return status "building".',
      'Test handling of empty skill arrays.'
    ],
    expectedBehavior: 'Vitest suite with 100% branch coverage over scoring function.',
    starterCode: "import { describe, it, expect } from 'vitest';\nimport { calculateOverallPassport } from './scoring/engine';\n\ndescribe('calculateOverallPassport', () => {\n  // TODO: Write comprehensive unit test suite:\n  // 1. Test standard case: returns correct weighted score and grade\n  // 2. Test edge case: student with zero evidence records returns 0 / 'No Grade'\n  // 3. Test cap: ensure score never exceeds 100\n  // 4. Test grade boundary: score >= 90 receives 'A+'\n});",
    referenceSolution: `import { describe, it, expect } from 'vitest';
import { calculateOverallPassport } from './scoring';

describe('calculateOverallPassport', () => {
  it('returns building status when evidence is insufficient', () => {
    const result = calculateOverallPassport([]);
    expect(result.status).toBe('building');
    expect(result.overallScore).toBe(0);
  });

  it('calculates average score and assigns A+ grade for high performers', () => {
    const skills = [
      { skillId: 'js', score: 92, evidenceCount: 5 },
      { skillId: 'react', score: 94, evidenceCount: 5 }
    ];
    const result = calculateOverallPassport(skills);
    expect(result.overallScore).toBe(93);
    expect(result.grade).toBe('A+');
    expect(result.status).toBe('active');
  });
});`,
    solutionOutput: `✓ calculateOverallPassport > returns building status when evidence is insufficient (2ms)\n✓ calculateOverallPassport > calculates average score and assigns A+ grade (1ms)\nTest Files  1 passed (1)\nTests  2 passed (2)\nDuration  48ms`,
    testCases: [
      { input: 'Test suite execution', expected: 'All tests pass with 0 failures' }
    ],
    evaluationCriteria: {
      correctness: 'Accurate Vitest matchers and assertions.',
      edgeCases: 'Tests empty and boundary inputs.',
      codeQuality: 'Organized describe and it blocks.'
    },
    completed: true
  },
  {
    id: 'ch-test-02',
    moduleId: 'mod-11',
    title: 'Test an API endpoint',
    skill: 'Testing',
    skills: ['Testing', 'REST API', 'Backend Development'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'Write an integration test suite using Supertest and Vitest testing GET /api/v1/students/:id for 200 OK and 404 Not Found scenarios.',
    requirements: [
      'Assert 200 status code and JSON content-type header for existing student.',
      'Assert 404 status code for non-existent student ID.',
      'Validate response body properties.'
    ],
    expectedBehavior: 'Simulates HTTP requests and validates server response behavior.',
    starterCode: "import request from 'supertest';\nimport { describe, it, expect } from 'vitest';\nimport app from './app';\n\ndescribe('POST /api/assessments/start', () => {\n  // TODO: Write integration tests using supertest:\n  // 1. Returns 200 and attempt payload with valid credentials\n  // 2. Returns 401 when Authorization header is missing\n  // 3. Returns 404 when assessment ID does not exist\n});",
    referenceSolution: `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/app';

describe('GET /api/v1/students/:id', () => {
  it('responds with 200 and student object for valid ID', async () => {
    const res = await request(app)
      .get('/api/v1/students/std-001')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('id', 'std-001');
    expect(res.body).toHaveProperty('name');
  });

  it('responds with 404 for unknown student ID', async () => {
    await request(app)
      .get('/api/v1/students/unknown-id')
      .expect(404);
  });
});`,
    solutionOutput: `✓ GET /api/v1/students/:id > responds with 200 and student object (14ms)\n✓ GET /api/v1/students/:id > responds with 404 for unknown ID (8ms)\nAll 2 HTTP assertion tests passed!`,
    testCases: [
      { input: 'Supertest execution', expected: '200 and 404 assertions pass' }
    ],
    evaluationCriteria: {
      correctness: 'Accurate supertest expectations.',
      edgeCases: 'Validates both success and error status codes.',
      codeQuality: 'Concise integration test structure.'
    },
    completed: false
  },
  {
    id: 'ch-test-03',
    moduleId: 'mod-11',
    title: 'Debug failing tests',
    skill: 'Testing',
    skills: ['Testing', 'Debugging'],
    difficulty: 'Medium',
    language: 'javascript',
    description: 'A test asserting token expiration fails intermittently due to system clock drift. Debug and fix the test using Vitest fake timers (vi.useFakeTimers).',
    requirements: [
      'Freeze time deterministically using vi.useFakeTimers() and vi.setSystemTime().',
      'Advance virtual time using vi.advanceTimersByTime().',
      'Restore real timers in afterEach().'
    ],
    expectedBehavior: 'Eliminates test flakiness caused by real-world timer delays.',
    starterCode: "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';\n\ndescribe('Telemetry Sync Engine', () => {\n  // BUGGY FLAKY TEST SUITE TO FIX:\n  // Issues:\n  // - Global timers not reset between tests\n  // - Mock calls leaking between tests\n  // - Async promises not awaited properly\n\n  // TODO: Add beforeEach / afterEach cleanup and fix flaky test assertions\n});",
    referenceSolution: `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isTokenExpired } from './auth';

describe('Token Expiration Test', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly flags token as expired after 15 minutes', () => {
    const tokenCreated = Date.now();
    
    // Fast-forward virtual clock by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);

    expect(isTokenExpired(tokenCreated, 15 * 60 * 1000)).toBe(true);
  });
});`,
    solutionOutput: `✓ Token Expiration Test > correctly flags token as expired (3ms)\nExecuted deterministically with 0ms real-world delay.\nZero flakiness detected!`,
    testCases: [
      { input: 'Fake timer advancement', expected: 'Token expired = true' }
    ],
    evaluationCriteria: {
      correctness: 'Correct fake timer usage and cleanup.',
      edgeCases: 'Restores real timers in afterEach.',
      codeQuality: 'Eliminates async sleep flakiness.'
    },
    completed: true
  },

  // -------------------------------------------------------------------------
  // MODULE 12: DEPLOYMENT
  // -------------------------------------------------------------------------
  {
    id: 'ch-deploy-01',
    moduleId: 'mod-12',
    title: 'Prepare a Full Stack Application for Production',
    skill: 'Deployment',
    skills: ['Deployment', 'DevOps Fundamentals', 'Production Engineering', 'Security'],
    difficulty: 'Hard',
    language: 'bash',
    description: 'Write a comprehensive production pre-flight audit script that verifies environment variables, builds production assets with zero errors, and checks container health.',
    requirements: [
      'Validate that NODE_ENV=production and mandatory secrets exist.',
      'Execute npm run build and verify 0 exit code.',
      'Check that /health endpoint responds with 200 OK.',
      'Output formatted pre-flight checklist summary.'
    ],
    expectedBehavior: 'Confirms application readiness before live customer traffic routing.',
    starterCode: "#!/usr/bin/env bash\nset -e\n\n# TODO: Production release verification script\n# 1. Verify Node.js version >= 18\n# 2. Verify all required environment variables are set (NEXT_PUBLIC_SUPABASE_URL, etc.)\n# 3. Install production dependencies with frozen lockfile (npm ci)\n# 4. Build Next.js application (npm run build)\n# 5. Check exit code and confirm release artifact readiness\n\necho \"Production artifact built successfully!\"\n",
    referenceSolution: `#!/usr/bin/env bash
set -e

echo "=== SEVA SKILL PASSPORT PRODUCTION AUDIT ==="

# 1. Verify Environment
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi

# 2. Execute Production Build
echo "Building production bundle..."
npm run build

# 3. Security Check
echo "Auditing dependencies..."
npm audit --audit-level=high

echo "=== PRODUCTION AUDIT PASSED: READY FOR DEPLOYMENT ==="`,
    solutionOutput: `Pre-flight Audit Output:\n[✓] Environment variables verified\n[✓] Next.js production build compiled with 0 errors\n[✓] High-severity vulnerability audit: 0 found\n[✓] Container readiness probe passed\nApplication certified for production launch!`,
    testCases: [
      { input: 'Production audit script execution', expected: 'Passes with exit code 0' }
    ],
    evaluationCriteria: {
      correctness: 'Checks secrets, build, and security.',
      edgeCases: 'Halts immediately on any failure (set -e).',
      codeQuality: 'Standard bash automation script.'
    },
    completed: true
  }
];
