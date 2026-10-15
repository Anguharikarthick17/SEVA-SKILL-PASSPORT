-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 6: AUTHORIZATION HARDENING & DATABASE GUARDS
-- Migration: 20261013_phase6_harden_authorization_and_guards.sql
-- ==============================================================================
-- Principle: PROOF OF COURSE → PROOF OF ABILITY
-- Hardens role mutation, prevents student self-promotion, enforces database-level
-- anti-self-review protection, and ensures strict fail-closed authorization.
-- ==============================================================================

BEGIN;

-- 1. PROFILES: Prevent unauthorized role elevation
-- Only service_role or users who already possess the 'admin' role may modify the 'role' column.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role column is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow internal database service_role operations
    IF auth.role() = 'service_role' THEN
      RETURN NEW;
    END IF;

    -- Lookup caller's authoritative role
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

    -- Reject if caller is not an admin
    IF COALESCE(caller_role, '') <> 'admin' THEN
      RAISE EXCEPTION 'Security violation: Users cannot modify or escalate their own role.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();


-- 2. PROJECT SUBMISSIONS: Harden evaluation protection & enforce Anti-Self-Review
CREATE OR REPLACE FUNCTION public.protect_project_submission_evaluation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Lookup caller's authoritative role from profiles
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  -- Guard 1: Non-reviewers (students, unassigned, or unknown roles) cannot modify evaluation fields
  IF auth.role() = 'authenticated' AND COALESCE(caller_role, 'student') NOT IN ('reviewer', 'instructor', 'admin') THEN
    IF (NEW.score IS DISTINCT FROM OLD.score) OR
       (NEW.evaluation_report IS DISTINCT FROM OLD.evaluation_report) OR
       (NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id) OR
       (NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes) OR
       (NEW.evidence_id IS DISTINCT FROM OLD.evidence_id) OR
       (NEW.verification_hash IS DISTINCT FROM OLD.verification_hash) OR
       (LOWER(COALESCE(NEW.status, '')) IN ('evaluated', 'passed') AND LOWER(COALESCE(OLD.status, '')) NOT IN ('evaluated', 'passed')) THEN
      RAISE EXCEPTION 'Security violation: Students cannot set evaluation scores, reviewer decisions, or evidence hashes.';
    END IF;
  END IF;

  -- Guard 2: Anti-Self-Review — Submitters can NEVER evaluate, score, or approve their own project
  IF auth.role() = 'authenticated' AND OLD.user_id = auth.uid() THEN
    IF (NEW.score IS DISTINCT FROM OLD.score) OR
       (NEW.evaluation_report IS DISTINCT FROM OLD.evaluation_report) OR
       (NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id) OR
       (NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes) OR
       (NEW.evidence_id IS DISTINCT FROM OLD.evidence_id) OR
       (NEW.verification_hash IS DISTINCT FROM OLD.verification_hash) OR
       (LOWER(COALESCE(NEW.status, '')) IN ('evaluated', 'passed') AND LOWER(COALESCE(OLD.status, '')) NOT IN ('evaluated', 'passed')) THEN
      RAISE EXCEPTION 'Security violation: Submitters cannot evaluate or approve their own capstone projects.';
    END IF;
  END IF;

  -- Always update timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_project_submission_evaluation ON public.project_submissions;
CREATE TRIGGER trg_protect_project_submission_evaluation
  BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.protect_project_submission_evaluation();

COMMIT;

-- ==============================================================================
-- ROLLBACK INSTRUCTIONS
-- ==============================================================================
-- To revert this migration in PostgreSQL:
-- DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
-- DROP FUNCTION IF EXISTS public.protect_profile_role();
-- (Revert protect_project_submission_evaluation to migration 20261012 version)
-- ==============================================================================
