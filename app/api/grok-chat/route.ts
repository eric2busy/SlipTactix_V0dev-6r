import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the API key from environment variables
    const apiKey = process.env.GROK_API_KEY
    const apiUrl = process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions"

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        {
          response: "I'm currently in demo mode. Here are some insights I can share based on your query!",
          fallback: true,
          reason: "configuration",
        },
        { status: 200 },
      )
    }

    // Prepare the request to Grok API
    const grokRequest = {
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: `You are SLIPTACTIX, an expert sports betting analyst specializing in ${context?.sport || "NBA"} analysis. 
          
          Your expertise includes:
          - Player prop analysis and recommendations
          - Game matchup breakdowns
          - Injury impact assessments
          - Line value identification
          - Trend analysis and statistical modeling
          
          Always provide:
          - Clear, actionable insights
          - Confidence levels for recommendations
          - Supporting data and reasoning
          - Risk assessment
          
          Keep responses conversational but informative. Focus on helping users make informed betting decisions.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
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
      const errorText = await response.text()
      console.error("Grok API error:", response.status, errorText)

      // Handle specific error cases
      if (response.status === 403) {
        const errorData = JSON.parse(errorText)
        if (errorData.error && errorData.error.includes("credits")) {
          return NextResponse.json({
            response:
              "I'm currently running in demo mode while we set up the AI analysis engine. I can still help you with sports insights using my built-in knowledge! Try asking about live games, trending props, or player analysis.",
            fallback: true,
            reason: "credits",
          })
        }
      }

      if (response.status === 401) {
        return NextResponse.json({
          response:
            "I'm having authentication issues with my analysis engine. Let me provide some general insights based on your query.",
          fallback: true,
          reason: "auth",
        })
      }

      if (response.status === 429) {
        return NextResponse.json({
          response: "I'm getting a lot of requests right now. Let me provide some quick insights while I catch up!",
          fallback: true,
          reason: "rate_limit",
        })
      }

      // Generic fallback for other errors
      return NextResponse.json({
        response:
          "I'm having trouble connecting to my analysis engine right now, but I can still help with sports insights using my built-in data!",
        fallback: true,
        reason: "api_error",
      })
    }

    const data = await response.json()

    // Extract the response from Grok's format
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request right now."

    return NextResponse.json({
      response: aiResponse,
      usage: data.usage,
    })
  } catch (error) {
    console.error("Error in grok-chat API:", error)

    // Return a user-friendly fallback response
    return NextResponse.json({
      response:
        "I'm running in demo mode right now! I can still help you with sports analysis, live games, trending props, and player insights. Try one of the quick suggestions below!",
      fallback: true,
      reason: "demo_mode",
    })
  }
}
