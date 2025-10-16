'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Save,
  ArrowLeft,
  Plus,
  Minus,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  contact: string
}

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  status: 'available' | 'busy'
  rating: number
}

interface Keg {
  id: string
  name: string
  type: string
  size: string
  quantity: number
  available: number
}

export default function NewDeliveryPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    restaurant: '',
    driver: '',
    scheduledDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    specialInstructions: ''
  })
  const [selectedKegs, setSelectedKegs] = useState<Array<{ keg: Keg; quantity: number }>>([])

  const restaurants: Restaurant[] = [
    { id: 'rest-001', name: 'Downtown Pub', address: '123 Main St, Downtown', phone: '+1 (555) 987-6543', contact: 'Sarah Johnson' },
    { id: 'rest-002', name: 'Brewery District Tavern', address: '456 Brew St, Brewery District', phone: '+1 (555) 876-5432', contact: 'Mike Chen' },
    { id: 'rest-003', name: 'Riverside Bistro', address: '789 River Rd, Riverside', phone: '+1 (555) 765-4321', contact: 'Emily Davis' }
  ]

  const drivers: Driver[] = [
    { id: 'driver-001', name: 'John Smith', phone: '+1 (555) 123-4567', email: 'john@kegtracker.com', status: 'available', rating: 4.8 },
    { id: 'driver-002', name: 'Sarah Johnson', phone: '+1 (555) 234-5678', email: 'sarah@kegtracker.com', status: 'available', rating: 4.9 },
    { id: 'driver-003', name: 'Mike Wilson', phone: '+1 (555) 345-6789', email: 'mike@kegtracker.com', status: 'busy', rating: 4.7 }
  ]

  const availableKegs: Keg[] = [
    { id: 'keg-001', name: 'Summer IPA', type: 'IPA', size: 'Half Barrel', quantity: 0, available: 5 },
    { id: 'keg-002', name: 'Dark Porter', type: 'Porter', size: 'Quarter Barrel', quantity: 0, available: 3 },
    { id: 'keg-003', name: 'Wheat Beer', type: 'Wheat', size: 'Sixth Barrel', quantity: 0, available: 8 },
    { id: 'keg-004', name: 'Lager Classic', type: 'Lager', size: 'Half Barrel', quantity: 0, available: 4 },
    { id: 'keg-005', name: 'Sour Ale', type: 'Sour', size: 'Quarter Barrel', quantity: 0, available: 2 }
  ]

  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurant)
  const selectedDriver = drivers.find(d => d.id === formData.driver)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKegQuantityChange = (kegId: string, quantity: number) => {
    const keg = availableKegs.find(k => k.id === kegId)
    if (!keg || quantity < 0 || quantity > keg.available) return

    setSelectedKegs(prev => {
      const existing = prev.find(item => item.keg.id === kegId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(item => item.keg.id !== kegId)
        } else {
          return prev.map(item => 
            item.keg.id === kegId ? { ...item, quantity } : item
          )
        }
      } else if (quantity > 0) {
        return [...prev, { keg, quantity }]
      }
      return prev
    })
  }

  const getTotalKegs = () => {
    return selectedKegs.reduce((sum, item) => sum + item.quantity, 0)
  }

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return formData.restaurant && formData.driver
      case 2:
        return formData.scheduledDate && selectedKegs.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create delivery
      const deliveryData = {
        ...formData,
        kegs: selectedKegs.map(item => ({
          kegId: item.keg.id,
          name: item.keg.name,
          type: item.keg.type,
          size: item.keg.size,
          quantity: item.quantity
        }))
      }

      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      })

      if (response.ok) {
        router.push('/deliveries')
      } else {
        console.error('Failed to create delivery')
      }
    } catch (error) {
      console.error('Error creating delivery:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Deliveries', href: '/deliveries' },
              { name: 'New Delivery' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/deliveries')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="h-10 w-10 text-green-600" />
              Schedule New Delivery
            </h1>
            <p className="text-gray-600 mt-2">Create a new delivery order for keg distribution</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNum 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    step > stepNum ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Basic Info</span>
            <span className="text-sm text-gray-600">Schedule & Items</span>
            <span className="text-sm text-gray-600">Review & Create</span>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Select the restaurant and driver for this delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Restaurant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.restaurant === restaurant.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('restaurant', restaurant.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.restaurant === restaurant.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.restaurant === restaurant.id && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{restaurant.contact}</p>
                          <p className="text-xs text-gray-500">{restaurant.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver *
                </label>
                <div className="space-y-3">
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.driver === driver.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('driver', driver.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.driver === driver.id
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.driver === driver.id && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                            <p className="text-sm text-gray-600">{driver.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            driver.status === 'available' 
                              ? 'text-green-600 bg-green-100' 
                              : 'text-orange-600 bg-orange-100'
                          }`}>
                            {driver.status}
                          </span>
                          <span className="text-sm text-gray-600">⭐ {driver.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Schedule & Items</span>
              </CardTitle>
              <CardDescription>
                Set delivery time and select kegs to deliver
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Keg Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Kegs to Deliver *
                </label>
                <div className="space-y-3">
                  {availableKegs.map((keg) => {
                    const selectedItem = selectedKegs.find(item => item.keg.id === keg.id)
                    const selectedQuantity = selectedItem?.quantity || 0

                    return (
                      <div key={keg.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{keg.name}</h3>
                            <p className="text-sm text-gray-600">
                              {keg.type} • {keg.size} • Available: {keg.available}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleKegQuantityChange(keg.id, selectedQuantity - 1)}
                                disabled={selectedQuantity === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{selectedQuantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleKegQuantityChange(keg.id, selectedQuantity + 1)}
                                disabled={selectedQuantity >= keg.available}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              {selectedKegs.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Delivery Summary</h3>
                  <p className="text-sm text-blue-800">
                    Total Kegs: {getTotalKegs()} • 
                    Total Items: {selectedKegs.length} different keg types
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Review & Create</span>
              </CardTitle>
              <CardDescription>
                Review the delivery details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Restaurant:</span> {selectedRestaurant?.name}</p>
                    <p><span className="font-medium">Driver:</span> {selectedDriver?.name}</p>
                    <p><span className="font-medium">Scheduled:</span> {formData.scheduledDate}</p>
                    <p><span className="font-medium">Priority:</span> {formData.priority}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Items to Deliver</h3>
                  <div className="space-y-2 text-sm">
                    {selectedKegs.map((item) => (
                      <p key={item.keg.id}>
                        <span className="font-medium">{item.quantity}x</span> {item.keg.name} ({item.keg.size})
                      </p>
                    ))}
                    <p className="font-medium pt-2 border-t">
                      Total Kegs: {getTotalKegs()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any special notes for this delivery..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Special instructions for the driver..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/deliveries')}
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex gap-3">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToNext()}
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creating...' : 'Create Delivery'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
