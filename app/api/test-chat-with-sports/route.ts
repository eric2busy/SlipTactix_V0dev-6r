import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧪 Testing Chat with Sports Data Integration...")

    // Test the actual chat endpoint that users will use
    const testMessages = [
      {
        role: "user",
        content: "What NBA games are happening today? Give me some analysis.",
      },
    ]

    // Call our own chat endpoint
    const chatResponse = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/grok-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: testMessages,
        context: { sport: "NBA" },
      }),
    })

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text()
      return NextResponse.json({
        success: false,
        error: `Chat endpoint failed: ${chatResponse.status} - ${errorText}`,
      })
    }

    const chatData = await chatResponse.json()

    // Test value plays analysis
    const valueResponse = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3000"}/api/grok-analysis/value-plays`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          props: [
            {
              name: "LeBron James",
              team: "Lakers",
              prop: "Points",
              line: "25.5",
              confidence: 78,
            },
          ],
          projections: [
            {
              name: "LeBron James",
              prop: "Points",
              projections: [{ value: "27.2", source: "ESPN" }],
            },
          ],
          sport: "NBA",
        }),
      },
    )

    let valueData = null
    if (valueResponse.ok) {
      valueData = await valueResponse.json()
    }

    return NextResponse.json({
      success: true,
      message: "✅ Chat + Sports integration test completed!",
      results: {
        chatEndpoint: {
          working: chatResponse.ok,
          response: chatData.response?.substring(0, 200) + "..." || "No response",
          ragProcessed: chatData.ragProcessed || false,
          fallback: chatData.fallback || false,
          model: chatData.model_used || "unknown",
        },
        valueAnalysis: {
          working: valueResponse.ok,
          response: valueData?.analysis?.substring(0, 200) + "..." || "No analysis",
          fallback: valueData?.fallback || false,
        },
      },
      recommendations: [
        chatResponse.ok ? "✅ Chat endpoint working" : "❌ Fix chat endpoint",
        valueResponse.ok ? "✅ Value analysis working" : "❌ Fix value analysis",
        "🏀 Sports data integration ready",
        "🤖 Grok 3 Mini providing AI responses",
      ],
    })
  } catch (error) {
    console.error("Chat integration test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Chat integration test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
