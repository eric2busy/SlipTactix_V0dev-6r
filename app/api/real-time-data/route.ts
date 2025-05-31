import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { dataSyncService } from "@/lib/data-sync"

// Define response interfaces for type safety
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
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("Real-time data API called")

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const sport = searchParams.get("sport") || "NBA"

    // Input validation
    const validTypes = ["props", "games", "injuries", "news", "all"]
    const validSports = ["NBA", "NFL", "MLB"]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
          data: { props: [], games: [], injuries: [], news: [] },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 400 },
      )
    }

    if (!validSports.includes(sport)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid sport. Must be one of: ${validSports.join(", ")}`,
          data: { props: [], games: [], injuries: [], news: [] },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 400 },
      )
    }

    console.log(`Fetching ${type} data for ${sport}`)

    // Check if sync is needed (only if data is stale)
    if (await dataSyncService.isDataStale(sport)) {
      console.log("Database is stale, performing sync...")
      await dataSyncService.performFullSync()
    }

    // Initialize consistent response structure
    const data: ResponseData = { props: [], games: [], injuries: [], news: [] }
    const errors: string[] = []

    switch (type) {
      case "props":
        try {
          data.props = await dataSyncService.getLatestProps(sport)
        } catch (error) {
          console.error("Error fetching props:", error)
          errors.push(`Props: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
        break
      case "games":
        try {
          data.games = await dataSyncService.getLatestGames(sport)
        } catch (error) {
          console.error("Error fetching games:", error)
          errors.push(`Games: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
        break
      case "injuries":
        try {
          data.injuries = await dataSyncService.getLatestInjuries(sport)
        } catch (error) {
          console.error("Error fetching injuries:", error)
          errors.push(`Injuries: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
        break
      case "news":
        try {
          data.news = await dataSyncService.getLatestNews(sport)
        } catch (error) {
          console.error("Error fetching news:", error)
          errors.push(`News: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
        break
      default:
        // Get all data with proper error handling
        console.log("Fetching all data types...")
        const results = await Promise.allSettled([
          dataSyncService.getLatestProps(sport),
          dataSyncService.getLatestGames(sport),
          dataSyncService.getLatestInjuries(sport),
          dataSyncService.getLatestNews(sport),
        ])

        const [propsResult, gamesResult, injuriesResult, newsResult] = results

        if (propsResult.status === "fulfilled") {
          data.props = propsResult.value
        } else {
          console.error("Props fetch failed:", propsResult.reason)
          errors.push(`Props: ${propsResult.reason.message || "Unknown error"}`)
        }

        if (gamesResult.status === "fulfilled") {
          data.games = gamesResult.value
        } else {
          console.error("Games fetch failed:", gamesResult.reason)
          errors.push(`Games: ${gamesResult.reason.message || "Unknown error"}`)
        }

        if (injuriesResult.status === "fulfilled") {
          data.injuries = injuriesResult.value
        } else {
          console.error("Injuries fetch failed:", injuriesResult.reason)
          errors.push(`Injuries: ${injuriesResult.reason.message || "Unknown error"}`)
        }

        if (newsResult.status === "fulfilled") {
          data.news = newsResult.value
        } else {
          console.error("News fetch failed:", newsResult.reason)
          errors.push(`News: ${newsResult.reason.message || "Unknown error"}`)
        }
    }

    console.log("Data fetched successfully:", {
      props: data.props?.length || 0,
      games: data.games?.length || 0,
      injuries: data.injuries?.length || 0,
      news: data.news?.length || 0,
    })

    const response: ApiResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }

    if (errors.length > 0) {
      response.errors = errors
      console.warn("Partial data fetch failure:", errors)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in real-time-data API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch real-time data",
        message: error instanceof Error ? error.message : "Unknown error",
        data: {
          props: [],
          games: [],
          injuries: [],
          news: [],
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 },
    )
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    // Optional authentication - only check if SYNC_API_KEY is set
    const headersList = headers()
    const apiKey = headersList.get("x-api-key")
    const requiredKey = process.env.SYNC_API_KEY

    if (requiredKey && apiKey !== requiredKey) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("Manual sync triggered")

    // Trigger manual sync
    const result = await dataSyncService.performFullSync()

    console.log("Manual sync completed:", result)

    return NextResponse.json({
      success: true,
      message: "Data sync completed",
      result,
    })
  } catch (error) {
    console.error("Error triggering manual sync:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
