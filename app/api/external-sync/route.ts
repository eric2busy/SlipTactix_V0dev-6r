import { NextResponse } from "next/server"
import { dataSyncService } from "@/lib/data-sync"

// This endpoint will be called by external cron services
export async function GET(request: Request) {
  try {
    // Optional: Add simple authentication to prevent abuse
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // Simple token check (optional)
    if (process.env.SYNC_TOKEN && token !== process.env.SYNC_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("External sync triggered")

    // Perform quick data sync (under 10 seconds for Hobby plan)
    const result = await dataSyncService.performQuickSync()

    return NextResponse.json({
      success: true,
      message: "External sync completed",
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in external sync:", error)
    return NextResponse.json(
      {
        success: false,
        error: "External sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  // Support both GET and POST for different cron services
  return GET(request)
}
