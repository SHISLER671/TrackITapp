# Quick Start Guide - Beer Keg Tracker

Get up and running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- Basic terminal knowledge

## Installation

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

This installs all required packages including Next.js, Supabase, Tailwind CSS, and more.

### 2. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🎯 What's Working Out of the Box

The app runs in **mock mode** by default - no external services needed!

### ✅ Features Available Immediately

- **User Interface**: All pages and dashboards
- **QR Code Generation**: Create and download keg QR codes
- **QR Scanner**: Scan kegs (requires camera permission)
- **Mock Blockchain**: Simulated token minting/burning
- **Mock POS**: Simulated sales tracking
- **Mock AI**: Pre-generated variance analysis

### 🧪 Test It Out

1. Navigate to create new keg: http://localhost:3000/kegs/new
2. Fill in the form and create a keg
3. Download the generated QR code
4. Go to scan page: http://localhost:3000/scan
5. Scan the QR code with your phone/webcam

## 📱 Mobile Testing

To test on mobile devices:

1. Find your local IP: `ifconfig | grep inet`
2. Start dev server: `npm run dev`
3. On mobile, visit: `http://YOUR_IP:3000`
4. Allow camera permissions for QR scanning

## 🔐 Authentication

Currently using Supabase Auth (mock mode). To add real authentication:

1. See [SETUP.md](./SETUP.md) for Supabase configuration
2. Create test users in Supabase dashboard
3. Update `.env.local` with credentials

## 🎭 User Roles

The app supports three roles:

### 👨‍🍳 Brewer
- Create new kegs
- View all brewery kegs
- Access variance reports
- Dashboard: `/dashboard/brewer`

### 🚚 Driver  
- Scan kegs during delivery
- View assigned kegs
- Track route progress
- Dashboard: `/dashboard/driver`

### 👔 Restaurant Manager
- Scan kegs on premises
- Retire empty kegs
- View variance reports
- Dashboard: `/dashboard/restaurant`

## 🗂 Key Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Redirects to role dashboard |
| Login | `/auth/login` | Authentication |
| Brewer Dashboard | `/dashboard/brewer` | Manage all kegs |
| Driver Dashboard | `/dashboard/driver` | Delivery tracking |
| Restaurant Dashboard | `/dashboard/restaurant` | On-premise management |
| New Keg | `/kegs/new` | Create keg + QR code |
| Scan | `/scan` | QR scanner |

## 🎨 Customization

### Change Keg Sizes

Edit `lib/constants.ts`:

\`\`\`typescript
export const KEG_SIZES = [
  { size: '1/6BBL', expected_pints: 41, ... },
  // Add your custom sizes here
];
\`\`\`

### Add Beer Styles

Edit `lib/constants.ts`:

\`\`\`typescript
export const BEER_STYLES = [
  'IPA',
  'Your Custom Style',
  // ...
];
\`\`\`

## 🐛 Troubleshooting

### Camera not working?
- Ensure you're using HTTPS or localhost
- Check browser permissions
- Try different browser

### QR scanner not detecting?
- Hold QR code steady
- Ensure good lighting
- Fill 60% of screen frame

### App not loading?
- Check Node.js version: `node --version` (need 18+)
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

## 📚 Next Steps

### For Development
1. Explore the codebase in `/app`, `/components`, `/lib`
2. Modify UI components in `/components`
3. Add API routes in `/app/api`
4. Review type definitions in `/lib/types.ts`

### For Production
1. Set up Supabase (see [SETUP.md](./SETUP.md))
2. Run database migration
3. Create test users
4. Deploy to Vercel
5. Configure environment variables

### For Live Services
Enable real integrations by updating `.env.local`:

\`\`\`env
# Enable live blockchain
USE_LIVE_BLOCKCHAIN=true
THIRDWEB_CLIENT_ID=your_client_id
KEG_CONTRACT_ADDRESS=0x...

# Enable live POS
USE_LIVE_POS=true
POS_SYSTEM=revel  # or square, toast
POS_API_KEY=your_key

# Enable live AI
USE_LIVE_GEMINI=true
GEMINI_API_KEY=your_key
\`\`\`

See [SETUP.md](./SETUP.md) for detailed instructions on each service.

## 🎓 Learning Resources

- **Next.js 14**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Thirdweb**: https://portal.thirdweb.com

## 💡 Tips

1. **Mock mode is perfect for development** - no need to set up external services
2. **Mobile-first** - test on mobile early and often
3. **Type safety** - TypeScript will catch errors before runtime
4. **Component library** - reuse components in `/components`
5. **Environment variables** - never commit real API keys

## 🚢 Ready to Deploy?

When you're ready for production:

\`\`\`bash
npm run build    # Test production build
npm start        # Run production locally
\`\`\`

Then deploy to Vercel (see [SETUP.md](./SETUP.md) for details).

## 🎉 You're All Set!

Start exploring the app at http://localhost:3000

Need help? Check out:
- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's been built

Happy brewing! 🍺
