"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthContextType = {
  user: User | null
  loading: boolean
  supabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabaseConfigured: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// TEMPORARY: Set to true to bypass authentication for demo
const BYPASS_AUTH = true;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  useEffect(() => {
    // TEMPORARY: Bypass authentication for demo
    if (BYPASS_AUTH) {
      // Mock user for demo
      setUser({
        id: 'demo-user-id',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User)
      setSupabaseConfigured(false)
      setLoading(false)
      return
    }

    // Check if Supabase is configured
    const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    setSupabaseConfigured(hasSupabaseConfig)

    if (!hasSupabaseConfig) {
      setLoading(false)
      return
    }

    // Initialize Supabase
    try {
      const supabase = createClient()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("Supabase initialization error:", error)
      setLoading(false)
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading, supabaseConfigured }}>{children}</AuthContext.Provider>
}
