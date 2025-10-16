'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateKegFormData, BeerStyle, KegSize } from '@/lib/types'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { AIRecommendations } from '@/components/AIRecommendations'

export default function NewKegPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateKegFormData>({
    name: '',
    type: 'IPA',
    size: 'half',
    brewery_id: 'default-brewery-id', // Will be populated from user context in production
    abv: undefined,
    ibu: undefined,
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create keg in database
      const kegResponse = await fetch('/api/kegs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const kegResult = await kegResponse.json()

      if (kegResult.error) {
        setError(kegResult.error)
        return
      }

      // Step 2: Mint NFT for the keg
      console.log('🎯 Minting NFT for keg:', kegResult.data)
      const nftResponse = await fetch('/api/blockchain/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keg: kegResult.data
        }),
      })

      const nftResult = await nftResponse.json()

      if (nftResult.success) {
        console.log('✅ NFT minted successfully:', {
          tokenId: nftResult.tokenId,
          txHash: nftResult.txHash,
          blockchain: nftResult.blockchain
        })

        // Update keg with NFT information
        const updateResponse = await fetch(`/api/kegs/${kegResult.data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nft_token_id: nftResult.tokenId,
            nft_tx_hash: nftResult.txHash,
            blockchain_status: 'MINTED'
          }),
        })

        if (updateResponse.ok) {
          console.log('✅ Keg updated with NFT information')
        }
      } else {
        console.warn('⚠️ NFT minting failed, but keg created:', nftResult.error)
      }

      router.push('/kegs')
    } catch (err) {
      setError('Failed to create keg')
      console.error('Create keg error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateKegFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleApplyRecommendation = (recommendation: any) => {
    setFormData(prev => ({
      ...prev,
      name: recommendation.title || prev.name,
      type: recommendation.beerStyle || prev.type,
      abv: recommendation.abv || prev.abv,
      size: recommendation.kegSize || prev.size,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/kegs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Keg</h1>
            <p className="text-gray-600 mt-1">Create a new keg entry</p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mb-6">
          <AIRecommendations 
            onApply={handleApplyRecommendation}
            className="w-full"
          />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Keg Information</CardTitle>
            <CardDescription>
              Enter the details for the new keg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Keg Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Summer IPA"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Beer Style *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as BeerStyle)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="IPA">IPA</option>
                    <option value="Lager">Lager</option>
                    <option value="Stout">Stout</option>
                    <option value="Porter">Porter</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Pilsner">Pilsner</option>
                    <option value="Ale">Ale</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Keg Size *
                  </label>
                  <select
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value as KegSize)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="quarter">Quarter Barrel (7.75 gal)</option>
                    <option value="half">Half Barrel (15.5 gal)</option>
                    <option value="sixth">Sixth Barrel (5.17 gal)</option>
                    <option value="tenth">Tenth Barrel (3.1 gal)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="abv" className="block text-sm font-medium text-gray-700 mb-1">
                    ABV (%)
                  </label>
                  <input
                    id="abv"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={formData.abv || ''}
                    onChange={(e) => handleInputChange('abv', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ibu" className="block text-sm font-medium text-gray-700 mb-1">
                    IBU
                  </label>
                  <input
                    id="ibu"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.ibu || ''}
                    onChange={(e) => handleInputChange('ibu', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description of the beer..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Create Keg'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/kegs')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
