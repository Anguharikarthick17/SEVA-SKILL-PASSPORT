import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SlideData {
  title: string;
  subtitle: string;
  content: string[];
  codeSnippet?: string;
  calloutType?: 'info' | 'warning' | 'summary';
  calloutText?: string;
  narration: string;
}

interface ModuleVideoSpec {
  id: string;
  number: string;
  title: string;
  conceptTitle: string;
  primarySkill: string;
  slides: SlideData[];
}

const MODULE_SPECS: ModuleVideoSpec[] = [
  {
    id: 'mod-01',
    number: '01',
    title: 'Web Fundamentals',
    conceptTitle: 'HTTP Request Lifecycle & Browser Parsing',
    primarySkill: 'Web Fundamentals',
    slides: [
      {
        title: 'Module 01: Web Fundamentals',
        subtitle: 'The Anatomy of an HTTP Transaction',
        content: [
          'Client initiates TCP 3-way handshake over port 443 with TLS negotiation',
          'HTTP request headers transmit method, URI path, host, and accept-encoding',
          'Server processes request and returns status code, response headers, and payload',
          'Browser engine parses HTML token stream and constructs the DOM and CSSOM trees'
        ],
        narration: 'Welcome to SEVA Skill Passport. In Module 1, we deconstruct the HTTP transaction lifecycle, from DNS resolution and TLS handshakes to DOM construction.'
      },
      {
        title: 'Live Example: HTTP Request Header Inspection',
        subtitle: 'Production Header Negotiation',
        content: ['Accurate HTTP headers ensure performance, caching, and security negotiation.'],
        codeSnippet: `GET /api/v1/passport/telemetry HTTP/1.1\nHost: api.seva.edu\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X)\nAccept: application/json\nCache-Control: max-age=3600, must-revalidate\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...`,
        narration: 'Observe the structure of a standard HTTP GET request. The client specifies required headers such as host, authorization, and caching instructions.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Render-Blocking Resource Loading',
        content: [
          'Mistake: Placing large synchronous scripts in the HTML document head',
          'Consequence: The browser stops HTML parsing until the remote script is fetched',
          'Solution: Use defer or async attributes to allow parallel non-blocking DOM parsing'
        ],
        calloutType: 'warning',
        calloutText: 'Never place synchronous third-party scripts above critical viewport CSS.',
        narration: 'A common mistake in web architecture is loading external scripts synchronously in the document head. This blocks DOM tree construction. Always use defer or async.'
      },
      {
        title: 'Module 01 Summary & Telemetry Check',
        subtitle: 'Skill Passport Evidence Criteria',
        content: [
          'Demonstrate HTTP inspection using browser DevTools or curl',
          'Verify status code semantics (200, 304, 400, 401, 403, 404, 500)',
          'Complete Lab 01 to record your cryptographic evidence entry'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Correctly analyze 4 HTTP transactions to unlock competency scoring.',
        narration: 'To qualify this module in your Skill Passport, complete Lab 1 by parsing live network requests and logging verified telemetry in the terminal.'
      }
    ]
  },
  {
    id: 'mod-02',
    number: '02',
    title: 'HTML & CSS',
    conceptTitle: 'Semantic Architecture & Modern Flexbox/Grid Layouts',
    primarySkill: 'HTML & CSS',
    slides: [
      {
        title: 'Module 02: HTML & CSS',
        subtitle: 'Semantic Document Structure & Responsive Systems',
        content: [
          'Semantic tags: header, main, section, article, nav, aside, and footer',
          'WCAG 2.1 AA compliance: accessible landmark roles and screen reader tree',
          'CSS Box Model: margin, border, padding, and content box calculations',
          'Modern layout primitives: CSS Flexbox for 1D, CSS Grid for 2D'
        ],
        narration: 'Module 2 covers semantic markup and modern CSS layouts. Semantic HTML establishes an accessible document tree that works seamlessly across assistive technology.'
      },
      {
        title: 'Code Example: Responsive Two-Column Grid',
        subtitle: 'Mobile-First Layout without Fragile Floats',
        content: ['Use CSS Grid with minmax and auto-fit for responsive adaptations.'],
        codeSnippet: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n  align-items: start;\n}`,
        narration: 'Here we define a responsive dashboard layout using CSS Grid. With repeat, auto fit, and minmax, the layout adapts fluidly without requiring hardcoded media queries.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Div Soup & Missing Accessible Contrast',
        content: [
          'Mistake: Replacing semantic buttons with generic unstyled clickable div tags',
          'Consequence: Keyboard users and screen readers cannot focus or activate the element',
          'Solution: Always use native button elements with visible focus rings and sufficient contrast'
        ],
        calloutType: 'warning',
        calloutText: 'Avoid clickable divs. Native buttons provide keyboard accessibility and ARIA roles for free.',
        narration: 'Avoid replacing buttons with clickable divs. Doing so strips away keyboard navigation, focus management, and accessibility roles.'
      },
      {
        title: 'Module 02 Summary & Practice',
        subtitle: 'Ready for Lab 02: Responsive Dashboard',
        content: [
          'Build WCAG-compliant UI components with verified color contrast',
          'Master flex alignment: justify-content, align-items, and flex-wrap',
          'Submit your responsive civic portal project to generate evidence'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Zero accessibility violations under automated axe-core audits.',
        narration: 'Ensure your components meet WCAG double-A standards before submitting your practice lab. This completes the core requirements for Module 2.'
      }
    ]
  },
  {
    id: 'mod-03',
    number: '03',
    title: 'JavaScript Fundamentals',
    conceptTitle: 'Execution Context, Lexical Scope & Closure Architecture',
    primarySkill: 'JavaScript',
    slides: [
      {
        title: 'Module 03: JavaScript Fundamentals',
        subtitle: 'The JavaScript Execution Model & Memory Allocation',
        content: [
          'Call stack execution: Global execution context and function execution contexts',
          'Hoisting: Function declarations vs variable declarations (var, let, const)',
          'Lexical scoping: Outer environment references and the scope chain',
          'Closures: Functions retaining lexical scope after parent function returns'
        ],
        narration: 'In Module 3, we dive into JavaScript execution contexts, lexical scope, variable hoisting, and how closures preserve access to parent environments.'
      },
      {
        title: 'Code Example: Encapsulated Counter with Closures',
        subtitle: 'Private State Preservation',
        content: ['Closures provide reliable data encapsulation without polluting global scope.'],
        codeSnippet: `function createTelemetryTracker(initialCount = 0) {\n  let count = initialCount;\n  return {\n    increment: () => ++count,\n    getCount: () => count,\n  };\n}\nconst tracker = createTelemetryTracker(10);\ntracker.increment(); // returns 11`,
        narration: 'In this example, the inner functions maintain a live reference to the private count variable. Outside code cannot mutate count directly, demonstrating encapsulation.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Asynchronous Variable Mutation in Loops',
        content: [
          'Mistake: Using var inside loops with asynchronous callbacks (setTimeout, fetch)',
          'Consequence: All callbacks share a single hoisted variable, logging the final loop value',
          'Solution: Use block-scoped let, or pass the index into an immediately bound scope'
        ],
        calloutType: 'warning',
        calloutText: 'Always use const by default and let when reassignment is required. Avoid var.',
        narration: 'Using var in asynchronous loops binds a single variable across all iterations. Always declare loop counters with block-scoped let to prevent subtle race conditions.'
      },
      {
        title: 'Module 03 Summary & Evidence Path',
        subtitle: 'Algorithmic Competency Verification',
        content: [
          'Master pure functions and side-effect isolation',
          'Demonstrate array methods: map, filter, reduce, and flatMap',
          'Pass 4 automated algorithmic tests in the Practice Arena'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: 100% test pass rate required in automated algorithmic grading.',
        narration: 'Your Skill Passport evaluates JavaScript ability through automated test execution. Write pure, predictable functions to qualify your score.'
      }
    ]
  },
  {
    id: 'mod-04',
    number: '04',
    title: 'Advanced JavaScript',
    conceptTitle: 'Event Loop, Promises & Concurrent Microtask Processing',
    primarySkill: 'Advanced JavaScript',
    slides: [
      {
        title: 'Module 04: Advanced JavaScript',
        subtitle: 'The Event Loop, Microtask Queue & Memory Lifecycle',
        content: [
          'Single-threaded concurrency: Call stack, Web APIs, and task queues',
          'Microtasks vs Macrotasks: Promise handlers execute before setTimeout / setInterval',
          'Promise lifecycle: Pending, Fulfilled, and Rejected states',
          'Memory lifecycle: Reference counting and Mark-and-Sweep garbage collection'
        ],
        narration: 'Module 4 explores the JavaScript event loop, microtask queues, and asynchronous concurrency patterns. Understanding queue priority is vital for high-performance apps.'
      },
      {
        title: 'Code Example: Robust Parallel Async Execution',
        subtitle: 'Promise.allSettled for Fault-Tolerant Aggregation',
        content: ['Execute concurrent requests without letting one failure drop the entire batch.'],
        codeSnippet: `async function fetchStudentDossier(studentId) {\n  const results = await Promise.allSettled([\n    fetchProfile(studentId),\n    fetchEvidence(studentId),\n    fetchAssessments(studentId),\n  ]);\n  return results.map(r => r.status === 'fulfilled' ? r.value : null);\n}`,
        narration: 'Using Promise.allSettled lets you run concurrent asynchronous requests safely. If one network call fails, other data still loads successfully.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Unhandled Promise Rejections & Memory Leaks',
        content: [
          'Mistake: Omitting catch handlers or try/catch blocks on async functions',
          'Consequence: Node.js process crashes or silent browser failures',
          'Solution: Implement comprehensive error handling and clean up event listeners'
        ],
        calloutType: 'warning',
        calloutText: 'Never leave floating async promises without top-level error boundaries.',
        narration: 'Never ignore unhandled promise rejections. In production services, an unhandled rejection can terminate the server process or cause silent client failures.'
      },
      {
        title: 'Module 04 Summary',
        subtitle: 'Advanced Architecture Verification',
        content: [
          'Debug complex race conditions using Chrome DevTools Performance Profiler',
          'Implement custom debounce and throttle utility functions',
          'Prove understanding of microtask timing in timed assessments'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Score above 70% in the Advanced JavaScript timed assessment.',
        narration: 'Complete the performance profiling lab and timed assessment to log verified evidence for advanced JavaScript in your passport.'
      }
    ]
  },
  {
    id: 'mod-05',
    number: '05',
    title: 'React',
    conceptTitle: 'Component Architecture, Reconciliation & Custom Hooks',
    primarySkill: 'React',
    slides: [
      {
        title: 'Module 05: React',
        subtitle: 'Declarative UI, Virtual DOM & Fiber Reconciliation',
        content: [
          'React Fiber Architecture: Incremental rendering and priority-based scheduling',
          'The unidirectional data flow: Props down, events and callbacks up',
          'Rules of Hooks: Call at top level, only call from React function components',
          'Memoization primitives: useMemo, useCallback, and React.memo'
        ],
        narration: 'In Module 5, we master React component architecture. We explore how React schedules updates through the Fiber reconciler and how to design clean custom hooks.'
      },
      {
        title: 'Code Example: Custom Hook for Async Data Fetching',
        subtitle: 'Clean State Encapsulation with AbortController',
        content: ['Cancel pending network requests when components unmount to prevent leaks.'],
        codeSnippet: `function usePassportEvidence(userId) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    const controller = new AbortController();\n    api.getEvidence(userId, { signal: controller.signal })\n       .then(setData)\n       .catch(err => { if (!controller.signal.aborted) console.error(err); });\n    return () => controller.abort();\n  }, [userId]);\n  return data;\n}`,
        narration: 'This custom hook encapsulates asynchronous data loading. It integrates an AbortController in the cleanup function to prevent memory leaks when components unmount.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Infinite Re-render Loops in useEffect',
        content: [
          'Mistake: Updating state inside useEffect without an accurate dependency array',
          'Consequence: Component continuously triggers re-renders, freezing the browser tab',
          'Solution: Include all referenced reactive values in dependencies or use functional updates'
        ],
        calloutType: 'warning',
        calloutText: 'Never omit required dependencies from useEffect arrays to silence linter warnings.',
        narration: 'Never omit dependencies from useEffect to silence warnings. That causes stale closures or infinite re-render loops. Always declare dependencies honestly.'
      },
      {
        title: 'Module 05 Summary & Capstone Check',
        subtitle: 'Front-End Competency Ledger',
        content: [
          'Build production-ready components adhering to atomic design principles',
          'Demonstrate predictable state management with useReducer and Context',
          'Deliver the Responsive Civic Services Dashboard capstone project'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Reviewer rubric evaluation score of 70%+ across 5 criteria.',
        narration: 'Your React competency is proven by building the Civic Services Dashboard project and achieving an authorized reviewer score above 70 percent.'
      }
    ]
  },
  {
    id: 'mod-06',
    number: '06',
    title: 'Node.js',
    conceptTitle: 'Event-Driven Server Architecture & Stream Pipelines',
    primarySkill: 'Node.js',
    slides: [
      {
        title: 'Module 06: Node.js',
        subtitle: 'Non-Blocking I/O, Libuv & Server Process Management',
        content: [
          'Node.js runtime: V8 JavaScript engine backed by libuv event loop',
          'File system operations: Sync vs async non-blocking file streaming',
          'EventEmitter pattern: Decoupling publishers and subscribers in service layers',
          'Process lifecycle: Handling SIGTERM, SIGINT, and graceful shutdown'
        ],
        narration: 'Module 6 focuses on Node.js server architecture. We examine libuv thread pools, non-blocking I/O, event emitters, and graceful process lifecycle management.'
      },
      {
        title: 'Code Example: Memory-Safe Stream Pipeline',
        subtitle: 'Processing Large Datasets without Out-of-Memory Errors',
        content: ['Use stream.pipeline to handle backpressure and error propagation automatically.'],
        codeSnippet: `import { pipeline } from 'node:stream/promises';\nimport fs from 'node:fs';\nimport zlib from 'node:zlib';\n\nawait pipeline(\n  fs.createReadStream('telemetry-dump.log'),\n  zlib.createGzip(),\n  fs.createWriteStream('telemetry-dump.log.gz')\n);`,
        narration: 'Notice how pipeline streams data directly from source to destination with automatic backpressure management, preventing out-of-memory errors on large payloads.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Blocking the Single Event Loop Thread',
        content: [
          'Mistake: Running synchronous CPU-intensive tasks (e.g. large JSON.parse, crypto, regex)',
          'Consequence: Entire server hangs, rejecting concurrent incoming requests',
          'Solution: Offload heavy computation to Worker Threads or dedicated microservices'
        ],
        calloutType: 'warning',
        calloutText: 'Never block the Node.js event loop with synchronous long-running operations.',
        narration: 'Synchronous CPU-intensive work blocks the single-threaded event loop, stalling all concurrent users. Offload heavy processing to worker threads.'
      },
      {
        title: 'Module 06 Summary',
        subtitle: 'Backend Server Verification',
        content: [
          'Implement modular HTTP server handlers with custom middleware',
          'Manage environment configuration securely using validation schemas',
          'Complete Lab 06: Asynchronous Log Stream Processing'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Pass unit tests for non-blocking file transformation.',
        narration: 'Complete the stream processing lab to demonstrate non-blocking server architecture and record verified Node.js competency in your passport.'
      }
    ]
  },
  {
    id: 'mod-07',
    number: '07',
    title: 'REST APIs',
    conceptTitle: 'RESTful Resource Design, Idempotency & Error Standards',
    primarySkill: 'REST APIs',
    slides: [
      {
        title: 'Module 07: REST APIs',
        subtitle: 'Resource Architecture, HTTP Verbs & Status Code Semantics',
        content: [
          'Resource naming: Plural nouns, hierarchical sub-resources (/users/:id/projects)',
          'HTTP methods: GET (safe/idempotent), POST (create), PUT (replace), PATCH (mutate), DELETE',
          'RFC 7807: Standardized Problem Details for HTTP APIs',
          'Rate limiting and CORS: Protecting endpoints against abuse and cross-origin attacks'
        ],
        narration: 'Module 7 teaches professional REST API design. Learn clean resource modeling, idempotency semantics, standard error formatting, and API security headers.'
      },
      {
        title: 'Code Example: Standardized RFC 7807 Error Response',
        subtitle: 'Predictable API Error Handling',
        content: ['Structured error bodies make client error recovery predictable and automated.'],
        codeSnippet: `export function formatApiError(res, status, title, detail, instance) {\n  return res.status(status).json({\n    type: 'https://seva.edu/errors/' + status,\n    title,\n    status,\n    detail,\n    instance,\n    timestamp: new Date().toISOString()\n  });\n}`,
        narration: 'By implementing RFC 7807 problem details, your API provides standardized error objects with status, title, details, and machine-readable error types.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Returning 200 OK for Business Failures',
        content: [
          'Mistake: Returning HTTP 200 with an internal JSON error flag { success: false }',
          'Consequence: Breaks standard API gateways, monitoring tools, and HTTP caching layers',
          'Solution: Always map errors to proper 4xx and 5xx status codes'
        ],
        calloutType: 'warning',
        calloutText: 'Never return 200 OK when an operation has failed. Use genuine HTTP status codes.',
        narration: 'Never return HTTP 200 for error responses. Doing so blinds monitoring tools, CDNs, and API gateways. Always return proper 4xx and 5xx status codes.'
      },
      {
        title: 'Module 07 Summary',
        subtitle: 'API Competency Verification',
        content: [
          'Design OpenAPI 3.0 specifications for public endpoints',
          'Implement pagination with limit/offset and cursor-based strategies',
          'Build the Student Assessment Evaluation API service'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Implement 5 endpoints with comprehensive automated route tests.',
        narration: 'Build and test production REST endpoints with schema validation and error handling to generate verified Skill Passport evidence.'
      }
    ]
  },
  {
    id: 'mod-08',
    number: '08',
    title: 'Databases',
    conceptTitle: 'Relational Schema Normalization, Indexes & ACID Guarantees',
    primarySkill: 'SQL & Databases',
    slides: [
      {
        title: 'Module 08: Databases',
        subtitle: 'PostgreSQL Relational Modeling & Transaction Isolation',
        content: [
          'ACID properties: Atomicity, Consistency, Isolation, and Durability',
          'Schema normalization: 1NF, 2NF, and 3NF eliminating data redundancy',
          'Postgres indexing: B-Tree, Hash, GIN, and composite indexes for query speed',
          'Query optimization: EXPLAIN ANALYZE, sequential scans vs index scans'
        ],
        narration: 'In Module 8, we explore database design and PostgreSQL engineering. We study normalization, B-Tree indexes, transaction isolation levels, and ACID guarantees.'
      },
      {
        title: 'Code Example: Atomic Database Transaction with Rollback',
        subtitle: 'PostgreSQL Financial and Evidence Integrity',
        content: ['Transactions ensure that multi-step operations complete completely or not at all.'],
        codeSnippet: `BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;\nINSERT INTO assessment_attempts (id, user_id, status)\nVALUES ('att-123', 'usr-456', 'evaluated');\nINSERT INTO evidence_timeline (id, user_id, hash)\nVALUES ('ev-789', 'usr-456', 'sha256:abc...');\nCOMMIT;`,
        narration: 'Atomic database transactions guarantee that related operations succeed together. If any statement fails, the transaction rolls back, preserving database integrity.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Unindexed Foreign Keys & N+1 Query Cascades',
        content: [
          'Mistake: Omitting B-Tree indexes on frequently joined foreign key columns',
          'Consequence: Full table sequential scans degrade database performance as records grow',
          'Solution: Always create explicit indexes on foreign keys and filter columns'
        ],
        calloutType: 'warning',
        calloutText: 'PostgreSQL does not index foreign keys automatically. Always declare explicit indexes.',
        narration: 'A common pitfall is forgetting to index foreign keys. Without indexes, join queries trigger full table scans that degrade performance as data scales.'
      },
      {
        title: 'Module 08 Summary',
        subtitle: 'Database Engineering Evidence',
        content: [
          'Execute complex multi-table JOINs and window aggregation functions',
          'Apply versioned schema migrations without dropping live production data',
          'Pass the Database Design & Optimization timed assessment'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Achieve 80%+ on SQL query optimization benchmarks.',
        narration: 'Demonstrate relational schema design, query optimization, and transaction safety in our practical labs to qualify your database competency.'
      }
    ]
  },
  {
    id: 'mod-09',
    number: '09',
    title: 'Authentication & Security',
    conceptTitle: 'JWT Token Lifecycles, Session Management & OWASP Defenses',
    primarySkill: 'Security',
    slides: [
      {
        title: 'Module 09: Authentication & Security',
        subtitle: 'Identity Verification & Defense-in-Depth Engineering',
        content: [
          'Authentication vs Authorization: Verifying who you are vs what you can do',
          'JWT anatomy: Header, Payload, Signature, and tamper-detection mechanics',
          'Storage security: HttpOnly, Secure, SameSite cookies vs vulnerable localStorage',
          'OWASP Top 10: SQL injection, XSS, CSRF, and broken access control mitigations'
        ],
        narration: 'Module 9 focuses on identity verification and application security. We study JWT lifecycles, HttpOnly cookie storage, role-based authorization, and OWASP defenses.'
      },
      {
        title: 'Code Example: Secure Row Level Security (RLS) Policy',
        subtitle: 'PostgreSQL Defense-in-Depth Authorization',
        content: ['Enforce data access rules directly in the database engine, not just in API code.'],
        codeSnippet: `CREATE POLICY "Users can only inspect own evidence"\nON public.evidence_timeline\nFOR SELECT\nTO authenticated\nUSING (user_id = auth.uid());\n-- Denies direct access to arbitrary records`,
        narration: 'PostgreSQL Row Level Security ensures that even if application code is misconfigured, the database engine prevents users from querying unauthorized records.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Storing Sensitive Tokens in localStorage',
        content: [
          'Mistake: Storing long-lived JWT access tokens in browser localStorage or sessionStorage',
          'Consequence: Any Cross-Site Scripting (XSS) vulnerability allows attackers to steal credentials',
          'Solution: Store tokens in HttpOnly, Secure, SameSite cookies inaccessible to client JavaScript'
        ],
        calloutType: 'warning',
        calloutText: 'Never place auth tokens in localStorage where XSS scripts can exfiltrate them.',
        narration: 'Storing authentication tokens in local storage exposes them to theft via Cross-Site Scripting. Always use HttpOnly, SameSite cookies for sensitive sessions.'
      },
      {
        title: 'Module 09 Summary',
        subtitle: 'Security & Integrity Verification',
        content: [
          'Implement cryptographic password hashing with bcrypt and salt rounds',
          'Enforce strict input sanitization and parameterized SQL statements',
          'Audit reviewer anti-self-review triggers in the Capstone engine'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Zero high-severity vulnerabilities in security audit labs.',
        narration: 'Security is paramount at SEVA. Complete the security audit lab and verify server-side authorization to earn your Security competency badge.'
      }
    ]
  },
  {
    id: 'mod-10',
    number: '10',
    title: 'Git & GitHub',
    conceptTitle: 'Branching Strategies, Rebase Workflows & Conflict Resolution',
    primarySkill: 'Git & Collaboration',
    slides: [
      {
        title: 'Module 10: Git & GitHub',
        subtitle: 'Version Control Architecture & Professional Git Workflows',
        content: [
          'Git internal object model: Blobs, trees, commits, and cryptographic SHA-1 hashes',
          'Branching models: Trunk-Based Development vs GitFlow for agile teams',
          'Rebase vs Merge: Maintaining clean, linear project commit histories',
          'Pull Request hygiene: Atomic commits, descriptive summaries, and code reviews'
        ],
        narration: 'In Module 10, we examine professional version control with Git and GitHub. We master the underlying object model, branching workflows, and conflict resolution.'
      },
      {
        title: 'Code Example: Interactive Rebase & Branch Sync',
        subtitle: 'Linear Commit History Hygiene',
        content: ['Rebase feature branches against main before opening a pull request.'],
        codeSnippet: `# Sync feature branch with main linearly\ngit checkout feature/passport-telemetry\ngit fetch origin\ngit rebase origin/main\n# Squash messy WIP commits into clean atomic units\ngit rebase -i HEAD~3`,
        narration: 'Interactive rebasing allows developers to clean up work-in-progress commits into atomic units with clear messages, producing an auditable project history.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Force Pushing to Shared Main Branches',
        content: [
          'Mistake: Running git push --force on shared production or staging branches',
          'Consequence: Overwrites teammates commits and breaks local working copies',
          'Solution: Use branch protection rules and only use --force-with-lease on personal branches'
        ],
        calloutType: 'warning',
        calloutText: 'Always enable branch protection rules requiring PR reviews before merging to main.',
        narration: 'Never force push to shared branches. It destroys collaborator commits. Enable GitHub branch protection rules to enforce pull requests and automated tests.'
      },
      {
        title: 'Module 10 Summary',
        subtitle: 'Collaboration Competency Verification',
        content: [
          'Resolve three-way merge conflicts using command line Git tools',
          'Configure pre-commit Git hooks for automated linting and formatting',
          'Submit your verified GitHub repository URL for project evaluation'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Validated GitHub HTTPS repository submission with linear history.',
        narration: 'Your project submissions require valid GitHub repositories. Master Git hygiene to streamline reviews and record authentic collaboration evidence.'
      }
    ]
  },
  {
    id: 'mod-11',
    number: '11',
    title: 'Testing',
    conceptTitle: 'Unit Testing, Integration Verification & Test-Driven Development',
    primarySkill: 'Testing',
    slides: [
      {
        title: 'Module 11: Testing',
        subtitle: 'Automated Quality Gates & Test-Driven Development (TDD)',
        content: [
          'The Testing Pyramid: Fast unit tests, comprehensive integration tests, targeted E2E',
          'TDD cycle: Red (failing test), Green (minimal code to pass), Refactor (clean up)',
          'Test doubles: Differentiating between Mocks, Stubs, Spies, and Fakes',
          'Coverage metrics: Line coverage, branch coverage, and mutation testing'
        ],
        narration: 'Module 11 covers testing and automated quality assurance. Learn to build resilient software using test-driven development, integration tests, and coverage analysis.'
      },
      {
        title: 'Code Example: Integration Test with Vitest / Jest',
        subtitle: 'Testing Business Logic Invariants',
        content: ['Test edge cases and invariant constraints with clear behavioral assertions.'],
        codeSnippet: `describe('Assessment Scoring Engine', () => {\n  it('clamps total score between 0 and 100 with negative penalties', () => {\n    const score = calculateRawScore({ correct: 2, incorrect: 8, penalty: 0.25 });\n    expect(score).toBeGreaterThanOrEqual(0);\n    expect(score).toBeLessThanOrEqual(100);\n  });\n});`,
        narration: 'This automated test verifies that the scoring engine properly applies penalties while keeping scores within valid bounds, protecting system integrity.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Testing Implementation Details Instead of Behavior',
        content: [
          'Mistake: Asserting on private component state or internal function variables',
          'Consequence: Tests break during refactoring even though public behavior is unchanged',
          'Solution: Test public interfaces, expected outputs, and user-observable interactions'
        ],
        calloutType: 'warning',
        calloutText: 'Test behavior, not implementation details. Fragile tests discourage refactoring.',
        narration: 'Testing internal implementation details makes test suites fragile. Focus on public inputs, outputs, and behaviors so you can refactor code with confidence.'
      },
      {
        title: 'Module 11 Summary',
        subtitle: 'Testing Suite Validation',
        content: [
          'Author unit tests with 80%+ branch coverage for critical utility libraries',
          'Implement mock-free database integration tests using temporary schemas',
          'Run automated test suites verifying all 159 platform invariants'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: 100% test pass rate across all automated test suites.',
        narration: 'Testing is the cornerstone of verified capability. Execute all test suites to confirm that system invariants and evidence engines remain green.'
      }
    ]
  },
  {
    id: 'mod-12',
    number: '12',
    title: 'Deployment',
    conceptTitle: 'Production Build Pipelines, Containerization & Edge Delivery',
    primarySkill: 'Deployment',
    slides: [
      {
        title: 'Module 12: Deployment',
        subtitle: 'Continuous Integration, Containerization & Zero-Downtime Delivery',
        content: [
          'Production compilation: Tree-shaking, minification, and code splitting',
          'Containerization: Multi-stage Docker builds for minimal production image footprint',
          'CI/CD Pipelines: Automated build, test, security scan, and deploy stages',
          'Edge caching: CDN distribution, Cache-Control headers, and stale-while-revalidate'
        ],
        narration: 'In Module 12, we study production deployment and cloud delivery. We cover containerization with Docker, CI/CD automated deployment pipelines, and global CDN caching.'
      },
      {
        title: 'Code Example: Multi-Stage Dockerfile for Next.js',
        subtitle: 'Minimal Production Attack Surface',
        content: ['Separate dependency installation, build staging, and minimal runtime execution.'],
        codeSnippet: `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next/standalone ./\nEXPOSE 3000\nCMD ["node", "server.js"]`,
        narration: 'Multi-stage Docker builds isolate the build environment from the production runtime, generating lightweight, secure container images without build tool clutter.'
      },
      {
        title: 'Common Mistake & Anti-Pattern',
        subtitle: 'Hardcoding Production Secrets in Code or Docker Images',
        content: [
          'Mistake: Embedding API keys or database connection strings directly in code or Dockerfiles',
          'Consequence: Credentials leak into version control and public Docker registries',
          'Solution: Inject secrets at runtime using environment variables or dedicated secret managers'
        ],
        calloutType: 'warning',
        calloutText: 'Never commit credentials to Git or bake secrets into Docker image layers.',
        narration: 'Never commit API keys or database passwords to Git repositories or bake them into Docker images. Always inject secrets at runtime through secure environment variables.'
      },
      {
        title: 'Module 12 Summary & Full Stack Capstone',
        subtitle: 'Complete Full Stack Qualification',
        content: [
          'Configure zero-downtime rolling deployments on cloud container platforms',
          'Deploy live applications with SSL/TLS certificates and automated health checks',
          'Graduate to Full Stack Certified with your verified SEVA Skill Passport'
        ],
        calloutType: 'summary',
        calloutText: 'Evidence Rule: Live verified HTTPS deployment URL inspected by evaluators.',
        narration: 'Deploying a live production application completes your Full Stack journey. Your verified evidence will be cryptographically locked in your SEVA Skill Passport.'
      }
    ]
  }
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSlideSvg(moduleSpec: ModuleVideoSpec, slide: SlideData, slideIndex: number): string {
  const isDark = !!slide.codeSnippet;
  const bgColor = isDark ? '#140806' : '#FFFDF0';
  const textColor = isDark ? '#FFFACD' : '#1A0C08';
  const mutedColor = isDark ? '#E6B8A2' : '#6E5D53';
  const borderColor = '#B81104';

  let bodyContentSvg = '';

  if (slide.codeSnippet) {
    const codeLines = slide.codeSnippet.split('\n');
    const formattedCode = codeLines
      .map((line, idx) => {
        const y = 290 + idx * 30;
        return `<text x="90" y="${y}" font-family="monospace" font-size="20" fill="#FFFACD">${escapeXml(line)}</text>`;
      })
      .join('\n');

    bodyContentSvg = `
      <!-- Code Box -->
      <rect x="60" y="240" width="1160" height="${Math.min(380, 50 + codeLines.length * 32)}" rx="16" fill="#1F0E0A" stroke="#B81104" stroke-width="2" stroke-opacity="0.4"/>
      <circle cx="90" cy="265" r="6" fill="#D91C0B"/>
      <circle cx="110" cy="265" r="6" fill="#FFB547"/>
      <circle cx="130" cy="265" r="6" fill="#2ECC71"/>
      <text x="160" y="270" font-family="monospace" font-size="14" fill="#E6B8A2">Terminal / Code Preview</text>
      ${formattedCode}
    `;
  } else {
    const bulletListSvg = slide.content
      .map((bullet, idx) => {
        const y = 270 + idx * 65;
        return `
          <g transform="translate(60, ${y})">
            <rect x="0" y="-18" width="28" height="28" rx="8" fill="#B81104" fill-opacity="0.12"/>
            <circle cx="14" cy="-4" r="5" fill="#B81104"/>
            <text x="44" y="0" font-family="sans-serif" font-weight="600" font-size="22" fill="${textColor}">${escapeXml(bullet)}</text>
          </g>
        `;
      })
      .join('\n');

    let calloutSvg = '';
    if (slide.calloutText) {
      const isWarn = slide.calloutType === 'warning';
      const boxBg = isWarn ? '#FFF2F0' : '#FFF9E6';
      const strokeCol = isWarn ? '#D91C0B' : '#B81104';
      const label = isWarn ? 'CRITICAL BEST PRACTICE' : 'EVIDENCE MILESTONE';

      calloutSvg = `
        <g transform="translate(60, 560)">
          <rect x="0" y="0" width="1160" height="90" rx="16" fill="${boxBg}" stroke="${strokeCol}" stroke-width="2"/>
          <text x="30" y="32" font-family="sans-serif" font-weight="bold" font-size="13" fill="${strokeCol}" letter-spacing="1.5">${label}</text>
          <text x="30" y="65" font-family="sans-serif" font-weight="600" font-size="18" fill="#1A0C08">${escapeXml(slide.calloutText)}</text>
        </g>
      `;
    }

    bodyContentSvg = `${bulletListSvg}\n${calloutSvg}`;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D91C0B"/>
          <stop offset="100%" stop-color="#7A0B02"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="${bgColor}"/>
      
      <!-- Top Brand Header Bar -->
      <rect x="0" y="0" width="1280" height="8" fill="#B81104"/>

      <!-- Header Content -->
      <g transform="translate(60, 50)">
        <!-- Badge -->
        <rect x="0" y="0" width="220" height="32" rx="16" fill="#B81104" fill-opacity="0.1"/>
        <text x="18" y="21" font-family="sans-serif" font-weight="bold" font-size="12" fill="#B81104" letter-spacing="1">SEVA SKILL PASSPORT</text>

        <!-- Topic Title -->
        <text x="0" y="75" font-family="sans-serif" font-weight="900" font-size="34" fill="${textColor}">${escapeXml(slide.title)}</text>
        <!-- Subtitle -->
        <text x="0" y="112" font-family="sans-serif" font-weight="600" font-size="20" fill="${mutedColor}">${escapeXml(slide.subtitle)}</text>
      </g>

      <!-- Slide Indicator -->
      <g transform="translate(1120, 50)">
        <rect x="0" y="0" width="100" height="32" rx="16" fill="#B81104" fill-opacity="0.15"/>
        <text x="24" y="21" font-family="sans-serif" font-weight="bold" font-size="13" fill="#B81104">${slideIndex + 1} / 4</text>
      </g>

      <!-- Body Content -->
      ${bodyContentSvg}

      <!-- Bottom Footer Bar -->
      <g transform="translate(60, 680)">
        <text x="0" y="15" font-family="sans-serif" font-size="13" fill="${mutedColor}">Module ${moduleSpec.number} · ${escapeXml(moduleSpec.conceptTitle)}</text>
        <text x="1160" y="15" font-family="sans-serif" font-weight="bold" font-size="13" fill="#B81104" text-anchor="end">Official Video Courseware</text>
      </g>
    </svg>
  `;
}

function formatVttTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  const mmm = ms.toString().padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

async function generateModuleVideo(spec: ModuleVideoSpec) {
  const tmpDir = path.join('/tmp', `seva_video_${spec.id}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Generating Module Video: ${spec.id} (${spec.title})`);
  console.log(`======================================================`);

  const segmentVideoPaths: string[] = [];
  const slideTimings: { start: number; end: number; narration: string }[] = [];
  let cumulativeTime = 0;

  for (let i = 0; i < spec.slides.length; i++) {
    const slide = spec.slides[i];
    const slideSvgPath = path.join(tmpDir, `slide_${i}.svg`);
    const slidePngPath = path.join(tmpDir, `slide_${i}.png`);
    const slideAiffPath = path.join(tmpDir, `audio_${i}.aiff`);
    const slideWavPath = path.join(tmpDir, `audio_${i}.wav`);
    const segmentMp4Path = path.join(tmpDir, `seg_${i}.mp4`);

    // 1. Write Slide Spec JSON
    const slideSpecJson = {
      moduleNumber: spec.number,
      moduleTitle: spec.title,
      conceptTitle: spec.conceptTitle,
      slideIndex: i,
      totalSlides: spec.slides.length,
      title: slide.title,
      subtitle: slide.subtitle,
      content: slide.content,
      codeSnippet: slide.codeSnippet,
      calloutType: slide.calloutType,
      calloutText: slide.calloutText
    };
    const slideJsonPath = path.join(tmpDir, `slide_${i}.json`);
    fs.writeFileSync(slideJsonPath, JSON.stringify(slideSpecJson, null, 2));

    // 2. Render 1920x1080 high-contrast PNG using Python Pillow
    execSync(`python3 "${path.join(process.cwd(), 'scripts/render_slide_pillow.py')}" "${slideJsonPath}" "${slidePngPath}"`);

    // 3. Generate Narration Audio using say
    execSync(`/usr/bin/say -v Samantha "${slide.narration.replace(/"/g, '\\"')}" -o "${slideAiffPath}"`);

    // 4. Measure duration via ffprobe
    const durationOutput = execSync(
      `/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${slideAiffPath}"`
    )
      .toString()
      .trim();
    const duration = parseFloat(durationOutput) || 4.5;
    // Add small pause at end of slide
    const paddedDuration = duration + 0.6;

    slideTimings.push({
      start: cumulativeTime,
      end: cumulativeTime + paddedDuration,
      narration: slide.narration
    });
    cumulativeTime += paddedDuration;

    // Convert audio to wav with padding
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -i "${slideAiffPath}" -af "apad=pad_dur=0.6" "${slideWavPath}" > /dev/null 2>&1`
    );

    // 5. Render Segment MP4 in 1920x1080 Full HD
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -loop 1 -i "${slidePngPath}" -i "${slideWavPath}" -c:v libx264 -tune stillimage -b:v 2500k -c:a aac -b:a 192k -pix_fmt yuv420p -t ${paddedDuration.toFixed(2)} -r 25 "${segmentMp4Path}" > /dev/null 2>&1`
    );

    segmentVideoPaths.push(segmentMp4Path);
  }

  // 6. Concatenate Segments
  const concatListPath = path.join(tmpDir, 'concat.txt');
  const concatContent = segmentVideoPaths.map((p) => `file '${p}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const outputVideoPath = path.join(process.cwd(), 'public/videos/modules', `${spec.id}.mp4`);
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy -movflags +faststart "${outputVideoPath}" > /dev/null 2>&1`
  );

  // 7. Generate WebVTT Captions
  const vttLines = ['WEBVTT', '', `NOTE Module: ${spec.title}`, ''];
  slideTimings.forEach((t, idx) => {
    vttLines.push(`${idx + 1}`);
    vttLines.push(`${formatVttTimestamp(t.start)} --> ${formatVttTimestamp(t.end)}`);
    vttLines.push(t.narration);
    vttLines.push('');
  });

  const outputCaptionPath = path.join(process.cwd(), 'public/captions/modules', `${spec.id}.vtt`);
  fs.writeFileSync(outputCaptionPath, vttLines.join('\n'));

  // 8. Generate Full Transcript File
  const transcriptLines = [
    `# Module ${spec.number}: ${spec.title}`,
    `**Concept Focus**: ${spec.conceptTitle}`,
    `**Total Duration**: ~${Math.round(cumulativeTime)} seconds`,
    `**Audio Narration**: Crystal Speech Synthesizer`,
    '',
    '## Complete Spoken Transcript',
    ''
  ];
  spec.slides.forEach((s, idx) => {
    transcriptLines.push(`### Part ${idx + 1}: ${s.title}`);
    transcriptLines.push(`*${s.subtitle}*`);
    transcriptLines.push('');
    transcriptLines.push(`> "${s.narration}"`);
    transcriptLines.push('');
    if (s.codeSnippet) {
      transcriptLines.push('```javascript');
      transcriptLines.push(s.codeSnippet);
      transcriptLines.push('```');
      transcriptLines.push('');
    }
  });

  const outputTranscriptPath = path.join(process.cwd(), 'public/transcripts/modules', `${spec.id}.txt`);
  fs.writeFileSync(outputTranscriptPath, transcriptLines.join('\n'));

  // 9. Inspect Final Output File
  const stats = fs.statSync(outputVideoPath);
  console.log(`✓ Produced playable video: public/videos/modules/${spec.id}.mp4`);
  console.log(`  File size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`  Total duration: ${cumulativeTime.toFixed(1)} seconds`);
  console.log(`  Captions: public/captions/modules/${spec.id}.vtt`);
  console.log(`  Transcript: public/transcripts/modules/${spec.id}.txt`);

  return {
    id: spec.id,
    number: spec.number,
    title: spec.title,
    conceptTitle: spec.conceptTitle,
    durationSeconds: Math.round(cumulativeTime),
    sizeBytes: stats.size,
    videoUrl: `/videos/modules/${spec.id}.mp4`,
    captionUrl: `/captions/modules/${spec.id}.vtt`,
    transcriptUrl: `/transcripts/modules/${spec.id}.txt`,
    status: 'ready' as const
  };
}

async function main() {
  console.log('Starting SEVA Skill Passport Video Generation Engine...');
  const catalogEntries: any[] = [];

  for (const spec of MODULE_SPECS) {
    const entry = await generateModuleVideo(spec);
    catalogEntries.push(entry);
  }

  // Generate Catalog TypeScript file
  const catalogTsContent = `// Auto-generated SEVA Video Catalog
export interface ModuleVideoMetadata {
  id: string;
  number: string;
  title: string;
  conceptTitle: string;
  durationSeconds: number;
  sizeBytes: number;
  videoUrl: string;
  captionUrl: string;
  transcriptUrl: string;
  status?: 'ready' | 'processing' | 'failed';
}

export const MODULE_VIDEOS_CATALOG: ModuleVideoMetadata[] = ${JSON.stringify(catalogEntries, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/video-catalog.ts'), catalogTsContent);
  console.log('\n======================================================');
  console.log(`Successfully generated ${catalogEntries.length}/12 Module Videos!`);
  console.log(`Catalog written to src/data/video-catalog.ts`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Video generation failed:', err);
  process.exit(1);
});
