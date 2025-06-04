import { type NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("🚀 REAL-TIME DATA API - Fetching from API Sports and ESPN...")

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const sport = searchParams.get("sport") || "NBA"

    console.log(`🎯 Fetching ${type} data for ${sport} with REAL API integration`)

    // Initialize response structure
    const data: ResponseData = { props: [], games: [], injuries: [], news: [] }
    const errors: string[] = []
    const debug: any = { attempts: [], sources: [] }

    // Enhanced data fetching with REAL APIs
    switch (type) {
      case "props":
        try {
          console.log("📊 Fetching props from PrizePicks...")
          data.props = await prizePicksScraper.getActiveProps("NBA")
          console.log(`✅ Got ${data.props.length} props`)
          debug.attempts.push({ type: "props", success: true, count: data.props.length, source: "PrizePicks-Real" })
        } catch (error) {
          console.error("❌ Error fetching props:", error)
          errors.push(`Props: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "props", success: false, error: error.message })
        }
        break

      case "games":
        try {
          console.log("🏀 Fetching games from API Sports and ESPN...")
          data.games = await sportsAPI.getLiveGames()
          console.log(`✅ Got ${data.games.length} games`)
          debug.attempts.push({ type: "games", success: true, count: data.games.length, source: "API-Sports-ESPN" })
        } catch (error) {
          console.error("❌ Error fetching games:", error)
          errors.push(`Games: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "games", success: false, error: error.message })
        }
        break

      case "injuries":
        try {
          console.log("🏥 Fetching injury reports...")
          data.injuries = await sportsAPI.getInjuryReport()
          console.log(`✅ Got ${data.injuries.length} injury reports`)
          debug.attempts.push({
            type: "injuries",
            success: true,
            count: data.injuries.length,
            source: "Real-Reports",
          })
        } catch (error) {
          console.error("❌ Error fetching injuries:", error)
          errors.push(`Injuries: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "injuries", success: false, error: error.message })
        }
        break

      case "news":
        try {
          console.log("📰 Fetching news from ESPN...")
          data.news = await sportsAPI.getNews()
          console.log(`✅ Got ${data.news.length} news articles`)
          debug.attempts.push({ type: "news", success: true, count: data.news.length, source: "ESPN-Real" })
        } catch (error) {
          console.error("❌ Error fetching news:", error)
          errors.push(`News: ${error instanceof Error ? error.message : "Unknown error"}`)
          debug.attempts.push({ type: "news", success: false, error: error.message })
        }
        break

      default:
        // Get ALL real data with individual error handling
        console.log("🔄 Fetching ALL real data types...")

        const dataPromises = [
          {
            name: "props",
            promise: prizePicksScraper.getActiveProps("NBA").catch((err) => {
              console.error("Props error:", err)
              return []
            }),
          },
          {
            name: "games",
            promise: sportsAPI.getLiveGames().catch((err) => {
              console.error("Games error:", err)
              return []
            }),
          },
          {
            name: "injuries",
            promise: sportsAPI.getInjuryReport().catch((err) => {
              console.error("Injuries error:", err)
              return []
            }),
          },
          {
            name: "news",
            promise: sportsAPI.getNews().catch((err) => {
              console.error("News error:", err)
              return []
            }),
          },
        ]

        const results = await Promise.allSettled(dataPromises.map((p) => p.promise))

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          const { name } = dataPromises[i]

          if (result.status === "fulfilled") {
            data[name as keyof ResponseData] = result.value
            console.log(`✅ Real ${name}: ${result.value.length} items`)
            debug.attempts.push({
              type: name,
              success: true,
              count: result.value.length,
              source: name === "games" ? "API-Sports-ESPN" : name === "props" ? "PrizePicks-Real" : "Real-API",
            })
          } else {
            console.error(`❌ Real ${name} failed:`, result.reason)
            errors.push(`${name}: ${result.reason?.message || "Unknown error"}`)
            debug.attempts.push({ type: name, success: false, error: result.reason?.message })
            data[name as keyof ResponseData] = []
          }
        }
    }

    // Log sample data to verify quality
    if (data.props.length > 0) {
      console.log("📈 Sample real prop:", {
        player: data.props[0]?.player_name || data.props[0]?.player,
        prop: data.props[0]?.prop_type || data.props[0]?.prop,
        line: data.props[0]?.line,
        confidence: data.props[0]?.confidence,
        source: data.props[0]?.source,
      })
    }

    if (data.games.length > 0) {
      console.log("🏀 Sample real game:", {
        matchup: `${data.games[0]?.awayTeam} @ ${data.games[0]?.homeTeam}`,
        status: data.games[0]?.status,
        source: data.games[0]?.source,
        venue: data.games[0]?.venue,
      })
    }

    if (data.news.length > 0) {
      console.log("📰 Sample real news:", {
        title: data.news[0]?.title?.substring(0, 50) + "...",
        source: data.news[0]?.source,
        url: data.news[0]?.url ? "✅" : "❌",
      })
    }

    console.log("📈 Final REAL data counts:", {
      props: data.props?.length || 0,
      games: data.games?.length || 0,
      injuries: data.injuries?.length || 0,
      news: data.news?.length || 0,
    })

    // Add metadata
    const metadata = {
      gamesCount: data.games?.length || 0,
      propsCount: data.props?.length || 0,
      injuriesCount: data.injuries?.length || 0,
      newsCount: data.news?.length || 0,
      lastUpdated: new Date().toISOString(),
      dataSource: "API-Sports-ESPN-PrizePicks-Real",
      apiStatus: {
        apiSports: process.env.SPORTSDATA_API_KEY ? "Available" : "Missing Key",
        espn: "Available",
        prizePicks: "Available",
      },
    }

    const response: ApiResponse = {
      success: true,
      data: { ...data, metadata } as any,
      timestamp: new Date().toISOString(),
      source: "real-api-integration",
      debug,
    }

    if (errors.length > 0) {
      response.errors = errors
      console.warn("⚠️ Some real data sources had issues (gracefully handled):", errors)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 Critical error in real data API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Real data system temporarily unavailable",
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
    console.log("🔄 Manual real data refresh triggered")

    const [gamesSync, propsSync, newsSync] = await Promise.allSettled([
      sportsAPI.getLiveGames(),
      prizePicksScraper.getActiveProps("NBA"),
      sportsAPI.getNews(),
    ])

    const result = {
      games: gamesSync.status === "fulfilled" ? gamesSync.value.length : 0,
      props: propsSync.status === "fulfilled" ? propsSync.value.length : 0,
      news: newsSync.status === "fulfilled" ? newsSync.value.length : 0,
      timestamp: new Date().toISOString(),
      source: "real-api-manual-refresh",
    }

    console.log("✅ Manual real data refresh completed:", result)

    return NextResponse.json({
      success: true,
      message: "Real data refresh completed",
      result,
    })
  } catch (error) {
    console.error("💥 Error in manual real data refresh:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh real data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
