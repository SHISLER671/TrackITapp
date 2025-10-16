import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, messages, max_tokens, temperature } = body

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY
    
    if (!apiKey) {
      // Return mock response if no API key
      return NextResponse.json({
        choices: [{
          message: {
            content: "AI Assistant is running in demo mode. Add your Groq API key to enable live AI responses."
          }
        }]
      })
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}
