import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test the new API key directly
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "No API key found in environment variables",
      })
    }

    console.log("🧪 Testing new Grok API key...")

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Say 'New API key working perfectly!' and nothing else.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
        max_tokens: 20,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API test failed:", response.status, errorText)

      if (response.status === 403 && errorText.includes("blocked")) {
        return NextResponse.json({
          success: false,
          status: "blocked",
          message: "API key is still blocked",
          keyPrefix: `${apiKey.substring(0, 12)}...`,
        })
      }

      return NextResponse.json({
        success: false,
        status: "error",
        message: `API error: ${response.status}`,
        error: errorText,
      })
    }

    const data = await response.json()
    console.log("✅ New API key test successful!")

    return NextResponse.json({
      success: true,
      message: "New Grok API key is working perfectly!",
      response: data.choices?.[0]?.message?.content,
      model: "grok-3-latest",
      keyPrefix: `${apiKey.substring(0, 12)}...`,
      usage: data.usage,
    })
  } catch (error) {
    console.error("❌ Test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Test request failed",
    })
  }
}
