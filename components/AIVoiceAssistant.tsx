'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseVoiceCommand } from '@/lib/ai-assistant';

export default function AIVoiceAssistant() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
        setIsProcessing(true);
        
        try {
          const command = await parseVoiceCommand(transcript);
          await executeCommand(command);
        } catch (error) {
          speak("Sorry, I didn't understand that command.");
          setFeedback("❌ Command not recognized");
        } finally {
          setIsProcessing(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setFeedback('🎤 Listening...');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const executeCommand = async (command: any) => {
    if (command.confidence < 0.5) {
      speak("I'm not sure what you want to do. Try again?");
      setFeedback("❓ Low confidence - please repeat");
      return;
    }

    switch (command.action) {
      case 'create_keg':
        speak("Opening new keg form");
        setFeedback("✅ Creating new keg...");
        const params = new URLSearchParams();
        if (command.params?.abv) params.set('abv', command.params.abv.toString());
        if (command.params?.ibu) params.set('ibu', command.params.ibu.toString());
        if (command.params?.type) params.set('type', command.params.type);
        if (command.params?.keg_size) params.set('size', command.params.keg_size);
        router.push(`/kegs/new?${params.toString()}`);
        break;

      case 'batch_create':
        speak(`Opening batch create for ${command.params?.count || 'multiple'} kegs`);
        setFeedback("✅ Opening batch create...");
        router.push('/kegs/batch');
        break;

      case 'view_dashboard':
        speak("Going to dashboard");
        setFeedback("✅ Opening dashboard...");
        router.push('/dashboard/brewer');
        break;

      case 'scan_keg':
        speak("Opening scanner");
        setFeedback("✅ Opening scanner...");
        router.push('/scan');
        break;

      case 'end_shift':
        speak("Generating shift summary");
        setFeedback("✅ Ending shift...");
        // Trigger end shift modal
        window.dispatchEvent(new CustomEvent('openEndShift'));
        break;

      case 'generate_report':
        speak("Generating report");
        setFeedback("✅ Opening reports...");
        router.push('/reports');
        break;

      case 'assign_driver':
        speak("Opening driver assignment");
        setFeedback("✅ Opening assignments...");
        router.push('/kegs/assign');
        break;

      default:
        speak("I'm not sure how to do that yet.");
        setFeedback("❓ Unknown command");
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  if (!recognition) {
    return null; // Voice not supported
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {/* Feedback bubble */}
        {(feedback || transcript) && (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs animate-fade-in">
            {feedback && (
              <div className="text-sm font-medium text-gray-900 mb-1">{feedback}</div>
            )}
            {transcript && (
              <div className="text-xs text-gray-600 italic">"{transcript}"</div>
            )}
          </div>
        )}

        {/* Voice button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : isProcessing
              ? 'bg-yellow-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
          title="Voice Assistant"
        >
          {isProcessing ? (
            <div className="animate-spin">⚙️</div>
          ) : isListening ? (
            '🔴'
          ) : (
            '🎤'
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
