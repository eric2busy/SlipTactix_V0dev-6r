/**
 * Advanced Rate Limiter for API Calls
 * Implements token bucket algorithm for more sophisticated rate limiting
 */

interface RateLimitConfig {
  maxTokens: number
  refillRate: number // tokens per second
  refillInterval: number // milliseconds
}

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.tokens = config.maxTokens
    this.lastRefill = Date.now()
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.config.refillInterval) * this.config.refillRate

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.config.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  /**
   * Check if request can be made and consume token
   */
  async canMakeRequest(): Promise<boolean> {
    this.refillTokens()

    if (this.tokens > 0) {
      this.tokens--
      return true
    }

    return false
  }

  /**
   * Get time until next token is available
   */
  getTimeUntilNextToken(): number {
    this.refillTokens()

    if (this.tokens > 0) {
      return 0
    }

    return this.config.refillInterval
  }

  /**
   * Wait for next available token
   */
  async waitForToken(): Promise<void> {
    while (!(await this.canMakeRequest())) {
      const waitTime = this.getTimeUntilNextToken()
      if (waitTime > 0) {
        console.log(`⏳ Rate limit: waiting ${waitTime}ms for next token`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }
}

// Grok-specific rate limiter (3 requests per second)
export const grokRateLimiter = new RateLimiter({
  maxTokens: 3,
  refillRate: 1,
  refillInterval: 333, // ~3 requests per second
})
