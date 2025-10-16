import { NextRequest, NextResponse } from 'next/server'
import { initializeThirdwebWithPrivateKey, generateKegNFTMetadata, USE_LIVE_BLOCKCHAIN, mockBlockchain } from '@/lib/thirdweb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keg } = body

    if (!keg || !keg.id || !keg.name) {
      return NextResponse.json(
        { error: 'Invalid keg data provided' },
        { status: 400 }
      )
    }

    // Check if blockchain is enabled
    if (!USE_LIVE_BLOCKCHAIN) {
      console.log('🔄 Using mock blockchain for keg minting')
      const result = await mockBlockchain.mintKeg(keg)
      
      return NextResponse.json({
        success: result.success,
        tokenId: result.tokenId,
        txHash: result.txHash,
        blockchain: 'mock',
        message: 'Keg NFT minted successfully (mock mode)'
      })
    }

    // Live blockchain minting
    console.log('🚀 Minting keg NFT on blockchain')
    const sdk = initializeThirdwebWithPrivateKey()
    
    if (!sdk) {
      return NextResponse.json(
        { error: 'Blockchain service not available' },
        { status: 500 }
      )
    }

    const contract = await sdk.getContract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!)
    const metadata = generateKegNFTMetadata(keg)

    // Mint the NFT
    const result = await contract.erc721.mint({
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      properties: metadata.properties
    })

    console.log('✅ Keg NFT minted on blockchain:', {
      tokenId: result.id,
      txHash: result.receipt.transactionHash,
      kegName: keg.name
    })

    return NextResponse.json({
      success: true,
      tokenId: result.id,
      txHash: result.receipt.transactionHash,
      blockchain: 'live',
      message: 'Keg NFT minted successfully on blockchain'
    })

  } catch (error) {
    console.error('NFT minting error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to mint keg NFT',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
