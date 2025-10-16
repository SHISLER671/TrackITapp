"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/NavBar"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Brain,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  Zap,
  Eye,
  Lightbulb,
  Clock,
  DollarSign,
  Package,
  Truck,
} from "lucide-react"

interface VarianceAlert {
  id: string
  type: "inventory" | "sales" | "delivery" | "quality" | "cost"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  currentValue: number
  expectedValue: number
  variance: number
  variancePercentage: number
  impact: string
  recommendations: string[]
  detectedAt: Date
  status: "new" | "investigating" | "resolved" | "false_positive"
  kegId?: string
  restaurantId?: string
  aiConfidence: number
}

interface VarianceTrend {
  date: string
  totalVariances: number
  criticalVariances: number
  resolvedVariances: number
  avgVariancePercentage: number
}

export default function VarianceAnalysisPage() {
  const [varianceAlerts, setVarianceAlerts] = useState<VarianceAlert[]>([
    {
      id: "var-001",
      type: "inventory",
      severity: "high",
      title: "Unexpected Keg Return Rate",
      description: "Keg return rate is 15% higher than expected for Downtown Pub location",
      currentValue: 85,
      expectedValue: 100,
      variance: -15,
      variancePercentage: -15,
      impact: "Potential revenue loss of $2,400/month",
      recommendations: [
        "Investigate keg handling procedures at location",
        "Schedule maintenance check on keg return equipment",
        "Review delivery schedule for timing issues",
      ],
      detectedAt: new Date("2024-10-16T10:30:00"),
      status: "new",
      restaurantId: "rest-001",
      aiConfidence: 0.87,
    },
    {
      id: "var-002",
      type: "sales",
      severity: "medium",
      title: "Sales Volume Anomaly",
      description: "Summer IPA sales dropped 25% below forecast for past 3 days",
      currentValue: 75,
      expectedValue: 100,
      variance: -25,
      variancePercentage: -25,
      impact: "Potential inventory buildup and cash flow impact",
      recommendations: [
        "Check POS system for data accuracy",
        "Verify promotional campaign effectiveness",
        "Consider temporary price adjustment",
      ],
      detectedAt: new Date("2024-10-16T09:15:00"),
      status: "investigating",
      kegId: "keg-001",
      aiConfidence: 0.72,
    },
    {
      id: "var-003",
      type: "quality",
      severity: "critical",
      title: "Temperature Fluctuation Detected",
      description: "Keg temperature exceeded safe range during delivery transit",
      currentValue: 45,
      expectedValue: 38,
      variance: 7,
      variancePercentage: 18.4,
      impact: "Product quality at risk - potential customer complaints",
      recommendations: [
        "Immediate quality check of affected kegs",
        "Review delivery vehicle temperature controls",
        "Notify customers of potential quality issue",
      ],
      detectedAt: new Date("2024-10-16T08:45:00"),
      status: "new",
      kegId: "keg-002",
      aiConfidence: 0.95,
    },
  ])

  const [trends] = useState<VarianceTrend[]>([
    { date: "2024-10-10", totalVariances: 8, criticalVariances: 2, resolvedVariances: 6, avgVariancePercentage: -12.5 },
    { date: "2024-10-11", totalVariances: 12, criticalVariances: 1, resolvedVariances: 8, avgVariancePercentage: -8.3 },
    { date: "2024-10-12", totalVariances: 6, criticalVariances: 0, resolvedVariances: 5, avgVariancePercentage: -5.2 },
    {
      date: "2024-10-13",
      totalVariances: 15,
      criticalVariances: 3,
      resolvedVariances: 10,
      avgVariancePercentage: -15.8,
    },
    { date: "2024-10-14", totalVariances: 9, criticalVariances: 1, resolvedVariances: 7, avgVariancePercentage: -9.1 },
    {
      date: "2024-10-15",
      totalVariances: 11,
      criticalVariances: 2,
      resolvedVariances: 8,
      avgVariancePercentage: -11.4,
    },
    { date: "2024-10-16", totalVariances: 7, criticalVariances: 1, resolvedVariances: 3, avgVariancePercentage: -13.7 },
  ])

  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-100 border-green-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inventory":
        return <Package className="h-4 w-4" />
      case "sales":
        return <DollarSign className="h-4 w-4" />
      case "delivery":
        return <Truck className="h-4 w-4" />
      case "quality":
        return <Target className="h-4 w-4" />
      case "cost":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600 bg-blue-100"
      case "investigating":
        return "text-orange-600 bg-orange-100"
      case "resolved":
        return "text-green-600 bg-green-100"
      case "false_positive":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const filteredAlerts =
    selectedFilter === "all" ? varianceAlerts : varianceAlerts.filter((alert) => alert.type === selectedFilter)

  const totalVariances = varianceAlerts.length
  const criticalVariances = varianceAlerts.filter((a) => a.severity === "critical").length
  const resolvedVariances = varianceAlerts.filter((a) => a.status === "resolved").length
  const avgConfidence = varianceAlerts.reduce((sum, alert) => sum + alert.aiConfidence, 0) / varianceAlerts.length

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
    // In real implementation, this would trigger AI analysis
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { name: "Dashboard", href: "/" },
              { name: "Analytics", href: "/analytics" },
              { name: "Variance Analysis" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-10 w-10 text-purple-600" />
              AI Variance Analysis
            </h1>
            <p className="text-gray-600 mt-2">Intelligent detection and analysis of operational variances</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button onClick={runAnalysis} disabled={isAnalyzing} className="bg-purple-600 hover:bg-purple-700">
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Variances</p>
                  <p className="text-3xl font-bold">{totalVariances}</p>
                  <p className="text-purple-200 text-xs mt-1">detected today</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Critical Issues</p>
                  <p className="text-3xl font-bold">{criticalVariances}</p>
                  <p className="text-red-200 text-xs mt-1">require attention</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Resolved</p>
                  <p className="text-3xl font-bold">{resolvedVariances}</p>
                  <p className="text-green-200 text-xs mt-1">this week</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">AI Confidence</p>
                  <p className="text-3xl font-bold">{Math.round(avgConfidence * 100)}%</p>
                  <p className="text-blue-200 text-xs mt-1">accuracy rate</p>
                </div>
                <Brain className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="inventory">Inventory</option>
                  <option value="sales">Sales</option>
                  <option value="delivery">Delivery</option>
                  <option value="quality">Quality</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Variance Alerts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Variance Alerts</span>
                </CardTitle>
                <CardDescription>AI-detected anomalies and variances requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(alert.type)}
                            <h3 className="font-semibold">{alert.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>

                          <p className="text-sm mb-3">{alert.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium">Current</p>
                              <p className="font-semibold">{alert.currentValue}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Expected</p>
                              <p className="font-semibold">{alert.expectedValue}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Variance</p>
                              <p className={`font-semibold ${alert.variance < 0 ? "text-red-600" : "text-green-600"}`}>
                                {alert.variancePercentage > 0 ? "+" : ""}
                                {alert.variancePercentage}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Confidence</p>
                              <p className="font-semibold">{Math.round(alert.aiConfidence * 100)}%</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Impact:</p>
                            <p className="text-sm">{alert.impact}</p>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">AI Recommendations:</p>
                            <ul className="text-sm space-y-1">
                              {alert.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>Detected {alert.detectedAt.toLocaleTimeString()}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Investigate
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          False Positive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Variance Trends</span>
                </CardTitle>
                <CardDescription>7-day variance detection trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.slice(-7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{trend.date}</p>
                        <p className="text-xs text-gray-600">{trend.totalVariances} variances</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">{trend.criticalVariances} critical</p>
                        <p className="text-xs text-green-600">{trend.resolvedVariances} resolved</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI Insights</span>
                </CardTitle>
                <CardDescription>Machine learning recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">Pattern Detection</h4>
                    <p className="text-sm text-blue-800">
                      Temperature variances are 40% more common on Mondays. Consider adjusting delivery schedules.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-1">Optimization</h4>
                    <p className="text-sm text-green-800">
                      Downtown Pub shows consistent return rate issues. Recommend equipment audit.
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-1">Prediction</h4>
                    <p className="text-sm text-yellow-800">
                      High probability of inventory variance in next 48 hours based on current patterns.
                    </p>
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
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Generate Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-3" />
                    Schedule Analysis
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Brain className="h-4 w-4 mr-3" />
                    Train AI Model
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Target className="h-4 w-4 mr-3" />
                    Set Alerts
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
