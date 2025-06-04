"use client"

import { useState, useEffect } from "react"

export function useRealTimeData(type: "props" | "games" | "injuries" | "news" | "all" = "all", sport = "NBA") {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log(`🔄 Fetching LIVE ${type} data for ${sport} directly from APIs...`)

        // Fetch directly from our API that calls external sources
        const response = await fetch(`/api/real-time-data?type=${type}&sport=${sport}&source=direct`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log(`📡 Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON")
        }

        const result = await response.json()
        console.log("📊 Received LIVE data:", {
          success: result.success,
          source: result.source,
          props: result.data?.props?.length || 0,
          games: result.data?.games?.length || 0,
          injuries: result.data?.injuries?.length || 0,
          news: result.data?.news?.length || 0,
          timestamp: result.timestamp,
        })

        if (result.success) {
          setData(result.data)
          setLastUpdated(new Date(result.timestamp))
          setError(null)

          // Log sample data to verify it's live
          if (result.data?.props?.length > 0) {
            console.log("📈 Sample prop:", result.data.props[0])
          }
          if (result.data?.games?.length > 0) {
            console.log("🏀 Sample game:", result.data.games[0])
          }
        } else {
          console.error("❌ API returned error:", result.error || result.message)
          setError(result.message || "Failed to fetch live data")
        }
      } catch (err) {
        console.error("💥 Error fetching live data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling every 2 minutes for live updates
    const interval = setInterval(fetchData, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [type, sport])

  const refresh = async () => {
    setLoading(true)
    try {
      console.log("🔄 Manual refresh triggered - forcing live data fetch")

      // Force a fresh fetch by adding timestamp
      const timestamp = Date.now()
      const response = await fetch(`/api/real-time-data?type=${type}&sport=${sport}&source=direct&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
          setLastUpdated(new Date(result.timestamp))
          setError(null)
          console.log("✅ Manual refresh successful - got live data")
        }
      }
    } catch (err) {
      console.error("💥 Error triggering refresh:", err)
    }
    setLoading(false)
  }

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  }
}
