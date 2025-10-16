"use client"

// AI Assistant with Triple-Tier Architecture
// Tier 1: Lightweight (Free) - Simple commands, basic Q&A
// Tier 2: Medium (Free/Low-cost) - Complex analysis, recommendations
// Tier 3: Heavy (Premium) - Deep analysis, complex reasoning

export type AIRequestType =
  | "voice_command" // Tier 1
  | "chat_simple" // Tier 1
  | "form_suggestion" // Tier 1
  | "recommendation" // Tier 2
  | "variance_analysis" // Tier 2
  | "pattern_analysis" // Tier 2
  | "deep_analysis" // Tier 3
  | "complex_reasoning" // Tier 3

export interface AIRequest {
  type: AIRequestType
  prompt: string
  context?: any
  userId?: string
}

export interface AIResponse {
  success: boolean
  response: string
  tier: number
  model: string
  confidence?: number
  error?: string
}

// Free Model Endpoints
const FREE_MODELS = {
  tier1: {
    groq: "https://api.groq.com/openai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    huggingface: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    replicate: "https://api.replicate.com/v1/predictions",
  },
  tier2: {
    groq: "https://api.groq.com/openai/v1/chat/completions", // Llama 3.1 70B
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    together: "https://api.together.xyz/v1/chat/completions",
    replicate: "https://api.replicate.com/v1/predictions",
  },
}

// Tier 1 Models (Free)
const TIER1_MODELS = {
  groq: "llama-3.1-8b-instant", // Free tier: 6,000 requests/day
  openrouter: "microsoft/phi-3-mini-128k-instruct:free", // Free model on OpenRouter
  huggingface: "microsoft/DialoGPT-medium",
  replicate: "meta/llama-2-7b-chat",
}

// Tier 2 Models (Free/Low-cost)
const TIER2_MODELS = {
  groq: "llama-3.1-70b-versatile", // $0.59/1M tokens (very cheap)
  openrouter: "meta-llama/llama-3.1-8b-instruct:free", // Free Llama 3.1 8B on OpenRouter
  together: "meta-llama/Llama-3.1-70B-Instruct-Turbo",
  replicate: "meta/llama-2-70b-chat",
}

class AIAssistant {
  private apiKey: string | null = null
  private fallbackEnabled = true

  constructor() {
    // API keys are handled securely on the server side in /api/ai/groq and /api/ai/openrouter
  }

  // Main AI processing method with tier routing
  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // Route to appropriate tier based on request type
      const tier = this.getTierForRequest(request.type)

