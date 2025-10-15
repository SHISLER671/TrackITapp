"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { LoadingPage } from "@/components/LoadingSpinner"

export default function Home() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return

    try {
      if (!user) {
        router.push("/auth/login")
      } else if (userRole) {
        // Redirect to role-specific dashboard
        switch (userRole.role) {
          case "BREWER":
            router.push("/dashboard/brewer")
            break
          case "DRIVER":
            router.push("/dashboard/driver")
            break
          case "RESTAURANT_MANAGER":
            router.push("/dashboard/restaurant")
            break
          default:
            router.push("/auth/login")
        }
      }
    } catch (error) {
      console.error("[v0] Redirect error:", error)
      router.push("/auth/login")
    }
  }, [user, userRole, loading, router, mounted])

  if (!mounted || loading) {
    return <LoadingPage message="Loading Keg Tracker..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">🍺</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Keg Tracker</h2>
        <p className="text-gray-600 mb-8">Blockchain-verified keg tracking for breweries</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
