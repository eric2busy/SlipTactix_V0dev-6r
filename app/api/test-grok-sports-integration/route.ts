import { NextResponse } from "next/server"
import { sportsGamesOddsClient } from "@/lib/sports-games-odds-client"

export async function GET() {
  try {
    console.log("🧪 Testing Grok 3 Mini + Sports API Integration...")

    // Test 1: Check Grok API Key
    const grokApiKey = process.env.GROK_API_KEY
    const sportsApiKey = process.env.SPORTS_API_KEY

    const status = {
      grokApiKey: !!grokApiKey,
      sportsApiKey: !!sportsApiKey,
      grokKeyLength: grokApiKey?.length || 0,
      sportsKeyLength: sportsApiKey?.length || 0,
      tests: [] as any[],
      integration: {
        working: false,
        message: "",
      },
    }

    // Test 2: Test Grok 3 Mini API directly
    if (grokApiKey) {
      try {
        console.log("🤖 Testing Grok 3 Mini API...")

        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-3-mini",
            messages: [
              {
                role: "system",
                content: "You are SLIPTACTIX, a sports analysis assistant. Be concise.",
              },
              {
                role: "user",
                content: "Test message - just say 'Grok 3 Mini working' and nothing else.",
              },
            ],
            temperature: 0,
            max_tokens: 10,
          }),
        })

        if (grokResponse.ok) {
          const grokData = await grokResponse.json()
          const aiResponse = grokData.choices?.[0]?.message?.content

          status.tests.push({
            test: "Grok 3 Mini API",
            status: "✅ SUCCESS",
            response: aiResponse,
            model: grokData.model || "grok-3-mini",
          })
        } else {
          const errorText = await grokResponse.text()
          status.tests.push({
            test: "Grok 3 Mini API",
            status: `❌ FAILED (${grokResponse.status})`,
            error: errorText.substring(0, 200),
          })
        }
      } catch (error: any) {
        status.tests.push({
          test: "Grok 3 Mini API",
          status: "❌ ERROR",
          error: error.message,
        })
      }
    } else {
      status.tests.push({
        test: "Grok 3 Mini API",
        status: "❌ NO API KEY",
        error: "GROK_API_KEY not configured",
      })
    }

    // Test 3: Test Sports API
    if (sportsApiKey) {
      try {
        console.log("🏀 Testing Sports Games Odds API...")

        const sportsTest = await sportsGamesOddsClient.testConnection()

        if (sportsTest.success) {
          status.tests.push({
            test: "Sports Games Odds API",
            status: "✅ SUCCESS",
            message: sportsTest.message,
            sports: sportsTest.sports,
          })
        } else {
          status.tests.push({
            test: "Sports Games Odds API",
            status: "❌ FAILED",
            error: sportsTest.error,
          })
        }
      } catch (error: any) {
        status.tests.push({
          test: "Sports Games Odds API",
          status: "❌ ERROR",
          error: error.message,
        })
      }
    } else {
      status.tests.push({
        test: "Sports Games Odds API",
        status: "❌ NO API KEY",
        error: "SPORTS_API_KEY not configured",
      })
    }

    // Test 4: Test Integration - Grok analyzing Sports Data
    const grokWorking = status.tests.find((t) => t.test === "Grok 3 Mini API")?.status?.includes("SUCCESS")
    const sportsWorking = status.tests.find((t) => t.test === "Sports Games Odds API")?.status?.includes("SUCCESS")

    if (grokWorking && sportsWorking && grokApiKey) {
      try {
        console.log("🔗 Testing Grok + Sports Integration...")

        // Get some sample sports data
        const sampleSports = await sportsGamesOddsClient.getSports()
        const sampleLeagues = await sportsGamesOddsClient.getLeagues("BASKETBALL")

        // Have Grok analyze the sports data
        const integrationResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-3-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are SLIPTACTIX, a sports analysis assistant. Analyze the provided sports data and give a brief summary.",
              },
              {
                role: "user",
                content: `Analyze this sports data:

Sports Available: ${sampleSports.length} sports
Basketball Leagues: ${sampleLeagues.length} leagues

Sample Sports: ${JSON.stringify(sampleSports.slice(0, 2), null, 2)}

Give a brief analysis in 2 sentences.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
          }),
        })

        if (integrationResponse.ok) {
          const integrationData = await integrationResponse.json()
          const analysis = integrationData.choices?.[0]?.message?.content

          status.integration = {
            working: true,
            message: "✅ Grok 3 Mini + Sports API integration working perfectly!",
            analysis: analysis,
            dataUsed: {
              sports: sampleSports.length,
              leagues: sampleLeagues.length,
            },
          }

          status.tests.push({
            test: "Grok + Sports Integration",
            status: "✅ SUCCESS",
            analysis: analysis,
            dataPoints: sampleSports.length + sampleLeagues.length,
          })
        } else {
          const errorText = await integrationResponse.text()
          status.integration = {
            working: false,
            message: "❌ Integration test failed",
          }

          status.tests.push({
            test: "Grok + Sports Integration",
            status: `❌ FAILED (${integrationResponse.status})`,
            error: errorText.substring(0, 200),
          })
        }
      } catch (error: any) {
        status.integration = {
          working: false,
          message: "❌ Integration test error",
        }

        status.tests.push({
          test: "Grok + Sports Integration",
          status: "❌ ERROR",
          error: error.message,
        })
      }
    } else {
      status.integration = {
        working: false,
        message: `❌ Cannot test integration - Grok: ${grokWorking ? "✅" : "❌"}, Sports: ${sportsWorking ? "✅" : "❌"}`,
      }
    }

    // Test 5: Test RAG Processor
    try {
      console.log("🧠 Testing RAG Processor...")

      const { ragProcessor } = await import("@/lib/rag-processor")
      const ragResponse = await ragProcessor.processQuery("What NBA games are happening today?")

      status.tests.push({
        test: "RAG Processor",
        status: "✅ SUCCESS",
        response: ragResponse.substring(0, 200) + "...",
      })
    } catch (error: any) {
      status.tests.push({
        test: "RAG Processor",
        status: "❌ ERROR",
        error: error.message,
      })
    }

    // Final Status
    const allWorking = status.tests.every((test) => test.status.includes("SUCCESS"))

    return NextResponse.json({
      message: allWorking
        ? "🎉 All systems working! Grok 3 Mini + Sports API integration is ready!"
        : "⚠️ Some systems need attention",
      status,
      summary: {
        grokApiWorking: grokWorking,
        sportsApiWorking: sportsWorking,
        integrationWorking: status.integration.working,
        ragWorking: status.tests.find((t) => t.test === "RAG Processor")?.status?.includes("SUCCESS"),
        allSystemsGo: allWorking,
      },
      recommendations: allWorking
        ? [
            "✅ Your SLIPTACTIX system is fully operational!",
            "🏀 Sports data is flowing correctly",
            "🤖 Grok 3 Mini is providing AI analysis",
            "🧠 RAG system is processing queries",
            "🚀 Ready for production use!",
          ]
        : [
            "🔑 Check your API keys in .env.local",
            "🔄 Restart your development server",
            "📊 Test individual components",
            "🆘 Contact support if issues persist",
          ],
    })
  } catch (error) {
    console.error("Integration test error:", error)
    return NextResponse.json(
      {
        error: "Integration test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
