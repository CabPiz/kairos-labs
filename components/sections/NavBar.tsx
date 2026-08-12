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
        {/* Logo — flex-shrink:0 evita colapso em viewports intermediários */}
        <Link
          href="/"
          className="flex items-center gap-3"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          <Image
            src="/logo.png"
            alt="Kairos Labs"
            width={52}
            height={52}
            className="rounded-lg object-contain"
            priority
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {/* Top frame ornament — golden lines + small blue diamond, matching logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
              <div style={{ height: "1px", width: "22px", background: "linear-gradient(to right, transparent, rgba(200,144,32,0.7))" }} />
              <div style={{ width: "5px", height: "5px", background: "#60a5fa", transform: "rotate(45deg)", boxShadow: "0 0 4px rgba(96,165,250,0.8)", flexShrink: 0 }} />
              <div style={{ height: "1px", width: "22px", background: "linear-gradient(to left, transparent, rgba(200,144,32,0.7))" }} />
            </div>
            {/* Kairos (blue metallic) + Labs™ (gold metallic) */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3em" }}>
              <span
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  backgroundImage: "linear-gradient(180deg, #b8d8ff 0%, #4888e0 45%, #1840c0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Kairos
              </span>
              <span
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  backgroundImage: "linear-gradient(180deg, #ffe878 0%, #c89020 50%, #8a6010 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {"Labs"}
                <sup
                  style={{
                    fontSize: "0.55rem",
                    WebkitTextFillColor: "rgba(200,134,10,0.8)",
                    marginLeft: "2px",
                    verticalAlign: "super",
                  }}
                >
                  {"™"}
                </sup>
              </span>
            </div>
            {/* Bottom frame ornament — golden lines + larger blue diamond, matching logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
              <div style={{ height: "1px", width: "30px", background: "linear-gradient(to right, transparent, rgba(200,144,32,0.7))" }} />
              <div style={{ width: "7px", height: "7px", background: "#60a5fa", transform: "rotate(45deg)", boxShadow: "0 0 6px rgba(96,165,250,0.9)", flexShrink: 0 }} />
              <div style={{ height: "1px", width: "30px", background: "linear-gradient(to left, transparent, rgba(200,144,32,0.7))" }} />
            </div>
          </div>
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
              style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
            >
              <Image
                src="/logo.png"
                alt="Kairos Labs"
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {/* Top frame ornament */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ height: "1px", width: "18px", background: "linear-gradient(to right, transparent, rgba(200,144,32,0.7))" }} />
                  <div style={{ width: "4px", height: "4px", background: "#60a5fa", transform: "rotate(45deg)", boxShadow: "0 0 4px rgba(96,165,250,0.8)", flexShrink: 0 }} />
                  <div style={{ height: "1px", width: "18px", background: "linear-gradient(to left, transparent, rgba(200,144,32,0.7))" }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3em" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                      backgroundImage: "linear-gradient(180deg, #b8d8ff 0%, #4888e0 45%, #1840c0 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Kairos
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                      backgroundImage: "linear-gradient(180deg, #ffe878 0%, #c89020 50%, #8a6010 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Labs
                  </span>
                </div>
                {/* Bottom frame ornament */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <div style={{ height: "1px", width: "22px", background: "linear-gradient(to right, transparent, rgba(200,144,32,0.7))" }} />
                  <div style={{ width: "6px", height: "6px", background: "#60a5fa", transform: "rotate(45deg)", boxShadow: "0 0 5px rgba(96,165,250,0.9)", flexShrink: 0 }} />
                  <div style={{ height: "1px", width: "22px", background: "linear-gradient(to left, transparent, rgba(200,144,32,0.7))" }} />
                </div>
              </div>
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
