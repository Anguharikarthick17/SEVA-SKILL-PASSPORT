/**
 * SEVA Skill Passport — Phase 4 Question Bank
 * 
 * Comprehensive, production-grade question bank for Full Stack Development.
 * Zero lorem ipsum, real engineering code snippets, rigorous technical options,
 * and deep competency-dimension mappings matching Phase 3B engine dimensions.
 */

import { QuestionBankItem, AssessmentConfig } from '@/types/assessment';

export const QUESTION_BANK: QuestionBankItem[] = [
  // =========================================================================
  // 1. REACT DOMAIN
  // Dimensions: Component Design, State Management, Hooks, API Integration, Architecture, Debugging
  // =========================================================================
  {
    id: 'qb-react-01',
    type: 'output-prediction',
    question: 'What will be rendered in the DOM when the user clicks the "Increment" button once in this React component?',
    codeSnippet: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount((prev) => prev + 2);
  };

  return <button onClick={handleClick}>{count}</button>;
}`,
    options: [
      { id: 'opt_1', text: '1' },
      { id: 'opt_2', text: '2' },
      { id: 'opt_3', text: '3' },
      { id: 'opt_4', text: '4' },
    ],
    correctAnswers: ['opt_3'],
    explanation:
      'In the current render snapshot, count is 0. The first two setCount(count + 1) calls schedule setting count to 0 + 1 = 1. The third updater function setCount(prev => prev + 2) receives the queued value 1 and returns 1 + 2 = 3.',
    difficulty: 'MEDIUM',
    skillId: 'react',
    dimension: 'State Management',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-react-02',
    type: 'debugging',
    question: 'A React component exhibits an infinite re-render loop. Identify the specific bug causing this in the following snippet:',
    codeSnippet: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const filterOptions = { activeOnly: true, role: 'developer' };

  useEffect(() => {
    fetchUserData(userId, filterOptions).then((data) => setUser(data));
  }, [userId, filterOptions]);

  return <div>{user?.name}</div>;
}`,
    options: [
      { id: 'opt_1', text: 'fetchUserData returns a Promise which useEffect cannot execute.' },
      { id: 'opt_2', text: 'filterOptions is recreated with a new object reference on every render, triggering useEffect continuously.' },
      { id: 'opt_3', text: 'setUser is asynchronous and cannot be called inside a .then callback.' },
      { id: 'opt_4', text: 'userId must be declared in useState before passing to useEffect.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'In JavaScript, object literals have different references across renders. Because filterOptions is in the dependency array, React evaluates Object.is(prev, next) as false every render, immediately re-triggering the effect after setUser is called.',
    difficulty: 'HARD',
    skillId: 'react',
    dimension: 'Hooks',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-react-03',
    type: 'multiple-select',
    question: 'Which of the following statements correctly describe React 18 Concurrent Features and the useTransition hook? (Select all that apply)',
    options: [
      { id: 'opt_1', text: 'useTransition marks state updates as non-urgent transitions, keeping the UI responsive to user input.' },
      { id: 'opt_2', text: 'Urgent updates like typing or clicking can interrupt a transition render.' },
      { id: 'opt_3', text: 'useTransition eliminates the need for any useEffect cleanup handlers across the tree.' },
      { id: 'opt_4', text: 'The isPending boolean flag indicates whether the transition is currently executing in the background.' },
    ],
    correctAnswers: ['opt_1', 'opt_2', 'opt_4'],
    explanation:
      'useTransition splits state updates into urgent (direct user interactions) and transition updates. When a transition is pending, React yields execution to incoming urgent events without blocking the main thread. It does not replace useEffect cleanup.',
    difficulty: 'HARD',
    skillId: 'react',
    dimension: 'Architecture',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-react-04',
    type: 'scenario',
    question: 'You are designing a high-frequency search input that queries a REST API. To prevent race conditions where an earlier slow request overwrites a newer fast response, which architectural pattern should you use?',
    options: [
      { id: 'opt_1', text: 'Use an AbortController inside useEffect to cancel the previous in-flight fetch before spawning a new one.' },
      { id: 'opt_2', text: 'Wrap the fetch call in setTimeout with 0ms delay.' },
      { id: 'opt_3', text: 'Disable user input until every network roundtrip finishes.' },
      { id: 'opt_4', text: 'Cache API responses in localStorage synchronously on keydown.' },
    ],
    correctAnswers: ['opt_1'],
    explanation:
      'Using an AbortController in the useEffect cleanup phase cancels outdated network requests before a new search query fires, eliminating out-of-order race conditions.',
    difficulty: 'MEDIUM',
    skillId: 'react',
    dimension: 'API Integration',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 2. NODE.JS & BACKEND DOMAIN
  // Dimensions: Server Fundamentals, Routing, Middleware, Error Handling, Architecture
  // =========================================================================
  {
    id: 'qb-node-01',
    type: 'output-prediction',
    question: 'In what order will the console logs be printed in this Node.js script?',
    codeSnippet: `console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

process.nextTick(() => {
  console.log('4');
});

console.log('5');`,
    options: [
      { id: 'opt_1', text: '1, 5, 2, 3, 4' },
      { id: 'opt_2', text: '1, 5, 4, 3, 2' },
      { id: 'opt_3', text: '1, 2, 3, 4, 5' },
      { id: 'opt_4', text: '1, 5, 3, 4, 2' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Synchronous code executes first (1, 5). Next, Node.js processes the microtask queue where process.nextTick takes priority over resolved Promise microtasks (4, then 3). Finally, the timer macrotask executes (2).',
    difficulty: 'HARD',
    skillId: 'nodejs',
    dimension: 'Server Fundamentals',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-node-02',
    type: 'mcq',
    question: 'How must centralized error-handling middleware be defined in an Express.js application so that Express recognizes it as an error handler?',
    options: [
      { id: 'opt_1', text: 'app.use((req, res, next, err) => { ... })' },
      { id: 'opt_2', text: 'app.use((err, req, res, next) => { ... }) with exactly 4 parameters' },
      { id: 'opt_3', text: 'app.onError((error) => { ... })' },
      { id: 'opt_4', text: 'app.use(async (req, res) => { try { ... } catch (e) { ... } })' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Express inspects middleware function arity (fn.length). A middleware function with exactly four arguments (err, req, res, next) is treated as an error handler.',
    difficulty: 'EASY',
    skillId: 'nodejs',
    dimension: 'Error Handling',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-node-03',
    type: 'debugging',
    question: 'What serious flaw exists in this Express authentication middleware?',
    codeSnippet: `function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  }
  const user = verifyToken(token);
  req.user = user;
  next();
}`,
    options: [
      { id: 'opt_1', text: 'Authorization headers can never be read via bracket notation.' },
      { id: 'opt_2', text: 'Missing return statement after sending 401 response; code execution continues to verifyToken and calls next(), resulting in "Cannot set headers after they are sent to the client".' },
      { id: 'opt_3', text: 'Express middleware cannot attach custom properties to req.' },
      { id: 'opt_4', text: 'verifyToken must run in a separate Worker Thread.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Calling res.status(401).json(...) does not halt function execution. Without a return statement, verifyToken(undefined) executes and next() is invoked, crashing or corrupting the response flow.',
    difficulty: 'MEDIUM',
    skillId: 'nodejs',
    dimension: 'Middleware',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 3. SQL & DATABASES DOMAIN
  // Dimensions: Querying, Joins, Data Modeling, Indexes, Query Optimization, Transactions
  // =========================================================================
  {
    id: 'qb-sql-01',
    type: 'sql',
    question: 'Given the candidates and skill_scores tables, which SQL query retrieves each candidate with their average score, filtering only for candidates with at least 3 evaluated skills and an average score >= 80?',
    options: [
      {
        id: 'opt_1',
        text: 'SELECT c.id, c.full_name, AVG(s.score) FROM candidates c JOIN skill_scores s ON c.id = s.candidate_id WHERE COUNT(s.id) >= 3 AND AVG(s.score) >= 80 GROUP BY c.id, c.full_name;',
      },
      {
        id: 'opt_2',
        text: 'SELECT c.id, c.full_name, AVG(s.score) FROM candidates c JOIN skill_scores s ON c.id = s.candidate_id GROUP BY c.id, c.full_name HAVING COUNT(s.id) >= 3 AND AVG(s.score) >= 80;',
      },
      {
        id: 'opt_3',
        text: 'SELECT c.id, c.full_name, AVG(s.score) FROM candidates c WHERE s.score >= 80 GROUP BY c.id;',
      },
      {
        id: 'opt_4',
        text: 'SELECT c.id, c.full_name FROM candidates c WHERE EXISTS (SELECT 1 FROM skill_scores WHERE count >= 3);',
      },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Aggregate function filters (COUNT and AVG) must be placed in the HAVING clause after grouping by candidate identity. The WHERE clause filters row records prior to grouping.',
    difficulty: 'MEDIUM',
    skillId: 'sql',
    dimension: 'Querying',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-sql-02',
    type: 'scenario',
    question: 'A database table contains 10,000,000 evidence records. Queries filtering by `WHERE user_id = $1 AND skill_id = $2 ORDER BY created_at DESC` are taking 2,400ms. Which index strategy will optimize this query to < 5ms?',
    options: [
      { id: 'opt_1', text: 'Create separate single-column indexes on user_id, skill_id, and created_at.' },
      { id: 'opt_2', text: 'Create a composite B-Tree index: CREATE INDEX idx_ev_user_skill_date ON evidence(user_id, skill_id, created_at DESC);' },
      { id: 'opt_3', text: 'Convert the table to an unindexed NoSQL document store.' },
      { id: 'opt_4', text: 'Run VACUUM FULL every 5 minutes in a cron job.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'A composite index matching the exact equality filters (user_id, skill_id) followed by the sort order column (created_at DESC) allows the query planner to perform an index seek without requiring an in-memory Sort or Bitmap Heap Scan.',
    difficulty: 'HARD',
    skillId: 'sql',
    dimension: 'Indexes',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-sql-03',
    type: 'multiple-select',
    question: 'Which of the following ACID transaction properties and isolation levels are accurately described? (Select all that apply)',
    options: [
      { id: 'opt_1', text: 'Atomicity guarantees that all statements in a transaction complete successfully, or all changes are rolled back.' },
      { id: 'opt_2', text: 'Read Committed prevents Dirty Reads by ensuring queries only see data committed before the statement began.' },
      { id: 'opt_3', text: 'Serializable isolation eliminates Phantom Reads by simulating serial execution.' },
      { id: 'opt_4', text: 'Durability means uncommitted memory buffers are guaranteed to survive a power failure.' },
    ],
    correctAnswers: ['opt_1', 'opt_2', 'opt_3'],
    explanation:
      'Durability guarantees that once a transaction has committed, its changes survive crashes via write-ahead logging (WAL). It does not apply to uncommitted transactions.',
    difficulty: 'HARD',
    skillId: 'sql',
    dimension: 'Transactions',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 4. SECURITY & AUTHENTICATION DOMAIN
  // Dimensions: Authentication, Authorization, Input Validation, Common Vulnerabilities, Secure API Design
  // =========================================================================
  {
    id: 'qb-sec-01',
    type: 'scenario',
    question: 'How should sensitive authentication tokens (such as JWT session tokens) be stored in a web browser to best protect against Cross-Site Scripting (XSS) credential theft?',
    options: [
      { id: 'opt_1', text: 'In localStorage with an encrypted AES key in a global window variable.' },
      { id: 'opt_2', text: 'In an HttpOnly, Secure, SameSite=Lax cookie managed by the authentication server.' },
      { id: 'opt_3', text: 'In a public IndexedDB database accessible across any subdomain.' },
      { id: 'opt_4', text: 'As a URL query parameter appended to every internal router link.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Cookies flagged with HttpOnly cannot be accessed by client-side JavaScript (e.g. document.cookie), making it impossible for injected malicious XSS scripts to read and exfiltrate the token.',
    difficulty: 'MEDIUM',
    skillId: 'security',
    dimension: 'Secure Storage',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-sec-02',
    type: 'debugging',
    question: 'Which vulnerability exists in the following backend code, and what is the proper remediation?',
    codeSnippet: `app.get('/api/users', async (req, res) => {
  const role = req.query.role;
  const query = "SELECT * FROM profiles WHERE role = '" + role + "'";
  const results = await db.query(query);
  res.json(results.rows);
});`,
    options: [
      { id: 'opt_1', text: 'Cross-Site Request Forgery (CSRF); remediate by adding a CSRF token header.' },
      { id: 'opt_2', text: 'SQL Injection; remediate by using parameterized queries: db.query("SELECT * FROM profiles WHERE role = $1", [role]).' },
      { id: 'opt_3', text: 'Server-Side Request Forgery (SSRF); remediate by validating domain IP addresses.' },
      { id: 'opt_4', text: 'Memory leak; remediate by wrapping results in a stream.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Direct string concatenation of untrusted input into SQL statements enables SQL Injection (e.g. role = "\' OR 1=1 --"). Parameterized queries separate query structure from user data at the database driver level.',
    difficulty: 'EASY',
    skillId: 'security',
    dimension: 'Input Validation',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-sec-03',
    type: 'architecture',
    question: 'What is the primary difference between Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC)?',
    options: [
      { id: 'opt_1', text: 'RBAC assigns permissions directly to user roles (e.g., student, admin), whereas ABAC evaluates contextual attributes (e.g., user identity, resource ownership, time of day).' },
      { id: 'opt_2', text: 'RBAC is only used in frontend routers; ABAC is only used in database triggers.' },
      { id: 'opt_3', text: 'RBAC requires blockchain tokens; ABAC requires biometric hashing.' },
      { id: 'opt_4', text: 'There is no difference; they are synonymous terms in OAuth 2.0.' },
    ],
    correctAnswers: ['opt_1'],
    explanation:
      'RBAC statically grants access based on discrete roles assigned to a subject. ABAC dynamically computes access based on policy rules evaluating subject, object, action, and environmental attributes (such as "is this candidate accessing their own attempt before expires_at?").',
    difficulty: 'MEDIUM',
    skillId: 'security',
    dimension: 'Authorization',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 5. GIT & COLLABORATIVE WORKFLOW DOMAIN
  // Dimensions: Branching, Commits, Merging, Conflict Resolution, Pull Requests, Workflow
  // =========================================================================
  {
    id: 'qb-git-01',
    type: 'scenario',
    question: 'You are working on a feature branch `feature/auth` and need to integrate the latest changes from `main` without creating unnecessary merge bubbles in git log. Which command workflow should you execute?',
    options: [
      { id: 'opt_1', text: 'git checkout main && git merge --strategy=ours feature/auth' },
      { id: 'opt_2', text: 'git checkout feature/auth && git rebase main' },
      { id: 'opt_3', text: 'git push --force origin main' },
      { id: 'opt_4', text: 'git reset --hard HEAD~10' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Rebasing your feature branch onto main replays your local feature commits cleanly on top of main’s latest HEAD, preserving a linear project history without creating a merge commit.',
    difficulty: 'MEDIUM',
    skillId: 'git',
    dimension: 'Branching',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-git-02',
    type: 'debugging',
    question: 'During a `git merge`, Git reports: "CONFLICT (content): Merge conflict in src/scoring.ts". What must you do before completing the merge commit?',
    options: [
      { id: 'opt_1', text: 'Delete the .git directory and clone the repository again.' },
      { id: 'opt_2', text: 'Open src/scoring.ts, resolve the <<<<<<< HEAD and >>>>>>> conflict markers, stage the resolved file with `git add src/scoring.ts`, and commit.' },
      { id: 'opt_3', text: 'Run `git checkout -f` to discard all remote changes.' },
      { id: 'opt_4', text: 'Change the remote URL to bypass the merge constraint.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Conflict markers must be manually inspected and resolved so code compiles cleanly, followed by staging (git add) and committing to finalize the merge resolution.',
    difficulty: 'EASY',
    skillId: 'git',
    dimension: 'Conflict Resolution',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 6. TESTING & DIAGNOSTICS DOMAIN
  // Dimensions: Unit Testing, Integration Testing, Assertions, Mocking, Coverage, Debugging
  // =========================================================================
  {
    id: 'qb-test-01',
    type: 'scenario',
    question: 'When writing unit tests for a service that communicates with a third-party payment or notification gateway, what is the best testing practice?',
    options: [
      { id: 'opt_1', text: 'Send real API calls to the production payment gateway in every test run.' },
      { id: 'opt_2', text: 'Mock or stub the external gateway client to verify that your service handles success, rate-limiting, and error responses deterministically.' },
      { id: 'opt_3', text: 'Skip writing tests for any component that interacts with external networks.' },
      { id: 'opt_4', text: 'Hardcode a 5-second sleep in the test suite.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Unit tests must be fast, isolated, and deterministic. Mocking external services prevents network flakiness, avoids unintended external side effects, and allows testing corner cases like 503 errors.',
    difficulty: 'MEDIUM',
    skillId: 'testing',
    dimension: 'Mocking',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-test-02',
    type: 'mcq',
    question: 'In test-driven development (TDD), what does the "Red-Green-Refactor" cycle prescribe?',
    options: [
      { id: 'opt_1', text: 'Write a failing test first (Red), write the minimal code to pass the test (Green), then improve code quality without changing behavior (Refactor).' },
      { id: 'opt_2', text: 'Write code first (Red), debug until it builds (Green), deploy to staging (Refactor).' },
      { id: 'opt_3', text: 'Measure test coverage (Red), delete unexercised files (Green), write documentation (Refactor).' },
      { id: 'opt_4', text: 'Run Git linter (Red), fix warning colors (Green), merge PR (Refactor).' },
    ],
    correctAnswers: ['opt_1'],
    explanation:
      'TDD starts with a failing specification (Red), writes just enough implementation to pass (Green), and cleans up duplication and architecture while maintaining green tests (Refactor).',
    difficulty: 'EASY',
    skillId: 'testing',
    dimension: 'Unit Testing',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 7. DEPLOYMENT & DEVOPS DOMAIN
  // Dimensions: Builds, Environment Configuration, Deployment, Logging, Monitoring, Production Readiness
  // =========================================================================
  {
    id: 'qb-dep-01',
    type: 'architecture',
    question: 'Why are multi-stage Docker builds recommended when packaging full-stack Node.js and Next.js applications for production deployment?',
    options: [
      { id: 'opt_1', text: 'Multi-stage builds allow compiling assets with heavy build tools in an intermediate stage, copying only production artifacts and runtime dependencies into the lean final image.' },
      { id: 'opt_2', text: 'They automatically configure public DNS records on AWS Route53.' },
      { id: 'opt_3', text: 'They bypass Linux kernel security limits.' },
      { id: 'opt_4', text: 'They convert all server-side routes to static HTML files.' },
    ],
    correctAnswers: ['opt_1'],
    explanation:
      'Multi-stage Dockerfiles dramatically reduce production image footprint (from ~1.5GB to <150MB) and decrease attack surface by excluding TypeScript compilers, devDependencies, and raw source code from production containers.',
    difficulty: 'MEDIUM',
    skillId: 'deployment',
    dimension: 'Builds',
    marks: 10,
    status: 'active',
    version: 1,
  },
  {
    id: 'qb-dep-02',
    type: 'scenario',
    question: 'Your production web service is returning intermittent 502 Bad Gateway errors under traffic spikes. The server logs show CPU usage at 25% but error messages stating `Error: connect ECONNREFUSED` to PostgreSQL port 5432. What is the most likely root cause?',
    options: [
      { id: 'opt_1', text: 'The React bundle was compiled without minification.' },
      { id: 'opt_2', text: 'Database connection exhaustion: Node.js spawned too many unpooled connections, exceeding PostgreSQL’s max_connections limit.' },
      { id: 'opt_3', text: 'The browser cache expired prematurely.' },
      { id: 'opt_4', text: 'Git commit hash was not injected into package.json.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'Without connection pooling (e.g. pg-pool or PgBouncer), concurrent Node.js processes attempt to open individual socket connections. Once PostgreSQL reaches max_connections, it refuses new TCP connections, resulting in ECONNREFUSED.',
    difficulty: 'HARD',
    skillId: 'deployment',
    dimension: 'Production Readiness',
    marks: 10,
    status: 'active',
    version: 1,
  },

  // =========================================================================
  // 8. WEB FUNDAMENTALS DOMAIN
  // Dimensions: HTTP Protocols, Client-Server, Browser Architecture
  // =========================================================================
  {
    id: 'qb-web-01',
    type: 'mcq',
    question: 'What is the purpose of the HTTP `Cache-Control: public, max-age=31536000, immutable` header on hashed static JavaScript assets?',
    options: [
      { id: 'opt_1', text: 'It forces the browser to revalidate with the server on every page refresh using 304 Not Modified.' },
      { id: 'opt_2', text: 'It instructs browsers and intermediate CDNs to cache the asset for 1 year without revalidation, as content changes will yield a new file URL hash.' },
      { id: 'opt_3', text: 'It restricts the file from being downloaded by any user agent other than Google Chrome.' },
      { id: 'opt_4', text: 'It encrypts the JavaScript bundle using an SSL cipher.' },
    ],
    correctAnswers: ['opt_2'],
    explanation:
      'The immutable directive indicates that the resource content will never change during its valid lifetime. In cache-busting workflows where filenames contain content hashes, this avoids unnecessary conditional HTTP revalidation requests.',
    difficulty: 'EASY',
    skillId: 'web-fundamentals',
    dimension: 'HTTP Protocols',
    marks: 10,
    status: 'active',
    version: 1,
  },
];

// ===========================================================================
// PRE-CONFIGURED ASSESSMENTS GENERATED FROM QUESTION POOL
// ===========================================================================
export const SEED_ASSESSMENTS: AssessmentConfig[] = [
  {
    id: 'ass-fullstack-core',
    title: 'Full Stack Engineering Competency Assessment',
    description:
      'Comprehensive, proctored evaluation testing end-to-end full stack architecture: React lifecycle & state, Node.js concurrency, relational databases & query optimization, web security, git collaboration, testing, and production deployment.',
    courseId: 'full-stack-development',
    skillId: 'full-stack',
    skills: ['react', 'nodejs', 'sql', 'security', 'git', 'testing', 'deployment', 'web-fundamentals'],
    dimensions: [
      'State Management',
      'Hooks',
      'Server Fundamentals',
      'Middleware',
      'Querying',
      'Indexes',
      'Authorization',
      'Input Validation',
      'Branching',
      'Unit Testing',
      'Production Readiness',
    ],
    durationMinutes: 45,
    passingThreshold: 70, // 70% threshold
    maxAttempts: 3,
    totalMarks: 100,
    questionCount: 10,
    difficultyDistribution: { EASY: 2, MEDIUM: 5, HARD: 3 },
    randomizeQuestions: true,
    randomizeOptions: true,
    status: 'active',
  },
  {
    id: 'ass-mod-05',
    title: 'React Component Architecture Assessment',
    description:
      'Evaluation of React component composition, hook rules, state reconciliation, performance optimization, and concurrent abstractions.',
    courseId: 'full-stack-development',
    skillId: 'react',
    skills: ['react'],
    dimensions: ['Component Design', 'State Management', 'Hooks', 'API Integration', 'Architecture'],
    durationMinutes: 30,
    passingThreshold: 70,
    maxAttempts: 3,
    totalMarks: 40,
    questionCount: 4,
    difficultyDistribution: { EASY: 0, MEDIUM: 2, HARD: 2 },
    randomizeQuestions: true,
    randomizeOptions: true,
    status: 'active',
  },
  {
    id: 'ass-mod-08',
    title: 'Backend, Databases & Security Assessment',
    description:
      'Advanced assessment covering relational schema design, SQL optimization, ACID transactions, Express middleware, JWT storage, and cybersecurity vulnerability prevention.',
    courseId: 'full-stack-development',
    skillId: 'sql',
    skills: ['nodejs', 'sql', 'security'],
    dimensions: ['Server Fundamentals', 'Querying', 'Indexes', 'Input Validation', 'Authorization'],
    durationMinutes: 35,
    passingThreshold: 70,
    maxAttempts: 3,
    totalMarks: 60,
    questionCount: 6,
    difficultyDistribution: { EASY: 1, MEDIUM: 3, HARD: 2 },
    randomizeQuestions: true,
    randomizeOptions: true,
    status: 'active',
  },
];
