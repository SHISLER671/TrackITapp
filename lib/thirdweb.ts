import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { Base } from '@thirdweb-dev/chains'
import { JsonRpcProvider, Wallet } from 'ethers'

// NFT Contract Configuration
export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''
export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ''
export const PRIVATE_KEY = process.env.THIRDWEB_PRIVATE_KEY || ''

// Feature flag for blockchain integration
export const USE_LIVE_BLOCKCHAIN = process.env.USE_LIVE_BLOCKCHAIN === 'true'

// Initialize Thirdweb SDK
export function initializeThirdweb() {
  if (!THIRDWEB_CLIENT_ID) {
    console.warn('Thirdweb client ID not found. Blockchain features will be mocked.')
    return null
  }

  try {
    const sdk = new ThirdwebSDK(Base, {
      clientId: THIRDWEB_CLIENT_ID,
    })

    return sdk
  } catch (error) {
    console.error('Failed to initialize Thirdweb SDK:', error)
    return null
  }
}

// Initialize with private key for server-side operations
export function initializeThirdwebWithPrivateKey() {
  if (!PRIVATE_KEY || !THIRDWEB_CLIENT_ID) {
    console.warn('Private key or client ID not found. Server-side blockchain operations will be mocked.')
    return null
  }

  try {
    const provider = new JsonRpcProvider('https://mainnet.base.org')
    const wallet = new Wallet(PRIVATE_KEY, provider)
    
    const sdk = new ThirdwebSDK(wallet, {
      clientId: THIRDWEB_CLIENT_ID,
    })

    return sdk
  } catch (error) {
    console.error('Failed to initialize Thirdweb SDK with private key:', error)
    return null
  }
}

// NFT Metadata Interface
export interface KegNFTMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
  properties: {
    keg_id: string
    brewery_id: string
    beer_style: string
    abv: number
    keg_size: string
    brew_date: string
    qr_code: string
    status: string
    current_holder: string
  }
}

// Generate NFT metadata for a keg
export function generateKegNFTMetadata(keg: any): KegNFTMetadata {
  return {
    name: `Keg #${keg.name}`,
    description: `${keg.type} beer keg - ${keg.keg_size} - ${keg.abv}% ABV. Immutable blockchain record for tracking and verification.`,
    image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${keg.qr_code}`,
    attributes: [
      {
        trait_type: 'Beer Style',
        value: keg.type
      },
      {
        trait_type: 'ABV',
        value: keg.abv
      },
      {
        trait_type: 'Keg Size',
        value: keg.keg_size
      },
      {
        trait_type: 'Status',
        value: keg.status
      },
      {
        trait_type: 'Brewery',
        value: keg.brewery_id
      }
    ],
    properties: {
      keg_id: keg.id,
      brewery_id: keg.brewery_id,
      beer_style: keg.type,
      abv: keg.abv,
      keg_size: keg.keg_size,
      brew_date: new Date().toISOString(),
      qr_code: keg.qr_code,
      status: keg.status,
      current_holder: keg.current_holder
    }
  }
}

// Mock blockchain operations for development
export class MockBlockchainService {
  private static instance: MockBlockchainService
  private mintedTokens: Map<string, any> = new Map()

  static getInstance(): MockBlockchainService {
    if (!MockBlockchainService.instance) {
      MockBlockchainService.instance = new MockBlockchainService()
    }
    return MockBlockchainService.instance
  }

  async mintKeg(keg: any): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const tokenId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    const nftMetadata = generateKegNFTMetadata(keg)
    
    this.mintedTokens.set(tokenId, {
      tokenId,
      txHash,
      metadata: nftMetadata,
      keg: keg,
      mintedAt: new Date().toISOString()
    })

    console.log('🎯 Mock NFT Minted:', {
      tokenId,
      txHash,
      kegName: keg.name,
      qrCode: keg.qr_code
    })

    return {
      success: true,
      tokenId,
      txHash
    }
  }

  async burnKeg(tokenId: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const token = this.mintedTokens.get(tokenId)
    if (!token) {
      return {
        success: false,
        error: 'Token not found'
      }
    }

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
    
    // Remove from mock storage (simulating burn)
    this.mintedTokens.delete(tokenId)

    console.log('🔥 Mock NFT Burned:', {
      tokenId,
      txHash,
      kegName: token.keg.name
    })

    return {
      success: true,
      txHash
    }
  }

  async getKegNFT(tokenId: string): Promise<any | null> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return this.mintedTokens.get(tokenId) || null
  }

  async updateKegMetadata(tokenId: string, updates: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const token = this.mintedTokens.get(tokenId)
    if (!token) {
      return {
        success: false,
        error: 'Token not found'
      }
    }

    // Update metadata
    Object.assign(token.metadata.properties, updates)
    token.metadata.attributes.forEach((attr: any) => {
      if (attr.trait_type === 'Status') {
        attr.value = updates.status || attr.value
      }
      if (attr.trait_type === 'Current Holder') {
        attr.value = updates.current_holder || attr.value
      }
    })

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    console.log('📝 Mock NFT Updated:', {
      tokenId,
      txHash,
      updates
    })

    return {
      success: true,
      txHash
    }
  }

  async getAllMintedKegs(): Promise<any[]> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return Array.from(this.mintedTokens.values())
  }

  async verifyKegOwnership(tokenId: string, address: string): Promise<boolean> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const token = this.mintedTokens.get(tokenId)
    return !!token // Mock: all tokens are "owned" by the system
  }
}

// Export singleton instance
export const mockBlockchain = MockBlockchainService.getInstance()
