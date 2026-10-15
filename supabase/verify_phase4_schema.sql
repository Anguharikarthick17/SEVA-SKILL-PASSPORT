-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 4 SCHEMA AUDIT & VERIFICATION SCRIPT
-- Execute in Supabase SQL Editor to verify tables, columns, policies & security.
-- ==============================================================================

-- 1. VERIFY TABLES EXISTENCE
SELECT 
  table_name,
  CASE WHEN table_name IN ('assessment_questions', 'assessment_audit_events', 'assessments', 'assessment_attempts')
       THEN '✓ Present' ELSE 'Other' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('assessment_questions', 'assessment_audit_events', 'assessments', 'assessment_attempts')
ORDER BY table_name;

-- 2. VERIFY PHASE 4 COLUMNS IN ASSESSMENTS
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'assessments'
  AND column_name IN (
    'passing_threshold', 'max_attempts', 'total_marks', 
    'question_count', 'skills', 'dimensions', 
    'difficulty_distribution', 'randomize_questions', 'randomize_options'
  )
ORDER BY column_name;

-- 3. VERIFY PHASE 4 COLUMNS IN ASSESSMENT_ATTEMPTS
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'assessment_attempts'
  AND column_name IN (
    'attempt_number', 'expires_at', 'submitted_at', 'time_taken_seconds',
    'total_marks', 'earned_marks', 'percentage', 'answers',
    'marked_for_review', 'question_ids', 'evaluation_results',
    'skill_breakdown', 'dimension_breakdown', 'weak_areas', 'evidence_id'
  )
ORDER BY column_name;

-- 4. VERIFY ROW LEVEL SECURITY (RLS) STATUS ON TABLES
SELECT 
  relname as table_name,
  CASE WHEN relrowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as rls_enabled
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
  AND relname IN ('assessment_questions', 'assessment_attempts', 'assessment_audit_events');

-- 5. VERIFY ACTIVE RLS POLICIES
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('assessment_questions', 'assessment_attempts', 'assessment_audit_events')
ORDER BY tablename, policyname;

-- 6. VERIFY COLUMN-LEVEL ACCESS RESTRICTION (ANSWER KEY SHIELDING)
-- Confirms that anon & authenticated DO NOT have privilege on correct_answers or explanation
SELECT 
  table_name,
  column_name,
  grantee,
  privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'assessment_questions'
  AND column_name IN ('correct_answers', 'explanation')
  AND grantee IN ('anon', 'authenticated');
-- (Expected result: 0 rows returned for anon and authenticated on these 2 columns)

-- 7. VERIFY CLIENT_ASSESSMENT_QUESTIONS SECURE VIEW
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'client_assessment_questions';
