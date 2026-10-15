/**
 * SEVA Skill Scoring & Competency Engine (Phase 3B)
 * 
 * CORE PRINCIPLE:
 * PROOF OF COURSE → PROOF OF ABILITY
 * 
 * Separates COURSE PROGRESS from SKILL COMPETENCY.
 * Incorporates:
 * - Evidence Quality (Difficulty & Quality Level multipliers)
 * - Anti-gaming: Diminishing returns & best-evidence rule
 * - Evidence Diversity & Confidence Calibration (LOW, MEDIUM, HIGH)
 * - Deep Competency Dimensions (React, Node.js, SQL, Security, Git, Testing, Deployment)
 * - Insufficient Evidence Handling ("Building evidence")
 * - Freshness Classification (Fresh, Aging, Old)
 * - Explainable "Why This Score?" generation
 */

export type SourceType = 'lesson' | 'practice' | 'lab' | 'challenge' | 'assessment' | 'project' | 'viva';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QualityLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type ConfidenceRating = 'LOW' | 'MEDIUM' | 'HIGH';
export type FreshnessStatus = 'Fresh' | 'Aging' | 'Old';

export interface EvidenceRecord {
  id: string;
  userId: string;
  skillId: string;
  sourceType: SourceType;
  sourceId: string;
  score: number;
  difficulty?: DifficultyLevel;
  qualityLevel?: QualityLevel;
  dimension?: string | null;
  attemptNumber?: number;
  lastDemonstratedAt?: string;
  metadata?: Record<string, any>;
  verificationHash: string;
  createdAt: string;
}

export interface DimensionScore {
  name: string;
  score: number;
  evidenceCount: number;
}

export interface CalculatedSkillScore {
  skillId: string;
  score: number;
  confidence: ConfidenceRating;
  evidenceCount: number;
  evidenceTypes: SourceType[];
  isSufficientlyEvidenced: boolean;
  freshnessStatus: FreshnessStatus;
  lastDemonstratedAt: string;
  dimensionScores: Record<string, number>;
  weakestDimension: string | null;
  strongestDimension: string | null;
  explanation: string;
  breakdown: {
    challengeCount: number;
    labCount: number;
    assessmentCount: number;
    projectCount: number;
    practiceCount: number;
    lessonCount: number;
    challengeAvg: number | null;
    assessmentAvg: number | null;
    projectAvg: number | null;
    practiceAvg: number | null;
    learningAvg: number | null;
  };
}

export interface CalculatedPassport {
  overallScore: number;
  grade: string;
  status: 'active' | 'building' | 'suspended';
  confidence: ConfidenceRating;
  totalEvidenceCount: number;
  sufficientlyEvidencedCount: number;
  totalCoreSkillsCount: number;
  freshnessStatus: FreshnessStatus;
  lastUpdated: string;
}

// ----------------------------------------------------------------------------
// CONSTANTS & MULTIPLIERS
// ----------------------------------------------------------------------------

export const BASE_SOURCE_WEIGHTS: Record<SourceType, number> = {
  challenge: 0.30,
  project: 0.25,
  assessment: 0.20,
  lab: 0.15,
  practice: 0.15,
  lesson: 0.10,
  viva: 0.20,
};

export const DIFFICULTY_MULTIPLIERS: Record<DifficultyLevel, number> = {
  EASY: 0.80,
  MEDIUM: 1.00,
  HARD: 1.20,
};

export const QUALITY_MULTIPLIERS: Record<QualityLevel, number> = {
  BASIC: 0.90,
  INTERMEDIATE: 1.00,
  ADVANCED: 1.15,
};

export const ATTEMPT_DIMINISHING_RETURNS = [1.00, 0.70, 0.50, 0.25];

export const CORE_SKILL_DIMENSIONS: Record<string, string[]> = {
  react: [
    'Component Design',
    'State Management',
    'Hooks',
    'Forms',
    'API Integration',
    'Error Handling',
    'Architecture',
    'Debugging',
  ],
  nodejs: [
    'Server Fundamentals',
    'Routing',
    'Middleware',
    'Error Handling',
    'API Design',
    'Validation',
    'Architecture',
    'Debugging',
  ],
  sql: [
    'Querying',
    'Joins',
    'Data Modeling',
    'Indexes',
    'Transactions',
    'Query Optimization',
  ],
  security: [
    'Authentication',
    'Authorization',
    'Input Validation',
    'Secure Storage',
    'Common Vulnerabilities',
    'Secure API Design',
  ],
  git: [
    'Repository Management',
    'Commits',
    'Branching',
    'Merging',
    'Pull Requests',
    'Conflict Resolution',
    'Workflow',
  ],
  testing: [
    'Unit Testing',
    'Integration Testing',
    'API Testing',
    'Assertions',
    'Mocking',
    'Coverage',
    'Debugging',
  ],
  deployment: [
    'Builds',
    'Environment Configuration',
    'Deployment',
    'Database Deployment',
    'Logging',
    'Monitoring',
    'Production Readiness',
  ],
};

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

