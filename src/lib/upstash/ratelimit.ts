import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { log } from "@/lib/logger";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const uploadRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "150 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const authRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const folderRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "120 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});


export const readRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const pageRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "upstash_ratelimit_page",
})

// Map to track which pages have been rate limited in the current request
// This prevents multiple rate limit checks on the same page during server-side rendering
const pageRateLimitCache = new Map<string, number>()

/**
 * Check rate limit at the page level instead of for each data fetch
 * This significantly reduces Redis commands while still providing protection
 */
export async function checkPageRateLimit(userId: string, pagePath: string) {
  try {
    // Skip if no user ID (though this shouldn't happen in protected routes)
    if (!userId) return true
    
    // Create a cache key combining user and page
    const cacheKey = `${userId}:${pagePath}`
    const now = Date.now()
    const lastCheck = pageRateLimitCache.get(cacheKey) || 0
    
    // Only check rate limit if not checked in the last 5 seconds for this page
    // This prevents multiple checks during a single page render with parallel data fetching
    if (now - lastCheck > 5000) {
      const { success } = await pageRateLimiter.limit(cacheKey)
      
      if (!success) {
        log({
          logLevel: 'warn',
          action: 'checkPageRateLimit',
          message: 'Rate limit exceeded for page access',
          metadata: { userId, pagePath }
        })
        throw new Error('Too many page requests. Please try again in a few minutes.')
      }
      
      // Update the cache
      pageRateLimitCache.set(cacheKey, now)
    }
    
    return true
  } catch (error) {
    // Only log if it's not a rate limit error (which we already logged)
    if (!(error instanceof Error) || !error.message.includes('Too many page requests')) {
      log({
        logLevel: 'error',
        action: 'checkPageRateLimit',
        message: 'Error checking page rate limit',
        metadata: { userId, pagePath, error }
      })
    }
    throw error
  }
}
