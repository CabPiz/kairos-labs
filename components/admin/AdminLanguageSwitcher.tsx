"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { localeConfig, type Locale } from "@/i18n/routing";
import { setAdminLocaleAction } from "@/lib/admin/set-locale-action";

const LOCALES: Locale[] = ["pt", "en", "es"];

/**
 * Switcher de idioma para páginas /admin/*.
 * Define o cookie NEXT_LOCALE via Server Action e redireciona para o mesmo pathname.
 * Funciona em desktop, tablet e mobile — flags visíveis em todos; código do locale em sm+.
 */
export function AdminLanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(locale: Locale) {
    if (locale === currentLocale || isPending) return;
    startTransition(async () => {
      await setAdminLocaleAction(locale, pathname);
    });
  }

  return (
    <fieldset className="flex gap-[0.35rem] border-none p-0 m-0 min-w-0">
      <legend className="sr-only">Language</legend>
      {LOCALES.map((locale) => {
        const { flag, label } = localeConfig[locale];
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            disabled={isPending}
            aria-label={label}
            aria-current={isActive ? "true" : undefined}
            className={[
              "flex items-center justify-center gap-[0.3rem] px-[0.5rem] min-h-[2.2rem] rounded-[5px] text-[0.7rem] font-semibold tracking-[0.06em] uppercase border transition-colors duration-150",
              isActive
                ? "border-[rgba(212,160,23,0.5)] text-[#d4a017] bg-[rgba(212,160,23,0.08)] cursor-default"
                : "border-white/[0.1] text-white/40 bg-transparent hover:text-white/70 hover:border-white/20 cursor-pointer",
              isPending ? "opacity-50 cursor-not-allowed" : "",
            ]
              .join(" ")
              .trim()}
          >
            <span aria-hidden="true">{flag}</span>
            <span className="hidden sm:inline">{locale.toUpperCase()}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
