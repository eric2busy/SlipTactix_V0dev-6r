# 🚀 Quick Setup Guide

## Step 1: Create Environment File

Create a file called `.env.local` in your project root directory (same level as package.json):

\`\`\`env
# Grok API Configuration
GROK_API_KEY=xai-BJxM2fDN4o31T73ZWdrwhhNdZ35mNKhi5XIQ1XPKgeXFcih8qSaQbQ6002d8ppyo1hxI9OPcGrzp8pWn

# Sports API Configuration (if you have one)
SPORTS_API_KEY=your_sportsgamesodds_api_key_here
\`\`\`

## Step 2: Restart Development Server

\`\`\`bash
npm run dev
\`\`\`

## Step 3: Test Configuration

Visit: http://localhost:3000/api/configure-grok

Or test with curl:
\`\`\`bash
curl -X POST http://localhost:3000/api/configure-grok -H "Content-Type: application/json" -d '{"action":"test"}'
\`\`\`

## Step 4: Use the App

Once configured, you can:
- Ask sports questions in the chat
- Get AI-powered analysis
- Enjoy real-time sports data

## Troubleshooting

If you see "API key not found":
1. Make sure `.env.local` is in the project root
2. Restart the development server
3. Check for typos in the environment variable names

## File Structure
\`\`\`
your-project/
├── .env.local          ← Create this file
├── package.json
├── app/
└── components/
