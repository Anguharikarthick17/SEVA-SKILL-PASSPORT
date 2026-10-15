-- ==============================================================================
-- SEVA SKILL PASSPORT — VERIFICATION SCRIPT: STATUS CONSTRAINT FIX
-- File: supabase/verify_status_constraint.sql
-- ==============================================================================

-- 1. Verify constraint definition on public.project_submissions
select 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid = 'public.project_submissions'::regclass
  and conname = 'project_submissions_status_check';

-- 2. Verify all existing rows conform to the new constraint (should return 0 rows)
select id, user_id, project_id, status
from public.project_submissions
where lower(trim(status)) not in (
  'in-progress',
  'in_progress',
  'draft',
  'submitted',
  'under_review',
  'changes_requested',
  'evaluated',
  'reviewed',
  'passed',
  'failed',
  'not_started'
);

-- 3. Verify security trigger remains active
select trigger_name, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'project_submissions'
  and trigger_name = 'trg_protect_project_submission_evaluation';
