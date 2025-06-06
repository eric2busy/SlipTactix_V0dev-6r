/**
 * Check Grok API Status
 * Tests the currently configured API key
 */

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: "no_key",
        message: "No Grok API key configured",
        instructions: "Set GROK_API_KEY in your environment variables",
      })
    }

    // Test the configured API key
    console.log("🔍 Testing configured Grok API key...")

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
            content: "Respond with 'Status check OK' only.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
        max_tokens: 5,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (response.status === 403 && errorText.includes("blocked")) {
        return NextResponse.json({
          success: false,
          status: "blocked",
          message: "Current API key is blocked",
          keyPrefix: `${apiKey.substring(0, 8)}...`,
          instructions: "Get a new API key from console.x.ai",
        })
      }

      return NextResponse.json({
        success: false,
        status: "error",
        message: `API error: ${response.status}`,
        keyPrefix: `${apiKey.substring(0, 8)}...`,
        details: errorText,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      status: "active",
      message: "Grok API is working correctly",
      response: data.choices?.[0]?.message?.content,
      model: "grok-3-latest",
      keyPrefix: `${apiKey.substring(0, 8)}...`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: "error",
      message: "Failed to check API status",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
