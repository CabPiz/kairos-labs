"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { locales, localeConfig, type Locale } from "@/i18n/routing";
import {
  toggleButtonBase,
  toggleButtonHover,
  toggleButtonRest,
  menuBase,
  menuItemActive,
  menuItemInactive,
  makeMenuItemHandlers,
  caretStyle,
} from "./language-switcher-styles";

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
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={toggleButtonBase}
        onMouseOver={(e) => Object.assign(e.currentTarget.style, toggleButtonHover)}
        onFocus={(e) => Object.assign(e.currentTarget.style, toggleButtonHover)}
        onMouseOut={(e) => Object.assign(e.currentTarget.style, toggleButtonRest)}
        onBlur={(e) => Object.assign(e.currentTarget.style, toggleButtonRest)}
      >
        <Image src={current.flagImg} alt="" width={20} height={15} style={{ borderRadius: "2px", flexShrink: 0 }} />
        <span>{locale.toUpperCase()}</span>
        <span style={caretStyle(open)} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t("label")}
          style={menuBase}
        >
          {locales.map((loc) => {
            const cfg = localeConfig[loc];
            const isActive = loc === locale;
            return (
              <li
                key={loc}
                role="menuitem"
                aria-current={isActive ? "true" : undefined}
                tabIndex={0}
                onClick={() => switchLocale(loc)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") switchLocale(loc);
                }}
                {...makeMenuItemHandlers(isActive)}
                style={isActive ? menuItemActive : menuItemInactive}
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
