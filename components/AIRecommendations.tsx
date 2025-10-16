'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react'
import { aiAssistant, type AIRequest } from '@/lib/ai-assistant'

interface Recommendation {
  id: string
  type: 'seasonal' | 'pattern' | 'trending' | 'custom'
  title: string
  description: string
  beerStyle: string
  abv: number
  kegSize: string
  confidence: number
  reasoning: string
  applied: boolean
}

interface AIRecommendationsProps {
  userHistory?: any[]
  onApply?: (recommendation: Recommendation) => void
  className?: string
}

export function AIRecommendations({ userHistory = [], onApply, className }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate recommendations on component mount
  useEffect(() => {
    generateRecommendations()
  }, [userHistory])

  const generateRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create context from user history
      const context = {
        userHistory,
        season: getCurrentSeason(),
        totalKegs: userHistory.length,
        avgABV: calculateAverageABV(userHistory),
        mostCommonStyle: getMostCommonStyle(userHistory),
        mostCommonSize: getMostCommonSize(userHistory)
      }

      const aiRequest: AIRequest = {
        type: 'recommendation',
        prompt: 'Generate brewing recommendations based on user history and current season',
        context,
        userId: 'current-user'
      }

      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiRequest)
      })

      const aiResponse = await response.json()

      if (aiResponse.success) {
        // Parse AI response and create recommendations
        const parsedRecommendations = parseAIRecommendations(aiResponse.response, context)
        setRecommendations(parsedRecommendations)
      } else {
        // Fallback to mock recommendations
        setRecommendations(generateMockRecommendations(context))
      }
    } catch (error) {
      console.error('Recommendation generation error:', error)
      setError('Failed to generate recommendations')
      // Show mock recommendations as fallback
      setRecommendations(generateMockRecommendations({}))
    } finally {
      setIsLoading(false)
    }
  }

  const parseAIRecommendations = (aiResponse: string, context: any): Recommendation[] => {
    // Parse AI response and extract recommendation data
    // This is a simplified parser - in production, you'd want more robust parsing
    const recommendations: Recommendation[] = []

    // Try to extract structured data from AI response
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim())
      
      // Look for recommendation patterns
      lines.forEach((line, index) => {
        if (line.includes('IPA') || line.includes('Stout') || line.includes('Pilsner')) {
          const style = extractBeerStyle(line)
          const abv = extractABV(line) || getDefaultABV(style)
          
          recommendations.push({
            id: `ai-rec-${index}`,
            type: 'pattern',
            title: `AI Suggestion: ${style}`,
            description: line,
            beerStyle: style,
            abv,
            kegSize: context.mostCommonSize || 'HalfBarrel',
            confidence: 0.75,
            reasoning: 'Based on your brewing patterns and seasonal trends',
            applied: false
          })
        }
      })
    } catch (error) {
      console.warn('Failed to parse AI recommendations:', error)
    }

    // If no recommendations were parsed, generate fallbacks
    if (recommendations.length === 0) {
      return generateMockRecommendations(context)
    }

    return recommendations.slice(0, 3) // Limit to 3 recommendations
  }

  const generateMockRecommendations = (context: any): Recommendation[] => {
    const season = getCurrentSeason()
    const baseRecommendations: Recommendation[] = []

    // Seasonal recommendations
    if (season === 'winter') {
      baseRecommendations.push({
        id: 'seasonal-winter',
        type: 'seasonal',
        title: 'Winter Warmer',
        description: 'Perfect for cold weather - dark, rich, and warming',
        beerStyle: 'Imperial Stout',
        abv: 9.5,
        kegSize: 'HalfBarrel',
        confidence: 0.85,
        reasoning: 'Winter season calls for darker, stronger beers',
        applied: false
      })
    } else if (season === 'summer') {
      baseRecommendations.push({
        id: 'seasonal-summer',
        type: 'seasonal',
        title: 'Summer Refresher',
        description: 'Light and crisp for hot weather',
        beerStyle: 'Pilsner',
        abv: 4.8,
        kegSize: 'HalfBarrel',
        confidence: 0.90,
        reasoning: 'Summer season favors lighter, more refreshing styles',
        applied: false
      })
    } else {
      baseRecommendations.push({
        id: 'seasonal-spring',
        type: 'seasonal',
        title: 'Spring IPA',
        description: 'Balanced and hoppy for the season',
        beerStyle: 'IPA',
        abv: 6.5,
        kegSize: 'HalfBarrel',
        confidence: 0.80,
        reasoning: 'Spring is ideal for balanced IPAs',
        applied: false
      })
    }

    // Pattern-based recommendations
    if (context.totalKegs > 0) {
      const mostCommonStyle = context.mostCommonStyle || 'IPA'
      baseRecommendations.push({
        id: 'pattern-based',
        type: 'pattern',
        title: `Your Style: ${mostCommonStyle}`,
        description: `Based on your brewing history - you love ${mostCommonStyle}s!`,
        beerStyle: mostCommonStyle,
        abv: context.avgABV || 6.2,
        kegSize: context.mostCommonSize || 'HalfBarrel',
        confidence: 0.95,
        reasoning: `You've brewed ${mostCommonStyle} most frequently`,
        applied: false
      })
    }

    // Trending recommendation
    baseRecommendations.push({
      id: 'trending',
      type: 'trending',
      title: 'Trending Style',
      description: 'Popular in the craft beer community right now',
      beerStyle: 'Hazy IPA',
      abv: 6.8,
      kegSize: 'HalfBarrel',
      confidence: 0.70,
      reasoning: 'Currently trending in craft beer circles',
      applied: false
    })

    return baseRecommendations.slice(0, 3)
  }

  const handleApplyRecommendation = (recommendation: Recommendation) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendation.id 
          ? { ...rec, applied: true }
          : rec
      )
    )

    if (onApply) {
      onApply(recommendation)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'seasonal': return <Calendar className="h-4 w-4" />
      case 'pattern': return <TrendingUp className="h-4 w-4" />
      case 'trending': return <Target className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'seasonal': return 'bg-green-100 text-green-700'
      case 'pattern': return 'bg-blue-100 text-blue-700'
      case 'trending': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Generating recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={generateRecommendations} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>🤖 AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 rounded-lg border ${
                recommendation.applied 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getIconForType(recommendation.type)}
                  <h4 className="font-semibold text-gray-800">{recommendation.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                    {recommendation.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {Math.round(recommendation.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <span className="font-medium">Style:</span>
                  <p className="text-gray-600">{recommendation.beerStyle}</p>
                </div>
                <div>
                  <span className="font-medium">ABV:</span>
                  <p className="text-gray-600">{recommendation.abv}%</p>
                </div>
                <div>
                  <span className="font-medium">Size:</span>
                  <p className="text-gray-600">{recommendation.kegSize}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                <strong>Reasoning:</strong> {recommendation.reasoning}
              </p>

              <Button
                onClick={() => handleApplyRecommendation(recommendation)}
                disabled={recommendation.applied}
                className="w-full"
                variant={recommendation.applied ? "outline" : "default"}
              >
                {recommendation.applied ? 'Applied ✓' : 'Apply Recommendation'}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button 
            onClick={generateRecommendations} 
            variant="outline" 
            size="sm"
          >
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
const getCurrentSeason = (): string => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

const calculateAverageABV = (history: any[]): number => {
  if (history.length === 0) return 6.0
  const totalABV = history.reduce((sum, keg) => sum + (keg.abv || 0), 0)
  return totalABV / history.length
}

const getMostCommonStyle = (history: any[]): string => {
  if (history.length === 0) return 'IPA'
  const styleCounts = history.reduce((counts, keg) => {
    const style = keg.type || 'IPA'
    counts[style] = (counts[style] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  return Object.entries(styleCounts).reduce((a, b) => styleCounts[a[0]] > styleCounts[b[0]] ? a : b)[0]
}

const getMostCommonSize = (history: any[]): string => {
  if (history.length === 0) return 'HalfBarrel'
  const sizeCounts = history.reduce((counts, keg) => {
    const size = keg.keg_size || 'HalfBarrel'
    counts[size] = (counts[size] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  return Object.entries(sizeCounts).reduce((a, b) => sizeCounts[a[0]] > sizeCounts[b[0]] ? a : b)[0]
}

const extractBeerStyle = (text: string): string => {
  const styles = ['IPA', 'Stout', 'Pilsner', 'Lager', 'Ale', 'Porter', 'Wheat', 'Sour']
  for (const style of styles) {
    if (text.toLowerCase().includes(style.toLowerCase())) {
      return style
    }
  }
  return 'IPA'
}

const extractABV = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|abv)/i)
  return match ? parseFloat(match[1]) : null
}

const getDefaultABV = (style: string): number => {
  const defaultABVs: Record<string, number> = {
    'IPA': 6.5,
    'Stout': 7.0,
    'Pilsner': 4.8,
    'Lager': 5.0,
    'Ale': 5.5,
    'Porter': 6.2,
    'Wheat': 5.2,
    'Sour': 4.5
  }
  return defaultABVs[style] || 6.0
}
