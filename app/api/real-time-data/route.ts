import { NextResponse } from "next/server"
import { sportsAPI } from "@/lib/sports-api"
import { prizePicksScraper } from "@/lib/prizepicks-scraper"

interface ResponseData {
  props: any[]
  games: any[]
  injuries: any[]
  news: any[]
}

interface ApiResponse {
  success: boolean
  data: ResponseData
  timestamp: string
  errors?: string[]
  source: string
  debug?: any
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("🚀 ENHANCED LIVE DATA API - Using robust fallback system")

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const sport = searchParams.get("sport") || "NBA"

    console.log(`🎯 Fetching ${type} data for ${sport} with enhanced error handling`)

    // Initialize response structure
    const data: ResponseData = { props: [], games: [], injuries: [], news: [] }
    const errors: string[] = []
    const debug: any = { attempts: [], fallbacks: [] }

    // Enhanced data fetching with proper error handling
    switch (type) {
      case "props":
        try {
          console.log("📊 Fetching enhanced props...")
          data.props = await prizePicksScraper.getActiveProps(sport)
          console.log(`✅ Got ${data.props.length} enhanced props`)
          debug.attempts.push({ type: "props", success: true, count: data.props.length })
        } catch (error) {
          console.error("❌ Error fetching props:", error)
          errors.push(`Props: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "props", success: false, error: error.message })
        }
        break

      case "games":
        try {
          console.log("🏀 Fetching enhanced games...")
          data.games = await sportsAPI.getLiveGames()
          console.log(`✅ Got ${data.games.length} enhanced games`)
          debug.attempts.push({ type: "games", success: true, count: data.games.length })
        } catch (error) {
          console.error("❌ Error fetching games:", error)
          errors.push(`Games: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "games", success: false, error: error.message })
        }
        break

      case "injuries":
        try {
          console.log("🏥 Fetching enhanced injuries...")
          data.injuries = await sportsAPI.getInjuryReport()
          console.log(`✅ Got ${data.injuries.length} enhanced injuries`)
          debug.attempts.push({ type: "injuries", success: true, count: data.injuries.length })
        } catch (error) {
          console.error("❌ Error fetching injuries:", error)
          errors.push(`Injuries: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "injuries", success: false, error: error.message })
        }
        break

      case "news":
        try {
          console.log("📰 Fetching enhanced news...")
          data.news = await sportsAPI.getNews()
          console.log(`✅ Got ${data.news.length} enhanced news`)
          debug.attempts.push({ type: "news", success: true, count: data.news.length })
        } catch (error) {
          console.error("❌ Error fetching news:", error)
          errors.push(`News: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "news", success: false, error: error.message })
        }
        break

      default:
        // Get ALL enhanced data with individual error handling
        console.log("🔄 Fetching ALL enhanced data types...")

        const dataPromises = [
          { name: "props", promise: prizePicksScraper.getActiveProps(sport) },
          { name: "games", promise: sportsAPI.getLiveGames() },
          { name: "injuries", promise: sportsAPI.getInjuryReport() },
          { name: "news", promise: sportsAPI.getNews() },
        ]

        for (const { name, promise } of dataPromises) {
          try {
            const result = await promise
            data[name as keyof ResponseData] = result
            console.log(`✅ Enhanced ${name}: ${result.length}`)
            debug.attempts.push({ type: name, success: true, count: result.length })
          } catch (error) {
            console.error(`❌ Enhanced ${name} failed:`, error)
            errors.push(`${name}: ${error instanceof Error ? error.message : "Unknown error"}`)
            debug.attempts.push({ type: name, success: false, error: error.message })
          }
        }
    }

    // Log sample data to verify quality
    if (data.props.length > 0) {
      console.log("📈 Sample enhanced prop:", {
        player: data.props[0]?.player,
        prop: data.props[0]?.prop,
        line: data.props[0]?.line,
        confidence: data.props[0]?.confidence,
        source: data.props[0]?.source,
      })
    }

    if (data.games.length > 0) {
      console.log("🏀 Sample enhanced game:", {
        matchup: `${data.games[0]?.awayTeam} @ ${data.games[0]?.homeTeam}`,
        status: data.games[0]?.status,
        source: data.games[0]?.source,
      })
    }

    console.log("📈 Final enhanced data counts:", {
      props: data.props?.length || 0,
      games: data.games?.length || 0,
      injuries: data.injuries?.length || 0,
      news: data.news?.length || 0,
    })

    const response: ApiResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "enhanced-robust-system",
      debug,
    }

    if (errors.length > 0) {
      response.errors = errors
      console.warn("⚠️ Some data sources had issues (using fallbacks):", errors)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 Critical error in enhanced data API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Enhanced data system temporarily unavailable",
        message: error instanceof Error ? error.message : "Unknown error",
        data: {
          props: [],
          games: [],
          injuries: [],
          news: [],
        },
        timestamp: new Date().toISOString(),
        source: "error-fallback",
      } as ApiResponse,
      { status: 500 },
    )
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    console.log("🔄 Manual enhanced data refresh triggered")

    const [gamesSync, propsSync] = await Promise.allSettled([
      sportsAPI.getLiveGames(),
      prizePicksScraper.getActiveProps("NBA"),
    ])

    const result = {
      games: gamesSync.status === "fulfilled" ? gamesSync.value.length : 0,
      props: propsSync.status === "fulfilled" ? propsSync.value.length : 0,
      timestamp: new Date().toISOString(),
      source: "enhanced-manual-refresh",
    }

    console.log("✅ Manual enhanced refresh completed:", result)

    return NextResponse.json({
      success: true,
      message: "Enhanced data refresh completed",
      result,
    })
  } catch (error) {
    console.error("💥 Error in manual enhanced refresh:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh enhanced data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
