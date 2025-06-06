/**
 * Comprehensive Sports Games Odds API Test
 * Tests all endpoints and data sources used in the app
 */

import { NextResponse } from "next/server"
import { sportsDataClient } from "@/lib/sports-data-client"

export async function GET() {
  try {
    console.log("🧪 Testing Sports Games Odds API - Full Integration Test")

    const testResults = {
      apiConnection: false,
      teamLookup: false,
      recentGames: false,
      playerStats: false,
      liveGames: false,
      errors: [] as string[],
      data: {} as any,
    }

    // Test 1: API Connection
    try {
      console.log("🔌 Testing API connection...")
      const response = await fetch("https://api.sportsgamesodds.com/v1/teams/nba", {
        headers: {
          Authorization: `Bearer ${process.env.SPORTS_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        testResults.apiConnection = true
        const data = await response.json()
        testResults.data.teams = data.data?.slice(0, 5) || [] // First 5 teams
        console.log("✅ API connection successful")
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      testResults.errors.push(`API Connection: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("❌ API connection failed:", error)
    }

    // Test 2: Team Lookup
    try {
      console.log("🏀 Testing team lookup...")
      const lakersTeam = await sportsDataClient.getTeamByName("Lakers")
      if (lakersTeam) {
        testResults.teamLookup = true
        testResults.data.lakersTeam = lakersTeam
        console.log("✅ Team lookup successful:", lakersTeam)
      } else {
        throw new Error("Lakers team not found")
      }
    } catch (error) {
      testResults.errors.push(`Team Lookup: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("❌ Team lookup failed:", error)
    }

    // Test 3: Recent Games
    try {
      console.log("📊 Testing recent games...")
      const recentGames = await sportsDataClient.getTeamRecentGames("Lakers", 3)
      if (recentGames && recentGames.length > 0) {
        testResults.recentGames = true
        testResults.data.recentGames = recentGames
        console.log("✅ Recent games successful:", recentGames.length, "games found")
      } else {
        throw new Error("No recent games found")
      }
    } catch (error) {
      testResults.errors.push(`Recent Games: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("❌ Recent games failed:", error)
    }

    // Test 4: Player Stats
    if (testResults.data.recentGames && testResults.data.recentGames.length > 0) {
      try {
        console.log("👤 Testing player stats...")
        const gameId = testResults.data.recentGames[0].gameId
        const playerStats = await sportsDataClient.getGamePlayerStats(gameId)
        if (playerStats && playerStats.length > 0) {
          testResults.playerStats = true
          testResults.data.playerStats = playerStats.slice(0, 5) // First 5 players
          console.log("✅ Player stats successful:", playerStats.length, "players found")
        } else {
          throw new Error("No player stats found")
        }
      } catch (error) {
        testResults.errors.push(`Player Stats: ${error instanceof Error ? error.message : "Unknown error"}`)
        console.error("❌ Player stats failed:", error)
      }
    }

    // Test 5: Live Games
    try {
      console.log("🔴 Testing live games...")
      const liveGames = await sportsDataClient.getLiveGames()
      testResults.liveGames = true
      testResults.data.liveGames = liveGames.slice(0, 3) // First 3 games
      console.log("✅ Live games successful:", liveGames.length, "games found")
    } catch (error) {
      testResults.errors.push(`Live Games: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("❌ Live games failed:", error)
    }

    // Calculate overall success
    const successCount = [
      testResults.apiConnection,
      testResults.teamLookup,
      testResults.recentGames,
      testResults.playerStats,
      testResults.liveGames,
    ].filter(Boolean).length

    const overallSuccess = successCount >= 3 // At least 3 out of 5 tests should pass

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? "Sports Games Odds API is working correctly!" : "Sports Games Odds API has some issues",
      testResults,
      summary: {
        testsRun: 5,
        testsPassed: successCount,
        testsFailedCount: testResults.errors.length,
        apiKeyStatus: process.env.SPORTS_API_KEY ? "Present" : "Missing",
        recommendedActions: overallSuccess
          ? ["API is working well", "All app components can use real data"]
          : [
              "Check API key validity",
              "Verify Sports Games Odds API plan",
              "Check API endpoint documentation",
              "Consider contacting Sports Games Odds support",
            ],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Critical error in Sports API test:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Critical error testing Sports Games Odds API",
        message: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: {
          checkApiKey: "Verify SPORTS_API_KEY environment variable",
          checkNetwork: "Ensure network connectivity to api.sportsgamesodds.com",
          checkPlan: "Verify your Sports Games Odds API plan includes NBA data",
          checkDocumentation: "Review Sports Games Odds API documentation",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
