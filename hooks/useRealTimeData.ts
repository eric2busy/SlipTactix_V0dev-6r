"use client"

import { useState, useEffect, useCallback } from "react"

interface RealTimeData {
  games: any[]
  props: any[]
  injuries: any[]
  news: any[]
  timestamp?: string
  source?: string
  metadata?: any
}

interface UseRealTimeDataReturn {
  data: RealTimeData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRealTimeData(type = "all", sport = "NBA"): UseRealTimeDataReturn {
  const [data, setData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 Fetching real-time data: type=${type}, sport=${sport}`)

      const response = await fetch(`/api/real-time-data?type=${type}&sport=${sport}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        console.log("✅ Real-time data fetched successfully:", {
          games: result.data?.games?.length || 0,
          props: result.data?.props?.length || 0,
          injuries: result.data?.injuries?.length || 0,
          news: result.data?.news?.length || 0,
        })

        setData(result.data)
        setError(null)
      } else {
        console.error("❌ Real-time data fetch failed:", result.error)
        setError(result.error || "Failed to fetch real-time data")
        setData({
          games: [],
          props: [],
          injuries: [],
          news: [],
          timestamp: new Date().toISOString(),
          source: "error-fallback",
        })
      }
    } catch (err) {
      console.error("💥 Error in useRealTimeData:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setData({
        games: [],
        props: [],
        injuries: [],
        news: [],
        timestamp: new Date().toISOString(),
        source: "error-fallback",
      })
    } finally {
      setLoading(false)
    }
  }, [type, sport])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes for real-time data
  useEffect(() => {
    const interval = setInterval(
      () => {
        console.log("🔄 Auto-refreshing real-time data...")
        fetchData()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refresh }
}
