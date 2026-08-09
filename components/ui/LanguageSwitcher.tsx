"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeConfig, type Locale } from "@/i18n/routing";

/**
 * Dropdown de seleção de idioma. Troca o locale mantendo o path atual.
 * Escalável: adicionar novo locale em localeConfig é suficiente — sem alteração aqui.
 */
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(next: Locale) {
    setOpen(false);
    // Substitui apenas o segmento de locale no início do pathname
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  const current = localeConfig[locale];

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "6px",
          padding: "0.35rem 0.75rem",
          cursor: "pointer",
          color: "rgba(255,255,255,0.75)",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontFamily: "var(--font-inter), sans-serif",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{locale.toUpperCase()}</span>
        <span
          style={{
            display: "inline-block",
            width: "0",
            height: "0",
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "5px solid rgba(255,255,255,0.5)",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "140px",
            background: "#0b1221",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "8px",
            padding: "4px",
            margin: 0,
            listStyle: "none",
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {locales.map((loc) => {
            const cfg = localeConfig[loc];
            const isActive = loc === locale;
            return (
              <li
                key={loc}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => switchLocale(loc)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") switchLocale(loc);
                }}
                onMouseOver={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onFocus={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseOut={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onBlur={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.5rem 0.75rem",
                  background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                  borderRadius: "5px",
                  cursor: "pointer",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: "var(--font-inter), sans-serif",
                  transition: "background 0.15s, color 0.15s",
                  listStyle: "none",
                }}
              >
                <span aria-hidden="true">{cfg.flag}</span>
                <span>{cfg.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
