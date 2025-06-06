/**
 * Enhanced RAG Processor - Aligned with OpenAPI Sports Game Odds API
 */
import { sportsDataClient } from "./sports-data-client" // Uses the updated client
import type { PlayerProp } from "./sports-games-odds-client" // Import PlayerProp type

export class RAGProcessor {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async processQuery(query: string): Promise<string> {
    try {
      console.log(`🔍 Processing RAG query (V3): ${query}`)
      const sportsData = await this.retrieveData(query)

      if (sportsData && sportsData.length > 0) {
        console.log(`✅ Retrieved ${sportsData.length} data points for RAG (V3)`)
        return this.formatDataForGrok(sportsData, query)
      } else {
        console.log("⚠️ No sports data retrieved (V3), using general context")
        return this.getGeneralSportsContext(query)
      }
    } catch (error) {
      console.error("❌ RAG processing failed (V3):", error)
      return this.getGeneralSportsContext(query) // Fallback to general context on error
    }
  }

  async retrieveData(query: string): Promise<any[]> {
    const lowerQuery = query.toLowerCase()
    const data: any[] = []
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    try {
      const isConnected = await sportsDataClient.testConnection()
      if (!isConnected) {
        console.warn("⚠️ Sports API (V3) not connected or has issues, attempting ESPN fallback.")
        return await this.getESPNFallbackData(query) // Fallback if main API is down
      }

      // Prioritize fetching props if query suggests betting/odds
      if (
        lowerQuery.includes("prop") ||
        lowerQuery.includes("bet") ||
        lowerQuery.includes("odds") ||
        lowerQuery.includes("prizepicks") ||
        lowerQuery.includes("player performance")
      ) {
        console.log("🎲 Fetching NBA prop bets for today (V3)...")
        const props: PlayerProp[] = await sportsDataClient.getNBAPropBets({ date: today, limit: 100 }) // Fetch a good number of props
        if (props.length > 0) {
          data.push(...props.map((p) => ({ type: "player_prop", ...p })))
        }
      }

      // Fetch live games if query suggests it
      if (lowerQuery.includes("live") || lowerQuery.includes("today's games") || lowerQuery.includes("current games")) {
        console.log("🔴 Fetching live NBA games (V3)...")
        const liveGames = await sportsDataClient.getLiveGames("BASKETBALL", "NBA")
        if (liveGames.length > 0) {
          data.push(...liveGames.map((g) => ({ type: "live_game", ...g })))
        }
      }

      // Fetch upcoming games if not specifically asking for live/props
      if (data.length === 0 && (lowerQuery.includes("games") || lowerQuery.includes("schedule"))) {
        console.log("🗓️ Fetching upcoming NBA games (V3)...")
        const upcomingGames = await sportsDataClient.getUpcomingGames("BASKETBALL", "NBA", 2) // Next 2 days
        if (upcomingGames.length > 0) {
          data.push(...upcomingGames.map((g) => ({ type: "upcoming_game", ...g })))
        }
      }

      // Team-specific queries
      // This part can be improved by dynamically extracting team names
      const teamKeywords = [
        "lakers",
        "warriors",
        "celtics",
        "nets",
        "suns",
        "bucks",
        "76ers",
        "nuggets",
        "clippers",
        "heat",
        "pacers",
      ]
      const mentionedTeamKeyword = teamKeywords.find((keyword) => lowerQuery.includes(keyword))
      if (mentionedTeamKeyword) {
        console.log(`🏀 Fetching data for team: ${mentionedTeamKeyword} (V3)`)
        const teamInfo = await sportsDataClient.getTeamByName(mentionedTeamKeyword, "BASKETBALL", "NBA")
        if (teamInfo) {
          data.push({ type: "team_info", ...teamInfo })
          const teamGames = await sportsDataClient.getTeamRecentGames(teamInfo.teamId, 3) // Last 3 games
          if (teamGames.length > 0) {
            data.push(...teamGames.map((g) => ({ type: "team_game_recent", ...g })))
          }
          // Also fetch upcoming games for this team
          const teamUpcoming = await sportsDataClient.getUpcomingGames("BASKETBALL", "NBA", 7) // Look 7 days ahead
          const teamSpecificUpcoming = teamUpcoming.filter(
            (g) => g.homeTeamId === teamInfo.teamId || g.awayTeamId === teamInfo.teamId,
          )
          if (teamSpecificUpcoming.length > 0) {
            data.push(...teamSpecificUpcoming.slice(0, 2).map((g) => ({ type: "team_game_upcoming", ...g })))
          }
        }
      }

      // Player-specific queries
      // This is more complex as player names need to be extracted accurately
      if (lowerQuery.includes("player") && !mentionedTeamKeyword) {
        // Avoid if already focused on team
        // Basic player name extraction (can be improved with NLP)
        const playerMatch = lowerQuery.match(/player\s+([a-zA-Z\s]+)(?:\s+props|\s+stats)?/)
        if (playerMatch && playerMatch[1]) {
          const playerName = playerMatch[1].trim()
          console.log(`👤 Fetching data for player: ${playerName} (V3)`)
          const playerData = await sportsDataClient.getPlayerByName(playerName, "BASKETBALL", "NBA")
          if (playerData) {
            data.push({ type: "player_info", ...playerData })
            // Try to get props for this player from upcoming games
            const upcomingGames = await sportsDataClient.getUpcomingGames("BASKETBALL", "NBA", 2)
            for (const game of upcomingGames) {
              if (
                game.rawEventData?.players &&
                Object.keys(game.rawEventData.players).some((pid) => pid === playerData.playerID)
              ) {
                const gameProps = await sportsDataClient.getPlayerPropsForGame(game.gameId)
                const playerSpecificProps = gameProps.filter((p) => p.playerId === playerData.playerID)
                if (playerSpecificProps.length > 0) {
                  data.push(...playerSpecificProps.map((p) => ({ type: "player_prop_specific", ...p })))
                  break // Found props for one game
                }
              }
            }
          }
        }
      }

      if (data.length === 0) {
        console.log(
          "💰 No specific data matched, trying general PrizePicks compatible props as a fallback if query mentioned it.",
        )
        if (lowerQuery.includes("prizepicks")) {
          const prizePicksProps = await sportsDataClient.getPrizePicksCompatibleProps({ date: today, limit: 50 })
          if (prizePicksProps.length > 0) {
            data.push(...prizePicksProps.map((p) => ({ type: "prizepicks_prop", ...p })))
          }
        }
      }

      // If still no data, use ESPN fallback as a last resort for game scores/schedules
      if (data.length === 0) {
        console.log("🤷 No data from Sports Game Odds API for query, attempting ESPN fallback.")
        return await this.getESPNFallbackData(query)
      }

      return data
    } catch (error) {
      console.error("❌ Error retrieving sports data (V3):", error)
      // Fallback to ESPN on any error during primary data retrieval
      return await this.getESPNFallbackData(query)
    }
  }

