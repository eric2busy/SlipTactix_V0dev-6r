"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RealTimeStatusProps {
  lastUpdated: Date | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function RealTimeStatus({ lastUpdated, isLoading = false, onRefresh }: RealTimeStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [timeAgo, setTimeAgo] = useState<string>("")

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
    if (!lastUpdated) return

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
    if (!lastUpdated) return "bg-muted text-muted-foreground"

    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffMin = diffMs / (1000 * 60)

    if (diffMin < 2) return "bg-green-500 text-white"
    if (diffMin < 5) return "bg-yellow-500 text-black"
    return "bg-orange-500 text-white"
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1 px-2 py-1`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="text-xs">{!isOnline ? "Offline" : !lastUpdated ? "Connecting..." : timeAgo}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {!isOnline
              ? "You're offline. Connect to the internet to get live updates."
              : !lastUpdated
                ? "Connecting to real-time data..."
                : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
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
