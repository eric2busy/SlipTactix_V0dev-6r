import { type NextRequest, NextResponse } from "next/server"
import { ragProcessor } from "@/lib/rag-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, context } = body

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage?.content || ""

    console.log("🎯 Processing user query through RAG:", userQuery)

    // Get the API key from environment variables (server-side only)
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY

    console.log("🔑 API Key check:", {
      grokKey: process.env.GROK_API_KEY ? "Present" : "Missing",
      xaiKey: process.env.XAI_API_KEY ? "Present" : "Missing",
      usingKey: apiKey ? "Found" : "Not found",
    })

    // Check if API key is available
    if (!apiKey) {
      console.log("⚠️ No Grok API key configured - using text-only responses")
      return NextResponse.json({
        response: generateTextOnlyResponse(messages, context),
        fallback: true,
        reason: "no_api_key",
      })
    }

    // **CRITICAL: Use RAG processor for ALL sports-related queries**
    const ragResponse = await ragProcessor.processQuery(userQuery)

    console.log("📊 RAG Response:", {
      confidence: ragResponse.confidence,
      sources: ragResponse.sources,
      hasData: !!ragResponse.dataUsed,
    })

    // Return the RAG-processed response
    return NextResponse.json({
      response: ragResponse.answer,
      dataUsed: ragResponse.dataUsed,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources,
      ragProcessed: true,
      model_used: "grok-3-mini-with-rag",
    })
  } catch (error) {
    console.error("Error in RAG-enhanced Grok chat:", error)

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

  return `I'm SLIPTACTIX with access to real-time ${sport} data sources!

I can provide:
🏀 Live games and scores (ESPN)
📊 Real props data (PrizePicks)  
🏥 Current injury reports (Official sources)
📰 Breaking news (ESPN/Official)

**Important:** I only provide real, accurate data - never mock or fake information.

Use the quick action buttons below or ask specific questions about live data. What real-time information would you like to see?`
}
