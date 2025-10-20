-- Clean up duplicate RLS policies
-- Remove old policies that are causing "Multiple Permissive Policies" warnings

-- Drop all old policies that are duplicating the new optimized ones

-- Clean up deliveries table
DROP POLICY IF EXISTS "Brewers can view all deliveries from their brewery" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers and restaurant managers can update deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can create deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Drivers can view their own deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Restaurant managers can view their deliveries" ON public.deliveries;

-- Clean up delivery_items table
DROP POLICY IF EXISTS "Drivers can create delivery items" ON public.delivery_items;
DROP POLICY IF EXISTS "Users can view delivery items if they can view the delivery" ON public.delivery_items;

-- Clean up kegs table
DROP POLICY IF EXISTS "Authenticated users can update kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can create kegs" ON public.kegs;
DROP POLICY IF EXISTS "Brewers can view all kegs in their brewery" ON public.kegs;
DROP POLICY IF EXISTS "Drivers can view kegs assigned to them" ON public.kegs;
DROP POLICY IF EXISTS "Restaurant managers can view kegs at their location" ON public.kegs;

-- Clean up keg_scans table
DROP POLICY IF EXISTS "Authenticated users can create scans" ON public.keg_scans;
DROP POLICY IF EXISTS "Users can view scans for kegs they have access to" ON public.keg_scans;

-- Clean up breweries table
DROP POLICY IF EXISTS "Breweries are viewable by authenticated users" ON public.breweries;
DROP POLICY IF EXISTS "Brewers can insert breweries" ON public.breweries;

-- Clean up user_roles table
DROP POLICY IF EXISTS "Brewers can view all roles in their brewery" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Clean up accounting_exports table (if these exist)
DROP POLICY IF EXISTS "Brewers and managers can create exports" ON public.accounting_exports;
DROP POLICY IF EXISTS "Users can view their own exports" ON public.accounting_exports;

-- Clean up pos_sales table (if these exist)
DROP POLICY IF EXISTS "Authenticated users can insert POS sales" ON public.pos_sales;
DROP POLICY IF EXISTS "Authenticated users can update POS sales" ON public.pos_sales;
DROP POLICY IF EXISTS "Users can view POS sales for kegs they have access to" ON public.pos_sales;

-- Clean up variance_reports table (if these exist)
DROP POLICY IF EXISTS "Authenticated users can create variance reports" ON public.variance_reports;
DROP POLICY IF EXISTS "Brewers and restaurant managers can update variance reports" ON public.variance_reports;
DROP POLICY IF EXISTS "Brewers and restaurant managers can view variance reports" ON public.variance_reports;

-- Verify the cleanup - should only show the new optimized policies
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
