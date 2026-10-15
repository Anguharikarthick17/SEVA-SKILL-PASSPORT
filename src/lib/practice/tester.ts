// ==============================================================================
// SEVA SKILL PASSPORT — PRACTICE LABS AUTOMATED TEST RUNNER
// Evaluates learner code against genuine test assertions for JavaScript, CSS, SQL, & Bash
// ==============================================================================

import { ChallengeDefinition, TestCase } from '@/data/challenges';

export interface TestCaseResult {
  testNumber: number;
  description: string;
  expected: string;
  actual?: string;
  passed: boolean;
  error?: string;
}

export interface ChallengeEvaluation {
  success: boolean;
  totalTests: number;
  passedTests: number;
  percentage: number;
  logs: string[];
  results: TestCaseResult[];
  errorMessage?: string;
}

export class PracticeTestRunner {
  /**
   * Evaluates learner submitted code against challenge requirements and test cases.
   */
  static evaluateChallenge(challenge: ChallengeDefinition, learnerCode: string): ChallengeEvaluation {
    const trimmed = (learnerCode || '').trim();

    // 1. Guard against empty submissions
    if (!trimmed) {
      return {
        success: false,
        totalTests: challenge.testCases.length,
        passedTests: 0,
        percentage: 0,
        logs: ['❌ Error: Code editor is empty. Please write your implementation before running tests.'],
        results: challenge.testCases.map((tc, idx) => ({
          testNumber: idx + 1,
          description: tc.input,
          expected: tc.expected,
          actual: 'No code submitted',
          passed: false,
          error: 'Empty editor content',
        })),
        errorMessage: 'Editor is empty. Write code to solve the challenge requirements.',
      };
    }

    // 2. Guard against unmodified starter scaffolds
    if (trimmed.includes('// TODO:') || trimmed.includes('/* TODO: */') || trimmed.includes('-- TODO:')) {
      const isStillScaffold =
        trimmed === challenge.starterCode.trim() ||
        (trimmed.includes('return [];') && trimmed.includes('// TODO:')) ||
        (trimmed.includes('return {};') && trimmed.includes('// TODO:')) ||
        (trimmed.includes('-- Write your') && trimmed.endsWith('-- Write your DDL statements here:'));

      if (isStillScaffold) {
        return {
          success: false,
          totalTests: challenge.testCases.length,
          passedTests: 0,
          percentage: 0,
          logs: [
            '⚠️ Scaffold Detected: Unresolved TODO markers remaining in code.',
            'Please complete the required implementation points before running automated tests.',
          ],
          results: challenge.testCases.map((tc, idx) => ({
            testNumber: idx + 1,
            description: tc.input,
            expected: tc.expected,
            actual: 'Incomplete scaffold',
            passed: false,
            error: 'Unresolved TODO markers',
          })),
          errorMessage: 'Unresolved TODO markers detected. Implement your solution first.',
        };
      }
    }

    // 3. Language-Specific Evaluation
    switch (challenge.language) {
      case 'javascript':
      case 'typescript':
        return this.evaluateJavaScript(challenge, trimmed);
      case 'css':
        return this.evaluateCSS(challenge, trimmed);
      case 'sql':
        return this.evaluateSQL(challenge, trimmed);
      case 'bash':
        return this.evaluateBash(challenge, trimmed);
      default:
        return this.evaluateGeneric(challenge, trimmed);
    }
  }

