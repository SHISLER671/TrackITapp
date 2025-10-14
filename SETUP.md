# Setup Guide - Beer Keg Tracker

This guide provides detailed instructions for setting up all external services and deploying the Beer Keg Tracker application.

## Table of Contents

1. [Quick Start (Mock Mode)](#quick-start-mock-mode)
2. [Supabase Setup](#supabase-setup)
3. [Thirdweb Setup](#thirdweb-setup)
4. [Google Gemini AI Setup](#google-gemini-ai-setup)
5. [POS System Integration](#pos-system-integration)
6. [Deployment](#deployment)

## Quick Start (Mock Mode)

The application works out of the box with mock implementations. No external services required for development!

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Run development server
npm run dev
```

The app will run with:
- Mock blockchain (simulated token minting/burning)
- Mock POS system (simulated sales data)
- Mock AI analysis (pre-generated reports)

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: keg-tracker
   - Database Password: (save this securely)
   - Region: (choose closest to your users)

### 2. Apply Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy entire contents and paste into SQL Editor
4. Click "Run" to execute

This creates:
- All tables (breweries, user_roles, kegs, etc.)
- Row Level Security policies
- Database functions and triggers

### 3. Get API Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` public key

### 4. Update Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Create Test Users

In Supabase dashboard:

1. Go to Authentication → Users
2. Click "Add User"
3. Create users for each role:
   - brewer@test.com (password: test123)
   - driver@test.com (password: test123)
   - manager@test.com (password: test123)

4. Insert corresponding user_roles records in SQL Editor:

```sql
-- Create test brewery
INSERT INTO breweries (name) VALUES ('Test Brewery');

-- Get brewery ID
SELECT id FROM breweries WHERE name = 'Test Brewery';

-- Create user roles (replace user_id and brewery_id with actual UUIDs)
INSERT INTO user_roles (user_id, role, brewery_id) VALUES
  ('brewer-user-id', 'BREWER', 'brewery-id'),
  ('driver-user-id', 'DRIVER', 'brewery-id'),
  ('manager-user-id', 'RESTAURANT_MANAGER', NULL);
```

## Thirdweb Setup

### 1. Create Thirdweb Account

1. Go to [thirdweb.com](https://thirdweb.com)
2. Sign up/sign in
3. Go to Dashboard

### 2. Deploy Base Native Token

1. Click "Deploy New Contract"
2. Select "NFT Collection" (ERC-721)
3. Configure:
   - Name: Keg Tracker Tokens
   - Symbol: KEG
   - Network: Base (or Base Testnet for testing)
4. Deploy contract
5. Copy contract address

### 3. Get Client ID

1. Go to Settings → API Keys
2. Create new API key
3. Copy Client ID

### 4. Update Environment Variables

```env
THIRDWEB_CLIENT_ID=your-client-id
KEG_CONTRACT_ADDRESS=0x...your-contract-address
USE_LIVE_BLOCKCHAIN=true
```

### 5. Configure Metadata

In Thirdweb dashboard:
1. Go to your deployed contract
2. Configure metadata schema to include:
   - name (string)
   - type (string)
   - abv (number)
   - ibu (number)
   - brew_date (string)
   - keg_size (string)
   - brewery_id (string)

## Google Gemini AI Setup

### 1. Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 2. Update Environment Variables

```env
GEMINI_API_KEY=your-gemini-api-key
USE_LIVE_GEMINI=true
```

### 3. Test Integration

The AI will now generate real variance analysis reports instead of using mock data.

## POS System Integration

### Revel POS

1. Get API credentials from Revel account
2. Update `.env.local`:

```env
POS_SYSTEM=revel
USE_LIVE_POS=true
POS_API_KEY=your-revel-api-key
POS_API_SECRET=your-revel-secret
POS_BASE_URL=https://your-domain.revelup.com
```

### Square POS

1. Go to Square Developer Portal
2. Create new application
3. Get Access Token
4. Update `.env.local`:

```env
POS_SYSTEM=square
USE_LIVE_POS=true
POS_API_KEY=your-square-access-token
POS_MERCHANT_ID=your-merchant-id
```

### Toast POS

1. Contact Toast support for API access
2. Get API credentials
3. Update `.env.local`:

```env
POS_SYSTEM=toast
USE_LIVE_POS=true
POS_API_KEY=your-toast-api-key
POS_BASE_URL=https://api.toasttab.com
POS_MERCHANT_ID=your-restaurant-id
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: (leave default)

3. **Add Environment Variables**

   In Vercel project settings → Environment Variables, add all variables from `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   THIRDWEB_CLIENT_ID
   KEG_CONTRACT_ADDRESS
   GEMINI_API_KEY
   USE_LIVE_BLOCKCHAIN
   USE_LIVE_POS
   USE_LIVE_GEMINI
   POS_SYSTEM
   POS_API_KEY
   POS_API_SECRET
   POS_BASE_URL
   POS_MERCHANT_ID
   ```

4. **Deploy**

   Click "Deploy" - Vercel will build and deploy your app.

5. **Set Custom Domain (Optional)**

   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

### Alternative: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t keg-tracker .
docker run -p 3000:3000 --env-file .env.local keg-tracker
```

## Troubleshooting

### Supabase Connection Issues

- Verify project URL and anon key are correct
- Check if project is active (not paused)
- Verify RLS policies are applied

### Thirdweb Errors

- Ensure correct network (Base vs Base Testnet)
- Verify client ID and contract address
- Check wallet has sufficient funds for gas

### POS Integration Failures

- Verify API credentials are current
- Check rate limits
- Ensure webhook URLs are configured

### Camera/QR Scanner Not Working

- Check browser permissions
- Use HTTPS (required for camera access)
- Test on different devices

## Feature Flags Reference

Switch between mock and live implementations:

| Flag | Default | Live Mode |
|------|---------|-----------|
| `USE_LIVE_BLOCKCHAIN` | false | true |
| `USE_LIVE_POS` | false | true |
| `USE_LIVE_GEMINI` | false | true |

## Next Steps

After setup:

1. Create test data using seed script (coming soon)
2. Test all workflows with each role
3. Configure POS webhook endpoints
4. Set up monitoring and alerts
5. Train users on mobile QR scanning

## Support

For setup issues:
- Check GitHub Issues
- Review logs in Vercel/deployment platform
- Contact development team

## Security Checklist

Before going to production:

- [ ] All environment variables are set
- [ ] Supabase RLS policies are enabled
- [ ] API rate limiting is configured
- [ ] HTTPS is enforced
- [ ] User authentication is working
- [ ] Database backups are configured
- [ ] Error logging is set up
- [ ] Mobile camera permissions tested

