import { supabase } from "./supabase"

export class AuthService {
  async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data.user
    } catch (error) {
      console.error("Error signing in anonymously:", error)
      return null
    }
  }

  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error("Error signing out:", error)
      return false
    }
  }
}

export const authService = new AuthService()
