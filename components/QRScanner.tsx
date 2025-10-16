'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Camera } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        },
        false
      )

      scanner.render(
        (decodedText) => {
          console.log('QR Code detected:', decodedText)
          onScan(decodedText)
          scanner.clear()
          setIsScanning(false)
        },
        (error) => {
          // Don't log every scan attempt error
          if (error.includes('No QR code found')) return
          console.warn('QR scan error:', error)
        }
      )

      scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [isScanning, onScan])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
    } catch (err) {
      setError('Failed to start camera. Please check permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {!isScanning ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Click the button below to start scanning QR codes
              </p>
              <Button onClick={startScanning} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full"></div>
              <Button onClick={stopScanning} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            Position the QR code within the camera view to scan
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
