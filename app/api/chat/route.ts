/**
 * Chat API Endpoint
 * Handles user queries and orchestrates the RAG pipeline
 */

import { type NextRequest, NextResponse } from "next/server"
import { ragProcessor } from "@/lib/rag-processor"

interface ChatRequest {
  message: string
  context?: string
}

interface ChatResponse {
  response: string
  dataUsed?: any
  confidence?: number
  sources?: string[]
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, context } = body

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required and must be a non-empty string" }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long. Please keep it under 1000 characters." }, { status: 400 })
    }

    console.log("💬 Processing chat request:", message)

    // Process through RAG pipeline
    const ragResponse = await ragProcessor.processQuery(message)

    const response: ChatResponse = {
      response: ragResponse.answer,
      dataUsed: ragResponse.dataUsed,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources,
      timestamp: new Date().toISOString(),
    }

    console.log("✅ Chat response generated successfully")

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Chat API error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("busy")) {
        return NextResponse.json(
          {
            error: "Our AI assistant is currently busy. Please try again in a moment.",
            retryAfter: 5000, // milliseconds
          },
          { status: 429 },
        )
      }

      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 503 })
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}

// Handle GET requests for API documentation
export async function GET() {
  return NextResponse.json({
    name: "Sports Chat API",
    description: "AI-powered sports analysis using Grok 3 Mini with RAG",
    version: "1.0.0",
    endpoints: {
      "POST /api/chat": {
        description: "Send a sports-related query and get AI analysis",
        body: {
          message: "string (required) - Your sports question",
          context: "string (optional) - Additional context",
        },
        response: {
          response: "string - AI generated response",
          dataUsed: "object - Sports data used for analysis",
          confidence: "number - Confidence score (0-1)",
          sources: "array - Data sources used",
          timestamp: "string - Response timestamp",
        },
      },
    },
    examples: [
      "Who scored the most points in the last Lakers game?",
      "How did the Warriors perform in their recent games?",
      "What are LeBron James recent stats?",
    ],
  })
}
