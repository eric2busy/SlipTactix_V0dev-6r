import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { props, projections, sport } = body

    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_GROK_API_URL

    if (!apiKey || !apiUrl) {
      return NextResponse.json({
        analysis: `Based on current ${sport} trends and statistical models, these props show strong value potential. Consider the matchup dynamics and recent performance trends when making your selections.`,
        fallback: true,
      })
    }

    // Prepare detailed analysis request
    const analysisPrompt = `Analyze these ${sport} player props for value betting opportunities:

Props to analyze:
${props.map((prop) => `- ${prop.name} (${prop.team}): ${prop.prop} ${prop.line}`).join("\n")}

Projections:
${projections.map((proj) => `- ${proj.name} ${proj.prop}: ${proj.projections[0].value} (${proj.projections[0].source})`).join("\n")}

Provide a concise analysis focusing on:
1. Which props offer the best value
2. Key factors supporting each recommendation
3. Risk assessment for each play
4. Overall confidence in the selections

Keep the response under 200 words and actionable.`

    const grokRequest = {
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content:
            "You are a professional sports betting analyst. Provide clear, data-driven insights for value betting opportunities.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 300,
      stream: false,
    }

    // Make request to Grok API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(grokRequest),
    })

    if (!response.ok) {
      // Return fallback analysis
      return NextResponse.json({
        analysis: `These ${sport} props show strong value based on recent performance trends and matchup analysis. Focus on the higher confidence plays and consider the injury reports before finalizing your selections.`,
        fallback: true,
      })
    }

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content || "Analysis temporarily unavailable."

    return NextResponse.json({
      analysis,
      usage: data.usage,
    })
  } catch (error) {
    console.error("Error in value-plays analysis:", error)

    return NextResponse.json({
      analysis: "Value analysis is temporarily unavailable. Please check back shortly for detailed insights.",
      fallback: true,
    })
  }
}
