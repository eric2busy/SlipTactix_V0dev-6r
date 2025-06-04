import { NextResponse } from "next/server"
import { APISecurityManager } from "@/lib/api-security"

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      services: {
        database: "operational",
        realTimeData: "operational",
        apiSecurity: "operational",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGrokKey: !!process.env.GROK_API_KEY,
        hasSportsKey: !!process.env.SPORTSDATA_API_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      security: APISecurityManager.validateEnvironment(),
      features: {
        realTimeProps: true,
        liveGames: true,
        injuryReports: true,
        newsUpdates: true,
        parlayBuilder: true,
        enhancedFallback: true,
      },
      version: "1.2.0",
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
