/**
 * Grok Client - Enhanced for RAG Integration with Better Error Handling
 */

export class GrokClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // Try multiple environment variable names for the API key
    this.apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || ""
    this.baseUrl = process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions"

    console.log("🔑 GrokClient initialized:", {
      hasApiKey: !!this.apiKey,
      keySource: process.env.GROK_API_KEY ? "GROK_API_KEY" : process.env.XAI_API_KEY ? "XAI_API_KEY" : "none",
      baseUrl: this.baseUrl,
    })
  }

  /**
   * Generate sports response with real-time data context
   */
  async generateSportsResponse(userQuery: string, sportsData: any, additionalContext?: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("⚠️ No Grok API key found - falling back to text response")
      throw new Error("Grok API key not configured")
    }

    // Build rich context from sports data
    let dataContext = ""

    if (sportsData && sportsData.type === "team_season_stats") {
      const { team, seasonStats, currentSeasonGames, season } = sportsData

      dataContext = `CURRENT SEASON DATA (${season}):
Team: ${team}
Season Record: ${seasonStats?.wins || 0} wins, ${seasonStats?.losses || 0} losses
Win Percentage: ${(seasonStats?.winPercentage * 100).toFixed(1)}%
Points Per Game: ${seasonStats?.pointsPerGame || "N/A"}
Points Allowed: ${seasonStats?.pointsAllowed || "N/A"}

Recent Games This Season:
${
  currentSeasonGames
    ?.slice(0, 5)
    .map((game: any) => `${game.awayTeam} @ ${game.homeTeam}: ${game.awayScore}-${game.homeScore} (${game.status})`)
    .join("\n") || "No recent games data"
}

Data Retrieved: ${sportsData.dataTimestamp}
`
    } else if (sportsData && sportsData.type === "team_performance") {
      const { team, recentGames, lastGameStats } = sportsData

      dataContext = `RECENT PERFORMANCE DATA:
Team: ${team}

Recent Games:
${
  recentGames
    ?.slice(0, 5)
    .map((game: any) => `${game.awayTeam} @ ${game.homeTeam}: ${game.awayScore}-${game.homeScore} (${game.status})`)
    .join("\n") || "No recent games data"
}

Last Game Top Performers:
${
  lastGameStats
    ?.slice(0, 3)
    .map((player: any) => `${player.playerName}: ${player.points} pts, ${player.rebounds} reb, ${player.assists} ast`)
    .join("\n") || "No player stats available"
}
`
    } else if (sportsData && sportsData.message) {
      dataContext = `DATA STATUS: ${sportsData.message}`
    }

    const systemPrompt = `You are SLIPTACTIX, an expert NBA analyst with access to real-time sports data.

IMPORTANT: You have been provided with CURRENT, REAL-TIME sports data below. Use ONLY this data for your analysis. Do not use any pre-trained knowledge about team records or stats.

${dataContext}

${additionalContext || ""}

Provide a comprehensive analysis based ONLY on the real-time data provided above. If the data shows current season information, make sure to reference it as current season data. Be specific about the numbers and facts from the provided data.

Keep your response under 200 words and conversational.`

    try {
      console.log("🤖 Making Grok API request...")

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-3-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userQuery,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      console.log("📡 Grok API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Grok API error:", response.status, errorText)
        throw new Error(`Grok API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Grok API success")

      return data.choices?.[0]?.message?.content || "I couldn't process that request right now."
    } catch (error) {
      console.error("❌ Error calling Grok API:", error)
      throw error
    }
  }
}

export const grokClient = new GrokClient()
