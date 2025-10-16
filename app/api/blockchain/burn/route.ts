import { NextRequest, NextResponse } from 'next/server'
import { initializeThirdwebWithPrivateKey, USE_LIVE_BLOCKCHAIN, mockBlockchain } from '@/lib/thirdweb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId } = body

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      )
    }

    // Check if blockchain is enabled
    if (!USE_LIVE_BLOCKCHAIN) {
      console.log('🔄 Using mock blockchain for keg burning')
      const result = await mockBlockchain.burnKeg(tokenId)
      
      return NextResponse.json({
        success: result.success,
        txHash: result.txHash,
        blockchain: 'mock',
        message: result.success ? 'Keg NFT burned successfully (mock mode)' : result.error
      })
    }

    // Live blockchain burning
    console.log('🔥 Burning keg NFT on blockchain')
    const sdk = initializeThirdwebWithPrivateKey()
    
    if (!sdk) {
      return NextResponse.json(
        { error: 'Blockchain service not available' },
        { status: 500 }
      )
    }

    const contract = await sdk.getContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!)

    // Burn the NFT
    const result = await contract.erc721.burn(tokenId)

    console.log('✅ Keg NFT burned on blockchain:', {
      tokenId,
      txHash: result.receipt.transactionHash
    })

    return NextResponse.json({
      success: true,
      txHash: result.receipt.transactionHash,
      blockchain: 'live',
      message: 'Keg NFT burned successfully on blockchain'
    })

  } catch (error) {
    console.error('NFT burning error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to burn keg NFT',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
