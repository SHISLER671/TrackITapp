'use client'

import { AlertTriangle, TrendingUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// Compact variance alert for lists - only export what's actually used
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