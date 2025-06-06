# 🔐 Secure API Key Setup Guide

## Important Security Notice
API keys should NEVER be included directly in code or committed to version control.

## Step 1: Test Your New API Key Securely

Use the secure test endpoint to verify your key works:

\`\`\`bash
curl -X POST http://localhost:3000/api/update-grok-key \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-new-api-key-here",
    "testOnly": true
  }'
\`\`\`

## Step 2: Add to Environment Variables

If the test passes, add to your `.env.local` file:

\`\`\`env
GROK_API_KEY=your-new-api-key-here
\`\`\`

## Step 3: Restart Development Server

\`\`\`bash
npm run dev
\`\`\`

## Step 4: Verify Integration

Check the status:
\`\`\`bash
curl http://localhost:3000/api/grok-status
\`\`\`

## Security Best Practices

✅ **DO:**
- Store keys in environment variables
- Use `.env.local` for local development
- Add `.env*` to `.gitignore`
- Test keys before deploying

❌ **DON'T:**
- Include keys in code
- Commit keys to git
- Share keys in chat/logs
- Use keys in client-side code

## Troubleshooting

- **403 Blocked**: Key was exposed, get a new one
- **401 Unauthorized**: Check key format and validity
- **429 Rate Limited**: Wait and retry
- **No Key Found**: Check environment variable name
