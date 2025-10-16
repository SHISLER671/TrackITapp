'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingUp, TrendingDown, Info, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VarianceAlertProps {
  kegName: string
  expectedPints: number
  actualPints: number
  variance: number
  variancePercent: number
  severity: 'normal' | 'warning' | 'critical'
  onInvestigate?: () => void
  onDismiss?: () => void
  className?: string
}

export function VarianceAlert({
  kegName,
  expectedPints,
  actualPints,
  variance,
  variancePercent,
  severity,
  onInvestigate,
  onDismiss,
  className
}: VarianceAlertProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          badgeColor: 'bg-red-100 text-red-800 border-red-300',
          title: 'Critical Variance',
          description: 'Immediate investigation required'
        }
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: TrendingUp,
          badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          title: 'Variance Warning',
          description: 'Review recommended'
        }
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Info,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          title: 'Variance Detected',
          description: 'Within acceptable range'
        }
    }
  }

  const config = getSeverityConfig(severity)
  const Icon = config.icon
  const isPositiveVariance = variance > 0

  return (
    <Card className={cn(
      'border-2 transition-all duration-200 hover:shadow-md',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={cn('h-5 w-5', config.iconColor)} />
            <div>
              <CardTitle className={cn('text-lg', config.textColor)}>
                {config.title}
              </CardTitle>
              <p className={cn('text-sm', config.textColor)}>
                {config.description}
              </p>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Keg Info */}
        <div className="bg-white/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">{kegName}</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Expected Pints:</span>
              <p className="font-mono font-semibold text-gray-800">
                {expectedPints}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Actual Pints:</span>
              <p className="font-mono font-semibold text-gray-800">
                {actualPints}
              </p>
            </div>
          </div>
        </div>

        {/* Variance Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPositiveVariance ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-700">
              Variance: {Math.abs(variance)} pints
            </span>
          </div>
          
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-semibold border',
            config.badgeColor
          )}>
            {Math.abs(variancePercent).toFixed(1)}%
          </span>
        </div>

        {/* Possible Causes */}
        <div className="bg-white/50 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-2">Possible Causes:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Foam/spillage during pouring</li>
            <li>• Tap line cleaning waste</li>
            <li>• Staff training issues</li>
            <li>• POS tracking errors</li>
            <li>• Temperature fluctuations</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {onInvestigate && (
            <Button
              onClick={onInvestigate}
              className={cn(
                'flex-1',
                severity === 'critical' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : severity === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              <Zap className="h-4 w-4 mr-2" />
              {severity === 'critical' ? 'Investigate Now' : 'Review Variance'}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.open('/reports', '_blank')}
            className="flex-1"
          >
            View Reports
          </Button>
        </div>

        {/* AI Recommendation */}
        {severity !== 'normal' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  AI Recommendation:
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {severity === 'critical' 
                    ? 'Immediate action required. Check pour techniques and ensure all drinks are logged in POS system.'
                    : 'Review pouring procedures and consider staff training on proper techniques.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact variance alert for lists
export function VarianceAlertCompact({
  kegName,
  variancePercent,
  severity,
  onClick,
  className
}: {
  kegName: string
  variancePercent: number
  severity: 'normal' | 'warning' | 'critical'
  onClick?: () => void
  className?: string
}) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          icon: AlertTriangle
        }
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          icon: TrendingUp
        }
      default:
        return {
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          icon: Info
        }
    }
  }

  const config = getSeverityConfig(severity)
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', config.textColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', config.textColor)}>
          {kegName}
        </p>
        <p className={cn('text-xs', config.textColor)}>
          {Math.abs(variancePercent).toFixed(1)}% variance
        </p>
      </div>
    </div>
  )
}
