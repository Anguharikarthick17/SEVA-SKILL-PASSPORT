-- ==============================================================================
-- SEVA SKILL PASSPORT — Complete Curriculum Seed Data (Phase 3A)
-- ==============================================================================
-- Rerunnable seed script populating 12 modules, 111 lessons, skills, labs,
-- coding challenges, assessments, and capstone projects.
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

-- 2. SEED 12 COURSE MODULES
insert into public.course_modules (id, course_id, module_number, title, description, sort_order)
values
  ('mod-01', 'full-stack-development', '01', 'Web Fundamentals', 'How the web works: DNS, HTTP protocols, Client-Server architecture and browser internals.', 1),
  ('mod-02', 'full-stack-development', '02', 'HTML & CSS', 'Semantic HTML5 structure, modern responsive design with Flexbox and CSS Grid, accessibility.', 2),
  ('mod-03', 'full-stack-development', '03', 'JavaScript Fundamentals', 'Core ECMAScript language fundamentals, variables, loops, functions, arrays, objects, scope, error handling.', 3),
  ('mod-04', 'full-stack-development', '04', 'Advanced JavaScript', 'Asynchronous execution, Promises, Async/Await, browser Event Loop, closures, ES modules, and debugging.', 4),
  ('mod-05', 'full-stack-development', '05', 'React', 'Component architecture, Virtual DOM, JSX, Props, Hooks (useState, useEffect), custom hooks, forms.', 5),
  ('mod-06', 'full-stack-development', '06', 'Node.js', 'Server-side JavaScript runtime, V8 engine, asynchronous I/O, npm, file system, HTTP server, Express.', 6),
  ('mod-07', 'full-stack-development', '07', 'REST APIs', 'Designing clean HTTP APIs, Express middleware, status codes, query validation, and documentation.', 7),
  ('mod-08', 'full-stack-development', '08', 'Databases', 'Relational database modeling with PostgreSQL, SQL queries, indexing, and transactional integrity.', 8),
  ('mod-09', 'full-stack-development', '09', 'Authentication & Security', 'Token-based authentication, JWTs, hashing with bcrypt, session security, and role-based access.', 9),
  ('mod-10', 'full-stack-development', '10', 'Git & GitHub', 'Distributed version control, branching workflows, pull requests, resolving merge conflicts.', 10),
  ('mod-11', 'full-stack-development', '11', 'Testing', 'Automated testing pyramid: unit tests with Vitest, React Testing Library, and API integration tests.', 11),
  ('mod-12', 'full-stack-development', '12', 'Deployment', 'Production containerization with Docker, CI/CD pipelines, environment config, and cloud deployment.', 12)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- 3. SEED SKILLS
insert into public.skills (id, name, category, description)
values
  ('web-fundamentals', 'Web Fundamentals', 'Frontend', 'Internet networking, HTTP/HTTPS protocols, DNS resolution, and browser rendering lifecycle.'),
  ('html-css', 'HTML/CSS', 'Frontend', 'Semantic structure, accessible layout design, Flexbox and CSS Grid.'),
  ('responsive-design', 'Responsive Design', 'Frontend', 'Mobile-first design principles, fluid viewport units, and breakpoint calculation.'),
  ('accessibility', 'Accessibility', 'Frontend', 'WCAG compliance, screen reader compatibility, and ARIA landmarks.'),
  ('javascript', 'JavaScript', 'Frontend', 'Core JavaScript, ES6+, closures, event loop, and asynchronous programming.'),
  ('async-programming', 'Async Programming', 'Engineering', 'Promises, async/await, microtask queues, and event loop timing.'),
  ('react', 'React', 'Frontend', 'Component lifecycle, hooks, state management, and Virtual DOM rendering.'),
  ('nodejs', 'Node.js', 'Backend', 'Event-driven server runtime, stream processing, and NPM package architecture.'),
  ('rest-api', 'REST API', 'Backend', 'RESTful API principles, Express route design, query handling, and status codes.'),
  ('backend-development', 'Backend Development', 'Backend', 'Server-side business logic, middleware architecture, and service layer design.'),
  ('sql', 'SQL', 'Database', 'Relational querying, joins, aggregation, and performance optimization.'),
  ('postgresql', 'PostgreSQL', 'Database', 'Schema constraints, indexes, transactional isolation, and PostgreSQL extensions.'),
  ('database-design', 'Database Design', 'Database', 'Relational normalization, schema modeling, and primary/foreign key relationships.'),
  ('authentication', 'Authentication', 'Security', 'User identity verification, password hashing, and token lifecycles.'),
  ('security', 'Security', 'Security', 'Web application security best practices, JWT handling, input sanitization, and XSS/SQLi defense.'),
  ('git', 'Git', 'Engineering', 'Distributed version control, branch management, merge conflict resolution.'),
  ('testing', 'Testing', 'Engineering', 'Automated unit, integration, and end-to-end testing practices.'),
  ('debugging', 'Debugging', 'Engineering', 'Runtime profiling, devtools diagnostics, stack trace analysis, and troubleshooting.'),
  ('deployment', 'Deployment', 'Engineering', 'Containerization, CI/CD automation, environment hygiene, and cloud hosting.'),
  ('devops-fundamentals', 'DevOps Fundamentals', 'Engineering', 'Infrastructure deployment, container registries, and continuous integration.')
on conflict (id) do nothing;

