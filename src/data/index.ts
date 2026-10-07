import type { Course, SkillPassportData, StudentProfile, Project, Assessment, FAQItem } from '@/types';

export const COURSES: Course[] = [
  {
    id: 'full-stack-development',
    slug: 'full-stack-development',
    title: 'Full Stack Developer',
    subtitle: 'From web fundamentals to production-style full stack development.',
    level: 'Beginner → Advanced',
    format: ['Video', 'AI Tutor', 'Labs', 'Practice', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'active',
    duration: '6 months',
    enrolled: 1847,
    description:
      'A comprehensive programme that builds genuine full stack capability through structured learning, hands-on labs, real projects, and evidence-backed assessment.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL', 'Git', 'Testing', 'Deployment'],
    modules: [
      { id: 'm01', number: '01', title: 'Web Fundamentals', lessons: [], status: 'completed' },
      { id: 'm02', number: '02', title: 'HTML & CSS', lessons: [], status: 'completed' },
      { id: 'm03', number: '03', title: 'JavaScript', lessons: [], status: 'completed' },
      { id: 'm04', number: '04', title: 'Advanced JavaScript', lessons: [], status: 'current' },
      { id: 'm05', number: '05', title: 'React', lessons: [], status: 'locked' },
      { id: 'm06', number: '06', title: 'Node.js', lessons: [], status: 'locked' },
      { id: 'm07', number: '07', title: 'REST APIs', lessons: [], status: 'locked' },
      { id: 'm08', number: '08', title: 'Databases', lessons: [], status: 'locked' },
      { id: 'm09', number: '09', title: 'Authentication', lessons: [], status: 'locked' },
      { id: 'm10', number: '10', title: 'Git & GitHub', lessons: [], status: 'locked' },
      { id: 'm11', number: '11', title: 'Testing', lessons: [], status: 'locked' },
      { id: 'm12', number: '12', title: 'Deployment', lessons: [], status: 'locked' },
    ],
  },
  {
    id: 'ai-ml',
    slug: 'ai-ml',
    title: 'AI & Machine Learning',
    subtitle: 'Build intelligent applications with Python, ML algorithms, and modern AI frameworks.',
    level: 'Intermediate → Advanced',
    format: ['Video', 'Labs', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'coming-soon',
    duration: '5 months',
    enrolled: 0,
    description: 'Coming soon.',
    skills: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Deep Learning'],
    modules: [],
  },
  {
    id: 'data-analytics',
    slug: 'data-analytics',
    title: 'Data Analytics',
    subtitle: 'Turn raw data into insights with SQL, Python, and modern visualisation tools.',
    level: 'Beginner → Intermediate',
    format: ['Video', 'Labs', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'coming-soon',
    duration: '4 months',
    enrolled: 0,
    description: 'Coming soon.',
    skills: ['SQL', 'Python', 'Pandas', 'Power BI', 'Statistics'],
    modules: [],
  },
  {
    id: 'cybersecurity',
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Protect systems and networks with hands-on security skills.',
    level: 'Beginner → Advanced',
    format: ['Video', 'Labs', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'coming-soon',
    duration: '5 months',
    enrolled: 0,
    description: 'Coming soon.',
    skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Incident Response'],
    modules: [],
  },
  {
    id: 'cloud-computing',
    slug: 'cloud-computing',
    title: 'Cloud Computing',
    subtitle: 'Design, deploy and manage scalable cloud infrastructure.',
    level: 'Intermediate',
    format: ['Video', 'Labs', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'coming-soon',
    duration: '4 months',
    enrolled: 0,
    description: 'Coming soon.',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
    modules: [],
  },
  {
    id: 'devops',
    slug: 'devops',
    title: 'DevOps',
    subtitle: 'Bridge development and operations with modern DevOps practices.',
    level: 'Intermediate → Advanced',
    format: ['Video', 'Labs', 'Projects'],
    price: 100,
    currency: '₹',
    status: 'coming-soon',
    duration: '4 months',
    enrolled: 0,
    description: 'Coming soon.',
    skills: ['CI/CD', 'Docker', 'Kubernetes', 'Git', 'Linux', 'Monitoring'],
    modules: [],
  },
];

export const DEMO_PASSPORT: SkillPassportData = {
  candidateId: 'GSP-DEMO-001',
  candidateName: 'Sample Candidate',
  role: 'Full Stack Developer',
  overallCompetency: 87,
  issueDate: '2024-10-01',
  validUntil: '2026-10-01',
  isDemonstration: true,
  skills: [
    {
      name: 'JavaScript',
      score: 91,
      category: 'Frontend',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 15 },
        { type: 'lab', label: 'Labs Completed', count: 9 },
        { type: 'assessment', label: 'Assessments', count: 3 },
      ],
    },
    {
      name: 'React',
      score: 88,
      category: 'Frontend',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 12 },
        { type: 'lab', label: 'Labs Completed', count: 8 },
        { type: 'project', label: 'Projects', count: 2 },
        { type: 'assessment', label: 'Assessments', count: 3 },
      ],
    },
    {
      name: 'HTML/CSS',
      score: 94,
      category: 'Frontend',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 10 },
        { type: 'lab', label: 'Labs Completed', count: 7 },
      ],
    },
    {
      name: 'Node.js',
      score: 84,
      category: 'Backend',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 11 },
        { type: 'lab', label: 'Labs Completed', count: 6 },
        { type: 'project', label: 'Projects', count: 2 },
        { type: 'assessment', label: 'Assessments', count: 2 },
      ],
    },
    {
      name: 'REST APIs',
      score: 89,
      category: 'Backend',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 9 },
        { type: 'lab', label: 'Labs Completed', count: 7 },
        { type: 'project', label: 'Projects', count: 1 },
      ],
    },
    {
      name: 'SQL',
      score: 82,
      category: 'Database',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 8 },
        { type: 'lab', label: 'Labs Completed', count: 5 },
        { type: 'assessment', label: 'Assessments', count: 2 },
      ],
    },
    {
      name: 'PostgreSQL',
      score: 86,
      category: 'Database',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 6 },
        { type: 'lab', label: 'Labs Completed', count: 5 },
        { type: 'project', label: 'Projects', count: 1 },
      ],
    },
    {
      name: 'Git',
      score: 90,
      category: 'Engineering',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 5 },
        { type: 'lab', label: 'Labs Completed', count: 8 },
        { type: 'project', label: 'Projects', count: 3 },
      ],
    },
    {
      name: 'Testing',
      score: 76,
      category: 'Engineering',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 7 },
        { type: 'lab', label: 'Labs Completed', count: 4 },
        { type: 'assessment', label: 'Assessments', count: 2 },
      ],
    },
    {
      name: 'Debugging',
      score: 87,
      category: 'Engineering',
      evidence: [
        { type: 'challenge', label: 'Coding Challenges', count: 10 },
        { type: 'lab', label: 'Labs Completed', count: 6 },
      ],
    },
  ],
  categories: [
    {
      name: 'Frontend',
      score: 91,
      skills: [],
    },
    {
      name: 'Backend',
      score: 87,
      skills: [],
    },
    {
      name: 'Database',
      score: 84,
      skills: [],
    },
    {
      name: 'Engineering',
      score: 84,
      skills: [],
    },
  ],
  credentials: [
    {
      id: 'cred-001',
      title: 'Full Stack Development',
      subtitle: 'Course Completion',
      type: 'course-completion',
      issuedDate: '2024-10-01',
      status: 'active',
    },
    {
      id: 'cred-002',
      title: 'Online Assessment',
      subtitle: 'Passed',
      type: 'assessment',
      issuedDate: '2024-10-01',
      status: 'active',
    },
    {
      id: 'cred-003',
      title: 'Skill Passport',
      subtitle: 'Active',
      type: 'skill-passport',
      issuedDate: '2024-10-01',
      status: 'active',
    },
  ],
};

