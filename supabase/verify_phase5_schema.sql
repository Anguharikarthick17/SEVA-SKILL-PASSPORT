-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 5 VERIFICATION SCRIPT
-- Verification script to check Phase 5 tables, columns, RLS policies, and seed data.
-- ==============================================================================

-- 1. Check projects and project_submissions tables exist
select 
  table_name,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = t.table_name) as column_count
from information_schema.tables t
where table_schema = 'public'
  and table_name in ('projects', 'project_submissions', 'project_evidence', 'evidence')
order by table_name;

-- 2. Verify Phase 5 columns in project_submissions
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'project_submissions'
  and column_name in (
    'attempt_number',
    'summary',
    'implementation_notes',
    'screenshots',
    'completed_requirement_ids',
    'is_draft',
    'evaluation_report',
    'evidence_id',
    'verification_hash'
  )
order by column_name;

-- 3. Verify RLS policies on projects and project_submissions
select tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('projects', 'project_submissions');

-- 4. Check seeded projects
select id, title, difficulty, primary_skill, passing_score, status
from public.projects
order by id;
