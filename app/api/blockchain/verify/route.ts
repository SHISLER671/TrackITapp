import { NextRequest, NextResponse } from 'next/server'
import { initializeThirdweb, USE_LIVE_BLOCKCHAIN, mockBlockchain } from '@/lib/thirdweb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    const qrCode = searchParams.get('qrCode')

    if (!tokenId && !qrCode) {
      return NextResponse.json(
        { error: 'Token ID or QR code is required' },
        { status: 400 }
      )
    }

    // Check if blockchain is enabled
    if (!USE_LIVE_BLOCKCHAIN) {
      console.log('🔄 Using mock blockchain for NFT verification')
      
      let nftData = null
      if (tokenId) {
        nftData = await mockBlockchain.getKegNFT(tokenId)
      } else if (qrCode) {
        // In mock mode, we'd need to search by QR code
        // For now, we'll return a mock response
        nftData = {
          tokenId: 'mock-token-123',
          metadata: {
            properties: {
              qr_code: qrCode,
              keg_id: 'mock-keg-456',
              beer_style: 'IPA',
              abv: 6.5,
              status: 'ACTIVE'
            }
          }
        }
      }

      return NextResponse.json({
        success: !!nftData,
        nft: nftData,
        blockchain: 'mock',
        message: nftData ? 'NFT verified successfully (mock mode)' : 'NFT not found'
      })
    }

    // Live blockchain verification
    console.log('🔍 Verifying NFT on blockchain')
    const sdk = initializeThirdweb()
    
    if (!sdk) {
      return NextResponse.json(
        { error: 'Blockchain service not available' },
        { status: 500 }
      )
    }

    const contract = await sdk.getContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!)

    // Get NFT metadata
    const metadata = await contract.erc721.get(tokenId!)

    console.log('✅ NFT verified on blockchain:', {
      tokenId,
      name: metadata.metadata.name
    })

    return NextResponse.json({
      success: true,
      nft: {
        tokenId,
        metadata: metadata.metadata
      },
      blockchain: 'live',
      message: 'NFT verified successfully on blockchain'
    })

  } catch (error) {
    console.error('NFT verification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to verify NFT',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
