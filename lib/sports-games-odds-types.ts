/**
 * Type definitions for Sports Games Odds API
 */

export interface SGOTeam {
  id: number
  name: string
  display_name: string
  abbreviation: string
  short_name: string
  location: string
  city: string
  conference?: string
  division?: string
}

export interface SGOGame {
  id: number
  game_id: string
  start_time: string
  game_date: string
  status: "scheduled" | "in_progress" | "completed" | "postponed"
  home_team: SGOTeam
  away_team: SGOTeam
  home_score?: number
  away_score?: number
  odds?: {
    spread: number
    total: number
    moneyline_home: number
    moneyline_away: number
  }
  venue?: {
    name: string
    city: string
    state: string
  }
}

export interface SGOPlayerStat {
  player_id: number
  player_name: string
  display_name: string
  first_name: string
  last_name: string
  team_abbreviation: string
  position: string
  minutes_played: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  field_goals_made: number
  field_goals_attempted: number
  three_pointers_made: number
  three_pointers_attempted: number
  free_throws_made: number
  free_throws_attempted: number
}

export interface SGOApiResponse<T> {
  success: boolean
  data: T[]
  meta?: {
    total: number
    page: number
    per_page: number
  }
  error?: string
}
