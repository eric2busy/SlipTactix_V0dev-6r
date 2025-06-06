"use client"
import { motion } from "framer-motion"
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"

type InjuryStatus = "Out" | "Questionable" | "Doubtful" | "Probable"

type Injury = {
  id: string
  playerName: string
  team: string
  status: InjuryStatus
  injury: string
  notes: string
  updated: string
}

interface InjuryCardProps {
  injuries: Injury[]
  title?: string
  onPlayerClick?: (injury: Injury) => void
}

export function InjuryCard({ injuries, title = "Latest injury report:", onPlayerClick }: InjuryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 w-full max-w-[400px]"
    >
      <h3 className="text-white text-xl font-normal leading-[130.94%] mb-5">{title}</h3>

      <div className="space-y-4">
        {injuries.map((injury, index) => (
          <div key={injury.id} className="space-y-4">
            {index > 0 && <div className="w-full h-px bg-[#B8562F]" />}
            <InjuryCardContent injury={injury} onPlayerClick={onPlayerClick} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function InjuryCardContent({
  injury,
  onPlayerClick,
}: {
  injury: Injury
  onPlayerClick?: (injury: Injury) => void
}) {
  const getStatusIcon = () => {
    switch (injury.status) {
      case "Out":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "Questionable":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "Doubtful":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case "Probable":
        return <CheckCircle className="w-4 h-4 text-[#54C863]" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (injury.status) {
      case "Out":
        return "text-red-500"
      case "Questionable":
        return "text-yellow-400"
      case "Doubtful":
        return "text-orange-400"
      case "Probable":
        return "text-[#54C863]"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="space-y-3">
      {/* Player and Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-base font-semibold">{injury.playerName}</div>
          <div className="text-[#AFAFAF] text-sm font-normal">{injury.team}</div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-bold ${getStatusColor()}`}>{injury.status}</span>
        </div>
      </div>

      {/* Injury Details */}
      <div>
        <div className="text-white text-base font-medium mb-1">{injury.injury}</div>
        <div className="text-[#AFAFAF] text-sm font-normal leading-relaxed">{injury.notes}</div>
      </div>

      {/* Updated Time */}
      <div className="flex items-center justify-between">
        <div className="text-[#AFAFAF] text-xs font-normal">Updated: {injury.updated}</div>
        <button
          onClick={() => onPlayerClick?.(injury)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal hover:bg-[rgba(255,255,255,0.25)] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