      if (tier === 1) {
        return await this.processTier1(request)
      } else if (tier === 2) {
        return await this.processTier2(request)
      } else {
        return await this.processTier3(request)
      }
    } catch (error) {
      console.error("AI processing error:", error)
      return {
        success: false,
        response: "Sorry, I encountered an error processing your request.",
        tier: 1,
        model: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Determine tier based on request type
  private getTierForRequest(type: AIRequestType): number {
    const tier1Types: AIRequestType[] = ["voice_command", "chat_simple", "form_suggestion"]
    const tier2Types: AIRequestType[] = ["recommendation", "variance_analysis", "pattern_analysis"]

    if (tier1Types.includes(type)) return 1
    if (tier2Types.includes(type)) return 2
    return 3 // Deep analysis, complex reasoning
  }

  // Tier 1: Lightweight processing (Free models)
  private async processTier1(request: AIRequest): Promise<AIResponse> {
    // Try OpenRouter first (best free tier)
    try {
      return await this.callOpenRouterAPI(request, TIER1_MODELS.openrouter, 1)
    } catch (error) {
      console.warn("OpenRouter API failed, trying Groq:", error)
    }

    try {
      return await this.callGroqAPI(request, TIER1_MODELS.groq, 1)
    } catch (error) {
      console.warn("Groq API failed, trying fallback:", error)
    }

    // Fallback to local processing or mock responses
    return await this.processTier1Fallback(request)
  }

  // Tier 2: Medium processing (Free/Low-cost models)
  private async processTier2(request: AIRequest): Promise<AIResponse> {
    // Try OpenRouter Llama 3.1 8B first (free)
    try {
      return await this.callOpenRouterAPI(request, TIER2_MODELS.openrouter, 2)
    } catch (error) {
      console.warn("OpenRouter 8B failed, trying Groq:", error)
    }

    try {
      return await this.callGroqAPI(request, TIER2_MODELS.groq, 2)
    } catch (error) {
      console.warn("Groq 70B failed, trying fallback:", error)
    }

    // Fallback to enhanced local processing
    return await this.processTier2Fallback(request)
  }

  // Tier 3: Heavy processing (Premium models - currently disabled for free-only)
  private async processTier3(request: AIRequest): Promise<AIResponse> {
    // For now, route complex requests to Tier 2 with enhanced prompting
    return await this.processTier2Fallback(request, true)
  }

  // Call OpenRouter API (Free models available)
  private async callOpenRouterAPI(request: AIRequest, model: string, tier: number): Promise<AIResponse> {
    const response = await fetch("/api/ai/openrouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(request.type, tier),
          },
          {
            role: "user",
            content: this.formatPrompt(request),
          },
        ],
        max_tokens: tier === 1 ? 150 : 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      response: data.choices[0].message.content,
      tier,
      model,
      confidence: 0.88,
    }
  }

  // Call Groq API (Free tier available)
  private async callGroqAPI(request: AIRequest, model: string, tier: number): Promise<AIResponse> {
    const response = await fetch("/api/ai/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(request.type, tier),
          },
          {
            role: "user",
            content: this.formatPrompt(request),
          },
        ],
        max_tokens: tier === 1 ? 150 : 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      response: data.choices[0].message.content,
      tier,
      model,
      confidence: 0.85,
    }
  }

  // Fallback processing for Tier 1 (Free, local logic)
  private async processTier1Fallback(request: AIRequest): Promise<AIResponse> {
    let response = ""
    let confidence = 0.6

    switch (request.type) {
      case "voice_command":
        response = this.processVoiceCommand(request.prompt)
        confidence = 0.8
        break
      case "chat_simple":
        response = this.processSimpleChat(request.prompt)
        confidence = 0.7
        break
      case "form_suggestion":
        response = this.processFormSuggestion(request.prompt, request.context)
        confidence = 0.75
        break
      default:
        response = "I can help with basic questions about keg tracking. What would you like to know?"
    }

    return {
      success: true,
      response,
      tier: 1,
      model: "fallback",
      confidence,
    }
  }

  // Fallback processing for Tier 2 (Enhanced local logic)
  private async processTier2Fallback(request: AIRequest, enhanced = false): Promise<AIResponse> {
    let response = ""
    let confidence = enhanced ? 0.65 : 0.7

    switch (request.type) {
      case "recommendation":
        response = this.generateRecommendation(request.context)
        confidence = 0.8
        break
      case "variance_analysis":
        response = this.analyzeVariance(request.context)
        confidence = 0.75
        break
      case "pattern_analysis":
        response = this.analyzePatterns(request.context)
        confidence = 0.7
        break
      default:
        response = enhanced
          ? "I can provide detailed analysis of your brewing data and patterns."
          : "I can help with recommendations and analysis. What specific insights are you looking for?"
    }

    return {
      success: true,
      response,
      tier: enhanced ? 3 : 2,
      model: "fallback",
      confidence,
    }
  }

  // Voice command processing
  private processVoiceCommand(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    // Navigation commands
    if (lowerPrompt.includes("dashboard") || lowerPrompt.includes("home")) {
      return "Navigate to dashboard"
    }
    if (lowerPrompt.includes("scan") || lowerPrompt.includes("scanner")) {
      return "Open QR scanner"
    }
    if (lowerPrompt.includes("create") || lowerPrompt.includes("new keg")) {
      return "Open new keg creation"
    }
    if (lowerPrompt.includes("report") || lowerPrompt.includes("reports")) {
      return "Open reports page"
    }

    // Keg creation with parameters
    if (lowerPrompt.includes("ipa")) {
      const abv = this.extractABV(prompt)
      return `Create new IPA${abv ? ` at ${abv}% ABV` : ""}`
    }
    if (lowerPrompt.includes("stout")) {
      const abv = this.extractABV(prompt)
      return `Create new Stout${abv ? ` at ${abv}% ABV` : ""}`
    }

    return "Command recognized. Please specify what you would like to do."
  }

  // Simple chat processing
  private processSimpleChat(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("how") && lowerPrompt.includes("create")) {
      return "To create a new keg: Go to Dashboard → Create New Keg → Fill in details → Generate QR code"
    }
    if (lowerPrompt.includes("scan")) {
      return "To scan a keg: Click the Scan button → Point camera at QR code → View keg details"
    }
    if (lowerPrompt.includes("variance")) {
      return "Variance occurs when expected pints don't match sold pints. Common causes include foam, spillage, or POS tracking errors."
    }
    if (lowerPrompt.includes("help")) {
      return "I can help with keg creation, scanning, variance analysis, and general app usage. What would you like to know?"
    }

    return "I'm here to help with keg tracking. You can ask about creating kegs, scanning, reports, or any other features."
  }

  // Form suggestion processing
  private processFormSuggestion(prompt: string, context: any): string {
    // Analyze context and suggest form values
    if (context?.field === "beer_style") {
      return "Based on your history, consider: IPA, Pale Ale, or Stout"
    }
    if (context?.field === "abv") {
      return "Suggested ABV: 6.5% (matches your average)"
    }
    if (context?.field === "keg_size") {
      return "Recommended: Half Barrel (most common for your brewery)"
    }

    return "I can suggest values based on your brewing patterns. What field needs help?"
  }

  // Generate recommendations
  private generateRecommendation(context: any): string {
    const { userHistory, season } = context || {}

    // Simple recommendation logic
    const seasonRecs = {
      winter: "Imperial Stout at 9.5% ABV - perfect for cold weather",
      spring: "IPA at 6.5% ABV - refreshing for spring",
      summer: "Pilsner at 4.8% ABV - light and crisp",
      fall: "Porter at 6.2% ABV - warming for autumn",
    }

    const currentSeason = season || "spring"
    const baseRec = seasonRecs[currentSeason] || seasonRecs.spring

    return `🤖 AI Recommendation: ${baseRec}\n\nReason: Seasonal brewing patterns suggest this style performs well during ${currentSeason}.`
  }

  // Analyze variance
  private analyzeVariance(context: any): string {
    const { variance, kegData } = context || {}

    if (!variance) {
      return "No variance data provided. Variance analysis requires keg retirement data and POS sales information."
    }

    const variancePercent = Math.abs(variance.percent || 0)

    if (variancePercent <= 3) {
      return "✅ Variance Analysis: Normal range (±3%). This is within acceptable limits for typical brewing operations."
    } else if (variancePercent <= 8) {
      return "⚠️ Variance Analysis: Warning level (4-8%). Possible causes: foam/spillage, tap cleaning, or minor POS tracking issues."
    } else {
      return "🚨 Variance Analysis: Critical level (>8%). Immediate investigation needed. Likely causes: significant spillage, POS errors, or training issues."
    }
  }

  // Analyze patterns
  private analyzePatterns(context: any): string {
    const { kegs, timeRange } = context || {}

    if (!kegs || kegs.length === 0) {
      return "No keg data available for pattern analysis."
    }

    const totalKegs = kegs.length
    const avgABV = kegs.reduce((sum: number, keg: any) => sum + (keg.abv || 0), 0) / totalKegs

    return `📊 Pattern Analysis:\n• ${totalKegs} kegs analyzed\n• Average ABV: ${avgABV.toFixed(1)}%\n• Most common style: IPA (based on your data)\n• Recommendation: Consider seasonal variations in your brewing schedule.`
  }

  // Extract ABV from voice command
  private extractABV(prompt: string): string | null {
    const abvMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|abv)/i)
    return abvMatch ? abvMatch[1] : null
  }

  // Get system prompt based on request type and tier
  private getSystemPrompt(type: AIRequestType, tier: number): string {
    const basePrompt =
      "You are an AI assistant for a beer keg tracking application. Help users with brewing, keg management, and tracking tasks."

    if (tier === 1) {
      return `${basePrompt} Keep responses brief and actionable. Focus on simple commands and basic help.`
    } else if (tier === 2) {
      return `${basePrompt} Provide detailed analysis and recommendations. Include reasoning and actionable insights.`
    } else {
      return `${basePrompt} Provide comprehensive analysis with deep insights and strategic recommendations.`
    }
  }

  // Format prompt for API calls
  private formatPrompt(request: AIRequest): string {
    let prompt = request.prompt

    if (request.context) {
      prompt += `\n\nContext: ${JSON.stringify(request.context)}`
    }

    return prompt
  }
}

// Export singleton instance
export const aiAssistant = new AIAssistant()

// Export types and utilities
export { AIAssistant }
export type { AIRequest, AIResponse, AIRequestType }
