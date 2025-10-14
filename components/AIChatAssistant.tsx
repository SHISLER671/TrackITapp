'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your keg tracking AI assistant. Ask me anything about:\n\n• How to use the app\n• Keg tracking best practices\n• Troubleshooting issues\n• Brewing tips\n• Variance analysis\n\nWhat can I help you with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, call Grok API)
    setTimeout(() => {
      const response = generateAIResponse(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (query: string): string => {
    const lower = query.toLowerCase();

    // How-to questions
    if (lower.includes('create') || lower.includes('mint') || lower.includes('new keg')) {
      return "To create a new keg:\n\n1. Go to Dashboard → 'Create New Keg'\n2. Fill in beer details (name, style, ABV, IBU)\n3. Use the sliders for quick ABV/IBU input\n4. Add voice notes or photos if needed\n5. Click 'Create Keg'\n\nYou'll get a QR code to print and attach to the physical keg!\n\n💡 Tip: Use 'Batch Create' for multiple similar kegs.";
    }

    if (lower.includes('scan') || lower.includes('qr')) {
      return "To scan a keg:\n\n1. Click 'Scan' in the navigation\n2. Allow camera access\n3. Point at the QR code on the keg\n4. View keg details and update status\n\nYou can scan kegs to:\n• Track location changes\n• Update fill levels\n• Retire empty kegs\n• View brewing history";
    }

    if (lower.includes('variance') || lower.includes('missing pints')) {
      return "Variance happens when expected pints don't match sold pints.\n\nCommon causes:\n• Foam/spillage (most common)\n• Tap line cleaning waste\n• Staff training issues\n• POS tracking errors\n\nTo minimize variance:\n✅ Train staff on proper pouring\n✅ Clean lines regularly\n✅ Ensure all drinks are rung up\n✅ Check tap temperature (38°F ideal)\n\nThe app's AI analyzes variance patterns and suggests improvements!";
    }

    if (lower.includes('assign') || lower.includes('driver')) {
      return "To assign kegs to drivers:\n\n1. Go to Dashboard → 'Bulk Assign'\n2. Select kegs with checkboxes\n3. Choose a driver\n4. Click 'Assign'\n\nDrivers will see assigned kegs in their dashboard and can create deliveries from them.";
    }

    if (lower.includes('delivery') || lower.includes('deliver')) {
      return "Delivery workflow:\n\n**Driver:**\n1. Scan kegs to load on truck\n2. Create delivery for restaurant\n3. Drive to location\n4. Manager scans to accept\n\n**Manager:**\n1. See 'Pending Deliveries'\n2. Tap 'Accept Delivery'\n3. Get blockchain receipt\n\nEverything is tracked on-chain for accountability!";
    }

    if (lower.includes('batch') || lower.includes('multiple')) {
      return "Batch create is perfect for brewing multiple similar kegs!\n\n1. Go to 'Batch Create'\n2. Set number of kegs (2-10)\n3. Fill in base details\n4. Kegs auto-number (#1, #2, etc.)\n5. Create all at once\n\nSaves tons of time when you're brewing the same beer in multiple kegs!";
    }

    if (lower.includes('voice') || lower.includes('speak')) {
      return "Voice features:\n\n🎤 **Voice Assistant** (floating button):\nSay commands like:\n• 'Create new IPA at 6.5% ABV'\n• 'Go to dashboard'\n• 'End shift'\n• 'Generate report'\n\n🎙️ **Voice Notes**:\nIn the new keg form, click the microphone to add brewing notes hands-free!\n\nPerfect when your hands are dirty from brewing! 🍺";
    }

    if (lower.includes('preset') || lower.includes('template')) {
      return "Presets save your common keg configurations!\n\n**To save:**\n1. Fill in keg details\n2. Click 'Save as Preset'\n3. Name it (e.g., 'Standard IPA')\n\n**To use:**\n1. Click 'Load Preset'\n2. Choose from saved presets\n3. Details auto-fill!\n\nGreat for beers you brew regularly.";
    }

    if (lower.includes('photo') || lower.includes('picture') || lower.includes('camera')) {
      return "You can add photos to kegs!\n\n📁 **Upload**: Choose from your device\n📷 **Take Photo**: Use camera directly\n\nPhotos help with:\n• Visual keg identification\n• Documenting brew conditions\n• Quality control records\n• Training materials\n\nPhotos are stored with the keg record.";
    }

    if (lower.includes('report') || lower.includes('summary')) {
      return "Reports available:\n\n📊 **End Shift Summary**:\n• Today's kegs created\n• Average ABV\n• Beer style breakdown\n• AI insights\n• PDF export\n\n📈 **Accounting Reports**:\n• Delivery history\n• Deposit tracking\n• Export to CSV\n\n📉 **Variance Reports**:\n• Expected vs actual pints\n• AI analysis of discrepancies\n• Recommendations\n\nAll reports include blockchain transaction links!";
    }

    if (lower.includes('help') || lower.includes('support')) {
      return "I'm here to help! I can answer questions about:\n\n📱 **App Features**:\n• Creating & tracking kegs\n• Scanning QR codes\n• Deliveries & assignments\n\n🍺 **Brewing**:\n• Best practices\n• Keg sizes & types\n• Temperature & storage\n\n📊 **Analytics**:\n• Variance analysis\n• Reports & exports\n• AI insights\n\nJust ask me anything!";
    }

    // Default response
    return `I can help with that! Here are some things you can ask me:\n\n• "How do I create a new keg?"\n• "How does variance tracking work?"\n• "How do I assign kegs to drivers?"\n• "Tell me about voice commands"\n• "How do I use presets?"\n\nWhat specific question do you have?`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        title="AI Chat Assistant"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="font-bold">AI Assistant</div>
            <div className="text-xs opacity-90">Always here to help!</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-line text-sm">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
