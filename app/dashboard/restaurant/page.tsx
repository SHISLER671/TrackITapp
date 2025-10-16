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
  TrendingDown, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Phone,
  Calendar,
  BarChart3,
  QrCode,
  RefreshCw
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  type: string
  size: string
  status: string
  fillLevel: number
  daysRemaining: number
  lastDelivery: string
  priority: 'low' | 'medium' | 'high'
}

interface OrderHistory {
  id: string
  date: string
  items: string[]
  status: 'pending' | 'confirmed' | 'delivered'
  total: number
}

export default function RestaurantDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Summer IPA',
      type: 'IPA',
      size: 'Half Barrel',
      status: 'active',
      fillLevel: 25,
      daysRemaining: 2,
      lastDelivery: '2024-10-10',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Dark Porter',
      type: 'Porter',
      size: 'Quarter Barrel',
      status: 'active',
      fillLevel: 60,
      daysRemaining: 5,
      lastDelivery: '2024-10-08',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Wheat Beer',
      type: 'Wheat',
      size: 'Sixth Barrel',
      status: 'active',
      fillLevel: 80,
      daysRemaining: 7,
      lastDelivery: '2024-10-05',
      priority: 'low'
    }
  ])

  const [recentOrders] = useState<OrderHistory[]>([
    {
      id: '1',
      date: '2024-10-14',
      items: ['Summer IPA (2x Half Barrel)', 'Dark Porter (1x Quarter Barrel)'],
      status: 'delivered',
      total: 450
    },
    {
      id: '2',
      date: '2024-10-12',
      items: ['Wheat Beer (1x Sixth Barrel)', 'Summer IPA (1x Half Barrel)'],
      status: 'delivered',
      total: 380
    },
    {
      id: '3',
      date: '2024-10-15',
      items: ['Summer IPA (3x Half Barrel)', 'Dark Porter (2x Quarter Barrel)'],
      status: 'confirmed',
      total: 650
    }
  ])

  const [stats] = useState({
    totalKegs: 12,
    lowStock: 3,
    pendingOrders: 1,
    monthlySpend: 2450,
    efficiency: 88
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
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Kegs</p>
                  <p className="text-3xl font-bold">{stats.totalKegs}</p>
                  <p className="text-purple-200 text-xs mt-1">in inventory</p>
                </div>
                <Package className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Low Stock</p>
                  <p className="text-3xl font-bold">{stats.lowStock}</p>
                  <p className="text-red-200 text-xs mt-1">need reorder</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Pending Orders</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-blue-200 text-xs mt-1">awaiting delivery</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Monthly Spend</p>
                  <p className="text-3xl font-bold">${stats.monthlySpend}</p>
                  <p className="text-green-200 text-xs mt-1">this month</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Inventory */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      <span>Current Inventory</span>
                    </CardTitle>
                    <CardDescription>
                      Track keg levels and reorder needs
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.type} • {item.size}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 mt-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{item.fillLevel}% full</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{item.daysRemaining} days left</span>
                            </div>
                          </div>

                          {/* Fill Level Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item.fillLevel < 30 ? 'bg-red-500' :
                                  item.fillLevel < 60 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${item.fillLevel}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority} priority
                          </span>
                          {item.fillLevel < 30 && (
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

          {/* Order Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span>Recent Orders</span>
                </CardTitle>
                <CardDescription>
                  Latest orders and deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-xs text-gray-600">{order.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-xs text-gray-600">• {item}</p>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-2">${order.total}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-3" />
                    Place New Order
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <QrCode className="h-4 w-4 mr-3" />
                    Scan Keg QR
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-3" />
                    Contact Supplier
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
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
                  <span className="font-medium text-red-800">Low Stock Alert</span>
                </div>
                <p className="text-sm text-red-700">Summer IPA running low - 2 days remaining</p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  Reorder Now
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Delivery Scheduled</span>
                </div>
                <p className="text-sm text-blue-700">Order #3 confirmed for tomorrow 2:00 PM</p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Details
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Inventory Updated</span>
                </div>
                <p className="text-sm text-green-700">Wheat Beer keg levels updated after delivery</p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Inventory
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
