'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showRetry?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({
  title,
  message,
  type = 'error',
  size = 'md',
  showIcon = true,
  showRetry = false,
  onRetry,
  onDismiss,
  className
}: ErrorMessageProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertTriangle
        }
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: AlertCircle
        }
      default:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle
        }
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          title: 'text-sm font-medium',
          message: 'text-xs',
          icon: 'h-4 w-4'
        }
      case 'lg':
        return {
          container: 'p-6',
          title: 'text-lg font-semibold',
          message: 'text-base',
          icon: 'h-6 w-6'
        }
      default:
        return {
          container: 'p-4',
          title: 'text-base font-semibold',
          message: 'text-sm',
          icon: 'h-5 w-5'
        }
    }
  }

  const config = getTypeConfig(type)
  const sizeClasses = getSizeClasses(size)
  const Icon = config.icon

  return (
    <Card className={cn(
      'border-2',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardContent className={cn(sizeClasses.container, 'relative')}>
        {/* Dismiss Button */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-start space-x-3">
          {/* Icon */}
          {showIcon && (
            <Icon className={cn(
              'flex-shrink-0 mt-0.5',
              sizeClasses.icon,
              config.iconColor
            )} />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={cn(
                sizeClasses.title,
                config.textColor,
                'mb-2'
              )}>
                {title}
              </h3>
            )}
            
            <p className={cn(
              sizeClasses.message,
              config.textColor,
              'leading-relaxed'
            )}>
              {message}
            </p>

            {/* Retry Button */}
            {showRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple inline error message
export function InlineError({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={cn(
      'flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200',
      className
    )}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

// Success message variant
export function SuccessMessage({ 
  title, 
  message, 
  onDismiss,
  className 
}: { 
  title?: string
  message: string
  onDismiss?: () => void
  className?: string 
}) {
  return (
    <ErrorMessage
      title={title}
      message={message}
      type="info"
      className={cn(
        'bg-green-50 border-green-200',
        className
      )}
      onDismiss={onDismiss}
    />
  )
}
