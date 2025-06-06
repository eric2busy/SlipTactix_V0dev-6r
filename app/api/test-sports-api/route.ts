/**
 * Test endpoint for Sports Games Odds API
 */

import { NextResponse } from "next/server"
import { sportsDataClient } from "@/lib/sports-data-client"

export async function GET() {
  try {
    console.log("🧪 Testing Sports Games Odds API connection...")

    // Test 1: Get Lakers team info
    const lakersTeam = await sportsDataClient.getTeamByName("Lakers")
    console.log("Lakers team data:", lakersTeam)

    // Test 2: Get recent Lakers games
    let recentGames = []
    if (lakersTeam) {
      recentGames = await sportsDataClient.getTeamRecentGames("Lakers", 3)
      console.log("Recent Lakers games:", recentGames)
    }

    // Test 3: Get player stats for most recent game
    let playerStats = []
    if (recentGames.length > 0) {
      playerStats = await sportsDataClient.getGamePlayerStats(recentGames[0].gameId)
      console.log("Player stats for last game:", playerStats)
    }

    return NextResponse.json({
      success: true,
      message: "Sports Games Odds API test completed",
      results: {
        team_lookup: {
          success: !!lakersTeam,
          data: lakersTeam,
        },
        recent_games: {
          success: recentGames.length > 0,
          count: recentGames.length,
          data: recentGames,
        },
        player_stats: {
          success: playerStats.length > 0,
          count: playerStats.length,
          data: playerStats.slice(0, 5), // Show first 5 players
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Sports Games Odds API test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Sports Games Odds API test failed",
        troubleshooting: {
          check_api_key: "Verify SPORTS_API_KEY is set correctly",
          check_permissions: "Ensure API key has access to NBA data",
          check_rate_limits: "Verify you haven't exceeded rate limits",
          api_documentation: "Check Sports Games Odds API documentation for endpoint changes",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
