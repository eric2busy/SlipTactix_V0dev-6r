/**
 * Secure API Key Setup Endpoint
 * Allows secure testing and setup of new Grok API keys
 */

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, apiKey } = body

    if (action === "test" && apiKey) {
      // Test the provided API key without storing it
      if (!apiKey.startsWith("xai-")) {
        return NextResponse.json({
          success: false,
          error: "Invalid API key format. Must start with 'xai-'",
        })
      }

      try {
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
                content: "Test message - respond with 'Key test successful'",
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

          if (response.status === 403 && errorText.includes("blocked")) {
            return NextResponse.json({
              success: false,
              status: "blocked",
              message: "This API key is also blocked. You need a fresh key from console.x.ai",
            })
          }

          return NextResponse.json({
            success: false,
            status: "error",
            message: `API test failed: ${response.status}`,
          })
        }

        const data = await response.json()

        return NextResponse.json({
          success: true,
          status: "valid",
          message: "API key is valid and working!",
          response: data.choices?.[0]?.message?.content,
          instructions: [
            "Add this key to your .env.local file as GROK_API_KEY=your_key_here",
            "Restart your development server",
            "Test the chat functionality",
          ],
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          status: "error",
          message: "Failed to test API key",
        })
      }
    }

    if (action === "status") {
      // Check current environment key status
      const currentKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

      if (!currentKey) {
        return NextResponse.json({
          success: false,
          status: "no_key",
          message: "No API key configured in environment",
        })
      }

      // Test current key
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: "Status check",
              },
            ],
            model: "grok-3-latest",
            stream: false,
            temperature: 0,
            max_tokens: 5,
          }),
        })

        if (response.status === 403) {
          return NextResponse.json({
            success: false,
            status: "blocked",
            message: "Current API key is blocked",
            keyPrefix: `${currentKey.substring(0, 8)}...`,
          })
        }

        if (response.ok) {
          return NextResponse.json({
            success: true,
            status: "active",
            message: "Current API key is working",
            keyPrefix: `${currentKey.substring(0, 8)}...`,
          })
        }

        return NextResponse.json({
          success: false,
          status: "error",
          message: `API error: ${response.status}`,
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          status: "error",
          message: "Failed to check current key",
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Use 'test' or 'status'",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Invalid request format",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Secure Grok API Key Setup",
    usage: {
      test: "POST with { action: 'test', apiKey: 'your-new-key' }",
      status: "POST with { action: 'status' }",
    },
    security: "Keys are tested but never stored or logged",
    getNewKey: "Visit https://console.x.ai/ to generate a fresh API key",
  })
}
