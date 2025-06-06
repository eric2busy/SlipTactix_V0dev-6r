import { type NextRequest, NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting Sports Games Odds API diagnosis...")

    // Check environment variables
    const apiKey = process.env.SPORTS_API_KEY
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : "Not found",
      },
      apiTests: {} as any,
      recommendations: [] as string[],
    }

    if (!apiKey) {
      diagnosis.recommendations.push("❌ SPORTS_API_KEY environment variable is missing")
      diagnosis.recommendations.push("🔑 Get your API key from Sports Games Odds dashboard")
      diagnosis.recommendations.push("📝 Add SPORTS_API_KEY=your_key_here to your .env.local file")

      return NextResponse.json({
        success: false,
        message: "Sports Games Odds API key not configured",
        diagnosis,
      })
    }

    // Test the API
    try {
      console.log("🧪 Testing Sports Games Odds API connection...")
      const apiDiagnosis = await sportsGamesOddsClient.diagnoseAPI()
      diagnosis.apiTests = apiDiagnosis

      if (apiDiagnosis.workingEndpoints.length > 0) {
        diagnosis.recommendations.push("✅ Sports Games Odds API is working correctly!")
        diagnosis.recommendations.push("🎯 You can now access live NBA odds and prop bets")

        return NextResponse.json({
          success: true,
          message: "Sports Games Odds API is working!",
          diagnosis,
        })
      } else {
        diagnosis.recommendations.push("❌ API key appears to be invalid or expired")
        diagnosis.recommendations.push("🔄 Try generating a new API key")
        diagnosis.recommendations.push("📧 Contact Sports Games Odds support if issues persist")
      }
    } catch (error: any) {
      diagnosis.apiTests.error = error.message
      diagnosis.recommendations.push(`❌ API Error: ${error.message}`)

      if (error.message.includes("Invalid API key")) {
        diagnosis.recommendations.push("🔑 Your API key is invalid - get a new one from Sports Games Odds")
        diagnosis.recommendations.push("🌐 Visit: https://sportsgameodds.com/")
      } else if (error.message.includes("rate limit")) {
        diagnosis.recommendations.push("⏱️ Rate limit exceeded - wait before trying again")
      } else if (error.message.includes("forbidden")) {
        diagnosis.recommendations.push("🚫 API access forbidden - check your subscription plan")
      }
    }

    return NextResponse.json({
      success: false,
      message: "Sports Games Odds API issues detected",
      diagnosis,
    })
  } catch (error: any) {
    console.error("❌ Diagnosis failed:", error)

    return NextResponse.json({
      success: false,
      message: "Failed to diagnose Sports Games Odds API",
      error: error.message,
      recommendations: [
        "❌ System error during diagnosis",
        "🔑 Ensure SPORTS_API_KEY is set in environment variables",
        "🌐 Visit Sports Games Odds to get a valid API key",
        "📧 Contact support if issues persist",
      ],
    })
  }
}
