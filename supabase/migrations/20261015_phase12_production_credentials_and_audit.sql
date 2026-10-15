-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 12.1: PRODUCTION DATABASE SECURITY & ENTITLEMENT RECONCILIATION
-- Migration: 20261015_phase12_production_credentials_and_audit.sql
-- Principle: Proof of Course → Proof of Ability
-- ==============================================================================
-- Summary of Additive, Safe & Rerun-Idempotent Changes:
-- 1. Wraps operations in an atomic transaction (BEGIN ... COMMIT).
-- 2. Expands credentials_status_check constraint to include 'revoked'.
-- 3. Adds revocation audit columns (revoked_at, revocation_reason, revoked_by) to credentials.
-- 4. Creates public.credential_audit_logs with append-only immutability trigger.
-- 5. Purges all legacy permissive RLS policies on public.credentials and public.skill_passports
--    (including any policy containing 'OR true') and replaces them with strict per-user isolation.
-- 6. Implements public.verify_credential(p_lookup_id text) SECURITY DEFINER RPC
--    with fixed search_path, explicit privilege grants, and candidate privacy masking.
-- 7. Enforces strict RLS on credential_audit_logs: service_role manages, staff read via JWT claims.
-- 8. Creates public.payment_orders and public.user_entitlements with check constraints
--    enforcing ₹100 (10000 paise) and 'INR' currency, with strict server-only mutation RLS.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. CREDENTIALS TABLE: STATUS CONSTRAINT EXPANSION
-- ------------------------------------------------------------------------------
ALTER TABLE public.credentials 
  DROP CONSTRAINT IF EXISTS credentials_status_check;

ALTER TABLE public.credentials 
  ADD CONSTRAINT credentials_status_check 
  CHECK (status IN ('active', 'pending', 'expired', 'revoked'));

-- ------------------------------------------------------------------------------
-- 2. CREDENTIALS TABLE: REVOCATION AUDIT COLUMNS
-- ------------------------------------------------------------------------------
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS revocation_reason text,
  ADD COLUMN IF NOT EXISTS revoked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_credentials_status ON public.credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_vid ON public.credentials(verification_id);

-- ------------------------------------------------------------------------------
-- 3. CREDENTIAL AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credential_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('ISSUED', 'REVOKED', 'RENEWED')),
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  performed_by_label text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cred_audit_cid ON public.credential_audit_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_cred_audit_action ON public.credential_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_cred_audit_created ON public.credential_audit_logs(created_at DESC);

-- Trigger: Enforce strict append-only immutability on audit logs
CREATE OR REPLACE FUNCTION public.prevent_credential_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RAISE EXCEPTION 'Security Violation: Credential audit logs are immutable. UPDATE and DELETE operations are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_credential_audit_logs ON public.credential_audit_logs;
CREATE TRIGGER trg_immutable_credential_audit_logs
  BEFORE UPDATE OR DELETE ON public.credential_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_credential_audit_log_mutation();

-- ------------------------------------------------------------------------------
-- 4. RECONCILE CREDENTIALS RLS (PURGE ALL LEGACY POLICIES INCLUDING 'OR true')
-- ------------------------------------------------------------------------------
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Explicit drops for all known legacy policy names
DROP POLICY IF EXISTS "Users can view own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Users can read own credentials or public verification lookup" ON public.credentials;
DROP POLICY IF EXISTS "Users can read own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Service role manages credentials" ON public.credentials;

-- Dynamic drop loop to ensure NO other legacy policy survives regardless of name
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'credentials'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.credentials', pol.policyname);
  END LOOP;
END $$;

-- Policy 4A: Authenticated learners can ONLY read their own credentials
CREATE POLICY "Users can read own credentials" ON public.credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4B: Service role maintains full administrative control for backend endpoints
CREATE POLICY "Service role manages credentials" ON public.credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4C. RECONCILE SKILL PASSPORTS RLS (PURGE ALL LEGACY POLICIES INCLUDING 'OR true')
-- ------------------------------------------------------------------------------
ALTER TABLE public.skill_passports ENABLE ROW LEVEL SECURITY;

-- Explicit drops for all known legacy policy names
DROP POLICY IF EXISTS "Users can read own passport or public verification lookup" ON public.skill_passports;
DROP POLICY IF EXISTS "Users can read own passport" ON public.skill_passports;
DROP POLICY IF EXISTS "Service role manages skill passports" ON public.skill_passports;

-- Dynamic drop loop to ensure NO other legacy policy survives regardless of name
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'skill_passports'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.skill_passports', pol.policyname);
  END LOOP;
END $$;

