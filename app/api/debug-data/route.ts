import { NextResponse } from "next/server"
import { sportsAPI } from "@/lib/sports-api"
import { prizePicksScraper } from "@/lib/prizepicks-scraper"
import { dataSyncService } from "@/lib/data-sync"

export async function GET() {
  try {
    console.log("🔍 Debugging data sources...")

    // Test each data source directly
    const [gamesTest, propsTest, injuriesTest, newsTest] = await Promise.allSettled([
      sportsAPI.getLiveGames(),
      prizePicksScraper.getActiveProps("NBA"),
      sportsAPI.getInjuryReport(),
      sportsAPI.getNews(),
    ])

    // Test database queries
    const [dbProps, dbGames, dbInjuries, dbNews] = await Promise.allSettled([
      dataSyncService.getLatestProps("NBA"),
      dataSyncService.getLatestGames("NBA"),
      dataSyncService.getLatestInjuries("NBA"),
      dataSyncService.getLatestNews("NBA"),
    ])

    const debugInfo = {
      timestamp: new Date().toISOString(),
      apiTests: {
        games: {
          status: gamesTest.status,
          count: gamesTest.status === "fulfilled" ? gamesTest.value.length : 0,
          sample: gamesTest.status === "fulfilled" ? gamesTest.value[0] : null,
          error: gamesTest.status === "rejected" ? gamesTest.reason.message : null,
        },
        props: {
          status: propsTest.status,
          count: propsTest.status === "fulfilled" ? propsTest.value.length : 0,
          sample: propsTest.status === "fulfilled" ? propsTest.value[0] : null,
          error: propsTest.status === "rejected" ? propsTest.reason.message : null,
        },
        injuries: {
          status: injuriesTest.status,
          count: injuriesTest.status === "fulfilled" ? injuriesTest.value.length : 0,
          error: injuriesTest.status === "rejected" ? injuriesTest.reason.message : null,
        },
        news: {
          status: newsTest.status,
          count: newsTest.status === "fulfilled" ? newsTest.value.length : 0,
          error: newsTest.status === "rejected" ? newsTest.reason.message : null,
        },
      },
      database: {
        props: {
          status: dbProps.status,
          count: dbProps.status === "fulfilled" ? dbProps.value.length : 0,
          sample: dbProps.status === "fulfilled" ? dbProps.value[0] : null,
        },
        games: {
          status: dbGames.status,
          count: dbGames.status === "fulfilled" ? dbGames.value.length : 0,
          sample: dbGames.status === "fulfilled" ? dbGames.value[0] : null,
        },
        injuries: {
          status: dbInjuries.status,
          count: dbInjuries.status === "fulfilled" ? dbInjuries.value.length : 0,
        },
        news: {
          status: dbNews.status,
          count: dbNews.status === "fulfilled" ? dbNews.value.length : 0,
        },
      },
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
