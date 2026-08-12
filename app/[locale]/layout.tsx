import type { Metadata } from "next";
import { Inter, Orbitron, Cinzel_Decorative, Rajdhani, Michroma, Exo_2 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/sections/Footer";
import { routing, localeConfig, type Locale } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-orbitron",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-cinzel",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-michroma",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-exo2",
  display: "swap",
});

interface Props {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const descriptions: Record<string, string> = {
    pt: "Construímos soluções digitais avançadas com segurança, performance e visão de futuro.",
    en: "We build advanced digital solutions with security, performance, and a vision for the future.",
    es: "Construimos soluciones digitales avanzadas con seguridad, rendimiento y visión de futuro.",
  };

  const ogLocales: Record<string, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" };

  const description = descriptions[locale] ?? descriptions.pt;
  const ogLocale = ogLocales[locale] ?? "pt_BR";

  return {
    metadataBase: new URL("https://kairoslabs.com.br"),
    title: { default: "Kairos Labs", template: "%s | Kairos Labs" },
    description,
    openGraph: {
      title: "Kairos Labs",
      description,
      url: "https://kairoslabs.com.br",
      siteName: "Kairos Labs",
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Kairos Labs" }],
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kairos Labs",
      description,
      images: ["/logo.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const cfg = localeConfig[locale as Locale];

  return (
    <html lang={locale} dir={cfg.dir}>
      <body
        className={`${inter.variable} ${orbitron.variable} ${cinzelDecorative.variable} ${rajdhani.variable} ${michroma.variable} ${exo2.variable} ${inter.className}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
