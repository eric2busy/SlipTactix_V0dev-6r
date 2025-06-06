import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  try {
    console.log("🧪 Testing Sports Games Odds API key...")

    // Test the connection
    const connectionTest = await sportsGamesOddsClient.testConnection()

    if (connectionTest.success) {
      // If connection works, try to get some actual data
      const diagnosis = await sportsGamesOddsClient.diagnoseAPI()

      return NextResponse.json({
        success: true,
        message: connectionTest.message,
        apiVersion: connectionTest.version,
        workingEndpoints: diagnosis.workingEndpoints.length,
        endpoints: diagnosis.endpoints,
        recommendations: diagnosis.recommendations,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Sports Games Odds API key test failed",
        error: connectionTest.error,
        recommendations: [
          "🔑 Your API key appears to be invalid",
          "🔑 Get a new API key from sportsgameodds.com",
          "📝 Update SPORTS_API_KEY in your .env.local file",
          "🔄 Restart your development server after updating",
        ],
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to test Sports Games Odds API key",
      error: error.message,
    })
  }
}
