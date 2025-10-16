'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { useAuth } from '@/components/AuthProvider'
import { Keg } from '@/lib/types'
import { Plus, Package, MapPin, Search, X } from 'lucide-react'
import Link from 'next/link'

export default function KegsPage() {
  const { user, supabaseConfigured } = useAuth()
  const [kegs, setKegs] = useState<Keg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  const filteredKegs = kegs.filter(keg =>
    keg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keg.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keg.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Keg Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your beer kegs</p>
          </div>
          <Button asChild>
            <Link href="/kegs/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Keg
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search kegs by name, type, or QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

        {/* Kegs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredKegs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No kegs found matching your search' : 'No kegs found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try a different search term' : 'Get started by adding your first keg'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/kegs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Keg
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            filteredKegs.map((keg) => (
              <Card key={keg.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{keg.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      keg.status === 'active' ? 'bg-green-100 text-green-800' :
                      keg.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                      keg.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {keg.status}
                    </span>
                  </CardTitle>
                  <CardDescription>{keg.type} • {keg.size}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>ABV:</strong> {keg.abv || 'N/A'}%
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>QR Code:</strong> {keg.qr_code.slice(-8)}...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedKeg(keg)}
                      >
                        View QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
                  <X className="h-4 w-4" />
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
