import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/products/types";
import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";

const statusStyles: Record<string, string> = {
  ativo: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40",
  breve: "bg-yellow-600/12 text-yellow-500 border border-yellow-600/35",
};

export function Products() {
  const t = useTranslations("products");
  const locale = useLocale();
  const produtos = getProducts();

  return (
    <section id="products" className="px-4 sm:px-10 py-20" style={{ backgroundColor: "#050a14" }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className="mb-3 text-[#d4a017] text-[0.75rem] font-bold tracking-[0.22em] uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="mb-4 font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.15] text-[clamp(1.6rem,2.5vw,2.2rem)] text-white">
            {t("title")}
          </h2>
          <p className="text-white/55 text-base leading-[1.7] max-w-[520px]">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {produtos.map((produto) => (
            <ProductCard key={produto.slug} produto={produto} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProductCardProps {
  readonly produto: Product;
  readonly locale: string;
  readonly t: ReturnType<typeof useTranslations>;
}

function ProductCard({ produto, locale, t }: ProductCardProps) {
  const tagline = t(`${produto.slug}.tagline`);
  const descricao = t(`${produto.slug}.descricao`);
  const status = t(`${produto.slug}.status`);
  const cta = t(`${produto.slug}.cta`);

  return (
    <div
      data-testid="product-card"
      className="bg-white/[0.03] border border-blue-500/18 rounded-xl p-7 flex flex-col gap-4 hover:border-blue-500/45 hover:bg-white/[0.055] transition-[border-color,background] duration-[250ms]"
    >
      {/* Ícone + Status */}
      <div className="flex justify-between items-start">
        <div
          className="w-12 h-12 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{
            border: `1px solid ${produto.cor}40`,
            background: `${produto.cor}18`,
            color: produto.cor,
          }}
        >
          {produto.icone}
        </div>
        <span
          className={`text-[0.7rem] font-semibold tracking-[0.14em] uppercase rounded-[4px] px-[0.65rem] py-[0.28rem] ${statusStyles[produto.statusTipo]}`}
        >
          {status}
        </span>
      </div>

      {/* Nome + Tagline */}
      <div>
        <h3 className="mb-[0.35rem] font-[var(--font-orbitron),sans-serif] text-[0.95rem] font-bold tracking-[0.05em] text-white">
          {produto.nome}
        </h3>
        <p className="font-medium italic text-[0.8rem]" style={{ color: produto.cor }}>
          {tagline}
        </p>
      </div>

      {/* Descrição */}
      <p className="text-white/55 text-[0.85rem] leading-[1.7] flex-grow">{descricao}</p>

      {/* Ações */}
      <div className="flex flex-col gap-2 mt-1">
        <WaitlistCTAButton
          productId={produto.slug}
          productName={produto.nome}
          productColor={produto.cor}
          ctaLabel={cta}
        />
        <Link
          href={`/${locale}/${produto.slug}`}
          className="flex items-center justify-center px-4 py-[0.55rem] text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-white/60 border border-white/15 rounded-md no-underline transition-colors hover:text-white hover:border-white/40"
        >
          {t("saibaMais")}
        </Link>
      </div>
    </div>
  );
}
