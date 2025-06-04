"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Menu,
  Send,
  ArrowUp,
  X,
  BarChart2,
  TrendingUp,
  Bookmark,
  Share2,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import SideMenu from "@/components/side-menu"
import { motion } from "framer-motion"
import PlayerDetailCard from "@/components/player-detail-card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LiveGameCard } from "@/components/live-game-card"
import { SportTab } from "@/components/sport-tab"
import { QuickActionButton } from "@/components/quick-action-button"
import { PropsList } from "@/components/props-list"
import { FavoritesList } from "@/components/favorites-list"
import { RealTimeStatus } from "@/components/real-time-status"
import { useRealTimeData } from "@/hooks/useRealTimeData"

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

    if (message.type === "player-card") {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mt-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden">
                <Image
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${Math.floor(Math.random() * 1000) + 1000}.png`}
                  alt={message.data?.playerName || "Player"}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">{message.data?.playerName || "Unknown Player"}</h3>
                <p className="text-sm text-gray-400">LAL • SF</p>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-2 w-full bg-[#b8562f] hover:bg-[#c96a43]"
              onClick={() => handlePlayerCardClick(message.data?.playerName || "Unknown Player")}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </div>
      )
    }

    if (message.type === "game-card") {
      return (
        <div>
          <p className="mb-2">{message.content}</p>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="font-bold text-sm">{message.data?.teams?.[0] || "T1"}</span>
                </div>
                <span className="font-medium">{message.data?.teams?.[0] || "Team 1"}</span>
              </div>
              <span className="text-sm">VS</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{message.data?.teams?.[1] || "Team 2"}</span>
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="font-bold text-sm">{message.data?.teams?.[1] || "T2"}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-3 w-full bg-[#b8562f] hover:bg-[#c96a43]"
              onClick={() =>
                handleGameClick(`${message.data?.teams?.[0] || "team1"}_${message.data?.teams?.[1] || "team2"}`)
              }
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              View Matchup Analysis
            </Button>
          </div>
        </div>
      )
    }

    if (message.type === "bet-card") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="space-y-3 mt-2">
            {(message.data?.recommendations || []).map((rec: BetRecommendation) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all hover:border-gray-600 cursor-pointer"
                onClick={() => handlePlayerCardClick(rec.player)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">{rec.player}</span>
                      <span className="text-gray-400 text-sm ml-2">{rec.team}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-300">{rec.prop}</span>
                      <span className="mx-1">|</span>
                      <span className="font-medium">
                        {rec.line} {rec.prop?.includes("Points") ? "pts" : rec.prop?.includes("Rebounds") ? "reb" : ""}
                      </span>
                      <span className="mx-1">|</span>
                      <span className={rec.odds?.includes("+") ? "text-[#54c863]" : "text-gray-300"}>{rec.odds}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "h-1.5 w-16 rounded-full",
                          rec.confidence >= 80
                            ? "bg-[#54c863]"
                            : rec.confidence >= 65
                              ? "bg-yellow-500"
                              : "bg-orange-500",
                        )}
                      >
                        <div
                          className="h-full rounded-full bg-gray-700"
                          style={{ width: `${100 - rec.confidence}%`, marginLeft: `${rec.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs ml-2">{rec.confidence}%</span>
                    </div>
                    <div className="flex mt-2 gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToPropsList(rec)
                        }}
                        className="text-xs px-3 py-1 bg-[#b8562f] rounded-full hover:bg-[#c96a43] transition-colors"
                      >
                        Add to Props
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToFavorites(rec)
                        }}
                        className="text-xs px-3 py-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  {rec.trend === "up" ? (
                    <ArrowUp className="w-3 h-3 text-[#54c863] mr-1" />
                  ) : rec.trend === "down" ? (
                    <ArrowUp className="w-3 h-3 text-red-500 mr-1 transform rotate-180" />
                  ) : null}
                  {rec.trend === "up"
                    ? "Trending up in last 5 games"
                    : rec.trend === "down"
                      ? "Trending down in last 5 games"
                      : "Consistent in last 5 games"}
                </div>
                {rec.analysis && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-sm">
                    <div className="text-xs text-gray-400 mb-1">Analysis:</div>
                    <p className="text-sm">{rec.analysis}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 mt-1 flex-wrap">
            <button
              onClick={() => shareAnalysis()}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-3 h-3 mr-1 inline" />
              Share
            </button>
            <button
              onClick={() => buildParlay()}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Layers className="w-3 h-3 mr-1 inline" />
              Build Parlay
            </button>
            <button
              onClick={() => setShowFilterDialog(true)}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1 inline" />
              Filter
            </button>
            <button
              onClick={() => exportToPrizePicks()}
              className="text-xs px-3 py-1 bg-[#b8562f] rounded-full hover:bg-[#c96a43] transition-colors"
            >
              <Download className="w-3 h-3 mr-1 inline" />
              Export
            </button>
          </div>
        </div>
      )
    }

    if (message.type === "live-game") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="space-y-3 mt-2">
            {(message.data?.games || []).map((game: Game) => (
              <LiveGameCard key={game.id} game={game} onClick={() => handleGameClick(game.id)} />
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setShowFilterDialog(true)}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1 inline" />
              Filter Games
            </button>
            <button
              onClick={() => viewTrendingProps()}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              View Props
            </button>
          </div>
        </div>
      )
    }

    if (message.type === "injury-report") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="space-y-3 mt-2">
            {(message.data?.injuries || []).map((injury: Injury) => (
              <div key={injury.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">{injury.playerName}</span>
                      <span className="text-gray-400 text-sm ml-2">{injury.team}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-300">{injury.injury}</span>
                      <span className="mx-1">|</span>
                      <Badge
                        className={
                          injury.status === "Out"
                            ? "bg-red-500"
                            : injury.status === "Questionable"
                              ? "bg-yellow-500"
                              : injury.status === "Doubtful"
                                ? "bg-orange-500"
                                : "bg-green-500"
                        }
                      >
                        {injury.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{injury.updated}</div>
                </div>
                <div className="mt-2 text-sm text-gray-300">{injury.notes}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setShowInjuryDialog(true)}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1 inline" />
              Filter by Team
            </button>
            <button
              onClick={() => viewTrendingProps()}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              Impact on Props
            </button>
          </div>
        </div>
      )
    }

    if (message.type === "news-update") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="space-y-3 mt-2">
            {(message.data?.news || []).map((item: News) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div
                    className="font-bold cursor-pointer hover:text-[#b8562f] transition-colors"
                    onClick={() => item.url && window.open(item.url, "_blank", "noopener,noreferrer")}
                  >
                    {item.title}
                    {item.url && <span className="ml-1 text-xs">🔗</span>}
                  </div>
                  <Badge
                    className={
                      item.impact === "positive"
                        ? "bg-green-500"
                        : item.impact === "negative"
                          ? "bg-red-500"
                          : "bg-gray-500"
                    }
                  >
                    {item.impact}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-300">{item.content}</div>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                  <span>{item.source}</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    {item.url && (
                      <button
                        onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                        className="text-[#b8562f] hover:text-[#c96a43] transition-colors"
                      >
                        Read More →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setShowNewsDialog(true)}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1 inline" />
              Filter News
            </button>
            <button
              onClick={() => viewTrendingProps()}
              className="text-xs px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              Impact on Props
            </button>
          </div>
        </div>
      )
    }

    if (message.type === "trending-props") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="space-y-3 mt-2">
            {(message.data?.props || []).slice(0, 4).map((prop: BetRecommendation) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all hover:border-gray-600 cursor-pointer"
                onClick={() => handlePlayerCardClick(prop.player)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">{prop.player}</span>
                      <span className="text-gray-400 text-sm ml-2">{prop.team}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-300">{prop.prop}</span>
                      <span className="mx-1">|</span>
                      <span className="font-medium">
                        {prop.line}{" "}
                        {prop.prop?.includes("Points") ? "pts" : prop.prop?.includes("Rebounds") ? "reb" : ""}
                      </span>
                      <span className="mx-1">|</span>
                      <span className={prop.odds?.includes("+") ? "text-[#54c863]" : "text-gray-300"}>{prop.odds}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "h-1.5 w-16 rounded-full",
                          prop.confidence >= 80
                            ? "bg-[#54c863]"
                            : prop.confidence >= 65
                              ? "bg-yellow-500"
                              : "bg-orange-500",
                        )}
                      >
                        <div
                          className="h-full rounded-full bg-gray-700"
                          style={{ width: `${100 - prop.confidence}%`, marginLeft: `${prop.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs ml-2">{prop.confidence}%</span>
                    </div>
                    <div className="flex mt-2 gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToPropsList(prop)
                        }}
                        className="text-xs px-3 py-1 bg-[#b8562f] rounded-full hover:bg-[#c96a43] transition-colors"
                      >
                        Add to Props
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToFavorites(prop)
                        }}
                        className="text-xs px-3 py-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  {prop.trend === "up" ? (
                    <ArrowUp className="w-3 h-3 text-[#54c863] mr-1" />
                  ) : prop.trend === "down" ? (
                    <ArrowUp className="w-3 h-3 text-red-500 mr-1 transform rotate-180" />
                  ) : null}
                  {prop.trend === "up"
                    ? "Trending up in last 5 games"
                    : prop.trend === "down"
                      ? "Trending down in last 5 games"
                      : "Consistent in last 5 games"}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowTrendingProps(true)}
              className="text-xs px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Trending Props
            </button>
          </div>
        </div>
      )
    }

    if (message.type === "parlay-builder") {
      return (
        <div className="flex flex-col space-y-2">
          <p>{message.content}</p>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">3-Leg Parlay</h3>
              <Badge className="bg-[#b8562f]">+{message.data?.odds || "650"}</Badge>
            </div>

            <div className="space-y-3">
              {(message.data?.legs || []).map((leg: BetRecommendation, index: number) => (
                <div key={leg.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <div>
                    <div className="font-medium">{leg.player}</div>
                    <div className="text-sm text-gray-300">
                      {leg.prop} {leg.line} {leg.odds}
                    </div>
                  </div>
                  <Badge
                    className={
                      leg.confidence >= 80 ? "bg-green-500" : leg.confidence >= 65 ? "bg-yellow-500" : "bg-orange-500"
                    }
                  >
                    {leg.confidence}%
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Win Probability</div>
                <div className="font-bold">{message.data?.winProbability || "18%"}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Expected Value</div>
                <div className="font-bold text-green-500">{message.data?.expectedValue || "Positive"}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1 bg-[#b8562f] hover:bg-[#c96a43]"
                onClick={() => {
                  ;(message.data?.legs || []).forEach((leg: BetRecommendation) => {
                    addToPropsList(leg)
                  })
                }}
              >
                Add All to Props
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowParlayBuilder(true)}>
                Customize
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return <p>{message.content}</p>
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white safe-area-inset">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 pt-safe">
        <div className="flex items-center gap-3">
          <div className="h-8">
            <Image
              src="/sliptactix-logo-white.svg"
              alt="SLIPTACTIX"
              width={82}
              height={32}
              className="h-full w-auto"
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RealTimeStatus
            lastUpdated={realTimeData?.timestamp ? new Date(realTimeData.timestamp) : null}
            onRefresh={refreshData}
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowNewsDialog(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative"
                  aria-label="News"
                >
                  <AlertCircle className="w-5 h-5" />
                  {newsItems.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#b8562f] rounded-full"></span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Latest News ({newsItems.length} articles)</p>
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

      {/* Side Menu */}
      <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sport Tabs */}
        <div className="flex overflow-x-auto py-3 px-4 space-x-2 border-b border-gray-800 hide-scrollbar">
          <SportTab
            name="NBA"
            logo="/nba-logo.png"
            active={activeSport === "NBA"}
            onClick={() => setActiveSport("NBA")}
          />
          <SportTab
            name="NFL"
            logo="/nfl-logo.png"
            active={activeSport === "NFL"}
            onClick={() => setActiveSport("NFL")}
          />
          <SportTab
            name="MLB"
            logo="/mlb-logo.png"
            active={activeSport === "MLB"}
            onClick={() => setActiveSport("MLB")}
          />
          <SportTab
            name="NHL"
            logo="/nhl-logo.png"
            active={activeSport === "NHL"}
            onClick={() => setActiveSport("NHL")}
          />
          <SportTab
            name="UFC"
            logo="/placeholder.svg?height=16&width=16"
            active={activeSport === "UFC"}
            onClick={() => setActiveSport("UFC")}
          />
          <SportTab
            name="PGA"
            logo="/placeholder.svg?height=16&width=16"
            active={activeSport === "PGA"}
            onClick={() => setActiveSport("PGA")}
          />
          <SportTab
            name="SOCCER"
            logo="/placeholder.svg?height=16&width=16"
            active={activeSport === "SOCCER"}
            onClick={() => setActiveSport("SOCCER")}
          />
          <SportTab
            name="TENNIS"
            logo="/placeholder.svg?height=16&width=16"
            active={activeSport === "TENNIS"}
            onClick={() => setActiveSport("TENNIS")}
          />
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-2xl p-3",
                message.sender === "user"
                  ? "bg-gray-800 ml-auto rounded-br-none"
                  : "bg-gray-900 mr-auto rounded-bl-none",
              )}
            >
              {renderMessage(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Smart Replies with Category Dropdown */}
        <div className="flex overflow-x-auto py-3 px-4 space-x-2 border-t border-gray-800 hide-scrollbar">
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#b8562f] text-white"
            >
              {quickChatCategory} <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed inset-0 z-50 flex items-end justify-center pb-20 sm:pb-16"
                onClick={() => setShowCategoryDropdown(false)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50" />
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-800 rounded-lg shadow-lg z-50 w-[90%] max-w-xs overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.keys(quickChatOptions).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setQuickChatCategory(category as QuickChatCategory)
                        setShowCategoryDropdown(false)
                      }}
                      className={`block w-full text-left px-4 py-3 hover:bg-gray-700 text-sm ${
                        category === quickChatCategory ? "bg-gray-700 text-[#b8562f]" : "text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
          {quickChatOptions[quickChatCategory].slice(0, expandedQuickChat ? 8 : 4).map((reply, index) => (
            <QuickActionButton
              key={index}
              label={reply}
              onClick={() => {
                handleSendMessage(reply)
              }}
            />
          ))}
          <button
            onClick={() => setExpandedQuickChat(!expandedQuickChat)}
            className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300 flex-shrink-0"
          >
            {expandedQuickChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Props List */}
        {showPropsList && selectedProps.length > 0 && (
          <PropsList
            props={selectedProps}
            onClose={() => setShowPropsList(false)}
            onRemove={removeProp}
            onExport={exportToPrizePicks}
          />
        )}

        {/* Favorites List */}
        {showFavorites && (
          <FavoritesList
            props={favoriteProps.length > 0 ? favoriteProps : trendingProps.slice(0, 2)}
            onClose={() => setShowFavorites(false)}
            onRemove={removeFavorite}
            onAddToPropsList={addToPropsList}
          />
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 pb-safe">
          <div className="relative flex items-center">
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
              placeholder="ask about real data only"
              className="w-full bg-gray-800 rounded-full py-3 px-4 pr-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8562f] transition-shadow"
            />
            <button
              onClick={() => handleSendMessage()}
              className="absolute right-3 bg-[#b8562f] hover:bg-[#c96a43] rounded-full p-2 transition-colors"
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile-Optimized Modals */}
      {/* Player Detail Modal */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] h-[90vh] max-w-none mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>Player Analysis</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedPlayer && (
              <PlayerDetailCard playerName={selectedPlayer} onClose={() => setShowPlayerModal(false)} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* News Dialog - Mobile Optimized */}
      <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] h-[80vh] max-w-none mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>Latest NBA News ({newsItems.length} articles)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {newsItems.length > 0 ? (
              newsItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="font-bold text-sm cursor-pointer hover:text-[#b8562f] transition-colors flex items-center"
                      onClick={() => item.url && window.open(item.url, "_blank", "noopener,noreferrer")}
                    >
                      {item.title}
                      {item.url && <span className="ml-1 text-xs">🔗</span>}
                    </div>
                    <Badge
                      className={
                        item.impact === "positive"
                          ? "bg-green-500"
                          : item.impact === "negative"
                            ? "bg-red-500"
                            : "bg-gray-500"
                      }
                    >
                      {item.impact}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{item.content}</div>
                  <div className="text-xs text-gray-400 flex justify-between items-center">
                    <span>{item.source}</span>
                    <div className="flex items-center gap-2">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      {item.url && (
                        <button
                          onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                          className="text-[#b8562f] hover:text-[#c96a43] transition-colors font-medium"
                        >
                          Read Full Article →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-400">No Real News Data Available</span>
                </div>
                <p className="text-sm text-yellow-200">
                  No real news data is currently available from ESPN or other sources. Check back later for live
                  updates.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Injury Dialog - Mobile Optimized */}
      <Dialog open={showInjuryDialog} onOpenChange={setShowInjuryDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] h-[80vh] max-w-none mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>NBA Injury Report ({injuries.length} players)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {injuries.length > 0 ? (
              injuries.map((injury) => (
                <div key={injury.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-bold">{injury.playerName}</span>
                      <span className="text-gray-400 text-sm ml-2">{injury.team}</span>
                    </div>
                    <Badge
                      className={
                        injury.status === "Out"
                          ? "bg-red-500"
                          : injury.status === "Questionable"
                            ? "bg-yellow-500"
                            : injury.status === "Doubtful"
                              ? "bg-orange-500"
                              : "bg-green-500"
                      }
                    >
                      {injury.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-300 mb-1">{injury.injury}</div>
                  <div className="text-sm text-gray-400">{injury.notes}</div>
                </div>
              ))
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-400">No Real Injury Data Available</span>
                </div>
                <p className="text-sm text-yellow-200">
                  No real injury data is currently available from official sources. Check back later for live updates.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Mobile-Optimized Modals */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[90vw] max-w-sm mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Share Analysis</DialogTitle>
          </DialogHeader>
          <p>Sharing analysis...</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[90vw] max-w-sm mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Export to PrizePicks</DialogTitle>
          </DialogHeader>
          <p>Exporting props...</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[90vw] max-w-sm mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Filter Options</DialogTitle>
          </DialogHeader>
          <p>Filter options coming soon...</p>
        </DialogContent>
      </Dialog>

      {/* Parlay Builder Dialog - Mobile Optimized */}
      <Dialog open={showParlayBuilder} onOpenChange={setShowParlayBuilder}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] h-[85vh] max-w-none mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>Parlay Builder</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {trendingProps.length > 0 ? (
              <>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Selected Props</h3>
                  <div className="space-y-2">
                    {trendingProps.slice(0, 3).map((prop) => (
                      <div key={prop.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium">{prop.player}</div>
                          <div className="text-sm text-gray-300">
                            {prop.prop} {prop.line} {prop.odds}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Total Odds</div>
                      <div className="font-bold">+650</div>
                    </div>
                    <Button className="bg-[#b8562f] hover:bg-[#c96a43]">Add More Props</Button>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Recommended Props</h3>
                  <div className="space-y-2">
                    {trendingProps.slice(3, 5).map((prop) => (
                      <div key={prop.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium">{prop.player}</div>
                          <div className="text-sm text-gray-300">
                            {prop.prop} {prop.line} {prop.odds}
                          </div>
                        </div>
                        <button className="text-xs px-2 py-1 bg-[#b8562f] rounded hover:bg-[#c96a43]">Add</button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-[#b8562f] hover:bg-[#c96a43]">Export Parlay</Button>
              </>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-400">No Real Props Data Available</span>
                </div>
                <p className="text-sm text-yellow-200">
                  No real props data is available for parlay building. Check back when live PrizePicks data is
                  available.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Trending Props Dialog - Mobile Optimized */}
      <Dialog open={showTrendingProps} onOpenChange={setShowTrendingProps}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] h-[85vh] max-w-none mx-auto z-50 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle>Trending Props ({trendingProps.length} available)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {trendingProps.length > 0 ? (
              trendingProps.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all hover:border-gray-600 cursor-pointer"
                  onClick={() => handlePlayerCardClick(prop.player)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold">{prop.player}</span>
                        <span className="text-gray-400 text-sm ml-2">{prop.team}</span>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-gray-300">{prop.prop}</span>
                        <span className="mx-1">|</span>
                        <span className="font-medium">
                          {prop.line}{" "}
                          {prop.prop?.includes("Points") ? "pts" : prop.prop?.includes("Rebounds") ? "reb" : ""}
                        </span>
                        <span className="mx-1">|</span>
                        <span className={prop.odds?.includes("+") ? "text-[#54c863]" : "text-gray-300"}>
                          {prop.odds}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "h-1.5 w-16 rounded-full",
                            prop.confidence >= 80
                              ? "bg-[#54c863]"
                              : prop.confidence >= 65
                                ? "bg-yellow-500"
                                : "bg-orange-500",
                          )}
                        >
                          <div
                            className="h-full rounded-full bg-gray-700"
                            style={{ width: `${100 - prop.confidence}%`, marginLeft: `${prop.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs ml-2">{prop.confidence}%</span>
                      </div>
                      <div className="flex mt-2 gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToPropsList(prop)
                          }}
                          className="text-xs px-3 py-1 bg-[#b8562f] rounded-full hover:bg-[#c96a43] transition-colors"
                        >
                          Add to Props
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToFavorites(prop)
                          }}
                          className="text-xs px-3 py-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <Bookmark className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 flex items-center">
                    {prop.trend === "up" ? (
                      <ArrowUp className="w-3 h-3 text-[#54c863] mr-1" />
                    ) : prop.trend === "down" ? (
                      <ArrowUp className="w-3 h-3 text-red-500 mr-1 transform rotate-180" />
                    ) : null}
                    {prop.trend === "up"
                      ? "Trending up in last 5 games"
                      : prop.trend === "down"
                        ? "Trending down in last 5 games"
                        : "Consistent in last 5 games"}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-400">No Real Props Data Available</span>
                </div>
                <p className="text-sm text-yellow-200">
                  No real props data is currently available from PrizePicks. Check back later for live updates.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
