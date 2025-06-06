// No changes needed in this file as the 401 error is external to its logic.
// The client correctly uses process.env.SPORTS_API_KEY.
// The existing error handling and diagnoseAPI method are sufficient.
/**
 * Sports Games Odds API Client - Strictly Adhering to Official OpenAPI Documentation
 */

// ... (Keep existing interfaces like SportsGamesOddsResponse if still relevant, or define new ones based on OpenAPI spec)

interface EventOdd {
  oddID: string
  periodID: string
  sideID?: string // e.g., "over", "under", "home", "away"
  statEntityID: string // Can be teamID, playerID, or "all"
  statID: string // e.g., "points", "passing_yards", "moneyline"
  bookOverUnder?: string // Line for over/under bets
  overUnder?: string // Line for over/under bets
  spread?: string // Spread value
  odds: string // American odds format (e.g., "+100", "-110")
  playerID?: string // Present for player props
  score?: number // Actual score/result for this odd, if event is finalized
  [key: string]: any // Allow other properties
}

interface EventData {
  eventID: string
  sportID: string
  leagueID: string
  type: "match" | "prop" // "match" for games, "prop" for standalone props
  status: any // EventStatus schema
  teams?: { home?: any; away?: any } // TeamOverview schema
  players?: { [playerID: string]: any } // PlayerOverview schema
  props?: { [propStatID: string]: any } // UniqueProp schema for event type "prop"
  odds?: { [oddID: string]: EventOdd } // EventOdds schema, crucial for player props in "match" events
  eventName?: string // For "prop" type events
  [key: string]: any // Allow other properties
}

interface PlayerProp {
  propId: string
  eventId: string
  playerId?: string
  playerName?: string
  teamId?: string
  teamName?: string
  statType: string // e.g., "points", "passing_yards"
  line: number
  overOdds: string
  underOdds: string
  gameTime?: string
  league: string
  sport: string
}

export class SportsGamesOddsClient {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.apiKey = process.env.SPORTS_API_KEY || ""
    this.baseUrl = "https://api.sportsgameodds.com/v1" // Official base URL

