# Free External Cron Setup for SlipTactix

Since Vercel Hobby plan limits cron jobs to once daily, we'll use free external services for frequent data updates.

## 🎯 **Recommended: Cron-Job.org (Free)**

### Setup Steps:
1. **Sign up** at [cron-job.org](https://cron-job.org)
2. **Create a new cron job** with these settings:
   - **URL**: `https://your-app.vercel.app/api/external-sync`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Method**: GET
   - **Enabled**: Yes

### Optional Security:
Add a token parameter for basic security:
- **URL**: `https://your-app.vercel.app/api/external-sync?token=your-secret-token`
- **Environment Variable**: Add `SYNC_TOKEN=your-secret-token` in Vercel

## 🔄 **Alternative: UptimeRobot (Free)**

### Setup Steps:
1. **Sign up** at [uptimerobot.com](https://uptimerobot.com)
2. **Add New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-app.vercel.app/api/external-sync`
   - **Monitoring Interval**: 5 minutes
   - **Monitor Timeout**: 30 seconds

## ⚡ **Alternative: EasyCron (Free Tier)**

### Setup Steps:
1. **Sign up** at [easycron.com](https://www.easycron.com)
2. **Create Cron Job**:
   - **URL**: `https://your-app.vercel.app/api/external-sync`
   - **Cron Expression**: `*/5 * * * *`
   - **HTTP Method**: GET

## 🛠 **How It Works**

1. **External service** calls your `/api/external-sync` endpoint every 5 minutes
2. **Quick sync** runs (under 10 seconds to stay within Hobby limits)
3. **Critical data** (props, games) gets updated frequently
4. **Daily cron** (`/api/daily-scheduler`) handles full sync once per day

## 📊 **Monitoring**

Check your sync status:
- **Manual trigger**: Visit `https://your-app.vercel.app/api/external-sync`
- **Logs**: Check Vercel function logs for sync activity
- **Data freshness**: App shows last update time

## 🔧 **Troubleshooting**

### If external sync fails:
1. **Check endpoint**: Visit the URL manually
2. **Verify token**: Ensure SYNC_TOKEN matches (if using)
3. **Check logs**: Review Vercel function logs
4. **Fallback**: App still works with cached data

### Rate limiting:
- External services may have limits on free tiers
- Monitor usage and upgrade if needed
- Consider rotating between multiple services

## 💡 **Benefits**

- ✅ **Free** - No Vercel Pro plan needed
- ✅ **Reliable** - Multiple service options
- ✅ **Fast** - Quick sync under 10 seconds
- ✅ **Secure** - Optional token authentication
- ✅ **Scalable** - Easy to adjust frequency

## 🚀 **Next Steps**

1. **Deploy SlipTactix** to Vercel
2. **Get your deployment URL**
3. **Set up external cron** with one of the services above
4. **Test the sync** by visiting the endpoint manually
5. **Monitor** the logs to ensure it's working

Your app will now have real-time data updates every 5 minutes without paying for Vercel Pro!
