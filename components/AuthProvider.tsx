"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { UserRole, UserRoleRecord } from "@/lib/types"

interface AuthContextType {
  user: any | null
  userRole: UserRoleRecord | null
  loading: boolean
  signOut: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  hasRole: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userRole, setUserRole] = useState<UserRoleRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not initialized - running in demo mode")
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log("User authenticated:", session.user.id)
        fetchUserRole(session.user.id)
      } else {
        console.log("No user session")
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log("User authenticated via state change:", session.user.id)
        fetchUserRole(session.user.id)
      } else {
        console.log("No user session via state change")
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string) => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).single()

      if (error) throw error
      setUserRole(data)
    } catch (error) {
      console.error("Error fetching user role:", error)
      console.error("User ID:", userId)
      console.error("Error details:", JSON.stringify(error, null, 2))
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return

    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!userRole) return false
    return roles.includes(userRole.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signOut: handleSignOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Component to protect routes
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}) {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
    return null
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Component to conditionally render based on role
export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: UserRole[]
}) {
  const { hasRole } = useAuth()

  if (!hasRole(allowedRoles)) {
    return null
  }

  return <>{children}</>
}
