-- Check for common Supabase Performance Advisor issues
-- Run this to identify performance bottlenecks

-- 1. Check for missing indexes on frequently queried columns
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'kegs', 'deliveries', 'keg_scans')
AND n_distinct > 10  -- High cardinality columns that might need indexes
ORDER BY tablename, n_distinct DESC;

-- 2. Check for slow queries (if pg_stat_statements is enabled)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%user_profiles%' 
   OR query LIKE '%kegs%'
   OR query LIKE '%deliveries%'
   OR query LIKE '%keg_scans%'
ORDER BY mean_time DESC
LIMIT 10;

-- 3. Check for table bloat
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_tuple_percentage
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND n_dead_tup > 0
ORDER BY dead_tuple_percentage DESC;

-- 4. Check for unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY tablename, indexname;

-- 5. Check for large tables that might need partitioning
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- 6. Check for RLS policy performance
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

-- 7. Check for foreign key constraints that might impact performance
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
