import { supabase } from "./supabase"
import { prizePicksScraper } from "./prizepicks-scraper"
import { sportsAPI } from "./sports-api"

// Add proper interfaces for type safety
interface Prop {
  id: string
  player_name: string
  team: string
  prop_type: string
  line: number
  odds: string
  confidence: number
  trend: string
  analysis: string
  source: string
  sport: string
  is_active: boolean
}

interface Game {
  id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: string
  quarter: string
  time_remaining: string
  home_odds: string
  away_odds: string
  start_time: string
  game_date: string
  sport: string
}

interface Injury {
  id: string
  player_name: string
  team: string
  status: string
  injury_type: string
  notes: string
  sport: string
}

interface News {
  id: string
  title: string
  content: string
  source: string
  published_date: string
  impact: string
  player_name?: string
  team_name?: string
  sport: string
}

export class DataSyncService {
  private syncInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private lastSyncTime: { [sport: string]: number } = {}

  async startRealTimeSync() {
    if (this.isRunning) return

    this.isRunning = true
    console.log("Starting real-time data sync...")

    // Initial sync
    await this.performFullSync()

    // Set up periodic sync every 2 minutes
    this.syncInterval = setInterval(
      async () => {
        await this.performFullSync()
      },
      2 * 60 * 1000,
    )
  }

  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.isRunning = false
    console.log("Stopped real-time data sync")
  }

  // Check if data is stale (older than 1 hour)
  async isDataStale(sport: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("props")
        .select("updated_at")
        .eq("sport", sport)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)

      if (error || !data || data.length === 0) {
        console.log(`No recent data found for ${sport}, sync needed`)
        return true
      }

      const lastUpdate = new Date(data[0].updated_at).getTime()
      const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60)

      console.log(`Last ${sport} update: ${hoursSinceUpdate.toFixed(1)} hours ago`)
      return hoursSinceUpdate > 1 // Stale if older than 1 hour
    } catch (error) {
      console.error("Error checking data staleness:", error)
      return true // Assume stale on error
    }
  }

  // Quick sync for external cron services (under 10 seconds)
  async performQuickSync() {
    try {
      console.log("Performing quick data sync...")

      // Only sync the most critical data to stay under 10 seconds
      const results = await Promise.allSettled([
        this.syncProps(5), // Limit to 5 props for speed
        this.syncGames(3), // Limit to 3 games for speed
      ])

      const [propsResult, gamesResult] = results

      const errors: string[] = []
      let props = 0,
        games = 0

      if (propsResult.status === "fulfilled") {
        props = propsResult.value
      } else {
        console.error("Props sync failed:", propsResult.reason)
        errors.push(`Props: ${propsResult.reason.message || "Unknown error"}`)
      }

      if (gamesResult.status === "fulfilled") {
        games = gamesResult.value
      } else {
        console.error("Games sync failed:", gamesResult.reason)
        errors.push(`Games: ${gamesResult.reason.message || "Unknown error"}`)
      }

      console.log(`Quick sync completed: ${props} props, ${games} games`)

      // Update last sync time
      this.lastSyncTime["NBA"] = Date.now()

      return { props, games, errors, type: "quick" }
    } catch (error) {
      console.error("Error in quick sync:", error)
      return {
        props: 0,
        games: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        type: "quick",
      }
    }
  }

  async performFullSync() {
    try {
      console.log("Performing full data sync...")

      const results = await Promise.allSettled([
        this.syncProps(),
        this.syncGames(),
        this.syncInjuries(),
        this.syncNews(),
      ])

      const [propsResult, gamesResult, injuriesResult, newsResult] = results

      // Log specific errors for failed promises
      const errors: string[] = []
      let props = 0,
        games = 0,
        injuries = 0,
        news = 0

      if (propsResult.status === "fulfilled") {
        props = propsResult.value
      } else {
        console.error("Props sync failed:", propsResult.reason)
        errors.push(`Props: ${propsResult.reason.message || "Unknown error"}`)
      }

      if (gamesResult.status === "fulfilled") {
        games = gamesResult.value
      } else {
        console.error("Games sync failed:", gamesResult.reason)
        errors.push(`Games: ${gamesResult.reason.message || "Unknown error"}`)
      }

      if (injuriesResult.status === "fulfilled") {
        injuries = injuriesResult.value
      } else {
        console.error("Injuries sync failed:", injuriesResult.reason)
        errors.push(`Injuries: ${injuriesResult.reason.message || "Unknown error"}`)
      }

      if (newsResult.status === "fulfilled") {
        news = newsResult.value
      } else {
        console.error("News sync failed:", newsResult.reason)
        errors.push(`News: ${newsResult.reason.message || "Unknown error"}`)
      }

      console.log(`Synced: ${props} props, ${games} games, ${injuries} injuries, ${news} news`)
      if (errors.length > 0) {
        console.warn("Sync completed with errors:", errors)
      }

      // Update last sync time
      this.lastSyncTime["NBA"] = Date.now()

      return { props, games, injuries, news, errors, type: "full" }
    } catch (error) {
      console.error("Error in full sync:", error)
      return {
        props: 0,
        games: 0,
        injuries: 0,
        news: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        type: "full",
      }
    }
  }

  async syncProps(limit?: number): Promise<number> {
    try {
      const props = await prizePicksScraper.getActiveProps("NBA")
      let syncedCount = 0

      const propsToSync = limit ? props.slice(0, limit) : props

      for (const prop of propsToSync) {
        const { error } = await supabase.from("props").upsert(
          {
            id: prop.id,
            player_name: prop.player,
            team: prop.team,
            prop_type: prop.prop,
            line: Number.parseFloat(prop.line),
            odds: prop.odds,
            confidence: prop.confidence,
            trend: prop.trend,
            analysis: prop.analysis,
            source: prop.source,
            sport: "NBA",
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (!error) syncedCount++
      }

      // Mark old props as inactive (only in full sync)
      if (!limit) {
        await supabase
          .from("props")
          .update({ is_active: false })
          .lt("updated_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
      }

      return syncedCount
    } catch (error) {
      console.error("Error syncing props:", error)
      throw error
    }
  }

  async syncGames(limit?: number): Promise<number> {
    try {
      const games = await sportsAPI.getLiveGames()
      let syncedCount = 0

      const gamesToSync = limit ? games.slice(0, limit) : games

      for (const game of gamesToSync) {
        const { error } = await supabase.from("games").upsert(
          {
            id: game.id,
            home_team: game.homeTeam,
            away_team: game.awayTeam,
            home_score: game.homeScore,
            away_score: game.awayScore,
            status: game.status,
            quarter: game.quarter,
            time_remaining: game.timeRemaining,
            home_odds: game.homeOdds,
            away_odds: game.awayOdds,
            start_time: game.startTime,
            game_date: game.date,
            sport: "NBA",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (!error) syncedCount++
      }

      return syncedCount
    } catch (error) {
      console.error("Error syncing games:", error)
      throw error
    }
  }

  async syncInjuries(): Promise<number> {
    try {
      const injuries = await sportsAPI.getInjuryReport()
      let syncedCount = 0

      for (const injury of injuries) {
        const { error } = await supabase.from("injuries").upsert(
          {
            id: injury.id,
            player_name: injury.playerName,
            team: injury.team,
            status: injury.status,
            injury_type: injury.injury,
            notes: injury.notes,
            sport: "NBA",
            updated_at: injury.updated,
          },
          {
            onConflict: "id",
          },
        )

        if (!error) syncedCount++
      }

      return syncedCount
    } catch (error) {
      console.error("Error syncing injuries:", error)
      throw error
    }
  }

  async syncNews(): Promise<number> {
    try {
      const news = await sportsAPI.getNews()
      let syncedCount = 0

      for (const item of news) {
        const { error } = await supabase.from("news").insert({
          id: item.id,
          title: item.title,
          content: item.content,
          source: item.source,
          published_date: item.date,
          impact: item.impact,
          player_name: item.playerName,
          team_name: item.teamName,
          sport: "NBA",
        })

        // Ignore duplicate key errors
        if (!error || error.code === "23505") syncedCount++
      }

      return syncedCount
    } catch (error) {
      console.error("Error syncing news:", error)
      throw error
    }
  }

  async getLatestProps(sport = "NBA", limit = 20): Promise<Prop[]> {
    try {
      const { data, error } = await supabase
        .from("props")
        .select("*")
        .eq("sport", sport)
        .eq("is_active", true)
        .order("confidence", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Database error fetching props:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error getting latest props:", error)
      return []
    }
  }

  async getLatestGames(sport = "NBA"): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("sport", sport)
        .order("updated_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Database error fetching games:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error getting latest games:", error)
      return []
    }
  }

  async getLatestInjuries(sport = "NBA"): Promise<Injury[]> {
    try {
      const { data, error } = await supabase
        .from("injuries")
        .select("*")
        .eq("sport", sport)
        .order("updated_at", { ascending: false })
        .limit(15)

      if (error) {
        console.error("Database error fetching injuries:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error getting latest injuries:", error)
      return []
    }
  }

  async getLatestNews(sport = "NBA", limit = 10): Promise<News[]> {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("sport", sport)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Database error fetching news:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error getting latest news:", error)
      return []
    }
  }
}

export const dataSyncService = new DataSyncService()
