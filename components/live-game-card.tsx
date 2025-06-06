"use client"
import { motion } from "framer-motion"
import { Info, TrendingUp } from "lucide-react"

type GameStatus = "live" | "scheduled" | "final"

type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  quarter?: string
  timeRemaining?: string
  homeOdds?: string
  awayOdds?: string
  startTime?: string
  date?: string
  status: GameStatus
  homeRecord?: string
  awayRecord?: string
}

interface GameCardProps {
  games: Game[]
  variant?: "single" | "multiple" | "text-only"
  title?: string
  onGameClick?: (game: Game) => void
  onGameDetails?: (game: Game) => void
  onViewProps?: (game: Game) => void
}

export function GameCard({
  games,
  variant = "single",
  title = "Here are the current live NBA games:",
  onGameClick,
  onGameDetails,
  onViewProps,
}: GameCardProps) {
  if (variant === "text-only") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 w-full max-w-[400px]"
      >
        <div className="space-y-5">
          {games.map((game, index) => (
            <div key={game.id} className="space-y-5">
              {index > 0 && <div className="w-full h-px bg-[#B8562F]" />}
              <GameCardContent
                game={game}
                onGameClick={onGameClick}
                onGameDetails={onGameDetails}
                onViewProps={onViewProps}
              />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 w-full max-w-[400px]"
    >
      <h3 className="text-white text-xl font-normal leading-[130.94%] mb-5 font-['Inter']">{title}</h3>

      <div className="space-y-5">
        {games.map((game, index) => (
          <div key={game.id} className="space-y-5">
            {index > 0 && variant === "multiple" && <div className="w-full h-px bg-[#B8562F]" />}
            <GameCardContent
              game={game}
              onGameClick={onGameClick}
              onGameDetails={onGameDetails}
              onViewProps={onViewProps}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function GameCardContent({
  game,
  onGameClick,
  onGameDetails,
  onViewProps,
}: {
  game: Game
  onGameClick?: (game: Game) => void
  onGameDetails?: (game: Game) => void
  onViewProps?: (game: Game) => void
}) {
  return (
    <div className="space-y-5">
      {/* Teams and Scores */}
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2.5">
          {/* Away Team */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={`/${game.awayTeam.toLowerCase()}-logo.png`}
                  alt={game.awayTeam}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                  }}
                />
              </div>
              <span className="text-white text-base font-normal font-['Inter']">{game.awayTeam}</span>
            </div>
            <div className="text-white text-base font-bold font-['Inter']">
              {game.status === "live" ? (
                game.awayScore
              ) : game.status === "scheduled" ? (
                <span className="text-[#AFAFAF]">{game.awayRecord}</span>
              ) : (
                game.awayScore
              )}
            </div>
          </div>

          {/* Home Team */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={`/${game.homeTeam.toLowerCase()}-logo.png`}
                  alt={game.homeTeam}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                  }}
                />
              </div>
              <span className="text-white text-base font-normal font-['Inter']">{game.homeTeam}</span>
            </div>
            <div className="text-white text-base font-bold font-['Inter']">
              {game.status === "live" ? (
                game.homeScore
              ) : game.status === "scheduled" ? (
                <span className="text-[#AFAFAF]">{game.homeRecord}</span>
              ) : (
                game.homeScore
              )}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="flex flex-col items-end ml-4">
          {game.status === "live" ? (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 bg-[#54C863] rounded-full" />
                <span className="text-white text-sm font-normal font-['Darker_Grotesque']">LIVE NOW</span>
              </div>
              <div className="text-white text-sm font-bold font-['Darker_Grotesque']">
                {game.quarter} | {game.timeRemaining}
              </div>
            </>
          ) : game.status === "scheduled" ? (
            <>
              <div className="text-white text-sm font-normal font-['Darker_Grotesque'] mb-1">{game.date}</div>
              <div className="text-white text-sm font-bold font-['Darker_Grotesque']">{game.startTime}</div>
            </>
          ) : (
            <div className="text-white text-sm font-normal font-['Darker_Grotesque'] px-2 py-0.5 bg-gray-700 rounded-full">
              FINAL
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2.5">
        <button
          onClick={() => onGameDetails?.(game)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal font-['Inter']"
        >
          <Info className="w-[21px] h-[21px]" />
          Game Details
        </button>

        <button
          onClick={() => onViewProps?.(game)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal font-['Inter']"
        >
          <TrendingUp className="w-[21px] h-[21px]" />
          View Props
        </button>
      </div>
    </div>
  )
}

// Example usage component
export function GameCardExamples() {
  const liveGames: Game[] = [
    {
      id: "1",
      homeTeam: "Miami Heat",
      awayTeam: "Los Angeles Lakers",
      homeScore: 57,
      awayScore: 69,
      quarter: "3RD",
      timeRemaining: "9:24",
      status: "live",
    },
    {
      id: "2",
      homeTeam: "Boston Celtics",
      awayTeam: "Golden State Warriors",
      homeScore: 82,
      awayScore: 78,
      quarter: "4TH",
      timeRemaining: "2:15",
      status: "live",
    },
  ]

  const upcomingGames: Game[] = [
    {
      id: "3",
      homeTeam: "Miami Heat",
      awayTeam: "Los Angeles Lakers",
      homeRecord: "31-29",
      awayRecord: "62-4",
      date: "THURSDAY",
      startTime: "7:00 PM",
      status: "scheduled",
    },
  ]

  return (
    <div className="space-y-8 p-8 bg-gray-900 min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-8">Game Card Variants</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Single Live Game</h3>
          <GameCard games={[liveGames[0]]} variant="single" title="Here are the current live NBA games:" />
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Multiple Live Games</h3>
          <GameCard games={liveGames} variant="multiple" title="Here are the current live NBA games:" />
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Upcoming Game</h3>
          <GameCard games={upcomingGames} variant="text-only" />
        </div>
      </div>
    </div>
  )
}
