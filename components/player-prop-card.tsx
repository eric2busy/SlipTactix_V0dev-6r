"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerPropCardProps {
  variant?: "single" | "multiple" | "text-only"
  player: {
    name: string
    team: string
    avatar?: string
    teamLogo?: string
    nextGame?: {
      opponent: string
      time: string
      location: "home" | "away"
    }
  }
  props: Array<{
    id: string
    type: string
    line: number
    overOdds?: string
    underOdds?: string
    recommendation: "over" | "under"
    confidence: number
    performance: {
      percentage: number
      description: string
    }
    analysis: string[]
  }>
  onAddToSlip?: (propId: string) => void
  onViewProps?: () => void
}

export function PlayerPropCard({ variant = "single", player, props, onAddToSlip, onViewProps }: PlayerPropCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const renderPropLine = (prop: any, index: number) => (
    <div key={prop.id} className="space-y-4">
      {/* Prop Header */}
      <div className="px-1">
        <h3
          className={cn(
            "text-xl font-black leading-7",
            prop.recommendation === "over" ? "text-[#54C863]" : "text-[#FE3036]",
          )}
          style={{ fontFamily: "Darker Grotesque" }}
        >
          {prop.recommendation.toUpperCase()} {prop.line} {prop.type.toUpperCase()}
        </h3>
      </div>

      {/* Progress Bar and Indicators */}
      <div className="px-2.5 space-y-2.5">
        <div className="relative h-5">
          {/* Background line */}
          <div className="absolute top-0 w-full h-0 border-t-[3px] border-white" />

          {/* Over section (green) */}
          <div
            className="absolute top-0 h-0 border-t-[5px] border-[#54C863]"
            style={{ width: `${prop.confidence}%` }}
          />

          {/* Under section (red) */}
          <div
            className="absolute top-0 h-0 border-t-[5px] border-[#AC3232]"
            style={{
              width: `${100 - prop.confidence}%`,
              left: `${prop.confidence}%`,
            }}
          />

          {/* Over/Under Labels */}
          <div className="flex justify-between items-end h-5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white" style={{ fontFamily: "Darker Grotesque" }}>
                OVER
              </span>
              <div className="w-4.5 h-4.5 rotate-[-90deg]">
                <ChevronDown className="w-full h-full text-[#34C759]" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white text-right" style={{ fontFamily: "Darker Grotesque" }}>
                UNDER
              </span>
              <div className="w-4.5 h-4.5 rotate-90">
                <ChevronUp className="w-full h-full text-[#FF3B30]" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Text */}
        <div className="text-sm font-bold text-[#54C863]" style={{ fontFamily: "Darker Grotesque" }}>
          {prop.performance.percentage}% IN THE LAST 10 GAMES
        </div>
      </div>

      {/* Analysis */}
      <div className="space-y-0">
        {prop.analysis.map((text, i) => (
          <div key={i} className="text-base font-bold text-white" style={{ fontFamily: "Darker Grotesque" }}>
            {text}
          </div>
        ))}
      </div>

      {/* Separator for multiple props */}
      {variant === "multiple" && index < props.length - 1 && (
        <div className="w-full h-0 border-t border-[#B8562F] my-5" />
      )}
    </div>
  )

  if (variant === "text-only") {
    return (
      <div className="w-full max-w-md bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 space-y-5">
        {/* Player Info */}
        <div className="flex gap-2.5">
          {/* Avatar */}
          <div className="flex flex-col justify-center items-end w-12.5 h-14.5">
            <div
              className="w-12.5 h-12.5 rounded-full bg-gray-700 bg-cover bg-center -mb-5"
              style={{
                backgroundImage: player.avatar ? `url(${player.avatar})` : "none",
              }}
            />
            <div
              className="w-7 h-7 rounded-full bg-gray-600 bg-cover bg-center"
              style={{
                backgroundImage: player.teamLogo ? `url(${player.teamLogo})` : "none",
              }}
            />
          </div>

          {/* Player Details */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start gap-2.5 h-7.75">
              <div className="flex-1">
                <div className="flex items-start gap-1.25 h-4.75">
                  <div className="space-y-1.25">
                    <div className="text-base font-bold text-white leading-4.75" style={{ fontFamily: "Inter" }}>
                      {player.name.toUpperCase()}
                    </div>
                  </div>
                  <div className="w-1 h-3.75 flex items-center">
                    <span className="text-xs text-white" style={{ fontFamily: "Inter" }}>
                      |
                    </span>
                  </div>
                  <div className="text-base text-white leading-4.75" style={{ fontFamily: "Inter" }}>
                    23
                  </div>
                  <div className="w-1 h-3.75 flex items-center">
                    <span className="text-xs text-white" style={{ fontFamily: "Inter" }}>
                      |
                    </span>
                  </div>
                </div>
                {player.nextGame && (
                  <div className="text-[10px] text-white leading-3" style={{ fontFamily: "Inter" }}>
                    NEXT GAME: {player.nextGame.location === "away" ? "@" : "vs"} {player.nextGame.opponent}{" "}
                    {player.nextGame.time}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => onAddToSlip?.(props[0]?.id)}
                  className="flex items-center justify-center gap-1.25 px-2.5 py-1.25 bg-white/15 rounded-[5px] h-7.75"
                >
                  <div className="w-5 h-5.25 bg-gray-400" />
                  <span className="text-xs text-white text-center leading-3.75" style={{ fontFamily: "Inter" }}>
                    Add to Slip
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Single Prop */}
        {props[0] && renderPropLine(props[0], 0)}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 space-y-5">
      {/* Header Text */}
      <div className="text-xl text-white leading-[26px]" style={{ fontFamily: "Inter" }}>
        {variant === "single"
          ? "Sure thing! This is our recommendation for the best NBA prop tonight."
          : "Here are our recommendations for tonight."}
      </div>

      {/* Player Info */}
      <div className="flex gap-2.5">
        {/* Avatar */}
        <div className="flex flex-col justify-center items-end w-12.5 h-14.5">
          <div
            className="w-12.5 h-12.5 rounded-full bg-gray-700 bg-cover bg-center -mb-5"
            style={{
              backgroundImage: player.avatar ? `url(${player.avatar})` : "none",
            }}
          />
          <div
            className="w-7 h-7 rounded-full bg-gray-600 bg-cover bg-center"
            style={{
              backgroundImage: player.teamLogo ? `url(${player.teamLogo})` : "none",
            }}
          />
        </div>

        {/* Player Details */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-2.5 h-7.75">
            <div className="flex-1">
              <div className="flex items-start gap-1.25 h-4.75">
                <div className="space-y-1.25">
                  <div className="text-base font-bold text-white leading-4.75" style={{ fontFamily: "Inter" }}>
                    {player.name.toUpperCase()}
                  </div>
                </div>
                <div className="w-1 h-3.75 flex items-center">
                  <span className="text-xs text-white" style={{ fontFamily: "Inter" }}>
                    |
                  </span>
                </div>
                <div className="text-base text-white leading-4.75" style={{ fontFamily: "Inter" }}>
                  23
                </div>
                <div className="w-1 h-3.75 flex items-center">
                  <span className="text-xs text-white" style={{ fontFamily: "Inter" }}>
                    |
                  </span>
                </div>
              </div>
              {player.nextGame && (
                <div className="text-[10px] text-white leading-3" style={{ fontFamily: "Inter" }}>
                  NEXT GAME: {player.nextGame.location === "away" ? "@" : "vs"} {player.nextGame.opponent}{" "}
                  {player.nextGame.time}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={() => onAddToSlip?.(props[0]?.id)}
                className="flex items-center justify-center gap-1.25 px-2.5 py-1.25 bg-white/15 rounded-[5px] h-7.75"
              >
                <div className="w-5 h-5.25 bg-gray-400" />
                <span className="text-xs text-white text-center leading-3.75" style={{ fontFamily: "Inter" }}>
                  Add to Slip
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Props */}
      <div className="space-y-5">{props.map((prop, index) => renderPropLine(prop, index))}</div>
    </div>
  )
}

// Example usage component
export function PlayerPropCardExample() {
  const samplePlayer = {
    name: "LeBron James",
    team: "LAL",
    avatar: "/placeholder.svg?height=50&width=50&text=LBJ",
    teamLogo: "/placeholder.svg?height=28&width=28&text=LAL",
    nextGame: {
      opponent: "MIA",
      time: "TODAY 5:40PM",
      location: "away" as const,
    },
  }

  const sampleProps = [
    {
      id: "1",
      type: "POINTS",
      line: 18.5,
      recommendation: "over" as const,
      confidence: 80,
      performance: {
        percentage: 80,
        description: "IN THE LAST 10 GAMES",
      },
      analysis: ["Over 18.5 points in 8 of his last 10 games.", "Averages 22 points on the road this season."],
    },
    {
      id: "2",
      type: "REBOUNDS",
      line: 9.5,
      recommendation: "under" as const,
      confidence: 75,
      performance: {
        percentage: 80,
        description: "IN THE LAST 10 GAMES",
      },
      analysis: ["Under 9.5 rebounds in 8 of his last 10 games.", "Averages 6.5 rebounds on the road this season."],
    },
  ]

  return (
    <div className="p-8 bg-[#1F1F1F] min-h-screen space-y-8">
      <h2 className="text-white text-2xl font-bold mb-6">Player Prop Card Variants</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-white text-lg mb-4">Single Prop Card</h3>
          <PlayerPropCard variant="single" player={samplePlayer} props={[sampleProps[0]]} />
        </div>

        <div>
          <h3 className="text-white text-lg mb-4">Multiple Props Card</h3>
          <PlayerPropCard variant="multiple" player={samplePlayer} props={sampleProps} />
        </div>

        <div>
          <h3 className="text-white text-lg mb-4">Text Only Card</h3>
          <PlayerPropCard variant="text-only" player={samplePlayer} props={[sampleProps[0]]} />
        </div>
      </div>
    </div>
  )
}
