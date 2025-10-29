-- Fix admin user stuck in pending approval
-- The admin needs to be able to approve themselves!

-- Update the admin user to active status
UPDATE public.user_profiles 
SET status = 'active' 
WHERE email = 'admin@test.com' 
AND role = 'admin';

-- Verify the update
SELECT 
  id,
  email,
  role,
  status,
  created_at
FROM public.user_profiles 
WHERE email = 'admin@test.com';