export function getAttemptMultiplier(attemptNumber: number = 1): number {
  if (attemptNumber <= 1) return ATTEMPT_DIMINISHING_RETURNS[0];
  if (attemptNumber === 2) return ATTEMPT_DIMINISHING_RETURNS[1];
  if (attemptNumber === 3) return ATTEMPT_DIMINISHING_RETURNS[2];
  return ATTEMPT_DIMINISHING_RETURNS[3];
}

export function calculateFreshness(dateString?: string): FreshnessStatus {
  if (!dateString) return 'Fresh';
  const itemDate = new Date(dateString).getTime();
  if (isNaN(itemDate)) return 'Fresh';
  const now = Date.now();
  const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);

  if (diffDays <= 180) return 'Fresh';     // < 6 months
  if (diffDays <= 540) return 'Aging';     // 6 - 18 months
  return 'Old';                           // > 18 months
}

export function determineConfidence(evidenceCount: number, distinctTypeCount: number): ConfidenceRating {
  if (evidenceCount >= 6 && distinctTypeCount >= 3) {
    return 'HIGH';
  }
  if (evidenceCount >= 3 && distinctTypeCount >= 2) {
    return 'MEDIUM';
  }
  return 'LOW';
}

// ----------------------------------------------------------------------------
// SINGLE SKILL COMPETENCY CALCULATION
// ----------------------------------------------------------------------------

