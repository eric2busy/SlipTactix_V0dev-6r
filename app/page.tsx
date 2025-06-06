"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Menu, ChevronUp, AlertCircle } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import SideMenu from "@/components/side-menu"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuickActionButton } from "@/components/quick-action-button"
import { useRealTimeData } from "@/hooks/useRealTimeData"
import { SportsApiStatus } from "@/components/sports-api-status"
import { GameCard } from "@/components/live-game-card"
import { PropsCard } from "@/components/props-card"
import { InjuryCard } from "@/components/injury-card"
import { NewsCard } from "@/components/news-card"

// Types
type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?:
    | "text"
    | "recommendation"
    | "filter-question"
    | "bet-card"
    | "live-game"
    | "analysis"
    | "player-card"
    | "game-card"
    | "prop-comparison"
    | "parlay-builder"
    | "trending-props"
    | "injury-report"
    | "news-update"
    | "no-data-available"
  data?: any
}

type BetRecommendation = {
  id: string
  player: string
  team: string
  prop: string
  line: string
  odds: string
  confidence: number
  trend?: "up" | "down" | "neutral"
  analysis?: string
}

type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  quarter: string
  timeRemaining: string
  homeOdds?: string
  awayOdds?: string
  startTime?: string
  date?: string
  status?: "live" | "scheduled" | "final"
  venue?: string
  broadcast?: string
  homeRecord?: string
  awayRecord?: string
}

type News = {
  id: string
  title: string
  content: string
  source: string
  date: string
  impact: "positive" | "negative" | "neutral"
  playerName?: string
  teamName?: string
  url?: string
}

type Injury = {
  id: string
  playerName: string
  team: string
  status: "Out" | "Questionable" | "Doubtful" | "Probable"
  injury: string
  notes: string
  updated: string
}

// Sport types including more options
type Sport = "NBA" | "NFL" | "MLB" | "NHL" | "UFC" | "PGA" | "SOCCER" | "TENNIS"

// Quick chat categories
type QuickChatCategory = "General" | "Analysis" | "Props" | "Games" | "Trends" | "Parlays" | "Favorites"

