'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { BlockchainStatus } from '@/components/BlockchainStatus'
import { VarianceAlertCompact } from '@/components/VarianceAlert'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { 
  Package, 
  MapPin, 
  Calendar, 
  Zap, 
  Eye, 
  QrCode,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface KegCardProps {
  keg: {
    id: string
    name: string
    type: string
    size: string
    abv?: number
    status: string
    qr_code: string
    created_at: string
    current_holder?: string
    nft_token_id?: string
    nft_tx_hash?: string
    blockchain_status?: string
    fill_level?: number
    variance_percent?: number
    variance_severity?: 'normal' | 'warning' | 'critical'
  }
  showProgress?: boolean
  showBlockchain?: boolean
  showVariance?: boolean
  onViewDetails?: (keg: any) => void
  onScan?: (keg: any) => void
  onViewQR?: (keg: any) => void
  className?: string
}

export function KegCard({
  keg,
  showProgress = true,
  showBlockchain = true,
  showVariance = false,
  onViewDetails,
  onScan,
  onViewQR,
  className
}: KegCardProps) {
  const [showQRModal, setShowQRModal] = useState(false)

  const getKegSizeInfo = (size: string) => {
    switch (size.toLowerCase()) {
      case 'quarter':
        return { label: 'Quarter Barrel', capacity: 7.75, pints: 62 }
      case 'half':
        return { label: 'Half Barrel', capacity: 15.5, pints: 124 }
      case 'sixth':
        return { label: 'Sixth Barrel', capacity: 5.17, pints: 41 }
      case 'tenth':
        return { label: 'Tenth Barrel', capacity: 3.1, pints: 25 }
      default:
        return { label: size, capacity: 15.5, pints: 124 }
    }
  }

  const sizeInfo = getKegSizeInfo(keg.size)
  const fillLevel = keg.fill_level || 75 // Default fill level
  const hasVariance = showVariance && keg.variance_severity && keg.variance_severity !== 'normal'

  return (
    <>
      <Card className={cn(
        'transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group',
        hasVariance && 'ring-2 ring-yellow-200',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-800 truncate">
                {keg.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">{keg.type}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">{sizeInfo.label}</span>
              </div>
            </div>
            <StatusBadge status={keg.status} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">ABV</span>
              </div>
              <p className="text-lg font-bold text-gray-800 mt-1">
                {keg.abv ? `${keg.abv}%` : 'N/A'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Created</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {new Date(keg.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Fill Level Progress */}
          {showProgress && (
            <div>
              <ProgressBar
                value={fillLevel}
                max={100}
                size="md"
                label="Fill Level"
                showLabel={true}
                color="default"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                ~{Math.round((fillLevel / 100) * sizeInfo.pints)} pints remaining
              </p>
            </div>
          )}

          {/* Variance Alert */}
          {showVariance && hasVariance && (
            <VarianceAlertCompact
              kegName={keg.name}
              variancePercent={keg.variance_percent || 0}
              severity={keg.variance_severity || 'normal'}
              onClick={() => onViewDetails?.(keg)}
            />
          )}

          {/* Blockchain Status */}
          {showBlockchain && (
            <div className="border-t pt-3">
              <BlockchainStatus 
                keg={keg} 
                className="!shadow-none !border-0 !p-0"
              />
            </div>
          )}

          {/* QR Code Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">QR Code</span>
              </div>
              <span className="font-mono text-xs text-blue-600">
                {keg.qr_code.slice(-8)}...
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(keg)}
              className="flex items-center justify-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Details</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRModal(true)}
              className="flex items-center justify-center space-x-2"
            >
              <QrCode className="h-4 w-4" />
              <span>QR Code</span>
            </Button>
          </div>

          {/* Scan Button (if onScan provided) */}
          {onScan && (
            <Button
              onClick={() => onScan(keg)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Scan Keg
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{keg.name} - QR Code</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay
                value={keg.qr_code}
                title={`${keg.name} QR Code`}
                size={200}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Compact keg card for lists
export function KegCardCompact({
  keg,
  onClick,
  className
}: {
  keg: any
  onClick?: (keg: any) => void
  className?: string
}) {
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50',
        className
      )}
      onClick={() => onClick?.(keg)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{keg.name}</h3>
            <p className="text-sm text-gray-600">{keg.type} • {keg.size}</p>
          </div>
          <StatusBadge status={keg.status} size="sm" />
        </div>
      </CardContent>
    </Card>
  )
}
