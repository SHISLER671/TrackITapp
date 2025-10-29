import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/AuthProvider"
import { RoleBasedNav } from "@/components/RoleBasedNav"
import { AIChatAssistant } from "@/components/AIChatAssistant"
import { AIVoiceAssistant } from "@/components/AIVoiceAssistant"
import { KeepAlivePing } from "@/components/KeepAlivePing"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Keg Tracker",
  description: "Track beer kegs across the supply chain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <RoleBasedNav />
          <KeepAlivePing />
          {children}
          <AIChatAssistant />
          <AIVoiceAssistant />
        </AuthProvider>
      </body>
    </html>
  )
}
