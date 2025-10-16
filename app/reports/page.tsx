'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { Breadcrumb } from '@/components/NavBar'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Package,
  Truck,
  Building2,
  DollarSign,
  Clock,
  Users
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: 'inventory' | 'delivery' | 'financial' | 'performance'
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'inventory-summary',
      name: 'Inventory Summary',
      description: 'Complete overview of keg inventory, status, and movements',
      icon: Package,
      category: 'inventory',
      frequency: 'daily'
    },
    {
      id: 'delivery-performance',
      name: 'Delivery Performance',
      description: 'Delivery metrics, timing, and driver performance analysis',
      icon: Truck,
      category: 'delivery',
      frequency: 'weekly'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue, costs, and profitability analysis',
      icon: DollarSign,
      category: 'financial',
      frequency: 'monthly'
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Customer behavior, preferences, and retention metrics',
      icon: Users,
      category: 'performance',
      frequency: 'monthly'
    },
    {
      id: 'efficiency-report',
      name: 'Efficiency Report',
      description: 'Operational efficiency and optimization opportunities',
      icon: TrendingUp,
      category: 'performance',
      frequency: 'weekly'
    },
    {
      id: 'compliance-report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit trail documentation',
      icon: FileText,
      category: 'performance',
      frequency: 'monthly'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'bg-blue-100 text-blue-600'
      case 'delivery': return 'bg-green-100 text-green-600'
      case 'financial': return 'bg-purple-100 text-purple-600'
      case 'performance': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId)
    // In a real app, this would trigger report generation
    console.log(`Generating report: ${reportId}`)
  }

  const handleExportReport = (reportId: string, format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would export the report
    console.log(`Exporting report ${reportId} as ${format}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Reports & Analytics' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Generate insights and track performance across your keg operations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Report Period</span>
            </CardTitle>
            <CardDescription>Select the time period for your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={dateRange === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(period)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {period === '7d' && 'Last 7 Days'}
                  {period === '30d' && 'Last 30 Days'}
                  {period === '90d' && 'Last 90 Days'}
                  {period === '1y' && 'Last Year'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTemplates.map((template) => {
            const Icon = template.icon
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getFrequencyColor(template.frequency)}`}>
                      {template.frequency}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleGenerateReport(template.id)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportReport(template.id, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Analytics Dashboard */}
        {selectedReport === 'inventory-summary' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Inventory Summary Analytics</span>
              </CardTitle>
              <CardDescription>Real-time analytics for inventory management</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Reports Generated</p>
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-blue-200 text-xs mt-1">this month</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Data Points</p>
                  <p className="text-3xl font-bold">1.2M</p>
                  <p className="text-green-200 text-xs mt-1">processed</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Export Downloads</p>
                  <p className="text-3xl font-bold">156</p>
                  <p className="text-purple-200 text-xs mt-1">this month</p>
                </div>
                <Download className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg. Generation Time</p>
                  <p className="text-3xl font-bold">2.3s</p>
                  <p className="text-orange-200 text-xs mt-1">per report</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span>Recent Reports</span>
            </CardTitle>
            <CardDescription>Your recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Inventory Summary - October 2024', type: 'PDF', date: '2024-10-15', size: '2.3 MB' },
                { name: 'Delivery Performance Report', type: 'CSV', date: '2024-10-14', size: '1.8 MB' },
                { name: 'Financial Summary Q3 2024', type: 'Excel', date: '2024-10-12', size: '4.1 MB' },
                { name: 'Customer Analytics Report', type: 'PDF', date: '2024-10-10', size: '3.2 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.type} • {report.date} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
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
    </div>
  )
}
