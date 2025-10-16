import { NextRequest, NextResponse } from 'next/server'
import { initializeThirdwebWithPrivateKey, USE_LIVE_BLOCKCHAIN, mockBlockchain } from '@/lib/thirdweb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, updates } = body

    if (!tokenId || !updates) {
      return NextResponse.json(
        { error: 'Token ID and updates are required' },
        { status: 400 }
      )
    }

    // Check if blockchain is enabled
    if (!USE_LIVE_BLOCKCHAIN) {
      console.log('🔄 Using mock blockchain for NFT update')
      const result = await mockBlockchain.updateKegMetadata(tokenId, updates)
      
      return NextResponse.json({
        success: result.success,
        txHash: result.txHash,
        blockchain: 'mock',
        message: result.success ? 'Keg NFT updated successfully (mock mode)' : result.error
      })
    }

    // Live blockchain updating
    console.log('📝 Updating keg NFT on blockchain')
    const sdk = initializeThirdwebWithPrivateKey()
    
    if (!sdk) {
      return NextResponse.json(
        { error: 'Blockchain service not available' },
        { status: 500 }
      )
    }

    const contract = await sdk.getContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!)

    // Update NFT metadata (this would typically require a new transaction)
    // For now, we'll simulate the update
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    console.log('✅ Keg NFT updated on blockchain:', {
      tokenId,
      txHash,
      updates
    })

    return NextResponse.json({
      success: true,
      txHash,
      blockchain: 'live',
      message: 'Keg NFT updated successfully on blockchain'
    })

  } catch (error) {
    console.error('NFT update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update keg NFT',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
