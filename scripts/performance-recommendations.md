# Supabase Performance Optimization Guide

## 🚀 Common Performance Issues & Solutions

### 1. **Missing Indexes** (Most Common)
**Issue**: Queries are slow because they're doing full table scans.

**Solution**: Add indexes on frequently queried columns:
```sql
-- Run the optimize-performance.sql script
-- This adds indexes for:
-- - user_profiles (role, status, email, assigned_by)
-- - kegs (current_holder, brewery_id, status)
-- - deliveries (driver_id, status, scheduled_date)
-- - keg_scans (timestamp, scan_type, scanned_by)
```

### 2. **RLS Policy Performance**
**Issue**: Row Level Security policies can slow down queries.

**Solution**: 
- Use indexed columns in RLS policies
- Avoid complex subqueries in policies
- Consider materialized views for complex RLS scenarios

### 3. **Table Bloat**
**Issue**: Dead tuples accumulate, slowing down queries.

**Solution**:
```sql
-- Run VACUUM ANALYZE on tables
VACUUM ANALYZE user_profiles;
VACUUM ANALYZE kegs;
-- etc.
```

### 4. **Unused Indexes**
**Issue**: Indexes that are never used waste space and slow writes.

**Solution**: Remove unused indexes identified by the check script.

### 5. **Large Tables**
**Issue**: Tables with millions of rows may need partitioning.

**Solution**: Consider partitioning by date or other criteria for large tables.

## 🔧 Performance Optimization Steps

### Step 1: Run Performance Check
```sql
-- Run scripts/check-performance-issues.sql
-- This will identify specific performance bottlenecks
```

### Step 2: Apply Optimizations
```sql
-- Run scripts/optimize-performance.sql
-- This adds indexes and optimizes existing ones
```

### Step 3: Monitor Results
- Check the Performance Advisor dashboard again
- Monitor query performance
- Look for improvements in response times

## 📊 Expected Improvements

After running the optimization scripts, you should see:
- **Faster query execution** - especially for user lookups and role checks
- **Better RLS performance** - policies will use indexes
- **Reduced table bloat** - VACUUM reclaims space
- **Improved write performance** - fewer unused indexes

## 🎯 Specific to Your App

### High-Impact Optimizations:
1. **User role lookups** - Critical for RLS policies
2. **Keg status queries** - Used in inventory management
3. **Delivery tracking** - Driver and status queries
4. **QR scan lookups** - Timestamp and user-based queries

### Monitoring Queries:
- Watch for slow queries in the Performance Advisor
- Monitor index usage statistics
- Check for table bloat regularly

## 🚨 Performance Red Flags

Watch out for:
- **Full table scans** on large tables
- **N+1 query problems** in your application code
- **Missing indexes** on foreign key columns
- **Complex RLS policies** with subqueries
- **Unused indexes** consuming space

## 🔗 References

- [Supabase Performance Guide](https://supabase.com/docs/guides/performance)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [RLS Performance Tips](https://supabase.com/docs/guides/auth/row-level-security)
