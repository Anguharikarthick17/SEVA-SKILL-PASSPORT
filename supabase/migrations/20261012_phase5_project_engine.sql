-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 5: PROJECT-BASED SKILL VERIFICATION ENGINE
-- Migration: 20261012_phase5_project_engine.sql
-- ==============================================================================

-- 1. Ensure projects table exists and add Phase 5 project fields idempotently
create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null,
  difficulty text default 'MEDIUM',
  course_id text references public.courses(id) on delete set null,
  status text default 'active',
  created_at timestamptz default now() not null
);

alter table public.projects add column if not exists primary_skill text default 'react';
alter table public.projects add column if not exists skills text[] default array[]::text[];
alter table public.projects add column if not exists dimensions text[] default array[]::text[];
alter table public.projects add column if not exists tech_stack text[] default array[]::text[];
alter table public.projects add column if not exists estimated_effort_hours integer default 20;
alter table public.projects add column if not exists passing_score numeric default 70;
alter table public.projects add column if not exists learning_objectives text[] default array[]::text[];
alter table public.projects add column if not exists functional_requirements jsonb default '[]'::jsonb;
alter table public.projects add column if not exists acceptance_criteria jsonb default '[]'::jsonb;
alter table public.projects add column if not exists deliverables jsonb default '[]'::jsonb;
alter table public.projects add column if not exists submission_instructions text;
alter table public.projects add column if not exists rubric jsonb default '[]'::jsonb;

-- 2. Ensure project_submissions table exists and add Phase 5 submission fields
create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id text references public.projects(id) on delete cascade not null,
  repository_url text not null,
  deployment_url text,
  status text default 'in-progress',
  score numeric default 0 not null,
  submitted_at timestamptz default now() not null,
  evaluated_at timestamptz
);

alter table public.project_submissions add column if not exists attempt_number integer default 1;
alter table public.project_submissions add column if not exists summary text;
alter table public.project_submissions add column if not exists implementation_notes text;
alter table public.project_submissions add column if not exists screenshots text[] default array[]::text[];
alter table public.project_submissions add column if not exists completed_requirement_ids text[] default array[]::text[];
alter table public.project_submissions add column if not exists is_draft boolean default false;
alter table public.project_submissions add column if not exists started_at timestamptz default now();
alter table public.project_submissions add column if not exists evaluation_report jsonb;
alter table public.project_submissions add column if not exists reviewer_id text;
alter table public.project_submissions add column if not exists reviewer_notes text;
alter table public.project_submissions add column if not exists evidence_id text;
alter table public.project_submissions add column if not exists verification_hash text;
alter table public.project_submissions add column if not exists updated_at timestamptz default now();

-- 3. Enable RLS
alter table public.projects enable row level security;
alter table public.project_submissions enable row level security;

-- 4. Idempotent RLS Policies
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Projects are viewable by anyone') then
    create policy "Projects are viewable by anyone" on public.projects for select using (status = 'active');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'project_submissions' and policyname = 'Users can view own project submissions') then
    create policy "Users can view own project submissions" on public.project_submissions for select using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'project_submissions' and policyname = 'Users can insert own project submissions') then
    create policy "Users can insert own project submissions" on public.project_submissions for insert with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'project_submissions' and policyname = 'Users can update own project submissions') then
    create policy "Users can update own project submissions" on public.project_submissions for update using (user_id = auth.uid());
  end if;
end $$;

-- 5. Seed the 5 Capstone Projects into public.projects
insert into public.projects (
  id, title, description, difficulty, primary_skill, skills, dimensions, tech_stack, estimated_effort_hours, passing_score, status
) values
  ('proj-frontend-responsive', 'Accessible & Responsive Civic Services Dashboard', 'Production-grade responsive frontend web application providing public service metrics with WCAG 2.1 AA accessibility standards.', 'MEDIUM', 'react', array['react', 'html-css', 'javascript'], array['Component Design', 'State Management', 'Forms'], array['React', 'Next.js / Vite', 'Tailwind CSS'], 24, 70, 'active'),
  ('proj-rest-api', 'Enterprise RESTful Microservice with Schema Validation', 'Scalable REST API in Node.js/Express featuring strict JSON schema validation, error handling middleware, and rate limiting.', 'MEDIUM', 'nodejs', array['nodejs', 'rest-api', 'security'], array['Server Fundamentals', 'Routing', 'Middleware', 'API Design'], array['Node.js', 'Express', 'Zod', 'Supertest'], 28, 70, 'active'),
  ('proj-db-auth', 'Secure Identity & RBAC Portal with Relational Database', 'Data-intensive web application featuring normalized PostgreSQL schema design, ACID transactions, bcrypt password hashing, and RBAC.', 'HARD', 'sql', array['sql', 'security', 'nodejs'], array['Querying', 'Data Modeling', 'Indexes', 'Authentication'], array['PostgreSQL', 'Node.js', 'Prisma', 'JWT'], 36, 70, 'active'),
  ('proj-fullstack-tasks', 'Collaborative Full Stack Project & Task Hub', 'Flagship full-stack capstone: end-to-end task workflow featuring interactive React components, Node.js REST API, and PostgreSQL persistence.', 'HARD', 'react', array['react', 'nodejs', 'sql', 'security'], array['Component Design', 'State Management', 'API Design', 'Data Modeling'], array['React', 'Node.js', 'Express', 'PostgreSQL'], 40, 70, 'active'),
  ('proj-prod-devops', 'Production-Ready Service with Automated Tests & CI/CD', 'Production-grade hardened service featuring automated unit/integration tests with Jest, Docker multi-stage containerization, and GitHub Actions CI.', 'HARD', 'testing', array['testing', 'deployment', 'git'], array['Unit Testing', 'Integration Testing', 'Builds', 'Production Readiness'], array['Node.js', 'Jest', 'Docker', 'GitHub Actions'], 32, 70, 'active')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  difficulty = excluded.difficulty,
  primary_skill = excluded.primary_skill,
  skills = excluded.skills,
  dimensions = excluded.dimensions,
  tech_stack = excluded.tech_stack,
  estimated_effort_hours = excluded.estimated_effort_hours,
  passing_score = excluded.passing_score,
  status = excluded.status;
