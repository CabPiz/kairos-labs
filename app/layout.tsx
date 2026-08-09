// Layout raiz mínimo — o layout real com idioma fica em app/[locale]/layout.tsx.
// Este arquivo existe apenas para satisfazer o Next.js App Router, que exige um
// layout.tsx na raiz de app/. A rota raiz redireciona via middleware (next-intl).
export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
