-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 13: ONBOARDING, COURSE ENROLLMENT & DEMO ACCESS
-- Safe, non-destructive migration supporting explicit course choice and Demo Mode.
-- ==============================================================================

-- 1. Safely add is_demo and access_type to public.enrollments if they do not exist
ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS access_type text NOT NULL DEFAULT 'paid';

-- Ensure constraint on access_type exists safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_enrollments_access_type' 
      AND conrelid = 'public.enrollments'::regclass
  ) THEN
    ALTER TABLE public.enrollments
      ADD CONSTRAINT chk_enrollments_access_type 
      CHECK (access_type IN ('paid', 'demo', 'scholarship', 'trial'));
  END IF;
END $$;

-- 2. Index for fast lookup of active user enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_active 
  ON public.enrollments(user_id, status);

-- 3. Ensure Row-Level Security allows users to read and manage their own enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'enrollments' 
      AND policyname = 'Users can view own enrollments'
  ) THEN
    CREATE POLICY "Users can view own enrollments" ON public.enrollments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'enrollments' 
      AND policyname = 'Users can insert own enrollments'
  ) THEN
    CREATE POLICY "Users can insert own enrollments" ON public.enrollments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'enrollments' 
      AND policyname = 'Users can update own enrollments'
  ) THEN
    CREATE POLICY "Users can update own enrollments" ON public.enrollments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================================================
-- REVERSIBLE ROLLBACK INSTRUCTIONS (NON-DESTRUCTIVE FORWARD-SAFE PLAN)
-- ==============================================================================
-- To reverse this migration safely without dropping tables or losing user data:
--
-- ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS chk_enrollments_access_type;
-- DROP INDEX IF EXISTS public.idx_enrollments_user_active;
-- ALTER TABLE public.enrollments DROP COLUMN IF EXISTS access_type;
-- ALTER TABLE public.enrollments DROP COLUMN IF EXISTS is_demo;
-- ==============================================================================
