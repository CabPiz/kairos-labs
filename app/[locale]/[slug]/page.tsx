import type React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";
import { FeedbackCTAButton } from "@/components/feedback/FeedbackCTAButton";
import { getProducts } from "@/lib/products";
import { routing } from "@/i18n/routing";

const statusStyles: Record<string, React.CSSProperties> = {
  ativo: {
    background: "rgba(0,240,255,0.12)",
    color: "#00F0FF",
    border: "1px solid rgba(0,240,255,0.35)",
  },
  breve: {
    background: "rgba(197,145,40,0.15)",
    color: "#C59128",
    border: "1px solid rgba(197,145,40,0.4)",
  },
};

interface Funcionalidade {
  titulo: string;
  descricao: string;
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProdutoDetalhe({ params }: Readonly<Props>) {
  const { slug, locale } = await params;
  const produto = getProducts().find((p) => p.slug === slug);

  if (!produto) notFound();

  const t = await getTranslations({ locale, namespace: "productDetail" });
  const tp = await getTranslations({ locale, namespace: `products.${slug}` });

  const tagline = tp("tagline");
  const status = tp("status");
  const cta = tp("cta");
  const descricaoLonga = tp("descricaoLonga");
  const problema = tp("problema");
  const solucao = tp("solucao");
  const funcionalidades = tp.raw("funcionalidades") as Funcionalidade[];
  const publicoAlvo = tp.raw("publicoAlvo") as string[] | undefined;

  return (
    <main
      className="min-h-screen text-white font-[var(--font-inter),sans-serif]"
      style={{
        backgroundColor: "#050a14",
        backgroundImage: "url('/backgrounds/product-detail-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Breadcrumb */}
      <div className="border-b border-[rgba(0,240,255,0.15)] px-4 sm:px-10 py-[1.4rem] flex items-center gap-5" style={{ background: "rgba(7,10,18,0.85)", backdropFilter: "blur(8px)" }}>
        <Link
          href={`/${locale}#products`}
          className="inline-flex items-center gap-2 text-white/55 text-[0.82rem] font-medium tracking-[0.12em] uppercase no-underline transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </Link>
        <span className="text-white/20 text-base">/</span>
        <span
          className="text-[0.82rem] font-medium tracking-[0.12em] uppercase"
          style={{ color: produto.cor }}
        >
          {produto.nome}
        </span>
      </div>

      <div className="max-w-[860px] mx-auto px-4 sm:px-10 pt-16 pb-24">
        {/* Hero */}
        <div className="mb-12">
          <span
            className="inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase rounded-[4px] px-[0.7rem] py-[0.28rem] mb-5"
            style={statusStyles[produto.statusTipo]}
          >
            {status}
          </span>

          <h1 className="mb-[0.6rem] font-[var(--font-rajdhani),var(--font-michroma),sans-serif] font-bold tracking-[0.06em] uppercase leading-[1.1] text-[clamp(2rem,4vw,3rem)] text-white">
            {produto.nome}
          </h1>

          <p className="mb-6 text-[1.05rem] font-medium italic" style={{ color: produto.cor }}>
            {tagline}
          </p>

          <p className="text-white/65 text-base leading-[1.8] max-w-[680px]">
            {descricaoLonga}
          </p>
        </div>

        <Divider />

        {/* Problema / Solução */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div className="rounded-[10px] p-6" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.18)" }}>
            <SectionLabel>{t("problem")}</SectionLabel>
            <p className="text-white/60 text-[0.9rem] leading-[1.7]">{problema}</p>
          </div>
          <div
            className="rounded-[10px] p-6"
            style={{ background: `${produto.cor}08`, border: `1px solid ${produto.cor}25` }}
          >
            <SectionLabel>{t("solution")}</SectionLabel>
            <p className="text-white/60 text-[0.9rem] leading-[1.7]">{solucao}</p>
          </div>
        </div>

        <Divider />

        {/* Funcionalidades */}
        <div className="mb-12">
          <SectionLabel>{t("features")}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {funcionalidades.map((f, i) => (
              <div
                key={f.titulo}
                className="bg-white/[0.03] border border-blue-500/14 rounded-[10px] px-[1.4rem] py-5"
              >
                <span
                  className="block font-[var(--font-rajdhani),sans-serif] text-[0.75rem] font-bold tracking-[0.1em] mb-[0.6rem] opacity-70"
                  style={{ color: produto.cor }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mb-2 text-[0.88rem] font-bold text-white tracking-[0.02em]">
                  {f.titulo}
                </h3>
                <p className="text-white/50 text-[0.82rem] leading-[1.65]">{f.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Público-Alvo */}
        {publicoAlvo && publicoAlvo.length > 0 && (
          <>
            <Divider />
            <div className="mb-12">
              <SectionLabel>{t("audience")}</SectionLabel>
              <ul className="flex flex-col gap-[0.6rem] list-none p-0 m-0">
                {publicoAlvo.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-white/60 text-[0.88rem] leading-[1.6]"
                  >
                    <span
                      className="flex-shrink-0 mt-[0.35rem] w-[5px] h-[5px] rounded-full inline-block"
                      style={{ background: "#00F0FF", boxShadow: "0 0 4px rgba(0,240,255,0.6)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Stack */}
        {produto.stack && produto.stack.length > 0 && (
          <>
            <Divider />
            <div className="mb-12">
              <SectionLabel>{t("stack")}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {produto.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[0.75rem] font-semibold tracking-[0.06em] rounded-[5px] px-3 py-[0.3rem]"
                    style={{ color: "#00F0FF", background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.25)" }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* CTA final */}
        <div
          className="flex flex-col items-center text-center gap-6 p-8 rounded-xl"
          style={{ background: `${produto.cor}08`, border: `1px solid ${produto.cor}20` }}
        >
          <div>
            <p
              className="mb-[0.4rem] text-[0.72rem] font-bold tracking-[0.22em] uppercase"
              style={{ color: produto.cor }}
            >
              {t("earlyAccess.eyebrow")}
            </p>
            <h2 className="mb-[0.6rem] font-[var(--font-rajdhani),var(--font-michroma),sans-serif] text-[1.1rem] font-bold tracking-[0.06em] uppercase text-white">
              {t("earlyAccess.title")}
            </h2>
            <p className="text-white/45 text-[0.85rem] leading-[1.6]">
              {t("earlyAccess.description")}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <WaitlistCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
              ctaLabel={cta}
            />
            <FeedbackCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
            />
            <Link
              href={`/${locale}#products`}
              className="inline-flex items-center gap-[0.4rem] px-[1.6rem] py-[0.7rem] text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white/60 border border-white/18 rounded-md no-underline transition-colors hover:text-white hover:border-white/40"
            >
              <ArrowLeft size={14} />
              {t("allProducts")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProducts().map((p) => ({ locale, slug: p.slug }))
  );
}

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p className="mb-3 text-white/35 text-[0.7rem] font-bold tracking-[0.22em] uppercase font-[var(--font-inter),sans-serif]">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-none border-t border-[rgba(0,240,255,0.1)] my-12" />;
}
