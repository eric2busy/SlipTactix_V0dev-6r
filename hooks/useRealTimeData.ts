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
        const response = await fetch(`/api/real-time-data?type=${type}&sport=${sport}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data)
          setLastUpdated(new Date(result.timestamp))
          setError(null)
        } else {
          console.error("API returned error:", result.error || result.message)
          setError(result.message || "Failed to fetch data")
          // Don't clear existing data on error
        }
      } catch (err) {
        console.error("Error fetching real-time data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        // Don't clear existing data on error
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30 * 1000)

    return () => clearInterval(interval)
  }, [type, sport])

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/real-time-data", { method: "POST" })
      if (response.ok) {
        // Trigger a new fetch after sync
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err) {
      console.error("Error triggering refresh:", err)
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
