'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QRScannerEnhanced } from '@/components/QRScannerEnhanced'
import { Breadcrumb } from '@/components/NavBar'
import { KegCard } from '@/components/KegCard'
import { 
  QrCode, 
  Camera, 
  Package, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  History,
  BarChart3,
  TrendingUp
} from 'lucide-react'

interface ScanResult {
  id: string
  qrCode: string
  kegData?: any
  timestamp: Date
  location?: string
  success: boolean
  error?: string
}

export default function ScanPage() {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [currentKeg, setCurrentKeg] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load scan history from localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('scanHistory')
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults)
        setScanResults(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })))
      } catch (err) {
        console.error('Error loading scan history:', err)
      }
    }
  }, [])

  // Save scan history to localStorage
  const saveScanHistory = (results: ScanResult[]) => {
    localStorage.setItem('scanHistory', JSON.stringify(results))
  }

  // Handle QR code scan
  const handleScan = async (qrCode: string) => {
    setLoading(true)
    setError(null)
    setShowScanner(false)

    try {
      // Extract keg ID from QR code (assuming format: keg-{uuid})
      const kegId = qrCode.replace('keg-', '')
      
      // Fetch keg details from API
      const response = await fetch(`/api/kegs/${kegId}`)
      const result = await response.json()
      
      let scanResult: ScanResult

      if (result.error) {
        // Keg not found
        scanResult = {
          id: Date.now().toString(),
          qrCode,
          timestamp: new Date(),
          success: false,
          error: `Keg not found: ${qrCode}`
        }
      } else {
        // Keg found
        const kegData = result.data
        setCurrentKeg(kegData)
        
        scanResult = {
          id: Date.now().toString(),
          qrCode,
          kegData,
          timestamp: new Date(),
          location: 'Brewery Warehouse', // This could be determined by GPS or user input
          success: true
        }

        // Record the scan in the database
        try {
          await fetch('/api/kegs/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              kegId: kegData.id,
              location: 'Brewery Warehouse',
              scannedBy: 'current-user-id' // This should come from auth context
            })
          })
        } catch (err) {
          console.error('Error recording scan:', err)
        }
      }

      // Add to scan results
      const newResults = [scanResult, ...scanResults.slice(0, 49)] // Keep last 50 scans
      setScanResults(newResults)
      saveScanHistory(newResults)

    } catch (err) {
      setError('Failed to process scan result')
      console.error('Scan processing error:', err)
      
      const errorResult: ScanResult = {
        id: Date.now().toString(),
        qrCode,
        timestamp: new Date(),
        success: false,
        error: 'Network error'
      }
      
      const newResults = [errorResult, ...scanResults.slice(0, 49)]
      setScanResults(newResults)
      saveScanHistory(newResults)
    } finally {
      setLoading(false)
    }
  }

  // Get scan statistics
  const getScanStats = () => {
    const totalScans = scanResults.length
    const successfulScans = scanResults.filter(r => r.success).length
    const failedScans = totalScans - successfulScans
    const todayScans = scanResults.filter(r => {
      const today = new Date()
      const scanDate = r.timestamp
      return scanDate.toDateString() === today.toDateString()
    }).length

    return { totalScans, successfulScans, failedScans, todayScans }
  }

  const stats = getScanStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'Dashboard', href: '/' },
              { name: 'Scan QR Codes' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <QrCode className="h-10 w-10 text-blue-600" />
              QR Code Scanner
            </h1>
            <p className="text-gray-600 mt-2">Scan keg QR codes to track inventory and deliveries</p>
          </div>
          <Button 
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Start Scanning
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Scans</p>
                  <p className="text-3xl font-bold">{stats.totalScans}</p>
                  <p className="text-blue-200 text-xs mt-1">all time</p>
                </div>
                <QrCode className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Successful</p>
                  <p className="text-3xl font-bold">{stats.successfulScans}</p>
                  <p className="text-green-200 text-xs mt-1">{stats.totalScans > 0 ? Math.round((stats.successfulScans / stats.totalScans) * 100) : 0}% success rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Today's Scans</p>
                  <p className="text-3xl font-bold">{stats.todayScans}</p>
                  <p className="text-orange-200 text-xs mt-1">scans today</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Failed Scans</p>
                  <p className="text-3xl font-bold">{stats.failedScans}</p>
                  <p className="text-purple-200 text-xs mt-1">need attention</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Keg Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Current Keg</span>
                </CardTitle>
                <CardDescription>
                  {currentKeg ? 'Last scanned keg details' : 'No keg scanned yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Processing scan...</p>
                    </div>
                  </div>
                ) : currentKeg ? (
                  <KegCard
                    keg={currentKeg}
                    showProgress={true}
                    showBlockchain={true}
                    showVariance={false}
                    onViewDetails={() => router.push(`/kegs/${currentKeg.id}`)}
                    className="max-w-md mx-auto"
                  />
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Keg Scanned</h3>
                    <p className="text-gray-600 mb-4">Scan a keg QR code to view its details here</p>
                    <Button onClick={() => setShowScanner(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scan History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-green-600" />
                  <span>Recent Scans</span>
                </CardTitle>
                <CardDescription>
                  Last {Math.min(scanResults.length, 10)} scan results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanResults.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No scans yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scanResults.slice(0, 10).map((result) => (
                      <div key={result.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-mono text-sm text-gray-900 truncate">
                                {result.qrCode}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {result.timestamp.toLocaleString()}
                            </p>
                            {result.location && (
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {result.location}
                              </p>
                            )}
                            {result.error && (
                              <p className="text-xs text-red-600 mt-1">{result.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common scanning operations and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => setShowScanner(true)}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-6 w-6" />
                <span>Scan QR Code</span>
              </Button>
              <Button 
                onClick={() => router.push('/kegs')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Package className="h-6 w-6" />
                <span>View All Kegs</span>
              </Button>
              <Button 
                onClick={() => router.push('/deliveries')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <MapPin className="h-6 w-6" />
                <span>Deliveries</span>
              </Button>
              <Button 
                onClick={() => router.push('/reports')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced QR Scanner Modal */}
        {showScanner && (
          <QRScannerEnhanced
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
            title="Scan Keg QR Code"
            description="Point your camera at a keg QR code to scan and track"
            autoStart={true}
            showHistory={true}
          />
        )}
      </div>
    </div>
  )
}
