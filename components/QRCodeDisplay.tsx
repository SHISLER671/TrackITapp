'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, ExternalLink } from 'lucide-react'

interface QRCodeDisplayProps {
  value: string
  title?: string
}

export function QRCodeDisplay({ value, title = 'QR Code' }: QRCodeDisplayProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Generate QR code using a simple online service (no dependencies)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="border rounded-lg"
            onError={(e) => {
              // Fallback if QR service is down
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <div className="hidden text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-600 mb-2">QR Code Preview</p>
            <p className="text-xs text-gray-500 break-all">{value}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 break-all">
            {value}
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button
              onClick={() => window.open(qrCodeUrl, '_blank')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