export function calculateSkillScore(skillId: string, evidenceItems: EvidenceRecord[]): CalculatedSkillScore {
  const normalizedSkillId = skillId.toLowerCase().trim();
  const relevantEvidence = evidenceItems.filter(
    (e) => e.skillId.toLowerCase().trim() === normalizedSkillId
  );

  // Default empty state
  if (relevantEvidence.length === 0) {
    return {
      skillId,
      score: 0,
      confidence: 'LOW',
      evidenceCount: 0,
      evidenceTypes: [],
      isSufficientlyEvidenced: false,
      freshnessStatus: 'Fresh',
      lastDemonstratedAt: new Date().toISOString(),
      dimensionScores: {},
      weakestDimension: null,
      strongestDimension: null,
      explanation: 'Building evidence: No verifiable demonstrations logged yet for this domain.',
      breakdown: {
        challengeCount: 0,
        labCount: 0,
        assessmentCount: 0,
        projectCount: 0,
        practiceCount: 0,
        lessonCount: 0,
        challengeAvg: null,
        assessmentAvg: null,
        projectAvg: null,
        practiceAvg: null,
        learningAvg: null,
      },
    };
  }

  // 1. Group by sourceId to apply Best-Evidence Rule and Anti-Spam Diminishing Returns
  // Multiple attempts on the exact same challenge/lab are grouped
  const bySourceId: Record<string, EvidenceRecord[]> = {};
  relevantEvidence.forEach((item) => {
    const key = `${item.sourceType}:${item.sourceId}`;
    if (!bySourceId[key]) bySourceId[key] = [];
    bySourceId[key].push(item);
  });

  // Evaluate each unique activity using the best meaningful demonstration
  const consolidatedEvidence: Array<{
    item: EvidenceRecord;
    effectiveScore: number;
    effectiveWeight: number;
  }> = [];

  Object.values(bySourceId).forEach((attempts) => {
    // Sort attempts by performance score descending (Best-evidence rule)
    attempts.sort((a, b) => b.score - a.score);
    const bestAttempt = attempts[0];
    const attemptCount = attempts.length;

    // Apply diminishing returns if user repeatedly submitted the same task
    const attemptPenalty = getAttemptMultiplier(attemptCount);

    const diffMultiplier = DIFFICULTY_MULTIPLIERS[bestAttempt.difficulty || 'MEDIUM'];
    const qualMultiplier = QUALITY_MULTIPLIERS[bestAttempt.qualityLevel || 'INTERMEDIATE'];
    const baseWeight = BASE_SOURCE_WEIGHTS[bestAttempt.sourceType] || 0.15;

    // Scaled performance: base score modified by difficulty and quality
    // Clamped strictly between 0 and 100
    const rawScaledScore = bestAttempt.score * diffMultiplier * qualMultiplier;
    const effectiveScore = Math.min(100, Math.max(0, rawScaledScore));

    // Effective weight applies the attempt penalty for identical task repeats
    const effectiveWeight = baseWeight * attemptPenalty;

    consolidatedEvidence.push({
      item: bestAttempt,
      effectiveScore,
      effectiveWeight,
    });
  });

  // 2. Aggregate weighted score across all unique activities
  let weightedScoreSum = 0;
  let totalWeight = 0;

  consolidatedEvidence.forEach(({ effectiveScore, effectiveWeight }) => {
    weightedScoreSum += effectiveScore * effectiveWeight;
    totalWeight += effectiveWeight;
  });

  const rawFinalScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
  const roundedScore = Math.round(rawFinalScore);

  // 3. Evidence Diversity & Type Breakdown
  const distinctTypes = Array.from(
    new Set(relevantEvidence.map((e) => e.sourceType))
  ) as SourceType[];

  const breakdownCounts = {
    challengeCount: relevantEvidence.filter((e) => e.sourceType === 'challenge').length,
    labCount: relevantEvidence.filter((e) => e.sourceType === 'lab').length,
    assessmentCount: relevantEvidence.filter((e) => e.sourceType === 'assessment').length,
    projectCount: relevantEvidence.filter((e) => e.sourceType === 'project').length,
    practiceCount: relevantEvidence.filter((e) => e.sourceType === 'practice').length,
    lessonCount: relevantEvidence.filter((e) => e.sourceType === 'lesson').length,
  };

  // 4. Determine Sufficiency
  // Requirement: Insufficient evidence should NOT display high arbitrary score.
  // Must have at least 2 evidence items, and at least 1 non-lesson practical activity.
  const practicalCount =
    breakdownCounts.challengeCount +
    breakdownCounts.labCount +
    breakdownCounts.assessmentCount +
    breakdownCounts.projectCount +
    breakdownCounts.practiceCount;

  const isSufficientlyEvidenced = relevantEvidence.length >= 2 && practicalCount >= 1;

  // 5. Confidence Rating
  const confidence = determineConfidence(relevantEvidence.length, distinctTypes.length);

  // 6. Dimension Scoring
  const dimensionScores: Record<string, number> = {};
  const dimEvidenceMap: Record<string, number[]> = {};

  relevantEvidence.forEach((item) => {
    if (item.dimension) {
      if (!dimEvidenceMap[item.dimension]) dimEvidenceMap[item.dimension] = [];
      dimEvidenceMap[item.dimension].push(item.score);
    }
  });

  Object.entries(dimEvidenceMap).forEach(([dimName, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    dimensionScores[dimName] = Math.round(avg);
  });

  // Calculate weakest and strongest dimensions
  let weakestDimension: string | null = null;
  let strongestDimension: string | null = null;
  const dimensionEntries = Object.entries(dimensionScores);
  if (dimensionEntries.length > 0) {
    dimensionEntries.sort((a, b) => a[1] - b[1]);
    weakestDimension = dimensionEntries[0][0];
    strongestDimension = dimensionEntries[dimensionEntries.length - 1][0];
  }

  // 7. Freshness
  const dates = relevantEvidence
    .map((e) => e.lastDemonstratedAt || e.createdAt)
    .filter(Boolean)
    .sort()
    .reverse();
  const latestDate = dates[0] || new Date().toISOString();
  const freshnessStatus = calculateFreshness(latestDate);

  // 8. Human-Readable "Why This Score?" Explanation
  let explanation = '';
  if (!isSufficientlyEvidenced) {
    explanation = `Building evidence: ${relevantEvidence.length} activity logged. Requires at least 2 demonstrations across practical assessments, labs, or projects to establish verified competency.`;
  } else {
    const parts: string[] = [];
    if (breakdownCounts.projectCount > 0) parts.push(`${breakdownCounts.projectCount} project`);
    if (breakdownCounts.challengeCount > 0) parts.push(`${breakdownCounts.challengeCount} challenges`);
    if (breakdownCounts.labCount > 0) parts.push(`${breakdownCounts.labCount} labs`);
    if (breakdownCounts.assessmentCount > 0) parts.push(`${breakdownCounts.assessmentCount} assessment`);

    const summaryList = parts.join(', ') || `${relevantEvidence.length} activities`;
    explanation = `Your ${skillId} competency is calculated from ${relevantEvidence.length} evidence items (${summaryList}) across ${distinctTypes.length} distinct evidence types. `;

    if (strongestDimension && dimensionScores[strongestDimension] >= 80) {
      explanation += `Strong demonstration in ${strongestDimension} (${dimensionScores[strongestDimension]}%) elevated your overall rating. `;
    }
    if (weakestDimension && dimensionScores[weakestDimension] < 75) {
      explanation += `Focus on ${weakestDimension} (${dimensionScores[weakestDimension]}%) as your primary growth opportunity.`;
    } else {
      explanation += `Demonstrates balanced capability across core requirements.`;
    }
  }

  // Category averages for breakdown
  const calcAvg = (type: SourceType) => {
    const items = relevantEvidence.filter((e) => e.sourceType === type);
    if (items.length === 0) return null;
    return Math.round(items.reduce((a, b) => a + b.score, 0) / items.length);
  };

  return {
    skillId,
    score: isSufficientlyEvidenced ? roundedScore : 0,
    confidence,
    evidenceCount: relevantEvidence.length,
    evidenceTypes: distinctTypes,
    isSufficientlyEvidenced,
    freshnessStatus,
    lastDemonstratedAt: latestDate,
    dimensionScores,
    weakestDimension,
    strongestDimension,
    explanation,
    breakdown: {
      ...breakdownCounts,
      challengeAvg: calcAvg('challenge'),
      assessmentAvg: calcAvg('assessment'),
      projectAvg: calcAvg('project'),
      practiceAvg: calcAvg('practice') || calcAvg('lab'),
      learningAvg: calcAvg('lesson'),
    },
  };
}

// ----------------------------------------------------------------------------
// OVERALL SKILL PASSPORT CALCULATION
// ----------------------------------------------------------------------------

export function calculateOverallPassport(skillScores: CalculatedSkillScore[]): CalculatedPassport {
  // Only include skills that are sufficiently evidenced!
  // Skills marked "Building evidence" do not artificially reduce the score.
  const sufficientlyEvidencedSkills = skillScores.filter((s) => s.isSufficientlyEvidenced && s.score > 0);
  const totalEvidenceCount = skillScores.reduce((acc, curr) => acc + curr.evidenceCount, 0);

  // Core full-stack competency domains count
  const coreDomains = ['React', 'Node.js', 'SQL', 'Security', 'Git', 'Testing', 'Deployment'];
  const totalCoreSkillsCount = coreDomains.length;

  if (sufficientlyEvidencedSkills.length === 0 || totalEvidenceCount < 3) {
    return {
      overallScore: 0,
      grade: 'Building evidence',
      status: 'building',
      confidence: 'LOW',
      totalEvidenceCount,
      sufficientlyEvidencedCount: sufficientlyEvidencedSkills.length,
      totalCoreSkillsCount,
      freshnessStatus: 'Fresh',
      lastUpdated: new Date().toISOString(),
    };
  }

  const overallAvg = Math.round(
    sufficientlyEvidencedSkills.reduce((acc, curr) => acc + curr.score, 0) /
      sufficientlyEvidencedSkills.length
  );

  let grade = 'D';
  if (overallAvg >= 90) grade = 'A+';
  else if (overallAvg >= 80) grade = 'A';
  else if (overallAvg >= 70) grade = 'B';
  else if (overallAvg >= 60) grade = 'C';

  // Passport confidence depends on how many core skills are verified and total diversity
  const highConfidenceSkills = sufficientlyEvidencedSkills.filter((s) => s.confidence === 'HIGH').length;
  let overallConfidence: ConfidenceRating = 'LOW';
  if (highConfidenceSkills >= 3 && sufficientlyEvidencedSkills.length >= 4) {
    overallConfidence = 'HIGH';
  } else if (sufficientlyEvidencedSkills.length >= 2) {
    overallConfidence = 'MEDIUM';
  }

  // Determine overall freshness
  const freshnessStatuses = sufficientlyEvidencedSkills.map((s) => s.freshnessStatus);
  const overallFreshness: FreshnessStatus = freshnessStatuses.includes('Fresh')
    ? 'Fresh'
    : freshnessStatuses.includes('Aging')
    ? 'Aging'
    : 'Old';

  return {
    overallScore: overallAvg,
    grade,
    status: 'active',
    confidence: overallConfidence,
    totalEvidenceCount,
    sufficientlyEvidencedCount: sufficientlyEvidencedSkills.length,
    totalCoreSkillsCount,
    freshnessStatus: overallFreshness,
    lastUpdated: new Date().toISOString(),
  };
}
