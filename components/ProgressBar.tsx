'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  color?: 'default' | 'green' | 'yellow' | 'red' | 'blue'
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md', 
  showLabel = true, 
  label,
  color = 'default',
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-2',
          text: 'text-xs'
        }
      case 'lg':
        return {
          container: 'h-6',
          text: 'text-base font-semibold'
        }
      default:
        return {
          container: 'h-4',
          text: 'text-sm font-medium'
        }
    }
  }

  const getColorClasses = (color: string, percentage: number) => {
    // Auto-color based on percentage if default
    if (color === 'default') {
      if (percentage >= 80) return 'bg-red-500'
      if (percentage >= 60) return 'bg-yellow-500'
      if (percentage >= 30) return 'bg-blue-500'
      return 'bg-green-500'
    }

    switch (color) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      case 'blue':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const sizeClasses = getSizeClasses(size)
  const colorClasses = getColorClasses(color, percentage)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={cn('text-gray-700', sizeClasses.text)}>
            {label || 'Progress'}
          </span>
          <span className={cn('text-gray-600 font-mono', sizeClasses.text)}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses.container
      )}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            colorClasses
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {value} / {max}
          </span>
          <span className="text-xs text-gray-500">
            {percentage < 20 ? 'Almost Empty' :
             percentage < 40 ? 'Low' :
             percentage < 60 ? 'Half Full' :
             percentage < 80 ? 'Good' : 'Almost Full'}
          </span>
        </div>
      )}
    </div>
  )
}
