-- Fix missing user profiles for existing auth.users
-- This creates profiles for users who exist in auth.users but not in user_profiles

-- Create profiles for existing users without profiles
INSERT INTO user_profiles (id, email, full_name, role, status, assigned_by, assigned_at, admin_notes)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'restaurant_manager', -- Use a valid role from the constraint
  'pending', -- Status can be pending
  (SELECT id FROM user_profiles WHERE email = 'admin@test.com' LIMIT 1), -- Assign by admin
  NOW(),
  'Auto-created profile for existing user'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL -- Only users without profiles
AND au.email != 'admin@test.com'; -- Don't duplicate admin

-- Verify the fix
SELECT 
  au.email,
  up.role,
  up.status,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;
