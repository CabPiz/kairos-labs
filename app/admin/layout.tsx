import { Inter, Orbitron } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-orbitron",
});

/**
 * Layout do admin — fornece <html>/<body> e NextIntlClientProvider para que todos
 * os Client Components do dashboard usem useTranslations() e useLocale() normalmente.
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
    <html lang={locale}>
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
