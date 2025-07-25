import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper'
import { RealTimeProvider } from '@/contexts/RealTimeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HomeHost - Game Hosting Made Simple',
  description: 'Deploy game servers in minutes, discover communities through friends, and build your gaming empire.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          <RealTimeProvider>
            {children}
          </RealTimeProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}