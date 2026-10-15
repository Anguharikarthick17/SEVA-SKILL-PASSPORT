-- ==============================================================================
-- SEVA SKILL PASSPORT — VERIFICATION SCRIPT: REVIEWER SECURITY & PERSISTENCE
-- ==============================================================================
-- Run this in Supabase SQL Editor to verify the migration applied successfully.
-- ==============================================================================

-- 1. Check profiles role column
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'role';

-- 2. Check project_submissions columns
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
    'started_at',
    'evaluation_report',
    'reviewer_id',
    'reviewer_notes',
    'evidence_id',
    'verification_hash',
    'sync_status'
  )
order by column_name;

-- 3. Check trigger on project_submissions
select trigger_name, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'project_submissions'
  and trigger_name = 'trg_protect_project_submission_evaluation';

-- 4. Check RLS policies on project_submissions and evidence
select tablename, policyname, permissive, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('project_submissions', 'evidence')
order by tablename, policyname;
