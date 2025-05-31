import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Player {
  id: string
  name: string
  team: string
  position: string
  stats: any
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: "scheduled" | "live" | "final"
  start_time: string
  quarter?: string
  time_remaining?: string
  created_at: string
  updated_at: string
}

export interface Prop {
  id: string
  player_id: string
  game_id: string
  prop_type: string
  line: number
  odds: string
  confidence: number
  analysis: string
  trend: "up" | "down" | "neutral"
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  prop_id: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  content: string
  sender: "user" | "bot"
  message_type: string
  data: any
  created_at: string
}
