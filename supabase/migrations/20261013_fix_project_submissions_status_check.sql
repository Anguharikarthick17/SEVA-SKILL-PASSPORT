-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 5: PROJECT SUBMISSIONS STATUS CONSTRAINT FIX
-- Migration: 20261013_fix_project_submissions_status_check.sql
-- Transactional, safe to re-run, non-destructive.
-- ==============================================================================

begin;

-- 1. Drop the existing restrictive check constraint
alter table if exists public.project_submissions
  drop constraint if exists project_submissions_status_check;

-- 2. Add the normalized, case-insensitive check constraint
-- Accepts all active application writes, UI statuses, and legacy database rows.
alter table public.project_submissions
  add constraint project_submissions_status_check
  check (
    lower(trim(status)) in (
      -- Active Phase 5 application writes
      'in-progress',
      'in_progress',
      'draft',
      'submitted',
      'under_review',
      'changes_requested',
      'evaluated',
      -- Supported legacy database statuses
      'reviewed',
      'passed',
      'failed',
      'not_started'
    )
  );

commit;
