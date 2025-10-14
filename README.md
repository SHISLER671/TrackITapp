# Beer Keg Tracker

A blockchain-verified keg tracking system that eliminates human error in brewery keg management by connecting physical kegs to immutable digital records via QR codes.

## 🎯 Overview

The Beer Keg Tracker reduces keg loss from the industry average of 18% to under 5% by providing real-time visibility into keg locations and status, with automatic reconciliation between physical kegs and POS pint sales data.

## ✨ Key Features

- **QR Code Tracking**: Each keg gets a unique QR code linked to blockchain records
- **Real-time Monitoring**: Track keg location, status, and fill levels
- **POS Integration**: Automatic sync with Revel, Square, and Toast POS systems
- **Variance Analysis**: AI-powered investigation reports for discrepancies
- **Role-based Access**: Separate dashboards for brewers, drivers, and restaurant managers
- **Mobile-first Design**: Optimized for scanning and tracking on mobile devices

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Blockchain**: Thirdweb Base Native Tokens (mock mode by default)
- **AI**: Google Gemini Flash (mock mode by default)
- **QR Codes**: qrcode + @yudiel/react-qr-scanner

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for production)
- Thirdweb account (for live blockchain integration)
- Google AI API key (for live AI analysis)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd keg-tracker
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

The default configuration uses mock implementations for all services, allowing you to run and test the app immediately.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Detailed Setup

For detailed instructions on setting up Supabase, Thirdweb, and other services, see [SETUP.md](./SETUP.md).

## 🏗 Architecture

The application uses a three-tier architecture:

1. **Presentation Layer**: Role-specific user interfaces
2. **Application Layer**: API routes with business logic
3. **Data Layer**: Supabase database + blockchain records

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 👥 User Roles

### Brewer
- Create new kegs with QR codes
- View all brewery kegs
- Access variance reports
- Manage brewery information

### Driver
- Scan kegs during delivery
- View assigned route kegs
- Track delivery progress

### Restaurant Manager
- Scan kegs on premises
- Install kegs on taps
- Retire empty kegs
- View variance reports for their location

## 📱 Key Workflows

### Creating a Keg (Brewer)
1. Navigate to "New Keg"
2. Enter beer details (name, style, ABV, IBU, brew date, keg size)
3. System generates QR code
4. Print and attach to physical keg

### Scanning a Keg (All Roles)
1. Open app and select "Scan QR"
2. Point camera at keg QR code
3. System updates location and timestamp
4. View keg details and status

### Retiring a Keg (Restaurant Manager)
1. Scan empty keg
2. System fetches POS sales data
3. Calculates variance (expected vs actual pints)
4. If variance detected, triggers AI analysis
5. Keg marked as retired

## 🔄 Feature Flags

The app supports mock and live modes for external services:

- `USE_LIVE_BLOCKCHAIN`: Switch between mock and real Thirdweb integration
- `USE_LIVE_POS`: Switch between mock and real POS systems
- `USE_LIVE_GEMINI`: Switch between mock and real AI analysis

## 🧪 Mock Data

The app includes comprehensive mock implementations that simulate:
- Blockchain token minting and burning
- POS system pint sales tracking
- AI variance analysis reports

This allows full testing without external service dependencies.

## 📊 Keg Sizes Reference

| Size | Name | Expected Pints | Use Case |
|------|------|----------------|----------|
| 1/6BBL | Sixth Barrel | 41 | Most common for craft beer |
| 1/4BBL | Quarter Barrel | 74 | Common for distribution |
| 1/2BBL | Half Barrel | 124 | Standard US keg |
| Pony | Pony Keg | 53 | Small venues |
| Cornelius | Corny Keg | 37 | Homebrew/small batch |

## 🔍 Variance Thresholds

- **Normal**: ≤ 3 pints variance (foam waste, measurement variations)
- **Warning**: 4-8 pints variance (requires attention)
- **Critical**: > 8 pints variance (requires investigation)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## 🧑‍💻 Development Scripts

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security

- Row Level Security (RLS) on all database tables
- API route authentication and authorization
- No blockchain terminology exposed to end users
- Rate limiting on all endpoints

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For issues and questions, please contact the development team.

## 🙏 Acknowledgments

Built with modern web technologies to solve real brewery operational challenges.
