-- Fix remaining function search_path issues
-- Address the functions that still show search_path warnings

-- Fix calculate_delivery_deposit function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_delivery_deposit') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_delivery_deposit() SET search_path = public';
  END IF;
END $$;

-- Fix accept_delivery_transfer_kegs function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'accept_delivery_transfer_kegs') THEN
    EXECUTE 'ALTER FUNCTION public.accept_delivery_transfer_kegs() SET search_path = public';
  END IF;
END $$;

-- Note: The pg_temp_50 functions are temporary functions created by Supabase
-- These are system-generated and don't need to be fixed manually

-- Verify all function search_path settings
SELECT 
  proname as function_name,
  proconfig as config_settings
FROM pg_proc 
WHERE proname IN (
  'calculate_delivery_deposit', 
  'accept_delivery_transfer_kegs',
  'handle_new_user',
  'calculate_keg_variance',
  'sync_keg_pints_sold'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
