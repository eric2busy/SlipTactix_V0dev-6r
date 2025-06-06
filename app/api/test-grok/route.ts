/**
 * Test Grok API Connection
 * Verifies the new API key and model work correctly
 */

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No Grok API key found in environment variables",
          message: "Please set GROK_API_KEY or XAI_API_KEY in your environment",
        },
        { status: 500 },
      )
    }

    console.log("🧪 Testing Grok API connection...")

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
            content: "You are a test assistant.",
          },
          {
            role: "user",
            content: "Testing. Just say hi and hello world and nothing else.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Grok API test failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Grok API error: ${response.status} ${response.statusText}`,
          details: errorText,
          apiKeyPresent: !!apiKey,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("✅ Grok API test successful!")

    return NextResponse.json({
      success: true,
      message: "Grok API connection successful!",
      response: data.choices?.[0]?.message?.content || "No response content",
      model: "grok-3-latest",
      usage: data.usage,
      apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Grok API test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Grok API",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Test with custom message
  try {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No API key configured",
        },
        { status: 500 },
      )
    }

    const testMessage = "Explain what Grok 3 is in one sentence."

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
            content: "You are Grok, xAI's AI assistant. Be helpful and concise.",
          },
          {
            role: "user",
            content: testMessage,
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Advanced Grok test successful!",
      query: testMessage,
      response: data.choices?.[0]?.message?.content,
      model: "grok-3-latest",
      usage: data.usage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
