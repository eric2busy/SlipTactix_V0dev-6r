/**
 * Smart Sports Client - Automatically chooses best available data source
 */

import { sportsDataClient } from "./sports-data-client"
import { espnSportsClient } from "./espn-sports-client"

export class SmartSportsClient {
  private primarySource = "sportsgamesodds"
  private fallbackSource = "espn"

  async getTeamByName(teamName: string) {
    try {
      console.log(`🔍 Looking up team: ${teamName}`)

      // Try Sports Games Odds first
      if (this.primarySource === "sportsgamesodds") {
        try {
          const result = await sportsDataClient.getTeamByName(teamName)
          if (result) {
            console.log(`✅ Found team via Sports Games Odds: ${result.name}`)
            return result
          }
        } catch (error) {
          console.log(`⚠️ Sports Games Odds failed, trying ESPN...`)
        }
      }

      // Fallback to ESPN
      const espnTeam = await espnSportsClient.getTeamByName(teamName)
      if (espnTeam) {
        console.log(`✅ Found team via ESPN: ${espnTeam.displayName}`)
        return {
          teamId: espnTeam.id,
          name: espnTeam.displayName,
          abbreviation: espnTeam.abbreviation,
          city: espnTeam.location,
          source: "espn",
        }
      }

      throw new Error(`Team "${teamName}" not found in any data source`)
    } catch (error) {
      console.error("Error in smart team lookup:", error)
      throw error
    }
  }

  async getTeamRecentGames(teamName: string, limit = 5) {
    try {
      console.log(`🔍 Getting recent games for: ${teamName}`)

      // Try Sports Games Odds first
      if (this.primarySource === "sportsgamesodds") {
        try {
          const result = await sportsDataClient.getTeamRecentGames(teamName, limit)
          if (result && result.length > 0) {
            console.log(`✅ Found ${result.length} games via Sports Games Odds`)
            return result
          }
        } catch (error) {
          console.log(`⚠️ Sports Games Odds failed, trying ESPN...`)
        }
      }

      // Fallback to ESPN
      const espnGames = await espnSportsClient.getTeamRecentGames(teamName, limit)
      if (espnGames && espnGames.length > 0) {
        console.log(`✅ Found ${espnGames.length} games via ESPN`)
        return espnGames.map(this.parseESPNGame)
      }

      return []
    } catch (error) {
      console.error("Error in smart recent games lookup:", error)
      return []
    }
  }

  async getTodaysGames() {
    try {
      console.log(`🔍 Getting today's games...`)

      // Try Sports Games Odds first
      if (this.primarySource === "sportsgamesodds") {
        try {
          const result = await sportsDataClient.getLiveGames()
          if (result && result.length > 0) {
            console.log(`✅ Found ${result.length} games via Sports Games Odds`)
            return result
          }
        } catch (error) {
          console.log(`⚠️ Sports Games Odds failed, trying ESPN...`)
        }
      }

      // Fallback to ESPN
      const espnGames = await espnSportsClient.getTodaysGames()
      if (espnGames && espnGames.length > 0) {
        console.log(`✅ Found ${espnGames.length} games via ESPN`)
        return espnGames.map(this.parseESPNGame)
      }

      return []
    } catch (error) {
      console.error("Error in smart games lookup:", error)
      return []
    }
  }

  private parseESPNGame(espnGame: any) {
    const competition = espnGame.competitions?.[0]
    const homeTeam = competition?.competitors?.find((c: any) => c.homeAway === "home")
    const awayTeam = competition?.competitors?.find((c: any) => c.homeAway === "away")

    return {
      gameId: espnGame.id,
      homeTeam: homeTeam?.team?.abbreviation || "HOME",
      awayTeam: awayTeam?.team?.abbreviation || "AWAY",
      homeScore: Number.parseInt(homeTeam?.score || "0"),
      awayScore: Number.parseInt(awayTeam?.score || "0"),
      date: espnGame.date,
      status: competition?.status?.type?.completed
        ? "final"
        : competition?.status?.type?.state === "in"
          ? "live"
          : "scheduled",
      season: "2024-25",
      source: "espn",
    }
  }
}

export const smartSportsClient = new SmartSportsClient()
