-- ==============================================================================
-- SEVA SKILL PASSPORT — PHASE 14: COURSE-SPECIFIC PRICING & ENTITLEMENTS
-- Non-destructive migration supporting ₹100 individual course pricing.
-- Ensures that payment for Course A unlocks ONLY Course A, and Course B requires
-- a separate individual enrollment.
-- ==============================================================================

-- 1. Safely add course_id to user_entitlements and payment_orders
ALTER TABLE public.user_entitlements 
  ADD COLUMN IF NOT EXISTS course_id text;

ALTER TABLE public.payment_orders 
  ADD COLUMN IF NOT EXISTS course_id text;

-- 2. Safely reconcile legacy unique constraint if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_entitlements_user_id_entitlement_type_key'
      AND conrelid = 'public.user_entitlements'::regclass
  ) THEN
    ALTER TABLE public.user_entitlements 
      DROP CONSTRAINT user_entitlements_user_id_entitlement_type_key;
  END IF;
END $$;

-- 3. Create unique index ensuring one active entitlement per user per course
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_entitlement 
  ON public.user_entitlements(user_id, course_id) 
  WHERE status = 'active' AND course_id IS NOT NULL;

-- 4. Create indexes for fast course-specific access checks
CREATE INDEX IF NOT EXISTS idx_user_entitlements_course 
  ON public.user_entitlements(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_course 
  ON public.payment_orders(user_id, course_id);

-- 5. Row-Level Security policies on user_entitlements and payment_orders
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Entitlements: Students can view own entitlements only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_entitlements' 
      AND policyname = 'Users can view own course entitlements'
  ) THEN
    CREATE POLICY "Users can view own course entitlements" ON public.user_entitlements
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Payment Orders: Students can view own orders only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_orders' 
      AND policyname = 'Users can view own payment orders'
  ) THEN
    CREATE POLICY "Users can view own payment orders" ON public.payment_orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================================================
-- REVERSIBLE ROLLBACK INSTRUCTIONS (FORWARD-SAFE PLAN)
-- ==============================================================================
-- To reverse this migration safely without dropping tables or losing payment history:
--
-- DROP POLICY IF EXISTS "Users can view own course entitlements" ON public.user_entitlements;
-- DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
-- DROP INDEX IF EXISTS public.uq_user_course_entitlement;
-- DROP INDEX IF EXISTS public.idx_user_entitlements_course;
-- DROP INDEX IF EXISTS public.idx_payment_orders_course;
-- ALTER TABLE public.user_entitlements DROP COLUMN IF EXISTS course_id;
-- ALTER TABLE public.payment_orders DROP COLUMN IF EXISTS course_id;
-- ==============================================================================
