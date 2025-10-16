'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KegCard } from '@/components/KegCard'
import { Breadcrumb } from '@/components/NavBar'
import { 
  Package, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Eye, 
  BarChart3,
  Factory,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface BrewerStats {
  totalKegs: number
  activeKegs: number
  pendingDeliveries: number
  lowInventory: number
  efficiency: number
  monthlyProduction: number
}

interface RecentActivity {
  id: string
  type: 'production' | 'delivery' | 'scan' | 'alert'
  message: string
  timestamp: string
  severity?: 'info' | 'warning' | 'critical'
}

export default function BrewerDashboard() {
  const [stats, setStats] = useState<BrewerStats>({
    totalKegs: 24,
    activeKegs: 18,
    pendingDeliveries: 6,
    lowInventory: 3,
    efficiency: 94,
    monthlyProduction: 156
  })

  const [recentKegs, setRecentKegs] = useState([
    {
      id: '1',
      name: 'Summer IPA',
      type: 'IPA',
      size: 'Half Barrel',
      status: 'active',
      abv: 6.5,
      qr_code: 'KT-2024-001',
      created_at: new Date().toISOString(),
      fill_level: 85,
      nft_token_id: '123',
      blockchain_status: 'MINTED'
    },
    {
      id: '2',
      name: 'Dark Porter',
      type: 'Porter',
      size: 'Quarter Barrel',
      status: 'active',
      abv: 7.2,
      qr_code: 'KT-2024-002',
      created_at: new Date().toISOString(),
      fill_level: 45,
      variance_percent: 12,
      variance_severity: 'warning',
      nft_token_id: '124',
      blockchain_status: 'MINTED'
    }
  ])

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'production',
      message: 'New batch of Summer IPA ready for kegging',
      timestamp: '2 hours ago',
      severity: 'info'
    },
    {
      id: '2',
      type: 'delivery',
      message: '6 kegs delivered to Downtown Pub',
      timestamp: '4 hours ago',
      severity: 'info'
    },
    {
      id: '3',
      type: 'alert',
      message: 'Low inventory alert: Porter kegs running low',
      timestamp: '6 hours ago',
      severity: 'warning'
    },
    {
      id: '4',
      type: 'scan',
      message: 'Keg #KT-2024-001 scanned at warehouse',
      timestamp: '8 hours ago',
      severity: 'info'
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Brewer Dashboard' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Factory className="h-10 w-10 text-blue-600" />
              Brewer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitor production, inventory, and deliveries</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Kegs</p>
                  <p className="text-3xl font-bold">{stats.totalKegs}</p>
                  <p className="text-blue-200 text-xs mt-1">+12% from last month</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Kegs</p>
                  <p className="text-3xl font-bold">{stats.activeKegs}</p>
                  <p className="text-green-200 text-xs mt-1">Ready for delivery</p>
                </div>
                <Zap className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Deliveries</p>
                  <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
                  <p className="text-orange-200 text-xs mt-1">Scheduled this week</p>
                </div>
                <Truck className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Production Efficiency</p>
                  <p className="text-3xl font-bold">{stats.efficiency}%</p>
                  <p className="text-purple-200 text-xs mt-1">+3% from last week</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Production */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Factory className="h-5 w-5 text-blue-600" />
                      <span>Recent Production</span>
                    </CardTitle>
                    <CardDescription>
                      Latest kegs ready for delivery
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/kegs">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentKegs.map((keg) => (
                    <KegCard
                      key={keg.id}
                      keg={keg}
                      showProgress={true}
                      showBlockchain={true}
                      showVariance={true}
                      onViewDetails={() => console.log('View details:', keg)}
                      onScan={() => console.log('Scan keg:', keg)}
                      className="h-fit"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Activity Feed</span>
                </CardTitle>
                <CardDescription>
                  Recent brewery operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'warning' ? 'bg-orange-500' :
                        activity.severity === 'critical' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common brewery operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                asChild
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/kegs/new">
                  <Package className="h-6 w-6" />
                  <span>Add Keg</span>
                </Link>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Truck className="h-6 w-6" />
                <span>Schedule Delivery</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Production Report</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span>Brewing Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
