/**
 * Mock de next-intl/routing para Jest.
 * defineRouting retorna a config sem processamento — suficiente para testes.
 */
export const defineRouting = <T extends { locales: readonly string[]; defaultLocale: string }>(
  config: T
) => config;
