import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

/** Detecta o locale do visitante para rotas admin (sem redirecionar). */
function detectAdminLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && routing.locales.includes(cookie as never)) return cookie;
  const accept = request.headers.get("accept-language") ?? "";
  const primary = accept.split(",")[0]?.split("-")[0]?.trim() ?? "";
  if (primary && routing.locales.includes(primary as never)) return primary;
  return routing.defaultLocale;
}

const intlMiddleware = createMiddleware(routing);

/**
 * Proxy unificado do projeto:
 * - Rotas /admin/* → autenticação Supabase (auth guard)
 * - Demais rotas   → next-intl para detecção e redirecionamento de locale
 *
 * Separado em `proxy.ts` (convenção Next.js 16) para permitir testes unitários
 * isolados da lógica de auth — ver __tests__/proxy.test.ts.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas e assets: delegar ao next-intl
  if (!pathname.startsWith("/admin")) {
    return intlMiddleware(request);
  }

  // Rotas /admin/*: autenticação Supabase
  // Seta x-next-intl-locale para que getLocale()/getTranslations() funcionem nos server components do admin
  const adminLocale = detectAdminLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-intl-locale", adminLocale);
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
