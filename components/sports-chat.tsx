/**
 * Frontend Chat Component
 * React component for integrating with the sports chat API
 */

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, AlertCircle, TrendingUp } from "lucide-react"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  dataUsed?: any
  confidence?: number
  sources?: string[]
}

interface ChatResponse {
  response: string
  dataUsed?: any
  confidence?: number
  sources?: string[]
  timestamp: string
}

export default function SportsChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hi! I'm your sports analysis assistant. Ask me about any team or player stats, recent games, or performance analysis.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data: ChatResponse = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "assistant",
        timestamp: new Date(data.timestamp),
        dataUsed: data.dataUsed,
        confidence: data.confidence,
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exampleQueries = [
    "Who scored the most points in the last Lakers game?",
    "How did the Warriors perform in their recent games?",
    "Show me the Celtics recent game results",
    "What are the latest NBA standings?",
  ]

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border border-gray-200 rounded-lg bg-white shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Sports Analysis Assistant
        </h2>
        <p className="text-blue-100 text-sm">Powered by Grok 3 Mini with real-time sports data</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`${
                message.sender === "user"
                  ? "max-w-[80%] bg-blue-600 text-white"
                  : "max-w-[85%] bg-gray-100 text-gray-800"
              } rounded-lg p-3 inline-block`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Show data sources and confidence for assistant messages */}
              {message.sender === "assistant" && (message.sources || message.confidence) && (
                <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                  {message.confidence && (
                    <div className="text-gray-600">Confidence: {Math.round(message.confidence * 100)}%</div>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="text-gray-600">Sources: {message.sources.join(", ")}</div>
                  )}
                </div>
              )}

              <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-600">Analyzing sports data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Example Queries */}
      {messages.length === 1 && (
        <div className="mx-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setInputValue(query)}
                className="text-left text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about any team or player..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
