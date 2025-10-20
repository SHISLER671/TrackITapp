-- Supabase Performance Optimization Script
-- Addresses common performance issues found in Performance Advisor

-- 1. Add missing indexes for better query performance
-- These are common performance bottlenecks

-- Index for user_profiles role and status queries (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status 
ON user_profiles(role, status);

-- Index for user_profiles email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON user_profiles(email);

-- Index for user_profiles assigned_by lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_assigned_by 
ON user_profiles(assigned_by);

-- Index for kegs current_holder queries
CREATE INDEX IF NOT EXISTS idx_kegs_current_holder_status 
ON kegs(current_holder, status);

-- Index for kegs brewery_id queries
CREATE INDEX IF NOT EXISTS idx_kegs_brewery_id_status 
ON kegs(brewery_id, status);

-- Index for deliveries driver_id and status
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_status 
ON deliveries(driver_id, status);

-- Index for deliveries scheduled_date queries
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date 
ON deliveries(scheduled_date);

-- Index for keg_scans timestamp queries
CREATE INDEX IF NOT EXISTS idx_keg_scans_timestamp_type 
ON keg_scans(timestamp, scan_type);

-- Index for keg_scans scanned_by queries
CREATE INDEX IF NOT EXISTS idx_keg_scans_scanned_by_timestamp 
ON keg_scans(scanned_by, timestamp);

-- 2. Optimize existing indexes
-- Drop redundant or inefficient indexes

-- Check for duplicate indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'kegs', 'deliveries', 'keg_scans')
ORDER BY tablename, indexname;

-- 3. Analyze tables for better query planning
ANALYZE user_profiles;
ANALYZE kegs;
ANALYZE deliveries;
ANALYZE delivery_items;
ANALYZE keg_scans;
ANALYZE breweries;
ANALYZE restaurants;

-- 4. Check for unused indexes (can be removed to improve write performance)
-- Note: Run this query to identify unused indexes, then manually remove them
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_tup_read = 0
AND idx_tup_fetch = 0;

-- 5. Check table statistics
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. Vacuum tables to reclaim space and improve performance
VACUUM ANALYZE user_profiles;
VACUUM ANALYZE kegs;
VACUUM ANALYZE deliveries;
VACUUM ANALYZE delivery_items;
VACUUM ANALYZE keg_scans;
VACUUM ANALYZE breweries;
VACUUM ANALYZE restaurants;
