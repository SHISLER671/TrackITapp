'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: '🟢'
        }
      case 'delivered':
        return {
          label: 'Delivered',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📦'
        }
      case 'returned':
        return {
          label: 'Returned',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🔄'
        }
      case 'retired':
        return {
          label: 'Retired',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '♻️'
        }
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳'
        }
      case 'in_transit':
        return {
          label: 'In Transit',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🚛'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌'
        }
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📋'
        }
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-4 py-2 text-base font-semibold'
      default:
        return 'px-3 py-1.5 text-sm font-medium'
    }
  }

  const config = getStatusConfig(status)
  const sizeClasses = getSizeClasses(size)

  return (
    <Badge 
      className={cn(
        'inline-flex items-center space-x-1.5 border-2',
        config.className,
        sizeClasses,
        className
      )}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  )
}
