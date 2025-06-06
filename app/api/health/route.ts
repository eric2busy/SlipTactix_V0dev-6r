/**
 * Health Check Endpoint
 * Monitors the status of all integrated services
 */

import { NextResponse } from "next/server"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  services: {
    grok: "available" | "unavailable" | "rate_limited"
    sportsApi: "available" | "unavailable" | "limited"
    database?: "connected" | "disconnected"
  }
  version: string
}

export async function GET() {
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      grok: "available",
      sportsApi: "available",
    },
    version: "1.0.0",
  }

  // Check Grok API availability
  try {
    const grokApiKey = process.env.GROK_API_KEY
    healthStatus.services.grok = grokApiKey ? "available" : "unavailable"
  } catch {
    healthStatus.services.grok = "unavailable"
  }

  // Check Sports API availability
  try {
    const sportsApiKey = process.env.SPORTS_API_KEY
    healthStatus.services.sportsApi = sportsApiKey ? "available" : "unavailable"
  } catch {
    healthStatus.services.sportsApi = "unavailable"
  }

  // Determine overall status
  const unavailableServices = Object.values(healthStatus.services).filter((status) => status === "unavailable").length

  if (unavailableServices > 0) {
    healthStatus.status = unavailableServices === Object.keys(healthStatus.services).length ? "unhealthy" : "degraded"
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503

  return NextResponse.json(healthStatus, { status: statusCode })
}
