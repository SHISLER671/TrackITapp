'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/NavBar'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Navigation, 
  CheckCircle,
  AlertCircle,
  Phone,
  QrCode,
  Route,
  Calendar
} from 'lucide-react'

interface DeliveryRoute {
  id: string
  restaurant: string
  address: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  estimatedArrival: string
  kegs: number
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

interface DriverStats {
  totalDeliveries: number
  completedToday: number
  pendingDeliveries: number
  averageTime: string
  efficiency: number
  milesDriven: number
}

export default function DriverDashboard() {
  const [stats, setStats] = useState<DriverStats>({
    totalDeliveries: 18,
    completedToday: 6,
    pendingDeliveries: 4,
    averageTime: '24 min',
    efficiency: 92,
    milesDriven: 45
  })

  const [todaysRoutes, setTodaysRoutes] = useState<DeliveryRoute[]>([
    {
      id: '1',
      restaurant: 'Downtown Pub',
      address: '123 Main St, Downtown',
      status: 'in_progress',
      estimatedArrival: '2:30 PM',
      kegs: 4,
      priority: 'high',
      notes: 'Customer prefers morning delivery'
    },
    {
      id: '2',
      restaurant: 'Brewery District Tavern',
      address: '456 Brew St, Brewery District',
      status: 'pending',
      estimatedArrival: '3:15 PM',
      kegs: 2,
      priority: 'medium'
    },
    {
      id: '3',
      restaurant: 'Riverside Bistro',
      address: '789 River Rd, Riverside',
      status: 'pending',
      estimatedArrival: '4:00 PM',
      kegs: 3,
      priority: 'low'
    },
    {
      id: '4',
      restaurant: 'Harbor View Restaurant',
      address: '321 Harbor Ave, Harbor District',
      status: 'completed',
      estimatedArrival: '1:45 PM',
      kegs: 5,
      priority: 'high'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'delayed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
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
              { name: 'Driver Dashboard' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="h-10 w-10 text-green-600" />
              Driver Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage deliveries, routes, and customer interactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Optimize Route</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <QrCode className="h-4 w-4 mr-2" />
              Start Delivery
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed Today</p>
                  <p className="text-3xl font-bold">{stats.completedToday}</p>
                  <p className="text-green-200 text-xs mt-1">of {stats.totalDeliveries} total</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Pending Deliveries</p>
                  <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
                  <p className="text-blue-200 text-xs mt-1">remaining today</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Average Time</p>
                  <p className="text-3xl font-bold">{stats.averageTime}</p>
                  <p className="text-purple-200 text-xs mt-1">per delivery</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Miles Driven</p>
                  <p className="text-3xl font-bold">{stats.milesDriven}</p>
                  <p className="text-orange-200 text-xs mt-1">today</p>
                </div>
                <Navigation className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Route */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="h-5 w-5 text-green-600" />
                  <span>Today's Delivery Route</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled deliveries for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysRoutes.map((route, index) => (
                    <div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{route.restaurant}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {route.address}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{route.kegs} kegs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{route.estimatedArrival}</span>
                            </div>
                          </div>

                          {route.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">{route.notes}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(route.status)}`}>
                            {route.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(route.priority)}`}>
                            {route.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {route.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <QrCode className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          </>
                        )}
                        {route.status === 'in_progress' && (
                          <>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button size="sm" variant="outline">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Issue
                            </Button>
                          </>
                        )}
                        {route.status === 'completed' && (
                          <span className="text-sm text-green-600 font-medium">✓ Delivered</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Driver Tools */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span>Driver Tools</span>
                </CardTitle>
                <CardDescription>
                  Quick access to delivery tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <QrCode className="h-4 w-4 mr-3" />
                    Scan Keg QR Code
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Navigation className="h-4 w-4 mr-3" />
                    Get Directions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-3" />
                    Contact Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertCircle className="h-4 w-4 mr-3" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Next Week</p>
                    <p className="text-gray-600">Mon: 8 deliveries</p>
                    <p className="text-gray-600">Tue: 6 deliveries</p>
                    <p className="text-gray-600">Wed: 10 deliveries</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Performance Summary</span>
            </CardTitle>
            <CardDescription>
              Your delivery performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.efficiency}%</p>
                <p className="text-sm text-gray-600">On-time Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.completedToday}</p>
                <p className="text-sm text-gray-600">Completed Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.averageTime}</p>
                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.milesDriven} mi</p>
                <p className="text-sm text-gray-600">Miles Driven</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
