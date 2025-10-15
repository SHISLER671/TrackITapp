/**
 * AI Assistant using Grok API (xAI)
 * Handles voice commands, recommendations, and insights
 */

// For now, we'll use a mock implementation
// To use real Grok API, create server-side API routes in /app/api/ai/
// and call them from this client-side helper

const USE_LIVE_AI = false // Set to true when server-side AI routes are implemented

interface AICommand {
  action: string
  params?: Record<string, any>
  confidence: number
}

interface AIRecommendation {
  suggestion: string
  reason: string
  confidence: number
}

/**
 * Parse voice command using AI
 */
export async function parseVoiceCommand(transcript: string): Promise<AICommand> {
  if (USE_LIVE_AI) {
    // TODO: Implement real Grok API call
    // const response = await fetch('/app/api/ai/parse-command', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ transcript })
    // });
    // const result = await response.json();
    // return result;
  }

  // Mock AI parsing
  await simulateDelay(500)

  const lower = transcript.toLowerCase()

  // Create keg commands
  if (lower.includes("create") || lower.includes("new") || lower.includes("mint")) {
    const params: any = {}

    // Extract ABV
    const abvMatch = lower.match(/abv\s*(\d+\.?\d*)/i) || lower.match(/(\d+\.?\d*)\s*percent/i)
    if (abvMatch) params.abv = Number.parseFloat(abvMatch[1])

    // Extract IBU
    const ibuMatch = lower.match(/ibu\s*(\d+)/i)
    if (ibuMatch) params.ibu = Number.parseInt(ibuMatch[1])

    // Extract beer type
    if (lower.includes("ipa")) params.type = "IPA"
    else if (lower.includes("stout")) params.type = "Stout"
    else if (lower.includes("lager")) params.type = "Lager"
    else if (lower.includes("pale ale")) params.type = "Pale Ale"

    // Extract keg size
    if (lower.includes("half barrel") || lower.includes("1/2")) params.keg_size = "1/2BBL"
    else if (lower.includes("quarter") || lower.includes("1/4")) params.keg_size = "1/4BBL"
    else if (lower.includes("sixth") || lower.includes("1/6")) params.keg_size = "1/6BBL"

    // Check for batch
    const batchMatch = lower.match(/(\d+)\s*kegs?/i)
    if (batchMatch && Number.parseInt(batchMatch[1]) > 1) {
      return {
        action: "batch_create",
        params: { ...params, count: Number.parseInt(batchMatch[1]) },
        confidence: 0.85,
      }
    }

    return { action: "create_keg", params, confidence: 0.9 }
  }

  // Navigation commands
  if (lower.includes("dashboard") || lower.includes("home")) {
    return { action: "view_dashboard", confidence: 0.95 }
  }

  if (lower.includes("scan")) {
    return { action: "scan_keg", confidence: 0.9 }
  }

  if (lower.includes("end shift") || lower.includes("finish") || lower.includes("done")) {
    return { action: "end_shift", confidence: 0.85 }
  }

  if (lower.includes("report") || lower.includes("summary")) {
    return { action: "generate_report", confidence: 0.85 }
  }

  if (lower.includes("assign") || lower.includes("driver")) {
    return { action: "assign_driver", confidence: 0.8 }
  }

  if (lower.includes("batch")) {
    return { action: "batch_create", confidence: 0.85 }
  }

  return { action: "unknown", confidence: 0.0 }
}

/**
 * Get AI recommendations for keg creation based on past brews
 */
export async function getKegRecommendations(pastKegs: any[]): Promise<AIRecommendation[]> {
  if (USE_LIVE_AI) {
    // TODO: Implement real Grok API call
    // const response = await fetch('/app/api/ai/recommendations', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ pastKegs })
    // });
    // const result = await response.json();
    // return result;
  }

  await simulateDelay(800)

  if (pastKegs.length === 0) {
    return [
      {
        suggestion: "Start with a classic IPA at 6.5% ABV, 60 IBU",
        reason: "Popular style for new breweries",
        confidence: 0.7,
      },
    ]
  }

  // Analyze past kegs
  const avgABV = pastKegs.reduce((sum, k) => sum + k.abv, 0) / pastKegs.length
  const mostCommonType = getMostCommon(pastKegs.map((k) => k.type))
  const mostCommonSize = getMostCommon(pastKegs.map((k) => k.keg_size))

  const recommendations: AIRecommendation[] = []

  // Recommendation 1: Similar to your average
  recommendations.push({
    suggestion: `${mostCommonType} at ${avgABV.toFixed(1)}% ABV in ${mostCommonSize}`,
    reason: `Based on your brewing patterns - you typically brew ${mostCommonType}s at this strength`,
    confidence: 0.9,
  })

  // Recommendation 2: Seasonal suggestion
  const month = new Date().getMonth()
  if (month >= 10 || month <= 2) {
    // Winter
    recommendations.push({
      suggestion: "Imperial Stout at 9.5% ABV, 70 IBU",
      reason: "Winter season - darker, stronger beers are popular",
      confidence: 0.75,
    })
  } else if (month >= 6 && month <= 8) {
    // Summer
    recommendations.push({
      suggestion: "Light Lager at 4.2% ABV, 15 IBU",
      reason: "Summer season - refreshing, lighter beers sell well",
      confidence: 0.75,
    })
  }

  // Recommendation 3: Try something new
  const types = ["IPA", "Stout", "Lager", "Pale Ale", "Wheat Beer", "Sour"]
  const unusedTypes = types.filter((t) => !pastKegs.some((k) => k.type === t))
  if (unusedTypes.length > 0) {
    recommendations.push({
      suggestion: `Try brewing a ${unusedTypes[0]}`,
      reason: `You haven't brewed a ${unusedTypes[0]} yet - expand your portfolio`,
      confidence: 0.6,
    })
  }

  return recommendations
}

