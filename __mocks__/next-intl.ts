/**
 * Mock global de next-intl para Jest.
 * Retorna strings reais do pt.json — testes escritos antes de i18n continuam passando.
 * Testes que precisam de comportamento específico usam jest.mock("next-intl") inline.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ptMessages = require("../messages/pt.json") as Record<string, unknown>;

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, obj);
}

export const useTranslations = (namespace?: string) => {
  const t = (key: string, params?: Record<string, string>): string => {
    const fullPath = namespace ? `${namespace}.${key}` : key;
    const value = getNestedValue(ptMessages, fullPath);
    const str = typeof value === "string" ? value : key;
    if (!params) return str;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, v),
      str
    );
  };
  t.raw = (key: string): unknown => {
    const fullPath = namespace ? `${namespace}.${key}` : key;
    return getNestedValue(ptMessages, fullPath);
  };
  return t;
};

export const useLocale = () => "pt";

export const NextIntlClientProvider = ({ children }: { readonly children: React.ReactNode }) => children;
