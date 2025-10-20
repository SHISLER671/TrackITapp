-- Fix Supabase Security Advisor issues
-- This script addresses all the security flags shown in the dashboard

-- 1. Fix RLS issues - Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Fix the admin_user_management view to not expose auth.users directly
-- Drop the problematic view
DROP VIEW IF EXISTS public.admin_user_management;

-- Create a safer version that doesn't expose auth.users directly
CREATE OR REPLACE VIEW public.admin_user_management AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  up.assigned_by,
  up.assigned_at,
  up.admin_notes,
  up.created_at,
  up.updated_at,
  CASE 
    WHEN up.assigned_by IS NOT NULL THEN 
      (SELECT email FROM user_profiles WHERE id = up.assigned_by)
    ELSE 'System'
  END as assigned_by_email
FROM user_profiles up
-- Remove the LEFT JOIN to auth.users to avoid exposing it
ORDER BY up.created_at DESC;

-- Grant access to the view (safer approach)
GRANT SELECT ON public.admin_user_management TO authenticated;

-- 3. Fix function search_path issues
-- Add search_path to all functions to prevent SQL injection

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'restaurant_manager',
    'pending'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix other functions if they exist (add search_path)
-- Note: These functions may not exist yet, but adding them for completeness

-- Fix calculate_delivery_dep function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_delivery_dep') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_delivery_dep() SET search_path = public';
  END IF;
END $$;

-- Fix accept_delivery_transf function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'accept_delivery_transf') THEN
    EXECUTE 'ALTER FUNCTION public.accept_delivery_transf() SET search_path = public';
  END IF;
END $$;

-- Fix calculate_keg_variance function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_keg_variance') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_keg_variance() SET search_path = public';
  END IF;
END $$;

-- Fix sync_keg_pints_sold function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_keg_pints_sold') THEN
    EXECUTE 'ALTER FUNCTION public.sync_keg_pints_sold() SET search_path = public';
  END IF;
END $$;

-- 4. Ensure proper RLS policies exist for all tables
-- Add basic RLS policies for restaurants if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'restaurants' 
    AND policyname = 'Restaurants viewable by authenticated users'
  ) THEN
    CREATE POLICY "Restaurants viewable by authenticated users"
    ON public.restaurants
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Add basic RLS policies for user_roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'User roles viewable by authenticated users'
  ) THEN
    CREATE POLICY "User roles viewable by authenticated users"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 5. Verify the fixes
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('restaurants', 'user_roles', 'user_profiles')
ORDER BY tablename;

-- Check function search_path settings
SELECT 
  proname as function_name,
  proconfig as config_settings
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'calculate_delivery_dep', 'accept_delivery_transf', 'calculate_keg_variance', 'sync_keg_pints_sold')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
