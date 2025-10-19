-- Fix authentication settings and admin user status
-- This script addresses the "Anonymous sign-ups disabled" error and admin user issues

-- 1. Fix admin user status (make sure admin is active)
UPDATE user_profiles 
SET status = 'active', 
    role = 'admin',
    assigned_by = id, 
    assigned_at = NOW(),
    admin_notes = 'System admin - auto-activated'
WHERE email = 'admin@test.com';

-- 2. Verify admin user is properly set up
SELECT 
  email, 
  role, 
  status, 
  assigned_at,
  created_at
FROM user_profiles 
WHERE email = 'admin@test.com';

-- 3. Check if there are any other users that need activation
SELECT 
  email, 
  role, 
  status, 
  created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 4. Ensure RLS policies allow admin to see all users
-- (This should already be handled by the previous RLS fix script)

-- Note: The "Anonymous sign-ups disabled" error is a Supabase dashboard setting
-- You need to check in Supabase Dashboard > Authentication > Settings:
-- 1. Enable "Email signups" 
-- 2. Disable "Anonymous sign-ins" (unless you want anonymous access)
-- 3. Make sure "Enable email confirmations" is set appropriately
