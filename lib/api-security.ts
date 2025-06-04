// API security utilities
export class APISecurityManager {
  private static blockedKeys = new Set<string>()
  private static rateLimits = new Map<string, { count: number; resetTime: number }>()

  static isKeyBlocked(keyHash: string): boolean {
    return this.blockedKeys.has(keyHash)
  }

  static blockKey(keyHash: string): void {
    this.blockedKeys.add(keyHash)
    console.warn(`🚫 API key blocked: ${keyHash.substring(0, 8)}...`)
  }

  static checkRateLimit(identifier: string, maxRequests = 100, windowMs = 3600000): boolean {
    const now = Date.now()
    const limit = this.rateLimits.get(identifier)

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (limit.count >= maxRequests) {
      return false
    }

    limit.count++
    return true
  }

  static sanitizeApiKey(key: string): string {
    // Never log full API keys
    if (!key) return "none"
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  static validateEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for potentially leaked keys in client-side code
    if (typeof window !== "undefined") {
      issues.push("API keys should never be accessed on client-side")
    }

    // Check environment variables
    const requiredEnvVars = ["GROK_API_KEY", "GROK_API_URL"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      issues.push(`Missing environment variables: ${missingVars.join(", ")}`)
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }
}