/**
 * Generate AI insights for shift summary
 */
export async function generateShiftInsights(kegs: any[]): Promise<string> {
  if (USE_LIVE_AI) {
    // TODO: Implement real Grok API call
    // const response = await fetch('/app/api/ai/shift-insights', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ kegs })
    // });
    // const result = await response.json();
    // return result;
  }

  await simulateDelay(600)

  if (kegs.length === 0) {
    return "No kegs brewed today. Time to get brewing! 🍺"
  }

  const avgABV = kegs.reduce((sum, k) => sum + k.abv, 0) / kegs.length
  const totalPints = kegs.reduce((sum, k) => {
    const size = k.keg_size
    if (size === "1/2BBL") return sum + 124
    if (size === "1/4BBL") return sum + 62
    if (size === "1/6BBL") return sum + 41
    return sum + 41
  }, 0)

  const types = [...new Set(kegs.map((k: any) => k.type))]
  const mostCommonType = getMostCommon(kegs.map((k: any) => k.type))

  let insights = `Great shift! You brewed ${kegs.length} keg${kegs.length > 1 ? "s" : ""} `
  insights += `with an average ABV of ${avgABV.toFixed(1)}%. `
  insights += `That's approximately ${totalPints} pints of beer! 🍺\n\n`

  if (types.length === 1) {
    insights += `You focused on ${mostCommonType}s today - consistency is key! `
  } else {
    insights += `You brewed ${types.length} different styles today - nice variety! `
  }

  if (avgABV > 7) {
    insights += `These are strong brews - perfect for winter or special occasions. `
  } else if (avgABV < 5) {
    insights += `Light and sessionable - great for summer drinking! `
  }

  insights += `\n\n💡 Tip: ${getRandomTip()}`

  return insights
}

/**
 * Analyze variance and provide AI insights
 */
export async function analyzeVarianceWithAI(keg: any, expectedPints: number, soldPints: number): Promise<string> {
  if (USE_LIVE_AI) {
    // TODO: Implement real Grok API call
    // const response = await fetch('/app/api/ai/variance-analysis', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ keg, expectedPints, soldPints })
    // });
    // const result = await response.json();
    // return result;
  }

  await simulateDelay(700)

  const variance = expectedPints - soldPints
  const variancePercent = (variance / expectedPints) * 100

  let analysis = `Variance Analysis for ${keg.name}:\n\n`

  if (Math.abs(variancePercent) < 5) {
    analysis += `✅ Excellent! Variance is only ${Math.abs(variancePercent).toFixed(1)}% (${Math.abs(variance)} pints). `
    analysis += `This is within normal range. Your tap system and POS tracking are working well.`
  } else if (variancePercent > 0) {
    analysis += `⚠️ ${variance} pints unaccounted for (${variancePercent.toFixed(1)}% variance).\n\n`
    analysis += `Possible causes:\n`
    analysis += `• Foam/spillage during pouring (most common)\n`
    analysis += `• Tap line cleaning waste\n`
    analysis += `• Staff training needed on proper pouring\n`
    analysis += `• POS tracking errors (drinks not rung up)\n\n`
    analysis += `Recommendation: Review pour techniques and ensure all drinks are logged in POS.`
  } else {
    analysis += `🤔 Interesting - you sold ${Math.abs(variance)} MORE pints than expected (${Math.abs(variancePercent).toFixed(1)}% over).\n\n`
    analysis += `Possible causes:\n`
    analysis += `• Keg was actually fuller than labeled\n`
    analysis += `• POS tracking duplicates\n`
    analysis += `• Smaller pour sizes than standard\n\n`
    analysis += `Recommendation: Verify keg fill levels and POS accuracy.`
  }

  return analysis
}

// Helper functions
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getMostCommon(arr: string[]): string {
  const counts: { [key: string]: number } = {}
  arr.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1
  })
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))
}

function getRandomTip(): string {
  const tips = [
    "Label kegs immediately after filling to avoid mix-ups",
    "Keep detailed brew logs - they're invaluable for consistency",
    "Clean tap lines every 2 weeks for best flavor",
    "Temperature matters - store kegs at 38°F for optimal carbonation",
    "Track your most popular styles and brew more of what sells",
    "Consider seasonal rotations to keep customers excited",
    "Proper sanitation prevents 90% of brewing issues",
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}
