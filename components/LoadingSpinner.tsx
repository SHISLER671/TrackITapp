'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'default' | 'blue' | 'green' | 'white'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'default', 
  text,
  className 
}: LoadingSpinnerProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-8 w-8'
      case 'xl':
        return 'h-12 w-12'
      default:
        return 'h-6 w-6'
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-600'
      case 'green':
        return 'border-green-600'
      case 'white':
        return 'border-white'
      default:
        return 'border-gray-600'
    }
  }

  const sizeClasses = getSizeClasses(size)
  const colorClasses = getColorClasses(color)

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
          sizeClasses,
          colorClasses
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      
      {text && (
        <p className={cn(
          'text-gray-600 font-medium',
          size === 'sm' ? 'text-sm' :
          size === 'lg' ? 'text-lg' :
          size === 'xl' ? 'text-xl' : 'text-base'
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

// Inline spinner for buttons
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-solid border-current border-r-transparent h-4 w-4',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Page-level loading spinner
export function PageSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}