export const DEMO_STUDENT: StudentProfile = {
  id: 'std-001',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  mobile: '9876543210',
  education: "Bachelor's in Computer Science",
  state: 'Maharashtra',
  district: 'Pune',
  currentCourse: 'Full Stack Developer',
  progress: 68,
  skills: [
    { name: 'JavaScript', score: 84, category: 'Frontend' },
    { name: 'React', score: 76, category: 'Frontend' },
    { name: 'Node.js', score: 71, category: 'Backend' },
    { name: 'SQL', score: 79, category: 'Database' },
    { name: 'Git', score: 88, category: 'Engineering' },
  ],
  recentActivity: [
    { id: 'a1', description: 'Completed JavaScript lesson', timestamp: '2024-10-06T14:30:00Z', type: 'lesson' },
    { id: 'a2', description: 'Completed React lab', timestamp: '2024-10-06T11:00:00Z', type: 'lab' },
    { id: 'a3', description: 'Submitted API challenge', timestamp: '2024-10-05T16:45:00Z', type: 'challenge' },
    { id: 'a4', description: 'Started Node.js project', timestamp: '2024-10-05T10:15:00Z', type: 'project' },
  ],
  upcoming: [
    { id: 'u1', title: 'React Practice Assessment', dueDate: '2024-10-10', type: 'assessment' },
    { id: 'u2', title: 'Node.js API Lab', dueDate: '2024-10-12', type: 'lab' },
  ],
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: 'Task Management System',
    description:
      'A full stack task management application with user authentication, real-time updates, and role-based access control.',
    tech: ['React', 'Node.js', 'PostgreSQL'],
    progress: 72,
    status: 'in-progress',
    sections: [
      { name: 'Requirements', status: 'complete', score: 95 },
      { name: 'Implementation', status: 'in-progress', score: 70 },
      { name: 'Tests', status: 'in-progress', score: 60 },
      { name: 'Code Quality', status: 'pending' },
      { name: 'Security', status: 'pending' },
      { name: 'Evidence', status: 'pending' },
    ],
  },
  {
    id: 'proj-002',
    title: 'E-Commerce REST API',
    description:
      'A production-ready REST API for an e-commerce platform with product management, orders, and payment integration.',
    tech: ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
    progress: 45,
    status: 'in-progress',
    sections: [
      { name: 'Requirements', status: 'complete', score: 88 },
      { name: 'Implementation', status: 'in-progress', score: 45 },
      { name: 'Tests', status: 'pending' },
      { name: 'Code Quality', status: 'pending' },
      { name: 'Security', status: 'pending' },
      { name: 'Evidence', status: 'pending' },
    ],
  },
];

