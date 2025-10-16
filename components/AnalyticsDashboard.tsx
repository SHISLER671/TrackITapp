'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Truck,
  Building2,
  Clock,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalKegs: number
  activeKegs: number
  deliveredKegs: number
  returnedKegs: number
  totalDeliveries: number
  completedDeliveries: number
  pendingDeliveries: number
  averageDeliveryTime: number
  monthlyRevenue: number
  revenueGrowth: number
  efficiency: number
  efficiencyGrowth: number
}

interface TimeSeriesData {
  date: string
  kegs: number
  deliveries: number
  revenue: number
}

interface TopKegData {
  name: string
  type: string
  deliveries: number
  revenue: number
  growth: number
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalKegs: 156,
    activeKegs: 98,
    deliveredKegs: 45,
    returnedKegs: 13,
    totalDeliveries: 234,
    completedDeliveries: 198,
    pendingDeliveries: 36,
    averageDeliveryTime: 2.4,
    monthlyRevenue: 45600,
    revenueGrowth: 12.5,
    efficiency: 94.2,
    efficiencyGrowth: 3.8
  })

  const [timeSeriesData] = useState<TimeSeriesData[]>([
    { date: '2024-10-01', kegs: 12, deliveries: 18, revenue: 3200 },
    { date: '2024-10-02', kegs: 15, deliveries: 22, revenue: 3800 },
    { date: '2024-10-03', kegs: 18, deliveries: 25, revenue: 4200 },
    { date: '2024-10-04', kegs: 14, deliveries: 20, revenue: 3600 },
    { date: '2024-10-05', kegs: 16, deliveries: 23, revenue: 3900 },
    { date: '2024-10-06', kegs: 20, deliveries: 28, revenue: 4500 },
    { date: '2024-10-07', kegs: 22, deliveries: 30, revenue: 4800 }
  ])

  const [topKegs] = useState<TopKegData[]>([
    { name: 'Summer IPA', type: 'IPA', deliveries: 45, revenue: 8200, growth: 15.2 },
    { name: 'Dark Porter', type: 'Porter', deliveries: 38, revenue: 6800, growth: 8.7 },
    { name: 'Wheat Beer', type: 'Wheat', deliveries: 32, revenue: 5600, growth: -2.1 },
    { name: 'Lager Classic', type: 'Lager', deliveries: 28, revenue: 4900, growth: 22.3 },
    { name: 'Sour Ale', type: 'Sour', deliveries: 25, revenue: 4200, growth: 18.9 }
  ])

  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d')
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (value: number) => {
    return value > 0 ? ArrowUpRight : ArrowDownRight
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting analytics data...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Key performance indicators and business insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {period === '7d' && '7 Days'}
                {period === '30d' && '30 Days'}
                {period === '90d' && '90 Days'}
                {period === '1y' && '1 Year'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.monthlyRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {(() => {
                const Icon = getGrowthIcon(analyticsData.revenueGrowth)
                return <Icon className="h-3 w-3" />
              })()}
              <span className={getGrowthColor(analyticsData.revenueGrowth)}>
                {formatPercentage(analyticsData.revenueGrowth)}
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kegs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalKegs}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-green-600">+8.2%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalDeliveries}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-green-600">+12.1%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.efficiency}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {(() => {
                const Icon = getGrowthIcon(analyticsData.efficiencyGrowth)
                return <Icon className="h-3 w-3" />
              })()}
              <span className={getGrowthColor(analyticsData.efficiencyGrowth)}>
                {formatPercentage(analyticsData.efficiencyGrowth)}
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Revenue Trend</span>
            </CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {timeSeriesData.map((data, index) => {
                const maxRevenue = Math.max(...timeSeriesData.map(d => d.revenue))
                const height = (data.revenue / maxRevenue) * 200
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 font-mono">
                      {formatCurrency(data.revenue)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <span>Delivery Performance</span>
            </CardTitle>
            <CardDescription>Delivery completion and timing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Deliveries</span>
                <span className="font-semibold">{analyticsData.completedDeliveries}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analyticsData.completedDeliveries / analyticsData.totalDeliveries) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Deliveries</span>
                <span className="font-semibold">{analyticsData.pendingDeliveries}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analyticsData.pendingDeliveries / analyticsData.totalDeliveries) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Delivery Time</span>
                <span className="font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {analyticsData.averageDeliveryTime}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Kegs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Top Performing Kegs</span>
          </CardTitle>
          <CardDescription>Best performing kegs by revenue and deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topKegs.map((keg, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{keg.name}</h3>
                    <p className="text-sm text-gray-600">{keg.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Deliveries</p>
                    <p className="font-semibold">{keg.deliveries}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-semibold">{formatCurrency(keg.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Growth</p>
                    <p className={`font-semibold ${getGrowthColor(keg.growth)}`}>
                      {formatPercentage(keg.growth)}
                    </p>
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
    </div>
  )
}
