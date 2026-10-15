-- ==============================================================================
-- VERIFICATION SCRIPT: PROFILES RLS & TRIGGER HEALTH CHECK
-- Run in Supabase SQL Editor to verify profiles RLS setup
-- ==============================================================================

-- 1. Check Table Exists & RLS Enabled
SELECT 
  tablename, 
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. Check RLS Policies on profiles
SELECT 
  policyname, 
  cmd, 
  roles, 
  qual, 
  with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY cmd;

-- 3. Check Trigger on auth.users
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_schema, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users' AND trigger_name = 'on_auth_user_created';

-- 4. Check handle_new_user function definition
SELECT 
  proname, 
  prosecdef AS is_security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';
