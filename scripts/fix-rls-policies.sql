-- Fix infinite recursion in user_profiles RLS policies
-- The issue occurs when policies reference the same table they're protecting

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create simple, non-recursive policies
-- Policy 1: Users can view their own profile (no recursion)
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (no recursion)
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
ON user_profiles
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace the admin_user_management view without recursion
DROP VIEW IF EXISTS admin_user_management;

CREATE OR REPLACE VIEW admin_user_management AS
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
  au.last_sign_in_at,
  admin_profile.email as assigned_by_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
LEFT JOIN user_profiles admin_profile ON up.assigned_by = admin_profile.id;

-- Grant access to the view
GRANT SELECT ON admin_user_management TO authenticated;
GRANT SELECT ON admin_user_management TO anon;
