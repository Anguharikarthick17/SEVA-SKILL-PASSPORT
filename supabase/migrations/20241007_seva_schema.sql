-- ==============================================================================
-- SEVA SKILL PASSPORT — Comprehensive Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Principle: PROOF OF COURSE → PROOF OF ABILITY
-- Note: Prototype / Demonstration implementation for SEVA Hackathon.
-- No government examination / certification is claimed.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES
-- References auth.users(id)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  mobile text,
  education text,
  state text,
  district text,
  target_role text default 'Full Stack Developer',
  github_handle text,
  avatar_url text,
  passport_visibility text default 'public' check (passport_visibility in ('public', 'private', 'unlisted')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ==============================================================================
-- 2. COURSES
-- ==============================================================================
create table if not exists public.courses (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text,
  category text default 'Full Stack',
  level text default 'Beginner → Advanced',
  price numeric default 100 not null,
  status text default 'active' check (status in ('active', 'coming-soon')),
  thumbnail_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ==============================================================================
-- 3. COURSE MODULES
-- ==============================================================================
create table if not exists public.course_modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  module_number text not null,
  title text not null,
  description text,
  sort_order int not null
);

-- ==============================================================================
-- 4. LESSONS
-- ==============================================================================
create table if not exists public.lessons (
  id text primary key,
  module_id text references public.course_modules(id) on delete cascade not null,
  title text not null,
  description text,
  content_type text not null check (content_type in ('video', 'reading', 'quiz', 'lab')),
  video_url text,
  duration_minutes int default 20 not null,
  sort_order int not null,
  is_published boolean default true not null
);

-- ==============================================================================
-- 5. ENROLLMENTS
-- Prevent duplicate active enrollments for same course
-- ==============================================================================
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  progress_percent numeric default 0 not null check (progress_percent >= 0 and progress_percent <= 100),
  enrolled_at timestamptz default now() not null,
  completed_at timestamptz,
  constraint uq_user_course_enrollment unique (user_id, course_id)
);

-- ==============================================================================
-- 6. LESSON PROGRESS
-- ==============================================================================
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text references public.lessons(id) on delete cascade not null,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent numeric default 0 not null check (progress_percent >= 0 and progress_percent <= 100),
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  constraint uq_user_lesson unique (user_id, lesson_id)
);

-- ==============================================================================
-- 7. SKILLS
-- ==============================================================================
create table if not exists public.skills (
  id text primary key,
  name text not null,
  category text not null check (category in ('Frontend', 'Backend', 'Database', 'Engineering', 'Security')),
  description text
);

-- ==============================================================================
-- 8. CHALLENGES (Coding Labs & Practice Arena)
-- ==============================================================================
create table if not exists public.challenges (
  id text primary key,
  title text not null,
  description text not null,
  skill_id text references public.skills(id) on delete cascade not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  language text default 'javascript' not null,
  starter_code text not null,
  test_definition jsonb not null default '[]'::jsonb,
  time_limit_minutes int default 30 not null,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 9. CHALLENGE SUBMISSIONS
-- ==============================================================================
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id text references public.challenges(id) on delete cascade not null,
  code text not null,
  language text default 'javascript' not null,
  status text default 'submitted' check (status in ('submitted', 'passed', 'failed', 'evaluated')),
  score numeric default 0 not null,
  tests_passed int default 0 not null,
  tests_total int default 0 not null,
  submitted_at timestamptz default now() not null
);

-- ==============================================================================
-- 10. PROJECTS (Capstone)
-- ==============================================================================
create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null,
  difficulty text default 'Medium',
  course_id text references public.courses(id) on delete set null,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 11. PROJECT SUBMISSIONS
-- ==============================================================================
create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id text references public.projects(id) on delete cascade not null,
  repository_url text not null,
  deployment_url text,
  status text default 'submitted' check (status in ('submitted', 'in-progress', 'reviewed', 'passed')),
  score numeric default 0 not null,
  submitted_at timestamptz default now() not null,
  evaluated_at timestamptz
);

-- ==============================================================================
-- 12. PROJECT EVIDENCE (Detailed Rubric Breakdown)
-- ==============================================================================
create table if not exists public.project_evidence (
  id uuid primary key default gen_random_uuid(),
  project_submission_id uuid references public.project_submissions(id) on delete cascade not null,
  requirements_score numeric default 0 not null,
  architecture_score numeric default 0 not null,
  testing_score numeric default 0 not null,
  code_quality_score numeric default 0 not null,
  security_score numeric default 0 not null,
  evidence_score numeric default 0 not null,
  overall_score numeric default 0 not null,
  evaluation_notes text,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 13. ASSESSMENTS
-- ==============================================================================
create table if not exists public.assessments (
  id text primary key,
  title text not null,
  description text,
  course_id text references public.courses(id) on delete set null,
  skill_id text references public.skills(id) on delete set null,
  assessment_type text check (assessment_type in ('practice', 'theory', 'coding')),
  duration_minutes int default 45 not null,
  status text default 'active' check (status in ('active', 'draft'))
);

-- ==============================================================================
-- 14. ASSESSMENT ATTEMPTS
-- ==============================================================================
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  assessment_id text references public.assessments(id) on delete cascade not null,
  score numeric not null,
  status text check (status in ('passed', 'in-progress', 'failed')),
  started_at timestamptz default now() not null,
  completed_at timestamptz
);

