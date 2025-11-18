'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from 'lucide-react'
import { aiAssistant, type AIRequest } from '@/lib/ai-assistant'

interface AIVoiceAssistantProps {
  className?: string
}

export function AIVoiceAssistant({ className }: AIVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      setTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceCommand = async () => {
    if (!transcript.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      const aiRequest: AIRequest = {
        type: 'voice_command',
        prompt: transcript,
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
        setLastCommand(aiResponse.response)
        speakResponse(aiResponse.response)
        
        // Execute command if it's a navigation command
        executeCommand(aiResponse.response)
      } else {
        throw new Error(aiResponse.error || 'Failed to process command')
      }
    } catch (error) {
      console.error('Voice command error:', error)
      setError('Failed to process voice command. Please try again.')
      speakResponse('Sorry, I didn\'t understand that command. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const executeCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    
    // Navigation commands
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
      window.location.href = '/'
    } else if (lowerCommand.includes('scan')) {
      window.location.href = '/scan'
    } else if (lowerCommand.includes('create') || lowerCommand.includes('new keg')) {
      window.location.href = '/kegs/new'
    } else if (lowerCommand.includes('kegs') || lowerCommand.includes('manage')) {
      window.location.href = '/kegs'
    } else if (lowerCommand.includes('report')) {
      window.location.href = '/reports'
    }
  }

  // Auto-process when transcript is finalized
  useEffect(() => {
    if (transcript && !isListening && !isProcessing) {
      processVoiceCommand()
    }
  }, [transcript, isListening, isProcessing])

  return (
    <>
      {/* Floating Voice Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-green-600 hover:bg-green-700"
          size="icon"
        >
          <Mic className="h-6 w-6" />
        </Button>
      )}

      {/* Voice Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
          <Card className="shadow-2xl border-2 border-green-200">
            <CardHeader className="bg-green-600 text-white rounded-t-lg pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <CardTitle className="text-lg">Voice Assistant</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Status */}
              <div className="text-center">
                {isListening && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center justify-center space-x-2 text-purple-600">
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Speaking...</span>
                  </div>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>You said:</strong> {transcript}
                  </p>
                </div>
              )}

              {/* Last Command */}
              {lastCommand && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Command:</strong> {lastCommand}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center space-x-2">
                {!isListening && !isProcessing && (
                  <Button
                    onClick={startListening}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSpeaking}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Listening
                  </Button>
                )}

                {isListening && (
                  <Button
                    onClick={stopListening}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Listening
                  </Button>
                )}

                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <VolumeX className="h-4 w-4 mr-2" />
                    Stop Speaking
                  </Button>
                )}
              </div>

              {/* Example Commands */}
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Try saying:</strong></p>
                <p>• "Create new IPA at 6.5% ABV"</p>
                <p>• "Go to dashboard"</p>
                <p>• "Scan keg"</p>
                <p>• "Show reports"</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
