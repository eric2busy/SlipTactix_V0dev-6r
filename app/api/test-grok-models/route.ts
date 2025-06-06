import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 })
    }

    // Test different model names and endpoints
    const testConfigs = [
      { model: "grok-beta", url: "https://api.x.ai/v1/chat/completions" },
      { model: "grok-3-latest", url: "https://api.x.ai/v1/chat/completions" },
      { model: "grok-2-latest", url: "https://api.x.ai/v1/chat/completions" },
    ]

    const results = []

    for (const config of testConfigs) {
      try {
        console.log(`🧪 Testing model: ${config.model} at ${config.url}`)

        const response = await fetch(config.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: "user",
                content: "Test message - just say 'working'",
              },
            ],
            max_tokens: 10,
            temperature: 0,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            model: config.model,
            url: config.url,
            status: "✅ SUCCESS",
            response: data.choices?.[0]?.message?.content || "No content",
          })
        } else {
          const errorText = await response.text()
          results.push({
            model: config.model,
            url: config.url,
            status: `❌ FAILED (${response.status})`,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          model: config.model,
          url: config.url,
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: "Model compatibility test results",
      results,
      recommendation: results.find((r) => r.status.includes("SUCCESS"))?.model || "No working model found",
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
