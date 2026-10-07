-- ==============================================================================
-- SEVA SKILL PASSPORT — Seed Data
-- ==============================================================================
-- Seed file for courses, modules, lessons, skills, challenges, projects & assessments
-- ==============================================================================

-- 1. SEED COURSES
insert into public.courses (id, slug, title, description, category, level, price, status)
values
  ('full-stack-development', 'full-stack-development', 'Full Stack Developer', 'From web fundamentals to production-style full stack development with verifiable evidence of ability.', 'Full Stack', 'Beginner → Advanced', 100, 'active'),
  ('ai-ml', 'ai-ml', 'AI & Machine Learning', 'Build intelligent applications with Python, ML algorithms, and modern AI frameworks.', 'AI & Data', 'Intermediate → Advanced', 100, 'coming-soon'),
  ('data-analytics', 'data-analytics', 'Data Analytics', 'Turn raw data into insights with SQL, Python, and modern visualization tools.', 'Data Analytics', 'Beginner → Intermediate', 100, 'coming-soon'),
  ('cybersecurity', 'cybersecurity', 'Cybersecurity', 'Protect systems and networks with hands-on security skills.', 'Cybersecurity', 'Beginner → Advanced', 100, 'coming-soon'),
  ('cloud-computing', 'cloud-computing', 'Cloud Computing', 'Design, deploy and manage scalable cloud infrastructure.', 'Cloud & Infra', 'Intermediate', 100, 'coming-soon'),
  ('devops', 'devops', 'DevOps', 'Bridge development and operations with modern CI/CD and automation practices.', 'DevOps', 'Intermediate → Advanced', 100, 'coming-soon')
on conflict (id) do nothing;

-- 2. SEED 12 COURSE MODULES (Full Stack Developer)
insert into public.course_modules (id, course_id, module_number, title, description, sort_order)
values
  ('mod-01', 'full-stack-development', '01', 'Web Fundamentals', 'How the web works: DNS, HTTP protocols, Client-Server architecture and browser internals.', 1),
  ('mod-02', 'full-stack-development', '02', 'HTML & CSS', 'Semantic HTML5 structure, modern responsive design with Flexbox and CSS Grid, accessibility.', 2),
  ('mod-03', 'full-stack-development', '03', 'JavaScript', 'Core ECMAScript language fundamentals, scopes, closures, higher-order functions, DOM API.', 3),
  ('mod-04', 'full-stack-development', '04', 'Advanced JavaScript', 'Asynchronous execution, Promises, Async/Await, the Event Loop, and browser Web APIs.', 4),
  ('mod-05', 'full-stack-development', '05', 'React', 'Component-driven UI architecture, JSX, hooks, state lifecycle, custom hooks, and Virtual DOM.', 5),
  ('mod-06', 'full-stack-development', '06', 'Node.js', 'Server-side JavaScript runtime, event-driven I/O, NPM package ecosystem, and file system.', 6),
  ('mod-07', 'full-stack-development', '07', 'REST APIs', 'Designing clean HTTP APIs, Express middleware, status codes, query validation, and documentation.', 7),
  ('mod-08', 'full-stack-development', '08', 'Databases', 'Relational database modeling with PostgreSQL, SQL queries, indexing, and transactional integrity.', 8),
  ('mod-09', 'full-stack-development', '09', 'Authentication', 'Token-based authentication, JWTs, hashing with bcrypt, session security, and role-based access.', 9),
  ('mod-10', 'full-stack-development', '10', 'Git & GitHub', 'Distributed version control, branching workflows, pull requests, resolving merge conflicts.', 10),
  ('mod-11', 'full-stack-development', '11', 'Testing', 'Automated testing pyramid: unit tests with Vitest, React Testing Library, and API integration tests.', 11),
  ('mod-12', 'full-stack-development', '12', 'Deployment', 'Production containerization with Docker, CI/CD pipelines, environment config, and cloud deployment.', 12)
on conflict (id) do nothing;

