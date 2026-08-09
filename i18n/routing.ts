import { defineRouting } from "next-intl/routing";

export const locales = ["pt", "en", "es"] as const;
export type Locale = (typeof locales)[number];

/**
 * Configuração de roteamento do next-intl.
 * Para adicionar novo idioma: inserir a chave em `locales` e criar `messages/[locale].json`.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: "pt",
});

/**
 * Metadados por locale: direção de escrita e nome nativo.
 * Mantido centralizado aqui para evitar divergências entre layout e LanguageSwitcher.
 * Ao adicionar suporte a árabe, hebraico ou persa, setar dir: 'rtl'.
 */
export const localeConfig: Record<Locale, { dir: "ltr" | "rtl"; label: string; flag: string }> = {
  pt: { dir: "ltr", label: "Português", flag: "🇧🇷" },
  en: { dir: "ltr", label: "English", flag: "🇺🇸" },
  es: { dir: "ltr", label: "Español", flag: "🇪🇸" },
};
