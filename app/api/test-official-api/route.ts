import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  try {
    console.log("🧪 Testing Sports Games Odds API with official documentation...")

    // Test the connection
    const connectionTest = await sportsGamesOddsClient.testConnection()

    if (connectionTest.success) {
      // If connection works, try to get some actual data
      const diagnosis = await sportsGamesOddsClient.diagnoseAPI()

      // Try to get sports data
      const sports = await sportsGamesOddsClient.getSports()
      const leagues = await sportsGamesOddsClient.getLeagues("BASKETBALL")
      const nbaEvents = await sportsGamesOddsClient.getNBAEvents({ limit: 5 })
      const nbaTeams = await sportsGamesOddsClient.getNBATeams()

      return NextResponse.json({
        success: true,
        message: "✅ Sports Games Odds API is working with official documentation!",
        apiUrl: "https://api.sportsgameodds.com/v1",
        workingEndpoints: diagnosis.workingEndpoints.length,
        data: {
          sports: {
            count: sports.length,
            sample: sports.slice(0, 2),
          },
          leagues: {
            count: leagues.length,
            sample: leagues.slice(0, 2),
          },
          nbaEvents: {
            count: nbaEvents.length,
            sample: nbaEvents.slice(0, 2),
          },
          nbaTeams: {
            count: nbaTeams.length,
            sample: nbaTeams.slice(0, 2),
          },
        },
        recommendations: diagnosis.recommendations,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "❌ Sports Games Odds API connection failed",
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
      message: "Failed to test Sports Games Odds API",
      error: error.message,
    })
  }
}
