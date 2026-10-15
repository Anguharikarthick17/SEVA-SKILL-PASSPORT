const fs = require('fs');

const raw = fs.readFileSync('src/data/challenges.ts', 'utf8');

// Starter scaffolds mapping by challenge ID
const STARTER_CODES = {
  'ch-web-01': `function traceRequestLifecycle(url, options = {}) {
  // TODO: Implement the request lifecycle simulator
  // 1. Parse the protocol and hostname from url using new URL(url)
  // 2. Return an array of ordered milestones:
  //    - 'DNS resolution for ' + hostname
  //    - 'TCP 3-way handshake (SYN, SYN-ACK, ACK)'
  //    - 'TLS 1.3 cryptographic handshake' (ONLY if protocol is 'https:')
  //    - 'HTTP ' + (options.method || 'GET') + ' request dispatched'
  //    - 'Server executes business logic & database query'
  //    - 'HTTP response stream received (Status 200)'
  //    - 'Browser Critical Rendering Path: DOM -> CSSOM -> Render Tree -> Paint'

  return [];
}`,

  'ch-css-01': `/* Refactor this broken stylesheet to make it responsive */
.card-grid {
  /* BUG: Fixed width causing horizontal overflow on mobile viewports */
  width: 1200px;
  float: left;
  margin: 0 auto;

  /* TODO: Replace with modern responsive CSS Grid:
   * 1. display: grid;
   * 2. grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
   * 3. gap: 1.5rem;
   * 4. width: 100%; max-width: 1200px; box-sizing: border-box;
   */
}

.card {
  width: 100%;
  box-sizing: border-box;
}`,

  'ch-js-01': `function processScores(scores, boostThreshold = 40) {
  // TODO: Implement processScores
  // 1. Never mutate original input array
  // 2. Double scores below boostThreshold (capped at maximum 100)
  // 3. Filter out items with resulting score < 50
  // 4. Sort resulting array in descending order

  return [];
}`,

  'ch-js-02': `function aggregateCompetencies(evidenceList) {
  // TODO: Group student evidence by category and calculate statistics
  // Input: array of { skill: string, category: string, score: number }
  // Return format: { [category]: { averageScore: number, count: number } }
  // Note: averageScore must be rounded to 1 decimal place

  return {};
}`,

  'ch-js-03': `function computeFinalPrice(items, discountStr) {
  // BUGGY IMPLEMENTATION TO FIX:
  // 1. Parse discount percentage safely from strings like "15%"
  // 2. Safely filter out null or undefined items in the items array
  // 3. Multiply price by quantity (default 1) for each item before discount
  // 4. Return rounded number to 2 decimal places

  var discount = discountStr;
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total - discount;
}`,

  'ch-advjs-01': `async function fetchStudentSummary(studentId, api) {
  // TODO: Convert Promise chain to clean async/await
  // 1. Fetch student profile using: await api.getProfile(studentId)
  // 2. In parallel using Promise.all:
  //    - api.getScores(studentId)
  //    - api.getBadges(studentId)
  // 3. Handle errors gracefully: return { error: 'Student not found', fallback: true }

  // Replace with async/await implementation:
}`,

  'ch-advjs-02': `class AsyncSearchEngine {
  constructor(fetcher) {
    this.fetcher = fetcher;
    this.latestQueryId = 0;
  }

  async search(query) {
    // TODO: Fix the race condition in async search
    // Fast keystrokes can cause earlier slow requests to resolve AFTER later fast requests.
    // Ensure only results from the most recent search query are returned or updated.

    return [];
  }
}`,

  'ch-advjs-03': `function debounce(fn, delay = 300) {
  // TODO: Implement debounce higher-order function
  // 1. Return a wrapper function that delays execution of fn
  // 2. Reset timer if called again within delay window
  // 3. Preserve 'this' context and forward all arguments
  // 4. Provide a .cancel() method on the returned function

  return function (...args) {};
}`,

  'ch-react-01': `import React from 'react';

function Badge({ label, variant = 'neutral', icon = null, ariaLabel }) {
  // TODO: Build an accessible, reusable Badge component
  // 1. Support variants: 'neutral', 'success', 'warning', 'danger'
  // 2. Apply appropriate styling and contrast
  // 3. Render icon if provided
  // 4. Ensure proper accessibility attributes (role="status", aria-label)

  return (
    <div>{/* Badge markup */}</div>
  );
}`,

  'ch-react-02': `import { useState } from 'react';

function TaskForm({ onSubmit }) {
  // TODO: Implement controlled form with validation
  // 1. Track title (string), priority ('low' | 'medium' | 'high'), and due date
  // 2. Validate title: min 3 chars, required
  // 3. Display error message if invalid
  // 4. Call onSubmit({ title, priority, dueDate }) on valid submit and reset form

  return (
    <form>{/* Form controls */}</form>
  );
}`,

  'ch-react-03': `import { useState, useEffect } from 'react';

function StudentPassportView({ studentId, fetcher }) {
  // TODO: Implement resilient API data fetching
  // 1. Maintain state: data (null), loading (true), error (null)
  // 2. Fetch data inside useEffect when studentId changes
  // 3. Handle cleanup / abort controller if component unmounts
  // 4. Render loading spinner, error alert, or passport details accordingly

  return (
    <div>{/* Render state */}</div>
  );
}`,

  'ch-node-01': `const express = require('express');
const router = express.Router();

// TODO: Implement POST /api/evidence endpoint
// 1. Validate request body has: { skillId, score, candidateId }
// 2. Return 400 Bad Request if missing required fields
// 3. On success, generate verification hash and return 201 Created with JSON:
//    { success: true, evidenceId, hash, timestamp }

module.exports = router;`,

  'ch-node-02': `function apiKeyAuth(validKeys) {
  // TODO: Implement API key authentication middleware
  // 1. Check for 'x-api-key' in request headers
  // 2. If missing, return 401 Unauthorized: { error: 'API key is required' }
  // 3. If invalid key, return 403 Forbidden: { error: 'Invalid API credentials' }
  // 4. If valid, attach req.clientKey and call next()

  return (req, res, next) => {};
}`,

  'ch-node-03': `function errorHandler(err, req, res, next) {
  // TODO: Implement centralized Express error-handling middleware
  // 1. Determine statusCode: err.statusCode || err.status || 500
  // 2. Format JSON response: { error: err.name || 'ServerError', message: err.message }
  // 3. Hide internal stack traces in production (NODE_ENV === 'production')
  // 4. Log error details with request method and path

}`,

  'ch-rest-01': `const express = require('express');
const router = express.Router();

// In-memory collection for practice:
let skills = [];

// TODO: Implement clean RESTful CRUD routes:
// 1. GET /skills -> List all skills (200)
// 2. GET /skills/:id -> Get skill by id (200 or 404)
// 3. POST /skills -> Create new skill (201)
// 4. PUT /skills/:id -> Update skill (200 or 404)
// 5. DELETE /skills/:id -> Delete skill (204 or 404)

module.exports = router;`,

  'ch-rest-02': `function validateScoreSubmission(req, res, next) {
  // TODO: Implement request validation middleware
  // Required body fields:
  // - candidateId: non-empty string
  // - skillId: non-empty string
  // - score: integer between 0 and 100
  // Return 422 Unprocessable Entity with array of specific validation errors if invalid.
  // Call next() if valid.

}`,

  'ch-rest-03': `function handleRequest(req, res, service) {
  // TODO: Return correct HTTP status codes for each scenario:
  // - Resource successfully created: 201 Created
  // - Resource retrieved: 200 OK
  // - Resource not found: 404 Not Found
  // - Validation error: 422 Unprocessable Entity
  // - Unauthorized access: 401 Unauthorized
  // - Rate limit exceeded: 429 Too Many Requests

}`,

  'ch-db-01': `-- TODO: Write SQL query to calculate average scores by candidate
-- 1. Select candidate_id and average score rounded to 2 decimal places as avg_score
-- 2. Count total evidence records as evidence_count
-- 3. Group by candidate_id
-- 4. Filter only candidates with evidence_count >= 3 using HAVING
-- 5. Order by avg_score DESC

-- Write your SELECT query here:
`,

  'ch-db-02': `-- TODO: Design the relational tables schema for Capstone Projects
-- 1. Create 'projects' table with: id (UUID PK), title (VARCHAR(200)), candidate_id (UUID FK), created_at (TIMESTAMP)
-- 2. Create 'project_files' table with: id (UUID PK), project_id (UUID FK), filename (VARCHAR(255)), size_bytes (INT)
-- 3. Define foreign keys with ON DELETE CASCADE
-- 4. Create an index on project_files(project_id)

-- Write your DDL statements here:
`,

  'ch-db-03': `-- High-traffic query currently performing slow sequential table scans:
-- SELECT * FROM evidence WHERE user_id = 'usr_123' AND skill_id = 'sk_react' ORDER BY created_at DESC;

-- TODO: Write the optimal composite CREATE INDEX statement to speed up this query:

`,

  'ch-sec-01': `const jwt = require('jsonwebtoken');

function authenticateToken(secretKey) {
  // TODO: Implement JWT authorization middleware
  // 1. Extract Bearer token from 'Authorization' header: 'Bearer <token>'
  // 2. If header is missing, return 401 Unauthorized: { error: 'Token required' }
  // 3. Verify token with jwt.verify(token, secretKey)
  // 4. If invalid or expired, return 403 Forbidden: { error: 'Invalid or expired token' }
  // 5. If valid, set req.user = decodedPayload and call next()

  return (req, res, next) => {};
}`,

  'ch-sec-02': `function sanitizeUserBio(input) {
  // TODO: Prevent XSS and malicious input injection in user profile bio
  // 1. Reject non-string inputs
  // 2. Escape HTML special characters: <, >, &, ", '
  // 3. Strip script tags and event handler attributes
  // 4. Enforce max length of 500 characters
  // 5. Trim leading and trailing whitespace

  return '';
}`,

  'ch-sec-03': `const bcrypt = require('bcrypt');

async function loginCandidate(email, providedPassword, userDb) {
  // BUGGY / INSECURE CODE TO REMEDIATE:
  // Vulnerabilities present:
  // 1. Plaintext password comparison
  // 2. Timing attack / username enumeration leakage
  // 3. Missing rate limiting & salt hashing

  // TODO: Remediate this function using bcrypt.compare and secure practices
  
}`,

  'ch-git-01': `# Conflict in src/config.js:
# <<<<<<< HEAD
# const API_URL = 'https://api.v2.seva.in';
# =======
# const API_URL = 'https://staging.api.seva.in';
# >>>>>>> feat/staging-migration

# TODO: Write the Git command sequence to:
# 1. Inspect status
# 2. Resolve conflict in favor of https://api.v2.seva.in
# 3. Stage the resolved file
# 4. Finalize the merge commit with a standard message

`,

  'ch-git-02': `# TODO: Write the Git command sequence to:
# 1. Ensure you are on the latest 'main' branch
# 2. Pull remote updates
# 3. Create and switch to a new feature branch named 'feat/evidence-export'
# 4. Verify the active branch name

`,

  'ch-git-03': `#!/bin/bash
set -e

# TODO: Automate pre-PR readiness checks:
# 1. Run type check: npm run typecheck (or tsc --noEmit)
# 2. Run test suite
# 3. Run linter
# 4. Ensure working directory is clean (git diff --exit-code)

echo "Ready to submit Pull Request!"
`,

  'ch-test-01': `import { describe, it, expect } from 'vitest';
import { calculateOverallPassport } from './scoring/engine';

describe('calculateOverallPassport', () => {
  // TODO: Write comprehensive unit test suite:
  // 1. Test standard case: returns correct weighted score and grade
  // 2. Test edge case: student with zero evidence records returns 0 / 'No Grade'
  // 3. Test cap: ensure score never exceeds 100
  // 4. Test grade boundary: score >= 90 receives 'A+'
});`,

  'ch-test-02': `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from './app';

describe('POST /api/assessments/start', () => {
  // TODO: Write integration tests using supertest:
  // 1. Returns 200 and attempt payload with valid credentials
  // 2. Returns 401 when Authorization header is missing
  // 3. Returns 404 when assessment ID does not exist
});`,

  'ch-test-03': `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Telemetry Sync Engine', () => {
  // BUGGY FLAKY TEST SUITE TO FIX:
  // Issues:
  // - Global timers not reset between tests
  // - Mock calls leaking between tests
  // - Async promises not awaited properly

  // TODO: Add beforeEach / afterEach cleanup and fix flaky test assertions
});`,

  'ch-deploy-01': `#!/usr/bin/env bash
set -e

# TODO: Production release verification script
# 1. Verify Node.js version >= 18
# 2. Verify all required environment variables are set (NEXT_PUBLIC_SUPABASE_URL, etc.)
# 3. Install production dependencies with frozen lockfile (npm ci)
# 4. Build Next.js application (npm run build)
# 5. Check exit code and confirm release artifact readiness

echo "Production artifact built successfully!"
`
};

// Check that all 30 challenges are covered
const ids = Object.keys(STARTER_CODES);
console.log('Starter codes defined for:', ids.length, 'challenges');

module.exports = { STARTER_CODES };