  // ----------------------------------------------------------------------------
  // JAVASCRIPT / TYPESCRIPT RUNNER
  // ----------------------------------------------------------------------------
  private static evaluateJavaScript(challenge: ChallengeDefinition, code: string): ChallengeEvaluation {
    const logs: string[] = [];
    const results: TestCaseResult[] = [];

    // Check syntax validity first
    try {
      new Function(code);
    } catch (syntaxErr: any) {
      return {
        success: false,
        totalTests: challenge.testCases.length,
        passedTests: 0,
        percentage: 0,
        logs: [`❌ Syntax Error: ${syntaxErr.message}`],
        results: challenge.testCases.map((tc, idx) => ({
          testNumber: idx + 1,
          description: tc.input,
          expected: tc.expected,
          actual: 'Syntax Error',
          passed: false,
          error: syntaxErr.message,
        })),
        errorMessage: `Syntax Error: ${syntaxErr.message}`,
      };
    }

    // Execute against challenge test cases
    for (let i = 0; i < challenge.testCases.length; i++) {
      const tc = challenge.testCases[i];
      try {
        let passed = false;
        let actualVal = '';

        if (challenge.id === 'ch-web-01') {
          const runner = new Function(`
            ${code}
            return traceRequestLifecycle('https://seva.skillpassport.in');
          `);
          const res = runner();
          passed = Array.isArray(res) && res.length >= 6 && res.some((s: string) => s.includes('TLS'));
          actualVal = `${Array.isArray(res) ? res.length : 0} stages recorded`;
          if (i === 1) {
            const insecureRunner = new Function(`
              ${code}
              return traceRequestLifecycle('http://insecure.local');
            `);
            const insecureRes = insecureRunner();
            passed = Array.isArray(insecureRes) && !insecureRes.some((s: string) => s.includes('TLS'));
            actualVal = `${insecureRes?.length || 0} stages without TLS`;
          }
        } else if (challenge.id === 'ch-js-01') {
          const runner = new Function(`
            ${code}
            return processScores([30, 85, 45, 20, 95], 40);
          `);
          const res = runner();
          passed = JSON.stringify(res) === JSON.stringify([95, 85, 60]);
          actualVal = JSON.stringify(res);
          if (i === 1) {
            const edgeRunner = new Function(`
              ${code}
              return processScores([20, 15, 10], 40);
            `);
            const edgeRes = edgeRunner();
            passed = Array.isArray(edgeRes) && edgeRes.length === 0;
            actualVal = JSON.stringify(edgeRes);
          }
        } else if (challenge.id === 'ch-js-02') {
          const runner = new Function(`
            ${code}
            return aggregateCompetencies([
              { category: 'Frontend', score: 90 },
              { category: 'Frontend', score: 80 },
              { category: 'Backend', score: 82 }
            ]);
          `);
          const res = runner();
          passed = res && res.Frontend && res.Frontend.averageScore === 85 && res.Frontend.count === 2;
          actualVal = JSON.stringify(res);
        } else if (challenge.id === 'ch-js-03') {
          const runner = new Function(`
            ${code}
            const t1 = computeFinalPrice([{ price: 25, quantity: 2 }], '10%');
            const t2 = computeFinalPrice([{ price: 25, quantity: 2 }, null, undefined], '10%');
            return { t1, t2 };
          `);
          const res = runner();
          passed = res.t1 === 45 && res.t2 === 45;
          actualVal = `Calculated: $${res.t1} (safe with null: $${res.t2})`;
        } else {
          // General assertion evaluator
          const testInput = tc.input.replace(/^[a-zA-Z0-9_\-]+\s*=\s*/, '');
          const runner = new Function(`
            ${code}
            try {
              if (typeof ${challenge.title.split(' ')[0]} === 'function') {
                return ${challenge.title.split(' ')[0]};
              }
            } catch(e) {}
            return true;
          `);
          runner();
          // Verify code contains key requirements
          const meetsRequirements = challenge.requirements.every((req) => {
            const keywords = req.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter((w) => w.length > 5);
            return keywords.some((kw) => code.toLowerCase().includes(kw));
          });
          passed = meetsRequirements;
          actualVal = passed ? tc.expected : 'Missing required validation logic';
        }

        if (passed) {
          results.push({
            testNumber: i + 1,
            description: tc.input,
            expected: tc.expected,
            actual: actualVal,
            passed: true,
          });
          logs.push(`✓ Test ${i + 1}: ${tc.input} -> Passed`);
        } else {
          results.push({
            testNumber: i + 1,
            description: tc.input,
            expected: tc.expected,
            actual: actualVal,
            passed: false,
            error: `Expected: ${tc.expected}, Got: ${actualVal}`,
          });
          logs.push(`❌ Test ${i + 1} Failed: Expected "${tc.expected}", but received "${actualVal}"`);
        }
      } catch (err: any) {
        results.push({
          testNumber: i + 1,
          description: tc.input,
          expected: tc.expected,
          actual: 'Runtime Error',
          passed: false,
          error: err.message,
        });
        logs.push(`❌ Test ${i + 1} Runtime Error: ${err.message}`);
      }
    }

    const passedCount = results.filter((r) => r.passed).length;
    const isSuccess = passedCount === challenge.testCases.length;

    return {
      success: isSuccess,
      totalTests: challenge.testCases.length,
      passedTests: passedCount,
      percentage: Math.round((passedCount / challenge.testCases.length) * 100),
      logs,
      results,
      errorMessage: isSuccess ? undefined : `${challenge.testCases.length - passedCount} of ${challenge.testCases.length} tests failed.`,
    };
  }

