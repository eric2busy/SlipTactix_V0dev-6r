# Production Deployment Guide

## 1. Environment Setup

### Required Environment Variables
\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mncxxmvrmuhzzagxdwmv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Grok API
NEXT_PUBLIC_GROK_API_URL=https://api.x.ai/v1/chat/completions
NEXT_PUBLIC_GROK_API_KEY=xai-9UF1AE4GLQmMlwSGhBZ7Nt71LB7ZyznIEtSWDzdGHMBizc7m0inMvbbuzLPUqc4mga8w3EIwyFpEoyRu

# App Configuration
NEXT_PUBLIC_SITE_URL=https://your-app-domain.com
NEXTAUTH_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
\`\`\`

## 2. Database Setup

### Run Supabase Schema
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`
4. Verify all tables are created

## 3. Build and Deploy

### For Web (Vercel)
\`\`\`bash
npm run build
\`\`\`

### For iOS (TestFlight)
\`\`\`bash
# 1. Build the web app
npm run export

# 2. Sync with Capacitor
npx cap sync

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
# - Set Bundle ID: io.sliptactix.app
# - Configure signing
# - Archive and upload to TestFlight
\`\`\`

### For Android
\`\`\`bash
# 1. Build the web app
npm run export

# 2. Sync with Capacitor
npx cap sync

# 3. Open in Android Studio
npx cap open android

# 4. Build APK/AAB for Play Store
\`\`\`

## 4. Data Synchronization

### Automatic Sync (Recommended)
Set up a cron job or Vercel cron to run data sync every 5 minutes:

\`\`\`bash
# Add to vercel.json
{
  "crons": [
    {
      "path": "/api/sync-data",
      "schedule": "*/5 * * * *"
    }
  ]
}
\`\`\`

### Manual Sync
\`\`\`bash
npm run sync-data
\`\`\`

## 5. Testing Checklist

- [ ] Chat functionality works
- [ ] Live games data loads
- [ ] Player stats display correctly
- [ ] Favorites save/load
- [ ] News and injury reports update
- [ ] Mobile responsiveness
- [ ] iOS app builds successfully
- [ ] TestFlight upload works

## 6. Launch Steps

1. **Deploy to Vercel**
   - Connect GitHub repo
   - Add environment variables
   - Deploy

2. **Set up Supabase**
   - Run database schema
   - Configure RLS policies
   - Test API connections

3. **Build iOS App**
   - Run `npm run ios:build`
   - Configure in Xcode
   - Upload to TestFlight

4. **Test Everything**
   - Web app functionality
   - iOS app functionality
   - Data synchronization
   - API integrations

5. **Go Live**
   - Submit to TestFlight
   - Invite beta testers
   - Monitor for issues
   - Iterate based on feedback

## 7. Monitoring

- Set up error tracking (Sentry)
- Monitor API usage
- Track user engagement
- Monitor data sync health
