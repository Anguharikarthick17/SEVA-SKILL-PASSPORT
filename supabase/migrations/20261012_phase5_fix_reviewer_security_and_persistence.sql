-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 5: PERSISTENT PROJECT EVALUATION & REVIEWER SECURITY
-- Migration: 20261012_phase5_fix_reviewer_security_and_persistence.sql
-- ==============================================================================
-- Principle: PROOF OF COURSE → PROOF OF ABILITY
-- Protects evaluation decisions, enforces reviewer authorization, and enables
-- durable cloud persistence for drafts, submissions, evaluations, and evidence.
-- ==============================================================================

-- 1. PROFILES: Add role column for trusted authorization if not already present
alter table if exists public.profiles
  add column if not exists role text default 'student' check (role in ('student', 'reviewer', 'instructor', 'admin'));

-- 2. PROJECT SUBMISSIONS: Ensure relaxed constraints for draft & Phase 5 states
alter table if exists public.project_submissions drop constraint if exists project_submissions_status_check;

-- Ensure repository_url can be blank during initial workspace drafting
alter table if exists public.project_submissions alter column repository_url set default '';
alter table if exists public.project_submissions alter column repository_url drop not null;
alter table if exists public.project_submissions alter column submitted_at drop not null;

-- Ensure all Phase 5 columns exist
alter table if exists public.project_submissions add column if not exists attempt_number integer default 1;
alter table if exists public.project_submissions add column if not exists summary text;
alter table if exists public.project_submissions add column if not exists implementation_notes text;
alter table if exists public.project_submissions add column if not exists screenshots text[] default array[]::text[];
alter table if exists public.project_submissions add column if not exists completed_requirement_ids text[] default array[]::text[];
alter table if exists public.project_submissions add column if not exists is_draft boolean default false;
alter table if exists public.project_submissions add column if not exists started_at timestamptz default now();
alter table if exists public.project_submissions add column if not exists evaluation_report jsonb;
alter table if exists public.project_submissions add column if not exists reviewer_id text;
alter table if exists public.project_submissions add column if not exists reviewer_notes text;
alter table if exists public.project_submissions add column if not exists evidence_id text;
alter table if exists public.project_submissions add column if not exists verification_hash text;
alter table if exists public.project_submissions add column if not exists sync_status text default 'synced';
alter table if exists public.project_submissions add column if not exists updated_at timestamptz default now();

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
alter table if exists public.project_submissions enable row level security;

-- Policy 1: SELECT
-- Students view their own submissions; authorized reviewers/instructors/admins view all submissions
drop policy if exists "Users can view own project submissions" on public.project_submissions;
create policy "Users can view own project submissions" on public.project_submissions
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'instructor', 'admin')
    )
  );

-- Policy 2: INSERT
-- Students can insert their own draft/submission, but cannot inject scores, reviewer ID, or evidence
drop policy if exists "Users can insert own project submissions" on public.project_submissions;
create policy "Users can insert own project submissions" on public.project_submissions
  for insert
  with check (
    user_id = auth.uid()
    and reviewer_id is null
    and evidence_id is null
    and verification_hash is null
    and (score is null or score = 0)
  );

-- Policy 3: UPDATE
-- Students can update their own drafts/submissions, and reviewers can update evaluations
drop policy if exists "Users can update own project submissions" on public.project_submissions;
create policy "Users can update own project submissions" on public.project_submissions
  for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'instructor', 'admin')
    )
  );

-- 4. SERVER-SIDE DATABASE TRIGGER: PREVENT STUDENT TAMPERING OF EVALUATIONS
-- Protects scores, reviewer notes, evaluation decisions, evidence ID, and verification hashes
create or replace function public.protect_project_submission_evaluation()
returns trigger
language plpgsql
security definer
as $$
declare
  caller_role text;
begin
  -- Lookup caller's role from profiles
  select role into caller_role from public.profiles where id = auth.uid();
  
  -- If caller is authenticated student (not reviewer/instructor/admin, and not database service-role)
  if auth.role() = 'authenticated' and coalesce(caller_role, 'student') = 'student' then
    -- Verify no protected evaluation fields are modified by the student
    if (new.score is distinct from old.score) or
       (new.evaluation_report is distinct from old.evaluation_report) or
       (new.reviewer_id is distinct from old.reviewer_id) or
       (new.reviewer_notes is distinct from old.reviewer_notes) or
       (new.evidence_id is distinct from old.evidence_id) or
       (new.verification_hash is distinct from old.verification_hash) or
       (lower(coalesce(new.status, '')) in ('evaluated', 'passed') and lower(coalesce(old.status, '')) not in ('evaluated', 'passed')) then
      raise exception 'Security violation: Students cannot set evaluation scores, reviewer decisions, or evidence hashes.';
    end if;
  end if;
  
  -- Always update timestamp
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_protect_project_submission_evaluation on public.project_submissions;
create trigger trg_protect_project_submission_evaluation
  before update on public.project_submissions
  for each row execute function public.protect_project_submission_evaluation();

-- 5. EVIDENCE TABLE SECURITY
-- Allow reviewers and service role to issue evidence for qualifying evaluations
drop policy if exists "Authorized reviewers can insert evidence" on public.evidence;
create policy "Authorized reviewers can insert evidence" on public.evidence
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'instructor', 'admin')
    )
  );

drop policy if exists "Authorized reviewers can update evidence" on public.evidence;
create policy "Authorized reviewers can update evidence" on public.evidence
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('reviewer', 'instructor', 'admin')
    )
  );

-- 6. INDEXES for fast retrieval
create index if not exists idx_project_submissions_user_project on public.project_submissions(user_id, project_id);
create index if not exists idx_project_submissions_status on public.project_submissions(status);
