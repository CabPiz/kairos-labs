export interface Product {
  slug: string;
  /** Nome da marca — não traduzido (é o nome do produto). */
  nome: string;
  /** Cor temática em hex. Usada como accent em ícones, badges e CTAs. */
  cor: string;
  icone: React.ReactNode;
  /** Chave de CSS para badge de status ("ativo" | "breve"). */
  statusTipo: "ativo" | "breve";
  /** Nomes de tecnologias — não traduzidos (são nomes de produto). */
  stack?: string[];
}
