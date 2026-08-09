import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

/**
 * Layout do admin — fornece NextIntlClientProvider para que todos os Client
 * Components do dashboard usem useTranslations() normalmente.
 * O locale é detectado pelo proxy (cookie NEXT_LOCALE → Accept-Language → pt).
 */
export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
