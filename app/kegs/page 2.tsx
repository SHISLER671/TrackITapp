'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QRScanner } from '@/components/QRScanner'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { BlockchainStatus } from '@/components/BlockchainStatus'
import { KegCard } from '@/components/KegCard'
import { Breadcrumb } from '@/components/NavBar'
import { useAuth } from '@/components/AuthProvider'
import { Keg } from '@/lib/types'
import { Plus, Search, Package, MapPin, Shield, Filter } from 'lucide-react'
import Link from 'next/link'

export default function KegsPage() {
  const { user, supabaseConfigured } = useAuth()
  const [kegs, setKegs] = useState<Keg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedKeg, setSelectedKeg] = useState<Keg | null>(null)

  useEffect(() => {
    fetchKegs()
  }, [])

  const fetchKegs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/kegs')
      const result = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setKegs(result.data || [])
      }
    } catch (err) {
      setError('Failed to fetch kegs')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = async (qrCode: string) => {
    try {
      // Extract keg ID from QR code (assuming format: keg-{uuid})
      const kegId = qrCode.replace('keg-', '')
      
      // Fetch keg details
      const response = await fetch(`/api/kegs/${kegId}`)
      const result = await response.json()
      
      if (result.error) {
        setError(`Keg not found: ${qrCode}`)
      } else {
        setSelectedKeg(result.data)
        setShowScanner(false)
      }
    } catch (err) {
      setError('Failed to fetch keg details')
      console.error('Keg fetch error:', err)
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Keg Management</h1>
            <p className="text-gray-600">Database not configured. This is demo mode.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Kegs' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Keg Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all your beer kegs across the supply chain.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowScanner(true)} className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Scan QR</span>
            </Button>
            <Button onClick={fetchKegs} variant="outline" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/kegs/new">
                <Plus className="h-4 w-4 mr-2" />
                New Keg
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kegs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kegs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Kegs</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {kegs.filter(k => k.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {kegs.filter(k => k.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returned</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {kegs.filter(k => k.status === 'returned').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kegs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))
          ) : kegs.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No kegs found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by adding your first keg to begin tracking your inventory
              </p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/kegs/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Keg
                </Link>
              </Button>
            </div>
          ) : (
            kegs.map((keg) => (
              <KegCard
                key={keg.id}
                keg={keg}
                showProgress={true}
                showBlockchain={true}
                showVariance={false}
                onViewDetails={(keg) => setSelectedKeg(keg)}
                onScan={(keg) => {
                  // Handle scan action
                  console.log('Scan keg:', keg)
                }}
                className="h-fit"
              />
            ))
          )}
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* QR Code Display Modal */}
        {selectedKeg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selectedKeg.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedKeg(null)}
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent>
                <QRCodeDisplay
                  value={selectedKeg.qr_code}
                  title={`${selectedKeg.name} QR Code`}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
