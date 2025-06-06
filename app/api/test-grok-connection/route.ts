import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Testing Grok API connection...")

    // Check environment variables
    const grokKey = process.env.GROK_API_KEY
    const xaiKey = process.env.XAI_API_KEY
    const apiKey = grokKey || xaiKey

    console.log("🔑 Environment check:", {
      grokKey: grokKey ? "Present" : "Missing",
      xaiKey: xaiKey ? "Present" : "Missing",
      usingKey: apiKey ? "Found" : "Not found",
    })

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "No API key found in environment variables",
        details: {
          grokKey: !!grokKey,
          xaiKey: !!xaiKey,
          envVars: Object.keys(process.env).filter(
            (key) => key.toLowerCase().includes("grok") || key.toLowerCase().includes("xai"),
          ),
        },
      })
    }

    // Test API connection
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: "Test connection - just say 'working'" }],
        max_tokens: 10,
      }),
    })

    console.log("📡 API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Error:", errorText)

      return NextResponse.json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
      })
    }

    const data = await response.json()
    console.log("✅ API Success:", data)

    return NextResponse.json({
      success: true,
      message: "Grok API connection successful",
      response: data.choices?.[0]?.message?.content || "No response content",
      model: "grok-3-mini",
    })
  } catch (error) {
    console.error("❌ Connection test failed:", error)

    return NextResponse.json({
      success: false,
      error: "Connection test failed",
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}
