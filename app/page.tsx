// O middleware do next-intl redireciona `/` para `/{defaultLocale}` antes
// de esta página ser renderizada. Este arquivo evita o 404 caso o middleware
// não atue (ex: acesso estático direto ao path raiz).
export default function RootPage() {
  return null;
}
