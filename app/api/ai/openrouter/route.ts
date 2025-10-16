import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, messages, max_tokens, temperature } = body

    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      // Return mock response if no API key
      return NextResponse.json({
        choices: [{
          message: {
            content: "AI Assistant is running in demo mode. Add your OpenRouter API key to enable live AI responses."
          }
        }]
      })
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Keg Tracker AI Assistant',
      },
      body: JSON.stringify({
        model: model || 'microsoft/phi-3-mini-128k-instruct:free',
        messages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('OpenRouter API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}
