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
  User, 
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Navigation,
  BarChart3,
  Filter,
  Download
} from 'lucide-react'

interface Delivery {
  id: string
  driver: string
  driverId: string
  restaurant: string
  restaurantId: string
  address: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: Date
  estimatedArrival: string
  actualArrival?: string
  kegs: Array<{
    id: string
    name: string
    type: string
    size: string
    quantity: number
  }>
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  status: 'available' | 'busy' | 'offline'
  currentLocation?: string
  activeDeliveries: number
  rating: number
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'del-001',
      driver: 'John Smith',
      driverId: 'driver-001',
      restaurant: 'Downtown Pub',
      restaurantId: 'rest-001',
      address: '123 Main St, Downtown',
      status: 'in_progress',
      priority: 'high',
      scheduledDate: new Date('2024-10-16T14:00:00'),
      estimatedArrival: '2:30 PM',
      kegs: [
        { id: 'keg-001', name: 'Summer IPA', type: 'IPA', size: 'Half Barrel', quantity: 2 },
        { id: 'keg-002', name: 'Dark Porter', type: 'Porter', size: 'Quarter Barrel', quantity: 1 }
      ],
      notes: 'Customer prefers morning delivery',
      createdAt: new Date('2024-10-16T08:00:00'),
      updatedAt: new Date('2024-10-16T14:15:00')
    },
    {
      id: 'del-002',
      driver: 'Sarah Johnson',
      driverId: 'driver-002',
      restaurant: 'Brewery District Tavern',
      restaurantId: 'rest-002',
      address: '456 Brew St, Brewery District',
      status: 'assigned',
      priority: 'medium',
      scheduledDate: new Date('2024-10-16T15:30:00'),
      estimatedArrival: '3:15 PM',
      kegs: [
        { id: 'keg-003', name: 'Wheat Beer', type: 'Wheat', size: 'Sixth Barrel', quantity: 3 }
      ],
      createdAt: new Date('2024-10-16T09:30:00'),
      updatedAt: new Date('2024-10-16T11:45:00')
    },
    {
      id: 'del-003',
      driver: 'Mike Wilson',
      driverId: 'driver-003',
      restaurant: 'Riverside Bistro',
      restaurantId: 'rest-003',
      address: '789 River Rd, Riverside',
      status: 'pending',
      priority: 'low',
      scheduledDate: new Date('2024-10-16T16:00:00'),
      estimatedArrival: '4:00 PM',
      kegs: [
        { id: 'keg-004', name: 'Lager Classic', type: 'Lager', size: 'Half Barrel', quantity: 1 },
        { id: 'keg-005', name: 'Sour Ale', type: 'Sour', size: 'Quarter Barrel', quantity: 2 }
      ],
      createdAt: new Date('2024-10-16T10:15:00'),
      updatedAt: new Date('2024-10-16T10:15:00')
    }
  ])

  const [drivers] = useState<Driver[]>([
    {
      id: 'driver-001',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@kegtracker.com',
      status: 'busy',
      currentLocation: 'Downtown',
      activeDeliveries: 1,
      rating: 4.8
    },
    {
      id: 'driver-002',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@kegtracker.com',
      status: 'available',
      currentLocation: 'Warehouse',
      activeDeliveries: 0,
      rating: 4.9
    },
    {
      id: 'driver-003',
      name: 'Mike Wilson',
      phone: '+1 (555) 345-6789',
      email: 'mike.wilson@kegtracker.com',
      status: 'available',
      currentLocation: 'Warehouse',
      activeDeliveries: 0,
      rating: 4.7
    }
  ])

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'assigned': return 'text-purple-600 bg-purple-100'
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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

  const filteredDeliveries = deliveries.filter(delivery => {
    const statusMatch = selectedStatus === 'all' || delivery.status === selectedStatus
    const priorityMatch = selectedPriority === 'all' || delivery.priority === selectedPriority
    return statusMatch && priorityMatch
  })

  const totalKegs = deliveries.reduce((sum, delivery) => 
    sum + delivery.kegs.reduce((kegSum, keg) => kegSum + keg.quantity, 0), 0
  )

  const completedDeliveries = deliveries.filter(d => d.status === 'completed').length
  const inProgressDeliveries = deliveries.filter(d => d.status === 'in_progress').length
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Deliveries' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="h-10 w-10 text-green-600" />
              Delivery Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage keg deliveries across your supply chain</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Delivery
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Deliveries</p>
                  <p className="text-3xl font-bold">{deliveries.length}</p>
                  <p className="text-blue-200 text-xs mt-1">this week</p>
                </div>
                <Truck className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{completedDeliveries}</p>
                  <p className="text-green-200 text-xs mt-1">on time</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressDeliveries}</p>
                  <p className="text-orange-200 text-xs mt-1">active</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Kegs</p>
                  <p className="text-3xl font-bold">{totalKegs}</p>
                  <p className="text-purple-200 text-xs mt-1">in delivery</p>
                </div>
                <Package className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span>Active Deliveries</span>
                </CardTitle>
                <CardDescription>
                  Manage and track your delivery operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{delivery.restaurant}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {delivery.address}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{delivery.driver}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{delivery.estimatedArrival}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {delivery.kegs.reduce((sum, keg) => sum + keg.quantity, 0)} kegs
                              </span>
                            </div>
                          </div>

                          {/* Keg List */}
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {delivery.kegs.map((keg) => (
                                <span
                                  key={keg.id}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {keg.quantity}x {keg.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {delivery.notes && (
                            <p className="text-xs text-gray-500 italic">{delivery.notes}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(delivery.priority)}`}>
                            {delivery.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="h-3 w-3 mr-1" />
                          Route
                        </Button>
                        {delivery.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drivers Status */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Drivers</span>
                </CardTitle>
                <CardDescription>
                  Driver status and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          driver.status === 'available' ? 'text-green-600 bg-green-100' :
                          driver.status === 'busy' ? 'text-orange-600 bg-orange-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {driver.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Active: {driver.activeDeliveries}</span>
                        <span>Rating: {driver.rating}/5</span>
                        <span>{driver.currentLocation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-3" />
                    Schedule Delivery
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Navigation className="h-4 w-4 mr-3" />
                    Optimize Routes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Delivery Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <User className="h-4 w-4 mr-3" />
                    Manage Drivers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
