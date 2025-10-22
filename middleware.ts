import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Different limits for different endpoints
  '/api/auth/login': { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  '/api/auth/callback': { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 minutes
  '/api/auth/me': { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  default: { limit: 60, windowMs: 15 * 60 * 1000 } // 60 requests per 15 minutes for other endpoints
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  // Fallback to connection IP
  return request.ip ?? '127.0.0.1'
}

function getRateLimitConfig(pathname: string) {
  // Check for exact matches first
  if (rateLimitStore.has(pathname)) {
    return RATE_LIMIT_CONFIG[pathname as keyof typeof RATE_LIMIT_CONFIG] || RATE_LIMIT_CONFIG.default
  }
  
  // Check for pattern matches
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pattern !== 'default' && pathname.startsWith(pattern)) {
      return config
    }
  }
  
  return RATE_LIMIT_CONFIG.default
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  const config = getRateLimitConfig(pathname)
  
  // Create a unique key for this IP + endpoint combination
  const key = `${clientIP}:${pathname}`
  
  // Get or create rate limit data for this key
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: Date.now() + config.windowMs
    })
  } else {
    const data = rateLimitStore.get(key)!
    
    // Reset if window has expired
    if (Date.now() > data.resetTime) {
      data.count = 1
      data.resetTime = Date.now() + config.windowMs
    } else {
      data.count++
    }
    
    // Check if limit exceeded
    if (data.count > config.limit) {
      console.warn(`Rate limit exceeded for ${clientIP} on ${pathname}: ${data.count}/${config.limit}`)
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((data.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((data.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.limit - data.count).toString(),
            'X-RateLimit-Reset': Math.ceil(data.resetTime / 1000).toString()
          }
        }
      )
    }
  }
  
  // Add rate limit headers to successful responses
  const data = rateLimitStore.get(key)!
  const response = NextResponse.next()
  
  response.headers.set('X-RateLimit-Limit', config.limit.toString())
  response.headers.set('X-RateLimit-Remaining', Math.max(0, config.limit - data.count).toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000).toString())
  
  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/(.*)',
    // Apply to auth-related pages
    '/api/auth/(.*)'
  ]
}
