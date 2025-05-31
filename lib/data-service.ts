import { supabase } from "./supabase"
import { sportsDataScraper } from "./webscraper"

export class DataService {
  // Sync live games data
  async syncLiveGames() {
    try {
      const scrapedGames = await sportsDataScraper.scrapeNBAScores()

      for (const game of scrapedGames) {
        const { error } = await supabase.from("games").upsert({
          id: game.id,
          home_team: game.homeTeam,
          away_team: game.awayTeam,
          home_score: game.homeScore,
          away_score: game.awayScore,
          status: game.status,
          quarter: game.quarter,
          time_remaining: game.timeRemaining,
          updated_at: new Date().toISOString(),
        })

        if (error) console.error("Error syncing game:", error)
      }

      return scrapedGames
    } catch (error) {
      console.error("Error syncing live games:", error)
      return []
    }
  }

  // Sync injury data
  async syncInjuries() {
    try {
      const injuries = await sportsDataScraper.scrapeInjuryReport()

      for (const injury of injuries) {
        const { error } = await supabase.from("injuries").upsert({
          player_name: injury.playerName,
          team: injury.team,
          status: injury.status,
          injury: injury.injury,
          notes: injury.notes,
          updated_at: new Date().toISOString(),
        })

        if (error) console.error("Error syncing injury:", error)
      }

      return injuries
    } catch (error) {
      console.error("Error syncing injuries:", error)
      return []
    }
  }

  // Sync news data
  async syncNews() {
    try {
      const news = await sportsDataScraper.scrapeNews()

      for (const item of news) {
        const { error } = await supabase.from("news").insert({
          title: item.title,
          content: item.content,
          source: item.source,
          impact: item.impact,
          player_name: item.playerName,
          team_name: item.teamName,
        })

        if (error && !error.message.includes("duplicate")) {
          console.error("Error syncing news:", error)
        }
      }

      return news
    } catch (error) {
      console.error("Error syncing news:", error)
      return []
    }
  }

  // Get live games from database
  async getLiveGames() {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching live games:", error)
      return []
    }
  }

  // Get player data
  async getPlayer(name: string) {
    try {
      const { data, error } = await supabase.from("players").select("*").ilike("name", `%${name}%`).single()

      if (error && error.code !== "PGRST116") throw error

      if (!data) {
        // If player not found, scrape and store
        const playerData = await sportsDataScraper.scrapePlayerStats(name)
        if (playerData) {
          const { data: newPlayer, error: insertError } = await supabase
            .from("players")
            .insert({
              name: playerData.name,
              team: playerData.team,
              position: playerData.position,
              stats: playerData.stats,
            })
            .select()
            .single()

          if (insertError) throw insertError
          return newPlayer
        }
      }

      return data
    } catch (error) {
      console.error("Error fetching player:", error)
      return null
    }
  }

  // Save user favorites
  async saveFavorite(userId: string, propId: string) {
    try {
      const { error } = await supabase.from("user_favorites").insert({
        user_id: userId,
        prop_id: propId,
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error saving favorite:", error)
      return false
    }
  }

  // Get user favorites
  async getUserFavorites(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .select(`
          *,
          props (
            *,
            players (name, team)
          )
        `)
        .eq("user_id", userId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching favorites:", error)
      return []
    }
  }

  // Save chat message
  async saveChatMessage(userId: string, content: string, sender: string, messageType = "text", data: any = {}) {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId,
        content,
        sender,
        message_type: messageType,
        data,
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error saving chat message:", error)
      return false
    }
  }
}

export const dataService = new DataService()
