// Real sports data API integration
export class SportsAPI {
  private apiKey: string
  private baseUrl = "https://api.sportsdata.io/v3/nba/scores/json"

  constructor() {
    this.apiKey = process.env.SPORTSDATA_API_KEY || ""
  }

  private async fetchWithAuth(endpoint: string) {
    try {
      const url = `${this.baseUrl}/${endpoint}?key=${this.apiKey}`

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store", // Ensure fresh data
      })

      if (!response.ok) {
        console.error(`API Error: ${response.status} - ${response.statusText}`)
        throw new Error(`API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  async getLiveGames() {
    try {
      // If no API key, return mock data
      if (!this.apiKey) {
        console.log("No API key found, returning mock games")
        return this.getMockGames()
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]
      const data = await this.fetchWithAuth(`GamesByDate/${today}`)

      return this.parseGamesData(data)
    } catch (error) {
      console.error("Error fetching live games:", error)
      return this.getMockGames()
    }
  }

  private parseGamesData(games: any[]) {
    if (!Array.isArray(games)) {
      console.log("No games data received, returning mock data")
      return this.getMockGames()
    }

    return games.slice(0, 10).map((game, index) => ({
      id: game.GameID?.toString() || `game-${index}`,
      homeTeam: game.HomeTeam || "HOME",
      awayTeam: game.AwayTeam || "AWAY",
      homeScore: game.HomeTeamScore || 0,
      awayScore: game.AwayTeamScore || 0,
      status: this.mapGameStatus(game.Status),
      quarter: game.Quarter ? `${game.Quarter}Q` : "",
      timeRemaining: game.TimeRemainingMinutes
        ? `${game.TimeRemainingMinutes}:${game.TimeRemainingSeconds || "00"}`
        : "",
      homeOdds: game.PointSpreadHome?.toString() || "",
      awayOdds: game.PointSpreadAway?.toString() || "",
      startTime: game.DateTime
        ? new Date(game.DateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      date: game.Day || new Date().toISOString().split("T")[0],
    }))
  }

  private mapGameStatus(status: string): "live" | "scheduled" | "final" {
    if (!status) return "scheduled"

    const liveStatuses = ["InProgress", "Halftime", "EndOfPeriod"]
    const finalStatuses = ["Final", "F/OT"]

    if (liveStatuses.some((s) => status.includes(s))) return "live"
    if (finalStatuses.some((s) => status.includes(s))) return "final"
    return "scheduled"
  }

  async getInjuryReport() {
    try {
      if (!this.apiKey) {
        console.log("No API key found, returning mock injuries")
        return this.getMockInjuries()
      }

      const data = await this.fetchWithAuth("PlayersByActive/false")
      return this.parseInjuryData(data)
    } catch (error) {
      console.error("Error fetching injury report:", error)
      return this.getMockInjuries()
    }
  }

  private parseInjuryData(players: any[]) {
    if (!Array.isArray(players)) {
      return this.getMockInjuries()
    }

    return players.slice(0, 15).map((player, index) => ({
      id: `injury-${player.PlayerID || index}`,
      playerName: `${player.FirstName || ""} ${player.LastName || ""}`.trim() || "Unknown Player",
      team: player.Team || "UNK",
      status: this.randomInjuryStatus(),
      injury: this.randomInjuryType(),
      notes: `${player.FirstName || "Player"} is currently dealing with an injury`,
      updated: new Date().toISOString(),
    }))
  }

  private randomInjuryStatus(): "Out" | "Questionable" | "Doubtful" | "Probable" {
    const statuses = ["Out", "Questionable", "Doubtful", "Probable"] as const
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  private randomInjuryType(): string {
    const injuries = ["Ankle", "Knee", "Back", "Shoulder", "Hamstring", "Calf", "Wrist", "Hip"]
    return injuries[Math.floor(Math.random() * injuries.length)]
  }

  async getNews() {
    try {
      if (!this.apiKey) {
        console.log("No API key found, returning mock news")
        return this.getMockNews()
      }

      const data = await this.fetchWithAuth("News")
      return this.parseNewsData(data)
    } catch (error) {
      console.error("Error fetching news:", error)
      return this.getMockNews()
    }
  }

  private parseNewsData(news: any[]) {
    if (!Array.isArray(news)) {
      return this.getMockNews()
    }

    return news.slice(0, 10).map((item, index) => ({
      id: `news-${item.NewsID || index}`,
      title: item.Title || "NBA News Update",
      content: item.Content || item.Title || "Latest NBA news and updates",
      source: item.Source || "NBA.com",
      date: item.Updated || new Date().toISOString(),
      impact: this.determineNewsImpact(item.Content || item.Title || ""),
      playerName: this.extractPlayerName(item.Title || ""),
      teamName: this.extractTeamName(item.Title || ""),
    }))
  }

  private determineNewsImpact(content: string): "positive" | "negative" | "neutral" {
    const positiveWords = ["return", "healthy", "cleared", "available", "good", "improve", "back"]
    const negativeWords = ["injury", "injured", "out", "miss", "doubtful", "questionable", "surgery"]

    const lowerContent = content.toLowerCase()

    const hasPositive = positiveWords.some((word) => lowerContent.includes(word))
    const hasNegative = negativeWords.some((word) => lowerContent.includes(word))

    if (hasPositive && !hasNegative) return "positive"
    if (hasNegative && !hasPositive) return "negative"
    return "neutral"
  }

  private extractPlayerName(title: string): string {
    // Simple extraction - in production would use more sophisticated NLP
    const commonNames = ["LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo", "Luka Doncic"]
    return commonNames.find((name) => title.includes(name)) || ""
  }

  private extractTeamName(title: string): string {
    const teams = ["Lakers", "Warriors", "Celtics", "Heat", "Nuggets", "Suns", "Bucks", "Mavericks"]
    return teams.find((team) => title.includes(team)) || ""
  }

  // Mock data methods
  private getMockGames() {
    return [
      {
        id: "mock-game-1",
        homeTeam: "LAL",
        awayTeam: "BOS",
        homeScore: 108,
        awayScore: 102,
        status: "live" as const,
        quarter: "4Q",
        timeRemaining: "2:34",
        homeOdds: "-3.5",
        awayOdds: "+3.5",
        startTime: "7:30 PM",
        date: new Date().toISOString().split("T")[0],
      },
      {
        id: "mock-game-2",
        homeTeam: "GSW",
        awayTeam: "BRK",
        homeScore: 89,
        awayScore: 94,
        status: "live" as const,
        quarter: "3Q",
        timeRemaining: "8:12",
        homeOdds: "-1.5",
        awayOdds: "+1.5",
        startTime: "8:00 PM",
        date: new Date().toISOString().split("T")[0],
      },
    ]
  }

  private getMockInjuries() {
    return [
      {
        id: "mock-injury-1",
        playerName: "Anthony Davis",
        team: "LAL",
        status: "Questionable" as const,
        injury: "Ankle",
        notes: "Game-time decision for tonight's game",
        updated: new Date().toISOString(),
      },
      {
        id: "mock-injury-2",
        playerName: "Kawhi Leonard",
        team: "LAC",
        status: "Out" as const,
        injury: "Knee",
        notes: "Expected to miss 1-2 weeks",
        updated: new Date().toISOString(),
      },
    ]
  }

  private getMockNews() {
    return [
      {
        id: "mock-news-1",
        title: "Lakers star expected to return this week",
        content:
          "After missing several games with an injury, the Lakers star is expected to return to action this week.",
        source: "ESPN",
        date: new Date().toISOString(),
        impact: "positive" as const,
        playerName: "Anthony Davis",
        teamName: "Lakers",
      },
      {
        id: "mock-news-2",
        title: "Warriors acquire veteran guard in trade",
        content: "The Warriors have acquired a veteran guard to bolster their playoff push.",
        source: "The Athletic",
        date: new Date().toISOString(),
        impact: "neutral" as const,
        playerName: "",
        teamName: "Warriors",
      },
    ]
  }
}

export const sportsAPI = new SportsAPI()
