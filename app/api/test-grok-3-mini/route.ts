import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 })
    }

    // Test different possible Grok 3 Mini model names
    const grok3MiniModels = [
      "grok-3-mini",
      "grok-3-mini-latest",
      "grok-3-mini-beta",
      "grok-mini",
      "grok-3-mini-20241219",
      "grok-3-mini-20241220",
    ]

    const results = []

    for (const model of grok3MiniModels) {
      try {
        console.log(`🧪 Testing Grok 3 Mini model: ${model}`)

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: "Test Grok 3 Mini - just say 'Grok 3 Mini working'",
              },
            ],
            max_tokens: 20,
            temperature: 0,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            model: model,
            status: "✅ SUCCESS - Grok 3 Mini Found!",
            response: data.choices?.[0]?.message?.content || "No content",
            usage: data.usage,
          })

          // If we found a working model, break early
          console.log(`🎉 Found working Grok 3 Mini model: ${model}`)
          break
        } else {
          const errorText = await response.text()
          results.push({
            model: model,
            status: `❌ FAILED (${response.status})`,
            error: errorText.substring(0, 200) + "...",
          })
        }
      } catch (error) {
        results.push({
          model: model,
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const workingModel = results.find((r) => r.status.includes("SUCCESS"))

    return NextResponse.json({
      message: "Grok 3 Mini model test results",
      results,
      workingModel: workingModel?.model || "No working Grok 3 Mini model found",
      recommendation: workingModel
        ? `Use model: "${workingModel.model}"`
        : "Try checking xAI documentation for correct model name",
      nextStep: workingModel ? "Update your app to use this model name" : "Contact xAI support for Grok 3 Mini access",
    })
  } catch (error) {
    console.error("Grok 3 Mini test error:", error)
    return NextResponse.json(
      {
        error: "Grok 3 Mini test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
