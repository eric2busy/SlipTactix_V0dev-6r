"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff, RefreshCw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RealTimeStatusProps {
  lastUpdated?: Date | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function RealTimeStatus({ lastUpdated, isLoading = false, onRefresh }: RealTimeStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [timeAgo, setTimeAgo] = useState<string>("")
  const [dataSource, setDataSource] = useState<string>("Enhanced")

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    // Update time ago
    if (!lastUpdated) {
      setTimeAgo("Live")
      return
    }

    const updateTimeAgo = () => {
      const now = new Date()
      const diffMs = now.getTime() - lastUpdated.getTime()
      const diffSec = Math.floor(diffMs / 1000)

      if (diffSec < 60) {
        setTimeAgo(`${diffSec}s ago`)
      } else if (diffSec < 3600) {
        setTimeAgo(`${Math.floor(diffSec / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(diffSec / 3600)}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000)

    return () => clearInterval(interval)
  }, [lastUpdated])

  const getStatusColor = () => {
    if (!isOnline) return "bg-destructive text-destructive-foreground"

    // Show as "live" for enhanced real-time data
    return "bg-green-500 text-white"
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />
    return <Zap className="h-3 w-3" />
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline"
    return "Live Data"
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1 px-2 py-1`}>
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Real-Time Sports Data</div>
              <div className="text-xs text-gray-300">• Live NBA games from ESPN</div>
              <div className="text-xs text-gray-300">• Enhanced props with real players</div>
              <div className="text-xs text-gray-300">• Current injury reports</div>
              <div className="text-xs text-gray-300">• Latest NBA news</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onRefresh && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh} disabled={isLoading || !isOnline}>
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  )
}
