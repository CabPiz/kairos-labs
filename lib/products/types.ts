export interface Funcionalidade {
  titulo: string;
  descricao: string;
}

export interface Product {
  slug: string;
  nome: string;
  tagline: string;
  /** Descrição curta — usada nos cards de vitrine. */
  descricao: string;
  /** Descrição longa extraída do PRD — usada na página de detalhe. */
  descricaoLonga: string;
  problema: string;
  solucao: string;
  funcionalidades: Funcionalidade[];
  stack?: string[];
  publicoAlvo?: string[];
  /** Cor temática do produto em hex. Usada como accent em ícones, badges e CTAs. */
  cor: string;
  icone: React.ReactNode;
  status: string;
  statusTipo: "ativo" | "breve";
  cta: string;
}
