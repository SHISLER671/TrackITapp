"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute, useAuth } from "@/components/AuthProvider"
import NavBar from "@/components/NavBar"
import QRScanner from "@/components/QRScanner"
import KegCard from "@/components/KegCard"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"
import type { Keg } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanContent />
    </ProtectedRoute>
  )
}

function ScanContent() {
  const router = useRouter()
  const { userRole } = useAuth()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedKeg, setScannedKeg] = useState<Keg | null>(null)

  const handleScan = async (tokenId: string, contractAddress: string) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      // Fetch keg details
      const { data: keg, error: fetchError } = await supabase.from("kegs").select("*").eq("id", tokenId).single()

      if (fetchError || !keg) {
        throw new Error("Keg not found")
      }

      // Get location (mock for now)
      const location = "Current Location" // In production, use geolocation API

      // Record scan
      const scanResponse = await fetch(`/api/kegs/${tokenId}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!scanResponse.ok) {
        throw new Error("Failed to record scan")
      }

      setScannedKeg(keg)
      setScanning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan keg")
      setScanning(true)
    } finally {
      setLoading(false)
    }
  }

  const handleScanError = (error: string) => {
    setError(error)
  }

  const handleContinue = () => {
    if (scannedKeg?.is_empty) {
      router.push(`/kegs/${scannedKeg.id}/retire`)
    } else {
      router.push(`/kegs/${scannedKeg?.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {scanning && !scannedKeg ? (
        <div className="h-[calc(100vh-4rem)] relative">
          <QRScanner onScan={handleScan} onError={handleScanError} />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <LoadingSpinner size="lg" message="Processing scan..." />
            </div>
          )}
        </div>
      ) : (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <ErrorMessage
              message={error}
              title="Scan Failed"
              onRetry={() => {
                setError(null)
                setScanning(true)
                setScannedKeg(null)
              }}
            />
          ) : scannedKeg ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-6xl mb-2">✓</div>
                <h1 className="text-2xl font-bold text-gray-900">Scan Successful!</h1>
                <p className="text-gray-600 mt-2">Keg information has been updated</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Keg Details</h2>
                <KegCard keg={scannedKeg} showProgress={!scannedKeg.is_empty} />
              </div>

              {scannedKeg.is_empty && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    This keg is marked as empty. Would you like to retire it?
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {scannedKeg.is_empty ? "Retire Keg" : "View Details"}
                </button>
                <button
                  onClick={() => {
                    setScannedKeg(null)
                    setScanning(true)
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : null}
        </main>
      )}
    </div>
  )
}
