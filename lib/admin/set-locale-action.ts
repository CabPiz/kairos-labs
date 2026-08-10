"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Seta o cookie NEXT_LOCALE e redireciona para a rota admin atual.
 * Usado pelo AdminLanguageSwitcher para trocar idioma sem sair das rotas /admin/*.
 * O middleware detecta o cookie na próxima requisição e aplica o locale correto.
 *
 * @param locale - Locale desejado (pt | en | es)
 * @param redirectTo - Pathname para redirecionar após setar o cookie
 */
export async function setAdminLocaleAction(locale: string, redirectTo: string): Promise<void> {
  if (!routing.locales.includes(locale as never)) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  redirect(redirectTo);
}
