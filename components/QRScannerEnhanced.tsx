'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  X, 
  RotateCcw, 
  Flashlight,
  FlashlightOff,
  CheckCircle,
  AlertCircle,
  History,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QRScannerEnhancedProps {
  onScan: (result: string) => void
  onClose: () => void
  title?: string
  description?: string
  className?: string
  autoStart?: boolean
  showHistory?: boolean
  maxHistory?: number
}

interface ScanHistoryItem {
  id: string
  result: string
  timestamp: Date
  success: boolean
}

export function QRScannerEnhanced({
  onScan,
  onClose,
  title = "Scan QR Code",
  description = "Point your camera at a QR code to scan",
  className,
  autoStart = true,
  showHistory = true,
  maxHistory = 10
}: QRScannerEnhancedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<string>('environment')
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [lastScanResult, setLastScanResult] = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState(false)

  // Initialize cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind === 'videoinput')
        setAvailableCameras(cameras)
      } catch (err) {
        console.error('Error getting cameras:', err)
      }
    }
    
    getCameras()
  }, [])

  // Start scanning
  const startScanning = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: selectedCamera === 'environment' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
      console.error('Camera error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Stop scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      if (track && 'getCapabilities' in track) {
        const capabilities = track.getCapabilities()
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any]
          })
          setFlashlightOn(!flashlightOn)
        }
      }
    } catch (err) {
      console.error('Flashlight toggle error:', err)
    }
  }

  // Switch camera
  const switchCamera = async () => {
    stopScanning()
    setSelectedCamera(prev => prev === 'environment' ? 'user' : 'environment')
    setTimeout(() => startScanning(), 100)
  }

  // QR Code detection (simplified - in real app, use a QR library)
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // This is a simplified QR detection - in production, use a proper QR library
    // For demo purposes, we'll simulate detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple pattern detection (this is just for demo)
    // In reality, you'd use a library like @zxing/library or html5-qrcode
    if (Math.random() > 0.95) { // Simulate occasional detection
      const mockResult = `keg-${Date.now()}`
      handleScanResult(mockResult)
    }
  }

  // Handle scan result
  const handleScanResult = (result: string) => {
    setLastScanResult(result)
    setScanSuccess(true)
    
    // Add to history
    const historyItem: ScanHistoryItem = {
      id: Date.now().toString(),
      result,
      timestamp: new Date(),
      success: true
    }
    
    setScanHistory(prev => [historyItem, ...prev.slice(0, maxHistory - 1)])
    
    // Call the onScan callback
    onScan(result)
    
    // Auto-close after success (optional)
    setTimeout(() => {
      setScanSuccess(false)
    }, 2000)
  }

  // Manual QR code input
  const handleManualInput = () => {
    const input = prompt('Enter QR code manually:')
    if (input && input.trim()) {
      handleScanResult(input.trim())
    }
  }

  // Start scanning on mount if autoStart is true
  useEffect(() => {
    if (autoStart) {
      startScanning()
    }
    
    return () => {
      stopScanning()
    }
  }, [selectedCamera])

  // Scan loop
  useEffect(() => {
    let scanInterval: NodeJS.Timeout | null = null
    
    if (isScanning) {
      scanInterval = setInterval(detectQRCode, 100)
    }
    
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval)
      }
    }
  }, [isScanning])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className={cn("w-full max-w-2xl max-h-[90vh] overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Scanner View */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="aspect-video relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <LoadingSpinner text="Initializing camera..." />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <ErrorMessage 
                    message={error}
                    onRetry={startScanning}
                    retryText="Try Again"
                  />
                </div>
              )}

              {!isLoading && !error && (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Scan overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner brackets */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    </div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-1 bg-blue-500 opacity-75 animate-pulse"></div>
                  </div>

                  {/* Success overlay */}
                  {scanSuccess && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-green-500 text-white p-4 rounded-full">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Hidden canvas for QR detection */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!isScanning && !isLoading && (
              <Button onClick={startScanning} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            )}

            {isScanning && (
              <>
                <Button onClick={stopScanning} variant="outline">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                
                {availableCameras.length > 1 && (
                  <Button onClick={switchCamera} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Switch Camera
                  </Button>
                )}
                
                <Button onClick={toggleFlashlight} variant="outline">
                  {flashlightOn ? <FlashlightOff className="h-4 w-4 mr-2" /> : <Flashlight className="h-4 w-4 mr-2" />}
                  {flashlightOn ? 'Flash Off' : 'Flash On'}
                </Button>
              </>
            )}

            <Button onClick={handleManualInput} variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Manual Input
            </Button>
          </div>

          {/* Last Scan Result */}
          {lastScanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Scan Successful!</span>
              </div>
              <p className="text-sm text-green-700 font-mono">{lastScanResult}</p>
            </div>
          )}

          {/* Scan History */}
          {showHistory && scanHistory.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <History className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Recent Scans</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {scanHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="font-mono text-gray-700">{item.result}</span>
                    <span className="text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
