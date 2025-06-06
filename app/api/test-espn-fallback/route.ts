import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  try {
    console.log("🧪 Testing ESPN fallback system...")

    // Test the diagnosis first
    const diagnosis = await sportsGamesOddsClient.diagnoseAPI()

    // Get NBA games using the client (will use ESPN fallback if needed)
    const games = await sportsGamesOddsClient.getNBAEvents()

    // Get NBA teams using the client (will use ESPN fallback if needed)
    const teams = await sportsGamesOddsClient.getNBATeams()

    // Get prop bets (will use ESPN fallback if needed)
    const props = await sportsGamesOddsClient.getPrizePicksData()

    return NextResponse.json({
      success: true,
      message: "ESPN fallback system test complete",
      diagnosis: {
        sportsApiWorking: diagnosis.workingEndpoints.length > 0,
        espnFallbackWorking: diagnosis.espnEndpoints.length > 0,
        recommendations: diagnosis.recommendations,
      },
      results: {
        games: {
          count: games.length,
          sample: games.slice(0, 2),
        },
        teams: {
          count: teams.length,
          sample: teams.slice(0, 2),
        },
        props: {
          count: props.length,
          sample: props.slice(0, 2),
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "ESPN fallback test failed",
      error: error.message,
    })
  }
}
