import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API Key Blocked - Security Instructions",
    issue: "Your current Grok API key has been blocked due to a security leak",
    solution: {
      step1: "Visit https://console.x.ai/ to generate a new API key",
      step2: "Update your environment variables with the new key",
      step3: "Restart your application",
      step4: "Never share API keys in code or public repositories",
    },
    currentStatus: "Using enhanced fallback mode with real sports data",
    fallbackFeatures: [
      "Real-time NBA games from ESPN",
      "Live props from PrizePicks",
      "Current injury reports",
      "Breaking news updates",
      "Intelligent text-only responses",
    ],
    securityTips: [
      "Store API keys in environment variables only",
      "Use .env.local for local development",
      "Add .env* to your .gitignore file",
      "Rotate API keys regularly",
      "Monitor API key usage",
    ],
  })
}
