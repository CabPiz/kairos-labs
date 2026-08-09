"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ContactModal } from "@/components/contact/ContactModal";

export function HeroContent() {
  const t = useTranslations("hero");
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="relative z-30 flex flex-col px-4 pt-8 pb-0 sm:px-10 sm:pt-10 sm:max-w-[52%]">
      {/* Headline */}
      <h1 style={{ margin: 0, padding: 0, lineHeight: 1.15 }}>
        {[t("line1"), t("line2"), t("line3")].map((line) => (
          <span
            key={line}
            style={{
              display: "block",
              color: "#ffffff",
              fontSize: "clamp(2.2rem, 3.8vw, 3.6rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "var(--font-orbitron), sans-serif",
            }}
          >
            {line}
          </span>
        ))}
        <span
          style={{
            display: "block",
            fontSize: "clamp(2.2rem, 3.8vw, 3.6rem)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily: "var(--font-orbitron), sans-serif",
            color: "#d4a017",
          }}
        >
          {t("highlight")}
        </span>
      </h1>

      {/* Subtítulo */}
      <p
        style={{
          marginTop: "1.5rem",
          marginBottom: 0,
          color: "rgba(255,255,255,0.65)",
          fontSize: "1rem",
          lineHeight: 1.6,
          maxWidth: "380px",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {t("subtitle")}
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <a
          href="#products"
          style={{
            display: "inline-block",
            background: "#1a56db",
            color: "#fff",
            textDecoration: "none",
            padding: "0.7rem 1.8rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {t("cta1")}
        </a>

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            padding: "0.7rem 1.8rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {t("cta2")}
        </button>
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
