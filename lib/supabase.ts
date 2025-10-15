import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to get current user
export async function getCurrentUser() {
  if (!supabase) {
    console.warn("Supabase not initialized")
    return null
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}

// Helper function to get user role
export async function getUserRole(userId: string) {
  if (!supabase) {
    console.warn("Supabase not initialized")
    return null
  }

  const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error getting user role:", error)
    return null
  }

  return data
}

// Helper function to sign out
export async function signOut() {
  if (!supabase) {
    console.warn("Supabase not initialized")
    return false
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    return false
  }

  return true
}
