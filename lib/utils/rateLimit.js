import { NextResponse } from 'next/server'

const requestCounts = new Map()

/**
 * Basic in-memory rate limiter. 
 * NOTE: This is per-server instance. For global rate limiting, use Redis.
 */
export function rateLimit({
  windowMs = 60 * 1000,
  max = 10,
  identifier = 'ip'
}) {
  return function(request) {
    const key = identifier === 'ip'
      ? request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      : request.headers.get('authorization') || 'unknown'

    const now = Date.now()
    const windowStart = now - windowMs

    if (!requestCounts.has(key)) {
      requestCounts.set(key, [])
    }

    const requests = requestCounts.get(key).filter(time => time > windowStart)
    requests.push(now)
    requestCounts.set(key, requests)

    if (requests.length > max) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait.',
          retryAfter: Math.ceil(windowMs / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(windowMs / 1000)),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    return null
  }
}
