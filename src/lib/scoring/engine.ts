/**
 * SEVA Skill Scoring Engine
 * 
 * Reusable scoring engine that calculates competency scores from verified evidence.
 * 
 * Weighted formula:
 * - 40% challenge performance
 * - 20% assessment performance
 * - 25% project evidence
 * - 15% lab/learning evidence
 * 
 * Only categories with active evidence are included in the weighted calculation.
 */

export interface EvidenceRecord {
  id: string;
  userId: string;
  skillId: string;
  sourceType: 'lesson' | 'challenge' | 'assessment' | 'project' | 'viva';
  sourceId: string;
  score: number;
  metadata?: Record<string, any>;
  verificationHash: string;
  createdAt: string;
}

export interface CalculatedSkillScore {
  skillId: string;
  score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceCount: number;
  lastUpdated: string;
  breakdown: {
    challengeAvg: number | null;
    assessmentAvg: number | null;
    projectAvg: number | null;
    learningAvg: number | null;
  };
}

export interface CalculatedPassport {
  overallScore: number;
  grade: string;
  status: 'active' | 'building' | 'suspended';
  totalEvidenceCount: number;
  lastUpdated: string;
}

const WEIGHTS = {
  challenge: 0.40,
  assessment: 0.20,
  project: 0.25,
  lesson: 0.15,
};

/**
 * Calculates competency score for a single skill based on its evidence items
 */
export function calculateSkillScore(skillId: string, evidenceItems: EvidenceRecord[]): CalculatedSkillScore {
  const skillEvidence = evidenceItems.filter(
    (e) => e.skillId.toLowerCase() === skillId.toLowerCase()
  );

  if (skillEvidence.length === 0) {
    return {
      skillId,
      score: 0,
      confidence: 'LOW',
      evidenceCount: 0,
      lastUpdated: new Date().toISOString(),
      breakdown: {
        challengeAvg: null,
        assessmentAvg: null,
        projectAvg: null,
        learningAvg: null,
      },
    };
  }

  const bySource: Record<string, number[]> = {
    challenge: [],
    assessment: [],
    project: [],
    lesson: [],
  };

  skillEvidence.forEach((item) => {
    if (bySource[item.sourceType]) {
      bySource[item.sourceType].push(item.score);
    }
  });

  const averages: Record<string, number | null> = {
    challenge: bySource.challenge.length > 0 ? average(bySource.challenge) : null,
    assessment: bySource.assessment.length > 0 ? average(bySource.assessment) : null,
    project: bySource.project.length > 0 ? average(bySource.project) : null,
    lesson: bySource.lesson.length > 0 ? average(bySource.lesson) : null,
  };

  let totalWeightedScore = 0;
  let totalApplicableWeight = 0;

  (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).forEach((source) => {
    const avg = averages[source];
    if (avg !== null) {
      const weight = WEIGHTS[source];
      totalWeightedScore += avg * weight;
      totalApplicableWeight += weight;
    }
  });

  const finalScore =
    totalApplicableWeight > 0
      ? Math.round((totalWeightedScore / totalApplicableWeight) * 10) / 10
      : 0;

  // Determine Confidence Level:
  // HIGH: At least 3 distinct sources OR >= 5 evidence items
  // MEDIUM: At least 2 sources OR >= 3 evidence items
  // LOW: 1 source or < 3 items
  const activeSourcesCount = Object.values(averages).filter((v) => v !== null).length;
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (activeSourcesCount >= 3 || skillEvidence.length >= 6) {
    confidence = 'HIGH';
  } else if (activeSourcesCount >= 2 || skillEvidence.length >= 3) {
    confidence = 'MEDIUM';
  }

  return {
    skillId,
    score: Math.min(100, Math.max(0, finalScore)),
    confidence,
    evidenceCount: skillEvidence.length,
    lastUpdated: new Date().toISOString(),
    breakdown: {
      challengeAvg: averages.challenge,
      assessmentAvg: averages.assessment,
      projectAvg: averages.project,
      learningAvg: averages.lesson,
    },
  };
}

/**
 * Calculates overall Skill Passport score and grade from all skill scores
 */
export function calculateOverallPassport(skillScores: CalculatedSkillScore[]): CalculatedPassport {
  const scoredSkills = skillScores.filter((s) => s.evidenceCount > 0 && s.score > 0);
  const totalEvidence = skillScores.reduce((acc, curr) => acc + curr.evidenceCount, 0);

  if (scoredSkills.length === 0 || totalEvidence < 3) {
    return {
      overallScore: 0,
      grade: 'Building evidence',
      status: 'building',
      totalEvidenceCount: totalEvidence,
      lastUpdated: new Date().toISOString(),
    };
  }

  const overallAvg = Math.round(
    scoredSkills.reduce((acc, curr) => acc + curr.score, 0) / scoredSkills.length
  );

  let grade = 'D';
  if (overallAvg >= 90) {
    grade = 'A+';
  } else if (overallAvg >= 80) {
    grade = 'A';
  } else if (overallAvg >= 70) {
    grade = 'B';
  } else if (overallAvg >= 60) {
    grade = 'C';
  }

  return {
    overallScore: overallAvg,
    grade,
    status: 'active',
    totalEvidenceCount: totalEvidence,
    lastUpdated: new Date().toISOString(),
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
