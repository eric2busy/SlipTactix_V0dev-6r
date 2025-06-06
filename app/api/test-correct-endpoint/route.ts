import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  try {
    console.log("🧪 Testing Sports Games Odds API with correct /sports/ endpoint...")

    // Test the connection with correct endpoint
    const connectionTest = await sportsGamesOddsClient.testConnection()

    if (connectionTest.success) {
      // If connection works, try to get some actual data
      const diagnosis = await sportsGamesOddsClient.diagnoseAPI()

      // Try to get sports data
      const sports = await sportsGamesOddsClient.getSports()
      const nbaLeagues = await sportsGamesOddsClient.getNBALeagues()
      const nbaEvents = await sportsGamesOddsClient.getNBAEvents({ limit: 5 })
      const nbaTeams = await sportsGamesOddsClient.getNBATeams()

      return NextResponse.json({
        success: true,
        message: connectionTest.message,
        apiVersion: connectionTest.version,
        endpoint: connectionTest.endpoint,
        workingEndpoints: diagnosis.workingEndpoints.length,
        data: {
          sports: {
            count: sports.length,
            sample: sports.slice(0, 2),
          },
          nbaLeagues: {
            count: nbaLeagues.length,
            sample: nbaLeagues.slice(0, 2),
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
        endpoints: diagnosis.endpoints,
        recommendations: diagnosis.recommendations,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Sports Games Odds API connection failed",
        error: connectionTest.error,
        triedEndpoints: connectionTest.triedEndpoints,
        recommendations: [
          "🔑 Your API key appears to be invalid",
          "🔑 Get a new API key from sportsgameodds.com",
          "📝 Update SPORTS_API_KEY in your .env.local file",
          "🔄 Restart your development server after updating",
          "🌐 Verify the correct endpoint: https://api.sportsgameodds.com/v2/sports/",
        ],
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to test Sports Games Odds API with correct endpoint",
      error: error.message,
      endpoint: "https://api.sportsgameodds.com/v2/sports/",
    })
  }
}
