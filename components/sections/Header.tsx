// components/sections/Header.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-8 
      bg-black/85 backdrop-blur-lg border-b border-blue-500/20
      after:content-[''] after:absolute after:bottom-[-1px] after:left-[10%] after:w-[80%] after:h-px
      after:bg-gradient-to-r after:from-transparent after:via-blue-500/50 after:to-transparent">

      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Kairos Labs"
          width={48}
          height={48}
          className="rounded-lg object-contain"
          priority
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-bold tracking-[0.15em] bg-gradient-to-r from-blue-300 via-white to-amber-400 bg-clip-text text-transparent">
            Kairos Labs<sup className="text-[10px] font-normal text-gray-400 not-italic ml-0.5">™</sup>
          </span>
          <span className="flex items-center gap-1.5 text-[9px] tracking-[0.12em] uppercase text-amber-400 
            bg-amber-400/8 border border-amber-400/25 rounded px-1.5 py-0.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_#fbbf24]" />
            Marca Protocolada · INPI Nº 944610498
          </span>
        </div>
      </Link>

      <nav className="flex items-center gap-8">
        <Link href="#produtos" className="text-white/55 text-[13px] tracking-[0.15em] uppercase hover:text-blue-300 transition-colors hidden md:block">
          Produtos
        </Link>
        <Link href="#sobre" className="text-white/55 text-[13px] tracking-[0.15em] uppercase hover:text-blue-300 transition-colors hidden md:block">
          Sobre
        </Link>
        <Link href="#produtos" className="text-blue-300 text-[12px] tracking-[0.15em] uppercase 
          bg-gradient-to-r from-blue-500/15 to-amber-400/10 border border-blue-500/35 
          rounded-md px-[18px] py-2 hover:border-blue-500/70 hover:bg-blue-500/20 transition-all">
          Acesso Antecipado
        </Link>
      </nav>
    </header>
  )
}