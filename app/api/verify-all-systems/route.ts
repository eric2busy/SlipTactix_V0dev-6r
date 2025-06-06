import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  console.log("🔍 Starting complete system verification...")

  const results = {
    timestamp: new Date().toISOString(),
    systems: {
      sportsApi: { status: "pending", message: "" },
      grokApi: { status: "pending", message: "" },
      supabase: { status: "pending", message: "" },
      espnApi: { status: "pending", message: "" },
    },
    allSystemsOperational: false,
  }

  // 1. Test Sports Games Odds API
  try {
    console.log("🏀 Testing Sports Games Odds API...")
    const sportsTest = await sportsGamesOddsClient.testConnection()

    if (sportsTest.success) {
      results.systems.sportsApi = {
        status: "operational",
        message: `✅ Connected to Sports Games Odds API v2. Found ${sportsTest.data?.events || 0} events.`,
      }
    } else {
      results.systems.sportsApi = {
        status: "error",
        message: `❌ Sports API error: ${sportsTest.error || "Unknown error"}`,
      }
    }
  } catch (error: any) {
    results.systems.sportsApi = {
      status: "error",
      message: `❌ Sports API exception: ${error.message}`,
    }
  }

  // 2. Test Grok API
  try {
    console.log("🤖 Testing Grok API...")
    const grokApiUrl = process.env.GROK_API_URL || "https://api.x.ai/v1"
    const grokApiKey = process.env.GROK_API_KEY

    if (!grokApiKey) {
      results.systems.grokApi = {
        status: "error",
        message: "❌ Grok API key not configured",
      }
    } else {
      const grokResponse = await fetch(`${grokApiUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${grokApiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (grokResponse.ok) {
        const data = await grokResponse.json()
        results.systems.grokApi = {
          status: "operational",
          message: `✅ Grok API connected. Found ${data.data?.length || 0} models.`,
        }
      } else {
        results.systems.grokApi = {
          status: "error",
          message: `❌ Grok API error: ${grokResponse.status} ${grokResponse.statusText}`,
        }
      }
    }
  } catch (error: any) {
    results.systems.grokApi = {
      status: "error",
      message: `❌ Grok API exception: ${error.message}`,
    }
  }

  // 3. Test Supabase
  try {
    console.log("🗄️ Testing Supabase connection...")
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      results.systems.supabase = {
        status: "error",
        message: "❌ Supabase credentials not configured",
      }
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase.from("sports_games").select("count").limit(1)

      if (error) {
        results.systems.supabase = {
          status: "error",
          message: `❌ Supabase error: ${error.message}`,
        }
      } else {
        results.systems.supabase = {
          status: "operational",
          message: "✅ Supabase connection successful",
        }
      }
    }
  } catch (error: any) {
    results.systems.supabase = {
      status: "error",
      message: `❌ Supabase exception: ${error.message}`,
    }
  }

  // 4. Test ESPN API (fallback)
  try {
    console.log("📺 Testing ESPN API...")
    const espnResponse = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard")

    if (espnResponse.ok) {
      const data = await espnResponse.json()
      results.systems.espnApi = {
        status: "operational",
        message: `✅ ESPN API connected. Found ${data.events?.length || 0} games.`,
      }
    } else {
      results.systems.espnApi = {
        status: "error",
        message: `❌ ESPN API error: ${espnResponse.status} ${espnResponse.statusText}`,
      }
    }
  } catch (error: any) {
    results.systems.espnApi = {
      status: "error",
      message: `❌ ESPN API exception: ${error.message}`,
    }
  }

  // Check if all systems are operational
  const allOperational = Object.values(results.systems).every((system) => system.status === "operational")
  results.allSystemsOperational = allOperational

  console.log(`📊 Verification complete: ${allOperational ? "All systems operational! ✅" : "Issues detected ❌"}`)

  return NextResponse.json({
    success: allOperational,
    message: allOperational ? "✅ All systems operational!" : "❌ Some systems have issues",
    results,
  })
}
