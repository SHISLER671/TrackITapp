'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/NavBar'
import { 
  CreditCard, 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Download,
  Plus,
  Eye,
  Trash2
} from 'lucide-react'

interface POSSystem {
  id: string
  name: string
  type: 'revel' | 'square' | 'toast' | 'custom'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: Date
  salesToday: number
  totalSales: number
  location: string
  apiKey?: string
  webhookUrl?: string
}

interface SalesData {
  date: string
  kegId: string
  kegName: string
  quantity: number
  price: number
  location: string
  posSystem: string
}

export default function POSIntegrationPage() {
  const [posSystems, setPosSystems] = useState<POSSystem[]>([
    {
      id: '1',
      name: 'Downtown Pub - Revel',
      type: 'revel',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      salesToday: 24,
      totalSales: 156,
      location: 'Downtown Pub',
      webhookUrl: 'https://api.kegtracker.com/webhooks/revel/downtown-pub'
    },
    {
      id: '2',
      name: 'Brewery District - Square',
      type: 'square',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000), // 10 minutes ago
      salesToday: 18,
      totalSales: 89,
      location: 'Brewery District Tavern'
    },
    {
      id: '3',
      name: 'Riverside Bistro - Toast',
      type: 'toast',
      status: 'syncing',
      lastSync: new Date(Date.now() - 120000), // 2 minutes ago
      salesToday: 12,
      totalSales: 67,
      location: 'Riverside Bistro'
    }
  ])

  const [recentSales, setRecentSales] = useState<SalesData[]>([
    {
      date: '2024-10-16 14:30',
      kegId: 'keg-001',
      kegName: 'Summer IPA',
      quantity: 2,
      price: 12.50,
      location: 'Downtown Pub',
      posSystem: 'Revel'
    },
    {
      date: '2024-10-16 14:15',
      kegId: 'keg-002',
      kegName: 'Dark Porter',
      quantity: 1,
      price: 8.75,
      location: 'Brewery District Tavern',
      posSystem: 'Square'
    },
    {
      date: '2024-10-16 14:00',
      kegId: 'keg-003',
      kegName: 'Wheat Beer',
      quantity: 3,
      price: 15.00,
      location: 'Riverside Bistro',
      posSystem: 'Toast'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [showAddSystem, setShowAddSystem] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'disconnected': return 'text-red-600 bg-red-100'
      case 'error': return 'text-orange-600 bg-orange-100'
      case 'syncing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revel': return '🔴'
      case 'square': return '⬜'
      case 'toast': return '🍞'
      default: return '💳'
    }
  }

  const handleSync = async (systemId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPosSystems(prev => prev.map(system => 
        system.id === systemId 
          ? { ...system, status: 'connected', lastSync: new Date() }
          : system
      ))
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = (systemId: string) => {
    setPosSystems(prev => prev.map(system => 
      system.id === systemId 
        ? { ...system, status: 'disconnected' }
        : system
    ))
  }

  const totalSalesToday = posSystems.reduce((sum, system) => sum + system.salesToday, 0)
  const totalSalesAll = posSystems.reduce((sum, system) => sum + system.totalSales, 0)
  const connectedSystems = posSystems.filter(system => system.status === 'connected').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Integrations', href: '/integrations' },
              { name: 'POS Systems' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="h-10 w-10 text-blue-600" />
              POS Integration
            </h1>
            <p className="text-gray-600 mt-2">Connect and sync with point-of-sale systems for real-time sales data</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Sync All</span>
            </Button>
            <Button 
              onClick={() => setShowAddSystem(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add POS System
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Connected Systems</p>
                  <p className="text-3xl font-bold">{connectedSystems}</p>
                  <p className="text-blue-200 text-xs mt-1">of {posSystems.length} total</p>
                </div>
                <Wifi className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Sales Today</p>
                  <p className="text-3xl font-bold">{totalSalesToday}</p>
                  <p className="text-green-200 text-xs mt-1">kegs sold</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Sales</p>
                  <p className="text-3xl font-bold">{totalSalesAll}</p>
                  <p className="text-purple-200 text-xs mt-1">all time</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Last Sync</p>
                  <p className="text-3xl font-bold">2m</p>
                  <p className="text-orange-200 text-xs mt-1">ago</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* POS Systems */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Connected POS Systems</span>
                </CardTitle>
                <CardDescription>
                  Manage your point-of-sale system integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posSystems.map((system) => (
                    <div key={system.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getTypeIcon(system.type)}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{system.name}</h3>
                            <p className="text-sm text-gray-600">{system.location}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-600">
                                Sales Today: <span className="font-semibold">{system.salesToday}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{system.totalSales}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Last Sync: <span className="font-semibold">
                                  {system.lastSync.toLocaleTimeString()}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-2 ${getStatusColor(system.status)}`}>
                            {getStatusIcon(system.status)}
                            <span className="capitalize">{system.status}</span>
                          </span>
                          
                          <div className="flex gap-2">
                            {system.status === 'disconnected' || system.status === 'error' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleSync(system.id)}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Wifi className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSync(system.id)}
                                disabled={loading}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync
                              </Button>
                            )}
                            
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDisconnect(system.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <WifiOff className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sales Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Recent Sales Data</span>
            </CardTitle>
            <CardDescription>
              Latest keg sales synced from POS systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">
                        {getTypeIcon(sale.posSystem.toLowerCase())}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sale.kegName}</h3>
                      <p className="text-sm text-gray-600">{sale.location} • {sale.date}</p>
                      <p className="text-xs text-gray-500">Keg ID: {sale.kegId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-semibold">{sale.quantity} kegs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold">${sale.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">POS System</p>
                      <p className="font-semibold">{sale.posSystem}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common POS integration operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-6 w-6" />
                <span>Add System</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-6 w-6" />
                <span>Sync All</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Download className="h-6 w-6" />
                <span>Export Data</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Settings className="h-6 w-6" />
                <span>Configure</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