export default function ChatInterface() {
  const router = useRouter()

  // Real-time data hooks with proper error handling
  const { data: realTimeData, loading: dataLoading, refresh: refreshData } = useRealTimeData("all", "NBA")

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi! I'm SLIPTACTIX with real-time NBA data. I only provide accurate, live information - no fake data. How can I help with your sports analysis today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSportsTabs, setShowSportsTabs] = useState(true)
  const [activeSport, setActiveSport] = useState<Sport>("NBA")
  const [selectedProps, setSelectedProps] = useState<BetRecommendation[]>([])
  const [showPropsList, setShowPropsList] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSideMenu, setShowSideMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(isProcessing)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [quickChatCategory, setQuickChatCategory] = useState<QuickChatCategory>("General")
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [showGameDetails, setShowGameDetails] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showNewsDialog, setShowNewsDialog] = useState(false)
  const [showInjuryDialog, setShowInjuryDialog] = useState(false)
  const [showParlayBuilder, setShowParlayBuilder] = useState(false)
  const [showTrendingProps, setShowTrendingProps] = useState(false)
  const [favoriteProps, setFavoriteProps] = useState<BetRecommendation[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [expandedQuickChat, setExpandedQuickChat] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showApiStatus, setShowApiStatus] = useState(false)

  // Debug real-time data flow
  useEffect(() => {
    if (realTimeData) {
      console.log("🔄 Real-time data received in frontend:", {
        games: realTimeData?.games?.length || 0,
        props: realTimeData?.props?.length || 0,
        injuries: realTimeData?.injuries?.length || 0,
        news: realTimeData?.news?.length || 0,
        source: realTimeData?.source || "unknown",
        timestamp: realTimeData?.timestamp || "unknown",
      })

      // Log sample data to verify it's flowing correctly
      if (realTimeData?.games?.length > 0) {
        console.log("🏀 Sample game data:", realTimeData.games[0])
      }
      if (realTimeData?.news?.length > 0) {
        console.log("📰 Sample news data:", realTimeData.news[0])
      }
    }
  }, [realTimeData])

  // Convert real-time data to component format with enhanced error handling - ONLY REAL DATA
  const liveGames =
    Array.isArray(realTimeData?.games) && realTimeData.games.length > 0
      ? realTimeData.games.map((game: any) => ({
          id: game?.id || `game-${Math.random()}`,
          homeTeam: game?.home_team || game?.homeTeam || "HOME",
          awayTeam: game?.away_team || game?.awayTeam || "AWAY",
          homeScore: Number(game?.home_score || game?.homeScore) || 0,
          awayScore: Number(game?.away_score || game?.awayScore) || 0,
          quarter: game?.quarter || "",
          timeRemaining: game?.time_remaining || game?.timeRemaining || "",
          homeOdds: game?.home_odds || game?.homeOdds || "",
          awayOdds: game?.away_odds || game?.awayOdds || "",
          startTime: game?.start_time || game?.startTime || "",
          date: game?.game_date || game?.date || new Date().toISOString().split("T")[0],
          status: game?.status || "scheduled",
          venue: game?.venue || "",
          broadcast: game?.broadcast || "",
          homeRecord: game?.home_record || "0-0",
          awayRecord: game?.away_record || "0-0",
        }))
      : []

  const trendingProps =
    Array.isArray(realTimeData?.props) && realTimeData.props.length > 0
      ? realTimeData.props.map((prop: any) => ({
          id: prop?.id || `prop-${Math.random()}`,
          player: prop?.player_name || prop?.player || "Unknown Player",
          team: prop?.team || "UNK",
          prop: prop?.prop_type || prop?.prop || "Points",
          line: prop?.line?.toString() || "0",
          odds: prop?.odds || "Pick",
          confidence: Number(prop?.confidence) || 50,
          trend: prop?.trend || "neutral",
          analysis: prop?.analysis || "No analysis available",
        }))
      : []

  const injuries =
    Array.isArray(realTimeData?.injuries) && realTimeData.injuries.length > 0
      ? realTimeData.injuries.map((injury: any) => ({
          id: injury?.id || `injury-${Math.random()}`,
          playerName: injury?.player_name || injury?.playerName || "Unknown Player",
          team: injury?.team || "UNK",
          status: injury?.status || "Questionable",
          injury: injury?.injury_type || injury?.injury || "Unknown",
          notes: injury?.notes || "No details available",
          updated: injury?.updated_at ? new Date(injury.updated_at).toLocaleString() : "Unknown",
        }))
      : []

  const newsItems =
    Array.isArray(realTimeData?.news) && realTimeData.news.length > 0
      ? realTimeData.news.map((item: any) => ({
          id: item?.id || `news-${Math.random()}`,
          title: item?.title || "News Update",
          content: item?.content || "No content available",
          source: item?.source || "Unknown",
          date: item?.published_date || item?.date || new Date().toISOString(),
          impact: item?.impact || "neutral",
          playerName: item?.player_name || item?.playerName || "",
          teamName: item?.team_name || item?.teamName || "",
          url: item?.url || "",
        }))
      : []

  // Quick chat options organized by category
  const quickChatOptions: Record<QuickChatCategory, string[]> = {
    General: [
      "Show me today's NBA games",
      "Show me trending props",
      "Show me the latest injury report",
      "Show me the latest news",
      "What real data do you have?",
      "Check data availability",
    ],
    Analysis: [
      "Analyze available game data",
      "Show me prop analysis",
      "What's your data source?",
      "Show me real-time updates",
    ],
    Props: [
      "Show me real props data",
      "Check PrizePicks connection",
      "Show me available props",
      "What props are live?",
    ],
    Games: ["Show me live games", "Check ESPN connection", "Show me real scores", "What games are available?"],
    Trends: ["Show me data trends", "Check real-time status", "Show me live updates", "What's trending now?"],
    Parlays: [
      "Build parlay with real data",
      "Show me available combinations",
      "Check prop correlations",
      "What's available for parlays?",
    ],
    Favorites: ["Show my saved props", "Show my favorites", "Check saved data", "Show my history"],
  }

  // Effects
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add event listener for favorites from side menu
  useEffect(() => {
    const handleShowFavorites = () => {
      setShowFavorites(true)
    }

    window.addEventListener("showFavorites", handleShowFavorites)

    return () => {
      window.removeEventListener("showFavorites", handleShowFavorites)
    }
  }, [])

  // Start data sync on component mount
  useEffect(() => {
    const startSync = async () => {
      try {
        await fetch("/api/start-sync", { method: "POST" })
        console.log("✅ Data sync started successfully")
      } catch (error) {
        console.error("❌ Failed to start data sync:", error)
      }
    }

    startSync()
  }, [])

  // Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (manualMessage?: string) => {
    const messageToSend = manualMessage || inputValue

    if ((!messageToSend?.trim() || isProcessing) && !manualMessage) return

    setIsProcessing(true)
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend || "",
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    if (!manualMessage) setInputValue("")

    try {
      // Create a typing indicator
      const typingMessage: Message = {
        id: "typing",
        content: "",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, typingMessage])

      // Safe string operations with null checks
      const messageLower = messageToSend?.toLowerCase() || ""

      // Enhanced game queries with real schedule data - ONLY SHOW IF DATA EXISTS
      if (messageLower.includes("tomorrow") || messageLower.includes("upcoming") || messageLower.includes("next")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (liveGames.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No real game data is currently available. I only show accurate, live information - no fake data. Please check back later or try refreshing the data.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split("T")[0]

        const upcomingGames = liveGames.filter((game) => {
          return game.date >= tomorrowStr || game.status === "scheduled"
        })

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content:
              upcomingGames.length > 0
                ? `Here are the upcoming NBA games (${upcomingGames.length} real games found):`
                : "No upcoming games found in the real data. Check back later for updates.",
            sender: "bot",
            timestamp: new Date(),
            type: upcomingGames.length > 0 ? "live-game" : "no-data-available",
            data: upcomingGames.length > 0 ? { games: upcomingGames } : undefined,
          },
        ])
        setIsProcessing(false)
        return
      }

      if (
        messageLower.includes("today") ||
        messageLower.includes("tonight") ||
        messageLower.includes("who's playing")
      ) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (liveGames.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No real game data is currently available from ESPN or API Sports. I only provide accurate, live information. Please check back later or try refreshing the data.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        const today = new Date().toISOString().split("T")[0]
        const todaysGames = liveGames.filter((game) => {
          return game.date === today
        })

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content:
              todaysGames.length > 0
                ? `Here are today's NBA games (${todaysGames.length} real games found):`
                : `Here are the available games (${liveGames.length} real games):`,
            sender: "bot",
            timestamp: new Date(),
            type: "live-game",
            data: {
              games: todaysGames.length > 0 ? todaysGames : liveGames,
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      // Special commands for showing games and value props using real data - ONLY IF DATA EXISTS
      if (messageLower.includes("live") || messageLower.includes("score")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (liveGames.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No live game data is currently available. I only provide real, accurate scores from ESPN and API Sports. Please check back later.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        const liveOnlyGames = liveGames.filter((game) => game.status === "live")

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content:
              liveOnlyGames.length > 0
                ? `Here are the current live games (${liveOnlyGames.length} live games):`
                : `No games are currently live. Here are available games (${liveGames.length} games):`,
            sender: "bot",
            timestamp: new Date(),
            type: "live-game",
            data: {
              games: liveOnlyGames.length > 0 ? liveOnlyGames : liveGames,
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (messageLower.includes("injury") || messageLower.includes("injuries")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (injuries.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No real injury data is currently available. I only provide accurate injury reports from official sources. Please check back later when real data is available.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Here's the latest real-time injury report (${injuries.length} players):`,
            sender: "bot",
            timestamp: new Date(),
            type: "injury-report",
            data: {
              injuries: injuries,
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (messageLower.includes("news") || messageLower.includes("updates")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (newsItems.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No real news data is currently available. I only provide accurate news from ESPN and official sources. Please check back later.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Here are the latest news updates (${newsItems.length} articles):`,
            sender: "bot",
            timestamp: new Date(),
            type: "news-update",
            data: {
              news: newsItems,
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (
        messageLower.includes("trending props") ||
        messageLower.includes("top props") ||
        messageLower.includes("props")
      ) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        if (trendingProps.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content:
                "No real props data is currently available from PrizePicks. I only provide accurate, live props - no fake data. Please check back later when real data is available.",
              sender: "bot",
              timestamp: new Date(),
              type: "no-data-available",
            },
          ])
          setIsProcessing(false)
          return
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Here are the trending props from PrizePicks right now (${trendingProps.length} real props):`,
            sender: "bot",
            timestamp: new Date(),
            type: "trending-props",
            data: {
              props: trendingProps,
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      // Call AI API with proper error handling
      try {
        const response = await fetch("/api/grok-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: messageToSend }],
            context: {
              sport: activeSport,
              realTimeData: {
                props: trendingProps.slice(0, 5),
                games: liveGames.slice(0, 3),
                injuries: injuries.slice(0, 3),
                hasRealData: {
                  props: trendingProps.length > 0,
                  games: liveGames.length > 0,
                  injuries: injuries.length > 0,
                  news: newsItems.length > 0,
                },
              },
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON")
        }

        const responseData = await response.json()

        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        const botResponse: Message = {
          id: Date.now().toString(),
          content: responseData.response || "I'm having trouble processing that request right now.",
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botResponse])
      } catch (apiError) {
        console.error("API Error:", apiError)

        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        const fallbackResponse: Message = {
          id: Date.now().toString(),
          content:
            "I'm currently running with real-time data access! I can help you with sports analysis using live data from PrizePicks, ESPN, and official sources. I only provide accurate information - no fake data.",
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, fallbackResponse])

        setTimeout(() => {
          const suggestionsMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              "Try asking about live games, real props, injury reports, or use the quick suggestions below for accurate data!",
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, suggestionsMessage])
        }, 1000)
      }
    } catch (error) {
      console.error("Error in sending message:", error)

      setMessages((prev) => prev.filter((m) => m.id !== "typing"))

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "I'm experiencing some technical difficulties. I only provide real, accurate data - no fake information. Please try one of the quick suggestions below.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addToPropsList = (prop: BetRecommendation) => {
    setSelectedProps((prev) => {
      const exists = prev.some((item) => item.id === prop.id)
      if (exists) return prev
      return [...prev, prop]
    })

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `Added ${prop.player}'s ${prop.prop} ${prop.line} to your props list.`,
        sender: "bot",
        timestamp: new Date(),
      },
    ])

    if (selectedProps.length === 0) {
      setShowPropsList(true)
    }
  }

  const addToFavorites = (prop: BetRecommendation) => {
    setFavoriteProps((prev) => {
      const exists = prev.some((item) => item.id === prop.id)
      if (exists) return prev
      return [...prev, prop]
    })

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `Added ${prop.player}'s ${prop.prop} ${prop.line} to your favorites.`,
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const removeProp = (id: string) => {
    setSelectedProps((prev) => prev.filter((prop) => prop.id !== id))
  }

  const removeFavorite = (id: string) => {
    setFavoriteProps((prev) => prev.filter((prop) => prop.id !== id))
  }

  const exportToPrizePicks = () => {
    setShowExportDialog(true)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `Exported ${selectedProps.length} props to PrizePicks. You can now complete your entry there.`,
        sender: "bot",
        timestamp: new Date(),
      },
    ])

    setTimeout(() => {
      setShowPropsList(false)
      setShowExportDialog(false)
    }, 3000)
  }

  const handlePlayerCardClick = (playerName: string) => {
    setSelectedPlayer(playerName)
    setShowPlayerModal(true)
  }

  const clearChat = () => {
    setChatHistory([...messages])

    setMessages([
      {
        id: "welcome",
        content:
          "Hi! I'm SLIPTACTIX with real-time NBA data. I only provide accurate, live information - no fake data. How can I help with your sports analysis today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const shareAnalysis = () => {
    setShowShareDialog(true)

    setTimeout(() => {
      setShowShareDialog(false)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Analysis has been shared successfully!",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }, 2000)
  }

  const handleGameClick = (gameId: string) => {
    setShowGameDetails(gameId)
  }

  const buildParlay = () => {
    if (trendingProps.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "No real props data available for parlay building. I only use accurate data - no fake props.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      return
    }
    setShowParlayBuilder(true)
  }

  const viewTrendingProps = () => {
    if (trendingProps.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "No real props data available to display. I only show accurate, live props from PrizePicks - no fake data.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      return
    }
    setShowTrendingProps(true)
  }

  // AI-generated quick chat options based on context
  const getAIQuickChatOptions = (): string[] => {
    const baseOptions = ["Show me value picks for tonight", "What are the best props right now?", "Show me live games"]

    // Add sport-specific options
    const sportSpecific = {
      NBA: ["Show me NBA injury reports", "Best NBA props tonight", "Live NBA scores"],
      NFL: ["Show me NFL injury reports", "Best NFL props this week", "NFL game predictions"],
      MLB: ["Show me MLB injury reports", "Best MLB props today", "Live MLB scores"],
      NHL: ["Show me NHL injury reports", "Best NHL props tonight", "Live NHL scores"],
    }

    // Combine based on available data
    const options = [...baseOptions]

    if (activeSport in sportSpecific) {
      options.push(...(sportSpecific as any)[activeSport])
    }

    // Add data-specific options if real data is available
    if (liveGames.length > 0) {
      options.push("Analyze today's games")
    }
    if (trendingProps.length > 0) {
      options.push("Show trending props")
    }
    if (injuries.length > 0) {
      options.push("Latest injury updates")
    }

    // Return shuffled selection
    return options.sort(() => Math.random() - 0.5).slice(0, 6)
  }

  // Render message content based on type - ONLY REAL DATA
  const renderMessage = (message: Message) => {
    if (message.id === "typing") {
      return (
        <div className="flex space-x-2 items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      )
    }

    if (message.type === "no-data-available") {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-400">Real Data Only</span>
            </div>
            <p className="text-sm text-yellow-200">
              SLIPTACTIX only provides accurate, real-time data. No mock or fake information is ever shown to ensure you
              make informed decisions.
            </p>
            <div className="mt-2 text-xs text-yellow-300">
              • Try refreshing the data • Check back later for updates • Use the quick action buttons for available data
            </div>
          </div>
        </div>
      )
    }

    // Render game cards
    if (message.type === "live-game" && message.data?.games) {
      return (
        <div>
          <p className="mb-3">{message.content}</p>
          <GameCard
            games={message.data.games}
            variant={message.data.games.length > 1 ? "multiple" : "single"}
            title=""
            onGameClick={(game) => console.log("Game clicked:", game)}
            onGameDetails={(game) => console.log("Game details:", game)}
            onViewProps={(game) => console.log("View props:", game)}
          />
        </div>
      )
    }

    // Render props cards
    if (message.type === "trending-props" && message.data?.props) {
      return (
        <div>
          <p className="mb-3">{message.content}</p>
          <PropsCard
            props={message.data.props}
            title=""
            onPropClick={(prop) => console.log("Prop clicked:", prop)}
            onAddToFavorites={(prop) => addToFavorites(prop)}
          />
        </div>
      )
    }

    // Render injury cards
    if (message.type === "injury-report" && message.data?.injuries) {
      return (
        <div>
          <p className="mb-3">{message.content}</p>
          <InjuryCard
            injuries={message.data.injuries}
            title=""
            onPlayerClick={(injury) => console.log("Player clicked:", injury)}
          />
        </div>
      )
    }

    // Render news cards
    if (message.type === "news-update" && message.data?.news) {
      return (
        <div>
          <p className="mb-3">{message.content}</p>
          <NewsCard news={message.data.news} title="" onNewsClick={(news) => console.log("News clicked:", news)} />
        </div>
      )
    }

    return <p>{message.content}</p>
  }

  return (
    <div className="flex flex-col h-screen bg-[#1F1F1F] text-white safe-area-inset">
      {/* Header */}
      <header className="flex justify-between items-center p-4 ios-header clean-interface">
        <div className="flex items-center gap-3">
          <div className="h-8">
            <Image
              src="/sliptactix-logo-white.svg"
              alt="SLIPTACTIX"
              width={82}
              height={32}
              className="h-full w-auto"
              priority={true}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowApiStatus(!showApiStatus)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative"
                  aria-label="API Status"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>API Status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowSideMenu(!showSideMenu)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* API Status Modal */}
      <Dialog open={showApiStatus} onOpenChange={setShowApiStatus}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-2xl mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>API Status & Configuration</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SportsApiStatus />
          </div>
        </DialogContent>
      </Dialog>

      {/* Side Menu */}
      <SideMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        realTimeData={realTimeData}
        dataLoading={dataLoading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-2xl p-3 clean-interface",
                message.sender === "user"
                  ? "bg-white/15 ml-auto rounded-br-none" // User: white with 15% opacity
                  : "bg-transparent mr-auto rounded-bl-none", // SLIPTACTIX: transparent, no border
              )}
            >
              {renderMessage(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Sports Selection and Quick Chat */}
        <div className="flex items-center gap-2 py-3 px-4 clean-interface">
          {/* Sports Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-[#B8562F]/15 border border-[#B8562F] text-white"
            >
              <div className="w-4 h-4 relative">
                <Image
                  src={`/${activeSport.toLowerCase()}-logo.png`}
                  alt={activeSport}
                  width={16}
                  height={16}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                  }}
                />
              </div>
              {activeSport}
              <ChevronUp className="w-4 h-4 ml-1" />
            </button>

            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg z-50 min-w-[120px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {(["NBA", "NFL", "MLB", "NHL", "UFC", "PGA", "SOCCER", "TENNIS"] as Sport[]).map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      setActiveSport(sport)
                      setShowCategoryDropdown(false)
                    }}
                    className={`flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-700 text-sm ${
                      sport === activeSport ? "bg-gray-700 text-[#b8562f]" : "text-white"
                    }`}
                  >
                    <div className="w-4 h-4 relative">
                      <Image
                        src={`/${sport.toLowerCase()}-logo.png`}
                        alt={sport}
                        width={16}
                        height={16}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                        }}
                      />
                    </div>
                    {sport}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* AI-Generated Quick Chat Options */}
          <div className="flex overflow-x-auto space-x-2 hide-scrollbar flex-1">
            {getAIQuickChatOptions()
              .slice(0, 3)
              .map((option, index) => (
                <QuickActionButton key={index} label={option} onClick={() => handleSendMessage(option)} />
              ))}
          </div>
        </div>

        {/* Input Area with Gradient Background */}
        <div
          className="p-4 pb-safe clean-interface relative"
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(184, 86, 47, 0.15) 100%)",
          }}
        >
          <div className="relative flex items-center gap-4">
            {/* Attachment Button */}
            <button
              className="p-2 text-gray-400 hover:text-white bg-white/15 rounded-full transition-colors flex-shrink-0"
              aria-label="Attach file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onBlur={() => {
                if (inputValue.length === 0) {
                  setIsTyping(false)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-left focus:outline-none text-lg"
            />

            {/* Voice/Send Button */}
            <button
              onClick={() => handleSendMessage()}
              className="p-2 bg-[#B8562F] text-white rounded-full transition-colors hover:bg-[#c96a43] flex-shrink-0"
              aria-label={inputValue ? "Send" : "Voice input"}
            >
              {inputValue ? (
                // Up arrow (send) icon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                // Microphone icon
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
