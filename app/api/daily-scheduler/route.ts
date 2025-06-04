import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Daily scheduler triggered - setting up external cron job instructions")

    // This endpoint will be called once daily by Vercel's free cron
    // But we'll use external services for frequent updates

    return NextResponse.json({
      success: true,
      message: "Daily scheduler active",
      instructions: {
        externalCron: "Use Cron-Job.org to hit /api/sync-data every 5 minutes",
        endpoint: "/api/sync-data",
        frequency: "*/5 * * * *",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in daily scheduler:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Daily scheduler failed",
      },
      { status: 500 },
    )
  }
}