    console.log(`🏀 Sports Games Odds Client V3 (OpenAPI Aligned) initialized`)
    console.log(`🔑 API Key present: ${this.apiKey ? "YES" : "NO"}`)
    console.log(`🌐 Base URL: ${this.baseUrl}`)
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Sports Games Odds API key not configured. Please set SPORTS_API_KEY.")
    }

    const queryParams = new URLSearchParams()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, String(params[key]))
      }
    }
    const queryString = queryParams.toString()
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`

    console.log(`🏀 Fetching from SGO API: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": this.apiKey, // Official auth header
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ SGO API Error: ${response.status} - ${endpoint} - ${errorText.substring(0, 500)}`)
      if (response.status === 401)
        throw new Error(
          `Invalid Sports Games Odds API key (401) for endpoint ${endpoint}. Ensure your SPORTS_API_KEY is correct and active for sportsgameodds.com.`,
        )
      if (response.status === 403)
        throw new Error(`Sports Games Odds API access forbidden (403) for endpoint ${endpoint}. Check subscription.`)
      if (response.status === 429)
        throw new Error(`Sports Games Odds API rate limit exceeded (429) for endpoint ${endpoint}.`)
      throw new Error(
        `Sports Games Odds API error: ${response.status} for ${endpoint} - ${errorText.substring(0, 200)}`,
      )
    }

    const data = await response.json()
    console.log(`✅ Successfully fetched from SGO API: ${endpoint} - Items: ${data.data?.length ?? "N/A"}`)
    return data // The API returns { success: boolean, data: [], nextCursor?: string }
  }

  async testConnection(): Promise<any> {
    try {
      const result = await this.makeRequest("/sports/")
      return {
        success: true,
        message: "Connected to Sports Games Odds API (V3)",
        sportsCount: result.data?.length || 0,
        data: result.data,
      }
    } catch (error: any) {
      return { success: false, message: "Failed to connect to Sports Games Odds API (V3)", error: error.message }
    }
  }

  async getSports(): Promise<any[]> {
    const cacheKey = `v3-sports`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data

    const response = await this.makeRequest("/sports/")
    this.cache.set(cacheKey, { data: response.data || [], timestamp: Date.now() })
    return response.data || []
  }

  async getLeagues(sportID?: string): Promise<any[]> {
    const cacheKey = `v3-leagues-${sportID || "all"}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data

    const params: Record<string, any> = {}
    if (sportID) params.sportID = sportID

    const response = await this.makeRequest("/leagues/", params)
    this.cache.set(cacheKey, { data: response.data || [], timestamp: Date.now() })
    return response.data || []
  }

  async getTeams(sportID: string, leagueID: string, limit = 50): Promise<any[]> {
    const cacheKey = `v3-teams-${sportID}-${leagueID}-${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data

    const params = { sportID, leagueID, limit: String(limit) }
    const response = await this.makeRequest("/teams/", params)
    this.cache.set(cacheKey, { data: response.data || [], timestamp: Date.now() })
    return response.data || []
  }

  async getPlayers(teamID?: string, eventID?: string, playerID?: string, limit = 50): Promise<any[]> {
    const cacheKey = `v3-players-${teamID}-${eventID}-${playerID}-${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data

    const params: Record<string, any> = { limit: String(limit) }
    if (teamID) params.teamID = teamID
    if (eventID) params.eventID = eventID
    if (playerID) params.playerID = playerID

    if (!teamID && !eventID && !playerID) {
      console.warn(
        "⚠️ Fetching players without teamID, eventID, or playerID might return many results or fail. Consider providing a filter.",
      )
    }

    const response = await this.makeRequest("/players/", params)
    this.cache.set(cacheKey, { data: response.data || [], timestamp: Date.now() })
    return response.data || []
  }

  async getEvents(
    options: {
      sportID?: string
      leagueID?: string
      eventID?: string
      teamID?: string // Added teamID as per OpenAPI spec for /events/
      marketOddsAvailable?: boolean
      finalized?: boolean // true for finalized, false for unfinalized, undefined for all
      startsAfter?: string // ISO Date string
      startsBefore?: string // ISO Date string
      limit?: number
      cursor?: string
    } = {},
  ): Promise<EventData[]> {
    const cacheKey = `v3-events-${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < (options.finalized === false ? 60000 : this.cacheTimeout)) {
      // Shorter cache for live/upcoming
      return cached.data
    }

    const params: Record<string, any> = { ...options }
    if (options.limit) params.limit = String(options.limit)
    // Remove undefined keys to prevent them from being stringified as "undefined" in query params
    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key])

    const response = await this.makeRequest("/events/", params)
    const events = response.data || []
    this.cache.set(cacheKey, { data: events, timestamp: Date.now() })
    return events
  }

  private extractPlayerPropsFromEvent(event: EventData): PlayerProp[] {
    const extractedProps: PlayerProp[] = []
    if (event.type === "match" && event.odds) {
      for (const oddID in event.odds) {
        const oddDetail = event.odds[oddID]
        if (oddDetail.playerID && oddDetail.statID && oddDetail.overUnder !== undefined) {
          const playerName = event.players?.[oddDetail.playerID]?.name || "Unknown Player"

          let teamForPlayer = null
          if (event.players?.[oddDetail.playerID]?.teamID && event.teams) {
            if (event.teams.home?.teamID === event.players[oddDetail.playerID].teamID) teamForPlayer = event.teams.home
            else if (event.teams.away?.teamID === event.players[oddDetail.playerID].teamID)
              teamForPlayer = event.teams.away
          } else if (event.teams) {
            // Fallback if player doesn't have teamID but odd has statEntityID as home/away
            if (oddDetail.statEntityID === event.teams.home?.statEntityID) teamForPlayer = event.teams.home
            else if (oddDetail.statEntityID === event.teams.away?.statEntityID) teamForPlayer = event.teams.away
          }
          const teamName = teamForPlayer?.names?.short || "UNK"
          const teamId = teamForPlayer?.teamID

          let overOdds: string | undefined = undefined
          let underOdds: string | undefined = undefined

          if (oddDetail.sideID === "over") {
            overOdds = oddDetail.odds
            const underOddKey = Object.keys(event.odds).find((key) => {
              const o = event.odds![key]
              return (
                o.playerID === oddDetail.playerID &&
                o.statID === oddDetail.statID &&
                o.periodID === oddDetail.periodID &&
                o.overUnder === oddDetail.overUnder &&
                o.sideID === "under"
              )
            })
            if (underOddKey) underOdds = event.odds[underOddKey].odds
          } else if (oddDetail.sideID === "under") {
            underOdds = oddDetail.odds
            const overOddKey = Object.keys(event.odds).find((key) => {
              const o = event.odds![key]
              return (
                o.playerID === oddDetail.playerID &&
                o.statID === oddDetail.statID &&
                o.periodID === oddDetail.periodID &&
                o.overUnder === oddDetail.overUnder &&
                o.sideID === "over"
              )
            })
            if (overOddKey) overOdds = event.odds[overOddKey].odds
          } else {
            continue
          }

          if (
            overOdds &&
            underOdds &&
            !extractedProps.some(
              (p) => p.propId === `${event.eventID}-${oddDetail.playerID}-${oddDetail.statID}-${oddDetail.periodID}`,
            )
          ) {
            extractedProps.push({
              propId: `${event.eventID}-${oddDetail.playerID}-${oddDetail.statID}-${oddDetail.periodID}`,
              eventId: event.eventID,
              playerId: oddDetail.playerID,
              playerName: playerName,
              teamId: teamId,
              teamName: teamName,
              statType: oddDetail.statID,
              line: Number.parseFloat(oddDetail.overUnder),
              overOdds: overOdds,
              underOdds: underOdds,
              gameTime: event.status?.startsAt,
              league: event.leagueID,
              sport: event.sportID,
            })
          }
        }
      }
    } else if (event.type === "prop" && event.props) {
      console.log(`ℹ️ Event ${event.eventID} is a standalone prop event: ${event.eventName}`)
    }
    return extractedProps
  }

  async getNBAPropBets(options: { date?: string; limit?: number } = {}): Promise<PlayerProp[]> {
    const eventsParams: any = {
      sportID: "BASKETBALL",
      leagueID: "NBA",
      marketOddsAvailable: true,
      finalized: false,
      limit: options.limit || 50,
    }
    if (options.date) {
      eventsParams.startsAfter = `${options.date}T00:00:00Z`
      eventsParams.startsBefore = `${options.date}T23:59:59Z`
    }

    const events = await this.getEvents(eventsParams)
    const allProps: PlayerProp[] = []
    for (const event of events) {
      allProps.push(...this.extractPlayerPropsFromEvent(event))
    }
    const uniqueProps = Array.from(new Map(allProps.map((p) => [p.propId, p])).values())
    console.log(`🏀 Found ${uniqueProps.length} unique NBA player props.`)
    return uniqueProps
  }

  async getPrizePicksData(options: { date?: string; limit?: number } = {}): Promise<PlayerProp[]> {
    const commonPrizePicksStats = [
      "points",
      "rebounds",
      "assists",
      "steals",
      "blocks",
      "turnovers",
      "freethrows_made",
      "threepointers_made",
      "passing_yards",
      "rushing_yards",
      "receiving_yards",
    ]

    const nbaProps = await this.getNBAPropBets(options)
    const prizePicksFormattedProps = nbaProps.filter((prop) =>
      commonPrizePicksStats.some((stat) => prop.statType.toLowerCase().includes(stat)),
    )
    console.log(`🎯 Formatted ${prizePicksFormattedProps.length} props for PrizePicks compatibility.`)
    return prizePicksFormattedProps
  }

  async getLiveNBAGames(): Promise<EventData[]> {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()

    const events = await this.getEvents({
      sportID: "BASKETBALL",
      leagueID: "NBA",
      marketOddsAvailable: true,
      finalized: false,
      startsAfter: twoHoursAgo,
      startsBefore: twelveHoursLater,
      limit: 20,
    })

    const liveGames = events.filter((event) => {
      const statusName = event.status?.displayShort?.toLowerCase()
      return (
        statusName &&
        !statusName.includes("final") &&
        !statusName.includes("scheduled") &&
        !statusName.includes("postponed") &&
        !statusName.includes("ft") // Another way to denote final
      )
    })
    console.log(`🔴 Found ${liveGames.length} potentially live NBA games.`)
    return liveGames
  }

  async getTeamEvents(teamID: string, limit = 10): Promise<EventData[]> {
    return this.getEvents({ teamID, limit, sportID: "BASKETBALL", leagueID: "NBA" }) // Assuming NBA context
  }

  async diagnoseAPI(): Promise<any> {
    const diagnosis: any = {
      environment: {
        apiKeyPresent: !!this.apiKey,
        apiKeyLength: this.apiKey?.length || 0,
        apiKeyPrefix: this.apiKey
          ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}`
          : "Not found",
      },
      baseUrl: this.baseUrl,
      endpointsTested: [] as any[],
      workingEndpoints: [] as string[],
      errors: [] as string[],
      recommendations: [] as string[],
      timestamp: new Date().toISOString(),
    }

    if (!this.apiKey) {
      diagnosis.errors.push("API key not configured in environment (SPORTS_API_KEY).")
      diagnosis.recommendations.push("Set SPORTS_API_KEY environment variable.")
      diagnosis.recommendations.push("Get API key from: https://sportsgameodds.com/")
      return diagnosis
    }

    const testEndpoints = [
      { path: "/sports/", params: {}, description: "Sports List" },
      { path: "/leagues/", params: { sportID: "BASKETBALL" }, description: "Basketball Leagues" },
      { path: "/teams/", params: { sportID: "BASKETBALL", leagueID: "NBA", limit: "1" }, description: "NBA Teams (1)" },
      {
        path: "/events/",
        params: { sportID: "BASKETBALL", leagueID: "NBA", limit: "1", marketOddsAvailable: "true" },
        description: "NBA Events with Odds (1)",
      },
      {
        path: "/players/",
        params: { teamID: "BOSTON_CELTICS_NBA", limit: "1" }, // Example, might fail if teamID is not universal
        description: "Players (Example: Celtics)",
      },
      {
        path: "/stats/",
        params: { sportID: "BASKETBALL", statLevel: "player" },
        description: "Basketball Player Stats Definitions",
      },
      { path: "/account/usage", params: {}, description: "Account Usage" },
    ]

    for (const endpoint of testEndpoints) {
      try {
        const result = await this.makeRequest(endpoint.path, endpoint.params)
        const testResult = {
          path: endpoint.path,
          description: endpoint.description,
          params: endpoint.params,
          success: result.success !== undefined ? result.success : result.data !== undefined,
          dataCount: result.data?.length ?? (result.data ? 1 : 0),
          message: result.message || (result.data ? "Data received" : "No data field or success=false"),
        }
        diagnosis.endpointsTested.push(testResult)

        if (testResult.success && (testResult.dataCount > 0 || endpoint.path === "/account/usage")) {
          // Account usage might not have data[]
          diagnosis.workingEndpoints.push(endpoint.path)
        } else if (!testResult.success) {
          diagnosis.errors.push(`${endpoint.path}: API reported failure (Message: ${testResult.message})`)
        } else if (testResult.dataCount === 0 && endpoint.path !== "/account/usage") {
          // Allow /account/usage to have 0 data items but still be successful
          diagnosis.errors.push(
            `${endpoint.path}: Success but no data returned. This might be okay depending on filters/availability.`,
          )
          diagnosis.workingEndpoints.push(endpoint.path) // Still consider it "working" if API call itself was successful
        }
      } catch (error: any) {
        diagnosis.endpointsTested.push({
          path: endpoint.path,
          description: endpoint.description,
          params: endpoint.params,
          success: false,
          error: error.message,
        })
        diagnosis.errors.push(`${endpoint.path}: ${error.message}`)
      }
    }

    if (diagnosis.workingEndpoints.length === testEndpoints.length) {
      diagnosis.recommendations.push("✅ Sports Games Odds API (V3) is working great across all tested endpoints!")
    } else if (diagnosis.workingEndpoints.length > 0) {
      diagnosis.recommendations.push(
        "⚠️ Some Sports Games Odds API (V3) endpoints are working, but others have issues or returned no data. Review errors.",
      )
    } else {
      diagnosis.recommendations.push(
        "❌ Major issues detected. No Sports Games Odds API (V3) endpoints seem to be working.",
      )
    }

    if (diagnosis.errors.some((e: string) => e.includes("401") || e.includes("Invalid API key"))) {
      diagnosis.recommendations.push(
        "🔑 CRITICAL: API key is invalid or expired. Please verify your SPORTS_API_KEY and ensure it's active at sportsgameodds.com.",
      )
    }
    if (diagnosis.errors.some((e: string) => e.includes("403"))) {
      diagnosis.recommendations.push("🔒 API access forbidden. Check your subscription plan with Sports Games Odds.")
    }
    if (diagnosis.errors.some((e: string) => e.includes("429"))) {
      diagnosis.recommendations.push("⏱️ Rate limit exceeded. Wait before trying again.")
    }
    if (diagnosis.errors.length > 0 && diagnosis.workingEndpoints.length < testEndpoints.length) {
      diagnosis.recommendations.push("🔍 Further review of specific endpoint errors is needed.")
    }

    return diagnosis
  }
}

export const sportsGamesOddsClient = new SportsGamesOddsClient()
