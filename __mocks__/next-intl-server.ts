/**
 * Mock de next-intl/server para Jest.
 * Retorna strings reais do pt.json com suporte a t.raw() para arrays/objetos.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ptMessages = require("../messages/pt.json") as Record<string, unknown>;

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, obj);
}

export const getLocale = jest.fn(async () => "pt");

export const getMessages = jest.fn(async () => ptMessages);

export const getTranslations = jest.fn(
  async (namespaceOrConfig?: string | { locale?: string; namespace?: string }) => {
    const namespace =
      typeof namespaceOrConfig === "string"
        ? namespaceOrConfig
        : namespaceOrConfig?.namespace;
    const t = (key: string, params?: Record<string, string | number>): string => {
      const fullPath = namespace ? `${namespace}.${key}` : key;
      const value = getNestedValue(ptMessages, fullPath);
      const str = typeof value === "string" ? value : key;
      if (!params) return str;
      return Object.entries(params).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        str
      );
    };
    t.raw = (key: string): unknown => {
      const fullPath = namespace ? `${namespace}.${key}` : key;
      return getNestedValue(ptMessages, fullPath);
    };
    return t;
  }
);

export const getRequestConfig = (fn: unknown) => fn;
