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

  // Real-time data hooks
  const { data: realTimeData, loading: dataLoading, refresh: refreshData } = useRealTimeData("all", "NBA")

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm SLIPTACTIX with real-time data. How can I help with your sports analysis today?",
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

  // Convert real-time data to component format with proper null checks
  const liveGames = Array.isArray(realTimeData?.games)
    ? realTimeData.games.map((game: any) => ({
        id: game?.id || `game-${Math.random()}`,
        homeTeam: game?.home_team || "HOME",
        awayTeam: game?.away_team || "AWAY",
        homeScore: Number(game?.home_score) || 0,
        awayScore: Number(game?.away_score) || 0,
        quarter: game?.quarter || "",
        timeRemaining: game?.time_remaining || "",
        homeOdds: game?.home_odds || "",
        awayOdds: game?.away_odds || "",
        startTime: game?.start_time || "",
        date: game?.game_date || new Date().toISOString().split("T")[0],
        status: game?.status || "scheduled",
      }))
    : []

  const trendingProps = Array.isArray(realTimeData?.props)
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

  const injuries = Array.isArray(realTimeData?.injuries)
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

  const newsItems = Array.isArray(realTimeData?.news)
    ? realTimeData.news.map((item: any) => ({
        id: item?.id || `news-${Math.random()}`,
        title: item?.title || "News Update",
        content: item?.content || "No content available",
        source: item?.source || "Unknown",
        date: item?.published_date || item?.date || new Date().toISOString(),
        impact: item?.impact || "neutral",
        playerName: item?.player_name || item?.playerName || "",
        teamName: item?.team_name || item?.teamName || "",
      }))
    : []

  // Quick chat options organized by category
  const quickChatOptions: Record<QuickChatCategory, string[]> = {
    General: [
      "Show me value plays for NBA tonight",
      "Who's the best player to bet on for points tonight?",
      "Analyze Lakers vs Nuggets matchup",
      "Show me live scores",
      "What are the top trending props?",
      "Show me the latest injury report",
      "What's your highest confidence pick today?",
      "Show me upcoming games",
    ],
    Analysis: [
      "Compare LeBron vs Jokić stats",
      "Which team has the best offensive rating?",
      "Analyze home vs away performance for Lakers",
      "Who's the most efficient scorer in the NBA?",
      "Show me defensive matchup advantages",
      "Which players exceed their props most often?",
      "Analyze pace factors for tonight's games",
      "Show me teams with best ATS records",
    ],
    Props: [
      "Best points props for tonight",
      "Show me rebounding props with value",
      "Which assist props are trending up?",
      "Show me 3-point props for guards",
      "Best PRA (points+rebounds+assists) combos",
      "Show me props for players on back-to-backs",
      "Which player has the best value on their points line?",
      "Show me all props for LeBron James",
    ],
    Games: [
      "Show me all live games",
      "What's the best game to watch tonight?",
      "Which game has the highest total?",
      "Show me games with close spreads",
      "Which home teams are favored tonight?",
      "Show me games with line movement",
      "Which game has the most prop opportunities?",
      "Show me historical matchups for Lakers vs Nuggets",
    ],
    Trends: [
      "Which players are trending up in scoring?",
      "Show me teams with positive ATS trends",
      "Which props have hit in 3+ consecutive games?",
      "Show me players exceeding minutes projections",
      "Which teams are trending over the total?",
      "Show me players with increasing usage rates",
      "Which defensive trends should I know about?",
      "Show me players trending down in production",
    ],
    Parlays: [
      "Build me a 3-leg parlay for tonight",
      "What's a safe parlay for NBA tonight?",
      "Show me correlated props for same game parlays",
      "Build me a high-value longshot parlay",
      "What's your recommended 2-leg parlay?",
      "Show me the most popular parlay combinations",
      "Build me a cross-sport parlay",
      "What's a good parlay for player props only?",
    ],
    Favorites: [
      "Show my saved props",
      "Show my favorite players",
      "Show my recent searches",
      "Show my betting history",
      "Show my prop performance history",
      "Show my saved parlays",
      "Show my favorite teams analysis",
      "Show my custom alerts",
    ],
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
        console.log("Data sync started")
      } catch (error) {
        console.error("Failed to start data sync:", error)
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

      // Special commands for showing games and value props using real data
      if (messageLower.includes("live") || messageLower.includes("score")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here are the current live games with real-time data:",
            sender: "bot",
            timestamp: new Date(),
            type: "live-game",
            data: {
              games: liveGames.filter((game) => game.status === "live"),
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (messageLower.includes("upcoming games")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here are the upcoming games:",
            sender: "bot",
            timestamp: new Date(),
            type: "live-game",
            data: {
              games: liveGames.filter((game) => game.status === "scheduled"),
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (messageLower.includes("injury") || messageLower.includes("injuries")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here's the latest real-time injury report:",
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

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here are the latest news updates:",
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

      if (messageLower.includes("trending props") || messageLower.includes("top props")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here are the trending props from PrizePicks right now:",
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

      if (messageLower.includes("build") && messageLower.includes("parlay")) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here's a recommended parlay based on today's real-time value plays:",
            sender: "bot",
            timestamp: new Date(),
            type: "parlay-builder",
            data: {
              legs: trendingProps.slice(0, 3),
              odds: "+650",
              winProbability: "18%",
              expectedValue: "Positive",
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      if (
        messageLower.includes("saved") ||
        (messageLower.includes("my") && (messageLower.includes("props") || messageLower.includes("favorites")))
      ) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Here are your saved props and favorites:",
            sender: "bot",
            timestamp: new Date(),
            type: "bet-card",
            data: {
              recommendations: favoriteProps.length > 0 ? favoriteProps : trendingProps.slice(0, 2),
            },
          },
        ])
        setIsProcessing(false)
        return
      }

      // Handle value plays with real data
      if (
        messageLower.includes("value plays") ||
        messageLower.includes("best picks") ||
        messageLower.includes("best props")
      ) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Here are tonight's top ${activeSport} value plays from real PrizePicks data:`,
            sender: "bot",
            timestamp: new Date(),
            type: "bet-card",
            data: {
              recommendations: trendingProps.slice(0, 3),
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

        if (responseData.fallback) {
          setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botResponse])

          setTimeout(() => {
            const suggestionsMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Here are some things I can help you with using real-time data:",
              sender: "bot",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, suggestionsMessage])

            setTimeout(() => {
              const specificSuggestions: Message = {
                id: (Date.now() + 2).toString(),
                content:
                  "• Show live games and scores\n• Display trending props from PrizePicks\n• View real injury reports\n• Build parlays with current data\n• Analyze player matchups\n\nTry clicking one of the quick suggestions below!",
                sender: "bot",
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, specificSuggestions])
            }, 500)
          }, 1000)

          setIsProcessing(false)
          return
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== "typing"), botResponse])
      } catch (apiError) {
        console.error("API Error:", apiError)

        setMessages((prev) => prev.filter((m) => m.id !== "typing"))

        const fallbackResponse: Message = {
          id: Date.now().toString(),
          content:
            "I'm currently running with real-time data! I can help you with sports analysis using live PrizePicks and ESPN data.",
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, fallbackResponse])

        setTimeout(() => {
          const suggestionsMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Try asking about live games, trending props, injury reports, or use the quick suggestions below!",
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
            "I'm experiencing some technical difficulties. Please try one of the quick suggestions below, or try your question again in a moment.",
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
        content: "Hi there! I'm SLIPTACTIX with real-time data. How can I help with your sports analysis today?",
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
    setShowParlayBuilder(true)
  }

  const viewTrendingProps = () => {
    setShowTrendingProps(true)
  }

  // Render message content based on type
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
              <div key={item.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="font-bold">{item.title}</div>
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
                  <span>{item.date}</span>
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
          <RealTimeStatus />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowNewsDialog(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative"
                  aria-label="News"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#b8562f] rounded-full"></span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Latest News</p>
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
              placeholder="ask anything"
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

      {/* Player Detail Modal */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-3xl mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Player Analysis</DialogTitle>
          </DialogHeader>
          {selectedPlayer && <PlayerDetailCard playerName={selectedPlayer} onClose={() => setShowPlayerModal(false)} />}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-md mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Share Analysis</DialogTitle>
          </DialogHeader>
          <p>Sharing analysis...</p>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-md mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Export to PrizePicks</DialogTitle>
          </DialogHeader>
          <p>Exporting props...</p>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-md mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Filter Options</DialogTitle>
          </DialogHeader>
          <p>Filter options coming soon...</p>
        </DialogContent>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-md mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Latest News</DialogTitle>
          </DialogHeader>
          {newsItems.map((item) => (
            <div key={item.id} className="mb-4">
              <div className="font-bold">{item.title}</div>
              <div className="text-sm text-gray-300">{item.content}</div>
              <div className="text-xs text-gray-400">
                {item.source} - {item.date}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* Injury Dialog */}
      <Dialog open={showInjuryDialog} onOpenChange={setShowInjuryDialog}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-md mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Injury Report</DialogTitle>
          </DialogHeader>
          {injuries.map((injury) => (
            <div key={injury.id} className="mb-4">
              <div className="flex items-center">
                <span className="font-bold">{injury.playerName}</span>
                <span className="text-gray-400 text-sm ml-2">{injury.team}</span>
                <Badge
                  className={
                    injury.status === "Out"
                      ? "bg-red-500 ml-2"
                      : injury.status === "Questionable"
                        ? "bg-yellow-500 ml-2"
                        : injury.status === "Doubtful"
                          ? "bg-orange-500 ml-2"
                          : "bg-green-500 ml-2"
                  }
                >
                  {injury.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-300 mt-1">{injury.notes}</div>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* Parlay Builder Dialog */}
      <Dialog open={showParlayBuilder} onOpenChange={setShowParlayBuilder}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-lg mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Parlay Builder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Trending Props Dialog */}
      <Dialog open={showTrendingProps} onOpenChange={setShowTrendingProps}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg w-[95vw] max-w-lg mx-auto z-50">
          <DialogHeader>
            <DialogTitle>Trending Props</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {trendingProps.map((prop) => (
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
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
