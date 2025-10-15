import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keg Tracker",
  description: "Track beer kegs across the supply chain",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}