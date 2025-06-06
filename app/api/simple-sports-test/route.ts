/**
 * Simple Sports API Test - No external dependencies
 */

import { NextResponse } from "next/server"
import { sportsDataClient } from "@/lib/sports-data-client"

export async function GET() {
  try {
    console.log("🏀 Testing Sports Games Odds API directly...")

    const results = {
      apiKeyPresent: !!process.env.SPORTS_API_KEY,
      tests: {} as any,
      errors: [] as string[],
    }

    // Test 1: Basic API Connection
    try {
      console.log("Testing basic API connection...")
      const liveGames = await sportsDataClient.getLiveGames()
      results.tests.liveGames = {
        success: true,
        count: liveGames.length,
        sample: liveGames[0] || null,
      }
    } catch (error) {
      results.tests.liveGames = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      results.errors.push(`Live Games: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Test 2: Team Lookup
    try {
      console.log("Testing team lookup...")
      const lakersTeam = await sportsDataClient.getTeamByName("Lakers")
      results.tests.teamLookup = {
        success: !!lakersTeam,
        team: lakersTeam,
      }
    } catch (error) {
      results.tests.teamLookup = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      results.errors.push(`Team Lookup: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Test 3: Recent Games
    try {
      console.log("Testing recent games...")
      const recentGames = await sportsDataClient.getTeamRecentGames("Lakers", 3)
      results.tests.recentGames = {
        success: true,
        count: recentGames.length,
        sample: recentGames[0] || null,
      }
    } catch (error) {
      results.tests.recentGames = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      results.errors.push(`Recent Games: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    const successfulTests = Object.values(results.tests).filter((test: any) => test.success).length
    const totalTests = Object.keys(results.tests).length

    return NextResponse.json({
      success: successfulTests > 0,
      message:
        successfulTests === totalTests
          ? "✅ Sports Games Odds API is working perfectly!"
          : successfulTests > 0
            ? "⚠️ Sports API partially working"
            : "❌ Sports API not working",
      apiStatus: {
        keyPresent: results.apiKeyPresent,
        testsRun: totalTests,
        testsPassed: successfulTests,
        allWorking: successfulTests === totalTests,
      },
      results,
      recommendations:
        successfulTests === 0
          ? [
              "Check your SPORTS_API_KEY in environment variables",
              "Verify your Sports Games Odds API subscription",
              "Check API endpoint URLs",
              "Review console logs for detailed errors",
            ]
          : successfulTests < totalTests
            ? [
                "Some endpoints working - check specific errors",
                "Verify API plan includes all features",
                "Check rate limits",
              ]
            : ["All systems working! Your Sports API is fully functional"],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Error testing Sports API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Sports API",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
