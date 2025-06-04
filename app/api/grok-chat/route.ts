import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the API key from environment variables (server-side only)
    const apiKey = process.env.GROK_API_KEY
    const apiUrl = process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions"

    // Check if API key is available and not blocked
    if (!apiKey) {
      console.log("⚠️ No Grok API key configured - using text-only responses")
      return NextResponse.json({
        response: generateTextOnlyResponse(messages, context),
        fallback: true,
        reason: "no_api_key",
      })
    }

    // Prepare the request to Grok API with better error handling
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

    // Make request to Grok API with enhanced error handling
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(grokRequest),
    })

    // Handle different error scenarios
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Grok API error:", response.status, errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }

      // Handle specific error cases - NO FAKE DATA FALLBACKS
      if (response.status === 403) {
        console.error("🚫 Grok API key is blocked")
        return NextResponse.json({
          response: generateTextOnlyResponse(messages, context),
          fallback: true,
          reason: "api_key_blocked",
        })
      }

      if (response.status === 401) {
        console.error("🔑 Grok API authentication failed")
        return NextResponse.json({
          response: generateTextOnlyResponse(messages, context),
          fallback: true,
          reason: "auth_failed",
        })
      }

      if (response.status === 429) {
        console.error("⏰ Grok API rate limit exceeded")
        return NextResponse.json({
          response: generateTextOnlyResponse(messages, context),
          fallback: true,
          reason: "rate_limit",
        })
      }

      // Generic fallback for other errors
      console.error("❌ Grok API error:", response.status, errorData)
      return NextResponse.json({
        response: generateTextOnlyResponse(messages, context),
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

    // Return a user-friendly fallback response - NO FAKE DATA
    return NextResponse.json({
      response: generateTextOnlyResponse([], {}),
      fallback: true,
      reason: "system_error",
    })
  }
}

function generateTextOnlyResponse(messages: any[], context: any): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
  const sport = context?.sport || "NBA"

  // NO FAKE DATA - Only direct users to real data sources
  if (lastMessage.includes("prop") || lastMessage.includes("bet")) {
    return `I can help you access real-time ${sport} props and betting data! 

To get accurate, live props data:
• Use the "Show me trending props" button for real PrizePicks data
• Ask "What are today's best props?" for current lines
• Request specific player props like "LeBron James props"

I only provide real, live data - no mock or fake information. Try one of the quick action buttons below for real-time data!`
  }

  if (lastMessage.includes("game") || lastMessage.includes("score") || lastMessage.includes("live")) {
    return `I can show you real, live ${sport} games and scores!

For accurate game information:
• Click "Show me today's NBA games" for real ESPN data
• Ask "What games are live right now?" for current scores
• Request "Show me tonight's games" for today's schedule

All game data comes from live ESPN feeds - completely accurate and real-time. Use the quick actions below!`
  }

  if (lastMessage.includes("injury") || lastMessage.includes("hurt") || lastMessage.includes("out")) {
    return `I have access to real, current ${sport} injury reports!

For accurate injury information:
• Click "Show me the injury report" for real-time status updates
• Ask about specific players: "Is LeBron James injured?"
• Request "Who's out tonight?" for today's inactive players

All injury data is sourced from official reports - no speculation or fake data. Try the injury report button!`
  }

  if (lastMessage.includes("news") || lastMessage.includes("update")) {
    return `I can show you real, breaking ${sport} news!

For current news:
• Click the news icon in the header for live updates
• Ask "What's the latest NBA news?" for recent stories
• Request "Any breaking news?" for urgent updates

All news comes from ESPN and official sources - completely accurate and current.`
  }

  // General response - NO FAKE DATA PROMISES
  return `I'm SLIPTACTIX with access to real-time ${sport} data sources!

I can provide:
🏀 Live games and scores (ESPN)
📊 Real props data (PrizePicks)  
🏥 Current injury reports (Official sources)
📰 Breaking news (ESPN/Official)

**Important:** I only provide real, accurate data - never mock or fake information.

Use the quick action buttons below or ask specific questions about live data. What real-time information would you like to see?`
}
