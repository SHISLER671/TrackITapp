'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/NavBar'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  User, 
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Navigation,
  Edit,
  Printer,
  Share,
  Camera,
  FileText,
  Calendar,
  ArrowLeft,
  Timer,
  Route,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeliveryDetail {
  id: string
  driver: {
    id: string
    name: string
    phone: string
    email: string
    rating: number
    avatar?: string
  }
  restaurant: {
    id: string
    name: string
    address: string
    phone: string
    email: string
    contact: string
  }
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: Date
  estimatedArrival: string
  actualArrival?: string
  route: {
    distance: string
    duration: string
    waypoints: string[]
  }
  kegs: Array<{
    id: string
    name: string
    type: string
    size: string
    quantity: number
    status: 'pending' | 'delivered' | 'rejected'
    qrCode: string
  }>
  notes?: string
  specialInstructions?: string
  deliveryProof?: {
    photos: string[]
    signature?: string
    timestamp: Date
  }
  createdAt: Date
  updatedAt: Date
}

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [delivery, setDelivery] = useState<DeliveryDetail>({
    id: 'del-001',
    driver: {
      id: 'driver-001',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@kegtracker.com',
      rating: 4.8
    },
    restaurant: {
      id: 'rest-001',
      name: 'Downtown Pub',
      address: '123 Main St, Downtown, City, State 12345',
      phone: '+1 (555) 987-6543',
      email: 'manager@downtownpub.com',
      contact: 'Sarah Johnson'
    },
    status: 'in_progress',
    priority: 'high',
    scheduledDate: new Date('2024-10-16T14:00:00'),
    estimatedArrival: '2:30 PM',
    actualArrival: '2:25 PM',
    route: {
      distance: '12.5 miles',
      duration: '25 minutes',
      waypoints: ['Warehouse', 'Downtown', 'Downtown Pub']
    },
    kegs: [
      {
        id: 'keg-001',
        name: 'Summer IPA',
        type: 'IPA',
        size: 'Half Barrel',
        quantity: 2,
        status: 'delivered',
        qrCode: 'KT-2024-001'
      },
      {
        id: 'keg-002',
        name: 'Dark Porter',
        type: 'Porter',
        size: 'Quarter Barrel',
        quantity: 1,
        status: 'pending',
        qrCode: 'KT-2024-002'
      }
    ],
    notes: 'Customer prefers morning delivery',
    specialInstructions: 'Use back entrance. Contact manager before arrival.',
    createdAt: new Date('2024-10-16T08:00:00'),
    updatedAt: new Date('2024-10-16T14:15:00')
  })

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

  const getKegStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
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
              { name: 'Deliveries', href: '/deliveries' },
              { name: `Delivery #${delivery.id}` }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/deliveries')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="h-10 w-10 text-green-600" />
                Delivery #{delivery.id}
              </h1>
              <p className="text-gray-600 mt-2">{delivery.restaurant.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Delivery
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${getPriorityColor(delivery.priority)}`}>
                    {delivery.priority}
                  </span>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {delivery.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Distance</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{delivery.route.distance}</p>
                </div>
                <Route className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Driver Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {delivery.driver.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{delivery.driver.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {delivery.driver.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {delivery.driver.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Rating: {delivery.driver.rating}/5
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Delivery Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{delivery.restaurant.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {delivery.restaurant.address}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Person</p>
                      <p className="text-gray-900">{delivery.restaurant.contact}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{delivery.restaurant.phone}</p>
                    </div>
                  </div>

                  {delivery.specialInstructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                      <p className="text-sm text-yellow-700 mt-1">{delivery.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-purple-600" />
                  <span>Route Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Distance</p>
                    <p className="text-lg font-semibold text-gray-900">{delivery.route.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{delivery.route.duration}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Route Waypoints:</p>
                  <div className="flex items-center gap-2">
                    {delivery.route.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {waypoint}
                        </span>
                        {index < delivery.route.waypoints.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="mt-4 w-full" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  View Route on Map
                </Button>
              </CardContent>
            </Card>

            {/* Kegs Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Delivery Items ({delivery.kegs.length} kegs)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {delivery.kegs.map((keg) => (
                    <div key={keg.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{keg.name}</h3>
                            <span className="text-sm text-gray-600">({keg.type})</span>
                            <span className="text-sm text-gray-600">- {keg.size}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Quantity: {keg.quantity}</span>
                            <span>QR: {keg.qrCode}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getKegStatusColor(keg.status)}`}>
                            {keg.status}
                          </span>
                          <Button size="sm" variant="outline">
                            <Camera className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Delivery Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Completed</p>
                      <p className="text-xs text-gray-600">2:25 PM - 5 minutes early</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Driver Arrived</p>
                      <p className="text-xs text-gray-600">2:25 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Driver Started Route</p>
                      <p className="text-xs text-gray-600">1:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Assigned</p>
                      <p className="text-xs text-gray-600">9:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Created</p>
                      <p className="text-xs text-gray-600">8:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Camera className="h-4 w-4 mr-3" />
                    Take Photo
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-3" />
                    Add Note
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-3" />
                    Call Restaurant
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Navigation className="h-4 w-4 mr-3" />
                    Update Location
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-3" />
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {delivery.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{delivery.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
