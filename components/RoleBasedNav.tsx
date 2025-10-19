"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { Package, Truck, Building2, User, LogOut, Menu, X, Home, BarChart3, Settings, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "brewer" | "driver" | "restaurant_manager" | "admin"
  brewery_id?: string
  restaurant_id?: string
}

export function RoleBasedNav() {
  const { user, loading, supabaseConfigured } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!supabaseConfigured || !user) return

      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()

        if (error) {
          console.error("Error fetching user profile:", error)
          return
        }

        setUserProfile(data)
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchUserProfile()
  }, [user, supabaseConfigured])

  const handleSignOut = async () => {
    if (!supabaseConfigured) return

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.auth.signOut()
      // Clear local state
      setUserProfile(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getRoleBasedNavigation = () => {
    if (!userProfile) return []

    const baseNav = [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Scan", href: "/scan", icon: Search },
    ]

    switch (userProfile.role) {
      case "brewer":
        return [
          ...baseNav,
          { name: "Kegs", href: "/kegs", icon: Package },
          { name: "Deliveries", href: "/deliveries", icon: Truck },
          { name: "Reports", href: "/reports", icon: BarChart3 },
        ]

      case "driver":
        return [
          ...baseNav,
          { name: "Deliveries", href: "/deliveries", icon: Truck },
          { name: "Routes", href: "/routes", icon: Settings },
        ]

      case "restaurant_manager":
        return [
          ...baseNav,
          { name: "Inventory", href: "/dashboard/restaurant", icon: Building2 },
          { name: "Orders", href: "/orders", icon: Package },
          { name: "Reports", href: "/reports", icon: BarChart3 },
        ]

      case "admin":
        return [
          ...baseNav,
          { name: "Kegs", href: "/kegs", icon: Package },
          { name: "Deliveries", href: "/deliveries", icon: Truck },
          { name: "Restaurants", href: "/restaurants", icon: Building2 },
          { name: "Users", href: "/admin/users", icon: User },
          { name: "Reports", href: "/reports", icon: BarChart3 },
          { name: "Settings", href: "/settings", icon: Settings },
        ]

      default:
        return baseNav
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "brewer":
        return "Brewer"
      case "driver":
        return "Driver"
      case "restaurant_manager":
        return "Restaurant Manager"
      case "admin":
        return "Administrator"
      default:
        return "User"
    }
  }

  const navigation = getRoleBasedNavigation()

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Keg Tracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {userProfile && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userProfile.full_name || userProfile.email}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(userProfile.role)}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {(userProfile.full_name || userProfile.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {userProfile && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(userProfile.full_name || userProfile.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userProfile.full_name || userProfile.email}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(userProfile.role)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
