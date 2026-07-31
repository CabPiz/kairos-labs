import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/sections/Header'  // ← adiciona essa linha

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kairos Labs',
  description: '...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  )
}