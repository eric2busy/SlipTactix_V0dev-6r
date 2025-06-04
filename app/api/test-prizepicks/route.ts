import { NextResponse } from "next/server"
import { prizePicksScraper } from "@/lib/prizepicks-scraper"

export async function GET() {
  try {
    console.log("🧪 Testing PrizePicks scraping methods...")

    // Test all scraping methods
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
    }

    // Test 1: Get active props
    try {
      console.log("🎯 Testing getActiveProps...")
      const props = await prizePicksScraper.getActiveProps("NBA")
      results.tests.push({
        method: "getActiveProps",
        success: true,
        count: props.length,
        sample: props[0] || null,
        source: props[0]?.source || "unknown",
      })
      console.log(`✅ getActiveProps: ${props.length} props`)
    } catch (error) {
      results.tests.push({
        method: "getActiveProps",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      console.error("❌ getActiveProps failed:", error)
    }

    // Test 2: Get trending props
    try {
      console.log("🎯 Testing getTrendingProps...")
      const trending = await prizePicksScraper.getTrendingProps()
      results.tests.push({
        method: "getTrendingProps",
        success: true,
        count: trending.length,
        sample: trending[0] || null,
      })
      console.log(`✅ getTrendingProps: ${trending.length} props`)
    } catch (error) {
      results.tests.push({
        method: "getTrendingProps",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      console.error("❌ getTrendingProps failed:", error)
    }

    // Test 3: Get player-specific props
    try {
      console.log("🎯 Testing getPlayerProps...")
      const playerProps = await prizePicksScraper.getPlayerProps("LeBron James")
      results.tests.push({
        method: "getPlayerProps",
        success: true,
        count: playerProps.length,
        sample: playerProps[0] || null,
      })
      console.log(`✅ getPlayerProps: ${playerProps.length} props for LeBron`)
    } catch (error) {
      results.tests.push({
        method: "getPlayerProps",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      console.error("❌ getPlayerProps failed:", error)
    }

    // Summary
    const successfulTests = results.tests.filter((test) => test.success).length
    const totalTests = results.tests.length

    console.log(`📊 PrizePicks test summary: ${successfulTests}/${totalTests} tests passed`)

    return NextResponse.json({
      success: true,
      summary: `${successfulTests}/${totalTests} tests passed`,
      results,
      recommendations: [
        "Check console logs for detailed scraping attempts",
        "Verify if any real PrizePicks data was fetched",
        "Monitor for CORS or rate limiting issues",
        "Consider using a proxy service for production",
      ],
    })
  } catch (error) {
    console.error("💥 PrizePicks test endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
