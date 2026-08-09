import type { Product } from "./types";

// ─────────────────────────────────────────────────────────────
// Dados estruturais dos produtos
//
// Apenas campos locale-agnostic ficam aqui: slug, nome (brand),
// cor, icone, statusTipo, stack.
//
// Todos os textos (tagline, descricao, descricaoLonga, problema,
// solucao, funcionalidades, publicoAlvo, status, cta) vivem em
// messages/[locale].json sob products.[slug].
//
// Ponto de integração futura: quando o DevPrint estiver em
// produção, `getProducts()` passará a fazer fetch à sua API
// sem nenhuma alteração nos componentes consumidores.
// ─────────────────────────────────────────────────────────────

const products: Product[] = [
  {
    slug: "devprint",
    nome: "DevPrint",
    cor: "#4a90e2",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    statusTipo: "breve",
    stack: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS v4",
      "Supabase",
      "GitHub API",
      "Gemini API",
    ],
  },

  {
    slug: "ascend",
    nome: "Ascend",
    cor: "#10b981",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    statusTipo: "breve",
    stack: ["Next.js", "React 19", "Tailwind CSS v4", "Google Gemini API"],
  },

  {
    slug: "elucya-talk",
    nome: "Elucya Talk",
    cor: "#8b5cf6",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    statusTipo: "breve",
    stack: [
      "Next.js 16",
      "React 19",
      "Tailwind CSS v4",
      "Whisper / AssemblyAI",
      "OpenAI GPT-4o / Anthropic Claude",
    ],
  },

  {
    slug: "agora-global",
    nome: "Plataforma Ágora Global",
    cor: "#f59e0b",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    statusTipo: "breve",
    stack: [
      "Microsserviços (Docker/Kubernetes)",
      "Blockchain / Ledger Imutável",
      "APIs RESTful e GraphQL",
      "Open Source Global",
    ],
  },

  {
    slug: "talvrix",
    nome: "Talvrix",
    cor: "#f97316",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
    statusTipo: "breve",
    stack: [
      "Next.js 15",
      "TypeScript",
      "Python (Scraping)",
      "Google Gemini API",
      "Supabase",
      "Playwright",
    ],
  },

  {
    slug: "kairos-labs",
    nome: "Kairos Labs",
    cor: "#d4a017",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    statusTipo: "ativo",
    stack: [
      "Next.js 15 (App Router)",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Supabase (Auth + PostgreSQL + RLS)",
      "Vercel",
    ],
  },
];

/**
 * Retorna a lista de todos os produtos do ecossistema Kairos Labs.
 *
 * Ponto de integração: hoje retorna dados estáticos. Quando o DevPrint
 * estiver em produção, esta função passará a fazer fetch à API do DevPrint
 * sem necessidade de alterações nos componentes consumidores.
 */
export function getProducts(): Product[] {
  return products;
}

/**
 * Mapa de product_id → nome de exibição.
 * Derivado automaticamente de `getProducts()` — nunca editado manualmente.
 */
export const productNames: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.slug, p.nome])
);
