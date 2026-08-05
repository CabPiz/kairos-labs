import type { Metadata } from 'next'
import { Inter, Orbitron, Cinzel_Decorative } from 'next/font/google'
import { Footer } from '@/components/sections/Footer'
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
  metadataBase: new URL('https://kairoslabs.com.br'),
  title: {
    default: 'Kairos Labs',
    template: '%s | Kairos Labs',
  },
  description: 'Construímos soluções digitais avançadas com segurança, performance e visão de futuro.',
  openGraph: {
    title: 'Kairos Labs',
    description: 'Construímos soluções digitais avançadas com segurança, performance e visão de futuro.',
    url: 'https://kairoslabs.com.br',
    siteName: 'Kairos Labs',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Kairos Labs',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairos Labs',
    description: 'Construímos soluções digitais avançadas com segurança, performance e visão de futuro.',
    images: ['/logo.png'],
  },
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
        <Footer />
      </body>
    </html>
  )
}