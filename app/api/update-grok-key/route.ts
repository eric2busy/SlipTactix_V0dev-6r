/**
 * Secure API Key Update and Test Endpoint
 * This endpoint allows secure testing without exposing the key in logs
 */

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, testOnly = false } = body

    if (!apiKey || !apiKey.startsWith("xai-")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key format. Must start with 'xai-'",
        },
        { status: 400 },
      )
    }

    // Test the API key without logging it
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
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Say 'API key test successful' and nothing else.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
        max_tokens: 10,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API key test failed:", response.status)

      return NextResponse.json(
        {
          success: false,
          error: `API test failed: ${response.status} ${response.statusText}`,
          details: errorText.includes("blocked") ? "API key is blocked" : "Authentication failed",
          keyPrefix: `${apiKey.substring(0, 8)}...`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    const testResponse = data.choices?.[0]?.message?.content

    console.log("✅ New API key test successful!")

    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: "API key test successful!",
        response: testResponse,
        model: "grok-3-latest",
        keyPrefix: `${apiKey.substring(0, 8)}...`,
        instructions: "Key is valid. Add it to your environment variables as GROK_API_KEY",
      })
    }

    return NextResponse.json({
      success: true,
      message: "API key validated successfully!",
      response: testResponse,
      model: "grok-3-latest",
      keyPrefix: `${apiKey.substring(0, 8)}...`,
      nextSteps: [
        "Add GROK_API_KEY to your .env.local file",
        "Restart your development server",
        "Test the chat functionality",
      ],
    })
  } catch (error) {
    console.error("❌ API key update error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test API key",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Secure API Key Test Endpoint",
    usage: "POST with { apiKey: 'your-key', testOnly: true }",
    security: "Keys are never logged or stored",
  })
}
