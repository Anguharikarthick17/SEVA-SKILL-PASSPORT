export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  format: string[];
  price: number;
  currency: string;
  status: 'active' | 'coming-soon';
  skills: string[];
  modules: CourseModule[];
  description: string;
  duration: string;
  enrolled: number;
  image?: string;
}

export interface CourseModule {
  id: string;
  number: string;
  title: string;
  lessons: Lesson[];
  status?: 'completed' | 'current' | 'locked';
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'lab' | 'quiz' | 'project' | 'reading';
  duration: string;
  completed?: boolean;
}

export interface SkillScore {
  name: string;
  score: number;
  category: string;
  evidence?: EvidenceItem[];
}

export interface EvidenceItem {
  type: 'challenge' | 'lab' | 'project' | 'assessment';
  label: string;
  count: number;
  score?: number;
}

export interface SkillPassportData {
  candidateId: string;
  candidateName: string;
  role: string;
  overallCompetency: number;
  issueDate: string;
  validUntil: string;
  skills: SkillScore[];
  categories: SkillCategory[];
  credentials: Credential[];
  isDemonstration?: boolean;
}

export interface SkillCategory {
  name: string;
  score: number;
  skills: SkillScore[];
}

export interface Credential {
  id: string;
  title: string;
  subtitle: string;
  type: 'course-completion' | 'assessment' | 'skill-passport';
  issuedDate: string;
  status: 'active' | 'pending';
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  education: string;
  state: string;
  district: string;
  currentCourse: string;
  progress: number;
  skills: SkillScore[];
  recentActivity: ActivityItem[];
  upcoming: UpcomingItem[];
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: 'lesson' | 'lab' | 'challenge' | 'project';
}

export interface UpcomingItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'assessment' | 'project' | 'lab';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  progress: number;
  sections: ProjectSection[];
  status: 'in-progress' | 'submitted' | 'reviewed';
}

export interface ProjectSection {
  name: string;
  score?: number;
  status: 'complete' | 'in-progress' | 'pending';
}

export interface Assessment {
  id: string;
  skill: string;
  score: number;
  attempts: number;
  status: 'passed' | 'in-progress' | 'not-started';
  evidenceGenerated: boolean;
  lastAttempt?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  education: string;
  state: string;
  district: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