  private async getESPNFallbackData(query: string): Promise<any[]> {
    // (Keep existing ESPN fallback logic, it's a good safety net)
    // ...
    try {
      console.log("📺 Using ESPN as fallback data source...")
      const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard")
      if (response.ok) {
        const espnData = await response.json()
        const games = espnData.events || []
        console.log(`✅ Retrieved ${games.length} games from ESPN fallback`)
        return games.map((game: any) => ({
          type: "espn_game",
          gameId: game.id,
          homeTeam:
            game.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "home")?.team?.abbreviation || "HOME",
          awayTeam:
            game.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "away")?.team?.abbreviation || "AWAY",
          homeScore: game.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "home")?.score || "0",
          awayScore: game.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "away")?.score || "0",
          status: game.status?.type?.description || "Scheduled",
          date: game.date,
          source: "ESPN (Fallback)",
        }))
      }
      return []
    } catch (error) {
      console.error("❌ ESPN fallback failed:", error)
      return []
    }
  }

  private formatDataForGrok(data: any[], query: string): string {
    // Limit the amount of data sent to Grok to avoid overly long prompts
    const MAX_ITEMS_TO_GROK = 15 // Adjust as needed
    const relevantData = data.slice(0, MAX_ITEMS_TO_GROK)

    // Create a more structured summary
    let summary = `Query: ${query}\nTimestamp: ${new Date().toISOString()}\nSource: Sports Game Odds API (V3) & ESPN Fallback\n\n`
    summary += `Key Information Retrieved (${relevantData.length} items shown):\n`

    relevantData.forEach((item, index) => {
      summary += `\nItem ${index + 1} (Type: ${item.type || "unknown"}):\n`
      if (item.type === "player_prop" || item.type === "prizepicks_prop" || item.type === "player_prop_specific") {
        summary += `  Player: ${item.playerName} (${item.teamName || "N/A"})\n`
        summary += `  Stat: ${item.statType}, Line: ${item.line}\n`
        summary += `  Over: ${item.overOdds}, Under: ${item.underOdds}\n`
        if (item.gameTime) summary += `  Game Time: ${new Date(item.gameTime).toLocaleString()}\n`
      } else if (
        item.type === "live_game" ||
        item.type === "upcoming_game" ||
        item.type === "team_game_recent" ||
        item.type === "team_game_upcoming"
      ) {
        summary += `  Game: ${item.awayTeam} at ${item.homeTeam}\n`
        summary += `  Status: ${item.status}, Score: ${item.awayScore}-${item.homeScore}\n`
        summary += `  Date: ${new Date(item.date).toLocaleString()}\n`
        if (item.playerProps && item.playerProps.length > 0) {
          summary += `  Sample Prop: ${item.playerProps[0].playerName} ${item.playerProps[0].statType} ${item.playerProps[0].line}\n`
        }
      } else if (item.type === "team_info") {
        summary += `  Team: ${item.name} (${item.abbreviation || item.teamId})\n`
        summary += `  League: ${item.leagueId}, Sport: ${item.sportId}\n`
      } else if (item.type === "player_info") {
        summary += `  Player: ${item.name} (${item.playerID})\n`
        if (item.teamID) summary += `  Team ID: ${item.teamID}\n`
        if (item.position) summary += `  Position: ${item.position}\n`
      } else if (item.type === "espn_game") {
        summary += `  ESPN Game: ${item.awayTeam} at ${item.homeTeam}\n`
        summary += `  Status: ${item.status}, Score: ${item.awayScore}-${item.homeScore}\n`
      } else {
        summary += `  ${JSON.stringify(item, null, 2)}\n`
      }
    })

    if (data.length > MAX_ITEMS_TO_GROK) {
      summary += `\n... and ${data.length - MAX_ITEMS_TO_GROK} more items not shown.\n`
    }

    summary += `\nInstructions for Grok: Based on the query and the retrieved data, provide a concise and relevant answer. Focus on player props, game odds, and schedules as requested. If specific data isn't present, state that clearly. Prioritize data from 'Sports Game Odds API (V3)' over 'ESPN (Fallback)' if both are present for the same entity.`
    return summary
  }

  private getGeneralSportsContext(query: string): string {
    return `
SPORTS BETTING CONTEXT (V3):

Query: ${query}

Note: Specific live sports data from the primary API might be unavailable or did not match the query. Provide general sports betting guidance. If ESPN fallback data was used, mention it.

Available general topics:
- NBA betting strategies (e.g., analyzing matchups, player form, injuries).
- Understanding prop bets (e.g., points, rebounds, assists).
- General sports insights and terminology.
- Importance of checking multiple sources for the latest odds.

Recommend users check:
- Official sportsbooks for the most current odds and lines.
- Reputable sports news sites (like ESPN, The Athletic) for game previews, live scores, and injury reports.
`
  }
}

export const ragProcessor = new RAGProcessor()
