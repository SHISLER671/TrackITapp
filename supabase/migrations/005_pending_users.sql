-- Add pending user system for admin-controlled role assignment
-- This ensures new users can't access anything until admin assigns a role

-- Add status column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'active', 'suspended'));

-- Add assigned_by column to track who assigned the role
ALTER TABLE user_profiles 
ADD COLUMN assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add notes column for admin comments
ALTER TABLE user_profiles 
ADD COLUMN admin_notes TEXT;

-- Update the trigger function to create users as pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'pending', -- All new users start as pending
    'pending'  -- Status is also pending
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for pending users
-- Pending users can only see their own profile
CREATE POLICY "Pending users can view own profile" ON user_profiles 
  FOR SELECT USING (
    auth.uid() = id AND status = 'pending'
  );

-- Only admins can view all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can update user roles and status
CREATE POLICY "Admins can manage user roles" ON user_profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can insert user profiles (for manual creation)
CREATE POLICY "Admins can create user profiles" ON user_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update existing policies to only allow active users
-- Breweries: Only active brewers and admins
DROP POLICY IF EXISTS "Brewers can access breweries" ON breweries;
CREATE POLICY "Active brewers can access breweries" ON breweries 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
      AND status = 'active'
    )
  );

-- Restaurants: Only active restaurant managers and admins
DROP POLICY IF EXISTS "Restaurant managers can access restaurants" ON restaurants;
CREATE POLICY "Active restaurant managers can access restaurants" ON restaurants 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('restaurant_manager', 'admin')
      AND status = 'active'
    )
  );

-- Kegs: Only active users can view, only active brewers can manage
DROP POLICY IF EXISTS "All roles can view kegs" ON kegs;
CREATE POLICY "Active users can view kegs" ON kegs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
      AND status = 'active'
    )
  );

-- Deliveries: Only active users can view, only active drivers can manage
DROP POLICY IF EXISTS "All roles can view deliveries" ON deliveries;
CREATE POLICY "Active users can view deliveries" ON deliveries 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
      AND status = 'active'
    )
  );

-- Update the admin user to be active
UPDATE user_profiles 
SET status = 'active', 
    assigned_by = id, 
    assigned_at = NOW(),
    admin_notes = 'Initial admin user'
WHERE email = 'admin@test.com';

-- Create a view for admin user management
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
  au.last_sign_in_at,
  CASE 
    WHEN up.assigned_by IS NOT NULL THEN 
      (SELECT email FROM user_profiles WHERE id = up.assigned_by)
    ELSE 'System'
  END as assigned_by_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;

-- Grant access to the view for authenticated users
-- The RLS policy on user_profiles will control access
GRANT SELECT ON public.admin_user_management TO authenticated;
