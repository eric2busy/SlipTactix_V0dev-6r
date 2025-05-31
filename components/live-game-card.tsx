"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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

interface LiveGameCardProps {
  game: Game
  onClick: () => void
}

export function LiveGameCard({ game, onClick }: LiveGameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all hover:border-gray-600 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            <img
              src={`/${game.awayTeam.toLowerCase()}-logo.png`}
              alt={game.awayTeam}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=32&width=32"
              }}
            />
          </div>
          <div>
            <div className="font-bold">{game.awayTeam}</div>
            {game.status === "live" && <div className="text-xl font-bold">{game.awayScore}</div>}
          </div>
        </div>

        <div className="text-center">
          {game.status === "live" ? (
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium px-2 py-0.5 bg-red-500 rounded-full mb-1">LIVE</div>
              <div className="text-xs text-gray-400">
                {game.quarter} {game.timeRemaining}
              </div>
            </div>
          ) : game.status === "scheduled" ? (
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400">{game.date}</div>
              <div className="text-sm font-medium">{game.startTime}</div>
            </div>
          ) : (
            <div className="text-xs font-medium px-2 py-0.5 bg-gray-700 rounded-full">FINAL</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div>
            <div className="font-bold text-right">{game.homeTeam}</div>
            {game.status === "live" && <div className="text-xl font-bold text-right">{game.homeScore}</div>}
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            <img
              src={`/${game.homeTeam.toLowerCase()}-logo.png`}
              alt={game.homeTeam}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=32&width=32"
              }}
            />
          </div>
        </div>
      </div>

      {game.status !== "final" && (
        <div className="mt-2 flex justify-between text-sm">
          <div className={cn("", game.awayOdds?.includes("+") ? "text-[#54c863]" : "text-gray-300")}>
            {game.awayOdds}
          </div>
          <div className={cn("", game.homeOdds?.includes("+") ? "text-[#54c863]" : "text-gray-300")}>
            {game.homeOdds}
          </div>
        </div>
      )}
    </motion.div>
  )
}