-- 4. SEED 111 LESSONS ACROSS 12 MODULES
insert into public.lessons (id, module_id, title, description, content_type, duration_minutes, sort_order, is_published)
values
  -- Module 01: Web Fundamentals (6 lessons)
  ('les-01-01', 'mod-01', 'How the Web Works', 'Distributed architecture connecting clients and web servers over IP networks.', 'reading', 15, 1, true),
  ('les-01-02', 'mod-01', 'Client vs Server', 'Delineating responsibilities between untrusted clients and authoritative servers.', 'reading', 18, 2, true),
  ('les-01-03', 'mod-01', 'HTTP and HTTPS', 'Hypertext Transfer Protocol semantics and Transport Layer Security (TLS) encryption.', 'reading', 20, 3, true),
  ('les-01-04', 'mod-01', 'Request and Response', 'Structure of HTTP messages: Start line, Headers, Body, and Status Codes.', 'reading', 22, 4, true),
  ('les-01-05', 'mod-01', 'URLs, DNS and Hosting', 'Uniform Resource Locators, domain name resolution, and hosting architectures.', 'reading', 18, 5, true),
  ('les-01-06', 'mod-01', 'Browser Fundamentals', 'The Critical Rendering Path: DOM construction, CSSOM, Layout, and Paint.', 'reading', 24, 6, true),

  -- Module 02: HTML & CSS (9 lessons)
  ('les-02-01', 'mod-02', 'HTML Document Structure', 'Doctype declaration, head metadata, viewport configuration, and document hierarchy.', 'reading', 15, 1, true),
  ('les-02-02', 'mod-02', 'Semantic HTML', 'Meaningful markup tags (<header>, <article>, <nav>, <aside>) and landmark navigation.', 'reading', 18, 2, true),
  ('les-02-03', 'mod-02', 'Forms and Inputs', 'Accessible data collection interfaces with input types and validation constraints.', 'reading', 22, 3, true),
  ('les-02-04', 'mod-02', 'Accessibility Fundamentals', 'WCAG compliance: Color contrast, keyboard focus rings, alt text, and ARIA.', 'reading', 20, 4, true),
  ('les-02-05', 'mod-02', 'CSS Fundamentals', 'Selectors, specificity hierarchy, cascade rules, and custom properties (variables).', 'reading', 18, 5, true),
  ('les-02-06', 'mod-02', 'Box Model', 'Content, padding, border, margin, and predictable border-box sizing.', 'reading', 16, 6, true),
  ('les-02-07', 'mod-02', 'Flexbox', 'One-dimensional layouts: Main axis, cross axis, justify-content, and align-items.', 'reading', 22, 7, true),
  ('les-02-08', 'mod-02', 'CSS Grid', 'Two-dimensional layouts: Template columns, rows, areas, and auto-fit minmax.', 'reading', 24, 8, true),
  ('les-02-09', 'mod-02', 'Responsive Design', 'Mobile-first strategy, CSS media queries, fluid units, and responsive images.', 'reading', 20, 9, true),

  -- Module 03: JavaScript Fundamentals (10 lessons)
  ('les-03-01', 'mod-03', 'Variables and Data Types', 'Primitives, reference types, let vs const vs var, and type coercion.', 'reading', 18, 1, true),
  ('les-03-02', 'mod-03', 'Operators', 'Arithmetic, logical, nullish coalescing (??), and optional chaining (?.) operators.', 'reading', 15, 2, true),
  ('les-03-03', 'mod-03', 'Conditions', 'if/else branching, ternary expressions, and pattern matching switch statements.', 'reading', 15, 3, true),
  ('les-03-04', 'mod-03', 'Loops', 'for, for...of, for...in, while loops, and loop control statements.', 'reading', 16, 4, true),
  ('les-03-05', 'mod-03', 'Functions', 'Declarations, expressions, arrow functions, default parameters, and rest syntax.', 'reading', 22, 5, true),
  ('les-03-06', 'mod-03', 'Arrays', 'Immutable methods: map, filter, reduce, find, some, every, slice, and concat.', 'reading', 24, 6, true),
  ('les-03-07', 'mod-03', 'Objects', 'Object literals, property accessors, Object.keys/values/entries, and cloning.', 'reading', 20, 7, true),
  ('les-03-08', 'mod-03', 'Destructuring', 'Array and object destructuring, renaming, default values, and rest patterns.', 'reading', 18, 8, true),
  ('les-03-09', 'mod-03', 'Scope', 'Global scope, function scope, block scope, lexical environment, and shadowing.', 'reading', 20, 9, true),
  ('les-03-10', 'mod-03', 'Error Handling', 'try, catch, finally, custom Error classes, and error propagation.', 'reading', 20, 10, true),

  -- Module 04: Advanced JavaScript (10 lessons)
  ('les-04-01', 'mod-04', 'Higher-Order Functions', 'Functions as first-class citizens, composition, currying, and decorators.', 'reading', 20, 1, true),
  ('les-04-02', 'mod-04', 'Callbacks', 'Asynchronous callbacks, error-first patterns, and avoiding Callback Hell.', 'reading', 18, 2, true),
  ('les-04-03', 'mod-04', 'Promises', 'Promise lifecycle: Pending, Fulfilled, Rejected, chaining, and Promise.all.', 'reading', 24, 3, true),
  ('les-04-04', 'mod-04', 'Async/Await', 'Syntactic sugar over Promises for readable, linear asynchronous code.', 'reading', 22, 4, true),
  ('les-04-05', 'mod-04', 'Fetch API', 'Modern HTTP networking in the browser: Request, Response, Headers, and CORS.', 'reading', 22, 5, true),
  ('les-04-06', 'mod-04', 'Event Loop', 'Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue.', 'reading', 26, 6, true),
  ('les-04-07', 'mod-04', 'Closures', 'Lexical scoping, persistent outer function variables, data privacy, and factories.', 'reading', 22, 7, true),
  ('les-04-08', 'mod-04', 'Modules', 'ES Modules (import/export), default vs named exports, and CommonJS differences.', 'reading', 18, 8, true),
  ('les-04-09', 'mod-04', 'Local Storage', 'Client-side persistence: localStorage, sessionStorage, cookies, and quota limits.', 'reading', 16, 9, true),
  ('les-04-10', 'mod-04', 'Debugging Techniques', 'Chrome DevTools, debugger statements, breakpoints, and call stack inspection.', 'reading', 22, 10, true),

  -- Module 05: React (12 lessons)
  ('les-05-01', 'mod-05', 'React Fundamentals', 'Declarative UI paradigm, component model, Virtual DOM, and reconciliation.', 'reading', 18, 1, true),
  ('les-05-02', 'mod-05', 'Components', 'Functional components, component composition, single responsibility, and folder architecture.', 'reading', 20, 2, true),
  ('les-05-03', 'mod-05', 'JSX', 'Syntax extension for JavaScript: expressions, attributes, fragments, and compilation.', 'reading', 16, 3, true),
  ('les-05-04', 'mod-05', 'Props', 'Passing data to child components, prop immutability, children prop, and defaults.', 'reading', 18, 4, true),
  ('les-05-05', 'mod-05', 'State', 'Managing component memory with useState, updater functions, and immutable updates.', 'reading', 22, 5, true),
  ('les-05-06', 'mod-05', 'Events', 'Synthetic events, event handlers, passing arguments, and preventing default behavior.', 'reading', 18, 6, true),
  ('les-05-07', 'mod-05', 'Conditional Rendering', 'Rendering logic: if/else, ternary operator (? :), logical AND (&&), and guard clauses.', 'reading', 18, 7, true),
  ('les-05-08', 'mod-05', 'Lists and Keys', 'Rendering arrays with map(), stable key assignment, and reconciliation performance.', 'reading', 20, 8, true),
  ('les-05-09', 'mod-05', 'Forms', 'Controlled vs uncontrolled components, form validation, and multi-field handlers.', 'reading', 22, 9, true),
  ('les-05-10', 'mod-05', 'useEffect', 'Synchronizing with external systems: API fetching, timers, listeners, and cleanups.', 'reading', 26, 10, true),
  ('les-05-11', 'mod-05', 'Custom Hooks', 'Extracting and sharing stateful logic across components using custom hook abstractions.', 'reading', 24, 11, true),
  ('les-05-12', 'mod-05', 'Component Architecture', 'Presentational vs Container patterns, compound components, Context API, and state lifting.', 'reading', 26, 12, true),

  -- Module 06: Node.js (10 lessons)
  ('les-06-01', 'mod-06', 'Node.js Fundamentals', 'The V8 JavaScript engine, libuv asynchronous I/O, and non-blocking event-driven model.', 'reading', 18, 1, true),
  ('les-06-02', 'mod-06', 'npm', 'Node Package Manager: package.json, scripts, semantic versioning, and dependencies.', 'reading', 16, 2, true),
  ('les-06-03', 'mod-06', 'Modules', 'CommonJS (require, module.exports) and ES Modules (import, export) in Node.js.', 'reading', 18, 3, true),
  ('les-06-04', 'mod-06', 'File System', 'The fs module: asynchronous file reading, writing, streams, and path utilities.', 'reading', 22, 4, true),
  ('les-06-05', 'mod-06', 'Environment Variables', 'process.env, .env files, dotenv library, and configuration hygiene.', 'reading', 16, 5, true),
  ('les-06-06', 'mod-06', 'HTTP Server', 'Native node:http module: creating a server, parsing URLs, headers, and request streams.', 'reading', 20, 6, true),
  ('les-06-07', 'mod-06', 'Express', 'The Express framework: initialization, routing, request/response helpers, and body parsing.', 'reading', 22, 7, true),
  ('les-06-08', 'mod-06', 'Middleware', 'The middleware chain, req/res modification, next() function, and third-party middleware.', 'reading', 24, 8, true),
  ('les-06-09', 'mod-06', 'Error Handling', 'Express error-handling middleware (4 arguments), 404 handlers, and unhandled rejections.', 'reading', 22, 9, true),
  ('les-06-10', 'mod-06', 'Project Structure', 'Layered architecture: controllers, services, models, routes, and config separation.', 'reading', 20, 10, true),

  -- Module 07: REST APIs (10 lessons)
  ('les-07-01', 'mod-07', 'REST Fundamentals', 'Representational State Transfer constraints: Statelessness, Client-Server, Uniform Interface.', 'reading', 18, 1, true),
  ('les-07-02', 'mod-07', 'HTTP Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD: semantics and idempotency.', 'reading', 20, 2, true),
  ('les-07-03', 'mod-07', 'Status Codes', 'Standard HTTP response codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.', 'reading', 18, 3, true),
  ('les-07-04', 'mod-07', 'Route Design', 'Nested resources, plural naming, API versioning (/v1/), and sub-resource relationships.', 'reading', 18, 4, true),
  ('les-07-05', 'mod-07', 'Request Parameters', 'Route params (req.params), Query strings (req.query), and Request headers (req.headers).', 'reading', 16, 5, true),
  ('les-07-06', 'mod-07', 'Request Body', 'Parsing JSON payloads, handling binary multipart form data, and payload size limits.', 'reading', 16, 6, true),
  ('les-07-07', 'mod-07', 'Response Design', 'Designing consistent JSON envelopes, metadata wrappers, and date/time formatting.', 'reading', 18, 7, true),
  ('les-07-08', 'mod-07', 'Validation', 'Schema validation with Zod/Joi, sanitization, and structured validation error responses.', 'reading', 22, 8, true),
  ('les-07-09', 'mod-07', 'Pagination', 'Offset vs Cursor-based pagination, limits, and Link headers.', 'reading', 20, 9, true),
  ('les-07-10', 'mod-07', 'API Error Handling', 'RFC 7807 Problem Details for HTTP APIs, error codes, and audit logging.', 'reading', 20, 10, true),

  -- Module 08: Databases (12 lessons)
  ('les-08-01', 'mod-08', 'Database Fundamentals', 'Data persistence, DBMS concepts, SQL vs NoSQL, and ACID properties.', 'reading', 18, 1, true),
  ('les-08-02', 'mod-08', 'Relational Databases', 'Tables, rows, columns, data types, constraints, and normalization (1NF, 2NF, 3NF).', 'reading', 20, 2, true),
  ('les-08-03', 'mod-08', 'Tables and Relationships', 'One-to-One, One-to-Many, and Many-to-Many relationships and junction tables.', 'reading', 22, 3, true),
  ('les-08-04', 'mod-08', 'Primary Keys', 'Natural vs Surrogate keys, Auto-incrementing integers, and UUIDs.', 'reading', 16, 4, true),
  ('les-08-05', 'mod-08', 'Foreign Keys', 'Referential integrity, ON DELETE CASCADE, ON DELETE SET NULL, and constraints.', 'reading', 18, 5, true),
  ('les-08-06', 'mod-08', 'SQL SELECT', 'Querying data: WHERE filtering, ORDER BY, LIMIT, OFFSET, and aggregate functions.', 'reading', 22, 6, true),
  ('les-08-07', 'mod-08', 'INSERT', 'Inserting single and multiple rows, RETURNING clause, and UPSERT (ON CONFLICT).', 'reading', 16, 7, true),
  ('les-08-08', 'mod-08', 'UPDATE', 'Modifying table records, WHERE guards, and atomic numeric increments.', 'reading', 16, 8, true),
  ('les-08-09', 'mod-08', 'DELETE', 'Removing records, soft deletes (deleted_at), and TRUNCATE comparisons.', 'reading', 16, 9, true),
  ('les-08-10', 'mod-08', 'JOIN', 'Combining data across tables: INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.', 'reading', 24, 10, true),
  ('les-08-11', 'mod-08', 'Indexes', 'Query optimization: B-tree indexes, composite indexes, EXPLAIN ANALYZE, and tradeoffs.', 'reading', 22, 11, true),
  ('les-08-12', 'mod-08', 'Transactions', 'ACID transactions: BEGIN, COMMIT, ROLLBACK, isolation levels, and concurrency control.', 'reading', 22, 12, true),

  -- Module 09: Authentication & Security (12 lessons)
  ('les-09-01', 'mod-09', 'Authentication vs Authorization', 'Authentication identity verification versus authorization permissions.', 'reading', 16, 1, true),
  ('les-09-02', 'mod-09', 'Password Security', 'One-way cryptographic hashing, rainbow tables, salts, bcrypt, and Argon2.', 'reading', 20, 2, true),
  ('les-09-03', 'mod-09', 'Sessions', 'Server-side session management: Session IDs, session stores, and HTTP-only cookies.', 'reading', 18, 3, true),
  ('les-09-04', 'mod-09', 'JWT', 'JSON Web Tokens: Header, Payload, Signature, signing algorithms (HS256, RS256).', 'reading', 22, 4, true),
  ('les-09-05', 'mod-09', 'Access Tokens', 'Short-lived bearer tokens for authorizing individual API requests.', 'reading', 18, 5, true),
  ('les-09-06', 'mod-09', 'Refresh Tokens', 'Long-lived tokens for renewing access tokens without user re-authentication.', 'reading', 20, 6, true),
  ('les-09-07', 'mod-09', 'Role-Based Access', 'RBAC: Roles, permissions, hierarchical authorization, and route guards.', 'reading', 22, 7, true),
  ('les-09-08', 'mod-09', 'Input Validation', 'Preventing injection attacks: Whitelisting, sanitization, and type coercion defense.', 'reading', 18, 8, true),
  ('les-09-09', 'mod-09', 'SQL Injection', 'SQLi mechanics, parameterized queries, ORM safety, and preventing database exfiltration.', 'reading', 22, 9, true),
  ('les-09-10', 'mod-09', 'XSS', 'Cross-Site Scripting: Stored, Reflected, DOM-based XSS, and Content Security Policy (CSP).', 'reading', 22, 10, true),
  ('les-09-11', 'mod-09', 'CSRF', 'Cross-Site Request Forgery, SameSite cookie attributes, and anti-CSRF tokens.', 'reading', 18, 11, true),
  ('les-09-12', 'mod-09', 'Secure API Design', 'Helmet security headers, rate limiting, CORS configuration, and security audits.', 'reading', 22, 12, true),

  -- Module 10: Git & GitHub (10 lessons)
  ('les-10-01', 'mod-10', 'Version Control', 'Why version control matters: History tracking, collaboration, and distributed VCS.', 'reading', 16, 1, true),
  ('les-10-02', 'mod-10', 'Git Fundamentals', 'The three states: Working Directory, Staging Area (Index), and Git Directory.', 'reading', 18, 2, true),
  ('les-10-03', 'mod-10', 'Repository', 'Initializing repositories (git init), cloning remote projects, and .gitignore.', 'reading', 16, 3, true),
  ('les-10-04', 'mod-10', 'Commit', 'Creating atomic commits, writing Conventional Commit messages, and git log.', 'reading', 20, 4, true),
  ('les-10-05', 'mod-10', 'Branch', 'Lightweight pointers, branch creation, switching branches, and naming conventions.', 'reading', 20, 5, true),
  ('les-10-06', 'mod-10', 'Merge', 'Integrating branches: Fast-forward merges, 3-way merge commits, and squash merging.', 'reading', 20, 6, true),
  ('les-10-07', 'mod-10', 'Pull Request', 'Code review workflows on GitHub: PR descriptions, review comments, approval, and CI.', 'reading', 20, 7, true),
  ('les-10-08', 'mod-10', 'Conflict Resolution', 'Understanding merge conflicts, reading conflict markers, and manual resolution.', 'reading', 24, 8, true),
  ('les-10-09', 'mod-10', 'GitHub Workflow', 'Forking, remotes (origin, upstream), pushing, pulling, and branch protection rules.', 'reading', 20, 9, true),
  ('les-10-10', 'mod-10', 'Professional Repository Practices', 'README.md documentation, LICENSE, CONTRIBUTING guides, and release tagging.', 'reading', 18, 10, true),

  -- Module 11: Testing (10 lessons)
  ('les-11-01', 'mod-11', 'Why Testing Matters', 'The cost of bugs in production, regression prevention, and the Testing Pyramid.', 'reading', 16, 1, true),
  ('les-11-02', 'mod-11', 'Unit Testing', 'Testing individual functions in isolation: Vitest/Jest, describe, test, it blocks.', 'reading', 22, 2, true),
  ('les-11-03', 'mod-11', 'Integration Testing', 'Testing multiple units working together: controllers + services + database.', 'reading', 22, 3, true),
  ('les-11-04', 'mod-11', 'API Testing', 'Testing HTTP endpoints using Supertest: status codes, headers, and payload schemas.', 'reading', 22, 4, true),
  ('les-11-05', 'mod-11', 'Test Cases', 'AAA pattern: Arrange, Act, Assert. Designing comprehensive test matrices.', 'reading', 18, 5, true),
  ('les-11-06', 'mod-11', 'Assertions', 'Expect matchers: toBe, toEqual, toContain, toThrow, toHaveLength, toStrictEqual.', 'reading', 18, 6, true),
  ('les-11-07', 'mod-11', 'Mocking', 'Spies, stubs, and mocks: vi.fn(), vi.spyOn(), and mocking external modules.', 'reading', 22, 7, true),
  ('les-11-08', 'mod-11', 'Test Coverage', 'Code coverage metrics: Line coverage, branch coverage, function coverage, and v8.', 'reading', 18, 8, true),
  ('les-11-09', 'mod-11', 'Regression Testing', 'Preventing reintroduction of solved bugs, test-driven bug fixing, and CI pipelines.', 'reading', 18, 9, true),
  ('les-11-10', 'mod-11', 'Debugging Failed Tests', 'Diagnosing test failures: Stack trace inspection, test isolation, and debugging tools.', 'reading', 20, 10, true),

  -- Module 12: Deployment (10 lessons)
  ('les-12-01', 'mod-12', 'Development vs Production', 'Differences in performance, debugging, logging, security, and configuration.', 'reading', 18, 1, true),
  ('les-12-02', 'mod-12', 'Environment Variables', 'Production secrets management, Twelve-Factor App config, and cloud key vaults.', 'reading', 18, 2, true),
  ('les-12-03', 'mod-12', 'Build Process', 'Bundling, minification, tree-shaking, source maps, and Next.js / Vite build pipelines.', 'reading', 20, 3, true),
  ('les-12-04', 'mod-12', 'Deployment Fundamentals', 'Hosting models: Static hosting, PaaS, IaaS, and containers.', 'reading', 20, 4, true),
  ('les-12-05', 'mod-12', 'Frontend Deployment', 'Deploying static assets to CDNs, edge caching, cache invalidation, and custom domains.', 'reading', 18, 5, true),
  ('les-12-06', 'mod-12', 'Backend Deployment', 'Running Node.js in production: Process managers (PM2), Docker, and reverse proxies.', 'reading', 22, 6, true),
  ('les-12-07', 'mod-12', 'Database Deployment', 'Managed database services, connection pooling, automated backups, and migrations.', 'reading', 20, 7, true),
  ('les-12-08', 'mod-12', 'Logging', 'Structured JSON logging (Pino, Winston), log levels, and aggregation.', 'reading', 18, 8, true),
  ('les-12-09', 'mod-12', 'Monitoring', 'Application performance monitoring (APM), health checks, uptime alerts, and Sentry.', 'reading', 20, 9, true),
  ('les-12-10', 'mod-12', 'Production Checklist', 'Pre-flight launch verification: Security audits, performance benchmarking, backups.', 'reading', 22, 10, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes;

-- 5. SEED CHALLENGES (Real challenge definitions across the curriculum)
insert into public.challenges (id, title, description, skill_id, difficulty, language, starter_code, test_definition, time_limit_minutes, status)
values
  (
    'ch-web-01',
    'Explain the lifecycle of a web request',
    'Implement a request lifecycle simulator function traceRequestLifecycle(url) that outputs the sequential milestones of an HTTP request: DNS lookup, TCP handshake, TLS negotiation, HTTP request transmission, server processing, and browser DOM rendering.',
    'web-fundamentals',
    'Medium',
    'javascript',
    'function traceRequestLifecycle(url, options = {}) {\n  const parsed = new URL(url);\n  const steps = [\n    "DNS resolution for " + parsed.hostname,\n    "TCP 3-way handshake (SYN, SYN-ACK, ACK)"\n  ];\n  if (parsed.protocol === "https:") {\n    steps.push("TLS 1.3 cryptographic handshake");\n  }\n  steps.push("HTTP " + (options.method || "GET") + " request dispatched");\n  steps.push("Server executes business logic & database query");\n  steps.push("HTTP response stream received (Status 200)");\n  steps.push("Browser Critical Rendering Path: DOM -> CSSOM -> Render Tree -> Paint");\n  return steps;\n}',
    '[{"input": "https://seva.skillpassport.in", "expected": "7 stages including TLS"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-css-01',
    'Fix a Broken Responsive Layout',
    'Refactor a card grid using CSS Grid auto-fit and minmax to ensure fluid responsiveness without horizontal overflow across mobile viewports.',
    'html-css',
    'Medium',
    'css',
    '.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n  gap: 1.5rem;\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n  box-sizing: border-box;\n}',
    '[{"input": "360px viewport", "expected": "1 fluid column"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-js-01',
    'Array Data Transformation',
    'Write a pure function processScores(scores, boostThreshold) that doubles scores below the threshold (capped at 100), filters out scores below 50, and returns the sorted scores in descending order.',
    'javascript',
    'Easy',
    'javascript',
    'function processScores(scores, boostThreshold = 40) {\n  return scores\n    .map(s => s < boostThreshold ? Math.min(100, s * 2) : s)\n    .filter(s => s >= 50)\n    .sort((a, b) => b - a);\n}',
    '[{"input": "[30, 85, 45, 20, 95]", "expected": "[95, 85, 60]"}]'::jsonb,
    20,
    'active'
  ),
  (
    'ch-js-02',
    'Object Processing',
    'Implement aggregateCompetencies(evidenceList) that groups student evidence by skill category and computes the average score and count for each category.',
    'javascript',
    'Medium',
    'javascript',
    'function aggregateCompetencies(evidenceList) {\n  const result = {};\n  for (const item of evidenceList) {\n    if (!result[item.category]) result[item.category] = { total: 0, count: 0 };\n    result[item.category].total += item.score;\n    result[item.category].count += 1;\n  }\n  const out = {};\n  for (const [cat, data] of Object.entries(result)) {\n    out[cat] = { averageScore: Math.round((data.total / data.count) * 10) / 10, count: data.count };\n  }\n  return out;\n}',
    '[{"input": "evidence list", "expected": "grouped categories"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-react-01',
    'Build a reusable React component',
    'Create a reusable Badge component supporting variant styles (success, warning, danger, neutral), an optional leading icon, and accessible screen-reader labels.',
    'react',
    'Easy',
    'javascript',
    'function Badge({ label, variant = "neutral", icon = null, ariaLabel }) {\n  const styles = {\n    success: "bg-emerald-50 text-emerald-700 border-emerald-200",\n    warning: "bg-amber-50 text-amber-700 border-amber-200",\n    danger: "bg-rose-50 text-rose-700 border-rose-200",\n    neutral: "bg-slate-50 text-slate-700 border-slate-200"\n  };\n  return (\n    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant] || styles.neutral}`} aria-label={ariaLabel || label}>\n      {icon && <span aria-hidden="true">{icon}</span>}\n      {label}\n    </span>\n  );\n}',
    '[{"input": "label=Verified, variant=success", "expected": "emerald badge"}]'::jsonb,
    20,
    'active'
  ),
  (
    'ch-react-02',
    'Manage form state',
    'Build a controlled React form component managing title, priority, and due date with client-side validation rules and submit disable states.',
    'react',
    'Medium',
    'javascript',
    'function TaskForm({ onSubmit }) {\n  const [form, setForm] = useState({ title: "", priority: "medium", dueDate: "" });\n  const [errors, setErrors] = useState({});\n  const validate = () => {\n    const errs = {};\n    if (form.title.trim().length < 3) errs.title = "Title must be at least 3 characters";\n    if (!form.dueDate) errs.dueDate = "Due date is required";\n    setErrors(errs);\n    return Object.keys(errs).length === 0;\n  };\n  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(form); };\n  return <form onSubmit={handleSubmit}></form>;\n}',
    '[{"input": "title=ab", "expected": "validation error"}]'::jsonb,
    30,
    'active'
  ),
  (
    'ch-db-01',
    'Write SQL queries',
    'Write an ANSI SQL query to compute the average competency score and count of verified evidence records for each candidate, returning only candidates with overall score >= 75 sorted in descending order.',
    'sql',
    'Easy',
    'sql',
    'SELECT candidate_id, ROUND(AVG(score), 2) AS avg_score, COUNT(id) AS evidence_count FROM candidate_evidence GROUP BY candidate_id HAVING AVG(score) >= 75 ORDER BY avg_score DESC;',
    '[{"input": "candidate_evidence", "expected": "grouped scores"}]'::jsonb,
    20,
    'active'
  ),
  (
    'ch-sec-01',
    'Implement protected API route',
    'Implement an authentication guard middleware authenticateToken that verifies Bearer JWT tokens from the Authorization header using jsonwebtoken, attaching req.user or rejecting with 401/403.',
    'authentication',
    'Medium',
    'javascript',
    'function authenticateToken(req, res, next) {\n  const authHeader = req.headers["authorization"];\n  const token = authHeader && authHeader.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "Token required" });\n  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {\n    if (err) return res.status(403).json({ error: "Token invalid" });\n    req.user = user;\n    next();\n  });\n}',
    '[{"input": "Bearer token", "expected": "req.user attached"}]'::jsonb,
    25,
    'active'
  ),
  (
    'ch-git-01',
    'Resolve a merge conflict',
    'Inspect conflicting lines, remove conflict markers, stage the unified file, and finalize the merge commit in Git.',
    'git',
    'Medium',
    'bash',
    'git status\n# Edit conflicting file to unify lines\ngit add src/config.ts\ngit commit -m "chore: resolve merge conflict in application config"',
    '[{"input": "Merge conflict state", "expected": "Clean merge commit"}]'::jsonb,
    20,
    'active'
  ),
  (
    'ch-test-01',
    'Write unit tests',
    'Write a unit test suite using Vitest for calculateOverallPassport(skillScores) testing full competency scores, boundary zero cases, and grade assignments.',
    'testing',
    'Easy',
    'javascript',
    'describe("calculateOverallPassport", () => {\n  it("returns building status when evidence is insufficient", () => {\n    const result = calculateOverallPassport([]);\n    expect(result.status).toBe("building");\n  });\n  it("calculates average score and assigns A+ grade", () => {\n    const skills = [{ skillId: "js", score: 92, evidenceCount: 5 }];\n    expect(calculateOverallPassport(skills).grade).toBe("A+");\n  });\n});',
    '[{"input": "Test suite run", "expected": "All tests pass"}]'::jsonb,
    25,
    'active'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  starter_code = excluded.starter_code;

-- 6. SEED CAPSTONE PROJECTS
insert into public.projects (id, title, description, difficulty, course_id, status)
values
  (
    'proj-001',
    'Task Management System',
    'Flagship Full Stack Capstone: End-to-end task management platform implementing Authentication, Role-based access, CRUD, REST API, Database, Validation, Error handling, Testing, Security, Git, and Deployment.',
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
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- 7. SEED ASSESSMENTS
insert into public.assessments (id, title, description, course_id, skill_id, assessment_type, duration_minutes, status)
values
  ('ass-mod-01', 'Web Fundamentals & Architecture Assessment', 'Comprehensive evaluation of networking, HTTP/HTTPS protocols, DNS resolution, and browser rendering lifecycle.', 'full-stack-development', 'web-fundamentals', 'theory', 30, 'active'),
  ('ass-mod-03', 'JavaScript & Asynchronous Programming Assessment', 'Rigorous assessment of JavaScript language semantics, lexical scopes, closures, prototype chain, Promises, Event Loop, and async error recovery.', 'full-stack-development', 'javascript', 'coding', 35, 'active'),
  ('ass-mod-05', 'React Component Architecture Assessment', 'Evaluation of component composition, hook rules, state reconciliation, performance optimization, and custom hook abstractions.', 'full-stack-development', 'react', 'coding', 30, 'active'),
  ('ass-mod-08', 'Backend, Databases & Security Assessment', 'Advanced assessment covering relational schema design, SQL optimization, RESTful API contracts, JWT authentication, and cybersecurity vulnerability prevention.', 'full-stack-development', 'sql', 'theory', 35, 'active')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- 8. SEED DEMONSTRATION CANDIDATE PROFILE & EVIDENCE (PHASE 3B / SAFE FOREIGN KEY HANDLING)
-- Never bypass foreign keys or insert directly into auth.users.
-- If an auth account exists, link demo records to that real user; otherwise safely skip candidate records.
DO $$
DECLARE
  v_demo_user_id uuid;
BEGIN
  -- Look for an existing registered user in auth.users (e.g. demo account or first authenticated user)
  SELECT id INTO v_demo_user_id
  FROM auth.users
  WHERE email IN ('arjun.demo@sevapassport.in', 'demo@sevapassport.in', 'student@sevapassport.in')
  LIMIT 1;

  -- If not found by specific demo email, use the first authenticated user if present
  IF v_demo_user_id IS NULL THEN
    SELECT id INTO v_demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Only seed user-dependent profile, evidence, and passport if a real auth account exists
  IF v_demo_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, email, target_role, state, district, passport_visibility)
    VALUES (
      v_demo_user_id,
      'Arjun Sharma (Demo)',
      'arjun.demo@sevapassport.in',
      'Full Stack Developer',
      'Karnataka',
      'Bengaluru Urban',
      'public'
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      target_role = EXCLUDED.target_role;

    INSERT INTO public.evidence (
      id, user_id, skill_id, source_type, source_id, score,
      difficulty, quality_level, dimension, attempt_number,
      verification_hash, metadata, created_at, last_demonstrated_at
    )
    VALUES
      ('e0000000-0000-0000-0000-000000000001', v_demo_user_id, 'react', 'project', 'proj-001', 92, 'HARD', 'ADVANCED', 'Architecture', 1, 'SHA256:SEVA:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', '{"title": "Task Management Capstone UI"}'::jsonb, '2026-10-06T12:00:00Z', '2026-10-06T12:00:00Z'),
      ('e0000000-0000-0000-0000-000000000002', v_demo_user_id, 'react', 'lab', 'lab-05', 88, 'MEDIUM', 'ADVANCED', 'Component Design', 1, 'SHA256:SEVA:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '{"title": "Build a Task Management Interface"}'::jsonb, '2026-10-05T10:00:00Z', '2026-10-05T10:00:00Z'),
      ('e0000000-0000-0000-0000-000000000003', v_demo_user_id, 'react', 'challenge', 'ch-react-01', 86, 'MEDIUM', 'INTERMEDIATE', 'Component Design', 1, 'SHA256:SEVA:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', '{"title": "Build a Reusable Component"}'::jsonb, '2026-10-04T15:00:00Z', '2026-10-04T15:00:00Z'),
      ('e0000000-0000-0000-0000-000000000004', v_demo_user_id, 'react', 'challenge', 'ch-react-02', 79, 'MEDIUM', 'INTERMEDIATE', 'State Management', 1, 'SHA256:SEVA:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', '{"title": "Manage Form State"}'::jsonb, '2026-10-04T16:00:00Z', '2026-10-04T16:00:00Z'),
      ('e0000000-0000-0000-0000-000000000005', v_demo_user_id, 'react', 'assessment', 'ass-mod-05', 85, 'MEDIUM', 'ADVANCED', 'Hooks', 1, 'SHA256:SEVA:8a13d72bfa04d9c025178e244838b9fa2914101e859abf0b5d5d8512140a7cf3', '{"title": "React Module Assessment"}'::jsonb, '2026-10-06T16:00:00Z', '2026-10-06T16:00:00Z'),
      ('e0000000-0000-0000-0000-000000000006', v_demo_user_id, 'sql', 'lab', 'lab-08', 94, 'HARD', 'ADVANCED', 'Data Modeling', 1, 'SHA256:SEVA:39088abcf134c89da152a53bbdae06c289069a3b8110b9f5e137b01fa214300e', '{"title": "Design a Task Management Database"}'::jsonb, '2026-10-05T11:00:00Z', '2026-10-05T11:00:00Z'),
      ('e0000000-0000-0000-0000-000000000007', v_demo_user_id, 'sql', 'challenge', 'ch-db-01', 90, 'MEDIUM', 'ADVANCED', 'Querying', 1, 'SHA256:SEVA:54a80693ce0b29864273dfba038931149e0c5211a7db8012bbecf4296aa2828b', '{"title": "Write Analytical SQL Queries"}'::jsonb, '2026-10-05T13:00:00Z', '2026-10-05T13:00:00Z'),
      ('e0000000-0000-0000-0000-000000000008', v_demo_user_id, 'sql', 'assessment', 'ass-mod-08', 92, 'MEDIUM', 'ADVANCED', 'Joins', 1, 'SHA256:SEVA:0b70a7df854e432c7fa4f00d239b92f75a7c5c24e6b528a49c30f40ad6ef3661', '{"title": "Databases Assessment"}'::jsonb, '2026-10-06T10:00:00Z', '2026-10-06T10:00:00Z'),
      ('e0000000-0000-0000-0000-000000000009', v_demo_user_id, 'nodejs', 'lab', 'lab-06', 80, 'MEDIUM', 'INTERMEDIATE', 'Server Fundamentals', 1, 'SHA256:SEVA:19fa82cb906d4e138a49c693a40498b894d0c9183421d4bb8839219b48c187b5', '{"title": "Build a Node.js REST Server"}'::jsonb, '2026-10-04T11:00:00Z', '2026-10-04T11:00:00Z'),
      ('e0000000-0000-0000-0000-000000000010', v_demo_user_id, 'nodejs', 'challenge', 'ch-node-01', 78, 'MEDIUM', 'INTERMEDIATE', 'Routing', 1, 'SHA256:SEVA:7b24cf629e4b772c5496ab3e7a022f47a61d1994e66da2b78687a4d3393e5066', '{"title": "Create an Express Endpoint"}'::jsonb, '2026-10-04T14:00:00Z', '2026-10-04T14:00:00Z'),
      ('e0000000-0000-0000-0000-000000000011', v_demo_user_id, 'git', 'lab', 'lab-10', 88, 'MEDIUM', 'INTERMEDIATE', 'Branching', 1, 'SHA256:SEVA:6d405eb712da22cbafe64e3be538df0fa28876bc2f36070a7bb91843bda6e855', '{"title": "Collaborative Git Workflow"}'::jsonb, '2026-10-04T17:00:00Z', '2026-10-04T17:00:00Z'),
      ('e0000000-0000-0000-0000-000000000012', v_demo_user_id, 'git', 'challenge', 'ch-git-01', 90, 'HARD', 'ADVANCED', 'Conflict Resolution', 1, 'SHA256:SEVA:196f30a91e3e6027376c669e46a788b77626d70bc76c65b16fefea66d03444ab', '{"title": "Resolve a Merge Conflict"}'::jsonb, '2026-10-05T16:00:00Z', '2026-10-05T16:00:00Z'),
      ('e0000000-0000-0000-0000-000000000013', v_demo_user_id, 'security', 'challenge', 'ch-sec-01', 61, 'MEDIUM', 'BASIC', 'Common Vulnerabilities', 1, 'SHA256:SEVA:48fca8b47ca54388e367809930f7e4a834b6b66dfbcfdfbc95e7c8441f92e313', '{"title": "Identify Security Vulnerabilities"}'::jsonb, '2026-10-06T11:00:00Z', '2026-10-06T11:00:00Z')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.skill_passports (
      id, user_id, overall_score, grade, passport_status, verification_id, created_at, updated_at
    )
    VALUES (
      'p0000000-0000-0000-0000-000000000001',
      v_demo_user_id,
      85,
      'A',
      'active',
      'GSP-DEMO-001',
      '2024-10-01T00:00:00Z',
      '2026-10-06T12:00:00Z'
    ) ON CONFLICT (user_id) DO UPDATE SET
      overall_score = EXCLUDED.overall_score,
      grade = EXCLUDED.grade,
      updated_at = EXCLUDED.updated_at;
      
    RAISE NOTICE 'Demo student profile and evidence linked to auth user %', v_demo_user_id;
  ELSE
    RAISE NOTICE 'No auth user found in auth.users. Courses, curriculum, skills, challenges, and assessments seeded successfully. Candidate-specific profile and evidence will be created when a user signs up.';
  END IF;
END $$;

