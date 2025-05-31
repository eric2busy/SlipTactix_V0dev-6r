// PrizePicks data scraper with better error handling
export class PrizePicksScraper {
  private baseUrl = "https://api.prizepicks.com"

  async getActiveProps(sport = "NBA") {
    try {
      console.log(`Fetching PrizePicks props for ${sport}...`)

      // For now, return mock data since PrizePicks API requires special handling
      return this.getMockProps(sport)
    } catch (error) {
      console.error("Error fetching PrizePicks data:", error)
      return this.getMockProps(sport)
    }
  }

  private getMockProps(sport: string) {
    const mockProps = [
      {
        id: "pp_mock_1",
        player: "LeBron James",
        team: "LAL",
        prop: "Points",
        line: "25.5",
        odds: "Pick",
        confidence: 78,
        trend: "up" as const,
        analysis: "LeBron has exceeded 25.5 points in 7 of his last 10 games. Strong value play against this matchup.",
        source: "PrizePicks",
        updated: new Date().toISOString(),
      },
      {
        id: "pp_mock_2",
        player: "Stephen Curry",
        team: "GSW",
        prop: "3-Pointers",
        line: "4.5",
        odds: "Pick",
        confidence: 72,
        trend: "neutral" as const,
        analysis: "Curry averaging 4.8 threes per game at home this season. Good matchup spot tonight.",
        source: "PrizePicks",
        updated: new Date().toISOString(),
      },
      {
        id: "pp_mock_3",
        player: "Jayson Tatum",
        team: "BOS",
        prop: "Points + Rebounds + Assists",
        line: "42.5",
        odds: "Pick",
        confidence: 85,
        trend: "up" as const,
        analysis: "Tatum has been on fire lately, averaging 45+ combined stats in last 5 games.",
        source: "PrizePicks",
        updated: new Date().toISOString(),
      },
      {
        id: "pp_mock_4",
        player: "Nikola Jokic",
        team: "DEN",
        prop: "Rebounds",
        line: "12.5",
        odds: "Pick",
        confidence: 90,
        trend: "up" as const,
        analysis: "Jokic is a rebounding machine. Has hit over 12.5 rebounds in 8 of last 10 games.",
        source: "PrizePicks",
        updated: new Date().toISOString(),
      },
      {
        id: "pp_mock_5",
        player: "Luka Doncic",
        team: "DAL",
        prop: "Assists",
        line: "8.5",
        odds: "Pick",
        confidence: 76,
        trend: "neutral" as const,
        analysis: "Luka's assist numbers have been consistent. Good value on the over in this pace-up spot.",
        source: "PrizePicks",
        updated: new Date().toISOString(),
      },
    ]

    console.log(`Returning ${mockProps.length} mock props for ${sport}`)
    return mockProps
  }

  async getPlayerProps(playerName: string) {
    try {
      const allProps = await this.getActiveProps()
      return allProps.filter((prop) => prop.player.toLowerCase().includes(playerName.toLowerCase()))
    } catch (error) {
      console.error("Error getting player props:", error)
      return []
    }
  }

  async getGameProps(team1: string, team2: string) {
    try {
      const allProps = await this.getActiveProps()
      return allProps.filter((prop) => prop.team === team1 || prop.team === team2)
    } catch (error) {
      console.error("Error getting game props:", error)
      return []
    }
  }
}

export const prizePicksScraper = new PrizePicksScraper()
