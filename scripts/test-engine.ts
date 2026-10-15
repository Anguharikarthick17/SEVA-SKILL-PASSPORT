/**
 * SEVA Skill Passport — Phase 3B Scoring Engine Test Suite
 * 
 * Verifies all 14 mandatory scoring engine test cases:
 *  1. One easy challenge
 *  2. Multiple easy challenges (anti-spam / confidence cap)
 *  3. Mixed difficulty
 *  4. Mixed evidence types
 *  5. Repeated attempts (diminishing returns & best-evidence rule)
 *  6. High-quality project
 *  7. Insufficient evidence ("Building evidence" / score clamp)
 *  8. High-confidence evidence (>=6 items and >=3 distinct types)
 *  9. Multiple dimensions (dimension scoring & explainability)
 * 10. Overall competency (only sufficiently evidenced skills included)
 * 11. Hash verification (valid SHA256:SEVA hash)
 * 12. Tampered hash (fails verification)
 * 13. Fresh evidence (< 6 months)
 * 14. Old evidence (> 18 months)
 */

import {
  calculateSkillScore,
  calculateOverallPassport,
  calculateFreshness,
  determineConfidence,
  getAttemptMultiplier,
} from '../src/lib/scoring/engine';
import type {
  EvidenceRecord,
  CalculatedSkillScore,
} from '../src/lib/scoring/engine';
import { generateEvidenceHash, verifyEvidenceHash } from '../src/lib/evidence/hash';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details: string = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}: ${details}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('RUNNING PHASE 3B SCORING ENGINE TEST SUITE');
  console.log('======================================================\n');

  // 1. One easy challenge
  const test1 = calculateSkillScore('javascript', [
    {
      id: 'e1',
      userId: 'u1',
      skillId: 'javascript',
      sourceType: 'challenge',
      sourceId: 'c1',
      score: 100,
      difficulty: 'EASY', // 0.8 multiplier
      qualityLevel: 'BASIC', // 0.9 multiplier
      verificationHash: 'h1',
      createdAt: new Date().toISOString(),
    },
  ]);
  // 1 item < 2 => Insufficient evidence
  assert(!test1.isSufficientlyEvidenced, 'Test 1: One easy challenge is marked insufficient evidence');
  assert(test1.confidence === 'LOW', 'Test 1: Confidence is LOW for single item');

  // 2. Multiple easy challenges
  const test2Items: EvidenceRecord[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `e-easy-${i}`,
    userId: 'u1',
    skillId: 'javascript',
    sourceType: 'challenge',
    sourceId: `c-easy-${i}`,
    score: 100,
    difficulty: 'EASY', // 0.8
    qualityLevel: 'BASIC', // 0.9
    verificationHash: `h-${i}`,
    createdAt: new Date().toISOString(),
  }));
  const test2 = calculateSkillScore('javascript', test2Items);
  // Easy multiplier (0.8 * 0.9 * 100 = 72)
  assert(test2.score === 72, `Test 2: Multiple easy challenges scaled by 0.8*0.9 multipliers to 72% (actual: ${test2.score}%)`);
  assert(test2.confidence === 'LOW', 'Test 2: Confidence remains LOW despite 10 items because evidenceTypes = 1');

  // 3. Mixed difficulty
  const test3 = calculateSkillScore('javascript', [
    {
      id: 'e-hard',
      userId: 'u1',
      skillId: 'javascript',
      sourceType: 'challenge',
      sourceId: 'c-hard',
      score: 80,
      difficulty: 'HARD', // 1.2
      qualityLevel: 'ADVANCED', // 1.15 -> 80 * 1.2 * 1.15 = 110.4 -> clamped to 100
      verificationHash: 'h3a',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'e-easy',
      userId: 'u1',
      skillId: 'javascript',
      sourceType: 'lab',
      sourceId: 'c-easy',
      score: 70,
      difficulty: 'EASY', // 0.8
      qualityLevel: 'BASIC', // 0.9 -> 70 * 0.72 = 50.4
      verificationHash: 'h3b',
      createdAt: new Date().toISOString(),
    },
  ]);
  assert(test3.isSufficientlyEvidenced, 'Test 3: Mixed difficulty is sufficiently evidenced');
  assert(test3.score > 70 && test3.score < 95, `Test 3: Mixed difficulty produces balanced score (${test3.score}%)`);

  // 4. Mixed evidence types
  const test4 = calculateSkillScore('react', [
    { id: '1', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'c1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '2', userId: 'u1', skillId: 'react', sourceType: 'lab', sourceId: 'l1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '3', userId: 'u1', skillId: 'react', sourceType: 'assessment', sourceId: 'a1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
  ]);
  assert(test4.evidenceTypes.length === 3, 'Test 4: Tracks 3 distinct evidence types');
  assert(test4.confidence === 'MEDIUM', 'Test 4: 3 items across 3 types produces MEDIUM confidence');

  // 5. Repeated attempts (diminishing returns & best-evidence rule)
  const test5 = calculateSkillScore('react', [
    { id: '1', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'ch-dup', score: 52, attemptNumber: 1, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '2', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'ch-dup', score: 68, attemptNumber: 2, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '3', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'ch-dup', score: 84, attemptNumber: 3, verificationHash: 'h', createdAt: new Date().toISOString() },
    // Another distinct task to reach sufficient evidence
    { id: '4', userId: 'u1', skillId: 'react', sourceType: 'lab', sourceId: 'lab-other', score: 80, attemptNumber: 1, verificationHash: 'h', createdAt: new Date().toISOString() },
  ]);
  // Best attempt (84) is selected for ch-dup, not sum (52+68+84)
  assert(test5.score < 90, `Test 5: Repeated submissions do not sum scores (${test5.score}%)`);
  assert(getAttemptMultiplier(1) === 1.0 && getAttemptMultiplier(2) === 0.7 && getAttemptMultiplier(3) === 0.5 && getAttemptMultiplier(4) === 0.25, 'Test 5: Diminishing returns multipliers match specs');

  // 6. High-quality project
  const test6 = calculateSkillScore('react', [
    {
      id: 'p1',
      userId: 'u1',
      skillId: 'react',
      sourceType: 'project',
      sourceId: 'proj-capstone',
      score: 95,
      difficulty: 'HARD',
      qualityLevel: 'ADVANCED',
      verificationHash: 'h6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'l1',
      userId: 'u1',
      skillId: 'react',
      sourceType: 'lab',
      sourceId: 'lab-capstone',
      score: 90,
      difficulty: 'HARD',
      qualityLevel: 'ADVANCED',
      verificationHash: 'h6b',
      createdAt: new Date().toISOString(),
    },
  ]);
  assert(test6.score >= 95, `Test 6: High quality project and lab awards high competency (${test6.score}%)`);

  // 7. Insufficient evidence
  const test7 = calculateSkillScore('security', [
    {
      id: 'sec1',
      userId: 'u1',
      skillId: 'security',
      sourceType: 'challenge',
      sourceId: 'sec-ch',
      score: 95,
      verificationHash: 'h7',
      createdAt: new Date().toISOString(),
    },
  ]);
  assert(!test7.isSufficientlyEvidenced, 'Test 7: 1 challenge is not sufficiently evidenced');
  assert(test7.score === 0, 'Test 7: Insufficient evidence clamps displayed score to 0');
  assert(test7.explanation.includes('Building evidence'), 'Test 7: Explanation specifies Building evidence');

  // 8. High-confidence evidence
  const test8 = calculateSkillScore('react', [
    { id: '1', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'c1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '2', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'c2', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '3', userId: 'u1', skillId: 'react', sourceType: 'lab', sourceId: 'l1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '4', userId: 'u1', skillId: 'react', sourceType: 'assessment', sourceId: 'a1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '5', userId: 'u1', skillId: 'react', sourceType: 'project', sourceId: 'p1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '6', userId: 'u1', skillId: 'react', sourceType: 'lesson', sourceId: 'les1', score: 85, verificationHash: 'h', createdAt: new Date().toISOString() },
  ]);
  assert(test8.confidence === 'HIGH', 'Test 8: >=6 items across >=3 types produces HIGH confidence');

  // 9. Multiple dimensions
  const test9 = calculateSkillScore('react', [
    { id: '1', userId: 'u1', skillId: 'react', sourceType: 'challenge', sourceId: 'c1', score: 90, dimension: 'State Management', verificationHash: 'h', createdAt: new Date().toISOString() },
    { id: '2', userId: 'u1', skillId: 'react', sourceType: 'lab', sourceId: 'l1', score: 70, dimension: 'Hooks', verificationHash: 'h', createdAt: new Date().toISOString() },
  ]);
  assert(test9.dimensionScores['State Management'] === 90, 'Test 9: State Management dimension scored correctly');
  assert(test9.dimensionScores['Hooks'] === 70, 'Test 9: Hooks dimension scored correctly');
  assert(test9.weakestDimension === 'Hooks', 'Test 9: Weakest dimension detected as Hooks');

  // 10. Overall competency
  const mockSkills: CalculatedSkillScore[] = [
    { skillId: 'react', score: 84, isSufficientlyEvidenced: true, confidence: 'HIGH', evidenceCount: 6, freshnessStatus: 'Fresh', evidenceTypes: ['challenge'], lastDemonstratedAt: '', dimensionScores: {}, weakestDimension: null, strongestDimension: null, explanation: '', breakdown: {} as any },
    { skillId: 'nodejs', score: 78, isSufficientlyEvidenced: true, confidence: 'MEDIUM', evidenceCount: 3, freshnessStatus: 'Fresh', evidenceTypes: ['challenge'], lastDemonstratedAt: '', dimensionScores: {}, weakestDimension: null, strongestDimension: null, explanation: '', breakdown: {} as any },
    { skillId: 'sql', score: 91, isSufficientlyEvidenced: true, confidence: 'HIGH', evidenceCount: 4, freshnessStatus: 'Fresh', evidenceTypes: ['challenge'], lastDemonstratedAt: '', dimensionScores: {}, weakestDimension: null, strongestDimension: null, explanation: '', breakdown: {} as any },
    { skillId: 'git', score: 88, isSufficientlyEvidenced: true, confidence: 'HIGH', evidenceCount: 3, freshnessStatus: 'Fresh', evidenceTypes: ['challenge'], lastDemonstratedAt: '', dimensionScores: {}, weakestDimension: null, strongestDimension: null, explanation: '', breakdown: {} as any },
    { skillId: 'security', score: 0, isSufficientlyEvidenced: false, confidence: 'LOW', evidenceCount: 1, freshnessStatus: 'Fresh', evidenceTypes: ['challenge'], lastDemonstratedAt: '', dimensionScores: {}, weakestDimension: null, strongestDimension: null, explanation: '', breakdown: {} as any },
  ];
  const overall = calculateOverallPassport(mockSkills);
  // (84 + 78 + 91 + 88) / 4 = 85.25 -> 85
  assert(overall.overallScore === 85, `Test 10: Overall score averages ONLY sufficiently evidenced skills (${overall.overallScore}%)`);
  assert(overall.sufficientlyEvidencedCount === 4, 'Test 10: Correctly reports 4 sufficiently evidenced skills');
  assert(overall.totalCoreSkillsCount === 7, 'Test 10: Reports 7 total core domains');

  // 11. Hash verification (valid hash)
  const canonicalPayload = {
    userId: 'user-123',
    skillId: 'react',
    sourceType: 'challenge' as const,
    sourceId: 'ch-01',
    score: 88,
    dimension: 'State Management',
    difficulty: 'MEDIUM' as const,
    qualityLevel: 'INTERMEDIATE' as const,
    attemptNumber: 1,
    timestamp: '2026-10-06T12:00:00Z',
  };
  const validHash = await generateEvidenceHash(canonicalPayload);
  assert(validHash.startsWith('SHA256:SEVA:'), `Test 11: Hash format starts with SHA256:SEVA: (${validHash})`);

  const verifyValid = await verifyEvidenceHash({
    ...canonicalPayload,
    verificationHash: validHash,
  });
  assert(verifyValid.valid, 'Test 11: Valid evidence record passes verification');
  assert(verifyValid.message === 'Evidence integrity verified.', 'Test 11: Exact wording matches "Evidence integrity verified."');

  // 12. Tampered hash
  const verifyTampered = await verifyEvidenceHash({
    ...canonicalPayload,
    score: 99, // Tampered score!
    verificationHash: validHash,
  });
  assert(!verifyTampered.valid, 'Test 12: Tampered evidence score fails verification');

  // 13. Fresh evidence
  const freshDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
  assert(calculateFreshness(freshDate) === 'Fresh', 'Test 13: 30 days old evidence is Fresh');

  // 14. Old evidence
  const oldDate = new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(); // 600 days ago (> 18 months)
  assert(calculateFreshness(oldDate) === 'Old', 'Test 14: 600 days old evidence is Old');

  console.log('\n------------------------------------------------------');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('------------------------------------------------------\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
