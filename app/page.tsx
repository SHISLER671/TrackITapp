"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KegCardCompact } from "@/components/KegCard"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { Package, Truck, Building2, BarChart3, TrendingUp, AlertTriangle, Search, Settings, Users } from "lucide-react"
import { useEffect, useState } from "react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "brewer" | "driver" | "restaurant_manager" | "admin"
  brewery_id?: string
  restaurant_id?: string
}

export default function Home() {
  const { user, loading, supabaseConfigured } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!supabaseConfigured || !user) {
        setProfileLoading(false)
        return
      }

      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("user_profiles")
          .select("id, email, full_name, role, brewery_id, restaurant_id")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching user profile:", error)
          setProfileLoading(false)
          return
        }

        setUserProfile(data)
        setProfileLoading(false)

        if (data && data.role) {
          switch (data.role) {
            case "brewer":
              router.push("/dashboard/brewer")
              break
            case "driver":
              router.push("/dashboard/driver")
              break
            case "restaurant_manager":
              router.push("/dashboard/restaurant")
              break
            case "admin":
              // Admin stays on main dashboard - don't redirect
              break
            default:
              // If no valid role, redirect to restaurant dashboard as default
              router.push("/dashboard/restaurant")
          }
        }
      } catch (error) {
        console.error("Error:", error)
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, supabaseConfigured, router])

  const handleSignOut = async () => {
    if (supabaseConfigured) {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
      } catch (error) {
        console.error("Sign out error:", error)
      }
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // If user has a specific role, they should be redirected
  // This page is mainly for admins or users without roles
  if (userProfile) {
    if (userProfile.role !== "admin") {
      // Redirect non-admin users to their role-specific dashboard
      switch (userProfile.role) {
        case "brewer":
          router.push("/dashboard/brewer")
          break
        case "driver":
          router.push("/dashboard/driver")
          break
        case "restaurant_manager":
          router.push("/dashboard/restaurant")
          break
        default:
          router.push("/dashboard/restaurant")
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Redirecting to your dashboard...</div>
        </div>
      )
    }
  } else if (user && !profileLoading) {
    // User is logged in but has no profile - they're pending
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Account Pending Approval</div>
          <div className="text-gray-600 mb-4">Your account is being reviewed by an administrator.</div>
          <div className="text-sm text-gray-500">You'll receive access once your role is assigned.</div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🍺 Keg Tracker Admin</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            System overview and administration for keg tracking across the entire supply chain
          </p>
          {userProfile && (
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-lg shadow-sm border">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Administrator</p>
                <p className="font-semibold text-gray-800">{userProfile.full_name || userProfile.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Kegs</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Deliveries</p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <Truck className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Restaurants</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Efficiency</p>
                  <p className="text-3xl font-bold">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Manage your keg inventory and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/scan")}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700"
                >
                  <Search className="h-6 w-6" />
                  <span>Scan QR Code</span>
                </Button>
                <Button
                  onClick={() => router.push("/kegs/new")}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="h-6 w-6" />
                  <span>Add Keg</span>
                </Button>
                <Button
                  onClick={() => router.push("/kegs")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View All</span>
                </Button>
                <Button
                  onClick={() => router.push("/deliveries")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Truck className="h-6 w-6" />
                  <span>Deliveries</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <span>System Management</span>
              </CardTitle>
              <CardDescription>Administrative tools and system overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push("/admin/users")}
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-8 w-8" />
                  <span className="font-semibold">User Management</span>
                  <span className="text-xs opacity-90">Manage roles & access</span>
                </Button>
                <Button
                  onClick={() => router.push("/reports")}
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700"
                >
                  <BarChart3 className="h-8 w-8" />
                  <span className="font-semibold">System Analytics</span>
                  <span className="text-xs opacity-90">Performance & metrics</span>
                </Button>
                <Button
                  onClick={() => router.push("/integrations/pos")}
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Settings className="h-8 w-8" />
                  <span className="font-semibold">System Settings</span>
                  <span className="text-xs opacity-90">Configuration</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New keg delivered</p>
                    <p className="text-xs text-gray-600">Summer IPA to Downtown Pub - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">QR code scanned</p>
                    <p className="text-xs text-gray-600">Keg #KT-2024-001 at Brewery Warehouse - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Low inventory alert</p>
                    <p className="text-xs text-gray-600">Porter kegs running low - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Kegs Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Recent Kegs</span>
                </CardTitle>
                <CardDescription>Latest kegs in your inventory</CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push("/kegs")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mock recent kegs */}
              <KegCardCompact
                keg={{
                  id: "1",
                  name: "Summer IPA",
                  type: "IPA",
                  size: "Half Barrel",
                  status: "active",
                  abv: 6.5,
                  qr_code: "KT-2024-001",
                  created_at: new Date().toISOString(),
                }}
                onClick={() => router.push("/kegs")}
              />
              <KegCardCompact
                keg={{
                  id: "2",
                  name: "Dark Porter",
                  type: "Porter",
                  size: "Quarter Barrel",
                  status: "delivered",
                  abv: 7.2,
                  qr_code: "KT-2024-002",
                  created_at: new Date().toISOString(),
                }}
                onClick={() => router.push("/kegs")}
              />
              <KegCardCompact
                keg={{
                  id: "3",
                  name: "Wheat Beer",
                  type: "Wheat",
                  size: "Sixth Barrel",
                  status: "returned",
                  abv: 5.8,
                  qr_code: "KT-2024-003",
                  created_at: new Date().toISOString(),
                }}
                onClick={() => router.push("/kegs")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
