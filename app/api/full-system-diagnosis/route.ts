import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      apiKeys: {} as any,
      urls: {} as any,
    },
    apiTests: {
      sportsGamesOdds: {} as any,
      espn: {} as any,
      grok: {} as any,
      supabase: {} as any,
    },
    endpoints: [] as any[],
    errors: [] as string[],
    recommendations: [] as string[],
    summary: {} as any,
  }

  console.log("🔍 Starting full system diagnosis...")

  // 1. Check Environment Variables
  try {
    diagnosis.environment.apiKeys = {
      sportsApiKey: {
        present: !!process.env.SPORTS_API_KEY,
        length: process.env.SPORTS_API_KEY?.length || 0,
        prefix: process.env.SPORTS_API_KEY ? `${process.env.SPORTS_API_KEY.substring(0, 8)}...` : "Not found",
      },
      grokApiKey: {
        present: !!process.env.GROK_API_KEY,
        length: process.env.GROK_API_KEY?.length || 0,
      },
      supabaseUrl: {
        present: !!process.env.SUPABASE_URL,
      },
      supabaseKey: {
        present: !!process.env.SUPABASE_ANON_KEY,
      },
    }

    diagnosis.environment.urls = {
      sportsGamesOdds: "https://api.sportsgameodds.com/v2",
      espn: "https://site.api.espn.com/apis/site/v2/sports",
      grok: process.env.GROK_API_URL || "https://api.x.ai/v1",
    }
  } catch (error: any) {
    diagnosis.errors.push(`Environment check failed: ${error.message}`)
  }

  // 2. Test Sports Games Odds API
  try {
    console.log("🏀 Testing Sports Games Odds API...")
    if (process.env.SPORTS_API_KEY) {
      const sportsTest = await sportsGamesOddsClient.diagnoseAPI()
      diagnosis.apiTests.sportsGamesOdds = sportsTest

      if (sportsTest.workingEndpoints.length === 0) {
        diagnosis.errors.push("Sports Games Odds API: No working endpoints")
        diagnosis.recommendations.push("❌ Sports Games Odds API key is invalid")
        diagnosis.recommendations.push("🔑 Get new API key from sportsgameodds.com")
      } else {
        diagnosis.recommendations.push("✅ Sports Games Odds API is working")
      }
    } else {
      diagnosis.errors.push("Sports Games Odds API: No API key configured")
      diagnosis.recommendations.push("🔑 Add SPORTS_API_KEY to environment variables")
    }
  } catch (error: any) {
    diagnosis.errors.push(`Sports Games Odds API test failed: ${error.message}`)
    diagnosis.apiTests.sportsGamesOdds = { error: error.message }
  }

  // 3. Test ESPN API (fallback)
  try {
    console.log("📺 Testing ESPN API...")
    const espnTest = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard", {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    if (espnTest.ok) {
      const espnData = await espnTest.json()
      diagnosis.apiTests.espn = {
        working: true,
        gamesFound: espnData.events?.length || 0,
        status: "ESPN API is working as fallback",
      }
      diagnosis.recommendations.push("✅ ESPN API working as fallback for basic game data")
    } else {
      diagnosis.apiTests.espn = {
        working: false,
        status: `ESPN API failed: ${espnTest.status}`,
      }
      diagnosis.errors.push("ESPN API fallback not working")
    }
  } catch (error: any) {
    diagnosis.errors.push(`ESPN API test failed: ${error.message}`)
    diagnosis.apiTests.espn = { error: error.message }
  }

  // 4. Test Grok API
  try {
    console.log("🤖 Testing Grok API...")
    if (process.env.GROK_API_KEY) {
      const grokTest = await fetch(`${process.env.GROK_API_URL || "https://api.x.ai/v1"}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (grokTest.ok) {
        const grokData = await grokTest.json()
        diagnosis.apiTests.grok = {
          working: true,
          modelsFound: grokData.data?.length || 0,
          status: "Grok API is working",
        }
        diagnosis.recommendations.push("✅ Grok AI API is working")
      } else {
        diagnosis.apiTests.grok = {
          working: false,
          status: `Grok API failed: ${grokTest.status}`,
        }
        diagnosis.errors.push("Grok API not working")
      }
    } else {
      diagnosis.errors.push("Grok API: No API key configured")
      diagnosis.recommendations.push("🤖 Add GROK_API_KEY to environment variables")
    }
  } catch (error: any) {
    diagnosis.errors.push(`Grok API test failed: ${error.message}`)
    diagnosis.apiTests.grok = { error: error.message }
  }

  // 5. Test Supabase Connection
  try {
    console.log("🗄️ Testing Supabase connection...")
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabaseTest = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      })

      if (supabaseTest.ok) {
        diagnosis.apiTests.supabase = {
          working: true,
          status: "Supabase connection working",
        }
        diagnosis.recommendations.push("✅ Supabase database connection working")
      } else {
        diagnosis.apiTests.supabase = {
          working: false,
          status: `Supabase failed: ${supabaseTest.status}`,
        }
        diagnosis.errors.push("Supabase connection failed")
      }
    } else {
      diagnosis.errors.push("Supabase: Missing URL or API key")
      diagnosis.recommendations.push("🗄️ Configure Supabase environment variables")
    }
  } catch (error: any) {
    diagnosis.errors.push(`Supabase test failed: ${error.message}`)
    diagnosis.apiTests.supabase = { error: error.message }
  }

  // 6. Test Key App Endpoints
  const testEndpoints = [
    { path: "/api/chat", method: "POST", description: "Main chat endpoint" },
    { path: "/api/real-time-data", method: "GET", description: "Real-time sports data" },
    { path: "/api/health", method: "GET", description: "Health check" },
  ]

  for (const endpoint of testEndpoints) {
    try {
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

      const testUrl = `${baseUrl}${endpoint.path}`

      const response = await fetch(testUrl, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        ...(endpoint.method === "POST" && {
          body: JSON.stringify({ message: "test", type: "system_test" }),
        }),
      })

      diagnosis.endpoints.push({
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: response.status,
        working: response.ok,
      })
    } catch (error: any) {
      diagnosis.endpoints.push({
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        error: error.message,
        working: false,
      })
    }
  }

  // 7. Generate Summary and Recommendations
  const workingApis = Object.values(diagnosis.apiTests).filter((api: any) => api.working).length
  const totalApis = Object.keys(diagnosis.apiTests).length
  const workingEndpoints = diagnosis.endpoints.filter((e) => e.working).length
  const totalEndpoints = diagnosis.endpoints.length

  diagnosis.summary = {
    workingApis: `${workingApis}/${totalApis}`,
    workingEndpoints: `${workingEndpoints}/${totalEndpoints}`,
    totalErrors: diagnosis.errors.length,
    overallStatus: diagnosis.errors.length === 0 ? "✅ All systems working" : "❌ Issues detected",
  }

  // Priority recommendations
  if (diagnosis.errors.length > 0) {
    diagnosis.recommendations.unshift("🚨 PRIORITY FIXES NEEDED:")

    if (!process.env.SPORTS_API_KEY) {
      diagnosis.recommendations.push("1. Add SPORTS_API_KEY to .env.local")
    } else if (diagnosis.apiTests.sportsGamesOdds?.workingEndpoints?.length === 0) {
      diagnosis.recommendations.push("1. Get new Sports Games Odds API key")
    }

    if (!process.env.GROK_API_KEY) {
      diagnosis.recommendations.push("2. Add GROK_API_KEY to .env.local")
    }

    diagnosis.recommendations.push("3. Restart development server after adding keys")
  }

  console.log(`📊 Diagnosis complete: ${diagnosis.summary.overallStatus}`)

  return NextResponse.json({
    success: diagnosis.errors.length === 0,
    message: diagnosis.summary.overallStatus,
    diagnosis,
  })
}
