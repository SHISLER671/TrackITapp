'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Truck, 
  Route,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'

interface RouteStop {
  id: string
  restaurant: string
  address: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: number // minutes
  kegs: number
  deliveryWindow: {
    start: string
    end: string
  }
  coordinates: {
    lat: number
    lng: number
  }
}

interface OptimizedRoute {
  id: string
  driver: string
  stops: RouteStop[]
  totalDistance: number // miles
  totalTime: number // minutes
  fuelCost: number
  efficiency: number // percentage
  startTime: string
  endTime: string
}

export default function RouteOptimizer() {
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null)

  // Mock data for demonstration
  const mockDeliveries = [
    {
      id: 'del-001',
      restaurant: 'Downtown Pub',
      address: '123 Main St, Downtown',
      priority: 'high' as const,
      estimatedTime: 15,
      kegs: 3,
      deliveryWindow: { start: '14:00', end: '16:00' },
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'del-002',
      restaurant: 'Brewery District Tavern',
      address: '456 Brew St, Brewery District',
      priority: 'medium' as const,
      estimatedTime: 20,
      kegs: 2,
      deliveryWindow: { start: '15:00', end: '17:00' },
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 'del-003',
      restaurant: 'Riverside Bistro',
      address: '789 River Rd, Riverside',
      priority: 'low' as const,
      estimatedTime: 25,
      kegs: 4,
      deliveryWindow: { start: '16:00', end: '18:00' },
      coordinates: { lat: 40.6892, lng: -74.0445 }
    }
  ]

  const availableDrivers = [
    { id: 'driver-001', name: 'John Smith', capacity: 10, rating: 4.8 },
    { id: 'driver-002', name: 'Sarah Johnson', capacity: 8, rating: 4.9 },
    { id: 'driver-003', name: 'Mike Wilson', capacity: 12, rating: 4.7 }
  ]

  const handleDeliveryToggle = (deliveryId: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    )
  }

  const optimizeRoutes = async () => {
    if (selectedDeliveries.length === 0) return

    setIsOptimizing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock optimized routes
    const mockOptimizedRoutes: OptimizedRoute[] = [
      {
        id: 'route-001',
        driver: 'John Smith',
        stops: selectedDeliveries.map(id => {
          const delivery = mockDeliveries.find(d => d.id === id)
          return delivery ? {
            id: delivery.id,
            restaurant: delivery.restaurant,
            address: delivery.address,
            priority: delivery.priority,
            estimatedTime: delivery.estimatedTime,
            kegs: delivery.kegs,
            deliveryWindow: delivery.deliveryWindow,
            coordinates: delivery.coordinates
          } : null
        }).filter(Boolean) as RouteStop[],
        totalDistance: 18.5,
        totalTime: 95,
        fuelCost: 12.50,
        efficiency: 87,
        startTime: '14:00',
        endTime: '15:35'
      }
    ]

    setOptimizedRoutes(mockOptimizedRoutes)
    setIsOptimizing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-green-600" />
            Route Optimization
          </h2>
          <p className="text-gray-600 mt-1">Optimize delivery routes for maximum efficiency</p>
        </div>
        <Button 
          onClick={optimizeRoutes}
          disabled={selectedDeliveries.length === 0 || isOptimizing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Optimize Routes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Select Deliveries</span>
              </CardTitle>
              <CardDescription>
                Choose deliveries to include in route optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedDeliveries.includes(delivery.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDeliveryToggle(delivery.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{delivery.restaurant}</h3>
                        <p className="text-sm text-gray-600">{delivery.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{delivery.kegs} kegs</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{delivery.estimatedTime} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority}
                        </span>
                        {selectedDeliveries.includes(delivery.id) && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedDeliveries.length} deliveries
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Results */}
        <div className="lg:col-span-2">
          {optimizedRoutes.length > 0 ? (
            <div className="space-y-4">
              {optimizedRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Route className="h-5 w-5 text-purple-600" />
                        <span>{route.driver}</span>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Optimized route with {route.stops.length} stops
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{route.totalDistance}</p>
                        <p className="text-sm text-gray-600">Miles</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{route.totalTime}</p>
                        <p className="text-sm text-gray-600">Minutes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">${route.fuelCost}</p>
                        <p className="text-sm text-gray-600">Fuel Cost</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{route.efficiency}%</p>
                        <p className="text-sm text-gray-600">Efficiency</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Route Stops:</h4>
                      <div className="space-y-2">
                        {route.stops.map((stop, index) => (
                          <div key={stop.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{stop.restaurant}</p>
                              <p className="text-sm text-gray-600">{stop.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{stop.estimatedTime}m</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(stop.priority)}`}>
                                {stop.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Route Summary</p>
                          <p className="text-sm text-green-700">
                            {route.startTime} - {route.endTime} • {route.stops.reduce((sum, stop) => sum + stop.kegs, 0)} total kegs
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Optimized</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Generated</h3>
                <p className="text-gray-600 mb-4">
                  Select deliveries and click "Optimize Routes" to generate optimized delivery routes.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Route optimization uses advanced algorithms to minimize travel time and fuel costs.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
