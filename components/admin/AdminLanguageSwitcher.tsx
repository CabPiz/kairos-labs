"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { localeConfig, type Locale } from "@/i18n/routing";
import { setAdminLocaleAction } from "@/lib/admin/set-locale-action";
import {
  toggleButtonBase,
  toggleButtonHover,
  toggleButtonRest,
  menuBase,
  menuItemActive,
  menuItemInactive,
  makeMenuItemHandlers,
  caretStyle,
} from "@/components/ui/language-switcher-styles";

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
        style={{ ...toggleButtonBase, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.5 : 1 }}
        onMouseOver={(e) => Object.assign(e.currentTarget.style, toggleButtonHover)}
        onFocus={(e) => Object.assign(e.currentTarget.style, toggleButtonHover)}
        onMouseOut={(e) => Object.assign(e.currentTarget.style, toggleButtonRest)}
        onBlur={(e) => Object.assign(e.currentTarget.style, toggleButtonRest)}
      >
        <Image src={current.flagImg} alt="" width={20} height={15} style={{ borderRadius: "2px", flexShrink: 0 }} />
        <span>{currentLocale.toUpperCase()}</span>
        <span style={caretStyle(open)} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Idioma"
          style={menuBase}
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
