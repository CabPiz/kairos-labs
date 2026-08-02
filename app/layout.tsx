import type { Metadata } from 'next'
import { Inter, Orbitron, Cinzel_Decorative } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-orbitron',
})

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-cinzel',
})

export const metadata: Metadata = {
  title: 'Kairos Labs',
  description: 'Construímos soluções digitais avançadas com segurança, performance e visão de futuro.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${orbitron.variable} ${cinzelDecorative.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}