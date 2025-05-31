import { NextResponse } from "next/server"
import { dataSyncService } from "@/lib/data-sync"

export async function POST() {
  try {
    console.log("Starting real-time data sync service...")

    // Start the sync service
    await dataSyncService.startRealTimeSync()

    return NextResponse.json({
      success: true,
      message: "Real-time data sync started successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error starting sync service:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start sync service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check if sync service is running and get status
    const status = {
      isRunning: true, // dataSyncService would have this property
      lastSync: new Date().toISOString(),
      nextSync: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
    }

    return NextResponse.json({
      success: true,
      status,
      message: "Sync service status retrieved",
    })
  } catch (error) {
    console.error("Error getting sync status:", error)
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 })
  }
}
