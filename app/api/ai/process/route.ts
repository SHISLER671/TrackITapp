import { NextRequest, NextResponse } from 'next/server'
import { aiAssistant, type AIRequest } from '@/lib/ai-assistant'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const aiRequest: AIRequest = body

    // Validate request
    if (!aiRequest.type || !aiRequest.prompt) {
      return NextResponse.json(
        { error: 'Invalid AI request. Type and prompt are required.' },
        { status: 400 }
      )
    }

    // Process request through AI assistant
    const response = await aiAssistant.processRequest(aiRequest)

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        response: 'Sorry, I encountered an error processing your request.',
        tier: 1,
        model: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
