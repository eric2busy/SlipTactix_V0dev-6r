"use client"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react"

type PropTrend = "up" | "down" | "neutral"

type PlayerProp = {
  id: string
  player: string
  team: string
  prop: string
  line: string
  odds: string
  confidence: number
  trend?: PropTrend
  analysis?: string
}

interface PropsCardProps {
  props: PlayerProp[]
  title?: string
  onPropClick?: (prop: PlayerProp) => void
  onAddToFavorites?: (prop: PlayerProp) => void
}

export function PropsCard({
  props,
  title = "Here are the trending props:",
  onPropClick,
  onAddToFavorites,
}: PropsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 w-full max-w-[400px]"
    >
      <h3 className="text-white text-xl font-normal leading-[130.94%] mb-5">{title}</h3>

      <div className="space-y-4">
        {props.map((prop, index) => (
          <div key={prop.id} className="space-y-4">
            {index > 0 && <div className="w-full h-px bg-[#B8562F]" />}
            <PropCardContent prop={prop} onPropClick={onPropClick} onAddToFavorites={onAddToFavorites} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function PropCardContent({
  prop,
  onPropClick,
  onAddToFavorites,
}: {
  prop: PlayerProp
  onPropClick?: (prop: PlayerProp) => void
  onAddToFavorites?: (prop: PlayerProp) => void
}) {
  const getTrendIcon = () => {
    switch (prop.trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-[#54C863]" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getConfidenceColor = () => {
    if (prop.confidence >= 80) return "text-[#54C863]"
    if (prop.confidence >= 60) return "text-yellow-400"
    return "text-gray-400"
  }

  return (
    <div className="space-y-3">
      {/* Player and Team */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-base font-semibold">{prop.player}</div>
          <div className="text-[#AFAFAF] text-sm font-normal">{prop.team}</div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-bold ${getConfidenceColor()}`}>{prop.confidence}%</span>
        </div>
      </div>

      {/* Prop Details */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-lg font-bold">{prop.prop}</div>
          <div className="text-[#AFAFAF] text-sm font-normal">Line: {prop.line}</div>
        </div>
        <div className="text-white text-lg font-bold">{prop.odds}</div>
      </div>

      {/* Analysis */}
      {prop.analysis && <div className="text-[#AFAFAF] text-sm font-normal leading-relaxed">{prop.analysis}</div>}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onPropClick?.(prop)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal hover:bg-[rgba(255,255,255,0.25)] transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onAddToFavorites?.(prop)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal hover:bg-[rgba(255,255,255,0.25)] transition-colors"
        >
          <Star className="w-4 h-4" />
          Add to Favorites
        </button>
      </div>
    </div>
  )
}
