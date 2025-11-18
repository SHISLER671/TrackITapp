'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Shield, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

interface BlockchainStatusProps {
  keg: {
    id: string
    name: string
    nft_token_id?: string
    nft_tx_hash?: string
    blockchain_status?: string
    qr_code: string
  }
  className?: string
}

export function BlockchainStatus({ keg, className }: BlockchainStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const getStatusInfo = () => {
    switch (keg.blockchain_status) {
      case 'MINTED':
        return {
          status: 'Minted',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          description: 'NFT successfully minted on blockchain'
        }
      case 'PENDING':
        return {
          status: 'Pending',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          description: 'NFT minting in progress'
        }
      case 'FAILED':
        return {
          status: 'Failed',
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          description: 'NFT minting failed'
        }
      default:
        return {
          status: 'Not Minted',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
          description: 'NFT not yet minted'
        }
    }
  }

  const verifyNFT = async () => {
    if (!keg.nft_token_id) return

    setIsVerifying(true)
    try {
      const response = await fetch(`/api/blockchain/verify?tokenId=${keg.nft_token_id}`)
      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyByQR = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/blockchain/verify?qrCode=${keg.qr_code}`)
      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      console.error('QR verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Blockchain Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4" />
            <Badge className={statusInfo.color}>
              {statusInfo.status}
            </Badge>
          </div>
          {keg.nft_token_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={verifyNFT}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Verify NFT
                </>
              )}
            </Button>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {statusInfo.description}
        </p>

        {/* NFT Details */}
        {keg.nft_token_id && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Token ID:</span>
                <p className="font-mono text-xs text-gray-600">
                  {keg.nft_token_id}
                </p>
              </div>
              <div>
                <span className="font-medium">QR Code:</span>
                <p className="font-mono text-xs text-gray-600">
                  {keg.qr_code.slice(-8)}...
                </p>
              </div>
            </div>

            {/* Transaction Hash */}
            {keg.nft_tx_hash && (
              <div>
                <span className="font-medium text-sm">Transaction Hash:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="font-mono text-xs text-gray-600 flex-1">
                    {keg.nft_tx_hash}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://basescan.org/tx/${keg.nft_tx_hash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`p-3 rounded-lg ${
            verificationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {verificationResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                verificationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {verificationResult.success ? 'Verified' : 'Verification Failed'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              verificationResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {verificationResult.message}
            </p>
            {verificationResult.blockchain && (
              <p className="text-xs text-gray-500 mt-1">
                Mode: {verificationResult.blockchain}
              </p>
            )}
          </div>
        )}

        {/* QR Verification Button */}
        {!keg.nft_token_id && (
          <Button
            variant="outline"
            onClick={verifyByQR}
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verifying by QR...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Verify by QR Code
              </>
            )}
          </Button>
        )}

        {/* Blockchain Benefits */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            🔒 Blockchain Benefits
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Immutable keg ownership records</li>
            <li>• Tamper-proof tracking history</li>
            <li>• Eliminates human error in keg management</li>
            <li>• Transparent supply chain visibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
