import { NextResponse } from "next/server"
import { proxyScraper } from "@/lib/proxy-scraper"
import { prizePicksScraper } from "@/lib/prizepicks-scraper"

export async function GET() {
  try {
    console.log("🎯 PrizePicks proxy scraping endpoint called...")

    // Try proxy scraping first
    let props = await proxyScraper.scrapePrizePicksViaProxy("NBA")

    if (!props || props.length === 0) {
      console.log("🔄 Proxy scraping failed, trying direct methods...")
      props = await prizePicksScraper.getActiveProps("NBA")
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      method: props?.[0]?.source || "fallback",
      count: props?.length || 0,
      props: props || [],
      sample: props?.[0] || null,
    }

    console.log(`📊 PrizePicks proxy result: ${result.count} props via ${result.method}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 PrizePicks proxy endpoint error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Proxy scraping failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
