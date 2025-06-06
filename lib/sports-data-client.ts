/**
 * Updated Sports Data Client - Uses Sports Games Odds V3 API (OpenAPI Aligned)
 */

import { sportsGamesOddsClient, type EventData, type PlayerProp } from "./sports-games-odds-client" // Ensure PlayerProp is exported

interface GameStats {
  gameId: string
  homeTeam: string
  awayTeam: string
  homeTeamId?: string
  awayTeamId?: string
  homeScore?: number // Scores might not be in all event objects initially
  awayScore?: number
  date: string // ISO string
  status: "scheduled" | "live" | "final" | "postponed" | "other"
  league: string
  sport: string
  odds?: any // Keeping this generic for now, could be more specific
  playerProps?: PlayerProp[] // Store extracted player props here
  rawEventData?: EventData // Optionally store the full event for more details
}

interface TeamInfo {
  teamId: string
  name: string
  abbreviation?: string
  city?: string
  leagueId: string
  sportId: string
  rawTeamData?: any
}

// SeasonStats might be harder to get directly, API focuses on events/odds
interface SeasonStats {
  teamId: string
  season: string // e.g., "2023-2024"
  wins?: number
  losses?: number
  // ... other stats if derivable
}

export class SportsDataClient {
  private currentSeason: string // This logic might need adjustment based on API data

  constructor() {
    // Determine current NBA season (example, might need to be more dynamic or API-driven)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // JS months are 0-indexed
    // NBA season typically starts in October and ends in June.
    // If current month is Oct, Nov, Dec (year YYYY), season is YYYY-(YYYY+1).
    // If current month is Jan-Sep (year YYYY), season is (YYYY-1)-YYYY.
    if (month >= 10) {
      this.currentSeason = `${year}-${(year + 1).toString().slice(-2)}`
    } else {
      this.currentSeason = `${year - 1}-${year.toString().slice(-2)}`
    }
    console.log(`🏀 SportsDataClient (V3) initialized. Current NBA season (estimated): ${this.currentSeason}`)
  }

