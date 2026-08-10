"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { localeConfig, type Locale } from "@/i18n/routing";
import { setAdminLocaleAction } from "@/lib/admin/set-locale-action";

const LOCALES: Locale[] = ["pt", "en", "es"];

/**
 * Dropdown de seleção de idioma para páginas /admin/*.
 * Escalável: adicionar novo locale em localeConfig é suficiente — sem alteração aqui.
 * Usa o mesmo visual do LanguageSwitcher da landing.
 */
export function AdminLanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  function handleLocaleChange(locale: Locale) {
    if (locale === currentLocale || isPending) return;
    setOpen(false);
    startTransition(async () => {
      await setAdminLocaleAction(locale, pathname);
    });
  }

  const current = localeConfig[currentLocale];

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Idioma"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isPending}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "6px",
          padding: "0.35rem 0.75rem",
          cursor: isPending ? "not-allowed" : "pointer",
          color: "rgba(255,255,255,0.75)",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontFamily: "var(--font-inter), sans-serif",
          opacity: isPending ? 0.5 : 1,
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
        <Image src={current.flagImg} alt="" width={20} height={15} style={{ borderRadius: "2px", flexShrink: 0 }} />
        <span>{currentLocale.toUpperCase()}</span>
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
          role="menu"
          aria-label="Idioma"
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
          {LOCALES.map((locale) => {
            const cfg = localeConfig[locale];
            const isActive = locale === currentLocale;
            return (
              <li
                key={locale}
                role="menuitem"
                aria-current={isActive ? "true" : undefined}
                tabIndex={0}
                onClick={() => handleLocaleChange(locale)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleLocaleChange(locale);
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
                <Image src={cfg.flagImg} alt="" width={20} height={15} style={{ borderRadius: "2px", flexShrink: 0 }} />
                <span>{cfg.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
