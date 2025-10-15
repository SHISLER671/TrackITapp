import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AIVoiceAssistant from '@/components/AIVoiceAssistant';
import AIChatAssistant from '@/components/AIChatAssistant';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Keg Tracker - Brewery Keg Management System',
  description: 'Blockchain-verified keg tracking system for breweries',
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <AIVoiceAssistant />
          <AIChatAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
