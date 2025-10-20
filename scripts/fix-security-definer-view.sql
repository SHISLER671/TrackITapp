-- Fix Security Definer View issue for admin_user_management
-- Remove SECURITY DEFINER property to resolve the security warning

-- Drop the existing view
DROP VIEW IF EXISTS public.admin_user_management;

-- Recreate the view without SECURITY DEFINER
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
ORDER BY up.created_at DESC;

-- Grant access to the view (no SECURITY DEFINER needed)
GRANT SELECT ON public.admin_user_management TO authenticated;

-- Verify the view was created without SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'admin_user_management';