-- ==============================================================================
-- 15. EVIDENCE (CORE TELEMETRY TABLE)
-- Stores deterministic SHA-256 evidence integrity hash
-- ==============================================================================
create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id text references public.skills(id) on delete cascade not null,
  source_type text not null check (source_type in ('lesson', 'challenge', 'assessment', 'project', 'viva')),
  source_id text not null,
  score numeric not null,
  metadata jsonb default '{}'::jsonb not null,
  verification_hash text not null,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 16. SKILL SCORES (Current Calculated Competency)
-- ==============================================================================
create table if not exists public.skill_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id text references public.skills(id) on delete cascade not null,
  score numeric not null check (score >= 0 and score <= 100),
  confidence text default 'LOW' check (confidence in ('LOW', 'MEDIUM', 'HIGH')),
  evidence_count int default 0 not null,
  last_updated timestamptz default now() not null,
  constraint uq_user_skill_score unique (user_id, skill_id)
);

-- ==============================================================================
-- 17. SKILL PASSPORTS
-- Overall living competency passport with unique verification ID (e.g. GSP-XXXXXXXX)
-- ==============================================================================
create table if not exists public.skill_passports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  overall_score numeric default 0 not null check (overall_score >= 0 and overall_score <= 100),
  grade text default 'Building evidence' not null,
  passport_status text default 'active' check (passport_status in ('active', 'building', 'suspended')),
  verification_id text unique not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ==============================================================================
-- 18. CREDENTIALS
-- Platform / Demonstration credentials with verifiable integrity
-- ==============================================================================
create table if not exists public.credentials (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  credential_type text not null check (credential_type in ('course_completion', 'platform_assessment', 'skill_passport')),
  title text not null,
  status text default 'active' check (status in ('active', 'pending', 'expired')),
  issued_at timestamptz default now() not null,
  verification_id text not null,
  metadata jsonb default '{}'::jsonb not null
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id);
create index if not exists idx_evidence_user on public.evidence(user_id);
create index if not exists idx_evidence_skill on public.evidence(skill_id);
create index if not exists idx_skill_scores_user on public.skill_scores(user_id);
create index if not exists idx_skill_passports_vid on public.skill_passports(verification_id);
create index if not exists idx_credentials_vid on public.credentials(verification_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.skills enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.projects enable row level security;
alter table public.project_submissions enable row level security;
alter table public.project_evidence enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.evidence enable row level security;
alter table public.skill_scores enable row level security;
alter table public.skill_passports enable row level security;
alter table public.credentials enable row level security;

-- 1. PROFILES POLICIES
-- User can view own profile, or anyone can view public profile fields for verification if visibility is 'public'
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or passport_visibility = 'public');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. PUBLIC CATALOG POLICIES (Courses, Modules, Lessons, Skills, Challenges, Projects, Assessments)
create policy "Public catalog is viewable by anyone" on public.courses for select using (true);
create policy "Modules are viewable by anyone" on public.course_modules for select using (true);
create policy "Published lessons are viewable by anyone" on public.lessons for select using (is_published = true);
create policy "Skills are viewable by anyone" on public.skills for select using (true);
create policy "Active challenges are viewable by anyone" on public.challenges for select using (status = 'active');
create policy "Projects are viewable by anyone" on public.projects for select using (status = 'active');
create policy "Assessments are viewable by anyone" on public.assessments for select using (status = 'active');

-- 3. USER DATA POLICIES (Enrollments, Progress, Submissions, Attempts)
create policy "Users can view own enrollments" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "Users can insert own enrollments" on public.enrollments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own enrollments" on public.enrollments
  for update using (auth.uid() = user_id);

create policy "Users can view own lesson progress" on public.lesson_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert/update own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id);

create policy "Users can view own challenge submissions" on public.challenge_submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert own challenge submissions" on public.challenge_submissions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own project submissions" on public.project_submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert own project submissions" on public.project_submissions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own project evidence" on public.project_evidence
  for select using (
    exists (
      select 1 from public.project_submissions ps
      where ps.id = project_submission_id and ps.user_id = auth.uid()
    )
  );

create policy "Users can view own assessment attempts" on public.assessment_attempts
  for select using (auth.uid() = user_id);

create policy "Users can insert own assessment attempts" on public.assessment_attempts
  for insert with check (auth.uid() = user_id);

-- 4. CONTROLLED SERVER-ONLY / RESTRICTED POLICIES (Evidence, Skill Scores, Passports, Credentials)
-- Users can READ their own records, and public verification lookup by verification_id is permitted for passports & credentials.
-- Direct client UPDATE/DELETE on hashes, verification IDs, and scores is restricted.
create policy "Users can read own evidence" on public.evidence
  for select using (auth.uid() = user_id);

create policy "Users can read own skill scores" on public.skill_scores
  for select using (auth.uid() = user_id);

create policy "Users can read own passport or public verification lookup" on public.skill_passports
  for select using (auth.uid() = user_id or true);

create policy "Users can read own credentials or public verification lookup" on public.credentials
  for select using (auth.uid() = user_id or true);
