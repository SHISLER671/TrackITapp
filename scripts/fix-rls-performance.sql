-- Fix RLS Performance Issues
-- Addresses "Auth RLS Initialization Plan" and "Multiple Permissive Policies" warnings

-- 1. First, let's see what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Drop all existing policies to start fresh with optimized ones
-- This will resolve the "Multiple Permissive Policies" issue

-- Drop policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_profiles;
DROP POLICY IF EXISTS "Pending users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Drop policies for kegs
DROP POLICY IF EXISTS "Active users can view kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can insert kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can update kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can delete kegs" ON public.kegs;
DROP POLICY IF EXISTS "All roles can view kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can manage kegs" ON public.kegs;

-- Drop policies for deliveries
DROP POLICY IF EXISTS "Active users can view deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can insert deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can update deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can delete deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "All roles can view deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can manage deliveries" ON public.deliveries;

-- Drop policies for delivery_items
DROP POLICY IF EXISTS "All roles can view delivery items" ON public.delivery_items;
DROP POLICY IF EXISTS "Drivers can insert delivery items" ON public.delivery_items;
DROP POLICY IF EXISTS "Drivers can update delivery items" ON public.delivery_items;
DROP POLICY IF EXISTS "Drivers can delete delivery items" ON public.delivery_items;
DROP POLICY IF EXISTS "Drivers can manage delivery items" ON public.delivery_items;

-- Drop policies for keg_scans
DROP POLICY IF EXISTS "All roles can manage keg scans" ON public.keg_scans;

-- Drop policies for breweries
DROP POLICY IF EXISTS "Active brewers can access breweries" ON public.breweries;
DROP POLICY IF EXISTS "Brewers can access breweries" ON public.breweries;

-- Drop policies for restaurants
DROP POLICY IF EXISTS "Active restaurant managers can access restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant managers can access restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurants viewable by authenticated users" ON public.restaurants;

-- Drop policies for user_roles
DROP POLICY IF EXISTS "User roles viewable by authenticated users" ON public.user_roles;

-- 3. Create optimized policies that avoid re-evaluation of auth functions
-- Use a more efficient approach with better caching

-- User profiles policies (optimized)
CREATE POLICY "user_profiles_select_policy"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())::uuid
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles up2 
    WHERE up2.id = (SELECT auth.uid())::uuid 
    AND up2.role = 'admin' 
    AND up2.status = 'active'
  )
);

CREATE POLICY "user_profiles_update_policy"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  id = (SELECT auth.uid())::uuid
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles up2 
    WHERE up2.id = (SELECT auth.uid())::uuid 
    AND up2.role = 'admin' 
    AND up2.status = 'active'
  )
);

CREATE POLICY "user_profiles_insert_policy"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = (SELECT auth.uid())::uuid
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles up2 
    WHERE up2.id = (SELECT auth.uid())::uuid 
    AND up2.role = 'admin' 
    AND up2.status = 'active'
  )
);

-- Kegs policies (optimized)
CREATE POLICY "kegs_select_policy"
ON public.kegs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
);

CREATE POLICY "kegs_modify_policy"
ON public.kegs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('brewer', 'admin')
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('brewer', 'admin')
    AND status = 'active'
  )
);

-- Deliveries policies (optimized)
CREATE POLICY "deliveries_select_policy"
ON public.deliveries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
);

CREATE POLICY "deliveries_modify_policy"
ON public.deliveries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('driver', 'admin')
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('driver', 'admin')
    AND status = 'active'
  )
);

-- Delivery items policies (optimized)
CREATE POLICY "delivery_items_select_policy"
ON public.delivery_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
);

CREATE POLICY "delivery_items_modify_policy"
ON public.delivery_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('driver', 'admin')
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('driver', 'admin')
    AND status = 'active'
  )
);

-- Keg scans policies (optimized)
CREATE POLICY "keg_scans_policy"
ON public.keg_scans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
);

-- Breweries policies (optimized)
CREATE POLICY "breweries_policy"
ON public.breweries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('brewer', 'admin')
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('brewer', 'admin')
    AND status = 'active'
  )
);

-- Restaurants policies (optimized)
CREATE POLICY "restaurants_policy"
ON public.restaurants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('restaurant_manager', 'admin')
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND role IN ('restaurant_manager', 'admin')
    AND status = 'active'
  )
);

-- User roles policies (optimized)
CREATE POLICY "user_roles_policy"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (SELECT auth.uid())::uuid 
    AND status = 'active'
  )
);

-- 4. Verify the new policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