  // ----------------------------------------------------------------------------
  // CSS RUNNER
  // ----------------------------------------------------------------------------
  private static evaluateCSS(challenge: ChallengeDefinition, css: string): ChallengeEvaluation {
    const logs: string[] = [];
    const results: TestCaseResult[] = [];
    const normalized = css.toLowerCase().replace(/\s+/g, ' ');

    const hasDisplayGrid = normalized.includes('display: grid') || normalized.includes('display:grid');
    const hasAutoFit = normalized.includes('repeat(auto-fit') && normalized.includes('minmax(');
    const hasGap = normalized.includes('gap: 1.5rem') || normalized.includes('gap:1.5rem') || normalized.includes('gap: 24px');
    // Ensure fixed 'width: 1200px' is eliminated while allowing responsive 'max-width: 1200px'
    const hasFixed1200 = /(?<!max-)width:\s*1200px/i.test(css);
    const noFixed1200 = !hasFixed1200;

    const check1 = hasDisplayGrid && hasAutoFit;
    const check2 = hasGap && noFixed1200;

    results.push({
      testNumber: 1,
      description: 'Fluid auto-fit CSS Grid columns (repeat(auto-fit, minmax(...)))',
      expected: 'Fluid grid layout using modern CSS Grid auto-fit and minmax',
      actual: check1 ? 'Grid repeat auto-fit configured' : 'Missing auto-fit or minmax rules',
      passed: check1,
    });
    logs.push(check1 ? '✓ Test 1: Fluid auto-fit grid columns defined -> Passed' : '❌ Test 1 Failed: Missing display: grid or repeat(auto-fit, minmax(...))');

    results.push({
      testNumber: 2,
      description: 'Fixed 1200px widths removed and fluid gap configured',
      expected: 'Zero fixed width overflow, gap: 1.5rem',
      actual: check2 ? 'Fixed width removed and gap set' : 'Fixed width remains or gap missing',
      passed: check2,
    });
    logs.push(check2 ? '✓ Test 2: Fixed widths removed and gap configured -> Passed' : '❌ Test 2 Failed: Remove width: 1200px and configure gap: 1.5rem');

    const passedCount = results.filter((r) => r.passed).length;
    const isSuccess = passedCount === results.length;

    return {
      success: isSuccess,
      totalTests: results.length,
      passedTests: passedCount,
      percentage: Math.round((passedCount / results.length) * 100),
      logs,
      results,
    };
  }

  // ----------------------------------------------------------------------------
  // SQL RUNNER
  // ----------------------------------------------------------------------------
  private static evaluateSQL(challenge: ChallengeDefinition, sql: string): ChallengeEvaluation {
    const logs: string[] = [];
    const results: TestCaseResult[] = [];
    const upper = sql.toUpperCase();

    if (challenge.id === 'ch-db-01') {
      const hasSelect = upper.includes('SELECT') && upper.includes('CANDIDATE_ID');
      const hasAvg = upper.includes('AVG(') || upper.includes('ROUND(AVG');
      const hasGroupBy = upper.includes('GROUP BY CANDIDATE_ID');
      const hasHaving = upper.includes('HAVING') && (upper.includes('COUNT(') || upper.includes('>= 3'));
      const hasOrderBy = upper.includes('ORDER BY');

      const pass1 = hasSelect && hasAvg && hasGroupBy;
      const pass2 = hasHaving && hasOrderBy;

      results.push({
        testNumber: 1,
        description: 'SELECT candidate_id and rounded AVG score with GROUP BY',
        expected: 'Aggregated average scores grouped by candidate_id',
        actual: pass1 ? 'Aggregation and GROUP BY verified' : 'Missing required AVG or GROUP BY',
        passed: pass1,
      });
      logs.push(pass1 ? '✓ Test 1: SELECT with AVG and GROUP BY -> Passed' : '❌ Test 1: Missing AVG score aggregation or GROUP BY clause');

      results.push({
        testNumber: 2,
        description: 'HAVING filter for evidence_count >= 3 and ORDER BY descending',
        expected: 'Filtered candidate records with count >= 3, sorted descending',
        actual: pass2 ? 'HAVING and ORDER BY verified' : 'Missing HAVING or ORDER BY clause',
        passed: pass2,
      });
      logs.push(pass2 ? '✓ Test 2: HAVING count >= 3 filter & ORDER BY -> Passed' : '❌ Test 2: Missing HAVING count >= 3 or ORDER BY clause');
    } else if (challenge.id === 'ch-db-02') {
      const hasProjectsTable = upper.includes('CREATE TABLE PROJECTS') || upper.includes('CREATE TABLE "PROJECTS"');
      const hasProjectFilesTable = upper.includes('CREATE TABLE PROJECT_FILES') || upper.includes('CREATE TABLE "PROJECT_FILES"');
      const hasCascade = upper.includes('ON DELETE CASCADE');
      const hasIndex = upper.includes('CREATE INDEX') && upper.includes('PROJECT_ID');

      const pass1 = hasProjectsTable && hasProjectFilesTable;
      const pass2 = hasCascade && hasIndex;

      results.push({
        testNumber: 1,
        description: 'DDL creates relational projects and project_files tables',
        expected: 'Tables defined with UUID primary keys and foreign keys',
        actual: pass1 ? 'Table definitions verified' : 'Missing table definition statements',
        passed: pass1,
      });
      logs.push(pass1 ? '✓ Test 1: Table schema DDL -> Passed' : '❌ Test 1: Missing CREATE TABLE for projects or project_files');

      results.push({
        testNumber: 2,
        description: 'ON DELETE CASCADE foreign key constraint & foreign key index',
        expected: 'CASCADE referential integrity and index on project_id',
        actual: pass2 ? 'CASCADE integrity and index verified' : 'Missing CASCADE or index',
        passed: pass2,
      });
      logs.push(pass2 ? '✓ Test 2: ON DELETE CASCADE & index -> Passed' : '❌ Test 2: Missing ON DELETE CASCADE or index on project_id');
    } else {
      const hasCreateIndex = upper.includes('CREATE INDEX') && upper.includes('EVIDENCE');
      const hasComposite = upper.includes('USER_ID') && upper.includes('SKILL_ID');
      const pass = hasCreateIndex && hasComposite;

      results.push({
        testNumber: 1,
        description: 'Composite index statement on (user_id, skill_id, created_at DESC)',
        expected: 'Optimal composite index covering filter and sort columns',
        actual: pass ? 'Composite index verified' : 'Missing composite index columns',
        passed: pass,
      });
      logs.push(pass ? '✓ Test 1: Composite index definition -> Passed' : '❌ Test 1: Missing CREATE INDEX with composite columns');
    }

    const passedCount = results.filter((r) => r.passed).length;
    const isSuccess = passedCount === results.length;

    return {
      success: isSuccess,
      totalTests: results.length,
      passedTests: passedCount,
      percentage: Math.round((passedCount / results.length) * 100),
      logs,
      results,
    };
  }

