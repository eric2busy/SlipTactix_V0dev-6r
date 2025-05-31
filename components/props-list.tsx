"use client"

import { X, Download } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

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

interface PropsListProps {
  props: BetRecommendation[]
  onClose: () => void
  onRemove: (id: string) => void
  onExport: () => void
}

export function PropsList({ props, onClose, onRemove, onExport }: PropsListProps) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-30 rounded-t-xl max-h-[70vh] overflow-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Selected Props ({props.length})</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {props.map((prop) => (
          <div key={prop.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
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
                    {prop.line} {prop.prop.includes("Points") ? "pts" : prop.prop.includes("Rebounds") ? "reb" : ""}
                  </span>
                  <span className="mx-1">|</span>
                  <span className={prop.odds.includes("+") ? "text-[#54c863]" : "text-gray-300"}>{prop.odds}</span>
                </div>
              </div>
              <button
                onClick={() => onRemove(prop.id)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onExport} className="w-full bg-[#b8562f] hover:bg-[#c96a43]">
        <Download className="w-4 h-4 mr-2" />
        Export to PrizePicks
      </Button>
    </motion.div>
  )
}