-- 3. SEED LESSONS (Sample lessons across modules)
insert into public.lessons (id, module_id, title, description, content_type, video_url, duration_minutes, sort_order, is_published)
values
  ('les-01-01', 'mod-01', 'How the Web Works: DNS, HTTP, Client-Server', 'Deep dive into packet flow from domain name lookup to browser rendering.', 'video', null, 18, 1, true),
  ('les-01-02', 'mod-01', 'Browser Rendering Engine & DOM Tree', 'Understanding critical rendering path and reflow/repaint operations.', 'video', null, 22, 2, true),
  ('les-01-03', 'mod-01', 'Web Architecture Knowledge Check', 'Conceptual quiz testing understanding of client-server interaction.', 'quiz', null, 15, 3, true),
  ('les-02-01', 'mod-02', 'Semantic HTML5 Elements & Accessibility', 'Building accessible markup conforming to WCAG standards.', 'video', null, 24, 1, true),
  ('les-02-02', 'mod-02', 'CSS Flexbox & Grid Masterclass', 'Building complex responsive layouts without frameworks.', 'video', null, 35, 2, true),
  ('les-02-03', 'mod-02', 'Responsive Layout Challenge Lab', 'Hands-on coding exercise creating a mobile-first responsive dashboard.', 'lab', null, 45, 3, true),
  ('les-03-01', 'mod-03', 'Data Types, Scope & Execution Context', 'Lexical scope, memory heaps, call stack, and variable lifecycles.', 'video', null, 28, 1, true),
  ('les-03-02', 'mod-03', 'Functions, Hoisting & Closures', 'Deep dive into functional scope and practical use of closures in libraries.', 'video', null, 30, 2, true),
  ('les-03-03', 'mod-03', 'DOM Manipulation & Event Listeners Lab', 'Interactive lab building dynamic UI interactions with event delegation.', 'lab', null, 40, 3, true),
  ('les-04-01', 'mod-04', 'Prototypes, Classes & OOP in JS', 'Prototypal inheritance model and modern ES6 class syntax.', 'video', null, 26, 1, true),
  ('les-04-02', 'mod-04', 'Promises, Async/Await & Event Loop', 'Mastering asynchronous execution flow and the microtask queue.', 'video', null, 34, 2, true),
  ('les-04-03', 'mod-04', 'API Fetching & Error Handling Lab', 'Hands-on lab fetching remote datasets with resilient error fallbacks.', 'lab', null, 50, 3, true),
  ('les-05-01', 'mod-05', 'JSX, Props and Virtual DOM', 'Understanding component composition and React diffing algorithm.', 'video', null, 30, 1, true),
  ('les-05-02', 'mod-05', 'State Management with useState and useEffect', 'Lifecycle sync and reactive component state patterns.', 'video', null, 38, 2, true),
  ('les-05-03', 'mod-05', 'Custom Hooks & Reusable Logic Lab', 'Hands-on lab building custom hooks for network status and debouncing.', 'lab', null, 60, 3, true)
on conflict (id) do nothing;

-- 4. SEED SKILLS
insert into public.skills (id, name, category, description)
values
  ('html-css', 'HTML/CSS', 'Frontend', 'Semantic structure, accessible layout design, Flexbox and CSS Grid.'),
  ('javascript', 'JavaScript', 'Frontend', 'Core JavaScript, ES6+, closures, event loop, and asynchronous programming.'),
  ('react', 'React', 'Frontend', 'Component lifecycle, hooks, state management, and Virtual DOM rendering.'),
  ('nodejs', 'Node.js', 'Backend', 'Event-driven server runtime, stream processing, and NPM package architecture.'),
  ('rest-api', 'REST API', 'Backend', 'RESTful API principles, Express route design, query handling, and status codes.'),
  ('sql', 'SQL', 'Database', 'Relational querying, joins, aggregation, and performance optimization.'),
  ('postgresql', 'PostgreSQL', 'Database', 'Schema constraints, indexes, transactional isolation, and PostgreSQL extensions.'),
  ('git', 'Git', 'Engineering', 'Distributed version control, branch management, merge conflict resolution.'),
  ('testing', 'Testing', 'Engineering', 'Automated unit, integration, and end-to-end testing practices.'),
  ('debugging', 'Debugging', 'Engineering', 'Runtime profiling, devtools diagnostics, stack trace analysis, and troubleshooting.'),
  ('security', 'Security', 'Security', 'Web application security best practices, JWT handling, and input sanitization.'),
  ('deployment', 'Deployment', 'Engineering', 'Containerization, CI/CD automation, environment hygiene, and cloud hosting.')
