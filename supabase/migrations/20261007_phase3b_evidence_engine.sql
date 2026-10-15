-- ==============================================================================
-- PHASE 3B MIGRATION: EVIDENCE & COMPETENCY ENGINE
-- Enhanced evidence telemetry, dimensions, quality, difficulty, freshness, and anti-spam
-- ==============================================================================

-- 1. Enhance evidence table with quality, difficulty, dimension, freshness, and attempt tracking
alter table if exists public.evidence
  add column if not exists difficulty text check (difficulty in ('EASY', 'MEDIUM', 'HARD')) default 'MEDIUM',
  add column if not exists quality_level text check (quality_level in ('BASIC', 'INTERMEDIATE', 'ADVANCED')) default 'INTERMEDIATE',
  add column if not exists dimension text,
  add column if not exists last_demonstrated_at timestamptz default now(),
  add column if not exists attempt_number int default 1;

-- Expand source_type check constraint to include 'lab' and 'practice'
alter table if exists public.evidence drop constraint if exists evidence_source_type_check;
alter table if exists public.evidence 
  add constraint evidence_source_type_check 
  check (source_type in ('lesson', 'practice', 'lab', 'challenge', 'assessment', 'project', 'viva'));

-- 2. Enhance skill_scores table with dimension scores, evidence types, freshness, and evidence sufficiency
alter table if exists public.skill_scores
  add column if not exists evidence_types jsonb default '[]'::jsonb,
  add column if not exists dimension_scores jsonb default '{}'::jsonb,
  add column if not exists freshness_status text check (freshness_status in ('Fresh', 'Aging', 'Old')) default 'Fresh',
  add column if not exists is_sufficiently_evidenced boolean default false;

-- 3. Enhance challenge_submissions with attempt tracking
alter table if exists public.challenge_submissions
  add column if not exists attempt_number int default 1;

-- 4. Create index on evidence for fast skill and user querying
create index if not exists idx_evidence_user_skill on public.evidence(user_id, skill_id);
create index if not exists idx_evidence_source on public.evidence(source_type, source_id);
