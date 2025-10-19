'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KegCard } from '@/components/KegCard'
import { Breadcrumb } from '@/components/NavBar'
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Phone,
  Calendar,
  BarChart3,
  QrCode,
  RefreshCw,
  Truck,
  Eye,
  Scan
} from 'lucide-react'

interface KegInventory {
  id: string
  name: string
  type: string
  size: string
  fullKegs: number
  emptyKegs: number
  qrCode: string
  nftTokenId?: string
  lastDelivery: string
  priority: 'low' | 'medium' | 'high'
}

interface DeliveryRecord {
  id: string
  date: string
  driver: string
  items: Array<{
    name: string
    type: string
    size: string
    quantity: number
    qrCode: string
  }>
  status: 'delivered' | 'scanned' | 'accepted'
  total: number
}

export default function RestaurantDashboard() {
  const [inventory, setInventory] = useState<KegInventory[]>([
    {
      id: '1',
      name: 'Summer IPA',
      type: 'IPA',
      size: 'Half Barrel',
      fullKegs: 3,
      emptyKegs: 1,
      qrCode: 'KT-2024-001',
      nftTokenId: '123',
      lastDelivery: '2024-10-10',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Dark Porter',
      type: 'Porter',
      size: 'Quarter Barrel',
      fullKegs: 2,
      emptyKegs: 0,
      qrCode: 'KT-2024-002',
      nftTokenId: '124',
      lastDelivery: '2024-10-08',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Wheat Beer',
      type: 'Wheat',
      size: 'Sixth Barrel',
      fullKegs: 1,
      emptyKegs: 2,
      qrCode: 'KT-2024-003',
      nftTokenId: '125',
      lastDelivery: '2024-10-05',
      priority: 'low'
    }
  ])

  const [deliveries] = useState<DeliveryRecord[]>([
    {
      id: '1',
      date: '2024-10-14',
      driver: 'John Smith',
      items: [
        { name: 'Summer IPA', type: 'IPA', size: 'Half Barrel', quantity: 2, qrCode: 'KT-2024-001' },
        { name: 'Dark Porter', type: 'Porter', size: 'Quarter Barrel', quantity: 1, qrCode: 'KT-2024-002' }
      ],
      status: 'accepted',
      total: 450
    },
    {
      id: '2',
      date: '2024-10-12',
      driver: 'Sarah Johnson',
      items: [
        { name: 'Wheat Beer', type: 'Wheat', size: 'Sixth Barrel', quantity: 1, qrCode: 'KT-2024-003' },
        { name: 'Summer IPA', type: 'IPA', size: 'Half Barrel', quantity: 1, qrCode: 'KT-2024-001' }
      ],
      status: 'accepted',
      total: 380
    },
    {
      id: '3',
      date: '2024-10-15',
      driver: 'Mike Wilson',
      items: [
        { name: 'Summer IPA', type: 'IPA', size: 'Half Barrel', quantity: 3, qrCode: 'KT-2024-001' },
        { name: 'Dark Porter', type: 'Porter', size: 'Quarter Barrel', quantity: 2, qrCode: 'KT-2024-002' }
      ],
      status: 'delivered',
      total: 650
    }
  ])

  const [stats] = useState({
    totalFullKegs: inventory.reduce((sum, item) => sum + item.fullKegs, 0),
    totalEmptyKegs: inventory.reduce((sum, item) => sum + item.emptyKegs, 0),
    pendingDeliveries: deliveries.filter(d => d.status === 'delivered').length,
    monthlySpend: 2450
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Restaurant Dashboard' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-10 w-10 text-purple-600" />
              Restaurant Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage inventory, orders, and supplier relationships</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Full Kegs</p>
                  <p className="text-3xl font-bold">{stats.totalFullKegs}</p>
                  <p className="text-green-200 text-xs mt-1">ready to serve</p>
                </div>
                <Package className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Empty Kegs</p>
                  <p className="text-3xl font-bold">{stats.totalEmptyKegs}</p>
                  <p className="text-orange-200 text-xs mt-1">ready for pickup</p>
                </div>
                <Truck className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Pending Scans</p>
                  <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
                  <p className="text-blue-200 text-xs mt-1">awaiting acceptance</p>
                </div>
                <QrCode className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Monthly Spend</p>
                  <p className="text-3xl font-bold">${stats.monthlySpend}</p>
                  <p className="text-purple-200 text-xs mt-1">this month</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile QR Scanner - Hidden on desktop */}
        <div className="lg:hidden mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scan className="h-5 w-5 text-green-600" />
                <span>QR Scanner</span>
              </CardTitle>
              <CardDescription>
                Scan keg QR codes to accept deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Point camera at QR code to scan</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Keg Inventory */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>Keg Inventory</span>
                </CardTitle>
                <CardDescription>
                  Track full and empty kegs by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.type} • {item.size}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Full Kegs</span>
                              </div>
                              <p className="text-2xl font-bold text-green-900">{item.fullKegs}</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Truck className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Empty Kegs</span>
                              </div>
                              <p className="text-2xl font-bold text-orange-900">{item.emptyKegs}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4" />
                              <span>QR: {item.qrCode}</span>
                            </div>
                            <span>Last delivery: {item.lastDelivery}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority} priority
                          </span>
                          {item.fullKegs === 0 && (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop QR Scanner & Delivery History */}
          <div>
            {/* Desktop QR Scanner - Hidden on mobile */}
            <Card className="hidden lg:block mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="h-5 w-5 text-green-600" />
                  <span>QR Scanner</span>
                </CardTitle>
                <CardDescription>
                  Scan keg QR codes to accept deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-3">Point camera at QR code</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Scan className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span>Recent Deliveries</span>
                </CardTitle>
                <CardDescription>
                  Delivery history and QR scan records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delivery #{delivery.id}</p>
                          <p className="text-xs text-gray-600">{delivery.date} • {delivery.driver}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <div className="space-y-1 mb-2">
                        {delivery.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                            <span>• {item.quantity}x {item.name}</span>
                            <span className="font-mono">QR: {item.qrCode.slice(-6)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">${delivery.total}</p>
                        {delivery.status === 'delivered' && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Alerts & Notifications</span>
            </CardTitle>
            <CardDescription>
              Important updates and action items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Empty Keg Alert</span>
                </div>
                <p className="text-sm text-red-700">3 empty kegs ready for pickup - schedule collection</p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  Schedule Pickup
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Pending Scan</span>
                </div>
                <p className="text-sm text-blue-700">Delivery #3 arrived - scan QR codes to accept</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Scan className="h-3 w-3 mr-1" />
                  Scan Now
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">NFT Verified</span>
                </div>
                <p className="text-sm text-green-700">All kegs blockchain verified - ownership confirmed</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
