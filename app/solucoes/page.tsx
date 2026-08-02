"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const produtos = [
  {
    slug: "devprint",
    nome: "DevPrint",
    tagline: "Seu currículo cresce com você.",
    descricao:
      "Transforma seu histórico real de desenvolvimento — commits, PRs e aprendizados manuais — em um currículo vivo, narrativo e verificável. Cada projeto é uma prova.",
    status: "Em breve",
    statusTipo: "breve",
    icone: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    cor: "#4a90e2",
  },
  {
    slug: "ascend",
    nome: "Ascend",
    tagline: "Acelere sua evolução técnica.",
    descricao:
      "Plataforma de crescimento profissional para devs que querem sair do júnior ao sênior com clareza — trilhas personalizadas, metas e evidências de progresso.",
    status: "Em breve",
    statusTipo: "breve",
    icone: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    cor: "#10b981",
  },
  {
    slug: "elucya-talk",
    nome: "Elucya Talk",
    tagline: "Comunicação inteligente por IA.",
    descricao:
      "Solução de AIaaS para comunicação empresarial — automação de atendimento, análise de sentimento e respostas contextuais com modelos de linguagem de ponta.",
    status: "Em breve",
    statusTipo: "breve",
    icone: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    cor: "#8b5cf6",
  },
  {
    slug: "agora-global",
    nome: "Plataforma Ágora Global",
    tagline: "Blockchain para contratos reais.",
    descricao:
      "Infraestrutura de contratos inteligentes e soluções descentralizadas para negócios que precisam de rastreabilidade, transparência e automação trustless.",
    status: "Em breve",
    statusTipo: "breve",
    icone: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    cor: "#f59e0b",
  },
  {
    slug: "kairos-labs",
    nome: "Kairos Labs",
    tagline: "O ecossistema que conecta tudo.",
    descricao:
      "Portal institucional e central de validação de demanda. A marca registrada que une todas as soluções — e o ponto de partida para o futuro do ecossistema.",
    status: "Ativo",
    statusTipo: "ativo",
    icone: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    cor: "#d4a017",
  },
];

const statusStyles: Record<string, React.CSSProperties> = {
  ativo: {
    background: "rgba(16,185,129,0.15)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.4)",
  },
  breve: {
    background: "rgba(212,160,23,0.12)",
    color: "#d4a017",
    border: "1px solid rgba(212,160,23,0.35)",
  },
};

export default function SolucoesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050a14",
        color: "#fff",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {/* Header da página */}
      <div
        style={{
          borderBottom: "1px solid rgba(59,130,246,0.15)",
          padding: "1.4rem 2.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.2rem",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.82rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        >
          <ArrowLeft size={16} />
          Início
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "1rem" }}>
          /
        </span>
        <span
          style={{
            color: "#d4a017",
            fontSize: "0.82rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Soluções
        </span>
      </div>

      {/* Hero da seção */}
      <div
        style={{
          padding: "4rem 2.5rem 3rem",
          maxWidth: "900px",
        }}
      >
        <p
          style={{
            margin: "0 0 1rem",
            color: "#d4a017",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Ecossistema Kairos Labs
        </p>
        <h1
          style={{
            margin: "0 0 1.2rem",
            fontFamily: "var(--font-orbitron), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            lineHeight: 1.15,
          }}
        >
          Nossas{" "}
          <span style={{ color: "#4a90e2" }}>Soluções</span>
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.55)",
            fontSize: "1rem",
            lineHeight: 1.7,
            maxWidth: "520px",
          }}
        >
          Cada produto nasce de um problema real. Cadastre-se na lista de espera
          do que mais faz sentido para você e ajude a priorizar o que construímos
          primeiro.
        </p>
      </div>

      {/* Grid de cards */}
      <div
        style={{
          padding: "0 2.5rem 5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1200px",
        }}
      >
        {produtos.map((produto) => (
          <ProdutoCard key={produto.slug} produto={produto} />
        ))}
      </div>
    </main>
  );
}

function ProdutoCard({ produto }: { produto: (typeof produtos)[number] }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(59,130,246,0.18)",
        borderRadius: "12px",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
        transition: "border-color 0.25s, background 0.25s",
        cursor: "default",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(59,130,246,0.45)";
        (e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.055)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(59,130,246,0.18)";
        (e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.03)";
      }}
    >
      {/* Ícone + Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "10px",
            border: `1px solid ${produto.cor}40`,
            background: `${produto.cor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: produto.cor,
            flexShrink: 0,
          }}
        >
          {produto.icone}
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderRadius: "4px",
            padding: "0.3rem 0.7rem",
            ...statusStyles[produto.statusTipo],
          }}
        >
          {produto.status}
        </span>
      </div>

      {/* Nome + Tagline */}
      <div>
        <h2
          style={{
            margin: "0 0 0.4rem",
            fontFamily: "var(--font-orbitron), sans-serif",
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#fff",
          }}
        >
          {produto.nome}
        </h2>
        <p
          style={{
            margin: 0,
            color: produto.cor,
            fontSize: "0.82rem",
            fontWeight: 500,
            fontStyle: "italic",
          }}
        >
          {produto.tagline}
        </p>
      </div>

      {/* Descrição */}
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.55)",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          flexGrow: 1,
        }}
      >
        {produto.descricao}
      </p>

      {/* Rodapé do card: saiba mais + CTA */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginTop: "0.4rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={`/solucoes/${produto.slug}`}
          style={{
            flex: 1,
            minWidth: "120px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.6rem 1rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "6px",
            textDecoration: "none",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          Saiba mais
        </Link>

        <button
          onClick={() => {
            // TODO(#9): abrir modal de waitlist com product_id = produto.slug
            console.log("waitlist:", produto.slug);
          }}
          style={{
            flex: 1,
            minWidth: "160px",
            padding: "0.6rem 1rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#050a14",
            background: "#d4a017",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#b8860f")
          }
          onMouseOut={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#d4a017")
          }
        >
          Garantir Acesso
        </button>
      </div>
    </div>
  );
}