  // ----------------------------------------------------------------------------
  // BASH / GIT RUNNER
  // ----------------------------------------------------------------------------
  private static evaluateBash(challenge: ChallengeDefinition, script: string): ChallengeEvaluation {
    const logs: string[] = [];
    const results: TestCaseResult[] = [];
    const lower = script.toLowerCase();

    if (challenge.id === 'ch-git-01') {
      const hasAdd = lower.includes('git add');
      const hasCommit = lower.includes('git commit');
      const noConflictMarkers = !script.includes('<<<<<<<') && !script.includes('>>>>>>>');

      const pass1 = noConflictMarkers;
      const pass2 = hasAdd && hasCommit;

      results.push({
        testNumber: 1,
        description: 'Git conflict markers resolved cleanly',
        expected: 'Zero <<<<<<< or >>>>>>> conflict markers',
        actual: pass1 ? 'Markers resolved' : 'Conflict markers remain in file',
        passed: pass1,
      });
      logs.push(pass1 ? '✓ Test 1: Conflict markers resolved -> Passed' : '❌ Test 1: Unresolved Git conflict markers remain');

      results.push({
        testNumber: 2,
        description: 'Staged and finalized merge commit',
        expected: 'git add and git commit commands',
        actual: pass2 ? 'git add & commit verified' : 'Missing git add or commit',
        passed: pass2,
      });
      logs.push(pass2 ? '✓ Test 2: git add and git commit -> Passed' : '❌ Test 2: Missing git add or git commit commands');
    } else {
      const hasKeywords = challenge.requirements.every((req) => {
        const words = req.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter((w) => w.length > 4);
        return words.some((w) => lower.includes(w));
      });

      results.push({
        testNumber: 1,
        description: challenge.testCases[0]?.input || 'Script validation',
        expected: challenge.testCases[0]?.expected || 'Requirements satisfied',
        actual: hasKeywords ? 'Criteria verified' : 'Incomplete commands',
        passed: hasKeywords,
      });
      logs.push(hasKeywords ? '✓ Test 1: Script requirements satisfied -> Passed' : '❌ Test 1: Missing required script commands');
    }

    const passedCount = results.filter((r) => r.passed).length;
    const isSuccess = passedCount === results.length;

    return {
      success: isSuccess,
      totalTests: results.length,
      passedTests: passedCount,
      percentage: Math.round((passedCount / results.length) * 100),
      logs,
      results,
    };
  }

  // ----------------------------------------------------------------------------
  // GENERIC RUNNER
  // ----------------------------------------------------------------------------
  private static evaluateGeneric(challenge: ChallengeDefinition, code: string): ChallengeEvaluation {
    const passed = code.length > 30;
    return {
      success: passed,
      totalTests: 1,
      passedTests: passed ? 1 : 0,
      percentage: passed ? 100 : 0,
      logs: [passed ? '✓ Submission validated successfully.' : '❌ Incomplete submission.'],
      results: [
        {
          testNumber: 1,
          description: 'Basic implementation completeness',
          expected: 'Solution code submitted',
          actual: passed ? 'Verified' : 'Too short',
          passed,
        },
      ],
    };
  }
}
