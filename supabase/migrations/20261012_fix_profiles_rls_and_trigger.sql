-- ==============================================================================
-- FIX PROFILES ROW LEVEL SECURITY (RLS) & AUTOMATIC USER PROFILES TRIGGER
-- ==============================================================================
-- Principle: PROOF OF COURSE → PROOF OF ABILITY
-- Resolves: "new row violates row-level security policy for table 'profiles'"
-- Handles email-confirmation flows and authenticated user profile creation/updates
-- ==============================================================================

-- 1. Ensure Table Structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  education text,
  state text,
  district text,
  target_role text DEFAULT 'Full Stack Developer',
  github_handle text,
  avatar_url text,
  passport_visibility text DEFAULT 'public' CHECK (passport_visibility IN ('public', 'private', 'unlisted')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent Profiles RLS Policies
-- SELECT: Users can view own profile, or any profile with public visibility
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR passport_visibility = 'public');

-- INSERT: Authenticated users can insert ONLY their own profile (auth.uid() = id)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Authenticated users can update ONLY their own profile (auth.uid() = id)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Database Trigger on auth.users for Auto Profile Creation
-- Executes with SECURITY DEFINER privileges to safely create profiles during signUp,
-- even before email confirmation has established an active client session.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    mobile,
    education,
    state,
    district,
    passport_visibility
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Learner'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'education', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'district', ''),
    'public'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE 
      WHEN EXCLUDED.full_name <> '' AND EXCLUDED.full_name <> 'Learner' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    mobile = COALESCE(NULLIF(EXCLUDED.mobile, ''), public.profiles.mobile),
    education = COALESCE(NULLIF(EXCLUDED.education, ''), public.profiles.education),
    state = COALESCE(NULLIF(EXCLUDED.state, ''), public.profiles.state),
    district = COALESCE(NULLIF(EXCLUDED.district, ''), public.profiles.district),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