on conflict (id) do nothing;

-- 5. SEED CHALLENGES
insert into public.challenges (id, title, description, skill_id, difficulty, language, starter_code, test_definition, time_limit_minutes, status)
values
  (
    'ch-01',
    'Array Pipeline & Data Aggregation',
    'Given an array of student assessment scores, write a function getTopCompetencies(scores, threshold) that filters skills with scores above the threshold and returns their names sorted in descending order of score.',
    'javascript',
    'Medium',
    'javascript',
    'function getTopCompetencies(scores, threshold) {\n  // Your code here\n  return scores\n    .filter(item => item.score >= threshold)\n    .sort((a, b) => b.score - a.score)\n    .map(item => item.name);\n}',
    '[{"input": "threshold = 80", "expected": "[\"Git\", \"JavaScript\", \"React\"]"}, {"input": "threshold = 90", "expected": "[\"Git\", \"JavaScript\"]"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-02',
    'Async Retry Utility with Exponential Backoff',
    'Implement fetchWithRetry(fn, maxRetries, delay) that attempts to execute an asynchronous promise returning function up to maxRetries times before rejecting.',
    'javascript',
    'Hard',
    'javascript',
    'async function fetchWithRetry(fn, maxRetries = 3, delay = 200) {\n  let attempts = 0;\n  while (attempts < maxRetries) {\n    try {\n      return await fn();\n    } catch (err) {\n      attempts++;\n      if (attempts >= maxRetries) throw err;\n      await new Promise(res => setTimeout(res, delay * attempts));\n    }\n  }\n}',
    '[{"input": "Transient failure", "expected": "Resolved value on retry"}]'::jsonb,
    30,
    'active'
  ),
  (
    'ch-03',
    'Custom Hook: useDebounce',
    'Write a custom React hook useDebounce(value, delay) that delays updating a search value until a set period of user typing inactivity has elapsed.',
    'react',
    'Medium',
    'javascript',
    'function useDebounce(value, delay = 300) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}',
    '[{"input": "Rapid keystrokes within 200ms", "expected": "Single final state update"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-04',
    'Aggregating Candidate Competencies via SQL',
    'Write an ANSI SQL query to compute the average competency score and count of certified challenges for each candidate grouped by category.',
    'sql',
    'Easy',
    'sql',
    'SELECT candidate_id, category, ROUND(AVG(score), 2) AS avg_competency, COUNT(id) AS total_evidence_items FROM candidate_evidence GROUP BY candidate_id, category HAVING AVG(score) >= 75 ORDER BY avg_competency DESC;',
    '[{"input": "Candidate evidence records", "expected": "Summarized competency groups"}]'::jsonb,
    20,
    'active'
  )
on conflict (id) do nothing;

-- 6. SEED PROJECTS
insert into public.projects (id, title, description, difficulty, course_id, status)
values
  (
    'proj-001',
    'Task Management System',
    'A full stack task management application with user authentication, real-time updates, and role-based access control.',
    'Medium',
    'full-stack-development',
    'active'
  ),
  (
    'proj-002',
    'E-Commerce REST API',
    'A production-ready REST API for an e-commerce platform with product management, orders, and payment integration.',
    'Hard',
    'full-stack-development',
    'active'
  )
on conflict (id) do nothing;

-- 7. SEED ASSESSMENTS
insert into public.assessments (id, title, description, course_id, skill_id, assessment_type, duration_minutes, status)
values
  ('ass-01', 'Full Stack Practical Assessment', 'Timed proctored evaluation testing end-to-end full stack architecture capability.', 'full-stack-development', 'javascript', 'coding', 60, 'active'),
  ('ass-02', 'JavaScript Core Principles Evaluation', 'Comprehensive assessment covering asynchronous patterns, closures, and performance.', 'full-stack-development', 'javascript', 'theory', 45, 'active'),
  ('ass-03', 'React Component Architecture Assessment', 'Evaluates understanding of React hooks, memoization, and rendering optimization.', 'full-stack-development', 'react', 'coding', 45, 'active'),
  ('ass-04', 'SQL & Relational Schema Assessment', 'Assesses relational schema design, normal forms, and query optimization.', 'full-stack-development', 'sql', 'theory', 45, 'active')
on conflict (id) do nothing;
