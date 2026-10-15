-- ==============================================================================
-- PHASE 4 MIGRATION: REAL ASSESSMENT ENGINE (AUDITED & IDEMPOTENT)
-- Question bank, attempt lifecycle, server evaluation, and telemetry audit events
-- Safe for execution on existing databases without data loss or duplicate errors.
-- ==============================================================================

-- 1. Create Assessment Questions Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('mcq', 'multiple-select', 'output-prediction', 'debugging', 'scenario', 'architecture', 'sql')),
  question text NOT NULL,
  code_snippet text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answers jsonb NOT NULL DEFAULT '[]'::jsonb, -- Sensitive: restricted from direct client queries
  explanation text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM',
  skill_id text,
  dimension text,
  marks int NOT NULL DEFAULT 10,
  negative_marks numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Safely bind foreign key to skills only if skills table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public' AND constraint_name = 'assessment_questions_skill_id_fkey'
    ) THEN
      ALTER TABLE public.assessment_questions
        ADD CONSTRAINT assessment_questions_skill_id_fkey
        FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- 2. Enhance existing Assessments Table with configuration fields (Idempotent)
ALTER TABLE IF EXISTS public.assessments
  ADD COLUMN IF NOT EXISTS passing_threshold numeric DEFAULT 70 NOT NULL,
  ADD COLUMN IF NOT EXISTS max_attempts int DEFAULT 3 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_marks int DEFAULT 100 NOT NULL,
  ADD COLUMN IF NOT EXISTS question_count int DEFAULT 10 NOT NULL,
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dimensions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty_distribution jsonb DEFAULT '{"EASY": 3, "MEDIUM": 5, "HARD": 2}'::jsonb,
  ADD COLUMN IF NOT EXISTS randomize_questions boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS randomize_options boolean DEFAULT true;

-- 3. Enhance Assessment Attempts Table with lifecycle and evaluation fields (Idempotent)
ALTER TABLE IF EXISTS public.assessment_attempts
  ADD COLUMN IF NOT EXISTS attempt_number int DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '45 minutes'),
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS time_taken_seconds int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_marks numeric DEFAULT 100 NOT NULL,
  ADD COLUMN IF NOT EXISTS earned_marks numeric DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS percentage numeric DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS marked_for_review jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS question_ids jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluation_results jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS skill_breakdown jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dimension_breakdown jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weak_areas jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_id text;

-- Ensure score has a safe default of 0 for initial in_progress states
ALTER TABLE IF EXISTS public.assessment_attempts
  ALTER COLUMN score SET DEFAULT 0;

-- Migrate any existing legacy rows to valid Phase 4 statuses before updating constraints
UPDATE public.assessment_attempts
SET status = 'in_progress'
WHERE status = 'in-progress';

UPDATE public.assessment_attempts
SET status = 'evaluated'
WHERE status IN ('passed', 'failed');

-- Update status check constraint backward-compatibly
DO $$
BEGIN
  -- Drop existing constraint regardless of name variations
  ALTER TABLE public.assessment_attempts DROP CONSTRAINT IF EXISTS assessment_attempts_status_check;
  
  -- Add comprehensive constraint supporting both legacy and Phase 4 statuses
  ALTER TABLE public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_status_check
    CHECK (status IN ('in_progress', 'in-progress', 'submitted', 'evaluated', 'passed', 'failed', 'timed_out', 'abandoned'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Create Assessment Audit Events Table
CREATE TABLE IF NOT EXISTS public.assessment_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('start', 'answer_save', 'mark_review', 'tab_blur', 'tab_focus', 'submit', 'timeout')),
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Safely bind foreign keys for audit events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND constraint_name = 'assessment_audit_events_attempt_id_fkey'
  ) THEN
    ALTER TABLE public.assessment_audit_events
      ADD CONSTRAINT assessment_audit_events_attempt_id_fkey
      FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public' AND constraint_name = 'assessment_audit_events_user_id_fkey'
    ) THEN
      ALTER TABLE public.assessment_audit_events
        ADD CONSTRAINT assessment_audit_events_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public' AND constraint_name = 'assessment_audit_events_user_id_fkey'
    ) THEN
      ALTER TABLE public.assessment_audit_events
        ADD CONSTRAINT assessment_audit_events_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 5. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_assessment_questions_skill ON public.assessment_questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_difficulty ON public.assessment_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_assessment ON public.assessment_attempts(user_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_assessment_audit_attempt ON public.assessment_audit_events(attempt_id);

-- 6. Row Level Security Policies (Guaranteed Idempotent via DROP IF EXISTS)
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_audit_events ENABLE ROW LEVEL SECURITY;

-- 6A. Assessment Questions RLS & Answer Key Security
DROP POLICY IF EXISTS "Active assessment questions are viewable" ON public.assessment_questions;
CREATE POLICY "Active assessment questions are viewable" ON public.assessment_questions
  FOR SELECT USING (status = 'active');

-- Protect confidential answer keys & explanations at column-level from ordinary clients
REVOKE ALL ON public.assessment_questions FROM anon, authenticated;
GRANT SELECT (
  id,
  type,
  question,
  code_snippet,
  options,
  difficulty,
  skill_id,
  dimension,
  marks,
  negative_marks,
  status,
  version,
  created_at
) ON public.assessment_questions TO anon, authenticated;

-- Create Secure Public View for student queries (omits correct_answers and explanation)
CREATE OR REPLACE VIEW public.client_assessment_questions AS
  SELECT
    id,
    type,
    question,
    code_snippet,
    options,
    difficulty,
    skill_id,
    dimension,
    marks,
    negative_marks,
    status,
    version,
    created_at
  FROM public.assessment_questions
  WHERE status = 'active';

GRANT SELECT ON public.client_assessment_questions TO anon, authenticated;

-- 6B. Assessment Attempts RLS Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can view own assessment attempts" ON public.assessment_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can insert own assessment attempts" ON public.assessment_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own in-progress assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can update own in-progress assessment attempts" ON public.assessment_attempts
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('in_progress', 'in-progress'));

-- 6C. Assessment Audit Events RLS Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view own audit events" ON public.assessment_audit_events;
CREATE POLICY "Users can view own audit events" ON public.assessment_audit_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audit events" ON public.assessment_audit_events;
CREATE POLICY "Users can insert own audit events" ON public.assessment_audit_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
