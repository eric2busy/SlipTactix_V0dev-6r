// API endpoints and constants
export const SPORTS_API_ENDPOINTS = {
  LIVE_GAMES: "https://api.sportsdata.io/v3/nba/scores/json/GamesByDate",
  INJURIES: "https://api.sportsdata.io/v3/nba/scores/json/PlayersByActive/false",
  NEWS: "https://api.sportsdata.io/v3/nba/scores/json/News",
  PLAYERS: "https://api.sportsdata.io/v3/nba/scores/json/Players",
}

export const SPORT_TYPES = {
  NBA: "NBA",
  NFL: "NFL",
  MLB: "MLB",
  NHL: "NHL",
} as const

export const PROP_TYPES = {
  POINTS: "Points",
  REBOUNDS: "Rebounds",
  ASSISTS: "Assists",
  THREES: "3-Pointers",
  FANTASY: "Fantasy Points",
} as const

export const INJURY_STATUS = {
  OUT: "Out",
  QUESTIONABLE: "Questionable",
  DOUBTFUL: "Doubtful",
  PROBABLE: "Probable",
} as const
