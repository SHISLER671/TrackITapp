import type { Metadata } from "next"
import { AuthProvider } from "@/components/AuthProvider"
import { AIChatAssistant } from "@/components/AIChatAssistant"
import { AIVoiceAssistant } from "@/components/AIVoiceAssistant"
import './globals.css'

export const metadata: Metadata = {
  title: "Keg Tracker",
  description: "Track beer kegs across the supply chain",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <AIChatAssistant />
          <AIVoiceAssistant />
        </AuthProvider>
      </body>
    </html>
  )
}
