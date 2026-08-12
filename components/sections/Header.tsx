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
        <div className="flex flex-col gap-0">
          {/* Silver "Kairos" + gold "Labs" — matching logo file */}
          <div className="flex items-baseline" style={{ gap: "0.3em" }}>
            <span
              className="text-xl font-bold tracking-[0.15em] bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(180deg, #e8f2ff 0%, #a0bcd8 45%, #5880b0 100%)",
                fontFamily: "var(--font-cinzel), serif",
              }}
            >
              Kairos
            </span>
            <span
              className="text-xl font-bold tracking-[0.15em] bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(180deg, #ffe08a 0%, #ffa020 45%, #c87000 100%)",
                fontFamily: "var(--font-cinzel), serif",
              }}
            >
              Labs
              <sup
                className="text-[10px] font-normal not-italic ml-0.5"
                style={{ WebkitTextFillColor: "rgba(200,134,10,0.8)" }}
              >
                ™
              </sup>
            </span>
          </div>
          {/* Decorative ornament (moldura) matching logo file */}
          <div className="flex items-center gap-1.5 my-0.5">
            <div className="h-px w-6" style={{ background: "linear-gradient(to right, transparent, rgba(96,165,250,0.6))" }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rotate-45 shadow-[0_0_5px_rgba(96,165,250,0.9)]" style={{ flexShrink: 0 }} />
            <div className="h-px w-6" style={{ background: "linear-gradient(to left, transparent, rgba(96,165,250,0.6))" }} />
          </div>
          <span className="flex items-center gap-1.5 text-[9px] tracking-[0.12em] uppercase text-amber-400
            bg-amber-400/8 border border-amber-400/25 rounded px-1.5 py-0.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_#fbbf24]" />{" "}
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