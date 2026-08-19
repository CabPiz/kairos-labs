import { FeedbackAnalysisSchema } from "@/lib/ai/schemas/feedback-analysis";
import { ContactAnalysisSchema } from "@/lib/ai/schemas/contact-analysis";

describe("FeedbackAnalysisSchema", () => {
  it("valida dados corretos", () => {
    const result = FeedbackAnalysisSchema.safeParse({
      sentimento: "positivo",
      categoria: "usabilidade",
      resumo: "Ótima experiência",
      pontuacao: 9,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sentimento inválido", () => {
    const result = FeedbackAnalysisSchema.safeParse({
      sentimento: "excelente",
      categoria: "x",
      resumo: "x",
      pontuacao: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe("ContactAnalysisSchema", () => {
  it("valida dados corretos", () => {
    const result = ContactAnalysisSchema.safeParse({
      problema: "Empresa sem sistema de gestão",
      solucao_tipo: "novo_produto",
      solucao_titulo: "SaaS de Gestão",
      solucao_descricao: "Plataforma para pequenas empresas",
      nichos: [
        { publico: "MEIs", justificativa: "Alta demanda" },
        { publico: "Freelancers", justificativa: "Organização" },
      ],
      draft_issues: [{ title: "feat: módulo", body: "Descrição", labels: ["type: feature"] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita quando nichos tem menos de 2 entradas", () => {
    const result = ContactAnalysisSchema.safeParse({
      problema: "Problema",
      solucao_tipo: "novo_produto",
      solucao_titulo: "Título",
      solucao_descricao: "Descrição",
      nichos: [{ publico: "Apenas um", justificativa: "j" }],
      draft_issues: [{ title: "t", body: "b", labels: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita solucao_tipo inválido", () => {
    const result = ContactAnalysisSchema.safeParse({
      problema: "x",
      solucao_tipo: "indefinido",
      solucao_titulo: "x",
      solucao_descricao: "x",
      nichos: [
        { publico: "A", justificativa: "a" },
        { publico: "B", justificativa: "b" },
      ],
      draft_issues: [{ title: "t", body: "b", labels: [] }],
    });
    expect(result.success).toBe(false);
  });
});
