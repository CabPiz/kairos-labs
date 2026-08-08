import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";
import { FeedbackCTAButton } from "@/components/feedback/FeedbackCTAButton";
import { getProducts } from "@/lib/products";

const statusStyles: Record<string, string> = {
  ativo: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40",
  breve: "bg-yellow-600/12 text-yellow-500 border border-yellow-600/35",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProdutoDetalhe({ params }: Props) {
  const { slug } = await params;
  const produto = getProducts().find((p) => p.slug === slug);

  if (!produto) {
    notFound();
  }

  return (
    <main className="min-h-screen text-white font-[var(--font-inter),sans-serif]" style={{ backgroundColor: "#050a14" }}>
      {/* Breadcrumb */}
      <div className="border-b border-blue-500/15 px-10 py-[1.4rem] flex items-center gap-5">
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-white/55 text-[0.82rem] font-medium tracking-[0.12em] uppercase no-underline transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Portfólio
        </Link>
        <span className="text-white/20 text-base">/</span>
        <span
          className="text-[0.82rem] font-medium tracking-[0.12em] uppercase"
          style={{ color: produto.cor }}
        >
          {produto.nome}
        </span>
      </div>

      <div className="max-w-[860px] mx-auto px-10 pt-16 pb-24">
        {/* Hero */}
        <div className="mb-12">
          <span
            className={`inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase rounded-[4px] px-[0.7rem] py-[0.28rem] mb-5 ${statusStyles[produto.statusTipo]}`}
          >
            {produto.status}
          </span>

          <h1
            className="mb-[0.6rem] font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.1] text-[clamp(2rem,4vw,3rem)] text-white"
          >
            {produto.nome}
          </h1>

          <p className="mb-6 text-[1.05rem] font-medium italic" style={{ color: produto.cor }}>
            {produto.tagline}
          </p>

          <p className="text-white/65 text-base leading-[1.8] max-w-[680px]">
            {produto.descricaoLonga}
          </p>
        </div>

        <Divider />

        {/* Problema / Solução */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-red-500/5 border border-red-500/18 rounded-[10px] p-6">
            <SectionLabel>O Problema</SectionLabel>
            <p className="text-white/60 text-[0.9rem] leading-[1.7]">{produto.problema}</p>
          </div>
          <div
            className="rounded-[10px] p-6"
            style={{ background: `${produto.cor}08`, border: `1px solid ${produto.cor}25` }}
          >
            <SectionLabel>A Solução</SectionLabel>
            <p className="text-white/60 text-[0.9rem] leading-[1.7]">{produto.solucao}</p>
          </div>
        </div>

        <Divider />

        {/* Funcionalidades */}
        <div className="mb-12">
          <SectionLabel>Funcionalidades Principais</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            {produto.funcionalidades.map((f, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-blue-500/14 rounded-[10px] px-[1.4rem] py-5"
              >
                <span
                  className="block font-[var(--font-orbitron),sans-serif] text-[0.65rem] font-bold tracking-[0.1em] mb-[0.6rem] opacity-70"
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
        {produto.publicoAlvo && produto.publicoAlvo.length > 0 && (
          <>
            <Divider />
            <div className="mb-12">
              <SectionLabel>Para Quem É</SectionLabel>
              <ul className="flex flex-col gap-[0.6rem] list-none p-0 m-0">
                {produto.publicoAlvo.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 text-[0.88rem] leading-[1.6]">
                    <span
                      className="flex-shrink-0 mt-[0.35rem] w-[5px] h-[5px] rounded-full inline-block"
                      style={{ background: produto.cor }}
                    />
                    {p}
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
              <SectionLabel>Stack Técnica</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {produto.stack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[0.75rem] font-semibold tracking-[0.06em] text-white/65 bg-white/5 border border-white/12 rounded-[5px] px-3 py-[0.3rem]"
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
              Acesso Antecipado
            </p>
            <h2 className="mb-[0.6rem] font-[var(--font-orbitron),sans-serif] text-[1.1rem] font-extrabold tracking-[0.04em] uppercase text-white">
              Entrar na Lista de Espera
            </h2>
            <p className="text-white/45 text-[0.85rem] leading-[1.6]">
              Cadastre-se para ser notificado no lançamento e ajudar a priorizar o desenvolvimento.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <WaitlistCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
              ctaLabel={produto.cta}
            />
            <FeedbackCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
            />
            <Link
              href="/#products"
              className="inline-flex items-center gap-[0.4rem] px-[1.6rem] py-[0.7rem] text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white/60 border border-white/18 rounded-md no-underline transition-colors hover:text-white hover:border-white/40"
            >
              <ArrowLeft size={14} />
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p className="mb-3 text-white/35 text-[0.7rem] font-bold tracking-[0.22em] uppercase font-[var(--font-inter),sans-serif]">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-none border-t border-blue-500/12 my-12" />;
}
