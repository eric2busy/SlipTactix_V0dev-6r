import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 })
    }

    // Check the models endpoint to see available models
    const modelsResponse = await fetch("https://api.x.ai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json()
      return NextResponse.json({
        message: "Available models from xAI API",
        models: modelsData,
        instructions: "Use one of these model IDs in your requests",
      })
    } else {
      const errorText = await modelsResponse.text()
      return NextResponse.json({
        error: "Failed to fetch models",
        status: modelsResponse.status,
        details: errorText,
        suggestion: "Check the xAI documentation at https://docs.x.ai/",
      })
    }
  } catch (error) {
    console.error("Models check error:", error)
    return NextResponse.json(
      {
        error: "Models check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
