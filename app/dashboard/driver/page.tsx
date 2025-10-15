"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/AuthProvider"
import NavBar from "@/components/NavBar"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"
import type { Keg, Delivery } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function DriverDashboard() {
  return (
    <ProtectedRoute allowedRoles={["DRIVER"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}

interface DeliveryWithDetails extends Delivery {
  brewery?: { name: string }
  restaurant?: any
}

function DashboardContent() {
  const router = useRouter()
  const [kegsOnTruck, setKegsOnTruck] = useState<Keg[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const supabase = createClient()

      // Fetch kegs currently held by driver
      const { data: kegs, error: kegsError } = await supabase
        .from("kegs")
        .select("*")
        .eq("is_empty", false)
        .order("created_at", { ascending: false })

      if (kegsError) throw kegsError

      // Fetch driver's deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from("deliveries")
        .select(`
          *,
          brewery:brewery_id(name),
          restaurant:restaurant_id(id)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (deliveriesError) throw deliveriesError

      setKegsOnTruck(kegs || [])
      setDeliveries(deliveriesData || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const pendingDeliveries = deliveries.filter((d) => d.status === "PENDING")
  const completedToday = deliveries.filter(
    (d) => d.status === "ACCEPTED" && new Date(d.accepted_at || "").toDateString() === new Date().toDateString(),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your deliveries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Kegs On Truck</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{kegsOnTruck.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Pending Deliveries</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{pendingDeliveries.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Completed Today</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{completedToday.length}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/scan"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <div className="text-3xl mb-2">📷</div>
              <div className="font-bold">Scan Keg</div>
              <div className="text-sm opacity-90 mt-1">Load or return kegs</div>
            </Link>
            <Link
              href="/deliveries/new"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <div className="text-3xl mb-2">📦</div>
              <div className="font-bold">Create Delivery</div>
              <div className="text-sm opacity-90 mt-1">Start a new drop-off</div>
            </Link>
            <button
              onClick={fetchData}
              className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-bold">Refresh Status</div>
              <div className="text-sm opacity-90 mt-1">Check for updates</div>
            </button>
          </div>
        </div>

        {/* Pending Deliveries Alert */}
        {pendingDeliveries.length > 0 && (
          <div className="mb-8">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">⏳</div>
                <div>
                  <h3 className="text-lg font-bold text-orange-900">Waiting for Manager Acceptance</h3>
                  <p className="text-sm text-orange-700">{pendingDeliveries.length} delivery pending</p>
                </div>
              </div>
              <div className="space-y-2">
                {pendingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{delivery.brewery?.name || "Brewery"}</div>
                      <div className="text-sm text-gray-600">
                        {delivery.keg_ids.length} keg(s) • Created {new Date(delivery.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        PENDING
                      </span>
                      <Link href={`/deliveries/${delivery.id}`} className="text-blue-600 hover:underline text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kegs On Truck */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Kegs On Truck ({kegsOnTruck.length})</h2>
            {kegsOnTruck.length > 0 && (
              <Link href="/deliveries/new" className="text-blue-600 hover:underline text-sm font-medium">
                Create Delivery →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" message="Loading kegs..." />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchData} />
          ) : kegsOnTruck.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              <div className="text-4xl mb-2">🚚</div>
              <p className="font-medium">No kegs loaded</p>
              <p className="text-sm mt-2">Scan kegs to load them onto your truck</p>
              <Link
                href="/scan"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Scan Keg
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keg</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loaded</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kegsOnTruck.map((keg) => (
                    <tr key={keg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {keg.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{keg.name}</div>
                        <div className="text-xs text-gray-500">{keg.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{keg.keg_size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {keg.last_scan ? new Date(keg.last_scan).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Deliveries */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              <p>No deliveries yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brewery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kegs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(delivery.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.brewery?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{delivery.keg_ids.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            delivery.status === "ACCEPTED"
                              ? "bg-green-100 text-green-700"
                              : delivery.status === "PENDING"
                                ? "bg-orange-100 text-orange-700"
                                : delivery.status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
