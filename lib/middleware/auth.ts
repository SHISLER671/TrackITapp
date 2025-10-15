// Authentication and authorization middleware for API routes

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "../supabase/server"
import type { UserRole, UserRoleRecord } from "../types"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
  }
  userRole?: UserRoleRecord
}

/**
 * Middleware to check authentication
 */
export async function requireAuth(request: NextRequest): Promise<
  | {
      user: any
      userRole: UserRoleRecord
    }
  | NextResponse
> {
  const supabase = await createClient()

  // Get auth token from header
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 })
  }

  const token = authHeader.substring(7)

  // Verify token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
  }

  // Get user role
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (roleError || !userRole) {
    return NextResponse.json({ error: "Unauthorized - No role assigned" }, { status: 401 })
  }

  return { user, userRole }
}

/**
 * Middleware to check if user has required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[],
): Promise<
  | {
      user: any
      userRole: UserRoleRecord
    }
  | NextResponse
> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  if (!allowedRoles.includes(userRole.role)) {
    return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 })
  }

  return { user, userRole }
}

/**
 * Check if user is a brewer
 */
export function requireBrewer(request: NextRequest) {
  return requireRole(request, ["BREWER"])
}

/**
 * Check if user is a driver
 */
export function requireDriver(request: NextRequest) {
  return requireRole(request, ["DRIVER"])
}

/**
 * Check if user is a restaurant manager
 */
export function requireRestaurantManager(request: NextRequest) {
  return requireRole(request, ["RESTAURANT_MANAGER"])
}

/**
 * Check if user is either brewer or restaurant manager
 */
export function requireBrewerOrManager(request: NextRequest) {
  return requireRole(request, ["BREWER", "RESTAURANT_MANAGER"])
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Clean up rate limits every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
