import { getSupabaseBrowserClient, isSupabaseConfigured } from './supabase/client';
import { generateEvidenceHash } from './evidence/hash';
import { calculateSkillScore, calculateOverallPassport, EvidenceRecord, CalculatedSkillScore } from './scoring/engine';
import { COURSES, DEMO_PASSPORT, DEMO_STUDENT, DEMO_PROJECTS } from '@/data';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  education: string;
  state: string;
  district: string;
  targetRole: string;
  githubHandle: string;
  avatarUrl?: string;
  passportVisibility: 'public' | 'private' | 'unlisted';
  createdAt: string;
  updatedAt: string;
}

export interface UserEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'cancelled';
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string | null;
}

export interface StoredEvidence {
  id: string;
  userId: string;
  skillId: string;
  sourceType: 'lesson' | 'challenge' | 'assessment' | 'project' | 'viva';
  sourceId: string;
  score: number;
  metadata: Record<string, any>;
  verificationHash: string;
  createdAt: string;
}

export interface StoredSkillScore {
  id: string;
  userId: string;
  skillId: string;
  score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceCount: number;
  lastUpdated: string;
}

export interface StoredSkillPassport {
  id: string;
  userId: string;
  overallScore: number;
  grade: string;
  passportStatus: 'active' | 'building' | 'suspended';
  verificationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCredential {
  id: string;
  userId: string;
  credentialType: 'course_completion' | 'platform_assessment' | 'skill_passport';
  title: string;
  status: 'active' | 'pending' | 'expired';
  issuedAt: string;
  verificationId: string;
  metadata: Record<string, any>;
}

// STORAGE KEYS FOR PERSISTENT STATE
const STORAGE_PREFIX = 'seva_db_';
const KEY_CURRENT_USER = `${STORAGE_PREFIX}current_user`;
const KEY_PROFILES = `${STORAGE_PREFIX}profiles`;
const KEY_ENROLLMENTS = `${STORAGE_PREFIX}enrollments`;
const KEY_LESSON_PROGRESS = `${STORAGE_PREFIX}lesson_progress`;
const KEY_EVIDENCE = `${STORAGE_PREFIX}evidence`;
const KEY_SKILL_SCORES = `${STORAGE_PREFIX}skill_scores`;
const KEY_PASSPORTS = `${STORAGE_PREFIX}passports`;
const KEY_CREDENTIALS = `${STORAGE_PREFIX}credentials`;
const KEY_SUBMISSIONS = `${STORAGE_PREFIX}submissions`;

function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// Initialize seed data in local persistent store if not initialized
function ensureInitialized(userId: string) {
  if (typeof window === 'undefined') return;

  const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
  if (!profiles[userId]) {
    profiles[userId] = {
      id: userId,
      fullName: DEMO_STUDENT.name,
      email: DEMO_STUDENT.email,
      mobile: DEMO_STUDENT.mobile,
      education: DEMO_STUDENT.education,
      state: DEMO_STUDENT.state,
      district: DEMO_STUDENT.district,
      targetRole: 'Full Stack Developer',
      githubHandle: 'arjunsharma',
      passportVisibility: 'public',
      createdAt: '2024-10-01T00:00:00Z',
      updatedAt: '2024-10-01T00:00:00Z',
    };
    setLocal(KEY_PROFILES, profiles);
  }

  const enrollments = getLocal<UserEnrollment[]>(KEY_ENROLLMENTS, []);
  if (!enrollments.some((e) => e.userId === userId && e.courseId === 'full-stack-development')) {
    enrollments.push({
      id: `enr-${userId}-fs`,
      userId,
      courseId: 'full-stack-development',
      status: 'active',
      progressPercent: 68,
      enrolledAt: '2024-10-01T00:00:00Z',
    });
    setLocal(KEY_ENROLLMENTS, enrollments);
  }

  // Seed initial evidence items
  const evidence = getLocal<StoredEvidence[]>(KEY_EVIDENCE, []);
  if (!evidence.some((e) => e.userId === userId)) {
    const defaultEvidence: StoredEvidence[] = [
      {
        id: `ev-${userId}-1`,
        userId,
        skillId: 'javascript',
        sourceType: 'challenge',
        sourceId: 'ch-01',
        score: 91,
        metadata: { title: 'Array Pipeline & Data Aggregation' },
        verificationHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: '2024-10-02T10:00:00Z',
      },
      {
        id: `ev-${userId}-2`,
        userId,
        skillId: 'javascript',
        sourceType: 'lesson',
        sourceId: 'les-04-02',
        score: 88,
        metadata: { title: 'Promises, Async/Await & Event Loop' },
        verificationHash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        createdAt: '2024-10-03T11:00:00Z',
      },
      {
        id: `ev-${userId}-3`,
        userId,
        skillId: 'react',
        sourceType: 'challenge',
        sourceId: 'ch-03',
        score: 88,
        metadata: { title: 'Custom Hook: useDebounce' },
        verificationHash: 'sha256-ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        createdAt: '2024-10-04T12:00:00Z',
      },
      {
        id: `ev-${userId}-4`,
        userId,
        skillId: 'sql',
        sourceType: 'challenge',
        sourceId: 'ch-04',
        score: 86,
        metadata: { title: 'Aggregating Candidate Competencies via SQL' },
        verificationHash: 'sha256-7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        createdAt: '2024-10-05T14:00:00Z',
      },
    ];
    setLocal(KEY_EVIDENCE, [...evidence, ...defaultEvidence]);
  }

  // Seed passport
  const passports = getLocal<Record<string, StoredSkillPassport>>(KEY_PASSPORTS, {});
  if (!passports[userId]) {
    passports[userId] = {
      id: `pass-${userId}`,
      userId,
      overallScore: 87,
      grade: 'A',
      passportStatus: 'active',
      verificationId: userId === 'std-001' ? 'GSP-DEMO-001' : `GSP-${userId.substring(0, 8).toUpperCase()}`,
      createdAt: '2024-10-01T00:00:00Z',
      updatedAt: '2024-10-05T14:00:00Z',
    };
    setLocal(KEY_PASSPORTS, passports);
  }

  // Seed credentials
  const credentials = getLocal<StoredCredential[]>(KEY_CREDENTIALS, []);
  if (!credentials.some((c) => c.userId === userId)) {
    credentials.push(
      {
        id: 'cred-001',
        userId,
        credentialType: 'course_completion',
        title: 'Full Stack Development',
        status: 'active',
        issuedAt: '2024-10-01T00:00:00Z',
        verificationId: 'cred-001',
        metadata: { courseTitle: 'Full Stack Developer', completedModules: 12 },
      },
      {
        id: 'cred-002',
        userId,
        credentialType: 'platform_assessment',
        title: 'Full Stack Practical Assessment',
        status: 'active',
        issuedAt: '2024-10-01T00:00:00Z',
        verificationId: 'cred-002',
        metadata: { score: 88, passed: true },
      },
      {
        id: 'cred-003',
        userId,
        credentialType: 'skill_passport',
        title: 'SEVA Skill Passport',
        status: 'active',
        issuedAt: '2024-10-01T00:00:00Z',
        verificationId: 'cred-003',
        metadata: { overallCompetency: 87, rank: 'A' },
      }
    );
    setLocal(KEY_CREDENTIALS, credentials);
  }
}

export const DataService = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION & USER PROFILE
  // --------------------------------------------------------------------------
  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = (await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()) as { data: any };

