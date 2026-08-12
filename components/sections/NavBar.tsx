"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const navLinkStyle = {
  color: "rgba(255,255,255,0.75)",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  transition: "color 0.2s",
  fontFamily: "var(--font-exo2), var(--font-inter), sans-serif",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

export function NavBar() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavLink() {
    setMobileOpen(false);
  }

  return (
    <>
      <nav
        className="relative z-30 flex items-center justify-between px-4 py-4 sm:px-10 sm:py-[1.4rem]"
        style={{
          background: "linear-gradient(to bottom, rgba(7,10,18,0.85) 0%, transparent 100%)",
        }}
      >
        {/* Logo — imagem completa com marca e moldura */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <Image
            src="/logo.png"
            alt="Kairos Labs"
            width={110}
            height={110}
            className="object-contain sm:w-[110px] sm:h-[110px] w-[88px] h-[88px]"
            priority
          />
        </Link>

        {/* Desktop nav — gap menor em tablet, maior em desktop */}
        <div className="hidden sm:flex items-center gap-6 lg:gap-10">
          <Link
            href="#sobre"
            style={navLinkStyle}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onFocus={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onBlur={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            {t("sobre")}
          </Link>

          <Link
            href="#tecnologia"
            style={navLinkStyle}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onFocus={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onBlur={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            {t("tecnologia")}
          </Link>

          <Link
            href="#contato"
            style={navLinkStyle}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onFocus={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onBlur={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            {t("contato")}
          </Link>

          <LanguageSwitcher />

          <Link href="/admin/login">
            <button
              type="button"
              style={{
                border: "1.5px solid rgba(212,163,56,0.7)",
                color: "#D4A338",
                background: "transparent",
                padding: "0.45rem 1.4rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-inter), sans-serif",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#D4A338";
                e.currentTarget.style.color = "#050a14";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "#D4A338";
                e.currentTarget.style.color = "#050a14";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#D4A338";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#D4A338";
              }}
            >
              {t("acesso")}
            </button>
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="flex sm:hidden flex-col justify-center items-center gap-[5px] p-2"
          aria-label="Menu de navegação"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: "2px",
              transition: "transform 0.25s, opacity 0.25s",
              transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: "2px",
              transition: "opacity 0.25s",
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: "2px",
              transition: "transform 0.25s, opacity 0.25s",
              transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu — overlay full-screen; fixed para não ser clipado pelo overflow:hidden do HeroSection */}
      {mobileOpen && (
        <div
          className="sm:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "#050a14",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Topo do overlay: logo + botão fechar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <Link
              href="/"
              onClick={handleNavLink}
              style={{ textDecoration: "none" }}
            >
              <Image
                src="/logo.png"
                alt="Kairos Labs"
                width={90}
                height={90}
                className="object-contain"
              />
            </Link>

            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Itens de navegação */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "2rem 1.5rem", gap: "0.5rem" }}>
            {[
              { label: t("sobre"), href: "#sobre" },
              { label: t("tecnologia"), href: "#tecnologia" },
              { label: t("contato"), href: "#contato" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={handleNavLink}
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "1.15rem",
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  fontFamily: "var(--font-inter), sans-serif",
                  display: "block",
                }}
              >
                {label}
              </Link>
            ))}

            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <LanguageSwitcher />
              <Link
                href="/admin/login"
                onClick={handleNavLink}
                style={{
                  display: "block",
                  textAlign: "center",
                  border: "1.5px solid rgba(212,163,56,0.7)",
                  color: "#D4A338",
                  textDecoration: "none",
                  padding: "0.85rem 1.4rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  fontFamily: "var(--font-exo2), var(--font-inter), sans-serif",
                }}
              >
                {t("acesso")}
              </Link>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
