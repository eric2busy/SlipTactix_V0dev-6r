import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Testing external APIs...")

    // Test ESPN NBA API
    const espnTest = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", {
      cache: "no-store",
    })

    // Test Ball Don't Lie API
    const ballTest = await fetch("https://api.balldontlie.io/v1/players?per_page=5", {
      cache: "no-store",
    })

    const results = {
      timestamp: new Date().toISOString(),
      espn: {
        status: espnTest.status,
        ok: espnTest.ok,
        data: espnTest.ok ? await espnTest.json() : null,
      },
      ballDontLie: {
        status: ballTest.status,
        ok: ballTest.ok,
        data: ballTest.ok ? await ballTest.json() : null,
      },
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("API test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