  private parseGameStatus(event: EventData): "scheduled" | "live" | "final" | "postponed" | "other" {
    const statusDisplay = event.status?.displayShort?.toLowerCase() || event.status?.displayLong?.toLowerCase() || ""
    if (!statusDisplay) return "scheduled"

    if (statusDisplay.includes("final") || statusDisplay.includes("ft") || statusDisplay.includes("aet")) return "final"
    if (
      statusDisplay.includes("live") ||
      statusDisplay.includes("progress") ||
      statusDisplay.match(/\d{1,2}'/) ||
      statusDisplay.includes("ht")
    )
      return "live"
    if (statusDisplay.includes("postponed") || statusDisplay.includes("canc")) return "postponed"
    if (statusDisplay.includes("scheduled") || statusDisplay.includes("sched.") || statusDisplay.includes("vs"))
      return "scheduled"

    // Check based on periods if displayShort is not definitive
    const periods = event.status?.periods
    if (periods) {
      const hasStarted = periods.started && periods.started.length > 0
      const allEnded =
        periods.ended &&
        periods.started &&
        periods.ended.length === periods.started.length &&
        periods.started.includes("game") // crude check
      if (allEnded) return "final"
      if (hasStarted) return "live"
    }
    return "scheduled" // Default
  }

  private mapEventToGameStats(event: EventData, playerProps?: PlayerProp[]): GameStats {
    const homeTeam = event.teams?.home
    const awayTeam = event.teams?.away

    // Scores from results if available, otherwise from team overview in event
    const homeScore = event.results?.game?.home?.points ?? homeTeam?.score ?? undefined
    const awayScore = event.results?.game?.away?.points ?? awayTeam?.score ?? undefined

    return {
      gameId: event.eventID,
      homeTeam: homeTeam?.names?.medium || homeTeam?.names?.short || "Home",
      awayTeam: awayTeam?.names?.medium || awayTeam?.names?.short || "Away",
      homeTeamId: homeTeam?.teamID,
      awayTeamId: awayTeam?.teamID,
      homeScore: homeScore,
      awayScore: awayScore,
      date: event.status?.startsAt || new Date().toISOString(),
      status: this.parseGameStatus(event),
      league: event.leagueID,
      sport: event.sportID,
      odds: event.odds || {}, // Raw odds object
      playerProps: playerProps || [],
      rawEventData: event,
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing Sports Games Odds API (V3) connection via SportsDataClient...")
      const diagnosis = await sportsGamesOddsClient.diagnoseAPI()
      console.log(`📊 API Diagnosis (V3) Results:`)
      console.log(`- API Key Present: ${diagnosis.apiKeyPresent}`)
      console.log(`- Working Endpoints: ${diagnosis.workingEndpoints.length} / ${diagnosis.endpointsTested.length}`)
      console.log(`- Errors: ${diagnosis.errors.length}`)
      if (diagnosis.errors.length > 0) console.log("❌ Errors found:", diagnosis.errors)
      return (
        diagnosis.workingEndpoints.length > 0 &&
        diagnosis.errors.filter((e: string) => !e.includes("no data returned")).length === 0
      )
    } catch (error) {
      console.error("❌ Sports Games Odds API (V3) connection test failed:", error)
      return false
    }
  }

  async getLiveGames(sportID = "BASKETBALL", leagueID = "NBA"): Promise<GameStats[]> {
    try {
      // Get events that are not finalized and are happening around the current time
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      const twelveHoursHence = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()

      const events = await sportsGamesOddsClient.getEvents({
        sportID,
        leagueID,
        marketOddsAvailable: true,
        finalized: false, // Crucial for live/upcoming
        startsAfter: twoHoursAgo,
        startsBefore: twelveHoursHence,
        limit: 25,
      })

      const liveGames = events.filter((event) => this.parseGameStatus(event) === "live")

      return liveGames.map((event) => this.mapEventToGameStats(event))
    } catch (error) {
      console.error(`Error fetching live ${leagueID} games:`, error)
      return []
    }
  }

  async getUpcomingGames(sportID = "BASKETBALL", leagueID = "NBA", daysAhead = 2): Promise<GameStats[]> {
    try {
      const now = new Date()
      const startsAfter = now.toISOString()
      const startsBefore = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000).toISOString()

      const events = await sportsGamesOddsClient.getEvents({
        sportID,
        leagueID,
        marketOddsAvailable: true,
        finalized: false,
        startsAfter,
        startsBefore,
        limit: 50,
      })
      return events.map((event) => this.mapEventToGameStats(event))
    } catch (error) {
      console.error(`Error fetching upcoming ${leagueID} games:`, error)
      return []
    }
  }

