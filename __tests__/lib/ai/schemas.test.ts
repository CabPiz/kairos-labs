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
      intencao: "compra",
      urgencia: "alta",
      resumo: "Quer assinar agora",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita urgencia inválida", () => {
    const result = ContactAnalysisSchema.safeParse({
      intencao: "suporte",
      urgencia: "urgente",
      resumo: "x",
    });
    expect(result.success).toBe(false);
  });
});