          if (profile) {
            return {
              id: profile.id,
              fullName: profile.full_name,
              email: profile.email,
              mobile: profile.mobile || '',
              education: profile.education || '',
              state: profile.state || '',
              district: profile.district || '',
              targetRole: profile.target_role || 'Full Stack Developer',
              githubHandle: profile.github_handle || '',
              passportVisibility: profile.passport_visibility || 'public',
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase auth check failed, using local store:', err);
      }
    }

    // Local / Demo Store Fallback
    const storedUserId = getLocal<string | null>(KEY_CURRENT_USER, 'std-001');
    if (!storedUserId) return null;
    ensureInitialized(storedUserId);
    const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
    return profiles[storedUserId] || null;
  },

  async registerUser(params: {
    fullName: string;
    email: string;
    password: string;
    mobile: string;
    education: string;
    state: string;
    district: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
            },
          },
        });

        if (authError) {
          return { user: null, error: authError.message };
        }

        if (authData.user) {
          const { error: profileError } = await (supabase as any).from('profiles').insert({
            id: authData.user.id,
            full_name: params.fullName,
            email: params.email,
            mobile: params.mobile,
            education: params.education,
            state: params.state,
            district: params.district,
            passport_visibility: 'public',
          });

          if (profileError && !profileError.message.includes('duplicate')) {
            return { user: null, error: profileError.message };
          }

          const userProfile: UserProfile = {
            id: authData.user.id,
            fullName: params.fullName,
            email: params.email,
            mobile: params.mobile,
            education: params.education,
            state: params.state,
            district: params.district,
            targetRole: 'Full Stack Developer',
            githubHandle: '',
            passportVisibility: 'public',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return { user: userProfile, error: null };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'Registration failed' };
      }
    }

    // Local Persistence Fallback
    const generatedId = `usr-${Date.now().toString(36)}`;
    const newProfile: UserProfile = {
      id: generatedId,
      fullName: params.fullName,
      email: params.email,
      mobile: params.mobile,
      education: params.education,
      state: params.state,
      district: params.district,
      targetRole: 'Full Stack Developer',
      githubHandle: '',
      passportVisibility: 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
    profiles[generatedId] = newProfile;
    setLocal(KEY_PROFILES, profiles);
    setLocal(KEY_CURRENT_USER, generatedId);
    ensureInitialized(generatedId);

    return { user: newProfile, error: null };
  },

  async loginUser(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { user: null, error: error.message };
        }
        if (data.user) {
          const profile = await this.getCurrentUser();
          return { user: profile, error: null };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'Login failed' };
      }
    }

    // Local / Demo Login Fallback
    const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
    const existing = Object.values(profiles).find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      setLocal(KEY_CURRENT_USER, existing.id);
      return { user: existing, error: null };
    }

    // If demo login with any email, sign in or create demo profile
    const fallbackUser = await this.getCurrentUser();
    return { user: fallbackUser, error: null };
  },

  async logoutUser(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setLocal(KEY_CURRENT_USER, null);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({
            full_name: data.fullName,
            mobile: data.mobile,
            education: data.education,
            state: data.state,
            district: data.district,
            target_role: data.targetRole,
            github_handle: data.githubHandle,
            passport_visibility: data.passportVisibility,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } catch (e) {
        console.warn('Supabase profile update fallback:', e);
      }
    }

    const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
    if (profiles[userId]) {
      profiles[userId] = { ...profiles[userId], ...data, updatedAt: new Date().toISOString() };
      setLocal(KEY_PROFILES, profiles);
      return profiles[userId];
    }
    throw new Error('Profile not found');
  },

  // --------------------------------------------------------------------------
  // COURSES & ENROLLMENTS
  // --------------------------------------------------------------------------
  async getCourses() {
    return COURSES;
  },

  async getCourseBySlug(slug: string) {
    return COURSES.find((c) => c.slug === slug) || null;
  },

  async getUserEnrollment(userId: string, courseId: string = 'full-stack-development'): Promise<UserEnrollment | null> {
    const enrollments = getLocal<UserEnrollment[]>(KEY_ENROLLMENTS, []);
    return enrollments.find((e) => e.userId === userId && e.courseId === courseId && e.status === 'active') || null;
  },

  async enrollInCourse(userId: string, courseId: string): Promise<UserEnrollment> {
    const enrollments = getLocal<UserEnrollment[]>(KEY_ENROLLMENTS, []);
    const existing = enrollments.find((e) => e.userId === userId && e.courseId === courseId);

    if (existing) {
      if (existing.status !== 'active') {
        existing.status = 'active';
        setLocal(KEY_ENROLLMENTS, enrollments);
      }
      return existing;
    }

    const newEnrollment: UserEnrollment = {
      id: `enr-${userId}-${courseId}`,
      userId,
      courseId,
      status: 'active',
      progressPercent: 0,
      enrolledAt: new Date().toISOString(),
    };

    enrollments.push(newEnrollment);
    setLocal(KEY_ENROLLMENTS, enrollments);
    return newEnrollment;
  },

  // --------------------------------------------------------------------------
  // LESSON PROGRESS & LEARNING
  // --------------------------------------------------------------------------
  async markLessonComplete(userId: string, lessonId: string, courseId: string = 'full-stack-development') {
    const progressList = getLocal<Record<string, boolean>>(KEY_LESSON_PROGRESS, {});
    progressList[`${userId}_${lessonId}`] = true;
    setLocal(KEY_LESSON_PROGRESS, progressList);

    // Count completed lessons for this user
    const totalPublishedLessons = 15; // In seeded curriculum
    const userCompletedCount = Object.keys(progressList).filter((k) => k.startsWith(`${userId}_`)).length;
    const progressPercent = Math.min(100, Math.round((userCompletedCount / totalPublishedLessons) * 100));

    // Update enrollment progress percent
    const enrollments = getLocal<UserEnrollment[]>(KEY_ENROLLMENTS, []);
    const userEnr = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
    if (userEnr) {
      userEnr.progressPercent = progressPercent;
      setLocal(KEY_ENROLLMENTS, enrollments);
    }

    // Generate evidence record for this completed lesson
    const hash = await generateEvidenceHash({
      userId,
      skillId: 'javascript',
      sourceType: 'lesson',
      sourceId: lessonId,
      score: 85,
      timestamp: new Date().toISOString(),
    });

    await this.addEvidence({
      userId,
      skillId: 'javascript',
      sourceType: 'lesson',
      sourceId: lessonId,
      score: 85,
      metadata: { lessonId, completedAt: new Date().toISOString() },
      verificationHash: hash,
    });

    return { progressPercent, completedLessons: userCompletedCount };
  },

  // --------------------------------------------------------------------------
  // PRACTICE CHALLENGES & EVIDENCE GENERATION
  // --------------------------------------------------------------------------
  async submitChallenge(params: {
    userId: string;
    challengeId: string;
    skillId: string;
    code: string;
    score: number;
    testsPassed: number;
    testsTotal: number;
  }) {
    // Record submission
    const submissions = getLocal<any[]>(KEY_SUBMISSIONS, []);
    submissions.push({
      id: `sub-${Date.now()}`,
      userId: params.userId,
      challengeId: params.challengeId,
      code: params.code,
      score: params.score,
      status: 'passed',
      submittedAt: new Date().toISOString(),
    });
    setLocal(KEY_SUBMISSIONS, submissions);

    // Generate verifiable hash
    const hash = await generateEvidenceHash({
      userId: params.userId,
      skillId: params.skillId,
      sourceType: 'challenge',
      sourceId: params.challengeId,
      score: params.score,
      timestamp: new Date().toISOString(),
      metadata: { testsPassed: params.testsPassed, testsTotal: params.testsTotal },
    });

    // Add to evidence table
    await this.addEvidence({
      userId: params.userId,
      skillId: params.skillId,
      sourceType: 'challenge',
      sourceId: params.challengeId,
      score: params.score,
      metadata: { testsPassed: params.testsPassed, testsTotal: params.testsTotal },
      verificationHash: hash,
    });

    return { success: true, verificationHash: hash };
  },

  // --------------------------------------------------------------------------
  // EVIDENCE & SKILL PASSPORT ENGINE
  // --------------------------------------------------------------------------
  async addEvidence(evidenceItem: Omit<StoredEvidence, 'id' | 'createdAt'>): Promise<StoredEvidence> {
    const evidenceList = getLocal<StoredEvidence[]>(KEY_EVIDENCE, []);
    const newEvidence: StoredEvidence = {
      ...evidenceItem,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    evidenceList.push(newEvidence);
    setLocal(KEY_EVIDENCE, evidenceList);

    // Recalculate skill scores for this skill
    await this.recalculateScores(evidenceItem.userId);

    return newEvidence;
  },

  async getUserEvidence(userId: string, skillId?: string): Promise<StoredEvidence[]> {
    ensureInitialized(userId);
    const evidenceList = getLocal<StoredEvidence[]>(KEY_EVIDENCE, []);
    return evidenceList.filter((e) => {
      if (e.userId !== userId) return false;
      if (skillId && e.skillId.toLowerCase() !== skillId.toLowerCase()) return false;
      return true;
    });
  },

  async recalculateScores(userId: string) {
    const userEvidence = await this.getUserEvidence(userId);
    const skills = ['javascript', 'react', 'html-css', 'nodejs', 'sql', 'git', 'testing'];

    const calculatedSkills: CalculatedSkillScore[] = skills.map((s) => {
      return calculateSkillScore(s, userEvidence as EvidenceRecord[]);
    });

    setLocal(`${KEY_SKILL_SCORES}_${userId}`, calculatedSkills);

    // Recalculate overall passport
    const passportCalc = calculateOverallPassport(calculatedSkills);
    const passports = getLocal<Record<string, StoredSkillPassport>>(KEY_PASSPORTS, {});
    const existing = passports[userId];

    const verificationId = existing?.verificationId || `GSP-${userId.substring(0, 8).toUpperCase()}`;

    passports[userId] = {
      id: existing?.id || `pass-${userId}`,
      userId,
      overallScore: passportCalc.overallScore,
      grade: passportCalc.grade,
      passportStatus: passportCalc.status,
      verificationId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocal(KEY_PASSPORTS, passports);

    return { calculatedSkills, passport: passports[userId] };
  },

  async getUserSkillPassport(userId: string): Promise<StoredSkillPassport | null> {
    ensureInitialized(userId);
    const passports = getLocal<Record<string, StoredSkillPassport>>(KEY_PASSPORTS, {});
    return passports[userId] || null;
  },

  async getUserCredentials(userId: string): Promise<StoredCredential[]> {
    ensureInitialized(userId);
    const credentials = getLocal<StoredCredential[]>(KEY_CREDENTIALS, []);
    return credentials.filter((c) => c.userId === userId);
  },

  // --------------------------------------------------------------------------
  // PUBLIC VERIFICATION LOOKUP
  // --------------------------------------------------------------------------
  async verifyById(verificationId: string) {
    const trimmed = verificationId.trim();

    // 1. Demo Record Check
    if (trimmed.toUpperCase() === 'GSP-DEMO-001') {
      return {
        id: 'GSP-DEMO-001',
        title: 'Full Stack Developer Skill Passport',
        candidateName: 'Sample Candidate',
        role: 'Full Stack Developer',
        issueDate: 'October 1, 2024',
        validUntil: 'October 1, 2026',
        status: 'VERIFIED_ACTIVE',
        competencyScore: 87,
        grade: 'A',
        isPrototypeDemo: true,
        evidenceHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        evidenceSummary: { challenges: 15, labs: 9, projects: 2, assessments: 3 },
        skills: DEMO_PASSPORT.skills.slice(0, 5),
      };
    }

    if (trimmed === 'cred-001') {
      return {
        id: 'cred-001',
        title: 'Full Stack Development Course Completion',
        candidateName: 'Arjun Sharma',
        role: 'Full Stack Developer',
        issueDate: 'October 1, 2024',
        validUntil: 'Lifetime',
        status: 'VERIFIED_ACTIVE',
        competencyScore: 84,
        grade: 'A',
        isPrototypeDemo: true,
        evidenceHash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        evidenceSummary: { challenges: 12, labs: 8, projects: 2, assessments: 2 },
        skills: DEMO_PASSPORT.skills.slice(0, 4),
      };
    }

    // 2. Real User Passport Lookup
    const passports = getLocal<Record<string, StoredSkillPassport>>(KEY_PASSPORTS, {});
    const matchedPassport = Object.values(passports).find(
      (p) => p.verificationId.toUpperCase() === trimmed.toUpperCase()
    );

    if (matchedPassport) {
      const profiles = getLocal<Record<string, UserProfile>>(KEY_PROFILES, {});
      const userProfile = profiles[matchedPassport.userId];
      const isPublic = userProfile?.passportVisibility === 'public';

      return {
        id: matchedPassport.verificationId,
        title: 'SEVA Verified Skill Passport',
        // Obscure / protect candidate identity if private or unlisted
        candidateName: isPublic ? (userProfile?.fullName || 'Verified Learner') : 'Protected Candidate',
        role: userProfile?.targetRole || 'Full Stack Developer',
        issueDate: new Date(matchedPassport.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        validUntil: 'October 1, 2026',
        status: matchedPassport.passportStatus === 'active' ? 'VERIFIED_ACTIVE' : 'BUILDING_EVIDENCE',
        competencyScore: matchedPassport.overallScore,
        grade: matchedPassport.grade,
        isPrototypeDemo: false,
        evidenceHash: `sha256-${matchedPassport.userId.replace(/-/g, '').padStart(64, '0')}`,
        evidenceSummary: { challenges: 15, labs: 9, projects: 2, assessments: 3 },
        skills: DEMO_PASSPORT.skills.slice(0, 5),
      };
    }

    return null;
  },
};
