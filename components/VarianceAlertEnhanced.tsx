'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Lightbulb,
  CheckCircle,
  X,
  Clock,
  Target,
  BarChart3,
  Eye,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react'

interface VarianceAlertProps {
  variance: {
    id: string
    type: 'inventory' | 'sales' | 'delivery' | 'quality' | 'cost'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    currentValue: number
    expectedValue: number
    variance: number
    variancePercentage: number
    impact: string
    recommendations: string[]
    detectedAt: Date
    status: 'new' | 'investigating' | 'resolved' | 'false_positive'
    kegId?: string
    restaurantId?: string
    aiConfidence: number
  }
  onStatusChange?: (id: string, status: string) => void
  onInvestigate?: (id: string) => void
  onResolve?: (id: string) => void
  onMarkFalsePositive?: (id: string) => void
  compact?: boolean
}

export default function VarianceAlertEnhanced({ 
  variance, 
  onStatusChange,
  onInvestigate,
  onResolve,
  onMarkFalsePositive,
  compact = false
}: VarianceAlertProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [isLoading, setIsLoading] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <BarChart3 className="h-4 w-4" />
      case 'sales': return <TrendingUp className="h-4 w-4" />
      case 'delivery': return <Target className="h-4 w-4" />
      case 'quality': return <CheckCircle className="h-4 w-4" />
      case 'cost': return <TrendingDown className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'investigating': return 'text-orange-600 bg-orange-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'false_positive': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getVarianceIcon = () => {
    if (variance.variance > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (variance.variance < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    } else {
      return <Target className="h-4 w-4 text-blue-500" />
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await onStatusChange?.(variance.id, newStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvestigate = async () => {
    setIsLoading(true)
    try {
      await onInvestigate?.(variance.id)
      await handleStatusChange('investigating')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async () => {
    setIsLoading(true)
    try {
      await onResolve?.(variance.id)
      await handleStatusChange('resolved')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkFalsePositive = async () => {
    setIsLoading(true)
    try {
      await onMarkFalsePositive?.(variance.id)
      await handleStatusChange('false_positive')
    } finally {
      setIsLoading(false)
    }
  }

  if (compact) {
    return (
      <div className={`border rounded-lg p-3 ${getSeverityColor(variance.severity)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(variance.type)}
            <span className="font-medium text-sm">{variance.title}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(variance.severity)}`}>
              {variance.severity}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {variance.variancePercentage > 0 ? '+' : ''}{variance.variancePercentage.toFixed(1)}%
            </span>
            {getVarianceIcon()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`border-l-4 ${getSeverityColor(variance.severity).split(' ')[2]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(variance.type)}
              <CardTitle className="text-lg">{variance.title}</CardTitle>
              <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(variance.severity)}`}>
                {variance.severity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(variance.status)}`}>
                {variance.status.replace('_', ' ')}
              </span>
            </div>
            <CardDescription>{variance.description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Variance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Current</p>
              <p className="text-lg font-bold">{variance.currentValue}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Expected</p>
              <p className="text-lg font-bold">{variance.expectedValue}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Variance</p>
              <div className="flex items-center justify-center gap-1">
                {getVarianceIcon()}
                <p className={`text-lg font-bold ${variance.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variance.variancePercentage > 0 ? '+' : ''}{variance.variancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">AI Confidence</p>
              <div className="flex items-center justify-center gap-1">
                <Brain className="h-4 w-4 text-purple-500" />
                <p className="text-lg font-bold">{Math.round(variance.aiConfidence * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Impact Assessment
            </h4>
            <p className="text-sm text-gray-700">{variance.impact}</p>
          </div>

          {/* AI Recommendations */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              AI Recommendations
            </h4>
            <ul className="space-y-1">
              {variance.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Detected {variance.detectedAt.toLocaleTimeString()}
              </span>
              {variance.kegId && (
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Keg: {variance.kegId}
                </span>
              )}
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              ID: {variance.id}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={handleInvestigate}
              disabled={isLoading || variance.status === 'investigating'}
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Eye className="h-3 w-3 mr-1" />
              )}
              Investigate
            </Button>
            
            <Button
              size="sm"
              onClick={handleResolve}
              disabled={isLoading || variance.status === 'resolved'}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Resolve
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkFalsePositive}
              disabled={isLoading || variance.status === 'false_positive'}
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              False Positive
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
