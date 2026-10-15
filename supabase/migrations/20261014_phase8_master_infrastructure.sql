-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 8 MASTER INFRASTRUCTURE MIGRATION
-- Migration: 20261014_phase8_master_infrastructure.sql
-- ==============================================================================
-- Features:
-- 1. Video Lesson metadata and publication tracking
-- 2. Authenticated Lesson Progress and playback state persistence
-- 3. Assessment Attempt Security & Violation Hardening:
--    - Violation tracking and server-enforced termination
--    - 24-hour server cooldown ledger with appeal management
--    - Enhanced audit event logging for visibility and proctoring
-- 4. AI Tutor session audit and rate-limiting telemetry
-- 5. Strict RLS and least-privilege security
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. LESSON VIDEOS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_videos (
  id text PRIMARY KEY,
  lesson_id text NOT NULL,
  module_id text NOT NULL,
  title text NOT NULL,
  duration_seconds int NOT NULL DEFAULT 0,
  video_url text NOT NULL,
  thumbnail_url text,
  caption_url text,
  transcript text,
  key_takeaways jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN ('ready', 'processing', 'failed', 'draft')) DEFAULT 'ready',
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lesson_videos_lesson_id ON public.lesson_videos (lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_module_id ON public.lesson_videos (module_id);

ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- Everyone can read published videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_videos' AND policyname = 'Anyone can view ready lesson videos'
  ) THEN
    CREATE POLICY "Anyone can view ready lesson videos"
      ON public.lesson_videos FOR SELECT
      USING (status = 'ready');
  END IF;
END $$;

-- Only admins/reviewers can mutate lesson videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_videos' AND policyname = 'Admins can manage lesson videos'
  ) THEN
    CREATE POLICY "Admins can manage lesson videos"
      ON public.lesson_videos FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'reviewer', 'instructor')
        )
      );
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. LESSON PROGRESS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  module_id text NOT NULL,
  playback_seconds numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_watched_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_module ON public.lesson_progress (user_id, module_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_progress' AND policyname = 'Users can view own progress'
  ) THEN
    CREATE POLICY "Users can view own progress"
      ON public.lesson_progress FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_progress' AND policyname = 'Users can upsert own progress'
  ) THEN
    CREATE POLICY "Users can upsert own progress"
      ON public.lesson_progress FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own progress"
      ON public.lesson_progress FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3. HARDEN ASSESSMENT ATTEMPTS FOR VIOLATIONS & COOLDOWNS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.assessment_attempts
  ADD COLUMN IF NOT EXISTS terminated_at timestamptz,
  ADD COLUMN IF NOT EXISTS termination_reason text,
  ADD COLUMN IF NOT EXISTS cooldown_until timestamptz,
  ADD COLUMN IF NOT EXISTS violation_count int DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS last_violation_at timestamptz;

-- Update status check constraint to include 'terminated'
DO $$
BEGIN
  ALTER TABLE public.assessment_attempts DROP CONSTRAINT IF EXISTS assessment_attempts_status_check;
  ALTER TABLE public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_status_check
    CHECK (status IN ('in_progress', 'in-progress', 'submitted', 'evaluated', 'passed', 'failed', 'timed_out', 'abandoned', 'terminated'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 4. ASSESSMENT AUDIT EVENTS EXPANSION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.assessment_audit_events DROP CONSTRAINT IF EXISTS assessment_audit_events_event_type_check;
  ALTER TABLE public.assessment_audit_events
    ADD CONSTRAINT assessment_audit_events_event_type_check
    CHECK (event_type IN (
      'start', 'answer_save', 'mark_review', 'tab_blur', 'tab_focus',
      'submit', 'timeout', 'fullscreen_enter', 'fullscreen_exit',
      'visibility_lost', 'visibility_restored', 'camera_interrupted',
      'clipboard_attempt', 'warning_issued', 'terminated'
    ));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;


-- ------------------------------------------------------------------------------
-- 5. ASSESSMENT COOLDOWNS LEDGER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_id text NOT NULL,
  attempt_id uuid NOT NULL,
  reason text NOT NULL,
  violation_count int NOT NULL DEFAULT 3,
  locked_at timestamptz DEFAULT now() NOT NULL,
  unlock_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'appealed', 'waived', 'expired')) DEFAULT 'active',
  appealed_at timestamptz,
  appeal_notes text,
  reviewed_by uuid,
  review_notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_cooldowns_lookup 
  ON public.assessment_cooldowns (user_id, assessment_id, status);

ALTER TABLE public.assessment_cooldowns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessment_cooldowns' AND policyname = 'Learners can view own cooldowns'
  ) THEN
    CREATE POLICY "Learners can view own cooldowns"
      ON public.assessment_cooldowns FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessment_cooldowns' AND policyname = 'Learners can submit appeals'
  ) THEN
    CREATE POLICY "Learners can submit appeals"
      ON public.assessment_cooldowns FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() AND status = 'active')
      WITH CHECK (user_id = auth.uid() AND status = 'appealed');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessment_cooldowns' AND policyname = 'Admins can manage cooldowns'
  ) THEN
    CREATE POLICY "Admins can manage cooldowns"
      ON public.assessment_cooldowns FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
        )
      );
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 6. AI TUTOR AUDIT SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  context_type text NOT NULL CHECK (context_type IN ('lesson', 'course', 'lab', 'project', 'dashboard', 'practice', 'general')),
  context_id text,
  prompt_snippet text NOT NULL,
  model_used text NOT NULL,
  prompt_tokens int DEFAULT 0,
  completion_tokens int DEFAULT 0,
  assessment_attempt_id uuid, -- If attempt active, request is blocked and logged
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_user ON public.ai_tutor_sessions (user_id, created_at);

ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_tutor_sessions' AND policyname = 'Users can view own AI sessions'
  ) THEN
    CREATE POLICY "Users can view own AI sessions"
      ON public.ai_tutor_sessions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

COMMIT;
