/**
 * ESPN Sports API Client - Free alternative to Sports Games Odds
 * No API key required, reliable NBA data source
 */

interface ESPNGame {
  id: string
  date: string
  name: string
  shortName: string
  competitions: Array<{
    id: string
    competitors: Array<{
      id: string
      team: {
        id: string
        abbreviation: string
        displayName: string
        shortDisplayName: string
      }
      score: string
      homeAway: string
    }>
    status: {
      type: {
        name: string
        state: string
        completed: boolean
      }
    }
  }>
}

interface ESPNTeam {
  id: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  location: string
}

export class ESPNSportsClient {
  private baseUrl = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba"
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(endpoint: string): string {
    return `espn_${endpoint}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isValidCache(cached.timestamp)) {
      console.log(`📋 ESPN Cache hit for ${endpoint}`)
      return cached.data
    }

    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`🏀 Fetching from ESPN API: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      console.log(`✅ Successfully fetched ESPN data from ${endpoint}`)
      return data
    } catch (error) {
      console.error(`❌ ESPN API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Get today's NBA games
   */
  async getTodaysGames(): Promise<any[]> {
    try {
      const data = await this.makeRequest("/scoreboard")
      return data.events || []
    } catch (error) {
      console.error("Error fetching today's games:", error)
      return []
    }
  }

  /**
   * Get NBA teams
   */
  async getTeams(): Promise<ESPNTeam[]> {
    try {
      const data = await this.makeRequest("/teams")
      return data.sports?.[0]?.leagues?.[0]?.teams?.map((teamData: any) => teamData.team) || []
    } catch (error) {
      console.error("Error fetching teams:", error)
      return []
    }
  }

  /**
   * Get team by name
   */
  async getTeamByName(teamName: string): Promise<ESPNTeam | null> {
    try {
      const teams = await this.getTeams()
      const lowerTeamName = teamName.toLowerCase()

      const team = teams.find(
        (t) =>
          t.displayName.toLowerCase().includes(lowerTeamName) ||
          t.shortDisplayName.toLowerCase().includes(lowerTeamName) ||
          t.abbreviation.toLowerCase() === lowerTeamName ||
          t.location.toLowerCase().includes(lowerTeamName),
      )

      return team || null
    } catch (error) {
      console.error("Error finding team:", error)
      return null
    }
  }

  /**
   * Get team's recent games
   */
  async getTeamRecentGames(teamName: string, limit = 5): Promise<any[]> {
    try {
      const team = await this.getTeamByName(teamName)
      if (!team) {
        throw new Error(`Team "${teamName}" not found`)
      }

      // Get team's schedule
      const data = await this.makeRequest(`/teams/${team.id}/schedule`)
      const events = data.events || []

      // Filter completed games and limit results
      return events.filter((event: any) => event.competitions?.[0]?.status?.type?.completed).slice(0, limit)
    } catch (error) {
      console.error("Error fetching team recent games:", error)
      return []
    }
  }

  /**
   * Get current season standings
   */
  async getStandings(): Promise<any[]> {
    try {
      const data = await this.makeRequest("/standings")
      return data.children || []
    } catch (error) {
      console.error("Error fetching standings:", error)
      return []
    }
  }
}

export const espnSportsClient = new ESPNSportsClient()