export const DEMO_ASSESSMENTS: Assessment[] = [
  { id: 'ass-001', skill: 'JavaScript', score: 82, attempts: 2, status: 'passed', evidenceGenerated: true, lastAttempt: '2024-10-04' },
  { id: 'ass-002', skill: 'React', score: 76, attempts: 1, status: 'passed', evidenceGenerated: true, lastAttempt: '2024-10-03' },
  { id: 'ass-003', skill: 'Node.js', score: 68, attempts: 2, status: 'in-progress', evidenceGenerated: false, lastAttempt: '2024-10-02' },
  { id: 'ass-004', skill: 'SQL', score: 81, attempts: 1, status: 'passed', evidenceGenerated: true, lastAttempt: '2024-10-01' },
  { id: 'ass-005', skill: 'Git', score: 91, attempts: 1, status: 'passed', evidenceGenerated: true, lastAttempt: '2024-09-28' },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is SEVA Skill Passport?',
    answer:
      'SEVA Skill Passport is a proposed skill-development platform that goes beyond course certificates. It continuously builds evidence of what you can actually do, creating a competency-based Skill Passport backed by real assessments, projects, and labs.',
    category: 'General',
  },
  {
    question: 'How is SEVA different from other online learning platforms?',
    answer:
      "Unlike platforms that issue certificates upon course completion, SEVA builds a Skill Passport based on evidence — your performance in coding challenges, labs, projects, and assessments. Employers see what you can do, not just what you've studied.",
    category: 'General',
  },
  {
    question: 'Is the ₹100 fee an official government fee?',
    answer:
      'No. The ₹100 is a proposed learning access fee for the platform itself. SEVA Skill Passport is not a government scheme. The fee is not mandated or collected by any government body.',
    category: 'Fees & Access',
  },
  {
    question: 'What is included in the Full Stack Developer course?',
    answer:
      'The course covers 12 modules: Web Fundamentals, HTML & CSS, JavaScript, Advanced JavaScript, React, Node.js, REST APIs, Databases, Authentication, Git & GitHub, Testing, and Deployment. Learning includes videos, AI assistance, hands-on labs, practice challenges, and capstone projects.',
    category: 'Courses',
  },
  {
    question: 'How is the competency score calculated?',
    answer:
      'Your competency score is derived from evidence — coding challenge performance, lab completion and quality, project implementation, and assessment results. It is not based on self-reporting or simple quiz completion.',
    category: 'Skill Passport',
  },
  {
    question: 'Can employers verify my Skill Passport?',
    answer:
      'In the proposed platform, employers would be able to use a verification ID to confirm the authenticity of a Skill Passport. The current prototype demonstrates this capability. Real-world integration will be built in subsequent phases.',
    category: 'Employers',
  },
  {
    question: 'Is SEVA Skill Passport an official Government of India platform?',
    answer:
      'No. SEVA Skill Passport is a proposed platform and is not currently an official Government of India scheme or platform. The long-term vision includes government integration, but this prototype is an independent proposal.',
    category: 'General',
  },
  {
    question: 'When will other courses beyond Full Stack Development be available?',
    answer:
      'Courses in AI & Machine Learning, Data Analytics, Cybersecurity, Cloud Computing, and DevOps are planned for future phases. Their availability depends on platform development progress.',
    category: 'Courses',
  },
];

export const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const EDUCATION_OPTIONS = [
  '10th Standard',
  '12th Standard',
  'ITI / Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Other',
];

export const GROWTH_CATEGORIES = [
  { name: 'Frontend', score: 86, color: '#1e40af' },
  { name: 'Backend', score: 78, color: '#2563eb' },
  { name: 'Database', score: 81, color: '#3b82f6' },
  { name: 'Security', score: 71, color: '#60a5fa' },
  { name: 'Testing', score: 74, color: '#93c5fd' },
  { name: 'Debugging', score: 89, color: '#1d4ed8' },
  { name: 'Git', score: 92, color: '#1e3a8a' },
];
