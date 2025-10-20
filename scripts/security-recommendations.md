# Supabase Security Recommendations

## 🚨 Critical Security Issues to Fix

### 1. **Leaked Password Protection** (Warning)
**Issue**: Leaked password protection is currently disabled.

**Fix**: Go to Supabase Dashboard > Authentication > Settings
- Enable **"Enable leaked password protection"**
- This prevents users from using compromised passwords

### 2. **Multi-Factor Authentication (MFA)** (Warning)
**Issue**: Too few MFA options enabled.

**Fix**: Go to Supabase Dashboard > Authentication > Settings
- Enable **"Enable phone confirmations"** for SMS-based MFA
- Enable **"Enable TOTP"** for authenticator app-based MFA
- Consider enabling **"Enable WebAuthn"** for hardware security keys

### 3. **Email Confirmations** (Recommended)
**Fix**: Go to Supabase Dashboard > Authentication > Settings
- Enable **"Enable email confirmations"** to require email verification
- Set **"Email confirmation URL"** to your app's confirmation page
- Configure **"Email templates"** for better user experience

## 🔧 Database Security Issues (Fixed by SQL Script)

### ✅ **RLS Issues Fixed**:
- Enabled RLS on `public.restaurants` and `public.user_roles`
- Fixed `admin_user_management` view to not expose `auth.users` directly
- Added proper RLS policies for all tables

### ✅ **Function Security Fixed**:
- Added `search_path = public` to all functions
- Prevents SQL injection attacks
- Secures function execution context

### ✅ **View Security Fixed**:
- Removed direct exposure of `auth.users` table
- Created safer admin user management view
- Proper access controls for authenticated users

## 🛡️ Additional Security Recommendations

### 1. **API Security**
- Use **Row Level Security (RLS)** for all data access
- Implement **rate limiting** on API endpoints
- Use **service role key** only for server-side operations

### 2. **Authentication Security**
- Enable **email confirmations** for new signups
- Implement **account lockout** after failed attempts
- Set up **session management** with appropriate timeouts

### 3. **Database Security**
- Regularly **audit user permissions**
- Monitor **unusual access patterns**
- Keep **database functions updated** with security patches

## 📊 Security Dashboard Status

After running the SQL script and applying dashboard settings:
- **Errors**: Should be reduced from 6 to 0
- **Warnings**: Should be reduced from 7 to 2-3 (MFA and password protection)
- **Info**: Should show 0 suggestions

## 🚀 Next Steps

1. **Run the SQL script** (`fix-security-issues.sql`) in Supabase SQL Editor
2. **Configure authentication settings** in Supabase Dashboard
3. **Test the application** to ensure everything still works
4. **Monitor the Security Advisor** for any remaining issues

## 🔗 References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Authentication Settings](https://supabase.com/docs/guides/auth/auth-helpers)
- [PostgreSQL Security Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
