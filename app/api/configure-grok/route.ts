/**
 * Configuration Helper Endpoint
 * Helps users set up their Grok API key properly
 */

import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const hasGrokKey = !!(process.env.GROK_API_KEY || process.env.XAI_API_KEY)
  const hasSportsKey = !!process.env.SPORTS_API_KEY

  return NextResponse.json({
    status: "Configuration Helper",
    grokApiKey: {
      configured: hasGrokKey,
      envVar: hasGrokKey ? "✅ Found" : "❌ Missing",
      instructions: hasGrokKey ? "Grok API key is properly configured!" : "Add GROK_API_KEY to your .env.local file",
    },
    sportsApiKey: {
      configured: hasSportsKey,
      envVar: hasSportsKey ? "✅ Found" : "❌ Missing",
      instructions: hasSportsKey
        ? "Sports API key is properly configured!"
        : "Add SPORTS_API_KEY to your .env.local file",
    },
    nextSteps:
      hasGrokKey && hasSportsKey
        ? ["✅ All configured! Your app is ready to use."]
        : [
            "1. Create/edit .env.local file in your project root",
            "2. Add your API keys (see example below)",
            "3. Restart your development server with 'npm run dev'",
            "4. Test the configuration",
          ],
    envFileExample: {
      filename: ".env.local",
      content: `# Grok API Configuration
GROK_API_KEY=xai-BJxM2fDN4o31T73ZWdrwhhNdZ35mNKhi5XIQ1XPKgeXFcih8qSaQbQ6002d8ppyo1hxI9OPcGrzp8pWn

# Sports API Configuration  
SPORTS_API_KEY=your_sportsgamesodds_api_key_here`,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "test") {
      // Test current configuration
      const hasGrokKey = !!(process.env.GROK_API_KEY || process.env.XAI_API_KEY)
      const hasSportsKey = !!process.env.SPORTS_API_KEY

      if (!hasGrokKey) {
        return NextResponse.json({
          success: false,
          message: "Grok API key not found in environment variables",
          instructions: "Add GROK_API_KEY to your .env.local file",
        })
      }

      // Test Grok API
      try {
        const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${grokKey}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: "Test message - just say 'Configuration test successful'",
              },
            ],
            model: "grok-3-latest",
            stream: false,
            temperature: 0,
            max_tokens: 10,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            message: "✅ Configuration test successful!",
            grokResponse: data.choices[0].message.content,
            sportsApiConfigured: hasSportsKey,
            readyToUse: true,
          })
        } else {
          const errorText = await response.text()
          return NextResponse.json({
            success: false,
            message: "Grok API test failed",
            error: `${response.status}: ${errorText}`,
            instructions: "Check your API key and try again",
          })
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "Failed to test Grok API",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