  async getTeamByName(teamName: string, sportID = "BASKETBALL", leagueID = "NBA"): Promise<TeamInfo | null> {
    try {
      const teams = await sportsGamesOddsClient.getTeams(sportID, leagueID)
      const lowerTeamName = teamName.toLowerCase()
      const team = teams.find(
        (t: any) =>
          t.names?.long?.toLowerCase().includes(lowerTeamName) ||
          t.names?.medium?.toLowerCase().includes(lowerTeamName) ||
          t.names?.short?.toLowerCase() === lowerTeamName ||
          t.teamID?.toLowerCase() === lowerTeamName,
      )
      if (team) {
        return {
          teamId: team.teamID,
          name: team.names?.long || team.names?.medium || team.teamID,
          abbreviation: team.names?.short,
          leagueId: team.leagueID || leagueID,
          sportId: team.sportID || sportID,
          rawTeamData: team,
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching ${leagueID} team by name "${teamName}":`, error)
      return null
    }
  }

  async getTeamRecentGames(teamId: string, limit = 5): Promise<GameStats[]> {
    try {
      // Fetch recent events for the team, including finalized ones
      const now = new Date()
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const events = await sportsGamesOddsClient.getEvents({
        teamID: teamId, // The API uses teamID directly in /events/
        finalized: true, // Get completed games
        startsAfter: oneMonthAgo, // Limit search to recent past
        startsBefore: now.toISOString(),
        limit: limit * 2, // Fetch more to sort and pick latest
      })

      // Sort by date descending and take limit
      const sortedRecentGames = events
        .sort((a, b) => new Date(b.status.startsAt).getTime() - new Date(a.status.startsAt).getTime())
        .slice(0, limit)

      return sortedRecentGames.map((event) => this.mapEventToGameStats(event))
    } catch (error) {
      console.error(`Error fetching recent games for team ${teamId}:`, error)
      return []
    }
  }

  async getGameDetails(eventId: string): Promise<GameStats | null> {
    try {
      const events = await sportsGamesOddsClient.getEvents({ eventID: eventId, limit: 1 })
      if (events && events.length > 0) {
        const event = events[0]
        // Fetch props specifically for this game
        const props = await sportsGamesOddsClient.extractPlayerPropsFromEvent(event)
        return this.mapEventToGameStats(event, props)
      }
      return null
    } catch (error) {
      console.error(`Error fetching details for game ${eventId}:`, error)
      return null
    }
  }

  async getPlayerPropsForGame(eventId: string): Promise<PlayerProp[]> {
    try {
      const events = await sportsGamesOddsClient.getEvents({ eventID: eventId, limit: 1 })
      if (events && events.length > 0) {
        return sportsGamesOddsClient.extractPlayerPropsFromEvent(events[0])
      }
      return []
    } catch (error) {
      console.error(`Error fetching player props for game ${eventId}:`, error)
      return []
    }
  }

  async getNBAPropBets(options: { date?: string; limit?: number } = {}): Promise<PlayerProp[]> {
    try {
      // This now directly calls the OpenAPI aligned method in sportsGamesOddsClient
      return await sportsGamesOddsClient.getNBAPropBets(options)
    } catch (error) {
      console.error("Error fetching NBA prop bets via SportsDataClient:", error)
      return []
    }
  }

  async getPrizePicksCompatibleProps(options: { date?: string; limit?: number } = {}): Promise<PlayerProp[]> {
    try {
      // This now directly calls the OpenAPI aligned method in sportsGamesOddsClient
      return await sportsGamesOddsClient.getPrizePicksData(options)
    } catch (error) {
      console.error("Error fetching PrizePicks compatible props via SportsDataClient:", error)
      return []
    }
  }

  // Placeholder/Adaptable methods from previous version
  async getTeamSeasonStats(teamName: string, leagueID = "NBA"): Promise<SeasonStats | null> {
    // This data isn't directly available as a "season stats" object from the API.
    // It would need to be derived by fetching all team games for a season and calculating.
    // For now, returning null.
    console.warn(
      `getTeamSeasonStats for ${teamName} is not directly supported by the current API version. Consider deriving from game data.`,
    )
    return null
  }

  async getPlayerByName(playerName: string, sportID = "BASKETBALL", leagueID = "NBA"): Promise<any | null> {
    // The API's /players endpoint can be filtered by playerID, teamID, or eventID.
    // A direct name search across all players isn't a primary filter.
    // This would require fetching all players for a league (if feasible) and then filtering.
    console.warn(
      `getPlayerByName for ${playerName} requires fetching many players and filtering. Provide teamID or eventID if possible for efficiency.`,
    )
    try {
      // Example: Fetch players for a few prominent NBA teams and search
      // This is NOT a scalable solution for all players.
      const exampleTeamIDs = (await sportsGamesOddsClient.getTeams(sportID, leagueID, 5)).map((t) => t.teamID)
      let foundPlayer = null
      for (const teamID of exampleTeamIDs) {
        const players = await sportsGamesOddsClient.getPlayers({ teamID })
        const player = players.find((p) => p.name?.toLowerCase().includes(playerName.toLowerCase()))
        if (player) {
          foundPlayer = player
          break
        }
      }
      return foundPlayer
    } catch (error) {
      console.error(`Error in getPlayerByName for ${playerName}:`, error)
      return null
    }
  }

  async getInjuryReport(sportID = "BASKETBALL", leagueID = "NBA"): Promise<any[]> {
    // Injury data is not explicitly listed as a top-level endpoint in the provided OpenAPI spec.
    // It might be part of player data or event data details.
    // For now, returning empty. This would need further investigation of the API response schemas.
    console.warn(`getInjuryReport for ${leagueID} is not directly supported or needs schema investigation.`)
    return []
  }

  async getNews(sportID = "BASKETBALL", leagueID = "NBA"): Promise<any[]> {
    // News is not an endpoint in the provided OpenAPI spec.
    console.warn(`getNews for ${leagueID} is not supported by this API.`)
    return []
  }
}

export const sportsDataClient = new SportsDataClient()
