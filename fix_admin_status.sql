-- Fix admin user status
UPDATE user_profiles 
SET status = 'active', 
    role = 'admin',
    assigned_by = id, 
    assigned_at = NOW(),
    admin_notes = 'System admin - auto-activated'
WHERE email = 'admin@test.com';

-- Verify the update
SELECT email, role, status, assigned_at FROM user_profiles WHERE email = 'admin@test.com';