-- Policy 4C-1: Authenticated learners can ONLY read their own skill passport
CREATE POLICY "Users can read own passport" ON public.skill_passports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4C-2: Service role maintains full administrative control for backend endpoints
CREATE POLICY "Service role manages skill passports" ON public.skill_passports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. RECONCILE AUDIT LOGS RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.credential_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages credential audit logs" ON public.credential_audit_logs;
DROP POLICY IF EXISTS "Staff can read credential audit logs" ON public.credential_audit_logs;
DROP POLICY IF EXISTS "Admins and instructors can read credential audit logs" ON public.credential_audit_logs;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'credential_audit_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.credential_audit_logs', pol.policyname);
  END LOOP;
END $$;

-- Policy 5A: Server service_role handles creation and management
CREATE POLICY "Service role manages credential audit logs" ON public.credential_audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 5B: Read access for staff possessing admin/instructor/reviewer JWT app_metadata
-- (Zero dependency on non-existent profiles.role)
CREATE POLICY "Staff can read credential audit logs" ON public.credential_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'instructor', 'reviewer')
  );

-- ------------------------------------------------------------------------------
-- 6. SECURE PUBLIC CREDENTIAL VERIFICATION RPC
-- ------------------------------------------------------------------------------
-- Prefer CREATE OR REPLACE to preserve existing dependencies and grants where signature matches
CREATE OR REPLACE FUNCTION public.verify_credential(p_lookup_id text)
RETURNS TABLE (
  credential_id text,
  verification_id text,
  credential_type text,
  title text,
  status text,
  issued_at timestamptz,
  candidate_name text,
  course_id text,
  evidence_hash text,
  valid_until text,
  is_revoked boolean,
  revoked_at timestamptz,
  revocation_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
STABLE
AS $$
BEGIN
  p_lookup_id := trim(p_lookup_id);
  
  -- Defend against empty strings, nulls, or excessively long probe inputs
  IF p_lookup_id IS NULL OR length(p_lookup_id) < 3 OR length(p_lookup_id) > 128 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id AS credential_id,
    c.verification_id,
    c.credential_type,
    c.title,
    c.status,
    c.issued_at,
    CASE 
      WHEN p.passport_visibility = 'public' THEN 
        COALESCE(NULLIF(trim(p.full_name), ''), NULLIF(trim(c.metadata->>'candidateName'), ''), 'Verified Learner')
      ELSE 'Protected Candidate'
    END AS candidate_name,
    c.metadata->>'courseId' AS course_id,
    c.metadata->>'evidenceHash' AS evidence_hash,
    c.metadata->>'validUntil' AS valid_until,
    (c.status = 'revoked') AS is_revoked,
    c.revoked_at,
    c.revocation_reason
  FROM public.credentials c
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE (c.id = p_lookup_id OR c.verification_id = p_lookup_id)
    AND c.status IN ('active', 'revoked')
  LIMIT 1;
END;
$$;

-- Restrict privileges: Revoke public default, explicitly grant anon, authenticated, service_role
REVOKE ALL ON FUNCTION public.verify_credential(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_credential(text) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 7. PAYMENT ORDERS & USER ENTITLEMENTS (₹100 COURSE ACCESS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'INR' NOT NULL CHECK (currency = 'INR'),
  status text DEFAULT 'created' NOT NULL CHECK (status IN ('created', 'attempted', 'paid', 'failed')),
  provider text DEFAULT 'razorpay' NOT NULL,
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  entitlement_type text DEFAULT 'all_courses_pass' NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  verified_at timestamptz,
  CONSTRAINT chk_payment_orders_course_pass_amount CHECK (
    entitlement_type != 'all_courses_pass' OR amount = 10000
  )
);

CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entitlement_type text NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  granted_at timestamptz DEFAULT now() NOT NULL,
  order_id text,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  UNIQUE(user_id, entitlement_type)
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_prov_order ON public.payment_orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_user ON public.user_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_type ON public.user_entitlements(entitlement_type);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

-- Drop explicit known names and dynamic drop loop for payment_orders RLS
DROP POLICY IF EXISTS "Users can read own payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Service role manages payment orders" ON public.payment_orders;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payment_orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_orders', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can read own payment orders" ON public.payment_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role manages payment orders" ON public.payment_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Drop explicit known names and dynamic drop loop for user_entitlements RLS
DROP POLICY IF EXISTS "Users can read own entitlements" ON public.user_entitlements;
DROP POLICY IF EXISTS "Service role manages user entitlements" ON public.user_entitlements;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_entitlements'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_entitlements', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can read own entitlements" ON public.user_entitlements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role manages user entitlements" ON public.user_entitlements
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
